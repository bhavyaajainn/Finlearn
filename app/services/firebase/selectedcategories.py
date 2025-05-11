"""Firebase service for managing user selected categories.

This module provides functions to interact with user selected categories stored in Firebase.
"""
from typing import List, Dict, Any, Optional
from .client import db


def get_user_selected_categories(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a user's selected categories and expertise level.
    
    Args:
        user_id: The unique identifier for the user
        
    Returns:
        Dictionary containing expertise level and categories, or None if not found
    """
    doc = db.collection("selected_categories").document(user_id).get()
    if doc.exists:
        return doc.to_dict()
    return None


def save_user_selected_categories(user_id: str, expertise_level: str, categories: List[str], description: Optional[str] = None) -> None:
    """Save or update a user's selected categories and expertise level.
    
    Args:
        user_id: The unique identifier for the user
        expertise_level: The user's expertise level (beginner, intermediate, advanced)
        categories: List of categories the user is interested in
        description: Optional description or note
    """
    data = {
        "expertise_level": expertise_level,
        "categories": categories
    }
    
    db.collection("selected_categories").document(user_id).set(data)