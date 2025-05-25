"""Watchlist routes.

This module provides endpoints for managing user watchlists.
"""
import asyncio
from datetime import datetime
import time
from fastapi import APIRouter, Query, Depends, HTTPException
from typing import List, Dict, Any, Optional
import logging

from app.services.firebase.cache import cache_research_article, get_asset_comparison_cache, get_asset_current_price, get_cached_research, store_asset_comparison_cache  # Add standard Python logging instead

# Create a logger instance for this module
logger = logging.getLogger(__name__)


from app.services.assets.data import fast_search_assets, get_asset_info, get_asset_info_async, get_similar_assets, get_similar_assets_async, get_similar_assets_with_retry
from app.services.firebase import add_to_watchlist, remove_from_watchlist
from app.services.ai.perplexity import fetch_asset_news, generate_asset_comparison, get_interactive_asset_analysis
from app.api.models import AssetType, AddAssetRequest, SearchRequest
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
    start_time = time.time()
    
    # Get user's watchlist items from Firebase
    watchlist_items = get_user_watchlists(user_id, asset_type)
    
    if not watchlist_items:
        return {"watchlist": [], "message": "Watchlist is empty"}
    
    logger.info(f"Retrieved {len(watchlist_items)} watchlist items for user {user_id}")
    
    # Group assets by type for batch processing
    stocks = []
    cryptos = []
    other_assets = []
    
    for item in watchlist_items:
        asset_type_value = item["asset_type"].value if hasattr(item["asset_type"], "value") else item["asset_type"]
        if asset_type_value.lower() == "stock":
            stocks.append(item)
        elif asset_type_value.lower() == "crypto":
            cryptos.append(item)
        else:
            other_assets.append(item)
    
    # Create tasks for parallel execution
    tasks = []
    
    # Process all assets in parallel
    for item in watchlist_items:
        tasks.append(
            asyncio.create_task(
                get_asset_info_async(item["symbol"], item["asset_type"])
            )
        )
    
    # If including similar assets, add those tasks too
    similar_asset_tasks = []
    if include_similar:
        for item in watchlist_items:
            similar_asset_tasks.append(
                asyncio.create_task(
                    get_similar_assets_async(item["symbol"], item["asset_type"], 3)
                )
            )
    
    # Execute all asset info tasks in parallel
    asset_info_results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Execute similar asset tasks if requested
    similar_asset_results = []
    if include_similar:
        similar_asset_results = await asyncio.gather(*similar_asset_tasks, return_exceptions=True)
    
    # Combine results with watchlist items
    enriched_items = []
    
    for i, item in enumerate(watchlist_items):
        try:
            # Get the corresponding asset info result
            asset_info = asset_info_results[i]
            
            # Skip if we got an exception instead of data
            if isinstance(asset_info, Exception):
                logger.warning(f"Error fetching info for {item['symbol']}: {str(asset_info)}")
                enriched_items.append({
                    "symbol": item["symbol"],
                    "asset_type": item["asset_type"],
                    "name": item["symbol"],
                    "error": str(asset_info),
                    "added_on": item.get("added_on"),
                    "notes": item.get("notes", "")
                })
                continue
            
            # Merge watchlist metadata with asset info
            asset_data = {
                **item,
                **asset_info,
                "added_on": item.get("added_on"),
                "notes": item.get("notes", "")
            }
            
            # Add similar assets if requested
            if include_similar and i < len(similar_asset_results):
                similar_assets = similar_asset_results[i]
                if not isinstance(similar_assets, Exception):
                    asset_data["similar_assets"] = similar_assets
            
            enriched_items.append(asset_data)
            
        except Exception as e:
            # If there's an error getting data for this asset, include basic info
            logger.error(f"Error processing watchlist item {item['symbol']}: {str(e)}")
            enriched_items.append({
                "symbol": item["symbol"],
                "asset_type": item["asset_type"],
                "name": item["symbol"],
                "error": str(e),
                "added_on": item.get("added_on"),
                "notes": item.get("notes", "")
            })
    
    end_time = time.time()
    logger.info(f"Watchlist for user {user_id} generated in {end_time - start_time:.2f} seconds")
    
    return {
        "watchlist": enriched_items,
        "count": len(enriched_items),
    }

@router.post("/search")
async def search_for_assets(
    search_request: SearchRequest
) -> Dict[str, Any]:
    """Search for assets by name or symbol.
    
    Args:
        search_request: Search parameters
        
    Returns:
        List of matching assets with minimal info for fast display
    """
    # Make search string non-empty and meaningful
    query = search_request.query.strip()
    if not query or len(query) < 2:
        return {
            "results": [],
            "count": 0,
            "query": query,
            "error": "Search query must be at least 2 characters"
        }
    
    try:
        # Convert the search to async
        results = await asyncio.to_thread(
            fast_search_assets,
            query=query,
            asset_type=search_request.asset_type,
            limit=search_request.limit or 10
        )
        
        return {
            "results": results,
            "count": len(results),
            "query": query
        }
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return {
            "results": [],
            "count": 0,
            "query": query,
            "error": str(e)
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
        # First search to get correct data
        search_results = await asyncio.to_thread(
            fast_search_assets,
            query=asset.symbol, 
            asset_type=asset.asset_type,
            limit=2
        )
        
        # Use first search result if available
        asset_info = None
        for result in search_results:
            if result.get("symbol", "").upper() == asset.symbol.upper():
                asset_info = result
                break
        
        # If no exact match found, use first result or fallback to get_asset_info
        if not asset_info:
            if search_results:
                asset_info = search_results[0]  # Use first result as fallback
            else:
                # If search found nothing, try original method
                asset_info = get_asset_info(asset.symbol, asset.asset_type)
        
        # Add to Firebase with current timestamp
        add_to_watchlist(
            user_id=user_id,
            symbol=asset.symbol,
            asset_type=asset.asset_type,
            notes=asset.notes
        )
        
        # Return with search-consistent data
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
        logger.error(f"Error adding asset to watchlist: {str(e)}")
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
    include_news: bool = Query(True),
    refresh: bool = Query(False)  # Add refresh parameter
) -> Dict[str, Any]:
    """Get comprehensive research article with embedded tooltips for an asset."""
    try:
        # First check cache unless refresh is requested
        expertise_level = None
        cached_research = None
        
        if not refresh:
            # Quick check for expertise level (needed for cache key)
            expertise_level = get_user_expertise_level(user_id)
            cached_research = get_cached_research(symbol, asset_type.value, expertise_level)
            
            if cached_research:
                # Get basic asset info for price/name updates
                asset_info = get_asset_info(symbol, asset_type)
                
                # Return cached research with updated price
                return {
                    "symbol": symbol,
                    "name": asset_info.get("name", symbol),
                    "asset_type": asset_type,
                    "current_price": asset_info.get("current_price"),
                    "price_change_percent": asset_info.get("price_change_percent"),
                    "expertise_level": expertise_level,
                    "research_article": cached_research,
                    "from_cache": True,
                    "cache_age": "< 24 hours"
                }
        
        # If not cached or refresh requested, gather all required data in parallel
        if not expertise_level:
            expertise_level = get_user_expertise_level(user_id)
        
        # Create tasks for parallel execution
        tasks = [
            asyncio.to_thread(get_user_interests, user_id),
            asyncio.to_thread(get_asset_info, symbol, asset_type),
            asyncio.to_thread(get_user_watchlists, user_id),
            asyncio.to_thread(get_related_topics, user_id, symbol, asset_type.value)
        ]
        
        # Add optional tasks
        if include_comparison:
            tasks.append(asyncio.to_thread(get_similar_assets, symbol, asset_type, 3))
        if include_news:
            tasks.append(asyncio.to_thread(fetch_asset_news, symbol, asset_type.value))
        
        # Execute all tasks in parallel
        results = await asyncio.gather(*tasks)
        
        # Extract results
        interests = results[0]
        asset_info = results[1]
        watchlist_items = results[2]
        related_topics = results[3]
        
        # Extract optional results
        idx = 4
        similar_assets = results[idx] if include_comparison else []
        if include_comparison:
            idx += 1
        recent_news = results[idx] if include_news else []
        
        # Generate research (most time-consuming operation)
        research = get_interactive_asset_analysis(
            symbol=symbol,
            asset_type=asset_type,
            expertise_level=expertise_level,
            asset_info=asset_info,
            similar_assets=similar_assets,
            user_interests=interests,
            recent_news=recent_news,
            watchlist_items=watchlist_items,
            related_topics=related_topics
        )
        
        # Cache the research result
        asyncio.create_task(
            asyncio.to_thread(
                cache_research_article,
                symbol,
                asset_type.value,
                expertise_level,
                research
            )
        )
        
        # Log in background without blocking response
        asyncio.create_task(
            asyncio.to_thread(
                log_asset_research,
                user_id,
                symbol,
                asset_type.value
            )
        )
        
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
            "related_topics": related_topics
        }
        
    except Exception as e:
        logger.error(f"Error generating research analysis: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Research generation failed: {str(e)}")


@router.get("/asset/{symbol}")
async def get_basic_asset_data(
    symbol: str,
    user_id: str = Query(...),
    asset_type: AssetType = Query(...)
) -> Dict[str, Any]:
    """Get basic asset information quickly without analysis."""
    try:
        # Fast data retrieval for immediate display
        tasks = [
            asyncio.to_thread(get_asset_info, symbol, asset_type),
            asyncio.to_thread(get_user_expertise_level, user_id),
        ]
        results = await asyncio.gather(*tasks)
        
        asset_info = results[0]
        expertise_level = results[1]
        
        return {
            "symbol": symbol,
            "name": asset_info.get("name", symbol),
            "asset_type": asset_type,
            "current_price": asset_info.get("current_price"),
            "price_change_percent": asset_info.get("price_change_percent"),
            "expertise_level": expertise_level,
            "loading_status": {
                "asset_loaded": True,
                "analysis_loaded": False,
                "related_loaded": False
            }
        }
    except Exception as e:
        logger.error(f"Error fetching basic asset data: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to get asset data: {str(e)}")


@router.get("/analysis/{symbol}")
async def get_asset_analysis(
    symbol: str,
    user_id: str = Query(...),
    asset_type: AssetType = Query(...),
    refresh: bool = Query(False)
) -> Dict[str, Any]:
    """Get comprehensive research analysis for an asset."""
    try:
        expertise_level = get_user_expertise_level(user_id)
        
        # Check cache first
        if not refresh:
            cached_research = get_cached_research(symbol, asset_type.value, expertise_level)
            if cached_research:
                return {
                    "research_article": cached_research,
                    "from_cache": True,
                    "cache_age": "< 24 hours"
                }
        
        # Gather required data
        tasks = [
            asyncio.to_thread(get_user_interests, user_id),
            asyncio.to_thread(get_asset_info, symbol, asset_type),
            asyncio.to_thread(get_user_watchlists, user_id),
        ]
        
        results = await asyncio.gather(*tasks)
        interests = results[0]
        asset_info = results[1]
        watchlist_items = results[2]
        
        # Generate analysis (the time-consuming part)
        research = get_interactive_asset_analysis(
            symbol=symbol,
            asset_type=asset_type,
            expertise_level=expertise_level,
            asset_info=asset_info,
            user_interests=interests,
            watchlist_items=watchlist_items,
            # No similar assets or news here
            similar_assets=[],
            recent_news=[],
            related_topics=[]
        )
        
        # Cache and log in background
        asyncio.create_task(
            asyncio.to_thread(cache_research_article, symbol, asset_type.value, expertise_level, research)
        )
        asyncio.create_task(
            asyncio.to_thread(log_asset_research, user_id, symbol, asset_type.value)
        )
        
        return {
            "research_article": research,
            "from_cache": False
        }
    except Exception as e:
        logger.error(f"Error generating analysis: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Analysis generation failed: {str(e)}")
    

@router.get("/related/{symbol}")
async def get_related_content(
    symbol: str,
    user_id: str = Query(...),
    asset_type: AssetType = Query(...),
    include_comparison: bool = Query(True),
    refresh: bool = Query(False)  # Add refresh parameter to force new data
) -> Dict[str, Any]:
    """Get similar assets, news, and recommendations with expertise-based comparison."""
    try:
        # First get user expertise level for cache key
        expertise_level = await asyncio.to_thread(get_user_expertise_level, user_id)
        
        # Check cache first (unless refresh is requested)
        if not refresh:
            cache_key = f"related_{symbol}_{asset_type.value}_{expertise_level}"
            cached_data = await asyncio.to_thread(get_asset_comparison_cache, cache_key)
            
            if cached_data:
                # Get just the current price for real-time data
                current_price_info = await asyncio.to_thread(
                    get_asset_current_price, symbol, asset_type
                )
                
                # Update the cached data with fresh price
                if current_price_info and "asset_info" in cached_data:
                    cached_data["asset_info"]["current_price"] = current_price_info.get("current_price")
                    cached_data["asset_info"]["price_change_percent"] = current_price_info.get("price_change_percent")
                
                # Add cache metadata
                cached_data["from_cache"] = True
                return cached_data
        
        # If cache miss or refresh requested, get all data
        # Run all related content tasks in parallel
        tasks = [
            asyncio.to_thread(get_asset_info, symbol, asset_type),
            get_similar_assets_with_retry(symbol, asset_type, 3),
            asyncio.to_thread(fetch_asset_news, symbol, asset_type.value),
        ]
        
        results = await asyncio.gather(*tasks)
        asset_info = results[0]
        similar_assets = results[1]
        recent_news = results[2]
        
        # # Generate comparison analysis if requested and similar assets exist
        # comparison_analysis = None
        # if include_comparison and similar_assets:
        #     comparison_analysis = await asyncio.to_thread(
        #         generate_asset_comparison,
        #         asset_info,
        #         similar_assets,
        #         expertise_level
        #     )
        
        # Prepare response data
        response_data = {
            "asset_info": {
                "symbol": symbol,
                "name": asset_info.get("name", symbol),
                "asset_type": asset_type.value,
                "current_price": asset_info.get("current_price"),
                "price_change_percent": asset_info.get("price_change_percent")
            },
            "similar_assets": similar_assets,
            "recent_news": recent_news,
            "expertise_level": expertise_level,
            "from_cache": False
        }
        
        # Store in cache (in background)
        cache_key = f"related_{symbol}_{asset_type.value}_{expertise_level}"
        asyncio.create_task(
            asyncio.to_thread(
                store_asset_comparison_cache, 
                cache_key, 
                response_data,
                60 * 60 * 24 * 7  # 7 days TTL
            )
        )
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error fetching related content: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Failed to get related content: {str(e)}")