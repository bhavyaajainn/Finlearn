"""Simple time-based cache for dashboard content."""
from datetime import datetime, timedelta
import random
from typing import Dict, Any, Optional
import logging
import uuid

from app.api.models import GlossaryTerm, NewsItem, Quote
from app.services.ai.perplexity import fetch_trending_finance_news, get_finance_quote, get_financial_glossary_term

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


def get_cached_trending_news(
    expertise_level: str, 
    interests: List[str] = None,
    force_refresh: bool = False
) -> List[NewsItem]:
    """Get trending news with time-based caching."""
    # Create a cache key that includes user interests
    cache_key = f"{expertise_level}:{'-'.join(sorted(interests)) if interests else 'none'}"
    now = datetime.now()
    cache_entry = _cache["trending_news"].get(cache_key)
    
    # Check if we need to refresh (24-hour TTL for news)
    needs_refresh = (
        cache_entry is None or 
        force_refresh or 
        (cache_entry["timestamp"] and (now - cache_entry["timestamp"]).total_seconds() > 86400)  # 24 hours
    )
    
    if needs_refresh:
        # Get fresh data from Perplexity
        raw_news = fetch_trending_finance_news(
            expertise_level=expertise_level,
            user_interests=interests,
            limit=3
        )

        if not isinstance(raw_news, list):
            logger.warning(f"Expected list but got {type(raw_news)}, converting to list")
            raw_news = [raw_news] if raw_news else []
        
        # Process news items
        news_items = []
        if isinstance(raw_news, list):
            for item in raw_news:
                try:
                    item_id = item.get("id")
                    
                    item_id = str(uuid.uuid4())
                        
                    news_item = NewsItem(
                        id=item_id,
                        title=str(item.get("title", "Missing Title")),
                        summary=str(item.get("summary", "No summary available")),
                        source=str(item.get("source", "Unknown Source")),
                        url=item.get("url"),
                        published_at=item.get("published_at"),
                        topics=item.get("topics", []) if isinstance(item.get("topics"), list) else []
                    )
                    news_items.append(news_item)
                except Exception as e:
                    logger.error(f"Error processing news item: {e}")
        
        # Update cache
        _cache["trending_news"][cache_key] = {
            "data": news_items,
            "timestamp": now
        }
        return news_items
    
    # Return cached data
    return cache_entry["data"]