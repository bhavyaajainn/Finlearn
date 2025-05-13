"""Prompts for asset-related AI queries."""


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