import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import storage
import os

def download_service_account_file(bucket_name: str, blob_name: str, destination_path: str):
    """Download the service account file from GCS."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.download_to_filename(destination_path)
    print(f"Downloaded {blob_name} from bucket {bucket_name} to {destination_path}")

def get_firebase_client():
    """Get or initialize the Firebase client."""
    if not hasattr(get_firebase_client, "db"):
        # Ensure the service account file is downloaded
        cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH")
        if not os.path.exists(cred_path):
            bucket_name = "run-sources-stunning-vertex-460610-b7-asia-south1"  # Replace with your GCS bucket name
            blob_name = "secret/service_acount.json"  # Replace with the file name in the bucket
            download_service_account_file(bucket_name, blob_name, cred_path)

        # Initialize Firebase
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        get_firebase_client.db = firestore.client()
    return get_firebase_client.db

# Singleton pattern
db = get_firebase_client()