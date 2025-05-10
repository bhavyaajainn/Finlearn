from .client import db
from datetime import datetime, date
from typing import List, Dict, Any, Optional

def get_user_day_log(user_id: str, day: Optional[str] = None):
    """Get user's reading activity for a specific day.
    
    Args:
        user_id: User identifier
        day: Date string in YYYY-MM-DD format (defaults to today)
        
    Returns:
        Dictionary with topics and tooltips viewed on that day
    """
    # Use today if no date provided
    if not day:
        day = date.today().isoformat()
        
    doc = db.collection("learning_activity").document(user_id).collection("days").document(day).get()
    
    if not doc.exists:
        return {"topics": [], "tooltips": []}
        
    return doc.to_dict() or {"topics": [], "tooltips": []}

def log_topic_read(user_id: str, topic: str, subtopic: Optional[str] = None):
    """Log a topic read by the user.
    
    Args:
        user_id: User identifier
        topic: Topic title or identifier
        subtopic: Optional subtopic
    """
    today = date.today().isoformat()
    ref = db.collection("learning_activity").document(user_id).collection("days").document(today)
    
    # Get existing topics for today
    doc = ref.get()
    data = doc.to_dict() if doc.exists else {}
    topics = data.get("topics", [])
    
    # Add new topic entry with timestamp
    entry = {
        "topic": topic, 
        "subtopic": subtopic,
        "timestamp": datetime.now().isoformat()
    }
    
    # Check if this exact topic is already in the list
    if not any(t.get("topic") == topic and t.get("subtopic") == subtopic for t in topics):
        topics.append(entry)
        
        # Update the document
        ref.set({"topics": topics}, merge=True)

def track_viewed_topic(user_id: str, category: str, topic_id: str):
    """Track that a user has viewed a specific topic.
    
    Args:
        user_id: User identifier
        category: Category of the topic
        topic_id: Unique identifier for the topic
    """
    today = date.today().isoformat()
    ref = db.collection("learning_activity").document(user_id).collection("days").document(today)
    
    # Get existing data for today
    doc = ref.get()
    data = doc.to_dict() if doc.exists else {}
    topics = data.get("topics", [])
    
    # Add new topic entry with timestamp and ID
    entry = {
        "topic_id": topic_id,
        "category": category,
        "timestamp": datetime.now().isoformat()
    }
    
    # Check if this topic ID is already in the list
    if not any(t.get("topic_id") == topic_id for t in topics):
        topics.append(entry)
        
        # Update the document
        ref.set({"topics": topics}, merge=True)

def log_tooltip_viewed(user_id: str, word: str, tooltip: str, from_topic: Optional[str] = None):
    """Log that a user has viewed a tooltip.
    
    Args:
        user_id: User identifier
        word: The financial term or concept
        tooltip: The explanation text
        from_topic: Optional topic context where the tooltip was viewed
    """
    today = date.today().isoformat()
    ref = db.collection("learning_activity").document(user_id).collection("days").document(today)
    
    # Get existing tooltips for today
    doc = ref.get()
    data = doc.to_dict() if doc.exists else {}
    tooltips = data.get("tooltips", [])
    
    # Add new tooltip entry with timestamp
    entry = {
        "word": word,
        "tooltip": tooltip,
        "from_topic": from_topic,
        "timestamp": datetime.now().isoformat()
    }
    
    # Check if this word is already in the list
    if not any(t.get("word") == word for t in tooltips):
        tooltips.append(entry)
        
        # Update the document
        ref.set({"tooltips": tooltips}, merge=True)

def get_user_recent_days(user_id: str, days: int = 7) -> List[str]:
    """Get list of recent days where the user had learning activity.
    
    Args:
        user_id: User identifier
        days: Number of recent days to look for
        
    Returns:
        List of date strings in YYYY-MM-DD format
    """
    days_ref = db.collection("learning_activity").document(user_id).collection("days")
    docs = days_ref.order_by("__name__", direction="DESCENDING").limit(days).get()
    
    return [doc.id for doc in docs]


# Add these new functions

def track_viewed_topic(user_id, category, topic_id):
    """Track that a user has viewed a specific topic.
    
    Args:
        user_id: User identifier
        category: Category of the topic
        topic_id: Unique identifier for the topic
    """
    ref = db.collection("topic_reading_log").document(user_id)
    doc = ref.get()
    existing = doc.to_dict().get("viewed_topics", []) if doc.exists else []

    # Add timestamp for sorting/filtering later
    from datetime import datetime
    entry = {
        "topic_id": topic_id,
        "category": category,
        "viewed_at": datetime.now().isoformat()
    }
    
    # Check if this topic has already been viewed
    if not any(item.get("topic_id") == topic_id for item in existing):
        existing.append(entry)
        ref.set({"viewed_topics": existing}, merge=True)

def get_user_topic_history(user_id):
    """Get a user's topic viewing history.
    
    Args:
        user_id: User identifier
        
    Returns:
        List of topics the user has viewed
    """
    doc = db.collection("topic_reading_log").document(user_id).get()
    return doc.to_dict().get("viewed_topics", []) if doc.exists else []