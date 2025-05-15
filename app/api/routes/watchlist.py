"""Watchlist routes.

This module provides endpoints for managing user watchlists.
"""
from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Dict, Any, Optional
import logging  # Add standard Python logging instead

# Create a logger instance for this module
logger = logging.getLogger(__name__)


from app.services.assets.data import get_asset_info, get_similar_assets, search_assets
from app.services.firebase import add_to_watchlist, remove_from_watchlist
# from app.services.assets import get_stock_info
from app.services.ai import get_deep_research_on_stock
from app.api.models import AssetType, AddAssetRequest, SearchRequest
from app.services.ai.perplexity import fetch_asset_news, get_interactive_asset_analysis, search_assets_with_perplexity, get_similar_stocks, get_similar_crypto
from app.services.firebase.watchlist import get_related_topics, get_user_expertise_level, get_user_interests, get_user_watchlists, log_asset_research

router = APIRouter()

@router.get("")
async def get_user_watchlist(
    user_id: str,
    asset_type: Optional[AssetType] = None,
    include_similar: bool = False
) -> Dict[str, Any]:
    """Get detailed information about assets in a user's watchlist.
    
    Args:
        user_id: User identifier
        asset_type: Optional filter by asset type
        include_similar: Whether to include similar assets in response
        
    Returns:
        Detailed information about each asset in the watchlist
    """
    # Get user's watchlist items from Firebase
    watchlist_items = get_user_watchlists(user_id, asset_type)
    
    if not watchlist_items:
        return {"watchlist": [], "message": "Watchlist is empty"}
    
    # Fetch detailed information for each asset
    enriched_items = []
    
    for item in watchlist_items:
        try:
            # Get detailed asset info including current price, metrics
            asset_info = get_asset_info(item["symbol"], item["asset_type"])
            
            # Merge watchlist metadata with asset info
            asset_data = {
                **item,
                **asset_info,
                "added_on": item.get("added_on"),
                "notes": item.get("notes", "")
            }
            
            # Add similar assets if requested
            if include_similar:
                asset_data["similar_assets"] = get_similar_assets(
                    item["symbol"], 
                    item["asset_type"],
                    limit=3
                )
            
            enriched_items.append(asset_data)
            
        except Exception as e:
            # If there's an error getting data for this asset, include basic info
            enriched_items.append({
                "symbol": item["symbol"],
                "asset_type": item["asset_type"],
                "name": item["symbol"],
                "error": str(e),
                "added_on": item.get("added_on"),
                "notes": item.get("notes", "")
            })
    
    return {
        "watchlist": enriched_items,
        "count": len(enriched_items)
    }

@router.post("/search")
async def search_for_assets(
    search_request: SearchRequest
) -> Dict[str, Any]:
    """Search for assets by name or symbol.
    
    Args:
        search_request: Search parameters
        
    Returns:
        List of matching assets
    """
    results = search_assets(
        query=search_request.query,
        asset_type=search_request.asset_type,
        limit=search_request.limit
    )
    
    return {
        "results": results,
        "count": len(results),
        "query": search_request.query
    }

@router.post("/add")
async def add_asset_to_watchlist(
    asset: AddAssetRequest,
    user_id: str = Query(...)
) -> Dict[str, Any]:
    """Add an asset to a user's watchlist.
    
    Args:
        asset: Asset details to add
        user_id: User identifier
        
    Returns:
        Confirmation message and added asset details
    """
    try:
        # Validate that the asset exists by getting its info
        asset_info = get_asset_info(asset.symbol, asset.asset_type)
        
        # Add to Firebase with current timestamp
        add_to_watchlist(
            user_id=user_id,
            symbol=asset.symbol,
            asset_type=asset.asset_type,
            notes=asset.notes
        )
        
        # Return confirmation with asset details
        return {
            "message": f"{asset.symbol} added to watchlist",
            "asset": {
                "symbol": asset.symbol,
                "asset_type": asset.asset_type,
                "name": asset_info.get("name"),
                "current_price": asset_info.get("current_price"),
                "notes": asset.notes
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to add asset: {str(e)}")

@router.delete("/remove")
async def remove_from_user_watchlist(
    user_id: str = Query(...),
    symbol: str = Query(...),
    asset_type: AssetType = Query(...)
) -> Dict[str, str]:
    """Remove an asset from a user's watchlist.
    
    Args:
        user_id: User identifier
        symbol: Asset symbol to remove
        asset_type: Type of asset
        
    Returns:
        Confirmation message
    """
    remove_from_watchlist(user_id, symbol, asset_type)
    return {"message": f"{symbol} removed from {user_id}'s watchlist"}



# Update the research endpoint
@router.get("/research/{symbol}")
async def get_deep_research_analysis(
    symbol: str,
    user_id: str = Query(...),
    asset_type: AssetType = Query(...),
    include_comparison: bool = Query(True),
    include_news: bool = Query(True)
) -> Dict[str, Any]:
    """Get comprehensive research article with embedded tooltips for an asset."""
    try:
        # Get user's expertise level
        expertise_level = get_user_expertise_level(user_id)
        
        # Get user's interest categories
        interests = get_user_interests(user_id)
        
        # Get detailed asset info
        asset_info = get_asset_info(symbol, asset_type)
        
        # Get similar assets for comparison if requested
        similar_assets = []
        if include_comparison:
            similar_assets = get_similar_assets(symbol, asset_type, limit=3)

        # Get user's watchlist for context
        watchlist_items = get_user_watchlists(user_id)
        
        # Get recent news for the asset
        recent_news = fetch_asset_news(symbol, asset_type.value) if include_news else []
        
        # Get topics from user's reading history that are related to this asset
        related_topics = get_related_topics(user_id, symbol, asset_type.value)
        
        # Get narrative research analysis with embedded tooltips
        research = get_interactive_asset_analysis(
            symbol=symbol,
            asset_type=asset_type,
            expertise_level=expertise_level,
            asset_info=asset_info,
            similar_assets=similar_assets,
            user_interests=interests,
            recent_news=recent_news,
            watchlist_items=watchlist_items,
            related_topics=related_topics  # Add related topics
        )

        # Log this research for future personalization
        log_asset_research(user_id, symbol, asset_type.value)
        
        return {
            "symbol": symbol,
            "name": asset_info.get("name", symbol),
            "asset_type": asset_type,
            "current_price": asset_info.get("current_price"),
            "price_change_percent": asset_info.get("price_change_percent"),
            "expertise_level": expertise_level,
            "research_article": research,
            "similar_assets": similar_assets if include_comparison else [],
            "recent_news": recent_news if include_news else [],
            "related_topics": related_topics  # Include in response
        }
        
    except Exception as e:
        logger.error(f"Error generating research analysis: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Research generation failed: {str(e)}")

# @router.post("/add")
# async def add_stock(
#     user_id: str = Query(...),
#     symbol: str = Query(...),
# ) -> Dict[str, str]:
#     """Add a stock to a user's watchlist.
    
#     Args:
#         user_id: User identifier
#         symbol: Stock symbol to add
        
#     Returns:
#         Confirmation message
#     """
#     add_to_watchlist(user_id, symbol)
#     return {"message": f"{symbol} added to {user_id}'s watchlist."}

# @router.delete("/remove")
# async def remove_stock(
#     user_id: str = Query(...),
#     symbol: str = Query(...),
# ) -> Dict[str, str]:
#     """Remove a stock from a user's watchlist.
    
#     Args:
#         user_id: User identifier
#         symbol: Stock symbol to remove
        
#     Returns:
#         Confirmation message
#     """
#     remove_from_watchlist(user_id, symbol)
#     return {"message": f"{symbol} removed from {user_id}'s watchlist."}

# @router.get("")
# async def view_watchlist(user_id: str) -> Dict[str, List[str]]:
#     """Get a user's watchlist.
    
#     Args:
#         user_id: User identifier
        
#     Returns:
#         List of stock symbols in the user's watchlist
#     """
#     symbols = get_user_watchlist(user_id)
#     return {"watchlist": symbols}

# @router.get("/details")
# async def get_watchlist_info(user_id: str) -> Dict[str, List[Dict[str, Any]]]:
#     """Get detailed information about stocks in a user's watchlist.
    
#     Args:
#         user_id: User identifier
        
#     Returns:
#         Detailed information about each stock in the watchlist
#     """
#     symbols = get_user_watchlist(user_id)
#     data = [get_stock_info(s) for s in symbols]
#     return {"data": data}

# @router.get("/research")
# async def get_research(user_id: str) -> Dict[str, Dict[str, str]]:
#     """Get detailed research for stocks in a user's watchlist.
    
#     Args:
#         user_id: User identifier
        
#     Returns:
#         Research information for each stock in the watchlist
#     """
#     symbols = get_user_watchlist(user_id)
#     research = {s: get_deep_research_on_stock(s) for s in symbols}
#     return {"research": research}