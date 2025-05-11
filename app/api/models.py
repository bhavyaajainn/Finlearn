from pydantic import BaseModel, Field, validator, constr
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class TooltipWord(BaseModel):
    word: str
    tooltip: str

class DeepDiveResponse(BaseModel):
    text: str
    tooltip_words: List[TooltipWord]  # List of TooltipWord objects

class Topics(BaseModel):
    expertise_level: str
    topics: List[str]

class Article(BaseModel):
    id: str
    title: str
    content: str
    tooltip_words: List[TooltipWord]
    key_concepts: List[str]
    difficulty_level: str
    category: str
    created_at: str

class ArticleResponse(BaseModel):
    user_id: str
    level: str
    articles: Dict[str, List[Article]]

class TooltipView(BaseModel):
    user_id: str
    word: str
    tooltip: str
    from_topic: Optional[str] = None

# Define expertise level enum for validation
class ExpertiseLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

# Define the model for category data with proper validation
class Categories(BaseModel):
    expertise_level: ExpertiseLevel
    categories: List[constr(min_length=1, max_length=100)] = Field(..., min_items=1, max_items=50)
    
    @validator('categories')
    def validate_categories(cls, categories):
        """Ensure categories are valid and not empty."""
        if not categories:
            raise ValueError("At least one category must be selected")
        
        # Validate each category content
        for category in categories:
            # Check for empty strings after stripping whitespace
            if not category.strip():
                raise ValueError("categories cannot be empty strings")
                
        return categories
    
    class Config:
        # Example for documentation
        schema_extra = {
            "example": {
                "expertise_level": "intermediate",
                "categories": ["ETFs", "Value Investing", "Tax-Efficient Investing"],
            }
        }