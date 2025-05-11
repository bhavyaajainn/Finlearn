"""Selected categories routes.

This module provides endpoints for managing user-selected categories and expertise levels.
"""
from fastapi import APIRouter, Query, HTTPException, Depends

from app.api.models import Categories
from app.services.firebase import get_user_selected_categories, save_user_selected_categories


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
async def get_selected_categories(user_id: str = Depends(validate_user_id)) -> Categories:
    """Retrieve a list of selected categories
    
    Args:
        user_id: User identifier
        
    Returns:
        Selected categories and expertise level
        
    Raises:
        HTTPException: If no categories are found for the user
    """
    categories_data = get_user_selected_categories(user_id)
    
    if not categories_data:
        raise HTTPException(status_code=404, detail=f"No selected categories found for user {user_id}")
    
    try:
        # Validate response data structure before returning
        return Categories(
            expertise_level=categories_data.get("expertise_level", "beginner"),
            categories=categories_data.get("categories", []),
        )
    except Exception as e:
        # Handle malformed data in the database
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing user categories data: {str(e)}"
        )

@router.post("")
async def create_selected_categories(
    categories: Categories, 
    user_id: str = Depends(validate_user_id)
) -> Categories:
    """Create a new category and expertise level list.
    
    Args:
        categories: Categories data to save
        user_id: User identifier
        
    Returns:
        The created categories data
        
    Raises:
        HTTPException: If categories already exist for this user (overwrite protection)
    """
    # Check if user already has categories set to prevent accidental overwrite
    existing_categories = get_user_selected_categories(user_id)
    if existing_categories:
        raise HTTPException(
            status_code=409,
            detail="Categories already exist for this user. Use PUT to update instead."
        )
    
    try:
        save_user_selected_categories(
            user_id=user_id,
            expertise_level=categories.expertise_level,
            categories=categories.categories,
        )
        
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save categories: {str(e)}"
        )

@router.put("")
async def update_selected_categories(
    categories: Categories, 
    user_id: str = Depends(validate_user_id)
) -> Categories:
    """Update category and expertise level list.
    
    Args:
        categories: Updated categories data
        user_id: User identifier
        
    Returns:
        The updated categories data
        
    Raises:
        HTTPException: If no categories exist for this user
    """
    # Check if user has existing categories (to prevent creating via PUT)
    existing_categories = get_user_selected_categories(user_id)
    if not existing_categories:
        raise HTTPException(
            status_code=404,
            detail="No categories found to update. Use POST to create new categories."
        )
    
    try:
        save_user_selected_categories(
            user_id=user_id,
            expertise_level=categories.expertise_level,
            categories=categories.categories,
        )
        
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update categories: {str(e)}"
        )