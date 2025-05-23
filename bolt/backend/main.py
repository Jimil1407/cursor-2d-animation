# backend/main.py
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_engine import generate_manim_code
from manim_engine import save_and_render
from fastapi.staticfiles import StaticFiles
import re


class PromptInput(BaseModel):
    prompt: str

app = FastAPI()
app.mount("/generated_videos", StaticFiles(directory="generated_videos"), name="videos")
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
    video_path = save_and_render(code)
    file_id = re.search(r"scene_(.*?)/", video_path)
    file_id = file_id.group(1) if file_id else "unknown"
    return {"video_path": f"generated_videos/media/videos/scene_{file_id}/1080p60/scene.mp4"}

