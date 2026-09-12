"""Razorpay client and subscription plan catalogue.

Importing this module never raises: if credentials are absent the client is
``None`` and ``RAZORPAY_ENABLED`` is ``False`` so the rest of the app can run
(useful in dev and in CI).
"""

import logging
from typing import Optional

import razorpay

import config

logger = logging.getLogger(__name__)

# Amounts are in paise (100 paise = ₹1).
SUBSCRIPTION_PLANS = {
    "free": {"amount": 0, "features": ["5 generations per day", "Basic templates", "720p video quality"]},
    "plus": {
        "amount": 50000,
        "features": ["25 generations per day", "All templates", "1080p video quality", "Priority support"],
    },
    "pro": {
        "amount": 120000,
        "features": [
            "60 generations per day",
            "All templates",
            "4K video quality",
            "Priority support",
            "Early access to new features",
        ],
    },
}

SUBSCRIPTION_PLAN_IDS = {
    "plus": "plan_Qeg2oZBPF9IODB",
    "pro": "plan_Qeg30w1HgpMhhZ",
}

SUBSCRIPTION_PERIOD_SECONDS = 30 * 24 * 60 * 60

razorpay_client: Optional[razorpay.Client] = None
RAZORPAY_ENABLED = False

if config.RAZORPAY_KEY_ID and config.RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(config.RAZORPAY_KEY_ID, config.RAZORPAY_KEY_SECRET))
    RAZORPAY_ENABLED = True
    logger.info("Razorpay enabled (key id %s...)", config.RAZORPAY_KEY_ID[:5])
else:
    logger.warning("Razorpay credentials missing; billing endpoints are disabled.")
