import os
import razorpay

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

# Validate Razorpay credentials
if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise ValueError("Razorpay credentials not found in environment variables")

print(f"Initializing Razorpay with Key ID: {RAZORPAY_KEY_ID[:5]}...")

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
    "plus": "plan_Qeg2oZBPF9IODB",
    "pro": "plan_Qeg30w1HgpMhhZ",
}

print(f"Debug: Initialized SUBSCRIPTION_PLAN_IDS: {SUBSCRIPTION_PLAN_IDS}")

# Validate plan IDs
try:
    for plan_id in SUBSCRIPTION_PLAN_IDS.values():
        plan = razorpay_client.plan.fetch(plan_id)
        print(f"Successfully validated plan ID: {plan_id}")
except Exception as e:
    print(f"Error validating Razorpay plan IDs: {str(e)}")
    raise ValueError(f"Invalid Razorpay plan ID: {str(e)}") 