"""Firebase service for managing news items and articles.

This module provides functions to store and retrieve news items and generated articles.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
import json
import uuid
from firebase_admin import firestore
from .client import db

logger = logging.getLogger(__name__)

def store_trending_news(news_items: List[Dict[str, Any]], expertise_level: str) -> None:
    """Store trending news items in Firebase using consistent IDs."""
    try:
        # Generate a consistent document ID for this expertise level
        doc_id = f"trending_news_{expertise_level}"
        doc_ref = db.collection("trending_news_by_level").document(doc_id)
        
        # Prepare the data
        now = datetime.now()
        data = {
            "expertise_level": expertise_level,
            "news_items": news_items,
            "stored_at": now.isoformat(),
            "expires_at": (now + timedelta(days=1)).isoformat()
        }
        
        # Store in Firebase (overwrites existing document)
        doc_ref.set(data)
        
        logger.info(f"Stored trending news for {expertise_level} level")
    except Exception as e:
        logger.error(f"Error storing trending news: {e}")
        raise  # Re-raise to prevent silent failures

def get_trending_news(expertise_level: str) -> List[Dict[str, Any]]:
    """Get trending news items from Firebase using consistent retrieval."""
    try:
        # Use the same document ID pattern as in store_trending_news
        doc_id = f"trending_news_{expertise_level}"
        doc_ref = db.collection("trending_news_by_level").document(doc_id)
        
        # Get the document
        doc = doc_ref.get()
        
        if not doc.exists:
            logger.info(f"No trending news found for {expertise_level} level")
            return []
        
        # Get document data
        data = doc.to_dict()
        
        # Check if expired
        now = datetime.now().isoformat()
        if data.get("expires_at", "") < now:
            logger.info(f"Trending news for {expertise_level} level has expired")
            return []
        
        # Return the news items
        news_items = data.get("news_items", [])
        logger.info(f"Retrieved {len(news_items)} trending news items for {expertise_level} level")
        return news_items
    except Exception as e:
        logger.error(f"Error retrieving trending news: {e}")
        return []

def get_news_item_by_id(news_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific news item by ID from Firebase.
    
    Args:
        news_id: Value of the 'id' field to find
        
    Returns:
        News item document or None if not found
    """
    try:
        # Query for documents where the 'id' FIELD equals news_id
        # NOT looking for a document with this ID
        query = db.collection("trending_news").where("id", "==", news_id).limit(1)
        docs = query.get()
        
        for doc in docs:
            logger.info(f"Found news item with ID field {news_id}")
            return doc.to_dict()
            
        # If not found, log detailed info
        logger.warning(f"News item with ID field {news_id} not found in Firebase")
        
        # Diagnostic: Show what IDs actually exist
        all_docs = db.collection("trending_news").limit(5).get()
        found_ids = [d.to_dict().get('id') for d in all_docs if 'id' in d.to_dict()]
        logger.debug(f"Sample of available ID fields in trending_news: {found_ids}")
        
        return None
    except Exception as e:
        logger.error(f"Error retrieving news item with ID field {news_id}: {e}")
        return None


def store_news_article(
    news_id: str, 
    expertise_level: str, 
    article: Dict[str, Any]
) -> None:
    """Store a generated news article in Firebase.
    
    Args:
        news_id: ID of the news item
        expertise_level: User's expertise level
        article: Generated article content
    """
    try:
        # Create document reference
        doc_ref = db.collection("news_articles").document(f"{news_id}_{expertise_level}")
        
        # Get current timestamp
        now = datetime.now()
        
        # Store the article
        doc_ref.set({
            "news_id": news_id,
            "expertise_level": expertise_level,
            "article": article,
            "generated_at": now.isoformat(),
            "expires_at": (now + timedelta(days=3)).isoformat()
        })
        
        logger.info(f"Stored article for news ID {news_id} at {expertise_level} level")
    except Exception as e:
        logger.error(f"Error storing news article for {news_id}: {e}")

def get_news_article(news_id: str, expertise_level: str) -> Optional[Dict[str, Any]]:
    """Get a generated news article from Firebase.
    
    Args:
        news_id: ID of the news item
        expertise_level: User's expertise level
        
    Returns:
        Generated article or None if not found or expired
    """
    try:
        # Get document by compound ID
        doc_ref = db.collection("news_articles").document(f"{news_id}_{expertise_level}")
        doc = doc_ref.get()
        
        if not doc.exists:
            logger.debug(f"No cached article found for news ID {news_id}")
            return None
            
        data = doc.to_dict()
        
        # Check if expired
        expires_at = data.get("expires_at")
        if expires_at and expires_at < datetime.now().isoformat():
            logger.debug(f"Cached article for news ID {news_id} is expired")
            return None
            
        return data.get("article")
    except Exception as e:
        logger.error(f"Error retrieving news article for {news_id}: {e}")
        return None

def track_article_view(user_id: str, news_id: str) -> None:
    """Track that a user viewed a specific news article.
    
    Args:
        user_id: User identifier
        news_id: ID of the news item
    """
    try:
        # Get current timestamp
        now = datetime.now()
        
        # Create activity entry
        activity = {
            "user_id": user_id,
            "news_id": news_id,
            "viewed_at": now.isoformat(),
            "date": now.date().isoformat(),
            "activity_type": "news_view"
        }
        
        # Add to user activity collection
        db.collection("user_learning_activity").add(activity)

        from app.services.firebase.reading_log import update_user_streak
        update_user_streak(user_id, is_article_view=True)
        
        # Get the news item details for additional tracking
        news_item = get_news_item_by_id(news_id)
        if news_item and news_item.get("topics"):
            # Track each topic in the news as read
            from app.services.firebase.reading_log import log_topic_read
            for topic in news_item.get("topics", []):
                log_topic_read(user_id, topic)
    except Exception as e:
        logger.error(f"Error tracking article view: {e}")


def cleanup_old_trending_news(expertise_level: str) -> None:
    """Remove old news items for a given expertise level before adding new ones."""
    try:
        # Find all documents for this expertise level
        docs = (db.collection("trending_news")
                .where("expertise_level", "==", expertise_level)
                .limit(100)  # Safety limit
                .get())
        
        # Create batch for efficient deletion
        batch = db.batch()
        for doc in docs:
            batch.delete(doc.reference)
            
        # Execute deletion
        batch.commit()
        logger.info(f"Cleaned up old news items for {expertise_level} level")
    except Exception as e:
        logger.error(f"Error cleaning up old news: {e}")