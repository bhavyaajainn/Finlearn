"""Asset information services.

This module provides functions for getting information about financial assets.
"""
import yfinance as yf
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from functools import lru_cache

from app.api.models import AssetType
from app.services.ai.perplexity import search_assets_with_perplexity, get_similar_stocks, get_similar_crypto




# Configure logging
logger = logging.getLogger(__name__)

def get_asset_info(symbol: str, asset_type: AssetType) -> Dict[str, Any]:
    """Get detailed information about an asset.
    Args:
        symbol: Asset symbol/ticker
        asset_type: Type of asset (stock, crypto)  
    Returns:
        Detailed asset information
    """
    try:
        # Format symbol properly for YFinance
        if asset_type == AssetType.crypto and not symbol.endswith("-USD"):
            ticker_symbol = f"{symbol}-USD"
        else:
            ticker_symbol = symbol
            
        # Get data from yfinance
        ticker = yf.Ticker(ticker_symbol)
        info = ticker.info
        
        if not info:
            raise ValueError(f"No information found for {symbol}")
        
        # Common data for all asset types
        asset_data = {
            "name": info.get("shortName", info.get("longName", symbol)),
            "current_price": info.get("currentPrice", info.get("regularMarketPrice")),
            "price_change_percent": info.get("regularMarketChangePercent", 0),
            "market_cap": info.get("marketCap"),
            "volume": info.get("volume"),
            "currency": info.get("currency", "USD"),
            "last_updated": datetime.now().isoformat()
        }
        
        # Add asset-specific metrics
        if asset_type == AssetType.stock:
            asset_data.update({
                "pe_ratio": info.get("trailingPE"),
                "eps": info.get("trailingEps"),
                "dividend_yield": info.get("dividendYield"),
                "high_52week": info.get("fiftyTwoWeekHigh"),
                "low_52week": info.get("fiftyTwoWeekLow"),
                "sector": info.get("sector"),
                "industry": info.get("industry"),
                "forward_pe": info.get("forwardPE"),
                "beta": info.get("beta"),
                "avg_volume": info.get("averageVolume"),
                "profit_margins": info.get("profitMargins")
            })
        elif asset_type == AssetType.crypto:
            asset_data.update({
                "volume_24h": info.get("volume24Hr"),
                "circulating_supply": info.get("circulatingSupply"),
                "max_supply": info.get("maxSupply"),
                "change_24h": info.get("regularMarketDayLow"),
                "algorithm": info.get("algorithm"),
                "start_date": info.get("startDate")
            })
        
        return asset_data
        
    except Exception as e:
        raise ValueError(f"Error fetching data for {symbol}: {str(e)}")


@lru_cache(maxsize=100)
def search_assets(
    query: str, 
    asset_type: Optional[AssetType] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Search for assets by name or symbol.
    
    Args:
        query: Search term
        asset_type: Optional filter by asset type
        limit: Maximum number of results
        
    Returns:
        List of matching assets
    """
    # First attempt: Try Yahoo Finance search
    try:
        # This approach uses yfinance's limited search capability
        tickers = yf.Tickers(query)
        results = []
        
        for symbol, ticker in tickers.tickers.items():
            try:
                info = ticker.info
                
                if not info or "regularMarketPrice" not in info:
                    continue
                    
                # Determine if this is a stock or crypto
                security_type = info.get("quoteType", "")
                
                if security_type == "CRYPTOCURRENCY":
                    current_asset_type = AssetType.crypto
                else:
                    current_asset_type = AssetType.stock
                
                # Skip if we're filtering by asset type and this doesn't match
                if asset_type and asset_type != current_asset_type:
                    continue
                
                results.append({
                    "symbol": symbol,
                    "asset_type": current_asset_type,
                    "name": info.get("shortName", info.get("longName", symbol)),
                    "current_price": info.get("currentPrice", info.get("regularMarketPrice")),
                    "change_percent": info.get("regularMarketChangePercent", 0),
                    "market_cap": info.get("marketCap"),
                    "volume": info.get("volume")
                })
                
                if len(results) >= limit:
                    break
            except:
                continue
        
        # If we got enough results, return them
        if results and len(results) >= min(limit, 3):
            return results[:limit]
    except Exception as e:
        logger.warning(f"Yahoo Finance search failed: {e}")
    
    # Second attempt: Use Perplexity for better search results
    logger.info("Falling back to Perplexity for asset search")
    asset_type_str = asset_type.value if asset_type else None
    perplexity_results = search_assets_with_perplexity(query, asset_type_str, limit)
    
    if perplexity_results is None:
        return []
    # Enrich Perplexity results with accurate Yahoo Finance data where possible
    enriched_results = []
    for result in perplexity_results[:limit]:
        symbol = result.get("symbol")
        result_asset_type = result.get("asset_type")
        
        if symbol and result_asset_type:
            # Try to get accurate financial data from Yahoo Finance
            try:
                ticker_symbol = symbol
                if result_asset_type == "crypto" and not ticker_symbol.endswith("-USD"):
                    ticker_symbol = f"{symbol}-USD"
                
                ticker = yf.Ticker(ticker_symbol)
                info = ticker.info
                
                if info and "regularMarketPrice" in info:
                    # Use exact numerical values from Yahoo Finance
                    result["current_price"] = info.get("currentPrice", info.get("regularMarketPrice"))
                    result["change_percent"] = info.get("regularMarketChangePercent", 0)
                    result["market_cap"] = info.get("marketCap")
                    result["volume"] = info.get("volume")
                    
                    # Add data source indicator
                    result["data_source"] = "yahoo_finance"
                else:
                    # Keep Perplexity's estimate but mark it
                    result["data_source"] = "perplexity_estimate"
            except:
                # Keep Perplexity's estimate but mark it
                result["data_source"] = "perplexity_estimate"
        
        enriched_results.append(result)
    
    return enriched_results


def get_similar_assets(symbol: str, asset_type: AssetType, limit: int = 3) -> List[Dict[str, Any]]:
    """Get similar assets based on type, sector, or characteristics.
    
    Args:
        symbol: Asset symbol
        asset_type: Type of asset
        limit: Maximum number of similar assets to return
        
    Returns:
        List of similar assets with reasons
    """
    if asset_type == AssetType.stock:
        return get_similar_stocks(symbol, limit)
    elif asset_type == AssetType.crypto:
        return get_similar_crypto(symbol, limit)
    return []







"""Stock data service.

This module provides functions to retrieve and process stock market data
from external providers like Yahoo Finance.
"""
import logging
from typing import Dict, Any, List, Optional, Tuple
import yfinance as yf
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def get_stock_info(symbol: str) -> Dict[str, Any]:
    """Get basic information about a stock.
    Args:
        symbol: The stock ticker symbol (e.g., 'AAPL') 
    Returns:
        Dictionary containing stock information
    Raises:
        ValueError: If the stock symbol is invalid
    """
    try:
        stock = yf.Ticker(symbol)
        data = stock.info
        
        return {
            "symbol": symbol,
            "name": data.get("shortName"),
            "price": data.get("currentPrice"),
            "change": data.get("regularMarketChangePercent"),
            "marketCap": data.get("marketCap"),
            "sector": data.get("sector"),
            "industry": data.get("industry"),
            "pe_ratio": data.get("forwardPE"),
            "dividend_yield": data.get("dividendYield"),
            "summary": data.get("longBusinessSummary")
        }
    except Exception as e:
        logger.error(f"Error fetching stock info for {symbol}: {e}")
        raise ValueError(f"Unable to retrieve information for {symbol}")
    

def search_stocks(query: str) -> List[Dict[str, str]]:
    """Search for stocks by name or symbol.
    Args:
        query: Search term (company name or partial symbol)
    Returns:
        List of matching stocks with basic info
    """
    try:
        # This is a simple implementation - in production you might
        # want to use a more sophisticated search API
        tickers = yf.Tickers(query)
        results = []
        
        for symbol in tickers.tickers:
            try:
                info = tickers.tickers[symbol].info
                results.append({
                    "symbol": symbol,
                    "name": info.get("shortName", "Unknown"),
                    "exchange": info.get("exchange", "Unknown")
                })
            except:
                # Skip tickers that fail to fetch
                pass
                
        return results
    except Exception as e:
        logger.error(f"Error searching stocks with query '{query}': {e}")
        return []