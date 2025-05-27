import os
import subprocess
import uuid

OUTPUT_DIR = "Video_codes"

def save_and_render(code: str) -> str:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())[:8]
    file_path = f"{OUTPUT_DIR}/scene_{file_id}.py"
    video_folder = f"media/videos/scene_{file_id}/2160p60"

    # Save code to file before running manim
    with open(file_path, "w") as f:
        f.write(code)

    # Run manim render first
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

    # Now check the folder for mp4 files
    try:
        print(video_folder)
        files = os.listdir(video_folder)
        print(files)
        mp4_files = [f for f in files if f.endswith(".mp4")]
        if not mp4_files:
            print("⚠️ No .mp4 files found after rendering.")
            return ""
        video_file = mp4_files[0]  # take first mp4 found
        video_path = f"/media/videos/scene_{file_id}/2160p60/{video_file}"
    except FileNotFoundError:
        print("⚠️ Render folder not found.")
        return ""

    return video_path