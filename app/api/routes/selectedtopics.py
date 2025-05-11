"""Selected topics routes.

This module provides endpoints for managing user-selected topics and expertise levels.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

from app.services.firebase import get_user_selected_topics, save_user_selected_topics

# Define the model for topic data based on the OpenAPI spec
class Topics(BaseModel):
    expertise_level: str
    topics: List[str]

router = APIRouter()

@router.get("")
async def get_selected_topics(user_id: str = Query(...)) -> Topics:
    """Retrieve a list of selected topics.
    
    Args:
        user_id: User identifier
        
    Returns:
        Selected topics and expertise level
        
    Raises:
        HTTPException: If no topics are found for the user
    """
    topics_data = get_user_selected_topics(user_id)
    
    if not topics_data:
        raise HTTPException(status_code=404, detail=f"No selected topics found for user {user_id}")
    
    return Topics(
        expertise_level=topics_data.get("expertise_level", "beginner"),
        topics=topics_data.get("topics", []),
    )

@router.post("")
async def create_selected_topics(topics: Topics, user_id: str = Query(...)) -> Topics:
    """Create a new topic and expertise level list.
    
    Args:
        topics: Topic data to save
        user_id: User identifier
        
    Returns:
        The created topic data
    """
    save_user_selected_topics(
        user_id=user_id,
        expertise_level=topics.expertise_level,
        topics=topics.topics,
    )
    
    return topics

@router.put("")
async def update_selected_topics(topics: Topics, user_id: str = Query(...)) -> Topics:
    """Update topic and expertise level list.
    
    Args:
        topics: Updated topic data
        user_id: User identifier
        
    Returns:
        The updated topic data
    """
    save_user_selected_topics(
        user_id=user_id,
        expertise_level=topics.expertise_level,
        topics=topics.topics,

    )
    
    return topics