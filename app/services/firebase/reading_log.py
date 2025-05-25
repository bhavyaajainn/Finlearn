from .client import db
from datetime import datetime, date,timedelta
from typing import List, Dict, Any, Optional

def log_topic_read(user_id: str, topic: str, subtopic: Optional[str] = None, category: Optional[str] = None) -> None:
    """Log when a user reads a topic.
    
    Args:
        user_id: User identifier
        topic: Primary topic name
        subtopic: Optional subtopic name
        category: Optional financial category
    """
    
    # Create reading log entry
    log_entry = {
        "user_id": user_id,
        "topic": topic,
        "timestamp": datetime.now(),
        "date": datetime.now().date().isoformat()
    }
    
    if subtopic:
        log_entry["subtopic"] = subtopic
        
    if category:
        log_entry["category"] = category
    
    # Add to reading log collection
    db.collection("reading_logs").add(log_entry)
    
    # Update user's daily streak
    update_user_streak(user_id)

def update_user_streak(user_id: str, is_article_view: bool = False) -> None:
    """Update user's daily learning streak.
    
    Args:
        user_id: User identifier
        is_article_view: Whether this update is from an article view
    """
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    # Get user's streak data
    streak_ref = db.collection("user_streaks").document(user_id)
    streak_doc = streak_ref.get()
    
    if streak_doc.exists:
        streak_data = streak_doc.to_dict()
        last_active = datetime.fromisoformat(streak_data.get("last_active")).date()
        current_streak = streak_data.get("current_streak", 0)
        longest_streak = streak_data.get("longest_streak", 0)
        total_articles = streak_data.get("total_articles", 0)
        
        # Check if streak should continue or reset
        if last_active == today:
            # Already logged today, nothing to update for streak
            pass
        elif last_active == yesterday:
            # Continuing the streak
            current_streak += 1
        else:
            # Streak broken, reset to 1
            current_streak = 1
        
        # Update longest streak if needed
        longest_streak = max(longest_streak, current_streak)
        
        # Increment total articles if this is an article view
        if is_article_view:
            total_articles += 1
    else:
        # First time user activity
        current_streak = 1
        longest_streak = 1
        total_articles = 1 if is_article_view else 0
    
    # Update streak data
    streak_ref.set({
        "user_id": user_id,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_articles": total_articles,
        "last_active": today.isoformat(),
        "updated_at": datetime.now()
    }, merge=True)

def get_daily_reading_stats(user_id: str, start_date: date, end_date: date) -> Dict[str, Dict[str, Any]]:
    """Get daily statistics for user's reading activity.
    
    Args:
        user_id: User identifier
        start_date: Start date (inclusive)
        end_date: End date (inclusive)
        
    Returns:
        Dictionary with daily statistics
    """
    # Get reading history
    read_history = get_user_read_history(user_id, start_date, end_date)
    
    # Get tooltip history
    tooltip_history = get_user_tooltip_history(user_id, start_date, end_date)
    
    # Initialize result dictionary
    result = {}
    
    # Process date range
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.isoformat()
        result[date_str] = {
            "articles": 0,
            "tooltips": 0,
            "categories": {}
        }
        current_date += timedelta(days=1)
    
    # Count articles by date
    for article in read_history:
        article_date = article.get("date")
        if article_date in result:
            result[article_date]["articles"] += 1
            
            # Count by category
            category = article.get("category", "uncategorized")
            if category not in result[article_date]["categories"]:
                result[article_date]["categories"][category] = 0
            result[article_date]["categories"][category] += 1
    
    # Count tooltips by date
    for tooltip in tooltip_history:
        tooltip_date = tooltip.get("date")
        if tooltip_date in result:
            result[tooltip_date]["tooltips"] += 1
    
    return result

def get_user_streak_data(user_id: str) -> Dict[str, Any]:
    """Get user's streak data.
    
    Args:
        user_id: User identifier
        
    Returns:
        Dictionary with streak information
    """
    
    # Get user's streak data
    streak_ref = db.collection("user_streaks").document(user_id)
    streak_doc = streak_ref.get()
    
    if streak_doc.exists:
        return streak_doc.to_dict()
    else:
        return {
            "user_id": user_id,
            "current_streak": 0,
            "longest_streak": 0,
            "total_articles": 0,
            "last_active": None
        }

def get_user_topic_history(user_id):
    """Get a user's topic viewing history.
    
    Args:
        user_id: User identifier
        
    Returns:
        List of topics the user has viewed
    """
    doc = db.collection("topic_reading_log").document(user_id).get()
    return doc.to_dict().get("viewed_topics", []) if doc.exists else []

def log_user_activity(
    user_id: str,
    activity_type: str,  # "topic_view" or "tooltip_view"
    topic_id: str = None,
    topic_title: str = None,
    category: str = None,
    word: str = None,
    tooltip: str = None,
    expertise_level: str = None
) -> None:
    """Log user activity in a unified collection."""
    
    # Create common activity entry fields
    activity = {
        "user_id": user_id,
        "activity_type": activity_type,
        "timestamp": datetime.now(),
        "date": datetime.now().date().isoformat()
    }
    
    # Add specific fields based on activity type
    if activity_type == "topic_view":
        activity.update({
            "topic_id": topic_id,
            "topic_title": topic_title,  # Store title, not just ID
            "category": category,
            "expertise_level": expertise_level
        })
    elif activity_type == "tooltip_view":
        activity.update({
            "topic_id": topic_id,  # Associate tooltip with its topic
            "topic_title": topic_title,
            "word": word,
            "tooltip": tooltip
        })
    
    # Add to unified activity collection
    db.collection("user_learning_activity").add(activity)
    
    # Update user's streak
    update_user_streak(user_id)


def track_viewed_topic(user_id: str, category: str, topic_id: str, topic_title: str = None, expertise_level: str = None) -> None:
    """Track that a user viewed a specific topic, avoiding duplicate entries within 24 hours."""
    # Get title if not provided
    if topic_title is None:
        from app.services.firebase.cache import find_topic_by_id
        topic_details = find_topic_by_id(topic_id)
        if topic_details:
            topic_title = topic_details.get("title", "Unknown Topic")
    
    # Check if this topic was viewed in the last 24 hours
    now = datetime.now()
    yesterday = now - timedelta(hours=24)
    yesterday_str = yesterday.isoformat()
    
    # Query for recent views of this topic by this user
    recent_views = db.collection("user_learning_activity") \
        .where("user_id", "==", user_id) \
        .where("topic_id", "==", topic_id) \
        .where("activity_type", "==", "topic_view") \
        .where("timestamp", ">=", yesterday_str) \
        .limit(1) \
        .stream()
    
    # Convert to list to check if any results exist
    recent_views_list = list(recent_views)
    
    is_new_view = False
    
    if not recent_views_list:
        # No recent views found, log a new one
        is_new_view = True
        log_user_activity(
            user_id=user_id,
            activity_type="topic_view",
            topic_id=topic_id,
            topic_title=topic_title,
            category=category,
            expertise_level=expertise_level
        )
    else:
        # Already viewed recently, just update the timestamp
        # Get the document reference
        doc_ref = recent_views_list[0].reference
        # Update only the timestamp
        doc_ref.update({
            "timestamp": now,
            "date": now.date().isoformat()
        })
    
    # Only update streak for new views or first view of the day
    if is_new_view or recent_views_list[0].to_dict().get("date") != now.date().isoformat():
        # Pass True to indicate this is an article view
        update_user_streak(user_id, is_article_view=True)
    from app.services.firebase.cache import update_user_activity_timestamp
    update_user_activity_timestamp(user_id, "article_read")

def log_tooltip_viewed(user_id: str, word: str, tooltip: str, from_topic: str = None, topic_id: str = None) -> None:
    """Log when a user views a tooltip."""
    log_user_activity(
        user_id=user_id,
        activity_type="tooltip_view",
        topic_id=topic_id,
        topic_title=from_topic,
        word=word,
        tooltip=tooltip
    )

def get_user_activity_history(
    user_id: str, 
    start_date: date, 
    end_date: date,
    activity_type: str = None
) -> List[Dict[str, Any]]:
    """Get user's activity history within date range."""
    
    # Convert dates to strings for Firestore query
    start_str = start_date.isoformat()
    end_str = end_date.isoformat()
    
    # Build base query
    query = db.collection("user_learning_activity") \
        .where("user_id", "==", user_id) \
        .where("date", ">=", start_str) \
        .where("date", "<=", end_str)
    
    # Add activity type filter if specified
    if activity_type:
        query = query.where("activity_type", "==", activity_type)
    
    # Execute query
    results = query.stream()
    
    # Convert to list
    history = [doc.to_dict() for doc in results]
    return history

def get_user_read_history(user_id: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
    """Get user's topic reading history."""
    raw_history = get_user_activity_history(user_id, start_date, end_date, "topic_view")
    
    # Deduplicate entries by topic_id (keeping only the most recent view)
    deduplicated = {}
    for entry in raw_history:
        topic_id = entry.get("topic_id")
        if topic_id:
            # If this topic isn't in our results yet or has a more recent timestamp, keep it
            if topic_id not in deduplicated or entry.get("timestamp", "") > deduplicated[topic_id].get("timestamp", ""):
                deduplicated[topic_id] = entry
    
    # Convert back to list, sorted by most recent first
    result = list(deduplicated.values())
    result.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    for entry in result:
        if "user_id" in entry:
            del entry["user_id"]
    return result

def get_user_tooltip_history(user_id: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
    """Get user's tooltip viewing history."""
    return get_user_activity_history(user_id, start_date, end_date, "tooltip_view")