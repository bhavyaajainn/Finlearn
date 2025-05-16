"""Dashboard routes.

This module provides endpoints for the user dashboard including daily content and trending news.
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, Optional, List
from enum import Enum
from datetime import datetime, timedelta

from app.services.firebase.watchlist import get_user_expertise_level, get_user_interests
from app.services.ai.perplexity import (
    fetch_trending_finance_news,
    generate_news_article,
    get_financial_glossary_term,
    get_finance_quote
)
from app.services.firebase.reading_log import log_topic_read

router = APIRouter()

@router.get("/home")
def get_dashboard_content(
    user_id: str = Query(...)
) -> Dict[str, Any]:
    """Get personalized dashboard content for a user.
    
    Args:
        user_id: User identifier
        
    Returns:
        Dashboard content including glossary term, quote, and trending news
    """
    try:
        # Get user's expertise level
        expertise_level = get_user_expertise_level(user_id)
        
        # Get user's interests
        interests = get_user_interests(user_id)
        
        # Get glossary term of the day
        glossary_term = get_financial_glossary_term(expertise_level)
        
        # Get motivational finance quote
        quote = get_finance_quote()
        
        # Get trending finance news tailored to user's expertise
        trending_news = fetch_trending_finance_news(
            expertise_level=expertise_level,
            user_interests=interests,
            limit=3
        )
        
        return {
            "user_id": user_id,
            "expertise_level": expertise_level,
            "glossary_term": glossary_term,
            "quote": quote,
            "trending_news": trending_news,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating dashboard: {str(e)}")

@router.get("/news/{news_id}")
def get_news_article(
    news_id: str,
    user_id: str = Query(...)
) -> Dict[str, Any]:
    """Get detailed article about a trending news item with tooltips.
    
    Args:
        news_id: ID of the news item
        user_id: User identifier
        
    Returns:
        Detailed article with tooltips based on user's expertise level
    """
    try:
        # Get user's expertise level
        expertise_level = get_user_expertise_level(user_id)
        
        # Generate full article with tooltips based on user's expertise
        article = generate_news_article(news_id, expertise_level)
        
        
        return {
            "user_id": user_id,
            "news_id": news_id,
            "expertise_level": expertise_level,
            "article": article,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating news article: {str(e)}")