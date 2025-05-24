"""Simple time-based cache for dashboard content."""
from datetime import datetime, timedelta
import random
from typing import Dict, Any, Optional,List
import logging
import uuid
import asyncio
from functools import partial


from app.api.models import GlossaryTerm, NewsItem, Quote
from app.services.ai.perplexity import fetch_trending_finance_news, generate_news_article, get_finance_quote, get_financial_glossary_term

# Add these imports at the top
from app.services.firebase.trending_news import (
    store_trending_news, 
    get_trending_news as get_firebase_trending_news,
    get_news_item_by_id, 
    store_news_article,
    get_news_article as get_firebase_news_article,
    track_article_view
)

# In-memory cache with time tracking
_cache = {
    "glossary_terms": {},  # {expertise_level: {"data": term_obj, "timestamp": datetime}}
    "quotes": {"data": None, "timestamp": None},
    "trending_news": {}
}

# Cache TTL in seconds (default 24 hours)
CACHE_TTL = 24 * 60 * 60

logger = logging.getLogger(__name__)

def clear_dashboard_cache():
    """Clear all cached dashboard data."""
    _cache["glossary_terms"] = {}
    _cache["quotes"] = {"data": None, "timestamp": None}

from typing import Dict, Any, Optional, List  # Add List import

def get_cached_glossary_term(expertise_level: str, cache_key: str = None, force_refresh: bool = False) -> List[GlossaryTerm]:
    """Get financial glossary terms with time-based caching.
    
    Args:
        expertise_level: User's financial expertise level
        cache_key: Optional cache key (ignored in this implementation)
        force_refresh: Whether to force a refresh of cached data
        
    Returns:
        List of glossary terms
    """
    now = datetime.now()
    cache_entry = _cache["glossary_terms"].get(expertise_level)
    
    # Check if we need to refresh
    needs_refresh = (
        cache_entry is None or 
        force_refresh or 
        (cache_entry["timestamp"] and (now - cache_entry["timestamp"]).total_seconds() > CACHE_TTL)
    )
    
    if needs_refresh:
        # Get fresh data from Perplexity
        raw_terms = get_financial_glossary_term(expertise_level)
        
        # Convert raw response to list of GlossaryTerm objects
        if isinstance(raw_terms, list):
            # Handle list of terms (expected format)
            terms = [
                GlossaryTerm(
                    term=term["term"],
                    definition=term["definition"],
                    example=term.get("example")
                ) for term in raw_terms
            ]
        elif isinstance(raw_terms, dict) and "term" in raw_terms:
            # Handle single term object
            terms = [
                GlossaryTerm(
                    term=raw_terms["term"],
                    definition=raw_terms["definition"],
                    example=raw_terms.get("example")
                )
            ]
        else:
            # Handle unexpected format
            print(f"Unexpected format from get_financial_glossary_term: {raw_terms}")
            terms = []
        
        # Update cache
        _cache["glossary_terms"][expertise_level] = {
            "data": terms,
            "timestamp": now
        }
        return terms
    
    # Return cached data
    return cache_entry["data"]

def get_cached_finance_quote(cache_key: str = None, force_refresh: bool = False) -> Quote:
    """Get finance quote with time-based caching.
    
    Args:
        cache_key: Optional cache key (ignored in this implementation)
        force_refresh: Whether to force a refresh of cached data
    """
    now = datetime.now()
    cache_entry = _cache["quotes"]
    
    # Check if we need to refresh
    needs_refresh = (
        cache_entry["data"] is None or 
        force_refresh or 
        (cache_entry["timestamp"] and (now - cache_entry["timestamp"]).total_seconds() > CACHE_TTL)
    )
    
    if needs_refresh:
        # Get fresh data with a random seed
        raw_quote = get_finance_quote()
        
        quote = Quote(
            text=raw_quote.get("text") or raw_quote.get("quote"),
            author=raw_quote.get("author")
        )
        
        # Update cache
        _cache["quotes"] = {
            "data": quote,
            "timestamp": now
        }
        return quote
    
    # Return cached data
    return cache_entry["data"]


# Add to your cache initialization
_cache["news_articles"] = {}

async def get_cached_glossary_term_async(
    expertise_level: str, 
    cache_key: str = None, 
    force_refresh: bool = False
) -> List[Any]:
    """Async wrapper for glossary term caching."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        partial(get_cached_glossary_term, expertise_level, cache_key, force_refresh)
    )

async def get_cached_finance_quote_async(force_refresh: bool = False) -> Dict[str, Any]:
    """Async wrapper for finance quote caching."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        partial(get_cached_finance_quote, force_refresh)
    )

async def get_cached_trending_news_async(
    expertise_level: str,
    interests: Optional[List[str]] = None,
    force_refresh: bool = False
) -> List[Any]:
    """Async wrapper for trending news caching."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        partial(get_cached_trending_news, expertise_level, interests, force_refresh)
    )

def get_cached_trending_news(
    expertise_level: str,
    interests: Optional[List[str]] = None,
    force_refresh: bool = False
) -> List[Any]:
    """Get trending finance news with Firebase caching."""
    # Check if we need to refresh
    news_items = []
    if not force_refresh:
        # Try to get from Firebase
        news_items = get_firebase_trending_news(expertise_level)
    
    if not news_items or force_refresh:
        # Get fresh data from Perplexity
        raw_news = fetch_trending_finance_news(
            expertise_level=expertise_level,
            user_interests=interests,
            limit=3
        )
        
        # Store in Firebase
        store_trending_news(raw_news, expertise_level)
        
        # Return fresh data
        return raw_news
    
    # Return cached data
    return news_items

def get_cached_news_article(
    news_id: str, 
    expertise_level: str,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """Get cached news article with Firebase caching."""
    # Try to get from Firebase first
    article = None
    if not force_refresh:
        article = get_firebase_news_article(news_id, expertise_level)
    
    if not article or force_refresh:
        # Get the news item details
        news_item = get_news_item_by_id(news_id)
        
        if not news_item:
            logger.warning(f"News item with ID {news_id} not found in Firebase")
            # Create fallback news item
            news_item = {
                "id": news_id,
                "title": "Recent Financial Development",
                "summary": "Recent developments in financial markets and their implications.",
                "source": "Financial Times",
                "topics": ["finance"]
            }
        
        # Generate fresh article
        article = generate_news_article(news_id, news_item, expertise_level)
        
        # Store in Firebase
        store_news_article(news_id, expertise_level, article)
    
    return article