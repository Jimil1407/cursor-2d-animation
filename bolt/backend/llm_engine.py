"""Gemini-backed generation of Manim scene code."""

import logging
import re
import time
from typing import Optional

import requests

import config
from code_validator import UnsafeCodeError, validate_scene_code

logger = logging.getLogger(__name__)

GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

SYSTEM_PROMPT = (
    "You are a Python expert specialised in Manim Community Edition 2D animations.\n"
    "Given a description, return one complete, well-paced Scene subclass.\n"
    "Rules:\n"
    "- Output ONLY Python code. No prose, no comments, no markdown fences.\n"
    "- Start with `from manim import *`.\n"
    "- Import nothing besides manim, numpy and standard-library maths modules.\n"
    "- Never use file, network, subprocess or os APIs.\n"
    "- Target a 6-10 second runtime using Create, Transform, Write, FadeIn, etc."
)

_FENCE_RE = re.compile(r"^\s*```(?:python|py)?\s*\n(?P<body>.*?)\n?\s*```\s*$", re.DOTALL)

# Reused across requests so TLS handshakes and sockets are pooled.
_session = requests.Session()


def _strip_code_fences(text: str) -> str:
    match = _FENCE_RE.match(text.strip())
    return match.group("body").strip() if match else text.strip()


def _extract_text(payload: dict) -> str:
    try:
        parts = payload["candidates"][0]["content"]["parts"]
    except (KeyError, IndexError) as exc:
        raise ValueError("Unexpected Gemini response shape.") from exc
    return "".join(part.get("text", "") for part in parts)


def generate_manim_code(prompt: str) -> str:
    """Turn a natural-language prompt into validated Manim scene code.

    Blocking; call it from a worker thread, never directly on the event loop.
    """
    if not config.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    url = GEMINI_ENDPOINT.format(model=config.GEMINI_MODEL)
    body = {
        "contents": [{"parts": [{"text": f"{SYSTEM_PROMPT}\n\n{prompt.strip()}"}]}],
        "generationConfig": {"temperature": 0.4},
    }

    last_error: Optional[Exception] = None
    for attempt in range(config.LLM_MAX_RETRIES + 1):
        try:
            response = _session.post(
                url,
                params={"key": config.GEMINI_API_KEY},
                json=body,
                timeout=config.LLM_TIMEOUT_SECONDS,
            )
            response.raise_for_status()
            code = _strip_code_fences(_extract_text(response.json()))
            validate_scene_code(code)
            if "Scene" not in code:
                raise ValueError("Generated code contains no Manim Scene class.")
            return code
        except (requests.RequestException, ValueError, UnsafeCodeError) as exc:
            last_error = exc
            if attempt < config.LLM_MAX_RETRIES:
                backoff = 2**attempt
                logger.warning("Gemini attempt %s failed (%s); retrying in %ss", attempt + 1, exc, backoff)
                time.sleep(backoff)

    raise RuntimeError(
        f"Failed to generate Manim code after {config.LLM_MAX_RETRIES + 1} attempts: {last_error}"
    )
