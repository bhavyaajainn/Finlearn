"""AI services package.

This module provides access to various AI providers for financial research,
analysis, and educational content generation.
"""


# Import Perplexity functionality
from .perplexity import (
    generate_article as perplexity_generate_article,
    get_daily_topics as perplexity_get_daily_topics,
    generate_reading_summary as perplexity_generate_reading_summary,
)


generate_article = perplexity_generate_article
get_daily_topics = perplexity_get_daily_topics
generate_reading_summary =perplexity_generate_reading_summary

__all__ = [
    
    "perplexity_get_deep_dive", 
    "perplexity_get_concept_summary",
    "perplexity_generate_day_summary",
    "perplexity_get_research",
    "perplexity_get_trending_topics",
    "get_market_analysis",
    "generate_article",
    "get_research",
    "get_trending_topics",
    "generate_article",
   " generate_reading_summary"
]