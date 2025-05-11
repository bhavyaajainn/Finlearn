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