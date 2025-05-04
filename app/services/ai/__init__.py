"""AI services package.

This module provides access to various AI providers for financial research,
analysis, and educational content generation.
"""

# Import Claude functionality
from .claude import (
    get_deep_dive as claude_get_deep_dive,
    get_concept_summary as claude_get_concept_summary,
    generate_day_summary as claude_generate_day_summary,
    get_deep_research_on_stock as claude_get_research,
    get_trending_topics as claude_get_trending_topics,
    analyze_stock_sentiment
)

# Import Perplexity functionality
from .perplexity import (
    get_deep_dive as perplexity_get_deep_dive,
    get_concept_summary as perplexity_get_concept_summary,
    generate_day_summary as perplexity_generate_day_summary,
    get_deep_research_on_stock as perplexity_get_research,
    get_trending_topics as perplexity_get_trending_topics,
    get_market_analysis
)

# Default implementations (you can choose which service to use as default)
get_deep_dive = claude_get_deep_dive
get_concept_summary = claude_get_concept_summary
generate_day_summary = claude_get_deep_dive
get_research = claude_get_research
get_trending_topics = claude_get_trending_topics  # Maybe perplexity is better for trending topics
get_deep_research_on_stock = claude_get_research

__all__ = [
    # Direct provider-specific functions
    "claude_get_deep_dive",
    "claude_get_concept_summary",
    "claude_generate_day_summary",
    "claude_get_research",
    "claude_get_trending_topics",
    "analyze_stock_sentiment",
    
    "perplexity_get_deep_dive", 
    "perplexity_get_concept_summary",
    "perplexity_generate_day_summary",
    "perplexity_get_research",
    "perplexity_get_trending_topics",
    "get_market_analysis",
    
    # Default implementations
    "get_deep_dive",

    "get_concept_summary",
    "generate_day_summary",
    "get_research",
    "get_deep_research_on_stock",
    "get_trending_topics"
]