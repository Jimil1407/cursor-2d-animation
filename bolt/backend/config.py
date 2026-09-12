"""Centralised configuration for the PromptMotion backend.

Every tunable lives here so the rest of the codebase never reaches for
``os.getenv`` (or hard-codes a bucket name) on its own.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent


def _bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


DEV_MODE = _bool("DEV_MODE")

# --- Firebase ---------------------------------------------------------------
FIREBASE_DATABASE_URL = os.getenv(
    "FIREBASE_DATABASE_URL", "https://prompmotion-auth-default-rtdb.firebaseio.com/"
)
FIREBASE_STORAGE_BUCKET = os.getenv(
    "FIREBASE_STORAGE_BUCKET", "prompmotion-auth.firebasestorage.app"
)
# Raw JSON is preferred on PaaS hosts where you cannot ship a key file.
FIREBASE_SERVICE_ACCOUNT_JSON = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
SERVICE_ACCOUNT_CANDIDATES = (
    Path(os.getenv("FIREBASE_SERVICE_ACCOUNT_FILE", "")) if os.getenv("FIREBASE_SERVICE_ACCOUNT_FILE") else None,
    BASE_DIR / "serviceAccountKey.json",
    BASE_DIR.parent / "serviceAccountKey.json",
    # Render mounts secret files here for Docker services.
    Path("/etc/secrets/serviceAccountKey.json"),
)

# --- Rendering --------------------------------------------------------------
MEDIA_DIR = BASE_DIR / os.getenv("MEDIA_DIR", "media")
SCENE_DIR = BASE_DIR / os.getenv("SCENE_DIR", "Video_codes")
RENDER_TIMEOUT_SECONDS = _int("RENDER_TIMEOUT_SECONDS", 300)

# Manim quality flag per tier. Previously every render used ``-qk`` (4K/60fps),
# which is ~10x slower than 720p and is not what the Free plan advertises.
QUALITY_BY_TIER = {
    "free": "-qm",  # 720p30
    "plus": "-qh",  # 1080p60
    "pro": "-qk",   # 2160p60
}
DEFAULT_QUALITY_FLAG = QUALITY_BY_TIER["free"]

# --- Quotas -----------------------------------------------------------------
ACCOUNT_LIMITS = {
    "free": _int("LIMIT_FREE", 5),
    "plus": _int("LIMIT_PLUS", 25),
    "pro": _int("LIMIT_PRO", 60),
}
DEFAULT_TIER = "free"

# --- LLM --------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
LLM_TIMEOUT_SECONDS = _int("LLM_TIMEOUT_SECONDS", 45)
LLM_MAX_RETRIES = _int("LLM_MAX_RETRIES", 2)

# --- Razorpay ---------------------------------------------------------------
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
# Razorpay signs webhooks with a dedicated secret configured in the dashboard;
# it is not the API key secret.
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET") or RAZORPAY_KEY_SECRET

# --- HTTP -------------------------------------------------------------------
_default_origins = (
    "https://promptmotion.vercel.app,"
    "http://localhost:3000,"
    "http://localhost:5173,"
    "http://127.0.0.1:5173"
)
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

PORT = _int("PORT", 8000)
HOST = os.getenv("HOST", "0.0.0.0")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
