"""Render Manim scene code to an MP4 and publish it.

``save_and_render`` is synchronous and CPU/IO heavy — always invoke it from a
worker thread (``fastapi.concurrency.run_in_threadpool``) so it cannot stall the
event loop.
"""

import logging
import re
import shutil
import subprocess
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from firebase_admin import db, storage

import config
from code_validator import validate_scene_code
from firebase_config import firebase_app  # noqa: F401  (ensures the SDK is initialised)

logger = logging.getLogger(__name__)

# Matches e.g. ``class MyScene(Scene):`` or ``class G(MovingCameraScene):``.
_SCENE_CLASS_RE = re.compile(r"^class\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*:", re.MULTILINE)


@dataclass
class RenderResult:
    file_id: str
    video_url: str
    success: bool
    duration_ms: int
    error: Optional[str] = None


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def detect_scene_class(code: str) -> str:
    """Return the name of the first Manim Scene subclass defined in *code*.

    The renderer used to hard-code ``MorphScene``, so every generated scene with
    a different class name failed to render.
    """
    for name, bases in _SCENE_CLASS_RE.findall(code):
        if "Scene" in bases:
            return name
    raise ValueError("No Manim Scene subclass found in the supplied code.")


def _quality_flag(tier: str) -> str:
    return config.QUALITY_BY_TIER.get(tier, config.DEFAULT_QUALITY_FLAG)


def _record_metrics(uid: str, file_id: str, duration_ms: int, success: bool, error: Optional[str], label: str) -> None:
    try:
        now = _utc_now()
        db.reference(f"metrics/renders/{uid}/{now.strftime('%Y-%m-%d')}/{file_id}").set(
            {
                "file_id": file_id,
                "timestamp": now.isoformat(),
                "duration_ms": duration_ms,
                "success": success,
                "error": (error or "")[:2000] or None,
                "prompt_preview": label[:120],
            }
        )
    except Exception:
        logger.warning("Failed to record render metrics for %s", file_id, exc_info=True)


def _record_totals(uid: str, render_minutes: float) -> None:
    """Accumulate lifetime render totals.

    ``remainingAnimations`` is deliberately not touched here: it is derived from
    the daily-usage counter in ``main.py`` so there is a single source of truth.
    """
    try:
        stats_ref = db.reference(f"usage_stats/{uid}")
        stats = stats_ref.get() or {}
        total = (stats.get("totalAnimations") or 0) + 1
        total_time = (stats.get("totalRenderTime") or 0) + render_minutes
        stats_ref.update(
            {
                "totalAnimations": total,
                "totalRenderTime": total_time,
                "averageRenderTime": total_time / total,
                "lastUpdated": _utc_now().isoformat(),
            }
        )
    except Exception:
        logger.warning("Failed to update usage totals for %s", uid, exc_info=True)


def _publish(video_path: Path, uid: str, file_id: str) -> str:
    if config.DEV_MODE:
        return "/media/" + video_path.relative_to(config.MEDIA_DIR).as_posix()

    blob = storage.bucket().blob(f"videos/{uid}/{file_id}/{video_path.name}")
    blob.upload_from_filename(str(video_path), content_type="video/mp4")
    blob.make_public()
    return blob.public_url


def _cleanup(scene_output_dir: Path, scene_file: Path) -> None:
    # Keep artefacts locally in dev so they can be inspected and served.
    if config.DEV_MODE:
        return
    shutil.rmtree(scene_output_dir, ignore_errors=True)
    scene_file.unlink(missing_ok=True)


def save_and_render(
    code: str,
    uid: str,
    prompt: str = "",
    file_id: Optional[str] = None,
    tier: str = config.DEFAULT_TIER,
) -> RenderResult:
    validate_scene_code(code)
    scene_class = detect_scene_class(code)

    file_id = file_id or uuid.uuid4().hex[:8]
    config.SCENE_DIR.mkdir(parents=True, exist_ok=True)
    scene_file = config.SCENE_DIR / f"scene_{file_id}.py"
    scene_file.write_text(code, encoding="utf-8")

    code_ref = db.reference(f"users/{uid}/codes/{file_id}")
    existing = code_ref.get() or {}
    title = existing.get("title") or " ".join(prompt.strip().split()[:3]) or "Untitled"
    timestamp = existing.get("timestamp") or _utc_now().isoformat()
    label = prompt or title

    # ``update`` rather than ``set`` so a re-render does not wipe prior fields.
    code_ref.update({"code": code, "timestamp": timestamp, "status": "processing", "title": title})

    started = _utc_now()
    try:
        subprocess.run(
            [
                "manim",
                "render",
                str(scene_file),
                scene_class,
                _quality_flag(tier),
                "--format",
                "mp4",
                "--media_dir",
                str(config.MEDIA_DIR),
            ],
            check=True,
            capture_output=True,
            text=True,
            timeout=config.RENDER_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        message = f"Render exceeded {config.RENDER_TIMEOUT_SECONDS}s and was aborted."
        return _fail(code_ref, uid, file_id, started, message, label)
    except subprocess.CalledProcessError as exc:
        logger.error("Manim render failed for %s: %s", file_id, exc.stderr)
        return _fail(code_ref, uid, file_id, started, exc.stderr or "Manim render failed.", label)

    duration_ms = int((_utc_now() - started).total_seconds() * 1000)

    scene_output_dir = config.MEDIA_DIR / "videos" / f"scene_{file_id}"
    renders = sorted(scene_output_dir.glob("**/*.mp4"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not renders:
        return _fail(code_ref, uid, file_id, started, "Render produced no MP4 output.", label)

    try:
        video_url = _publish(renders[0], uid, file_id)
    except Exception as exc:
        logger.exception("Failed to publish render %s", file_id)
        return _fail(code_ref, uid, file_id, started, f"Failed to publish video: {exc}", label)

    render_minutes = duration_ms / 60_000
    code_ref.update(
        {
            "status": "completed",
            "video_url": video_url,
            "render_time": render_minutes,
            "scene_class": scene_class,
            "error": None,
        }
    )
    _record_metrics(uid, file_id, duration_ms, True, None, label)
    _record_totals(uid, render_minutes)
    _cleanup(scene_output_dir, scene_file)

    return RenderResult(file_id=file_id, video_url=video_url, success=True, duration_ms=duration_ms)


def _fail(code_ref, uid: str, file_id: str, started: datetime, error: str, label: str) -> RenderResult:
    duration_ms = int((_utc_now() - started).total_seconds() * 1000)
    code_ref.update({"status": "failed", "error": error[:2000]})
    _record_metrics(uid, file_id, duration_ms, False, error, label)
    return RenderResult(file_id=file_id, video_url="", success=False, duration_ms=duration_ms, error=error)
