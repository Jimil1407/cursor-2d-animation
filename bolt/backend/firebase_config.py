import firebase_admin
from firebase_admin import credentials

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")
firebase_app = firebase_admin.initialize_app(cred, {
    'storageBucket': 'prompmotion-auth.firebasestorage.app',
    'databaseURL': 'https://prompmotion-auth-default-rtdb.firebaseio.com/'
}) 