import os
import subprocess
import uuid
from firebase_admin import storage, db
from datetime import datetime
from firebase_config import firebase_app

OUTPUT_DIR = "Video_codes"

def save_and_render(code: str) -> str:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())[:8]
    file_path = f"{OUTPUT_DIR}/scene_{file_id}.py"
    video_folder = f"media/videos/scene_{file_id}/2160p60"

    # Save code to file before running manim
    with open(file_path, "w") as f:
        f.write(code)

    # Store code in Firebase Realtime Database
    code_ref = db.reference(f'manim_codes/{file_id}')
    code_ref.set({
        'code': code,
        'timestamp': datetime.now().isoformat(),
        'status': 'processing'
    })

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
        code_ref.update({'status': 'failed', 'error': e.stderr})
        return f"Error during rendering: {e.stderr}"

    # Now check the folder for mp4 files
    try:
        print(video_folder)
        files = os.listdir(video_folder)
        print(files)
        mp4_files = [f for f in files if f.endswith(".mp4")]
        if not mp4_files:
            print("⚠️ No .mp4 files found after rendering.")
            code_ref.update({'status': 'failed', 'error': 'No MP4 files found'})
            return ""
        
        video_file = mp4_files[0]  # take first mp4 found
        video_path = f"{video_folder}/{video_file}"
        
        # Upload video to Firebase Storage
        bucket = storage.bucket()
        blob = bucket.blob(f'videos/{file_id}/{video_file}')
        
        # Upload the file
        blob.upload_from_filename(video_path)
        
        # Make the blob publicly accessible
        blob.make_public()
        
        # Get the public URL
        video_url = blob.public_url
        
        # Update status in database
        code_ref.update({
            'status': 'completed',
            'video_url': video_url
        })
        
        # Clean up local files
        try:
            os.remove(video_path)
            os.rmdir(video_folder)
            os.remove(file_path)
            os.rmdir(OUTPUT_DIR)
        except Exception as e:
            print(f"Warning: Failed to clean up local files: {e}")
        
        return video_url
        
    except FileNotFoundError:
        print("⚠️ Render folder not found.")
        code_ref.update({'status': 'failed', 'error': 'Render folder not found'})
        return ""