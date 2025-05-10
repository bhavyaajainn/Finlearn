import firebase_admin
from firebase_admin import credentials, firestore
import os

def get_firebase_client():
    """Get or initialize the Firebase client."""
    if not hasattr(get_firebase_client, "db"):
        # Use environment variables
        cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        get_firebase_client.db = firestore.client()
    return get_firebase_client.db

# Singleton pattern
db = get_firebase_client()