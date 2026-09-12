"""Single, idempotent Firebase Admin SDK initialisation.

Import ``firebase_app`` (or call ``get_app()``) from anywhere; the SDK is only
initialised once no matter which module is imported first.
"""

import json
import logging

import firebase_admin
from firebase_admin import credentials

import config

logger = logging.getLogger(__name__)


def _load_credentials() -> credentials.Base:
    if config.FIREBASE_SERVICE_ACCOUNT_JSON:
        return credentials.Certificate(json.loads(config.FIREBASE_SERVICE_ACCOUNT_JSON))

    for candidate in config.SERVICE_ACCOUNT_CANDIDATES:
        if candidate and candidate.is_file():
            logger.info("Using Firebase service account at %s", candidate)
            return credentials.Certificate(str(candidate))

    raise RuntimeError(
        "No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT_JSON or "
        "FIREBASE_SERVICE_ACCOUNT_FILE, or place serviceAccountKey.json next to the backend."
    )


def get_app() -> firebase_admin.App:
    try:
        return firebase_admin.get_app()
    except ValueError:
        return firebase_admin.initialize_app(
            _load_credentials(),
            {
                "databaseURL": config.FIREBASE_DATABASE_URL,
                "storageBucket": config.FIREBASE_STORAGE_BUCKET,
            },
        )


firebase_app = get_app()
