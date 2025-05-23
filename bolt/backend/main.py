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
    video_path = save_and_render(code)
    
    # Extract scene_file_id
    file_id_match = re.search(r"scene_(.*?)/", video_path)
    scene_file_id = file_id_match.group(1) if file_id_match else "unknown"

    return {
        "video_path": video_path,
        "scene_file_id": scene_file_id
    }

@app.get("/code/{scene_file_id}")
def get_code(scene_file_id: str):
    file_path = f"Video_codes/scene_{scene_file_id}.py"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="text/plain")

class CodeUpdate(BaseModel):
    code: str

@app.put("/code/{scene_file_id}")
def update_code(scene_file_id: str, update: CodeUpdate):
    print(f"Received code for scene {scene_file_id}:")
    print(update.code[:1000])  # Print first 1000 chars for sanity check

    file_path = f"Video_codes/scene_{scene_file_id}.py"
    with open(file_path, "w") as f:
        f.write(update.code)
    
    video_path = save_and_render(update.code)
    
    # Extract scene_file_id
    file_id_match = re.search(r"scene_(.*?)/", video_path)
    scene_file_id = file_id_match.group(1) if file_id_match else "unknown"

    print(f"Written to {file_path}")

    # Return any relevant info, e.g. video_path after rendering
    return {"status": "updated", "video_path": video_path}

