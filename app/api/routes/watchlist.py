"""Watchlist routes.

This module provides endpoints for managing user watchlists.
"""
from fastapi import APIRouter, Query, Depends
from typing import List, Dict, Any

from app.services.firebase import get_user_watchlist, add_to_watchlist, remove_from_watchlist
from app.services.stocks import get_stock_info
from app.services.ai import get_deep_research_on_stock


router = APIRouter()

@router.post("/add")
async def add_stock(
    user_id: str = Query(...),
    symbol: str = Query(...),
) -> Dict[str, str]:
    """Add a stock to a user's watchlist.
    
    Args:
        user_id: User identifier
        symbol: Stock symbol to add
        
    Returns:
        Confirmation message
    """
    add_to_watchlist(user_id, symbol)
    return {"message": f"{symbol} added to {user_id}'s watchlist."}

@router.delete("/remove")
async def remove_stock(
    user_id: str = Query(...),
    symbol: str = Query(...),
) -> Dict[str, str]:
    """Remove a stock from a user's watchlist.
    
    Args:
        user_id: User identifier
        symbol: Stock symbol to remove
        
    Returns:
        Confirmation message
    """
    remove_from_watchlist(user_id, symbol)
    return {"message": f"{symbol} removed from {user_id}'s watchlist."}

@router.get("")
async def view_watchlist(user_id: str) -> Dict[str, List[str]]:
    """Get a user's watchlist.
    
    Args:
        user_id: User identifier
        
    Returns:
        List of stock symbols in the user's watchlist
    """
    symbols = get_user_watchlist(user_id)
    return {"watchlist": symbols}

@router.get("/details")
async def get_watchlist_info(user_id: str) -> Dict[str, List[Dict[str, Any]]]:
    """Get detailed information about stocks in a user's watchlist.
    
    Args:
        user_id: User identifier
        
    Returns:
        Detailed information about each stock in the watchlist
    """
    symbols = get_user_watchlist(user_id)
    data = [get_stock_info(s) for s in symbols]
    return {"data": data}

@router.get("/research")
async def get_research(user_id: str) -> Dict[str, Dict[str, str]]:
    """Get detailed research for stocks in a user's watchlist.
    
    Args:
        user_id: User identifier
        
    Returns:
        Research information for each stock in the watchlist
    """
    symbols = get_user_watchlist(user_id)
    research = {s: get_deep_research_on_stock(s) for s in symbols}
    return {"research": research}