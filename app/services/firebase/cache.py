from functools import lru_cache
from typing import List, Dict, Any, Optional
from firebase_admin import firestore
import time
from datetime import datetime, timedelta
from .client import db
import logging

logger = logging.getLogger(__name__)


def get_cached_topics(category: str, level: str) -> Optional[List[Dict[str, Any]]]:
    """Retrieve cached topics for a category and expertise level.
    
    Args:
        category: Financial category
        level: Expertise level
        
    Returns:
        List of topics if found and not expired, None otherwise
    """
    db = firestore.client()
    doc_ref = db.collection('topic_cache').document(f"{category}_{level}")
    doc = doc_ref.get()
    
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    
    # Check if cache is fresh (less than 1 day old)
    cache_time = data.get('timestamp', 0)
    current_time = time.time()
    
    if current_time - cache_time > 86400:  # 24 hours in seconds
        return None
    
    return data.get('topics')

def cache_topics(category: str, level: str, topics: List[Dict[str, Any]]) -> None:
    """Store topics in cache for future use.
    
    Args:
        category: Financial category
        level: Expertise level
        topics: List of topics to cache
    """
    db = firestore.client()
    doc_ref = db.collection('topic_cache').document(f"{category}_{level}")
    
    doc_ref.set({
        'category': category,
        'level': level,
        'topics': topics,
        'timestamp': time.time()
    })


def get_cache_timestamp(category: str, level: str) -> Optional[datetime]:
    """Get the timestamp when topics were last cached.
    
    Args:
        category: Financial category
        level: Expertise level
        
    Returns:
        Datetime when topics were last cached, or None if no cache exists
    """
    db = firestore.client()
    doc_ref = db.collection('topic_cache').document(f"{category}_{level}")
    doc = doc_ref.get()
    
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    timestamp = data.get('timestamp')
    
    if not timestamp:
        return None
    
    # Convert from Unix timestamp to datetime
    return datetime.fromtimestamp(timestamp)

def should_refresh_topics(category: str, level: str) -> bool:
    """Determine if topics should be refreshed based on various factors.
    
    Args:
        category: Financial category
        level: Expertise level
        
    Returns:
        Boolean indicating whether to refresh topics
    """
    # Get cache timestamp
    cache_time = get_cache_timestamp(category, level)
    
    if not cache_time:
        return True  # No cache exists, should generate
    
    # Always refresh if cache is older than 3 days
    if datetime.now() - cache_time > timedelta(days=1):
        return True
    
    # On weekdays, refresh daily for market-sensitive categories   ## This is a placeholder
    market_sensitive = ["stocks", "cryptocurrency", "forex", "commodities"]
    if category.lower() in market_sensitive:
        if datetime.now().weekday() < 5:  # Monday-Friday
            # For market-sensitive categories on weekdays, refresh if older than 1 day
            return datetime.now() - cache_time > timedelta(days=1)
    
    # For other categories or weekends, refresh if older than 2 days
    return datetime.now() - cache_time > timedelta(days=2)


# Add this new function

def find_topic_by_id(topic_id: str) -> Optional[Dict[str, Any]]:
    """Find a topic by its ID across all category and level caches.
    
    Args:
        topic_id: The topic ID to find
        
    Returns:
        The topic dictionary if found, None otherwise
    """
    db = firestore.client()
    topics_collection = db.collection('topic_cache')
    
    # Get all cached topic documents
    docs = topics_collection.get()
    
    for doc in docs:
        data = doc.to_dict()
        topics = data.get('topics', [])
        
        # Search for topic with matching ID
        for topic in topics:
            if topic.get('topic_id') == topic_id:
                # Make sure to include category and level from the parent document
                if 'category' not in topic and 'category' in data:
                    topic['category'] = data['category']
                
                if 'expertise_level' not in topic and 'level' in data:
                    topic['expertise_level'] = data['level']
                return topic
    
    return None


def get_cached_article(topic_id: str, expertise_level: str) -> Optional[Dict[str, Any]]:
    """Retrieve a cached article from Firebase."""
    try:
        doc_ref = db.collection("article_cache").document(f"{topic_id}_{expertise_level}")
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            # Check if cache is still valid (less than 7 days old)
            cached_time = data.get("cached_at")
            if cached_time:
                cache_date = datetime.fromisoformat(cached_time)
                if datetime.now() - cache_date < timedelta(days=7):
                    return data.get("article")
        
        return None
    except Exception as e:
        logger.error(f"Error getting cached article: {e}")
        return None

def cache_article(topic_id: str, expertise_level: str, article: Dict[str, Any]) -> None:
    """Save an article to the Firebase cache."""
    try:
        doc_ref = db.collection("article_cache").document(f"{topic_id}_{expertise_level}")
        doc_ref.set({
            "article": article,
            "topic_id": topic_id,
            "expertise_level": expertise_level,
            "cached_at": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error caching article: {e}")


MEMORY_CACHE = {}
MEMORY_CACHE_EXPIRY = {}

def get_cached_user_preferences(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user preferences from in-memory cache."""
    cache_key = f"user_pref_{user_id}"
    if cache_key in MEMORY_CACHE:
        if datetime.now() < MEMORY_CACHE_EXPIRY.get(cache_key, datetime.min):
            return MEMORY_CACHE[cache_key]
    return None

def cache_user_preferences(user_id: str, preferences: Dict[str, Any], 
                          expiry_minutes: int = 5) -> None:
    """Store user preferences in memory cache."""
    cache_key = f"user_pref_{user_id}"
    MEMORY_CACHE[cache_key] = preferences
    MEMORY_CACHE_EXPIRY[cache_key] = datetime.now() + timedelta(minutes=expiry_minutes)

def get_cached_topics_fast(category: str, level: str) -> Optional[List[Dict]]:
    """Get topics from in-memory cache first, fall back to database cache."""
    cache_key = f"topics_{category}_{level}"
    
    # Check memory cache first (fastest)
    if cache_key in MEMORY_CACHE:
        if datetime.now() < MEMORY_CACHE_EXPIRY.get(cache_key, datetime.min):
            return MEMORY_CACHE[cache_key]
    
    # Fall back to database cache
    topics = get_cached_topics(category, level)
    
    # Update memory cache for future requests
    if topics:
        MEMORY_CACHE[cache_key] = topics
        MEMORY_CACHE_EXPIRY[cache_key] = datetime.now() + timedelta(minutes=15)
    
    return topics

# Add to existing MEMORY_CACHE implementation
def get_topic_by_id_fast(topic_id: str) -> Optional[Dict[str, Any]]:
    """Get topic from memory cache first, then fallback to database."""
    cache_key = f"topic_{topic_id}"
    
    # Check memory cache first
    if cache_key in MEMORY_CACHE:
        if datetime.now() < MEMORY_CACHE_EXPIRY.get(cache_key, datetime.min):
            return MEMORY_CACHE[cache_key]
    
    # Fall back to database 
    topic = find_topic_by_id(topic_id)
    
    # Cache for future requests if found
    if topic:
        MEMORY_CACHE[cache_key] = topic
        MEMORY_CACHE_EXPIRY[cache_key] = datetime.now() + timedelta(minutes=30)
    
    return topic

def cache_research_article(symbol: str, asset_type: str, expertise_level: str, research: Dict[str, Any]) -> None:
    """Cache a research article for faster retrieval."""
    try:
        cache_key = f"research_{symbol}_{asset_type}_{expertise_level}"
        doc_ref = db.collection("research_cache").document(cache_key)
        doc_ref.set({
            "research": research,
            "symbol": symbol,
            "asset_type": asset_type,
            "expertise_level": expertise_level,
            "cached_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(days=1)).isoformat()
        })
    except Exception as e:
        logger.error(f"Error caching research article: {e}")

def get_cached_research(symbol: str, asset_type: str, expertise_level: str) -> Optional[Dict[str, Any]]:
    """Get cached research article if available and not expired."""
    try:
        cache_key = f"research_{symbol}_{asset_type}_{expertise_level}"
        doc_ref = db.collection("research_cache").document(cache_key)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            # Check if cache is still valid (not expired)
            if data.get("expires_at"):
                expires_at = datetime.fromisoformat(data["expires_at"])
                if datetime.now() < expires_at:
                    return data.get("research")
        
        return None
    except Exception as e:
        logger.error(f"Error retrieving cached research: {e}")
        return None
    


def get_cached_user_summary(
    user_id: str, 
    period: str,
    start_date_str: str,
    end_date_str: str
) -> Optional[Dict[str, Any]]:
    """Get cached summary if available and valid."""
    try:
        cache_key = f"user_summary:{user_id}:{period}:{start_date_str}:{end_date_str}"
        doc = db.collection("user_summary_cache").document(cache_key).get()
        
        if not doc.exists:
            return None
            
        cache_data = doc.to_dict()
        
        # Get user's last activity timestamp
        last_activity_doc = db.collection("user_activity_timestamps").document(user_id).get()
        
        if last_activity_doc.exists:
            last_activity = last_activity_doc.to_dict()
            last_read_at = last_activity.get("last_read_at")
            last_tooltip_at = last_activity.get("last_tooltip_at")
            
            # Determine the most recent activity
            latest_activity = max(
                last_read_at or "1970-01-01T00:00:00",
                last_tooltip_at or "1970-01-01T00:00:00"
            )
            
            # Check if cache is still valid (no new activity since cache was created)
            cache_created_at = cache_data.get("cached_at", "1970-01-01T00:00:00")
            
            if latest_activity > cache_created_at:
                logger.info(f"Cache invalid - new activity since last cache for user {user_id}")
                return None
                
        # Check for general expiration (4 hours)
        cache_timestamp = datetime.fromisoformat(cache_data.get("cached_at"))
        if datetime.now() - cache_timestamp > timedelta(hours=4):
            logger.info(f"Cache expired for user {user_id}")
            return None
            
        return cache_data.get("data")
        
    except Exception as e:
        logger.error(f"Error retrieving cached summary: {e}")
        return None

def cache_user_summary(
    user_id: str,
    period: str,
    start_date_str: str,
    end_date_str: str,
    summary_data: Dict[str, Any]
) -> None:
    """Cache user summary data with metadata."""
    try:
        cache_key = f"user_summary:{user_id}:{period}:{start_date_str}:{end_date_str}"
        now = datetime.now().isoformat()
        
        db.collection("user_summary_cache").document(cache_key).set({
            "user_id": user_id,
            "period": period,
            "start_date": start_date_str,
            "end_date": end_date_str,
            "cached_at": now,
            "expires_at": (datetime.now() + timedelta(hours=4)).isoformat(),
            "data": summary_data
        })
        
        logger.info(f"Cached summary for user {user_id}, period {period}")
    except Exception as e:
        logger.error(f"Error caching user summary: {e}")

def update_user_activity_timestamp(user_id: str, activity_type: str) -> None:
    """Update user's last activity timestamp when they read articles or view tooltips."""
    try:
        now = datetime.now().isoformat()
        
        # Update the timestamp for the specific activity type
        if activity_type in ["article_read", "topic_view"]:
            field = "last_read_at"
        elif activity_type == "tooltip_view":
            field = "last_tooltip_at"
        else:
            field = f"last_{activity_type}_at"
        
        db.collection("user_activity_timestamps").document(user_id).set({
            field: now,
            "updated_at": now
        }, merge=True)
        
    except Exception as e:
        logger.error(f"Error updating activity timestamp: {e}")