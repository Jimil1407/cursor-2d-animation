# backend/main.py
from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from llm_engine import generate_manim_code
from manim_engine import save_and_render

class PromptInput(BaseModel):
    prompt: str

app = FastAPI()

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
    return {"video_path": video_path}

