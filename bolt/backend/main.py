# backend/main.py
from fastapi import FastAPI, Request, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_engine import generate_manim_code
from manim_engine import save_and_render
from fastapi.staticfiles import StaticFiles
import re
import os
from firebase_admin import db, auth as firebase_auth
from firebase_config import firebase_app

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

@app.post("/generate")
async def generate_video(data: PromptInput, uid: str = Depends(get_current_user)):
    code = generate_manim_code(data.prompt)
    result = save_and_render(code, uid, data.prompt)
    video_url = result["video_url"]
    scene_file_id = result["file_id"]
    return {
        "video_url": video_url,
        "scene_file_id": scene_file_id
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

    # Update code in Firebase and render new video
    result = save_and_render(update.code, uid)
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

