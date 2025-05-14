"""Prompts for asset-related AI queries."""


from typing import Any, Dict, List


def get_asset_search_prompt(query: str, asset_type: str = None, limit: int = 10) -> str:
    """Generate prompt for asset search."""
    asset_type_str = f"{asset_type}s" if asset_type else "stocks and cryptocurrencies"
    
    return f"""Find {limit} {asset_type_str} matching the search query "{query}".

IMPORTANT: Only return assets where "{query}" appears in either:
1. The ticker symbol (prioritize exact symbol matches)
2. The company/asset name (prioritize companies with "{query}" in their actual name)

For each result, provide:
1. Symbol
2. Full name
3. Current price (approximate)
4. Brief description (1 sentence)
5. Explanation of why this result matches the query

Format your response as a valid JSON array with this structure:
[
  {{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "asset_type": "stock",
    "current_price": 180.50,
    "description": "Technology company known for iPhone, Mac, and services.",
    "match_reason": "The company name 'Apple' contains the query 'app'."
  }},
  ...
]

Ensure:
- For stocks: Use standard exchange symbols
- For crypto: Use standard trading symbols (e.g., BTC, ETH)
- Return only {limit} most relevant results
- Include only valid, publicly traded assets
- Prioritize exact matches over thematic/business relevance
"""


def get_similar_stocks_prompt(symbol: str, limit: int = 3) -> str:
    """Generate prompt for finding similar stocks."""
    return f"""
Find {limit} stocks that are similar to {symbol} in terms of business model, sector, market position, or competition.
For each similar stock, provide:
1. The stock symbol
2. Company name
3. Current price (approximate)
4. A specific reason why it's similar to {symbol}

Format as JSON with the following structure:
[
    {{"symbol": "AAPL", "name": "Apple Inc.", "price": 150.22, "reason": "Direct competitor in smartphone market"}}
]

Only include the JSON array in your response, no additional text.
"""


def get_similar_crypto_prompt(symbol: str, limit: int = 3) -> str:
    """Generate prompt for finding similar cryptocurrencies."""
    return f"""
Find {limit} cryptocurrencies that are similar to {symbol} in terms of technology, use case, market position, or tokenomics.
For each similar cryptocurrency, provide:
1. The crypto symbol
2. Name
3. Current price (approximate)
4. A specific reason why it's similar to {symbol}

Format as JSON with the following structure:
[
    {{"symbol": "ETH", "name": "Ethereum", "price": 3500.00, "reason": "Both are smart contract platforms"}}
]

Only include the JSON array in your response, no additional text.
"""



## assets analysis


def get_narrative_research_prompt(
    symbol: str,
    asset_type: str,
    expertise_level: str,
    asset_info: Dict[str, Any],
    similar_assets: List[Dict[str, Any]] = None,
    user_interests: List[str] = None
) -> str:
    """Create a prompt for narrative research article with embedded tooltips."""
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
    
    # Base instruction based on expertise level
    if expertise_level.lower() == "beginner":
        base_instruction = f"""
Write a comprehensive research article about {symbol} ({asset_type}) for a BEGINNER investor who is new to investing.

Your article should:
1. Use simple, clear language with ALL financial terms explained
2. Break down complex concepts into easily digestible explanations
3. Focus on the fundamental story rather than technical details
4. Emphasize basic investment concepts relevant to this asset
5. Provide clear visual analogies where helpful

IMPORTANT FORMATTING: Whenever you use a financial term or concept that beginners might not know, embed a tooltip using this exact format:
"[concept name]{{tooltip:Simple definition in 1-2 sentences}}"

Examples:
- "The company's [P/E ratio]{{tooltip:Price-to-Earnings ratio shows how expensive a stock is compared to its profits. Lower numbers generally suggest better value.}} is currently 15."
- "Apple benefits from a strong [ecosystem]{{tooltip:A connected family of products and services that work well together, making customers more likely to stay with the company.}}."

Include at least 15-20 tooltips for various beginner-level financial concepts throughout the article.
"""
    elif expertise_level.lower() == "intermediate":
        base_instruction = f"""
Write a detailed research article about {symbol} ({asset_type}) for an INTERMEDIATE investor with some financial knowledge.

Your article should:
1. Use moderate financial terminology with explanations for more complex concepts
2. Provide deeper analysis of financial metrics and industry positioning
3. Include some sector-specific insights and competitive analysis
4. Discuss both fundamental and some basic technical factors
5. Balance simplicity with substantive analysis

IMPORTANT FORMATTING: For financial terms or concepts that intermediate investors might not fully grasp, embed a tooltip using this exact format:
"[concept name]{{tooltip:Clear definition with context}}"

Examples:
- "The company's [operating margin]{{tooltip:The percentage of revenue remaining after covering operating costs, indicating efficiency in core business operations.}} has improved by 3% year-over-year."
- "Investors should watch for potential [channel stuffing]{{tooltip:When a company inflates sales figures by forcing excess inventory through distribution channels, often a red flag for accounting issues.}} in quarterly reports."

Include 10-15 tooltips for intermediate-level financial concepts throughout the article.
"""
    else:  # advanced
        base_instruction = f"""
Write an in-depth, sophisticated research article about {symbol} ({asset_type}) for an ADVANCED investor with extensive financial knowledge.

Your article should:
1. Use technical financial terminology appropriate for experienced investors
2. Provide nuanced analysis of complex financial metrics and valuation models
3. Include detailed industry analysis, competitive positioning, and macroeconomic factors
4. Incorporate advanced technical analysis where relevant
5. Offer sophisticated insights that would interest professional investors

IMPORTANT FORMATTING: For specialized, niche, or especially complex financial concepts, embed a tooltip using this exact format:
"[concept name]{{tooltip:Precise definition with technical context}}"

Examples:
- "The [Altman Z-Score]{{tooltip:A predictive formula for bankruptcy risk that combines five financial ratios, with scores below 1.8 indicating potential distress.}} suggests minimal financial distress risk."
- "Technical traders should note the recent [bull flag consolidation]{{tooltip:A chart pattern showing a period of consolidation after a strong uptrend, typically resolving with continuation of the prior trend.}} on the daily timeframe."

Include 5-10 tooltips only for the most advanced or specialized concepts in the article.
"""
    
    # Full prompt with formatting instructions
    prompt = f"""
{base_instruction}

Asset Information:
{info_text}

{similar_text if similar_assets else ""}

The user is particularly interested in: {interests_text}

Structure your research article with these sections:
1. Title - Engaging title for the research article
2. Summary - Brief executive summary of key points
3. Introduction - Overview of the company/asset and investment thesis
4. Business Analysis - What the company does, its products/services, competitive position
5. Financial Analysis - Key metrics, growth trends, and financial health
6. Risk Assessment - Major risks and challenges facing the asset
7. Comparison - How it compares to similar assets (if provided)
8. Future Outlook - Growth prospects, upcoming catalysts, and potential developments
9. Conclusion - Bringing together the key insights
10. Investment Recommendation - Clear buy/hold/sell guidance with reasoning

Format your ENTIRE response as a valid JSON object with these fields:
{{
  "title": "Engaging research title",
  "summary": "2-3 sentence executive summary",
  "introduction": "Introductory paragraph with overview and thesis",
  "sections": [
    {{
      "title": "Section title",
      "content": "Detailed section content with embedded tooltips as specified"
    }},
    ...more sections...
  ],
  "comparison": "Comparison with similar assets with embedded tooltips",
  "conclusion": "Concluding analysis with key takeaways",
  "recommendation": {{
    "rating": "Buy/Hold/Sell rating",
    "reasoning": "Explanation for the recommendation",
    "risk_level": "Low/Medium/High risk assessment",
    "time_horizon": "Short/Medium/Long-term investment timeframe"
  }}
}}

Remember to include {expertise_level}-appropriate tooltips throughout ALL sections using the exact format specified. Tailor the content depth and terminology to a {expertise_level} investor's knowledge level.
"""
    
    return prompt