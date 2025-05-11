"""Firebase service for managing user selected topics.

This module provides functions to interact with user selected topics stored in Firebase.
"""
from typing import List, Dict, Any, Optional
from .client import db


def get_user_selected_topics(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a user's selected topics and expertise level.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        Dictionary containing expertise level and topics, or None if not found
    """
    doc = db.collection("selected_topics").document(user_id).get()
    if doc.exists:
        return doc.to_dict()
    return None


def save_user_selected_topics(user_id: str, expertise_level: str, topics: List[str], description: Optional[str] = None) -> None:
    """Save or update a user's selected topics and expertise level.
    
    Args:
        user_id: The unique identifier for the user
        expertise_level: The user's expertise level (beginner, intermediate, advanced)
        topics: List of topics the user is interested in
        description: Optional description or note
    """
    data = {
        "expertise_level": expertise_level,
        "topics": topics
    }
    
    db.collection("selected_topics").document(user_id).set(data)