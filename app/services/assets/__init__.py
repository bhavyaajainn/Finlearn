"""Stock data service package.

This package provides functions to retrieve and analyze stock market data.
"""

from .data import (
    get_asset_info,
    search_assets,
    get_similar_assets
)

__all__ = [
    "get_stock_info",
    "search_stocks"
]