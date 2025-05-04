"""Claude AI integration service via AWS Bedrock.

This module handles interactions with Claude 3.7 Sonnet via AWS Bedrock
for financial insights and analysis.
"""
import json
import boto3
from typing import List, Dict, Any, Optional

# Bedrock client setup
bedrock_runtime = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1', 
)

# Claude model ID - use the appropriate model version
MODEL_ID = "us.anthropic.claude-3-7-sonnet-20250219-v1:0"


def format_prompt(prompt: str) -> Dict[str, Any]:
    """Format a prompt for Claude via AWS Bedrock.
    Args:
        prompt: The text prompt to send to Claude 
    Returns:
        Formatted request body for Bedrock API
    """
    return {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2000, 
        "messages": [{"role": "user", "content": prompt}]
    }


def invoke_claude(prompt: str) -> str:
    """Invoke Claude model through AWS Bedrock.
    
    Args:
        prompt: The prompt to send to Claude
        
    Returns:
        Claude's response text
    """
    try:
        response = bedrock_runtime.invoke_model(
            modelId=MODEL_ID,
            body=json.dumps(format_prompt(prompt))
        )
        response_body = json.loads(response.get('body').read())
        return response_body['content'][0]['text']
    except Exception as e:
        print(f"Error invoking Claude: {e}")
        return "Error processing request."


def get_deep_research_on_stock(symbol: str) -> str:
    """Get comprehensive analysis on a specific stock.
    
    Args:
        symbol: The stock ticker symbol (e.g., 'AAPL')
        
    Returns:
        Detailed analysis of the stock for investors
    """
    query = f"Provide a deep analysis on {symbol} stock for weekly investor summary."
    return invoke_claude(query)


def get_trending_topics() -> List[str]:
    """Get currently trending topics in finance.
    
    Returns:
        List of trending finance topics
    """
    prompt = "Give me 5 currently trending topics in finance today."
    response = invoke_claude(prompt)
    topics = response.split('\n')
    return topics


def get_deep_dive(topic: str) -> str:
    """Generate a deep dive analysis on a financial topic.
    
    Args:
        topic: The financial topic to analyze
        
    Returns:
        Detailed research insight on the topic
    """
    prompt = f"Give a deep research insight on this finance topic: {topic}"
    return invoke_claude(prompt)


def get_concept_summary(concept: str) -> str:
    """Get a concise explanation of a financial concept.
    
    Args:
        concept: The financial concept to explain
        
    Returns:
        A concise explanation of the concept
    """
    prompt = f"In finance, explain the concept of: {concept}"
    return invoke_claude(prompt)


def generate_day_summary(topics: List[Dict[str, str]]) -> str:
    """Generate a summary of all topics a user has learned about in a day.
    
    Args:
        topics: List of topic dictionaries with keys "topic" and optional "subtopic"
        
    Returns:
        A summary connecting all the topics with quiz questions
    """
    joined = ", ".join(t["topic"] for t in topics)
    prompt = f"Summarize what a user learned today based on reading: {joined}. Then give 3 quiz questions on it."
    return invoke_claude(prompt)


def analyze_stock_sentiment(symbol: str) -> Dict[str, Any]:
    """Analyze market sentiment around a specific stock.
    
    Args:
        symbol: The stock ticker symbol (e.g., 'AAPL')
        
    Returns:
        Dictionary with sentiment analysis results
    """
    prompt = f"""Analyze the current market sentiment for {symbol} stock.
    Provide:
    1. Overall sentiment (bullish, bearish, or neutral)
    2. Key factors influencing sentiment
    3. Potential risks and opportunities"""
    
    response = invoke_claude(prompt)
    
    # Extract a simple sentiment score (this could be more sophisticated)
    sentiment_score = 0.0
    if "bullish" in response.lower():
        sentiment_score = 0.7
    elif "bearish" in response.lower():
        sentiment_score = -0.7
    elif "neutral" in response.lower():
        sentiment_score = 0.0
    
    return {
        "symbol": symbol,
        "analysis": response,
        "sentiment_score": sentiment_score
    }