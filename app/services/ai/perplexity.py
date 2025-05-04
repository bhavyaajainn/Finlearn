"""Perplexity AI integration service.

This module handles interactions with the Perplexity API for 
research and financial insights.
"""
import os
import requests
from typing import List, Dict, Any, Optional

# Get API key from environment variable
PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY", "")
BASE_URL = "https://api.perplexity.ai/v1/sonar"


def _get_headers() -> Dict[str, str]:
    """Get the headers for Perplexity API requests.
    
    Returns:
        Dictionary containing authorization headers
    """
    return {"Authorization": f"Bearer {PERPLEXITY_API_KEY}"}


def get_deep_research_on_stock(symbol: str) -> str:
    """Get comprehensive analysis on a specific stock.
    
    Args:
        symbol: The stock ticker symbol (e.g., 'AAPL')
        
    Returns:
        Detailed analysis of the stock for investors
    """
    query = f"Provide a deep analysis on {symbol} stock for weekly investor summary."
    payload = {"query": query}
    
    try:
        res = requests.post(BASE_URL, headers=_get_headers(), json=payload)
        res.raise_for_status()
        return res.json().get("answer", "No insights available.")
    except Exception as e:
        print(f"Error fetching research for {symbol}: {e}")
        return f"Unable to retrieve analysis for {symbol}."


def get_trending_topics() -> List[str]:
    """Get currently trending topics in finance.
    
    Returns:
        List of trending finance topics
    """
    prompt = "Give me 5 currently trending topics in finance today."
    
    try:
        res = requests.post(
            BASE_URL, 
            headers=_get_headers(), 
            json={"query": prompt}
        )
        res.raise_for_status()
        topics = res.json().get("answer", "").split('\n')
        return [t for t in topics if t.strip()][:5]  # Filter empty strings and limit to 5
    except Exception as e:
        print(f"Error fetching trending topics: {e}")
        return ["Market trends", "Economic outlook", "Inflation", "Interest rates", "Earnings"]


def get_deep_dive(topic: str) -> str:
    """Generate a deep dive analysis on a financial topic.
    
    Args:
        topic: The financial topic to analyze
        
    Returns:
        Detailed research insight on the topic
    """
    prompt = f"Give a deep research insight on this finance topic: {topic}"
    
    try:
        res = requests.post(
            BASE_URL, 
            headers=_get_headers(), 
            json={"query": prompt}
        )
        res.raise_for_status()
        return res.json().get("answer", "No info found")
    except Exception as e:
        print(f"Error getting deep dive on {topic}: {e}")
        return f"Unable to retrieve information on {topic}."


def get_concept_summary(concept: str) -> str:
    """Get a concise explanation of a financial concept.
    
    Args:
        concept: The financial concept to explain
        
    Returns:
        A concise explanation of the concept
    """
    prompt = f"In finance, explain the concept of: {concept}"
    
    try:
        res = requests.post(
            BASE_URL, 
            headers=_get_headers(), 
            json={"query": prompt}
        )
        res.raise_for_status()
        return res.json().get("answer", "No definition found")
    except Exception as e:
        print(f"Error getting concept summary for {concept}: {e}")
        return f"Unable to retrieve explanation for {concept}."


def generate_day_summary(topics: List[Dict[str, str]]) -> str:
    """Generate a summary of all topics a user has learned about in a day.
    
    Args:
        topics: List of topic dictionaries with keys "topic" and optional "subtopic"
        
    Returns:
        A summary connecting all the topics with quiz questions
    """
    if not topics:
        return "You haven't explored any topics today."
        
    joined = ", ".join(t["topic"] for t in topics)
    prompt = f"Summarize what a user learned today based on reading: {joined}. Then give 3 quiz questions on it."
    
    try:
        res = requests.post(
            BASE_URL, 
            headers=_get_headers(), 
            json={"query": prompt}
        )
        res.raise_for_status()
        return res.json().get("answer", "Summary unavailable.")
    except Exception as e:
        print(f"Error generating day summary: {e}")
        return "Unable to generate summary at this time."


def get_market_analysis(symbols: List[str]) -> Dict[str, Any]:
    """Get current market analysis for a list of stocks.
    
    Args:
        symbols: List of stock ticker symbols
        
    Returns:
        Dictionary containing market analysis for the requested symbols
    """
    if not symbols:
        return {"analysis": "No symbols provided for analysis."}
        
    symbols_str = ", ".join(symbols)
    query = f"Provide current market analysis for these stocks: {symbols_str}. Include price trends and outlook."
    
    try:
        res = requests.post(
            BASE_URL, 
            headers=_get_headers(), 
            json={"query": query}
        )
        res.raise_for_status()
        
        return {
            "symbols": symbols,
            "analysis": res.json().get("answer", "Analysis unavailable.")
        }
    except Exception as e:
        print(f"Error getting market analysis: {e}")
        return {"symbols": symbols, "analysis": "Unable to retrieve analysis at this time."}