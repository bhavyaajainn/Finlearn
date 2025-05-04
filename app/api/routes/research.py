"""Research routes.

This module provides endpoints for financial research.
"""
from fastapi import APIRouter, Query
from typing import Dict, List, Any

from app.services.ai import get_trending_topics, get_market_analysis

router = APIRouter()

@router.get("/trending")
async def trending() -> Dict[str, List[str]]:
    """Get trending financial topics.
    
    Returns:
        List of trending financial topics
    """
    return {"topics": get_trending_topics()}

@router.get("/market-analysis")
async def market_analysis(symbols: str = Query(...)) -> Dict[str, Any]:
    """Get market analysis for specific symbols.
    
    Args:
        symbols: Comma-separated list of stock symbols
        
    Returns:
        Market analysis for the requested symbols
    """
    symbol_list = [s.strip() for s in symbols.split(",")]
    analysis = get_market_analysis(symbol_list)
    return analysis