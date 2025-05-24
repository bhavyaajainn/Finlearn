"""Dashboard routes.

This module provides endpoints for the user dashboard including daily content and trending news.
"""
import asyncio
import time
from fastapi import APIRouter, Query
from typing import Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

from app.api.models import DashboardEssentialResponse, DashboardNewsResponse
from app.services.dashboard.cache import get_cached_finance_quote_async, get_cached_glossary_term_async, get_cached_news_article, get_cached_trending_news
from app.services.firebase.watchlist import get_user_expertise_level, get_user_interests


router = APIRouter()

@router.get("/home/essential", response_model=DashboardEssentialResponse)
async def get_dashboard_essential_content(
    user_id: str = Query(...),
    refresh: bool = Query(False)
) -> DashboardEssentialResponse:
    """Get lighter dashboard content (glossary and quote) with parallel execution."""
    # Get user's expertise level
    expertise_level = get_user_expertise_level(user_id)
    
    # Create tasks for parallel execution
    glossary_task = asyncio.create_task(
        get_cached_glossary_term_async(expertise_level, force_refresh=refresh)
    )
    quote_task = asyncio.create_task(
        get_cached_finance_quote_async(force_refresh=refresh)
    )
    
    # Run both tasks concurrently
    glossary_terms, quote = await asyncio.gather(glossary_task, quote_task)
    
    return DashboardEssentialResponse(
        user_id=user_id,
        expertise_level=expertise_level,
        glossary_term=glossary_terms,
        quote=quote,
        timestamp=datetime.now()
    )

@router.get("/home/news", response_model=DashboardNewsResponse)
def get_dashboard_news(
    user_id: str = Query(...),
    refresh: bool = Query(False)
) -> DashboardNewsResponse:
    """Get trending news for the dashboard."""
    # Get user's expertise level and interests
    expertise_level = get_user_expertise_level(user_id)
    interests = get_user_interests(user_id)
    
    # Get trending news
    trending_news = get_cached_trending_news(
        expertise_level=expertise_level,
        interests=interests,
        force_refresh=refresh
    )
    
    return DashboardNewsResponse(
        user_id=user_id,
        trending_news=trending_news,
        timestamp=datetime.now()
    )


@router.get("/news/{news_id}")
async def get_news_article(
    news_id: str,
    user_id: str = Query(...),
    refresh: bool = Query(False)
) -> Dict[str, Any]:
    """Get detailed article about a trending news item with tooltips.
    
    Args:
        news_id: ID of the news item
        user_id: User identifier
        refresh: Force refresh cached content
        
    Returns:
        Detailed article with tooltips based on user's expertise level
    """
    start_time = time.time()
    
    try:
        # Get user's expertise level
        expertise_level = get_user_expertise_level(user_id)
        
        # Get cached or generate new article
        article = await asyncio.to_thread(
            get_cached_news_article, 
            news_id, 
            expertise_level,
            refresh
        )
        # Track performance
        elapsed = time.time() - start_time
        logger.info(f"Article generated in {elapsed:.2f}s (cached: {not refresh})")
        
        return {
            "user_id": user_id,
            "news_id": news_id,
            "expertise_level": expertise_level,
            "article": article,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating news article: {str(e)}", exc_info=True)
        
        # Return a graceful error response with fallback content
        return {
            "user_id": user_id,
            "news_id": news_id,
            "expertise_level": "intermediate",  # Default if we couldn't get user's level
            "article": {
                "title": "Unable to Load Article",
                "content": "We're sorry, but we couldn't load this article right now. Please try again later.",
                "key_points": ["Service temporarily unavailable"],
                "related_topics": ["System error log, article generation unavailable."],
                "reading_time_minutes": 1
            },
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
