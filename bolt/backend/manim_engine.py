import os
import subprocess
import uuid

OUTPUT_DIR = "backend/gen_vids"

def save_and_render(code: str) -> str:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())[:8]
    file_path = f"{OUTPUT_DIR}/scene_{file_id}.py"
    video_path = f"{OUTPUT_DIR}/media/videos/scene_{file_id}/1080p60/scene.mp4"

    with open(file_path, "w") as f:
        f.write(code)

    try:
        result = subprocess.run(
            ["manim", file_path, "MorphScene", "-qk"],
            check=True,
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        print("❌ Manim render failed.")
        print("STDOUT:", e.stdout)
        print("STDERR:", e.stderr)
        return f"Error during rendering: {e.stderr}"

    return video_path
