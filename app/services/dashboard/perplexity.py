

from datetime import datetime
import json
import logging
from typing import Any, Dict, List

from app.services.ai.perplexity import call_perplexity_api_with_schema


logger = logging.getLogger(__name__)

def fetch_trending_finance_news(
    expertise_level: str,
    user_interests: List[str] = None,
    limit: int = 3
) -> List[Dict[str, Any]]:
    """Fetch trending finance news tailored to the user's expertise and interests.
    
    Args:
        expertise_level: User's expertise level (beginner/intermediate/advanced)
        user_interests: List of financial topics the user is interested in
        limit: Maximum number of news items to return
        
    Returns:
        List of trending news items with details
    """
    # Create interest string for personalization
    interest_str = ", ".join(user_interests) if user_interests else "general finance"
    
    prompt = f"""Find the {limit} most significant trending finance news stories from the past 24-48 hours.
    
Focus on topics related to: {interest_str}

The content should be appropriate for a {expertise_level}-level investor.

For each news item, provide a unique ID, title, summary, source, and other required information.
"""
    
    try:
        # Use schema-based approach for structured response
        from app.services.ai.schemas import TRENDING_NEWS_SCHEMA
        
        # Get structured response using the schema
        news_items = call_perplexity_api_with_schema(prompt, TRENDING_NEWS_SCHEMA)
        
        return news_items[:limit]
        
    except Exception as e:
        logger.error(f"Error fetching trending finance news: {e}")
        # Return fallback news items
        current_date = datetime.now().isoformat()
        return [
            {
                "id": f"fallback-{i}",
                "title": f"Latest Developments in {topic.capitalize()}",
                "summary": f"Recent market trends affecting {topic} investments.",
                "source": "Financial Times",
                "url": None,
                "published_at": current_date,
                "topics": [topic]
            }
            for i, topic in enumerate(["stocks", "bonds", "cryptocurrency"][:limit])
        ]

