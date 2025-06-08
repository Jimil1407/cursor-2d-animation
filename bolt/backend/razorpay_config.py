import os
import razorpay

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Define your plans and prices (in paise, so 10000 = ₹100)
SUBSCRIPTION_PLANS = {
    "free": {"amount": 0, "features": ["5 generations per day", "Basic templates", "720p video quality"]},
    "plus": {"amount": 50000, "features": ["25 generations per day", "All templates", "4K video quality", "Priority support"]},
    "pro": {"amount": 120000, "features": ["60 generations per day", "All templates", "4K video quality", "Priority support", "Early access to new features"]},
}

# Define subscription periods (in seconds)
SUBSCRIPTION_PERIOD = 30 * 24 * 60 * 60  # 30 days in seconds

# Define subscription plan IDs in Razorpay
SUBSCRIPTION_PLAN_IDS = {
    "plus": "plan_Qeg2oZBPF9IODB",  # Replace with your actual Razorpay plan ID
    "pro": "plan_Qeg30w1HgpMhhZ",    # Replace with your actual Razorpay plan ID
} 