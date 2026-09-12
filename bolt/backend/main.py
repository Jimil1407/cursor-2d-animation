# backend/main.py
"""PromptMotion API."""

import hashlib
import hmac
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from firebase_admin import auth as firebase_auth
from firebase_admin import db
from pydantic import BaseModel, Field

import config
from code_validator import UnsafeCodeError, validate_scene_code
from firebase_config import firebase_app  # noqa: F401  (initialises the SDK)
from llm_engine import generate_manim_code
from manim_engine import RenderResult, save_and_render
from razorpay_config import (
    RAZORPAY_ENABLED,
    SUBSCRIPTION_PLAN_IDS,
    SUBSCRIPTION_PLANS,
    razorpay_client,
)

logging.basicConfig(level=config.LOG_LEVEL, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("promptmotion")

DEV_USER_ID = "dev-user"

DEV_SCENE_CODE = """from manim import *

class MorphScene(Scene):
    def construct(self):
        circle = Circle(color=BLUE).scale(1.2)
        square = Square(color=GREEN).scale(1.2)
        label = Text('PromptMotion', font_size=36)
        self.play(Create(circle))
        self.play(Transform(circle, square))
        self.play(FadeIn(label.shift(DOWN * 2)))
        self.wait(0.5)
"""

app = FastAPI(title="PromptMotion API", version="1.0.0")

config.MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(config.MEDIA_DIR)), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    # Safe because origins are an explicit allowlist, never "*". Kept enabled so
    # already-deployed clients that send withCredentials keep working.
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# --------------------------------------------------------------------------- #
# Models
# --------------------------------------------------------------------------- #
class PromptInput(BaseModel):
    prompt: str = Field(min_length=3, max_length=2000)


class CodeUpdate(BaseModel):
    code: str = Field(min_length=1, max_length=100_000)


class PlanSelection(BaseModel):
    plan: str


# --------------------------------------------------------------------------- #
# Auth & quota
# --------------------------------------------------------------------------- #
class QuotaExceeded(Exception):
    def __init__(self, usage: int) -> None:
        self.usage = usage


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _today_key() -> str:
    return _utc_now().strftime("%Y-%m-%d")


def get_current_user(request: Request) -> str:
    """Resolve the caller's Firebase UID from the bearer token."""
    if config.DEV_MODE:
        return DEV_USER_ID

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    try:
        return firebase_auth.verify_id_token(auth_header.split(" ", 1)[1])["uid"]
    except Exception:
        # Never echo token-verification internals back to the caller.
        logger.info("Rejected an invalid ID token")
        raise HTTPException(status_code=401, detail="Invalid auth token")


def require_billing() -> None:
    if not RAZORPAY_ENABLED:
        raise HTTPException(status_code=503, detail="Billing is not configured on this server.")


def get_account_type(uid: str) -> str:
    tier = db.reference(f"users/{uid}/accountType").get() or config.DEFAULT_TIER
    return tier if tier in config.ACCOUNT_LIMITS else config.DEFAULT_TIER


def _daily_usage_ref(uid: str):
    return db.reference(f"users/{uid}/dailyUsage/{_today_key()}")


def reserve_quota(uid: str, limit: int) -> int:
    """Atomically claim one generation for today, or raise :class:`QuotaExceeded`."""

    def apply(current: Optional[int]) -> int:
        used = current or 0
        if used >= limit:
            raise QuotaExceeded(used)
        return used + 1

    return _daily_usage_ref(uid).transaction(apply)


def release_quota(uid: str) -> None:
    """Give a reserved generation back after a failed render."""
    try:
        _daily_usage_ref(uid).transaction(lambda current: max(0, (current or 0) - 1))
    except Exception:
        logger.warning("Failed to refund quota for %s", uid, exc_info=True)


def daily_usage(uid: str) -> int:
    return _daily_usage_ref(uid).get() or 0


# --------------------------------------------------------------------------- #
# Health
# --------------------------------------------------------------------------- #
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {"status": "healthy", "timestamp": _utc_now().isoformat(), "dev_mode": config.DEV_MODE}


# --------------------------------------------------------------------------- #
# Generation
# --------------------------------------------------------------------------- #
async def _render(code: str, uid: str, prompt: str, tier: str, file_id: Optional[str] = None) -> RenderResult:
    """Run the blocking render off the event loop."""
    return await run_in_threadpool(save_and_render, code, uid, prompt, file_id, tier)


@app.post("/generate")
async def generate_video(data: PromptInput, uid: str = Depends(get_current_user)) -> Dict[str, Any]:
    tier = config.DEFAULT_TIER if config.DEV_MODE else await run_in_threadpool(get_account_type, uid)
    limit = config.ACCOUNT_LIMITS[tier]

    if config.DEV_MODE:
        usage = 1
    else:
        try:
            usage = await run_in_threadpool(reserve_quota, uid, limit)
        except QuotaExceeded as exc:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "LIMIT_REACHED",
                    "message": f"Daily limit reached ({limit} generations for the {tier} tier).",
                    "usage": exc.usage,
                    "limit": limit,
                    "account_type": tier,
                },
            )

    llm_started = _utc_now()
    try:
        code = DEV_SCENE_CODE if config.DEV_MODE else await run_in_threadpool(generate_manim_code, data.prompt)
    except Exception as exc:
        if not config.DEV_MODE:
            await run_in_threadpool(release_quota, uid)
        logger.exception("Code generation failed")
        raise HTTPException(status_code=502, detail=f"Could not generate animation code: {exc}")
    llm_duration_ms = int((_utc_now() - llm_started).total_seconds() * 1000)

    e2e_started = _utc_now()
    try:
        result = await _render(code, uid, data.prompt, tier)
    except UnsafeCodeError as exc:
        if not config.DEV_MODE:
            await run_in_threadpool(release_quota, uid)
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        if not config.DEV_MODE:
            await run_in_threadpool(release_quota, uid)
        logger.exception("Render pipeline crashed")
        raise HTTPException(status_code=500, detail="Rendering failed. Please try again.")

    if not result.success:
        if not config.DEV_MODE:
            await run_in_threadpool(release_quota, uid)
            usage = max(0, usage - 1)
        raise HTTPException(status_code=500, detail="Rendering failed. Please try a different prompt.")

    e2e_duration_ms = int((_utc_now() - e2e_started).total_seconds() * 1000)
    try:
        db.reference(f"users/{uid}/codes/{result.file_id}").update(
            {"llm_duration_ms": llm_duration_ms, "end_to_end_ms": e2e_duration_ms}
        )
    except Exception:
        logger.warning("Failed to attach timing metrics to %s", result.file_id, exc_info=True)

    return {
        "video_url": result.video_url,
        "scene_file_id": result.file_id,
        "usage": usage,
        "limit": limit,
        "account_type": tier,
    }


def _percentile(sorted_values: List[int], pct: float) -> int:
    if not sorted_values:
        return 0
    position = (len(sorted_values) - 1) * (pct / 100.0)
    low = int(position)
    high = min(low + 1, len(sorted_values) - 1)
    if low == high:
        return sorted_values[low]
    return int(sorted_values[low] + (sorted_values[high] - sorted_values[low]) * (position - low))


@app.get("/metrics")
async def get_metrics(
    uid: str = Depends(get_current_user),
    days: int = Query(7, ge=1, le=90),
) -> Dict[str, Any]:
    """Aggregate render metrics for the caller over the last *days* days."""

    def aggregate() -> Dict[str, Any]:
        now = _utc_now()
        durations: List[int] = []
        total = successes = 0

        for offset in range(days):
            day_key = (now - timedelta(days=offset)).strftime("%Y-%m-%d")
            for entry in (db.reference(f"metrics/renders/{uid}/{day_key}").get() or {}).values():
                if not isinstance(entry, dict):
                    continue
                total += 1
                successes += bool(entry.get("success"))
                duration = entry.get("duration_ms")
                if isinstance(duration, (int, float)):
                    durations.append(int(duration))

        durations.sort()
        return {
            "window_days": days,
            "count": total,
            "success_rate": successes / total if total else 0,
            "avg_ms": int(sum(durations) / len(durations)) if durations else 0,
            "p50_ms": _percentile(durations, 50),
            "p95_ms": _percentile(durations, 95),
        }

    return await run_in_threadpool(aggregate)


# --------------------------------------------------------------------------- #
# Scene code
# --------------------------------------------------------------------------- #
@app.get("/code/{scene_file_id}")
async def get_code(scene_file_id: str, uid: str = Depends(get_current_user)) -> Dict[str, str]:
    record = await run_in_threadpool(db.reference(f"users/{uid}/codes/{scene_file_id}").get)
    if not record or "code" not in record:
        raise HTTPException(status_code=404, detail="Code not found")
    return {"code": record["code"]}


@app.put("/code/{scene_file_id}")
async def update_code(
    scene_file_id: str, update: CodeUpdate, uid: str = Depends(get_current_user)
) -> Dict[str, Any]:
    # The submitted code is executed by the renderer, so screen it before it is
    # ever written to disk.
    try:
        validate_scene_code(update.code)
    except UnsafeCodeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    existing = await run_in_threadpool(db.reference(f"users/{uid}/codes/{scene_file_id}").get)
    if not existing:
        raise HTTPException(status_code=404, detail="Animation not found")

    tier = config.DEFAULT_TIER if config.DEV_MODE else await run_in_threadpool(get_account_type, uid)
    result = await _render(update.code, uid, existing.get("title", ""), tier, scene_file_id)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.error or "Render failed")

    return {"status": "updated", "video_url": result.video_url, "scene_file_id": result.file_id}


@app.get("/my-codes")
async def list_my_codes(uid: str = Depends(get_current_user)) -> Dict[str, List[Dict[str, Any]]]:
    codes = await run_in_threadpool(db.reference(f"users/{uid}/codes").get) or {}
    # Shipping the source of every animation would balloon this payload; the
    # client fetches it on demand from /code/{id}.
    summaries = [
        {
            "scene_file_id": key,
            "title": value.get("title", "Untitled"),
            "timestamp": value.get("timestamp", ""),
            "status": value.get("status", "unknown"),
            "video_url": value.get("video_url", ""),
        }
        for key, value in codes.items()
        if isinstance(value, dict)
    ]
    summaries.sort(key=lambda item: item["timestamp"], reverse=True)
    return {"codes": summaries}


# --------------------------------------------------------------------------- #
# Stats
# --------------------------------------------------------------------------- #
@app.get("/usage-stats")
async def get_usage_stats(uid: str = Depends(get_current_user)) -> Dict[str, Any]:
    def read() -> Dict[str, Any]:
        tier = get_account_type(uid)
        limit = config.ACCOUNT_LIMITS[tier]
        stats = db.reference(f"usage_stats/{uid}").get() or {}
        # remainingAnimations is always derived from the daily counter so it
        # cannot drift out of sync with the quota that /generate enforces.
        return {
            "totalAnimations": stats.get("totalAnimations", 0),
            "totalRenderTime": stats.get("totalRenderTime", 0),
            "averageRenderTime": stats.get("averageRenderTime", 0),
            "remainingAnimations": max(0, limit - daily_usage(uid)),
            "account_type": tier,
            "limit": limit,
            "lastUpdated": stats.get("lastUpdated", _utc_now().isoformat()),
        }

    return await run_in_threadpool(read)


@app.get("/recent-activity")
async def get_recent_activity(uid: str = Depends(get_current_user)) -> List[Dict[str, Any]]:
    codes = await run_in_threadpool(db.reference(f"users/{uid}/codes").get) or {}
    activity = [
        {
            "id": file_id,
            "name": data.get("title", "Untitled"),
            "date": data.get("timestamp", ""),
            "duration": data.get("render_time", 0),
            "status": data.get("status", "completed"),
        }
        for file_id, data in codes.items()
        if isinstance(data, dict)
    ]
    activity.sort(key=lambda item: item["date"], reverse=True)
    return activity[:10]


# --------------------------------------------------------------------------- #
# Billing
# --------------------------------------------------------------------------- #
def _apply_plan(uid: str, plan: str, subscription: Optional[Dict[str, Any]] = None) -> None:
    """Write a plan change and keep the cached usage stats consistent."""
    db.reference(f"users/{uid}").update(
        {
            "accountType": plan,
            "subscription": {
                "status": "active" if plan != config.DEFAULT_TIER else "inactive",
                "plan": plan,
                "subscription_id": (subscription or {}).get("id"),
                "current_period_start": (subscription or {}).get("start_at"),
                "current_period_end": (subscription or {}).get("end_at"),
            },
        }
    )
    limit = config.ACCOUNT_LIMITS.get(plan, config.ACCOUNT_LIMITS[config.DEFAULT_TIER])
    db.reference(f"usage_stats/{uid}").update(
        {
            "account_type": plan,
            "limit": limit,
            "remainingAnimations": max(0, limit - daily_usage(uid)),
        }
    )


@app.post("/api/create-razorpay-order", dependencies=[Depends(require_billing)])
async def create_razorpay_order(
    selection: PlanSelection, uid: str = Depends(get_current_user)
) -> Dict[str, Any]:
    # The UID comes from the verified token, never from the request body —
    # otherwise any caller could open subscriptions against another account.
    plan = selection.plan.lower()
    if plan not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail=f"Unknown plan: {selection.plan}")
    if plan not in SUBSCRIPTION_PLAN_IDS:
        raise HTTPException(status_code=400, detail=f"Plan '{plan}' is not purchasable.")

    def create() -> Dict[str, Any]:
        return razorpay_client.subscription.create(
            {
                "plan_id": SUBSCRIPTION_PLAN_IDS[plan],
                "customer_notify": 1,
                "quantity": 1,
                "total_count": 12,
                "notes": {"uid": uid, "plan": plan},
            }
        )

    try:
        subscription = await run_in_threadpool(create)
    except Exception:
        logger.exception("Razorpay subscription creation failed for %s", uid)
        raise HTTPException(status_code=502, detail="Could not create the subscription. Please try again.")

    return {
        "subscription_id": subscription["id"],
        "key_id": config.RAZORPAY_KEY_ID,
        "amount": SUBSCRIPTION_PLANS[plan]["amount"],
        "currency": "INR",
    }


@app.post("/api/razorpay-webhook")
async def razorpay_webhook(request: Request) -> Dict[str, str]:
    if not config.RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook secret is not configured.")

    payload = await request.body()
    signature = request.headers.get("x-razorpay-signature", "")
    expected = hmac.new(
        config.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"), msg=payload, digestmod=hashlib.sha256
    ).hexdigest()

    # Constant-time comparison; `!=` leaks the signature one byte at a time.
    if not hmac.compare_digest(signature, expected):
        logger.warning("Rejected a Razorpay webhook with a bad signature")
        raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        event = json.loads(payload)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Malformed webhook payload")

    event_type = event.get("event")
    subscription = event.get("payload", {}).get("subscription", {}).get("entity", {})
    notes = subscription.get("notes") or {}
    uid, plan = notes.get("uid"), notes.get("plan")

    if not uid:
        return {"status": "ignored"}

    if event_type == "subscription.activated" and plan in config.ACCOUNT_LIMITS:
        await run_in_threadpool(_apply_plan, uid, plan, subscription)
        logger.info("Activated %s subscription for %s", plan, uid)
    elif event_type == "subscription.charged":
        await run_in_threadpool(
            db.reference(f"users/{uid}/subscription").update,
            {"current_period_end": subscription.get("end_at")},
        )
    elif event_type in {"subscription.cancelled", "subscription.completed", "subscription.halted"}:
        await run_in_threadpool(_apply_plan, uid, config.DEFAULT_TIER, None)
        logger.info("Downgraded %s to free after %s", uid, event_type)

    return {"status": "success"}


@app.post("/api/cancel-subscription", dependencies=[Depends(require_billing)])
async def cancel_subscription(uid: str = Depends(get_current_user)) -> Dict[str, Any]:
    def run() -> Dict[str, Any]:
        user_data = db.reference(f"users/{uid}").get() or {}
        if (user_data.get("accountType") or config.DEFAULT_TIER) == config.DEFAULT_TIER:
            return {"success": True, "message": "Already on the free tier"}

        subscription_id = (user_data.get("subscription") or {}).get("subscription_id")
        if not subscription_id:
            raise HTTPException(status_code=400, detail="No active subscription found. Please contact support.")

        try:
            razorpay_client.subscription.cancel(subscription_id)
        except Exception:
            logger.exception("Razorpay cancellation failed for %s", uid)
            raise HTTPException(status_code=502, detail="Could not cancel the subscription. Please try again.")

        _apply_plan(uid, config.DEFAULT_TIER, None)
        return {"success": True, "message": "Subscription cancelled; you are back on the free tier."}

    return await run_in_threadpool(run)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=config.HOST, port=config.PORT, reload=config.DEV_MODE)

