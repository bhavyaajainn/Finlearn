"""Learning routes.

This module provides endpoints for financial learning and educational content.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from enum import Enum

# from app.services.ai import get_deep_dive, get_concept_summary, generate_day_summary, claude_generate_article
# Import both providers' functions
from app.services.ai import (
    generate_article,
    generate_category_topics,
    get_daily_topics
)
from app.services.ai.perplexity import generate_article
from app.services.firebase import log_topic_read, get_user_day_log
from app.api.models import DeepDiveResponse,ArticleResponse
from app.services.ai.claude import generate_category_topics, get_deep_dive
from app.services.firebase.cache import cache_topics, get_cached_topics,find_topic_by_id
from app.services.firebase.categories import get_user_categories


# from app.services.ai.claude import get_daily_topics
from app.services.firebase.cache import should_refresh_topics
from app.services.firebase.reading_log import log_tooltip_viewed

# Define expertise levels as an enum for validation
class ExpertiseLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

router = APIRouter()



@router.get("/articles", response_model=ArticleResponse)
async def get_articles(
    user_id: str,
    category: Optional[str] = None,
    topic: Optional[str] = None,
    level: ExpertiseLevel = ExpertiseLevel.intermediate,
    count: int = Query(2, ge=1, le=5, description="Number of articles to generate")
) -> Dict[str, Any]:
    """Generate articles on financial topics using Perplexity API.
    
    Args:
        user_id: User identifier
        category: Specific category to generate articles for (if None, uses user's selected categories)
        topic: Specific topic within the category to focus on (optional)
        level: Expertise level (beginner, intermediate, advanced)
        count: Number of articles to generate per category
        
    Returns:
        Dictionary containing generated articles with tooltips for concepts
    """
    if topic:
        # Generate articles focused on a specific topic
        articles = []
        for _ in range(count):
            article = generate_article(
                category=category,
                topic=topic,  # Pass the specific topic
                expertise_level=level,
                user_id=user_id
            )
            articles.append(article)
        
        return {
            "user_id": user_id,
            "level": level,
            "articles": {category: articles}
        }
    else:
        # Original category-based logic
        categories = [category] if category else get_user_categories(user_id)
        
        if not categories:
            raise HTTPException(status_code=404, detail="No categories found for this user")
        
        articles_by_category = {}
        
        for cat in categories:
            articles_by_category[cat] = []
            for _ in range(count):
                article = generate_article(
                    category=cat,
                    expertise_level=level,
                    user_id=user_id
                )
                articles_by_category[cat].append(article)
        
        return {
            "user_id": user_id,
            "level": level,
            "articles": articles_by_category
        }



@router.get("/topics")
async def get_category_topics(
    user_id: str,
    category: str,
    level: ExpertiseLevel = ExpertiseLevel.intermediate
) -> Dict[str, Any]:
    """Get a list of relevant topics within a financial category.
    
    Args:
        user_id: User identifier
        category: Financial category to explore
        level: Expertise level (beginner, intermediate, advanced)
        
    Returns:
        List of topics with descriptions suitable for the expertise level
    """
    # Check if we have cached topics for this category and level
    cached_topics = get_cached_topics(category, level)
    
    if cached_topics:
        return {
            "category": category,
            "level": level,
            "topics": cached_topics
        }
    
    # Generate topics using AI if not cached
    topics = generate_category_topics(category, level)
    
    # Cache the results for future use
    cache_topics(category, level, topics)
    
    return {
        "category": category,
        "level": level,
        "topics": topics
    }


@router.get("/dailytopics")
async def get_daily_category_topics(
    user_id: str,
    category: str,
    level: ExpertiseLevel = ExpertiseLevel.intermediate,
    refresh: bool = False  # Allow manual refresh
) -> Dict[str, Any]:
    """Get a list of relevant topics within a financial category based on latest news.
    
    Args:
        user_id: User identifier
        category: Financial category to explore
        level: Expertise level (beginner, intermediate, advanced)
        refresh: Force refresh topics even if cache exists
        
    Returns:
        List of news-relevant topics with descriptions
    """
    # Check if we need to refresh
    need_refresh = refresh or should_refresh_topics(category, level.value)
    
    # Get or generate topics
    if need_refresh:
        topics = get_daily_topics(category, level.value, user_id)
    else:
        from app.services.firebase.cache import get_cached_topics
        topics = get_cached_topics(category, level.value) or []
    
    # # Get user's viewing history
    # user_history = get_user_topic_history(user_id)
    # viewed_topic_ids = [item['topic_id'] for item in user_history 
    #                    if item['category'] == category]
    
    # # Mark topics as viewed or new
    # for topic in topics:
    #     topic["viewed"] = topic["topic_id"] in viewed_topic_ids
    
    # Get refresh timestamp
    from app.services.firebase.cache import get_cache_timestamp
    cache_time = get_cache_timestamp(category, level.value)
    
    return {
        "category": category,
        "level": level,
        "topics": topics,
        "refreshed_at": cache_time.isoformat() if cache_time else datetime.now().isoformat(),
        "is_fresh": need_refresh
    }


# Add this new endpoint

@router.get("/article/topic/{topic_id}")
async def get_topic_article(
    user_id: str,
    topic_id: str,
    level: ExpertiseLevel = None  # Optional - will use the topic's level if not specified
) -> Dict[str, Any]:
    """Generate an article for a specific topic.
    
    Args:
        user_id: User identifier
        topic_id: ID of the topic to generate an article for
        level: Optional override for expertise level
        
    Returns:
        Generated article with tooltips for the specific topic
    """
    # Get the topic details from cache
    topic = find_topic_by_id(topic_id)
    
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic with ID {topic_id} not found")
    
    # Use the topic's level if not specified
    expertise_level = level.value if level else topic.get("expertise_level", "intermediate")
    category = topic.get("category")
    title = topic.get("title")
    
    # Generate article
    article = generate_article(
        category=category,
        topic=title,
        expertise_level=expertise_level,
        user_id=user_id
    )
    
    # Track that the user viewed this topic
    try:
        from app.services.firebase.reading_log import track_viewed_topic
        track_viewed_topic(user_id, category, topic_id)
    except ImportError:
        # Optional tracking - don't fail if not implemented
        pass

    for tooltip_item in article.get("tooltip_words", []):
        word = tooltip_item.get("word")
        tooltip = tooltip_item.get("tooltip")
        if word and tooltip:
            log_tooltip_viewed(user_id, word, tooltip, from_topic=title)
    
    return {
        "user_id": user_id,
        "topic_id": topic_id,
        "topic_info": topic,
        "article": article
    }

@router.post("/tooltip/view")
async def log_tooltip_view(
    user_id: str,
    word: str,
    tooltip: str,
    from_topic: Optional[str] = None
) -> Dict[str, Any]:
    """Log when a user views a tooltip explanation.
    
    Args:
        user_id: User identifier
        word: The financial term viewed
        tooltip: The explanation text
        from_topic: Optional topic context
        
    Returns:
        Success confirmation
    """
    log_tooltip_viewed(user_id, word, tooltip, from_topic)
    
    return {
        "status": "success",
        "message": "Tooltip view logged",
        "user_id": user_id,
        "word": word
    }