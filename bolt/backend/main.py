# backend/main.py
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_engine import generate_manim_code
from manim_engine import save_and_render
from fastapi.staticfiles import StaticFiles
import re
import os
from fastapi import HTTPException
from fastapi.responses import FileResponse
from firebase_admin import db
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

@app.post("/generate")
async def generate_video(data: PromptInput):
    code = generate_manim_code(data.prompt)
    video_url = save_and_render(code)
    
    # Extract scene_file_id from the video URL
    file_id_match = re.search(r"videos/([^/]+)/", video_url)
    scene_file_id = file_id_match.group(1) if file_id_match else "unknown"

    return {
        "video_url": video_url,
        "scene_file_id": scene_file_id
    }

@app.get("/code/{scene_file_id}")
def get_code(scene_file_id: str):
    # Get code from Firebase Realtime Database
    code_ref = db.reference(f'manim_codes/{scene_file_id}')
    code_data = code_ref.get()
    
    if not code_data or 'code' not in code_data:
        raise HTTPException(status_code=404, detail="Code not found")
    
    return {"code": code_data['code']}

class CodeUpdate(BaseModel):
    code: str

@app.put("/code/{scene_file_id}")
def update_code(scene_file_id: str, update: CodeUpdate):
    print(f"Received code for scene {scene_file_id}:")
    print(update.code[:1000])  # Print first 1000 chars for sanity check

    # Update code in Firebase and render new video
    video_url = save_and_render(update.code)
    
    # Extract scene_file_id from the video URL
    file_id_match = re.search(r"videos/([^/]+)/", video_url)
    new_scene_file_id = file_id_match.group(1) if file_id_match else "unknown"

    print(f"Updated code and rendered new video with ID: {new_scene_file_id}")

    return {
        "status": "updated",
        "video_url": video_url,
        "scene_file_id": new_scene_file_id
    }

