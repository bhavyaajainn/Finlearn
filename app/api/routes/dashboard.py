"""Dashboard routes.

This module provides endpoints for the user dashboard including daily content and trending news.
"""
import asyncio
import time
import uuid
from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, Optional, List
from enum import Enum
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

from app.api.models import DashboardEssentialResponse, DashboardNewsResponse, DashboardResponse, NewsItem
from app.services.dashboard.cache import clear_dashboard_cache, get_cached_finance_quote, get_cached_finance_quote_async, get_cached_glossary_term, get_cached_glossary_term_async, get_cached_news_article, get_cached_trending_news
from app.services.firebase.watchlist import get_user_expertise_level, get_user_interests
from app.services.ai.perplexity import (
    fetch_trending_finance_news,
    generate_news_article,
    get_financial_glossary_term,
    get_finance_quote
)
from app.services.firebase.reading_log import log_topic_read

router = APIRouter()

@router.get("/home", response_model=DashboardResponse)
def get_dashboard_content(
    user_id: str = Query(...),
    refresh: bool = Query(False)
) -> DashboardResponse:
    try:
        # Get user's expertise level
        expertise_level = get_user_expertise_level(user_id)
        
        # Get user's interests
        interests = get_user_interests(user_id)
        
        # If refresh requested, clear cache first
        if refresh:
            clear_dashboard_cache()
        
        # DIAGNOSTIC: Add type and content logging
        logger.info(f"Starting dashboard content generation for user {user_id}")
        
        # Get glossary term and quote with force_refresh
        try:
            logger.debug("Fetching glossary terms...")
            glossary_terms = get_cached_glossary_term(expertise_level, force_refresh=refresh)
            logger.debug(f"Got glossary_terms of type {type(glossary_terms)}")
            if not isinstance(glossary_terms, list):
                logger.warning(f"Expected list for glossary_terms but got {type(glossary_terms)}, converting to list")
                glossary_terms = [glossary_terms] if glossary_terms else []
        except Exception as e:
            logger.error(f"Error fetching glossary terms: {e}")
            glossary_terms = []
            
        try:
            logger.debug("Fetching finance quote...")
            quote = get_cached_finance_quote(force_refresh=refresh)
            logger.debug(f"Got quote of type {type(quote)}")
        except Exception as e:
            logger.error(f"Error fetching quote: {e}")
            quote = {"text": "Error fetching quote", "author": "System"}

        try:
            logger.debug("Fetching trending news...")
            trending_news = get_cached_trending_news(
                expertise_level=expertise_level,
                interests=interests,
                force_refresh=refresh
            )
            logger.debug(f"Got raw_news of type {type(trending_news)} with content: {trending_news}")
        except Exception as e:
            logger.error(f"Error fetching trending news: {e}")
            trending_news = []
       
        if not isinstance(trending_news, list):
            logger.warning(f"Expected list but got {type(trending_news)}, converting to list")
            trending_news = [trending_news] if trending_news else []
        
        # Prepare response with detailed error handling
        try:
            logger.debug("Creating dashboard response...")
            response = DashboardResponse(
                user_id=user_id,
                expertise_level=expertise_level,
                glossary_term=glossary_terms,
                quote=quote,
                trending_news=trending_news,
                timestamp=datetime.now()
            )
            logger.debug("Dashboard response created successfully")
            return response
        except Exception as e:
            logger.error(f"Error creating dashboard response: {e}", exc_info=True)
            raise
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Error generating dashboard: {str(e)}")

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
