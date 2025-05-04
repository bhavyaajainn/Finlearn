from .client import db

def get_user_day_log(user_id):
    """Get user's reading activity for the day."""
    doc = db.collection("reading_log").document(user_id).get()
    return doc.to_dict().get("topics", []) if doc.exists else []

def log_topic_read(user_id, topic, subtopic=None):
    """Log a topic read by the user."""
    ref = db.collection("reading_log").document(user_id)
    doc = ref.get()
    existing = doc.to_dict().get("topics", []) if doc.exists else []

    entry = {"topic": topic, "subtopic": subtopic or None}
    if entry not in existing:
        existing.append(entry)
        ref.set({"topics": existing}, merge=True)