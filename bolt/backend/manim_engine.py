import os
import subprocess
import uuid
from firebase_admin import storage, db
from datetime import datetime
from firebase_config import firebase_app
import shutil

OUTPUT_DIR = "Video_codes"

def save_and_render(code: str, uid: str, prompt: str = "", file_id: str = None):
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if file_id is None:
        file_id = str(uuid.uuid4())[:8]
    file_path = f"{OUTPUT_DIR}/scene_{file_id}.py"
    video_folder = f"media/videos/scene_{file_id}/2160p60"

    # Save code to file before running manim
    with open(file_path, "w") as f:
        f.write(code)

    code_ref = db.reference(f'users/{uid}/codes/{file_id}')
    existing = code_ref.get()

    if existing:
        # Preserve original title and timestamp
        title = existing.get('title', "Untitled")
        timestamp = existing.get('timestamp', datetime.now().isoformat())
    else:
        title = " ".join(prompt.strip().split()[:3]) or "Untitled"
        timestamp = datetime.now().isoformat()

    # Store or update code in Firebase Realtime Database under user
    code_ref.set({
        'code': code,
        'timestamp': timestamp,
        'status': 'processing',
        'title': title
    })

    # Run manim render first
    start_time = datetime.now()
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
        return {"video_url": f"Error during rendering: {e.stderr}", "file_id": file_id}

    # After successful render, calculate render time
    end_time = datetime.now()
    render_time = (end_time - start_time).total_seconds() / 60  # in minutes (float)

    # Now check the folder for mp4 files
    try:
        print(video_folder)
        files = os.listdir(video_folder)
        print(files)
        mp4_files = [f for f in files if f.endswith(".mp4")]
        if not mp4_files:
            print("⚠️ No .mp4 files found after rendering.")
            code_ref.update({'status': 'failed', 'error': 'No MP4 files found'})
            return {"video_url": "", "file_id": file_id}
        
        video_file = mp4_files[0]  # take first mp4 found
        video_path = f"{video_folder}/{video_file}"
        
        # Upload video to Firebase Storage under user
        bucket = storage.bucket()
        blob = bucket.blob(f'videos/{uid}/{file_id}/{video_file}')
        
        # Upload the file
        blob.upload_from_filename(video_path)
        print(f"Uploaded video to Firebase Storage: {blob.name}")
        
        # Make the blob publicly accessible
        blob.make_public()
        print(f"Blob public URL: {blob.public_url}")
        
        # Get the public URL
        video_url = blob.public_url
        
        # Update status in database
        code_ref.update({
            'status': 'completed',
            'video_url': video_url,
            'render_time': render_time,
            'title': title,
            'timestamp': timestamp
        })

        # --- USAGE STATS UPDATE ---
        usage_ref = db.reference(f'usage_stats/{uid}')
        stats = usage_ref.get() or {
            'totalAnimations': 0,
            'remainingAnimations': 5,  # Default to free tier limit
            'totalRenderTime': 0,
            'averageRenderTime': 0,
            'lastUpdated': datetime.now().isoformat(),
            'account_type': 'free'
        }
        
        # Update total stats
        stats['totalAnimations'] = stats.get('totalAnimations', 0) + 1
        stats['remainingAnimations'] = max(0, stats.get('remainingAnimations', 5) - 1)
        stats['totalRenderTime'] = stats.get('totalRenderTime', 0) + render_time
        stats['averageRenderTime'] = stats['totalRenderTime'] / stats['totalAnimations']
        stats['lastUpdated'] = datetime.now().isoformat()
        usage_ref.set(stats)
        # --- END USAGE STATS UPDATE ---

        # Clean up local files (delete video file and its parent folder)
        try:
            os.remove(video_path)
            shutil.rmtree(video_folder)
            os.remove(file_path)
        except Exception as e:
            print(f"Warning: Failed to clean up local files: {e}")
        
        return {"video_url": video_url, "file_id": file_id}
        
    except FileNotFoundError:
        print("⚠️ Render folder not found.")
        code_ref.update({'status': 'failed', 'error': 'Render folder not found'})
        return {"video_url": "", "file_id": file_id}