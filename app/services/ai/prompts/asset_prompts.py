"""Prompts for asset-related AI queries."""
from typing import Any, Dict, List

def get_comprehensive_research_prompt(
    symbol: str,
    asset_type: str,
    expertise_level: str,
    asset_info: Dict[str, Any],
    similar_assets: List[Dict[str, Any]] = None,
    user_interests: List[str] = None,
    recent_news: List[Dict[str, Any]] = None,
    watchlist_items: List[Dict[str, Any]] = None,
    related_topics: List[Dict[str, Any]] = None
) -> str:
    """Create a prompt for comprehensive research with structured output format."""
    # Format asset info
    info_text = "\n".join([f"- {k}: {v}" for k, v in asset_info.items() 
                          if v is not None and k not in ["last_updated", "currency"]])
    
    # Format similar assets
    similar_text = ""
    if similar_assets:
        similar_text = "\nSimilar Assets:\n"
        for asset in similar_assets:
            similar_text += f"- {asset.get('symbol')}: {asset.get('name')}, Price: {asset.get('price')}\n"
            similar_text += f"  Reason for similarity: {asset.get('reason')}\n"
    
    # Format user interests
    interests_text = ", ".join(user_interests) if user_interests else "general investing"
    
    # Format recent news
    news_text = ""
    if recent_news:
        news_text = "\nRecent News:\n"
        for item in recent_news:
            news_text += f"- {item.get('headline')} ({item.get('date')})\n"
            news_text += f"  Summary: {item.get('summary')}\n"
            news_text += f"  Impact: {item.get('impact', {}).get('direction', 'unknown')} - "
            news_text += f"{item.get('impact', {}).get('reason', 'Not specified')}\n"
    
    # Format watchlist items for context
    watchlist_text = ""
    if watchlist_items:
        watchlist_symbols = [f"{item.get('symbol')} ({item.get('asset_type')})" 
                            for item in watchlist_items 
                            if item.get('symbol') != symbol]  # Exclude current symbol
        if watchlist_symbols:
            watchlist_text = f"\nUser's Watchlist:\n"
            watchlist_text += ", ".join(watchlist_symbols)
    
    # Get expertise-specific instructions
    expertise_instructions = _get_expertise_instructions(expertise_level, symbol, asset_type)
    
    # Build the final prompt
    prompt = f"""
{expertise_instructions}

Asset Information:
{info_text}

{similar_text if similar_assets else ""}
{news_text if recent_news else ""}
{watchlist_text if watchlist_items else ""}

PERSONALIZATION INSTRUCTIONS:
1. User Interests: Focus on aspects related to {interests_text}.
2. Recent News: {"Incorporate analysis of the recent news provided and how it affects the investment thesis." if recent_news else "Focus on long-term fundamentals rather than very recent events."}
3. Watchlist Context: {"Discuss how this asset relates to or complements the user's existing watchlist." if watchlist_items else "Consider this may be one of the first assets the user is researching in depth."}
4. Interactive Style: Make the analysis feel personalized by addressing the user directly throughout the article.

Structure your research article with these sections:
1. Title - Engaging title for the research article
2. Executive Summary - Brief overview of key points
3. Introduction - Overview of the company/asset and investment thesis
4. Business Analysis - What the company does, its products/services, competitive position
5. Financial Analysis - Key metrics, growth trends, and financial health
6. Risk Assessment - Major risks and challenges facing the asset
7. Recent News Analysis - Analysis of recent news and their impact
8. Comparison - How it compares to similar assets (if provided)
9. Watchlist Integration - How this fits with user's existing portfolio
10. Conclusion - Bringing together the key insights
11. Investment Recommendation - Clear buy/hold/sell guidance with reasoning

Format your ENTIRE response as a valid JSON object with these fields:
{{
  "title": "Engaging research title",
  "summary": "2-3 sentence executive summary",
  "sections": [
    {{
      "title": "Section title",
      "content": "Detailed section content with embedded tooltips as specified"
    }}
  ],
  "watchlist_relevance": "How this asset relates to the user's existing watchlist",
  "conclusion": "Concluding analysis with key takeaways",
  "recommendation": {{
    "action": "buy/sell/hold/watch",
    "reasoning": "Explanation for the recommendation",
    "risk_level": "low/medium/high",
    "time_horizon": "short-term/medium-term/long-term"
  }},
  "references": [
    "Citation 1: Source name, date, URL or other identifying information",
    "Citation 2: Source name, date, URL or other identifying information"
  ],
  "tooltip_words": [
    {{
      "word": "Term 1", 
      "tooltip": "Explanation for term 1"
    }}
  ]
}}

Include {expertise_level}-appropriate tooltips throughout ALL sections. Make sure to list ALL sources used as references in the dedicated array.
"""
    
    return prompt

def _get_expertise_instructions(expertise_level: str, symbol: str, asset_type: str) -> str:
    """Get expertise-specific instructions for the prompt."""
    if expertise_level.lower() == "beginner":
        return f"""
Write a comprehensive research article about {symbol} ({asset_type}) for a BEGINNER investor.

Your article should:
1. Use simple, clear language
2. Break down complex concepts into easily digestible explanations
3. Focus on the fundamental story rather than technical details
4. Emphasize basic investment concepts relevant to this asset
5. Provide clear visual analogies where helpful

IMPORTANT: Instead of embedding tooltips in the content, simply write the article normally.
Separately identify 15-20 financial terms or concepts that beginners might not know.
These will be returned in a separate "tooltip_words" array in your response.

For example, your article might mention "P/E ratio" and "market cap" normally in the text,
and then you'll include these terms with explanations in the tooltip_words array.
"""
    elif expertise_level.lower() == "intermediate":
        return f"""
Write a detailed research article about {symbol} ({asset_type}) for an INTERMEDIATE investor with some financial knowledge.

Your article should:
1. Use moderate financial terminology
2. Provide deeper analysis of financial metrics and industry positioning
3. Include some sector-specific insights and competitive analysis
4. Discuss both fundamental and some basic technical factors
5. Balance simplicity with substantive analysis

IMPORTANT: Instead of embedding tooltips in the content, simply write the article normally.
Separately identify 10-15 financial terms or concepts that intermediate investors might not fully grasp.
These will be returned in a separate "tooltip_words" array in your response.

For example, your article might mention "operating margin" and "EBITDA" normally in the text,
and then you'll include these terms with explanations in the tooltip_words array.
"""
    else:  # advanced
        return f"""
Write an in-depth, sophisticated research article about {symbol} ({asset_type}) for an ADVANCED investor with extensive financial knowledge.

Your article should:
1. Use technical financial terminology appropriate for experienced investors
2. Provide nuanced analysis of complex financial metrics and valuation models
3. Include detailed industry analysis, competitive positioning, and macroeconomic factors
4. Incorporate advanced technical analysis where relevant
5. Offer sophisticated insights that would interest professional investors

IMPORTANT: Instead of embedding tooltips in the content, simply write the article normally.
Separately identify 5-10 specialized, niche, or especially complex financial concepts.
These will be returned in a separate "tooltip_words" array in your response.

For example, your article might mention "Altman Z-Score" and "bull flag consolidation" normally in the text,
and then you'll include these terms with explanations in the tooltip_words array.
"""