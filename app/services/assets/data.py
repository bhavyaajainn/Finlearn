"""Asset information services.

This module provides functions for getting information about financial assets.
"""
import asyncio
import requests
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


######- new - #####

import requests
import yfinance as yf
from functools import lru_cache
import time
from typing import List, Dict, Any, Optional
import logging
from concurrent.futures import ThreadPoolExecutor


logger = logging.getLogger(__name__)

# Cache for search results with TTL
SEARCH_CACHE = {}
CACHE_TTL = 300  # 5 minutes in seconds

# CoinGecko API endpoints
COINGECKO_SEARCH_URL = "https://api.coingecko.com/api/v3/search"
COINGECKO_COINS_URL = "https://api.coingecko.com/api/v3/coins/markets"

def fast_search_assets(
    query: str, 
    asset_type: Optional[Any] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Fast asset search optimized for speed.
    
    Args:
        query: Search term
        asset_type: Optional filter by asset type
        limit: Maximum number of results
        
    Returns:
        List of matching assets with minimal info
    """
    start_time = time.time()
    query = query.strip().lower()
    
    # Return empty results for empty queries
    if not query or len(query) < 2:
        return []
    
    # Check cache first
    cache_key = f"search_{query}_{asset_type}_{limit}"
    current_time = time.time()
    if cache_key in SEARCH_CACHE:
        cached_time, results = SEARCH_CACHE[cache_key]
        if current_time - cached_time < CACHE_TTL:
            logger.info(f"Returning cached search results for '{query}'")
            return results
    
    asset_type_str = asset_type.value if hasattr(asset_type, 'value') else str(asset_type)
    
    try:
        if asset_type_str.lower() == "crypto":
            # Use CoinGecko API for crypto searches
            results = search_crypto_with_coingecko(query, limit)
        else:
            # Use Yahoo Finance for stocks and other asset types
            results = search_with_yahoo_finance(query, asset_type_str, limit)
        
        # Cache the results
        SEARCH_CACHE[cache_key] = (current_time, results)
        
        end_time = time.time()
        search_time = end_time - start_time
        logger.info(f"Search for '{query}' completed in {search_time:.3f} seconds, found {len(results)} results")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in fast search: {str(e)}")
        end_time = time.time()
        logger.error(f"Failed search took {end_time - start_time:.2f} seconds")
        return []

def search_crypto_with_coingecko(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search for cryptocurrencies using CoinGecko API.
    
    Args:
        query: Search query string
        limit: Maximum number of results
        
    Returns:
        List of cryptocurrencies matching the query
    """
    try:
        # Set a shorter timeout for better user experience
        response = requests.get(
            COINGECKO_SEARCH_URL,
            params={"query": query},
            timeout=2.5  # Short timeout to keep search fast
        )
        
        if response.status_code != 200:
            logger.warning(f"CoinGecko API returned status {response.status_code}")
            return []
            
        data = response.json()
        coins = data.get('coins', [])
        
        # Get the top matches
        top_coins = coins[:min(limit*2, 20)]  # Fetch a few extra for processing
        
        # For the top matches, fetch current prices in a single efficient batch request
        if top_coins:
            coin_ids = [coin['id'] for coin in top_coins]
            coin_id_str = ','.join(coin_ids)
            
            try:
                price_response = requests.get(
                    COINGECKO_COINS_URL,
                    params={
                        "ids": coin_id_str,
                        "vs_currency": "usd",
                        "per_page": len(coin_ids),
                        "page": 1
                    },
                    timeout=2.5
                )
                
                if price_response.status_code == 200:
                    price_data = {coin['id']: coin for coin in price_response.json()}
                else:
                    price_data = {}
            except Exception as e:
                logger.warning(f"Failed to fetch prices from CoinGecko: {str(e)}")
                price_data = {}
        else:
            price_data = {}
        
        # Format the results
        results = []
        for coin in top_coins:
            # Get price data if available
            coin_price_data = price_data.get(coin['id'], {})
            current_price = coin_price_data.get('current_price')
            price_change = coin_price_data.get('price_change_percentage_24h')
            
            # Yahoo-compatible symbol format
            yahoo_symbol = f"{coin['symbol'].upper()}-USD"
            
            results.append({
                "symbol": coin['symbol'].upper(),
                "yahoo_symbol": yahoo_symbol,  # For compatibility with YFinance
                "name": coin['name'],
                "asset_type": "crypto",
                "market_cap_rank": coin.get('market_cap_rank'),
                "current_price": current_price,
                "price_change_percent": price_change,
                "thumbnail": coin.get('large'),  # Coin image URL
                "id": coin['id']  # Save CoinGecko ID for later use
            })
        
        # Limit results
        return results[:limit]
        
    except Exception as e:
        logger.error(f"Error searching cryptocurrencies via CoinGecko: {str(e)}")
        return []

def search_with_yahoo_finance(query: str, asset_type_str: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search for assets using Yahoo Finance's direct search API.
    
    Args:
        query: Search query string
        asset_type_str: Type of asset to filter by
        limit: Maximum number of results
        
    Returns:
        List of assets matching the query
    """
    try:
        # First, try Yahoo Finance's direct search API - much more reliable
        url = "https://query2.finance.yahoo.com/v1/finance/search"
        params = {
            "q": query,
            "quotesCount": limit * 2,  # Request extra to allow for filtering
            "newsCount": 0,
            "enableFuzzyQuery": True
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=3)
        if response.status_code != 200:
            logger.warning(f"Yahoo Finance search API returned status {response.status_code}")
            # Continue to fallback method
        else:
            data = response.json()
            quotes = data.get("quotes", [])
            
            results = []
            for item in quotes:
                # Extract asset type from quote type
                quote_type = item.get("quoteType", "").upper()
                exchange = item.get("exchange", "")
                
                if quote_type == "EQUITY":
                    item_type = "stock"
                elif quote_type == "CRYPTOCURRENCY" or exchange == "CCC":
                    item_type = "crypto"
                elif quote_type == "ETF":
                    item_type = "etf"
                else:
                    item_type = "other"
                
                # Filter by asset type if specified
                if asset_type_str.lower() != "all" and asset_type_str.lower() != item_type:
                    continue
                
                # Create result object
                result = {
                    "symbol": item.get("symbol", ""),
                    "name": item.get("shortname", "") or item.get("longname", ""),
                    "exchange": exchange,
                    "asset_type": item_type,
                    "score": item.get("score", 0)  # Yahoo's relevance score
                }
                
                # Only add if both symbol and name are valid
                if result["symbol"] and result["name"]:
                    results.append(result)
                
                if len(results) >= limit:
                    break
            
            # If we found results through Yahoo's API, return them
            if results:
                # Fetch prices for the first few results
                if len(results) <= 5:
                    with ThreadPoolExecutor(max_workers=5) as executor:
                        # Use a more reliable price fetching method
                        def get_price(symbol):
                            try:
                                ticker = yf.Ticker(symbol)
                                hist = ticker.history(period="1d")
                                if not hist.empty:
                                    return symbol, round(float(hist["Close"].iloc[-1]), 2)
                                return symbol, None
                            except Exception:
                                return symbol, None
                        
                        futures = {executor.submit(get_price, item["symbol"]): item for item in results}
                        for future in futures:
                            try:
                                symbol, price = future.result()
                                if price is not None:
                                    item = next(item for item in results if item["symbol"] == symbol)
                                    item["current_price"] = price
                            except Exception:
                                pass
                
                return results
        
        # If we get here, the Yahoo Finance API didn't return usable results
        # Try using the Financial Modeling Prep API as a fallback
        return search_with_financial_modeling_prep(query, asset_type_str, limit)
        
    except Exception as e:
        logger.error(f"Error in Yahoo Finance search: {str(e)}")
        # Try to fall back to another API
        return search_with_financial_modeling_prep(query, asset_type_str, limit)

def search_with_financial_modeling_prep(query: str, asset_type_str: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search for stocks using Financial Modeling Prep API.
    
    Note: For full functionality, this requires an API key from https://financialmodelingprep.com/
    The free tier allows for limited usage.
    
    Args:
        query: Search query
        asset_type_str: Type of asset to search for
        limit: Maximum number of results
        
    Returns:
        List of matching stocks
    """
    # You can get a free API key from https://financialmodelingprep.com/developer/docs/
    # For testing purposes, we're using a limited functionality approach
    try:
        # FMP offers a free ticker search endpoint
        url = "https://financialmodelingprep.com/api/v3/search"
        params = {
            "query": query,
            "limit": limit,
            "exchange": "NASDAQ,NYSE,AMEX,TSX"  # Major US and Canadian exchanges
            # Add your API key here for production
            # "apikey": "YOUR_API_KEY"
        }
        
        response = requests.get(url, params=params, timeout=3)
        
        if response.status_code != 200:
            logger.warning(f"FMP API returned status {response.status_code}")
            return search_with_alpha_vantage(query, asset_type_str, limit)
            
        data = response.json()
        
        # Filter by asset type
        results = []
        for item in data:
            # FMP primarily focuses on stocks, ETFs and mutual funds
            exchange = item.get("exchangeShortName", "").upper()
            symbol = item.get("symbol", "")
            name = item.get("name", "")
            
            # Skip if we don't have both symbol and name
            if not symbol or not name:
                continue
                
            # Determine asset type
            if "FUND" in exchange or "ETF" in exchange:
                item_type = "etf"
            else:
                item_type = "stock"
            
            # Filter by asset type
            if asset_type_str.lower() != "all" and asset_type_str.lower() != item_type:
                continue
                
            results.append({
                "symbol": symbol,
                "name": name,
                "exchange": exchange,
                "asset_type": item_type,
                "currency": item.get("currency", "USD")
            })
            
            if len(results) >= limit:
                break
                
        # If we have results, try to get current prices
        if results and len(results) <= 5:
            symbols = [item["symbol"] for item in results]
            try:
                # Use batch download for efficiency
                prices = yf.download(symbols, period="1d", group_by="ticker", progress=False)
                
                for item in results:
                    symbol = item["symbol"]
                    try:
                        if len(symbols) > 1:
                            price = prices[symbol]['Close'].iloc[-1]
                        else:
                            price = prices['Close'].iloc[-1]
                        item["current_price"] = round(float(price), 2)
                    except Exception:
                        pass
            except Exception as e:
                logger.debug(f"Error fetching batch prices: {str(e)}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in FMP search: {str(e)}")
        return search_with_alpha_vantage(query, asset_type_str, limit)

def search_with_alpha_vantage(query: str, asset_type_str: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search for stocks using Alpha Vantage API as a last resort.
    
    Note: Requires an API key from https://www.alphavantage.co/
    
    Args:
        query: Search query
        asset_type_str: Type of asset to search for
        limit: Maximum number of results
        
    Returns:
        List of matching stocks
    """
    try:
        # Alpha Vantage has a symbol search endpoint
        # You can get a free API key at https://www.alphavantage.co/support/#api-key
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "SYMBOL_SEARCH",
            "keywords": query,
            # Add your API key here for production
            # "apikey": "YOUR_API_KEY"
        }
        
        # Note: Without an API key, this endpoint will be rate limited or may not work
        response = requests.get(url, params=params, timeout=3)
        
        if response.status_code != 200:
            logger.warning(f"Alpha Vantage API returned status {response.status_code}")
            return []
            
        data = response.json()
        matches = data.get("bestMatches", [])
        
        results = []
        for item in matches:
            # Alpha Vantage provides type information
            item_type = item.get("3. type", "").lower()
            
            # Map Alpha Vantage types to our types
            if item_type == "equity":
                asset_item_type = "stock"
            elif item_type == "etf":
                asset_item_type = "etf"
            else:
                asset_item_type = "other"
            
            # Filter by type if needed
            if asset_type_str.lower() != "all" and asset_type_str.lower() != asset_item_type:
                continue
                
            symbol = item.get("1. symbol", "")
            name = item.get("2. name", "")
            
            if symbol and name:
                results.append({
                    "symbol": symbol,
                    "name": name,
                    "exchange": item.get("4. region", ""),
                    "asset_type": asset_item_type,
                    "currency": item.get("8. currency", "USD"),
                    "match_score": float(item.get("9. matchScore", 0))
                })
            
            if len(results) >= limit:
                break
                
        # If we have results, try to get current prices
        if results and len(results) <= 5:
            symbols = [item["symbol"] for item in results]
            try:
                if len(symbols) == 1:
                    ticker = yf.Ticker(symbols[0])
                    data = ticker.history(period="1d")
                    if not data.empty:
                        results[0]["current_price"] = round(float(data["Close"].iloc[-1]), 2)
                else:
                    prices = yf.download(symbols, period="1d", group_by="ticker", progress=False)
                    for i, symbol in enumerate(symbols):
                        try:
                            if len(symbols) > 1:
                                price = prices[symbol]['Close'].iloc[-1]
                            else:
                                price = prices['Close'].iloc[-1]
                            results[i]["current_price"] = round(float(price), 2)
                        except Exception:
                            pass
            except Exception as e:
                logger.debug(f"Error fetching prices: {str(e)}")
        
        return results
        
    except Exception as e:
        logger.error(f"Error in Alpha Vantage search: {str(e)}")
        return []



# Asset info cache with TTL
ASSET_INFO_CACHE = {}
ASSET_INFO_CACHE_TTL = 300  # 5 minutes

def get_asset_info(symbol: str, asset_type: Any) -> Dict[str, Any]:
    """Get detailed information about an asset.
    
    Args:
        symbol: Asset symbol
        asset_type: Type of asset
        
    Returns:
        Asset information including price, metrics, etc.
    """
    start_time = time.time()
    
    # Normalize inputs for caching
    symbol = symbol.upper().strip()
    asset_type_str = asset_type.value if hasattr(asset_type, 'value') else str(asset_type)
    
    # Check cache first
    cache_key = f"asset_info_{symbol}_{asset_type_str}"
    current_time = time.time()
    if cache_key in ASSET_INFO_CACHE:
        cached_time, data = ASSET_INFO_CACHE[cache_key]
        if current_time - cached_time < ASSET_INFO_CACHE_TTL:
            logger.debug(f"Returning cached asset info for {symbol}")
            return data
    
    try:
        # Process based on asset type
        if asset_type_str.lower() == "crypto":
            # Use CoinGecko for crypto assets
            data = get_crypto_info(symbol)
        else:
            # Use Yahoo Finance for stocks and other assets
            data = get_stock_info_yfinance(symbol)
        
        # Add asset type to returned data
        data["asset_type"] = asset_type_str
        
        # Cache the result
        ASSET_INFO_CACHE[cache_key] = (current_time, data)
        
        end_time = time.time()
        logger.debug(f"Retrieved asset info for {symbol} in {end_time - start_time:.3f} seconds")
        
        return data
        
    except Exception as e:
        logger.error(f"Error getting asset info for {symbol}: {str(e)}")
        # Return minimal information on error to avoid breaking the app
        return {
            "symbol": symbol,
            "name": symbol,
            "asset_type": asset_type_str,
            "error": str(e)
        }

def get_stock_info_yfinance(symbol: str) -> Dict[str, Any]:
    """Get stock information using yfinance.
    
    Args:
        symbol: Stock symbol
        
    Returns:
        Stock information dictionary
    """
    try:
        ticker = yf.Ticker(symbol)
        
        # Get price data (most critical)
        hist = ticker.history(period="2d")
        
        if hist.empty:
            raise ValueError(f"No price data found for {symbol}")
        
        # Calculate current price and change
        current_price = round(float(hist['Close'].iloc[-1]), 2)
        
        # Calculate price change if we have at least 2 days of data
        if len(hist) >= 2:
            prev_close = float(hist['Close'].iloc[-2])
            price_change = round(current_price - prev_close, 2)
            price_change_percent = round((price_change / prev_close) * 100, 2)
        else:
            price_change = 0
            price_change_percent = 0
        
        # Get basic info non-blocking
        info = {}
        try:
            # Use a shorter timeout for info to prevent slow responses
            info = ticker.info
        except Exception as e:
            logger.warning(f"Could not fetch detailed info for {symbol}: {str(e)}")
        
        # Build response with essential data
        result = {
            "symbol": symbol,
            "name": info.get("shortName", info.get("longName", symbol)),
            "current_price": current_price,
            "price_change": price_change,
            "price_change_percent": price_change_percent,
            "currency": info.get("currency", "USD"),
            "exchange": info.get("exchange", ""),
            "sector": info.get("sector", ""),
            "industry": info.get("industry", "")
        }
        
        # Add market cap if available
        if "marketCap" in info and info["marketCap"]:
            result["market_cap"] = info["marketCap"]
        
        return result
        
    except Exception as e:
        logger.error(f"Error in get_stock_info_yfinance for {symbol}: {str(e)}")
        raise

def get_crypto_info(symbol: str) -> Dict[str, Any]:
    """Get cryptocurrency information using CoinGecko.
    
    Args:
        symbol: Cryptocurrency symbol (e.g., BTC)
        
    Returns:
        Cryptocurrency information dictionary
    """
    try:
        # Clean up symbol
        symbol = symbol.upper().replace("-USD", "").strip()
        
        # Set up CoinGecko API call
        url = "https://api.coingecko.com/api/v3/coins/markets"
        params = {
            "vs_currency": "usd",
            "ids": "",  # We'll try to match by symbol since id is challenging
            "per_page": 100,
            "page": 1,
            "sparkline": False,
            "price_change_percentage": "24h"
        }
        
        # Try to get all coins then filter by symbol
        response = requests.get(url, params=params, timeout=3)
        
        if response.status_code != 200:
            raise ValueError(f"CoinGecko API returned status {response.status_code}")
            
        coins = response.json()
        
        # Find the matching coin by symbol
        coin = None
        for c in coins:
            if c["symbol"].upper() == symbol:
                coin = c
                break
        
        if not coin:
            raise ValueError(f"Could not find cryptocurrency with symbol {symbol}")
        
        # Extract relevant data
        return {
            "symbol": symbol,
            "name": coin["name"],
            "current_price": coin["current_price"],
            "price_change": coin["price_change_24h"],
            "price_change_percent": coin["price_change_percentage_24h"],
            "market_cap": coin["market_cap"],
            "currency": "USD",
            "image": coin["image"],
            "market_cap_rank": coin["market_cap_rank"]
        }
        
    except Exception as e:
        logger.error(f"Error in get_crypto_info for {symbol}: {str(e)}")
        raise



async def get_asset_info_async(symbol: str, asset_type: Any) -> Dict[str, Any]:
    """Async wrapper for get_asset_info to be used with asyncio.
    
    Args:
        symbol: Asset symbol
        asset_type: Type of asset
        
    Returns:
        Asset information dictionary
    """
    return await asyncio.to_thread(get_asset_info, symbol, asset_type)

async def get_similar_assets_async(symbol: str, asset_type: Any, limit: int = 3) -> List[Dict[str, Any]]:
    """Async wrapper for get_similar_assets to be used with asyncio.
    
    Args:
        symbol: Asset symbol
        asset_type: Type of asset
        limit: Maximum number of similar assets
        
    Returns:
        List of similar assets
    """
    return await asyncio.to_thread(get_similar_assets, symbol, asset_type, limit)

# """Stock data service.

# This module provides functions to retrieve and process stock market data
# from external providers like Yahoo Finance.
# """
# import logging
# from typing import Dict, Any, List, Optional, Tuple
# import yfinance as yf
# from datetime import datetime, timedelta

# logger = logging.getLogger(__name__)

# def get_stock_info(symbol: str) -> Dict[str, Any]:
#     """Get basic information about a stock.
#     Args:
#         symbol: The stock ticker symbol (e.g., 'AAPL') 
#     Returns:
#         Dictionary containing stock information
#     Raises:
#         ValueError: If the stock symbol is invalid
#     """
#     try:
#         stock = yf.Ticker(symbol)
#         data = stock.info
        
#         return {
#             "symbol": symbol,
#             "name": data.get("shortName"),
#             "price": data.get("currentPrice"),
#             "change": data.get("regularMarketChangePercent"),
#             "marketCap": data.get("marketCap"),
#             "sector": data.get("sector"),
#             "industry": data.get("industry"),
#             "pe_ratio": data.get("forwardPE"),
#             "dividend_yield": data.get("dividendYield"),
#             "summary": data.get("longBusinessSummary")
#         }
#     except Exception as e:
#         logger.error(f"Error fetching stock info for {symbol}: {e}")
#         raise ValueError(f"Unable to retrieve information for {symbol}")
    

# def search_stocks(query: str) -> List[Dict[str, str]]:
#     """Search for stocks by name or symbol.
#     Args:
#         query: Search term (company name or partial symbol)
#     Returns:
#         List of matching stocks with basic info
#     """
#     try:
#         # This is a simple implementation - in production you might
#         # want to use a more sophisticated search API
#         tickers = yf.Tickers(query)
#         results = []
        
#         for symbol in tickers.tickers:
#             try:
#                 info = tickers.tickers[symbol].info
#                 results.append({
#                     "symbol": symbol,
#                     "name": info.get("shortName", "Unknown"),
#                     "exchange": info.get("exchange", "Unknown")
#                 })
#             except:
#                 # Skip tickers that fail to fetch
#                 pass
                
#         return results
#     except Exception as e:
        # logger.error(f"Error searching stocks with query '{query}': {e}")
        # return []