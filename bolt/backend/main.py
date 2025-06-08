# backend/main.py
from fastapi import FastAPI, Request, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_engine import generate_manim_code
from manim_engine import save_and_render
from fastapi.staticfiles import StaticFiles
import re
import os
from firebase_admin import db, auth as firebase_auth, credentials
import firebase_admin
from datetime import datetime
from typing import Optional
import razorpay
from razorpay_config import razorpay_client, SUBSCRIPTION_PLANS, SUBSCRIPTION_PLAN_IDS
from dotenv import load_dotenv
import hmac
import hashlib
import json

load_dotenv()

# Initialize Firebase with Realtime Database (only once)
if not firebase_admin._apps:
    cred = credentials.Certificate("../serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://prompmotion-auth-default-rtdb.firebaseio.com/'
    })

class PromptInput(BaseModel):
    prompt: str

app = FastAPI()
app.mount("/media", StaticFiles(directory="media"), name="media")

# Add debugging middleware
@app.middleware("http")
async def debug_middleware(request: Request, call_next):
    print(f"Request headers: {request.headers}")
    response = await call_next(request)
    print(f"Response headers: {response.headers}")
    return response

# Configure CORS
origins = [
    "https://promptmotion.vercel.app",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:5173",  # Add Vite development server
    "http://127.0.0.1:5173"   # Add Vite development server alternative
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

def get_current_user(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid auth header")
    id_token = auth_header.split(' ')[1]
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token['uid']
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid auth token")

ACCOUNT_LIMITS = {
    'free': 5,
    'plus': 25,
    'pro': 60,
}

def can_generate(uid, account_type):
    today = datetime.now().strftime('%Y-%m-%d')
    usage_ref = db.reference(f'users/{uid}/dailyUsage/{today}')
    usage = usage_ref.get() or 0
    limit = ACCOUNT_LIMITS.get(account_type, 5)
    if usage >= limit:
        return False, usage, limit
    usage_ref.set(usage + 1)
    return True, usage + 1, limit

@app.post("/generate")
async def generate_video(data: PromptInput, uid: str = Depends(get_current_user)):
    # Get account type
    account_type = db.reference(f'users/{uid}/accountType').get() or 'free'
    allowed, usage, limit = can_generate(uid, account_type)
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "LIMIT_REACHED",
                "message": f"Daily limit reached ({limit} generations for {account_type} tier).",
                "usage": usage,
                "limit": limit,
                "account_type": account_type
            }
        )
    code = generate_manim_code(data.prompt)
    result = save_and_render(code, uid, data.prompt)
    video_url = result["video_url"]
    scene_file_id = result["file_id"]
    return {
        "video_url": video_url,
        "scene_file_id": scene_file_id,
        "usage": usage,
        "limit": limit,
        "account_type": account_type
    }

@app.get("/code/{scene_file_id}")
def get_code(scene_file_id: str, uid: str = Depends(get_current_user)):
    # Get code from Firebase Realtime Database
    code_ref = db.reference(f'users/{uid}/codes/{scene_file_id}')
    code_data = code_ref.get()
    
    if not code_data or 'code' not in code_data:
        raise HTTPException(status_code=404, detail="Code not found")
    
    return {"code": code_data['code']}

class CodeUpdate(BaseModel):
    code: str

@app.put("/code/{scene_file_id}")
def update_code(scene_file_id: str, update: CodeUpdate, uid: str = Depends(get_current_user)):
    print(f"Received code for scene {scene_file_id}:")
    print(update.code[:1000])  # Print first 1000 chars for sanity check

    # Update code in Firebase and render new video in place
    result = save_and_render(update.code, uid, "", scene_file_id)
    video_url = result["video_url"]
    new_scene_file_id = result["file_id"]

    print(f"Updated code and rendered new video with ID: {new_scene_file_id}")

    return {
        "status": "updated",
        "video_url": video_url,
        "scene_file_id": new_scene_file_id
    }

@app.get("/my-codes")
def list_my_codes(uid: str = Depends(get_current_user)):
    # List all codes for the current user
    codes_ref = db.reference(f'users/{uid}/codes')
    codes_data = codes_ref.get()
    if not codes_data:
        return {"codes": []}
    # Return a list of code entries with their scene_file_id
    return {"codes": [
        {"scene_file_id": k, **v} for k, v in codes_data.items()
    ]}

# --- USAGE STATS ENDPOINTS ---
def reset_daily_limits(uid: str, account_type: str):
    """Reset daily usage limits for a user"""
    today = datetime.now().strftime('%Y-%m-%d')
    usage_ref = db.reference(f'users/{uid}/dailyUsage/{today}')
    current_usage = usage_ref.get() or 0
    
    # Get the limit based on account type
    limit = ACCOUNT_LIMITS.get(account_type, 5)
    
    # Update usage stats with remaining animations
    stats_ref = db.reference(f'usage_stats/{uid}')
    stats = stats_ref.get() or {
        'totalAnimations': 0,
        'remainingAnimations': limit,
        'totalRenderTime': 0,
        'averageRenderTime': 0,
        'lastUpdated': datetime.now().isoformat(),
        'account_type': account_type
    }
    
    # Calculate remaining animations
    remaining = max(0, limit - current_usage)
    stats['remainingAnimations'] = remaining
    stats['lastUpdated'] = datetime.now().isoformat()
    stats_ref.set(stats)
    
    return remaining

@app.get("/usage-stats")
async def get_usage_stats(request: Request):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No token provided")
        id_token = auth_header.split("Bearer ")[1]
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token["uid"]

        # Get user's account type
        user_ref = db.reference(f'users/{uid}')
        user_data = user_ref.get() or {}
        account_type = user_data.get('accountType', 'free')
        
        # Reset daily limits and get updated stats
        remaining = reset_daily_limits(uid, account_type)
        
        # Get the limit based on account type
        limit = ACCOUNT_LIMITS.get(account_type, 5)

        ref = db.reference(f'usage_stats/{uid}')
        stats = ref.get()
        if not stats:
            stats = {
                'totalAnimations': 0,
                'remainingAnimations': remaining,
                'totalRenderTime': 0,
                'averageRenderTime': 0,
                'lastUpdated': datetime.now().isoformat(),
                'account_type': account_type,
                'limit': limit
            }
            ref.set(stats)
        else:
            # Update remaining animations and account type
            stats['remainingAnimations'] = remaining
            stats['account_type'] = account_type
            stats['limit'] = limit
            ref.update(stats)

        return stats
    except Exception as e:
        print(f"Error getting usage stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recent-activity")
async def get_recent_activity(request: Request):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No token provided")
        id_token = auth_header.split("Bearer ")[1]
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        # Fetch from codes instead of animations
        ref = db.reference(f'users/{uid}/codes')
        codes = ref.get()
        if not codes:
            return []
        activity_list = []
        for file_id, code_data in codes.items():
            activity_list.append({
                'id': file_id,
                'name': code_data.get('title', 'Untitled'),
                'date': code_data.get('timestamp', ''),
                'duration': code_data.get('render_time', '0'),
                'status': code_data.get('status', 'completed')
            })
        activity_list.sort(key=lambda x: x['date'], reverse=True)
        return activity_list[:10]
    except Exception as e:
        print(f"Error getting recent activity: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Note: save_and_render should be updated in manim_engine.py to update usage stats as in the app/main.py version.

async def verify_token(request: Request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Invalid authorization header')
    
    token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail='Invalid token')

@app.post("/api/create-razorpay-order")
async def create_razorpay_order(request: Request):
    try:
        print("Debug: Starting create_razorpay_order")
        print(f"Debug: SUBSCRIPTION_PLAN_IDS available: {SUBSCRIPTION_PLAN_IDS}")
        print(f"Debug: SUBSCRIPTION_PLANS available: {SUBSCRIPTION_PLANS}")
        
        data = await request.json()
        plan = data.get("plan")
        uid = data.get("uid")
        
        print(f"Creating Razorpay order for plan: {plan}, uid: {uid}")
        
        if not plan or not uid:
            print(f"Missing required fields. Plan: {plan}, UID: {uid}")
            raise HTTPException(status_code=400, detail="Missing required fields: plan and uid")
        
        if plan not in SUBSCRIPTION_PLANS:
            print(f"Invalid plan: {plan}")
            raise HTTPException(status_code=400, detail=f"Invalid plan: {plan}")
        
        if plan == "free":
            print("Cannot create subscription for free plan")
            raise HTTPException(status_code=400, detail="Cannot create subscription for free plan")
        
        if plan not in SUBSCRIPTION_PLAN_IDS:
            print(f"No plan ID found for plan: {plan}")
            raise HTTPException(status_code=400, detail=f"No plan ID found for plan: {plan}")
        
        try:
            print(f"Using plan ID: {SUBSCRIPTION_PLAN_IDS[plan]}")
            # Create a subscription
            subscription = razorpay_client.subscription.create({
                "plan_id": SUBSCRIPTION_PLAN_IDS[plan],
                "customer_notify": 1,
                "quantity": 1,
                "total_count": 12,  # 12 months subscription
                "notes": {
                    "uid": uid,
                    "plan": plan
                }
            })
            
            print(f"Subscription created successfully: {subscription}")
            
            return {
                "subscription_id": subscription["id"],
                "key_id": os.getenv("RAZORPAY_KEY_ID"),
                "amount": SUBSCRIPTION_PLANS[plan]["amount"],
                "currency": "INR"
            }
        except razorpay.errors.BadRequestError as e:
            print(f"Razorpay BadRequestError: {str(e)}")
            if hasattr(e, 'error'):
                print(f"Razorpay error details: {e.error}")
            raise HTTPException(status_code=400, detail=f"Invalid request to Razorpay: {str(e)}")
        except razorpay.errors.ServerError as e:
            print(f"Razorpay ServerError: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Razorpay server error: {str(e)}")
        except Exception as e:
            print(f"Unexpected error creating subscription: {str(e)}")
            print(f"Error type: {type(e)}")
            if hasattr(e, 'error'):
                print(f"Razorpay error details: {e.error}")
            raise HTTPException(status_code=500, detail=f"Failed to create subscription: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in create-razorpay-order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/razorpay-webhook")
async def razorpay_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("x-razorpay-signature")
    secret = os.getenv("RAZORPAY_KEY_SECRET")
    
    # Verify signature
    generated_signature = hmac.new(
        bytes(secret, 'utf-8'),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    if signature != generated_signature:
        print("Invalid Razorpay webhook signature")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event = json.loads(payload)
    event_type = event.get('event')
    
    if event_type == 'subscription.activated':
        subscription = event['payload']['subscription']['entity']
        notes = subscription.get('notes', {})
        uid = notes.get('uid')
        plan = notes.get('plan')
        
        if uid and plan:
            # Update user's subscription in Firebase
            user_ref = db.reference(f'users/{uid}')
            user_ref.update({
                'accountType': plan,
                'subscription': {
                    'status': 'active',
                    'plan': plan,
                    'subscription_id': subscription['id'],
                    'current_period_start': subscription['start_at'],
                    'current_period_end': subscription['end_at'],
                }
            })
            print(f"Activated {plan} subscription for user {uid}")
            # Update usage_stats for the new plan
            limit = ACCOUNT_LIMITS.get(plan, 5)
            usage_stats_ref = db.reference(f'usage_stats/{uid}')
            usage_stats = usage_stats_ref.get() or {}
            usage_stats['account_type'] = plan
            usage_stats['limit'] = limit
            usage_stats['remainingAnimations'] = max(0, limit - (db.reference(f"users/{uid}/dailyUsage/{datetime.now().strftime('%Y-%m-%d')}").get() or 0))
            usage_stats_ref.set(usage_stats)
    
    elif event_type == 'subscription.charged':
        # Handle successful payment for subscription renewal
        payment = event['payload']['payment']['entity']
        subscription = event['payload']['subscription']['entity']
        notes = subscription.get('notes', {})
        uid = notes.get('uid')
        plan = notes.get('plan')
        
        if uid and plan:
            # Update subscription end date
            user_ref = db.reference(f'users/{uid}')
            user_ref.update({
                'subscription.current_period_end': subscription['end_at']
            })
            print(f"Renewed {plan} subscription for user {uid}")
    
    elif event_type == 'subscription.cancelled':
        subscription = event['payload']['subscription']['entity']
        notes = subscription.get('notes', {})
        uid = notes.get('uid')
        
        if uid:
            # Downgrade to free plan
            user_ref = db.reference(f'users/{uid}')
            user_ref.update({
                'accountType': 'free',
                'subscription': {
                    'status': 'inactive',
                    'plan': 'free',
                    'subscription_id': None,
                    'current_period_start': None,
                    'current_period_end': None,
                }
            })
            # Update usage_stats for free plan
            limit = ACCOUNT_LIMITS.get('free', 5)
            usage_stats_ref = db.reference(f'usage_stats/{uid}')
            usage_stats = usage_stats_ref.get() or {}
            usage_stats['account_type'] = 'free'
            usage_stats['limit'] = limit
            usage_stats['remainingAnimations'] = max(0, limit - (db.reference(f"users/{uid}/dailyUsage/{datetime.now().strftime('%Y-%m-%d')}").get() or 0))
            usage_stats_ref.set(usage_stats)
            print(f"Cancelled subscription for user {uid}")
    
    return {"status": "success"}

@app.post("/api/cancel-subscription")
async def cancel_subscription(request: Request):
    data = await request.json()
    uid = data.get("uid")
    if not uid:
        raise HTTPException(status_code=400, detail="Missing uid")
    
    try:
        # Get user's subscription data from Firebase
        user_ref = db.reference(f'users/{uid}')
        user_data = user_ref.get()
        current_plan = user_data.get('accountType', 'free')
        
        if current_plan == 'free':
            # For free tier, just return success
            return {"success": True, "message": "Already on free tier"}
        
        # Get subscription ID
        subscription_id = user_data.get('subscription', {}).get('subscription_id')
        
        if not subscription_id:
            raise HTTPException(status_code=400, detail="No active subscription found. Please contact support.")
        
        # Cancel the subscription in Razorpay
        try:
            razorpay_client.subscription.cancel(subscription_id)
        except Exception as e:
            print(f"Error cancelling Razorpay subscription: {str(e)}")
            raise HTTPException(status_code=400, detail="Failed to cancel subscription in Razorpay. Please try again or contact support.")
        
        # Only update Firebase if Razorpay cancellation was successful
        user_ref.update({
            'accountType': 'free',
            'subscription': {
                'status': 'inactive',
                'plan': 'free',
                'subscription_id': None,
                'current_period_start': None,
                'current_period_end': None,
            }
        })
        
        # Update usage_stats for free plan
        limit = ACCOUNT_LIMITS.get('free', 5)
        usage_stats_ref = db.reference(f'usage_stats/{uid}')
        usage_stats = usage_stats_ref.get() or {}
        usage_stats['account_type'] = 'free'
        usage_stats['limit'] = limit
        usage_stats['remainingAnimations'] = max(0, limit - (db.reference(f"users/{uid}/dailyUsage/{datetime.now().strftime('%Y-%m-%d')}").get() or 0))
        usage_stats_ref.set(usage_stats)
        
        return {"success": True, "message": "Successfully cancelled subscription and downgraded to free tier"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in cancel_subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process subscription cancellation. Please try again or contact support.")

