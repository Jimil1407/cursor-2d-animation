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