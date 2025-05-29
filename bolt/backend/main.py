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
import stripe

# Initialize Firebase with Realtime Database (only once)
if not firebase_admin._apps:
    cred = credentials.Certificate("../serviceAccountKey.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://prompmotion-auth-default-rtdb.firebaseio.com/'
    })

stripe.api_key = "sk_test_your_secret_key"  # Replace with your Stripe secret key

class PromptInput(BaseModel):
    prompt: str

app = FastAPI()
app.mount("/media", StaticFiles(directory="media"), name="media")
# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        raise HTTPException(status_code=403, detail=f"Daily limit reached ({limit} generations for {account_type} tier). Upgrade your plan to generate more.")
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
@app.get("/usage-stats")
async def get_usage_stats(request: Request):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="No token provided")
        id_token = auth_header.split("Bearer ")[1]
        decoded_token = firebase_auth.verify_id_token(id_token)
        uid = decoded_token["uid"]
        ref = db.reference(f'usage_stats/{uid}')
        stats = ref.get()
        if not stats:
            stats = {
                'totalAnimations': 0,
                'remainingAnimations': 20,
                'totalRenderTime': 0,
                'averageRenderTime': 0,
                'lastUpdated': datetime.now().isoformat()
            }
            ref.set(stats)
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

STRIPE_PRICE_IDS = {
    "plus": "price_PLUS_ID",  # Replace with your Plus plan price ID
    "pro": "price_PRO_ID",   # Replace with your Pro plan price ID
}

@app.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    data = await request.json()
    plan = data.get("plan")
    uid = data.get("uid")
    if plan not in STRIPE_PRICE_IDS:
        raise HTTPException(status_code=400, detail="Invalid plan")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": STRIPE_PRICE_IDS[plan],
                "quantity": 1,
            }],
            mode="subscription",
            success_url="https://yourdomain.com/billing?success=true",
            cancel_url="https://yourdomain.com/billing?canceled=true",
            metadata={"uid": uid, "plan": plan}
        )
        return {"url": session.url}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Stripe error")

@app.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    event = None
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, "your_webhook_secret"
        )
    except Exception as e:
        print(e)
        return {"status": "error"}
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        uid = session["metadata"]["uid"]
        plan = session["metadata"]["plan"]
        db.reference(f'users/{uid}/accountType').set(plan)
    return {"status": "success"}

