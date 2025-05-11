"""Selected topics routes.

This module provides endpoints for managing user-selected topics and expertise levels.
"""
from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field, validator, constr
from enum import Enum

from app.services.firebase import get_user_selected_topics, save_user_selected_topics

# Define expertise level enum for validation
class ExpertiseLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

# Define the model for topic data with proper validation
class Topics(BaseModel):
    expertise_level: ExpertiseLevel
    topics: List[constr(min_length=1, max_length=100)] = Field(..., min_items=1, max_items=50)
    
    @validator('topics')
    def validate_topics(cls, topics):
        """Ensure topics are valid and not empty."""
        if not topics:
            raise ValueError("At least one topic must be selected")
        
        # Validate each topic content
        for topic in topics:
            # Check for empty strings after stripping whitespace
            if not topic.strip():
                raise ValueError("Topics cannot be empty strings")
                
        return topics
    
    class Config:
        # Example for documentation
        schema_extra = {
            "example": {
                "expertise_level": "intermediate",
                "topics": ["ETFs", "Value Investing", "Tax-Efficient Investing"],
            }
        }

router = APIRouter()

# Dependency for validating user_id
def validate_user_id(user_id: str = Query(..., min_length=3, max_length=64, regex="^[a-zA-Z0-9_-]+$")):
    """Validate user ID format and length.
    
    Args:
        user_id: User identifier
        
    Returns:
        Validated user_id
        
    Raises:
        HTTPException: If user_id is invalid
    """
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    return user_id

@router.get("")
async def get_selected_topics(user_id: str = Depends(validate_user_id)) -> Topics:
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
    
    try:
        # Validate response data structure before returning
        return Topics(
            expertise_level=topics_data.get("expertise_level", "beginner"),
            topics=topics_data.get("topics", []),
        )
    except Exception as e:
        # Handle malformed data in the database
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing user topics data: {str(e)}"
        )

@router.post("")
async def create_selected_topics(
    topics: Topics, 
    user_id: str = Depends(validate_user_id)
) -> Topics:
    """Create a new topic and expertise level list.
    
    Args:
        topics: Topic data to save
        user_id: User identifier
        
    Returns:
        The created topic data
        
    Raises:
        HTTPException: If topics already exist for this user (overwrite protection)
    """
    # Check if user already has topics set to prevent accidental overwrite
    existing_topics = get_user_selected_topics(user_id)
    if existing_topics:
        raise HTTPException(
            status_code=409,
            detail="Topics already exist for this user. Use PUT to update instead."
        )
    
    try:
        save_user_selected_topics(
            user_id=user_id,
            expertise_level=topics.expertise_level,
            topics=topics.topics,
        )
        
        return topics
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save topics: {str(e)}"
        )

@router.put("")
async def update_selected_topics(
    topics: Topics, 
    user_id: str = Depends(validate_user_id)
) -> Topics:
    """Update topic and expertise level list.
    
    Args:
        topics: Updated topic data
        user_id: User identifier
        
    Returns:
        The updated topic data
        
    Raises:
        HTTPException: If no topics exist for this user
    """
    # Check if user has existing topics (to prevent creating via PUT)
    existing_topics = get_user_selected_topics(user_id)
    if not existing_topics:
        raise HTTPException(
            status_code=404,
            detail="No topics found to update. Use POST to create new topics."
        )
    
    try:
        save_user_selected_topics(
            user_id=user_id,
            expertise_level=topics.expertise_level,
            topics=topics.topics,
        )
        
        return topics
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update topics: {str(e)}"
        )