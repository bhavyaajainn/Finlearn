"""Perplexity AI integration service.

This module handles interactions with the Perplexity API for 
research and financial insights.
"""
import os
import re
import time
import requests
import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging  # Add standard Python logging instead

# Create a logger instance for this module
logger = logging.getLogger(__name__)

from app.services.ai.prompts.learning_prompts import (
    get_article_prompt,
)
from app.services.ai.prompts.asset_prompts import (
    get_comprehensive_research_prompt,
)

# Get API key from environment variable
PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY", "")
BASE_URL = "https://api.perplexity.ai/chat/completions"

# Update the API call function
def call_perplexity_api(prompt: str) -> str:
    """Call the Perplexity API with the given prompt.
    
    Args:
        prompt: The prompt to send to Perplexity
        
    Returns:
        The response from Perplexity
    """
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "sonar", 
        "messages": [
            {
                "role": "system",
                "content": "You are a financial education expert specializing in creating deep research articles based on the latest news and trends."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7
    }
    
    try:
        res = requests.post(BASE_URL, headers=headers, json=data)
        res.raise_for_status()  # This will raise an exception for HTTP errors
        
        response_json = res.json()
        return response_json["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling Perplexity API: {e}")
        raise

def call_perplexity_api_with_schema(prompt: str, schema: dict) -> Dict[str, Any]:
    """Call the Perplexity API with JSON schema for structured output.
    
    Args:
        prompt: The prompt to send to Perplexity
        schema: JSON schema defining the expected response structure
        
    Returns:
        Structured JSON response matching the schema
    """
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "sonar", 
        "messages": [
            {
                "role": "system",
                "content": "You are a financial education expert specializing in creating structured content."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {"schema": schema},
        },
        "temperature": 0.7
    }
    
    try:
        res = requests.post(BASE_URL, headers=headers, json=data)
        res.raise_for_status()
        
        response_json = res.json()
        
        # The structured response is directly in the content field
        content = response_json["choices"][0]["message"]["content"]
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error calling Perplexity API with schema: {e}")
        raise


def _get_headers() -> Dict[str, str]:
    """Get the headers for Perplexity API requests.
    
    Returns:
        Dictionary containing authorization headers
    """
    return {"Authorization": f"Bearer {PERPLEXITY_API_KEY}"}


def fetch_category_news_with_perplexity(category: str) -> str:
    """Fetch latest news about a financial category using Perplexity SONAR.
    
    Args:
        category: Financial category
        
    Returns:
        Context about latest developments in the category
    """
    prompt = f"""I need information about the latest developments in {category} finance.

    Please provide:
    1. A summary of the most significant recent news in {category} (last few days/weeks)
    2. Any major trends currently affecting {category}
    3. Important market movements or regulatory changes
    4. Notable company announcements or product launches related to {category}
    
    Format your response as a concise bulleted list with 6-8 key points covering the most important developments. Each point should be 1-2 sentences only.
    """
    
    try:
        return call_perplexity_api(prompt)
    except Exception as e:
        print(f"Error fetching news for {category}: {e}")
        return f"• Unable to retrieve the latest news for {category} at this time."


def generate_news_based_topics(category: str, expertise_level: str, news_context: str) -> List[Dict[str, Any]]:
    """Generate topics based on category, expertise level, and latest news.
    
    Args:
        category: Financial category
        expertise_level: Target audience expertise level
        news_context: Context about latest developments from Perplexity
        
    Returns:
        List of topics relevant to current news
    """
    prompt = f"""Based on these recent developments in {category}:

{news_context}

Generate a list of 4-5 specific topics within the financial category of {category} that would be:
1. Relevant to current trends and market developments
2. Appropriate for a {expertise_level} level audience
3. Diverse enough to cover different aspects of {category}

For each topic:
1. Provide a concise but specific title (not too broad)
2. Include a brief 1-2 sentence description relating it to current conditions
3. Indicate why this topic is important for someone at a {expertise_level} level right now

Format your response as valid JSON with this structure:
[
  {{
    "title": "Topic Title 1",
    "description": "Brief description of the topic",
    "importance": "Why this topic matters for {expertise_level} learners",
    "relevance": "How this connects to current market conditions"
  }},
  ...
]

Ensure that:
- For beginners: focus on foundational concepts and terminology with clear explanations
- For intermediate: include practical applications and strategies related to current developments
- For advanced: cover complex mechanisms, advanced strategies, and emerging trends with depth
"""
    
    try:
        response= call_perplexity_api(prompt)
        
        # Parse the response
        try:
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                topics = json.loads(json_str)
            else:
                topics = json.loads(response)
            
            # Add UUID and metadata to each topic
            for topic in topics:
                topic["topic_id"] = str(uuid.uuid4())
                topic["category"] = category
                topic["expertise_level"] = expertise_level
                topic["generated_date"] = datetime.now().isoformat()
            
            return topics
        except json.JSONDecodeError:
            # Fallback with basic topics if parsing fails
            return [
                {
                    "topic_id": str(uuid.uuid4()),
                    "title": f"Latest Trends in {category.capitalize()}",
                    "description": f"Analysis of recent developments in {category}",
                    "importance": "Essential to understand current market conditions",
                    "relevance": "Directly related to this week's market movements",
                    "category": category,
                    "expertise_level": expertise_level,
                    "generated_date": datetime.now().isoformat()
                },
                {
                    "topic_id": str(uuid.uuid4()),
                    "title": f"How Recent Events Impact {category.capitalize()}",
                    "description": f"Understanding the implications of current events on {category}",
                    "importance": "Helps anticipate market movements",
                    "relevance": "Connected to ongoing economic developments",
                    "category": category,
                    "expertise_level": expertise_level,
                    "generated_date": datetime.now().isoformat()
                }
            ]
    except Exception as e:
        print(f"Error generating news-based topics: {e}")
        return [
            {
                "topic_id": str(uuid.uuid4()),
                "title": f"Latest Trends in {category.capitalize()}",
                "description": f"Analysis of recent developments in {category}",
                "importance": "Essential to understand current market conditions",
                "relevance": "Directly related to this week's market movements",
                "category": category,
                "expertise_level": expertise_level,
                "generated_date": datetime.now().isoformat()
            },
            {
                "topic_id": str(uuid.uuid4()),
                "title": f"How Recent Events Impact {category.capitalize()}",
                "description": f"Understanding the implications of current events on {category}",
                "importance": "Helps anticipate market movements",
                "relevance": "Connected to ongoing economic developments",
                "category": category,
                "expertise_level": expertise_level,
                "generated_date": datetime.now().isoformat()
            }
        ]


def get_daily_topics(category: str, expertise_level: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get daily topics based on latest news in a category.
    
    Args:
        category: Financial category
        expertise_level: User's expertise level
        user_id: Optional user ID for personalization
        
    Returns:
        List of news-relevant topics with descriptions
    """
    # Check if we need fresh topics (daily refresh)
    from app.services.firebase.cache import get_cached_topics, cache_topics, get_cache_timestamp
    
    cached_topics = get_cached_topics(category, expertise_level)
    cache_date = get_cache_timestamp(category, expertise_level)
    
    today = datetime.now().date()
    if cached_topics and cache_date and cache_date.date() == today:
        # We have today's topics already
        return cached_topics
    
    # Get latest news context for this category using Perplexity
    news_context = fetch_category_news_with_perplexity(category)
    
    # Generate topics based on latest news
    topics = generate_news_based_topics(category, expertise_level, news_context)
    
    # Cache the topics with today's timestamp
    cache_topics(category, expertise_level, topics)
    
    return topics


def generate_article(
    category: str,
    expertise_level: str,
    topic: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate a financial article using Perplexity SONAR API with JSON schema response format."""
    # Get the base prompt
    prompt = get_article_prompt(category, expertise_level, topic)
    
    # Add clear instructions about expected format
    prompt += """
    Create a comprehensive article with proper formatting, informative tooltips for financial terms,
    and properly formatted references. Each reference MUST include publication name, article title, 
    link, and date in this format: 'Publication name. (Year). Article title, link, date'
    """
    
    try:
        # Use the schema-based approach
        from app.services.ai.schemas import ARTICLE_SCHEMA_DEFINITION
        response_data = call_perplexity_api_with_schema(prompt, ARTICLE_SCHEMA_DEFINITION)
        
        # Add metadata to the response
        result = {
            "id": str(uuid.uuid4()),
            "title": response_data.get("title", f"Latest in {category.capitalize()}" + (f": {topic}" if topic else "")),
            "content": response_data.get("content", ""),
            "tooltip_words": response_data.get("tooltip_words", []),
            "references": response_data.get("references", []),
            "difficulty_level": expertise_level,
            "category": category,
            "topic": topic if topic else category,
            "created_at": datetime.now().isoformat()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error generating article: {e}")
        # Error response with the same structure
        return {
            "id": str(uuid.uuid4()),
            "title": f"Error generating article about {topic if topic else category}",
            "content": f"We encountered an error while generating this article: {str(e)}",
            "tooltip_words": [
                {"word": "Error", "tooltip": "An issue occurred during article generation"},
                {"word": category.capitalize(), "tooltip": f"Category of the requested article"},
                {"word": "Technical difficulties", "tooltip": "Temporary problems with the content generation system"}
            ],
            "references": [
                f"System error log. ({datetime.now().year}). Request parameters: category={category}, level={expertise_level}, topic={topic}, https://support.finlearn.com, {datetime.now().strftime('%B %d')}"
            ],
            "difficulty_level": expertise_level,
            "category": category,
            "topic": topic if topic else category,
            "created_at": datetime.now().isoformat()
        }
        
def generate_reading_summary(
    user_id: str,
    read_articles: List[Dict[str, Any]],
    tooltips: List[Dict[str, Any]] = None,  # Made optional
    period: str = "day",
    stats: Dict[str, Any] = None
) -> str:
    """Generate an AI summary of user's reading activity focused only on articles.
    
    Args:
        user_id: User identifier
        read_articles: List of articles read by the user
        tooltips: Optional list of tooltips viewed by the user (not used)
        period: Time period (day, week, month)
        stats: Calculated statistics
        
    Returns:
        AI-generated summary text
    """
    # Skip tooltip processing completely
    
    # Create article list for prompt
    article_titles = []
    for article in read_articles:
        if "topic_details" in article and article["topic_details"]:
            title = article["topic_details"].get("title", "Untitled")
            article_titles.append(title)
        elif "topic_title" in article:
            article_titles.append(article.get("topic_title"))
        else:
            category = article.get("category", "uncategorized")
            topic_id = article.get("topic_id", "unknown")
            article_titles.append(f"Article on {category}")
    
    # Create article titles string
    article_titles_str = ", ".join(article_titles) if article_titles else "No articles"
    
    # Extract categories from stats or articles
    top_categories = []
    if stats and "top_categories" in stats:
        top_categories = stats["top_categories"]
    else:
        # Extract categories from reading history
        categories = {}
        for article in read_articles:
            category = article.get("category", "uncategorized")
            categories[category] = categories.get(category, 0) + 1
        top_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
    
    top_categories_str = ", ".join([cat[0] for cat in top_categories]) if top_categories else "various topics"
    
    # Period text formatting
    period_text = "today" if period == "day" else f"this {period}"
    
    # Build prompt
    prompt = f"""Create a personalized learning summary for a user who has read {len(read_articles)} financial articles 
    over the past {period}.
    
    Articles read: {article_titles_str}
    
    Top categories: {top_categories_str}
    
    Generate a concise, motivational summary of their learning progress that:
    1. Acknowledges their progress and topics explored
    2. Notes any focused areas of interest
    3. Provides encouragement to continue learning
    4. Suggests what they might explore next based on their interests
    
    Keep the tone friendly and conversational.
    """
    
    try:
        summary = call_perplexity_api(prompt)
        return summary
    except Exception as e:
        logger.error(f"Error generating reading summary: {e}")
        # Fallback response
        articles_count = len(read_articles)
        return f"You've read {articles_count} article{'s' if articles_count != 1 else ''} {period_text}, focusing on {top_categories_str}. Keep up the great work on your financial learning journey!"
    
def generate_quiz_questions(
    read_articles: List[Dict[str, Any]],
    expertise_level: str
) -> List[Dict[str, Any]]:
    """Generate quiz questions based on user's reading history.
    
    Args:
        read_articles: List of articles read by the user
        expertise_level: User's expertise level
        
    Returns:
        List of quiz questions with multiple-choice options
    """
    # Extract topics and categories from reading history
    if not read_articles:
        # If no articles read, generate general financial questions
        topics = ["general finance", "investing basics", "financial markets"]
        categories = ["finance", "investing"]
    else:
        # Extract topics from reading history
        topics = list(set([
            article.get("topic", "") for article in read_articles 
            if "topic" in article and article.get("topic")
        ]))
        
        # Extract categories from reading history
        categories = list(set([
            article.get("category", "") for article in read_articles 
            if "category" in article and article.get("category")
        ]))
    
    # Select up to 3 topics for questions (to ensure variety)
    selected_topics = topics[:3] if len(topics) >= 3 else topics
    if len(selected_topics) < 3:
        # Add categories if we don't have enough topics
        for cat in categories:
            if cat and cat not in selected_topics:
                selected_topics.append(cat)
                if len(selected_topics) >= 3:
                    break
    
    # If we still don't have 3 topics, add general finance topics
    while len(selected_topics) < 3:
        general_topics = ["investing basics", "financial markets", "personal finance", 
                         "economics", "stock market", "budgeting"]
        for topic in general_topics:
            if topic not in selected_topics:
                selected_topics.append(topic)
                break
    
    prompt = f"""Generate 3 multiple-choice quiz questions about these financial topics: {', '.join(selected_topics)}.

These questions are for a {expertise_level}-level investor based on articles they've read.

For each question:
1. Create a clear, concise question about an important concept
2. Provide exactly 4 multiple-choice options (A, B, C, D)
3. Indicate which option is correct
4. Add a brief explanation of why the answer is correct

The questions should test comprehension and application, not just recall.

Format your response as a valid JSON array with this structure:
[
  {{
    "question": "What is dollar-cost averaging?",
    "options": [
      {{
        "label": "A",
        "text": "Buying a fixed dollar amount of an investment on a regular schedule"
      }},
      {{
        "label": "B",
        "text": "Converting all investments to US dollars"
      }},
      {{
        "label": "C",
        "text": "Paying a fixed fee for each trade"
      }},
      {{
        "label": "D",
        "text": "Adjusting prices for inflation"
      }}
    ],
    "correct_answer": "A",
    "explanation": "Dollar-cost averaging involves investing a fixed amount regularly regardless of price, which reduces the impact of volatility."
  }},
  ... 2 more questions ...
]
"""
    
    try:
        response = call_perplexity_api(prompt
        )
        
        # Parse the response
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                questions = json.loads(json_str)
            else:
                # Try parsing the entire response as JSON
                questions = json.loads(response)
            
            # Ensure the response is a list
            if not isinstance(questions, list):
                logger.warning(f"Unexpected questions response format: {type(questions)}")
                return []
            
            # Validate each question
            validated_questions = []
            for question in questions:
                # Check if this is a valid question
                if "question" in question and "options" in question and "correct_answer" in question:
                    # Ensure we have exactly 4 options
                    if len(question["options"]) != 4:
                        # Add dummy options if needed or trim extras
                        while len(question["options"]) < 4:
                            question["options"].append({
                                "label": ["A", "B", "C", "D"][len(question["options"])],
                                "text": "N/A"
                            })
                        question["options"] = question["options"][:4]
                    
                    validated_questions.append(question)
            
            return validated_questions
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse quiz questions JSON: {e}")
            return []
        
    except Exception as e:
        logger.error(f"Error generating quiz questions: {e}")
        return []


## assets
def get_similar_stocks(symbol: str, limit: int = 3) -> List[Dict[str, Any]]:
    """Get similar stocks with standardized schema structure.
    
    Args:
        symbol: Stock ticker symbol
        limit: Maximum number of similar stocks to return
        
    Returns:
        List of similar stocks with standardized data structure
    """
    prompt = f"""Find {limit} stocks that are most similar to {symbol} based on:
    - Business model and products/services
    - Market capitalization and industry position
    - Customer base and target markets
    - Revenue model and growth profile
    
    For each similar stock, provide:
    1. Symbol (ticker)
    2. Company name
    3. Current price (approximate)
    4. Brief explanation of why it's similar to {symbol}
    5. Key comparison points (at least 2 specific metrics where they're comparable)
    
    Focus on the most relevant competitors or companies with similar business models.
    """
    
    # Define the schema for structured output
    similar_stocks_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "symbol": {"type": "string"},
                "name": {"type": "string"},
                "current_price": {"type": "number"},
                "similarity_reason": {"type": "string"},
                "comparison_points": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "metric": {"type": "string"},
                            "description": {"type": "string"},
                            "comparison": {"type": "string"}
                        },
                        "required": ["metric", "description", "comparison"]
                    }
                }
            },
            "required": ["symbol", "name",  "similarity_reason", "comparison_points"]
        }
    }
    
    try:
        # Use schema-based API call for structured output
        results = call_perplexity_api_with_schema(prompt, similar_stocks_schema)
        logger.info(f"Perplexity API returned {len(results) if results else 0} similar stocks")
        
        # Ensure we have the correct number of results
        return results[:limit]
    except Exception as e:
        logger.error(f"Error finding similar stocks for {symbol}: {e}")
        return []

def get_similar_crypto(symbol: str, limit: int = 3) -> List[Dict[str, Any]]:
    """Get similar cryptocurrencies with standardized schema structure.
    
    Args:
        symbol: Cryptocurrency symbol
        limit: Maximum number of similar cryptocurrencies to return
        
    Returns:
        List of similar cryptocurrencies with standardized data structure
    """
    prompt = f"""Find {limit} cryptocurrencies that are most similar to {symbol} based on:
    - Technology and blockchain architecture
    - Use case and market purpose
    - Market capitalization range
    - Development activity and community
    
    For each similar cryptocurrency, provide:
    1. Symbol (ticker)
    2. Full name
    3. Current price (approximate)
    4. Brief explanation of why it's similar to {symbol}
    5. Key comparison points (at least 2 specific technical or market characteristics)
    
    Focus on cryptocurrencies with the most relevant technical similarities or competing use cases.
    """
    
    # Define the schema for structured output (same structure as stocks for consistency)
    similar_crypto_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "symbol": {"type": "string"},
                "name": {"type": "string"},
                "current_price": {"type": "number"},
                "similarity_reason": {"type": "string"},
                "comparison_points": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "metric": {"type": "string"},
                            "description": {"type": "string"},
                            "comparison": {"type": "string"}
                        },
                        "required": ["metric", "description", "comparison"]
                    }
                }
            },
            "required": ["symbol", "name", "current_price", "similarity_reason", "comparison_points"]
        }
    }
    
    try:
        # Use schema-based API call for structured output
        results = call_perplexity_api_with_schema(prompt, similar_crypto_schema)
        
        # Ensure we have the correct number of results
        return results[:limit]
    except Exception as e:
        logger.error(f"Error finding similar cryptocurrencies for {symbol}: {e}")
        return []

def generate_asset_comparison(
    main_asset: Dict[str, Any],
    similar_assets: List[Dict[str, Any]],
    expertise_level: str
) -> Dict[str, Any]:
    """Generate detailed comparison between main asset and similar assets.
    
    Args:
        main_asset: Information about the main asset
        similar_assets: List of similar assets to compare with
        expertise_level: User's expertise level
        
    Returns:
        Structured comparison analysis with metrics tailored to expertise level
    """
    # Extract key information for the prompt
    symbol = main_asset.get("symbol", "")
    asset_type = main_asset.get("asset_type", "")
    name = main_asset.get("name", symbol)
    
    # Format similar assets for the prompt
    similar_assets_str = []
    for asset in similar_assets:
        similar_assets_str.append(
            f"- {asset.get('symbol')}: {asset.get('name')}, price: {asset.get('current_price')}"
        )
    similar_assets_formatted = "\n".join(similar_assets_str)
    
    prompt = f"""Create a detailed comparison analysis between {symbol} ({name}) and these similar {asset_type}s:

{similar_assets_formatted}

This analysis is for a {expertise_level} level investor, so adjust the depth and terminology accordingly.

For each comparison:
1. Identify key metrics that are most important for comparing these {asset_type}s
2. Explain how {symbol} compares to each similar {asset_type} on these metrics
3. Highlight advantages and disadvantages of {symbol} vs. the alternatives
4. Provide specific data points where available (e.g., P/E ratios, market cap, etc.)

For {expertise_level} level:
- {"Focus on basic metrics and simple explanations" if expertise_level == "BEGINNER" else ""}
- {"Include intermediate concepts and some technical analysis" if expertise_level == "INTERMEDIATE" else ""}
- {"Provide advanced metrics and detailed technical comparison" if expertise_level == "ADVANCED" else ""}

Ensure the comparison helps the investor understand the relative position of {symbol} among similar {asset_type}s.
"""
    
    # Define the schema for the comparison response
    comparison_schema = {
        "type": "object",
        "properties": {
            "main_asset_symbol": {"type": "string"},
            "main_asset_name": {"type": "string"},
            "overview": {"type": "string"},
            "key_metrics": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "metric_name": {"type": "string"},
                        "description": {"type": "string"},
                        "importance": {"type": "string"}
                    },
                    "required": ["metric_name", "description", "importance"]
                }
            },
            "comparisons": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "compared_asset_symbol": {"type": "string"},
                        "compared_asset_name": {"type": "string"},
                        "overall_assessment": {"type": "string"},
                        "metrics_comparison": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "metric": {"type": "string"},
                                    "main_asset_value": {"type": "string"},
                                    "compared_asset_value": {"type": "string"},
                                    "advantage": {"type": "string"},
                                    "analysis": {"type": "string"}
                                },
                                "required": ["metric", "analysis", "advantage"]
                            }
                        }
                    },
                    "required": ["compared_asset_symbol", "compared_asset_name", "overall_assessment", "metrics_comparison"]
                }
            },
            "summary": {"type": "string"},
            "expertise_level": {"type": "string"}
        },
        "required": ["main_asset_symbol", "main_asset_name", "overview", "key_metrics", "comparisons", "summary", "expertise_level"]
    }
    
    try:
        # Use schema-based API call for structured output
        comparison = call_perplexity_api_with_schema(prompt, comparison_schema)
        
        # Add additional metadata
        comparison["generated_at"] = datetime.now().isoformat()
        comparison["asset_type"] = asset_type
        
        return comparison
    except Exception as e:
        logger.error(f"Error generating asset comparison for {symbol}: {e}")
        # Return basic fallback structure
        return {
            "main_asset_symbol": symbol,
            "main_asset_name": name,
            "overview": f"Comparison analysis for {symbol} with similar {asset_type}s.",
            "key_metrics": [
                {"metric_name": "Price", "description": "Current trading price", "importance": "High"}
            ],
            "comparisons": [],
            "summary": f"Unable to generate detailed comparison due to an error: {str(e)}",
            "expertise_level": expertise_level,
            "generated_at": datetime.now().isoformat(),
            "asset_type": asset_type,
            "error": str(e)
        }

def get_interactive_asset_analysis(
    symbol: str,
    asset_type: str,
    expertise_level: str,
    asset_info: Dict[str, Any],
    similar_assets: List[Dict[str, Any]] = None,
    user_interests: List[str] = None,
    recent_news: List[Dict[str, Any]] = None,
    watchlist_items: List[Dict[str, Any]] = None,
    related_topics: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Generate interactive, conversational research tailored specifically to the user.
    
    Args:
        symbol: Asset symbol
        asset_type: Type of asset (stock/crypto)
        expertise_level: User's expertise level
        asset_info: Detailed asset information
        similar_assets: List of similar assets for comparison
        user_interests: User's investment interests
        recent_news: Recent news articles about the asset
        watchlist_items: User's current watchlist
        related_topics: Topics from user's reading history related to this asset
        
    Returns:
        Interactive research article with embedded tooltips
    """
    # Get the personalized interactive prompt
    prompt = get_comprehensive_research_prompt(
        symbol=symbol,
        asset_type=asset_type,
        expertise_level=expertise_level,
        asset_info=asset_info,
        similar_assets=similar_assets,
        user_interests=user_interests,
        recent_news=recent_news,
        watchlist_items=watchlist_items,
        related_topics=related_topics
    )
    
    try:
        # Use schema-based approach for structured response
        from app.services.ai.schemas import INTERACTIVE_ASSET_ANALYSIS_SCHEMA
        
        # Get structured response using the schema
        research = call_perplexity_api_with_schema(prompt, INTERACTIVE_ASSET_ANALYSIS_SCHEMA)
        
        # Add metadata and format info
        research["asset_symbol"] = symbol
        research["asset_type"] = asset_type
        research["expertise_level"] = expertise_level
        research["generated_at"] = datetime.now().isoformat()
        research["format"] = "structured"
        
        return research
        
    except Exception as e:
        logger.error(f"Error generating interactive analysis: {e}")
        return {
            "error": str(e),
            "title": f"Unable to generate analysis for {symbol}",
            "content": f"We apologize, but we encountered an error while preparing your personalized research: {str(e)}",
            "asset_symbol": symbol,
            "asset_type": asset_type,
            "expertise_level": expertise_level,
            "generated_at": datetime.now().isoformat(),
            "format": "error"
        }

def fetch_asset_news(
    symbol: str, 
    asset_type: str,
    limit: int = 3,
    include_citations: bool = True,
) -> List[Dict[str, Any]]:
    """Fetch recent news for a specific asset using Perplexity with proper citations.
    
    Args:
        symbol: Asset symbol
        asset_type: Type of asset (stock/crypto)
        limit: Maximum number of news items to return
        
    Returns:
        List of recent news items with analysis and citations
    """

    # Define the schema for structured output
    news_schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "headline": {"type": "string"},
                "date": {"type": "string"},
                "source": {"type": "string"},
                "summary": {"type": "string"},
                "url": {"type": "string", "description": "Full URL to the original article"},
                "impact": {
                    "type": "object",
                    "properties": {
                        "direction": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                        "reason": {"type": "string"}
                    },
                    "required": ["direction", "reason"]
                },
                "citation": {"type": "string", "description": "Full citation in format: 'Source. (Year). Title. URL'"}
            },
            "required": ["headline", "summary", "date", "source"]
        }
    }
    
    # Create prompt for Perplexity API - keep consistent for all retries
    prompt = f"""Find the {limit} most significant recent news stories about {symbol} ({asset_type}) from the past 2 weeks.

For each news item, provide:
1. Headline
2. Date published (in ISO format YYYY-MM-DD)
3. Source name (publication or website)
4. Author(s) if available
5. URL to the original article
6. Brief summary (1-2 sentences)
7. Potential impact on the asset (positive/negative/neutral and why)

IMPORTANT: For citation, include the FULL SOURCE INFORMATION with the complete URL, not just a reference number like [1].
For example: "Yahoo Finance. (2023). Apple Reports Record Profits. https://finance.yahoo.com/article/123"

Only return the most important news that could potentially affect the asset's value or investment thesis. Ensure all URLs and citation information are accurate.
"""
    
    # Try with exponential backoff
    for attempt in range(4 + 1):
        try:
            # Call Perplexity API with schema
            news_items = call_perplexity_api_with_schema(prompt, news_schema)
            
            # Check if we got a valid response
            if news_items and len(news_items) > 0:
                # We have news items, validate and return them
                validated_items = []
                for item in news_items:
                    # Generate citation if not provided or invalid
                    if "citation" not in item or not item["citation"] or item["citation"].startswith("["):
                        source = item.get("source", "Financial news")
                        year = item.get("date", "")[:4] if item.get("date") else datetime.now().year
                        title = item.get("headline", "Recent news")
                        url = item.get("url", "")
                        
                        item["citation"] = f"{source}. ({year}). {title}. {url}"
                    
                    validated_items.append(item)
                
                # If we have news items, return them
                if validated_items:
                    return validated_items[:limit]
            
            # If we got here, we either got an empty list or invalid data
            if attempt < 4:  # Only log if we're going to retry
                backoff_time = 2 ** attempt  # Exponential backoff
                logger.warning(f"Empty news response for {symbol} on attempt {attempt+1}/{4+1}. Retrying in {backoff_time}s")
                time.sleep(backoff_time)  # Exponential backoff
            
        except Exception as e:
            if attempt < 4:  # Only log if we're going to retry
                backoff_time = 2 ** attempt  # Exponential backoff
                logger.error(f"Error fetching news for {symbol} (attempt {attempt+1}): {e}. Retrying in {backoff_time}s")
                time.sleep(backoff_time)  # Exponential backoff
            else:
                logger.error(f"Final attempt to fetch news for {symbol} failed: {e}")
    
    # If all retries failed, generate a fallback news item
    logger.error(f"All {4+1} attempts to fetch news for {symbol} failed, returning generic fallback")
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    return [{
        "headline": f"Market Update: {symbol} Recent Developments",
        "date": current_date,
        "source": "Financial Markets Overview",
        "summary": f"The market for {symbol} continues to evolve with ongoing developments in the {asset_type} sector.",
        "url": f"https://www.google.com/search?q={symbol}+{asset_type}+news",
        "impact": {
            "direction": "neutral",
            "reason": "General market conditions affect this asset alongside broader trends."
        },
        "citation": f"Financial Markets Overview. ({datetime.now().year}). Market Update: {symbol} Recent Developments. https://www.google.com/search?q={symbol}+{asset_type}+news"
    }]

def fetch_trending_finance_news(
    expertise_level: str,
    user_interests: List[str] = None,
    limit: int = 3
) -> List[Dict[str, Any]]:
    """Fetch trending finance news tailored to the user's expertise and interests."""
    # Create interest string for personalization
    interest_str = ", ".join(user_interests) if user_interests else "general finance"
    
    prompt = f"""Find EXACTLY {limit} most significant trending finance news stories from the past 24-48 hours.
    
Focus on topics related to: {interest_str}

The content should be appropriate for a {expertise_level}-level investor.

YOU MUST RETURN EXACTLY {limit} NEWS ITEMS, not more, not less.

For each news item, provide a unique ID, title, summary, source, and other required information.
"""
    
    try:
        # Use schema-based approach for structured response
        from app.services.ai.schemas import TRENDING_NEWS_SCHEMA
        
        # Get structured response using the schema
        news_items = call_perplexity_api_with_schema(prompt, TRENDING_NEWS_SCHEMA)
        
        # Ensure we have a list of items
        if not isinstance(news_items, list):
            logger.warning(f"Expected list but got {type(news_items)}, converting to list")
            if isinstance(news_items, dict) and "title" in news_items:
                news_items = [news_items]
            else:
                news_items = []
        
        # Add UUIDs to each item
        for item in news_items:
            item["id"] = str(uuid.uuid4())
        
        # Ensure we have exactly 'limit' news items
        current_date = datetime.now().isoformat()
        fallback_topics = ["stocks", "bonds", "cryptocurrency", "personal finance", "market trends"]
        
        # Add fallback items if we have fewer than requested
        while len(news_items) < limit:
            logger.warning(f"Only got {len(news_items)} news items, adding fallback items")
            fallback_idx = len(news_items)
            topic = fallback_topics[fallback_idx % len(fallback_topics)]
            
            news_items.append({
                "id": f"fallback-{fallback_idx}",
                "title": f"Latest Developments in {topic.capitalize()}",
                "summary": f"Recent market trends affecting {topic} investments.",
                "source": "Financial Times",
                "url": None,
                "published_at": current_date,
                "topics": [topic]
            })
        
        # Return exactly 'limit' items
        return news_items[:limit]
        
    except Exception as e:
        logger.error(f"Error fetching trending finance news: {e}")
        # Return fallback news items
        current_date = datetime.now().isoformat()
        return [
            {
                "id": f"fallback-{i}",
                "title": f"Latest Developments in {topic.capitalize()}",
                "summary": f"Recent market trends affecting {topic} investments.",
                "source": "Financial Times",
                "url": None,
                "published_at": current_date,
                "topics": [topic]
            }
            for i, topic in enumerate(["stocks", "bonds", "cryptocurrency"][:limit])
        ]

def generate_news_article(
    news_id: str,
    news_item: Dict[str, Any],
    expertise_level: str
) -> Dict[str, Any]:
    """Generate a detailed article for a specific news item with separate tooltips and references.
    
    Args:
        news_id: ID of the news item
        news_item: Details of the news item (title, summary, etc.)
        expertise_level: User's expertise level
        
    Returns:
        Detailed article with separate tooltips and references
    """
    # Extract details from the news item
    title = news_item.get("title", "Recent Financial News")
    summary = news_item.get("summary", "Recent developments in financial markets")
    source = news_item.get("source", "Financial Times")
    topics = news_item.get("topics", [])
    topics_str = ", ".join(topics) if topics else "finance"
    
    prompt = f"""Write a comprehensive analysis of the following financial news story for a {expertise_level}-level investor:

NEWS TITLE: {title}
SUMMARY: {summary}
SOURCE: {source}
TOPICS: {topics_str}

Structure requirements:
- Use the provided news as your main focus
- Create an engaging, specific title based on the news
- Use clear sections and paragraphs
- Include latest developments and context
- Add numerical citations [1][2] etc. for all facts and statements
- Include a references section listing all citation sources

Content requirements:
- Focus on providing valuable insights related to this specific news item
- Include the most current information available about this topic
- Make the analysis thorough but accessible for {expertise_level} level readers
- Discuss implications of this news for investors

IMPORTANT: Identify technical financial terms and concepts that need explanation.
For each term, provide a concise explanation appropriate for the {expertise_level} level.
DO NOT embed tooltips directly in the content.

Return your response as a FLAT (not nested) JSON structure like this:
{{
  "title": "Your article title here",
  "content": "The full article with markdown formatting including citations [1][2]",
  "tooltip_words": [
    {{"word": "Term 1", "tooltip": "Explanation for term 1"}},
    {{"word": "Term 2", "tooltip": "Explanation for term 2"}}
  ],
  "references": [
    "Source 1: Publication name, article title, link, date",
    "Source 2: Publication name, article title, link, date"
  ]
}}

DO NOT nest JSON objects inside the content field. Keep tooltip_words as a separate array at the top level.
Include at least 5-8 important tooltip words with clear explanations for terms ACTUALLY USED in the content.
"""
    
    try:
        # Use schema-based approach for structured response
        from app.services.ai.schemas import NEWS_ARTICLE_SCHEMA
        
        # Get structured response using the schema
        article = call_perplexity_api_with_schema(prompt, NEWS_ARTICLE_SCHEMA)
        
        # Add reading time estimate (avg reading speed: 250 words/min)
        content_words = len(article["content"].split())
        article["reading_time_minutes"] = max(1, round(content_words / 250))
        
        return article
            
    except Exception as e:
        logger.error(f"Error generating news article: {e}")
        # Return fallback article with separate tooltips
        return {
            "title": "Market Update: Latest Developments in Finance",
            "content": "We apologize, but we couldn't generate the article you requested. Please try again later.\n\nThis content would normally contain an analysis of recent financial news with relevant citations [1].\n\n## References\n[1] System Error Log. Financial article generation service, unavailable.",
            "tooltip_words": [
                {"word": "Market Volatility", "tooltip": "The rate at which the price of assets increases or decreases."},
                {"word": "Inflation", "tooltip": "The rate at which prices for goods and services rise over time."}
            ],
            "references": [
                "Financial Times. (2023). Latest market developments, https://ft.com, Recent date.",
                "System Error Log. Financial article generation service, unavailable."
            ],
            "reading_time_minutes": 1
        }

def get_financial_glossary_term(expertise_level: str) -> List[Dict[str, Any]]:
    """Get financial glossary terms tailored to user's expertise level.
    
    Args:
        expertise_level: User's expertise level
        
    Returns:
        List of three financial terms with definitions and examples
    """
    prompt = f"""Generate EXACTLY THREE different 'Financial Terms of the Day' for a {expertise_level}-level investor.

You MUST return THREE terms, not more, not less.

Each term should be:
1. Appropriate for a {expertise_level} level of understanding
2. Relevant to current financial markets or fundamental concepts
3. Explained clearly with a definition
4. Illustrated with a practical example
"""
    
    try:
        # Use schema-based approach for structured response
        from app.services.ai.schemas import GLOSSARY_TERMS_SCHEMA
        
        # Get structured response using the schema
        terms_data = call_perplexity_api_with_schema(prompt, GLOSSARY_TERMS_SCHEMA)
        
        # Ensure we have a list of exactly three terms
        if not isinstance(terms_data, list):
            logger.warning(f"Expected list but got {type(terms_data)}, converting to list")
            # If it's a single term dictionary, wrap it in a list
            if isinstance(terms_data, dict) and "term" in terms_data:
                terms_data = [terms_data]
            else:
                terms_data = []
        
        # Ensure we have exactly 3 terms
        while len(terms_data) < 3:
            logger.warning(f"Only got {len(terms_data)} terms, adding fallback terms")
            # Add fallback terms if we have fewer than 3
            fallback_terms = [
                {
                    "term": "Financial Literacy",
                    "definition": "The ability to understand and effectively use various financial skills.",
                    "example": "Understanding how investments work and managing a budget."
                },
                {
                    "term": "Compound Interest",
                    "definition": "Interest calculated on both the initial principal and previously accumulated interest.",
                    "example": "A $1,000 investment earning 5% compounded annually becomes $1,276 after 5 years."
                },
                {
                    "term": "Risk Tolerance",
                    "definition": "The degree of variability in investment returns that an investor is willing to withstand.",
                    "example": "A conservative investor might prefer bonds over volatile stocks."
                }
            ]
            # Add terms we don't already have
            for term in fallback_terms:
                if len(terms_data) < 3:
                    terms_data.append(term)
        
        # Limit to exactly 3 terms
        return terms_data[:3]
        
    except Exception as e:
        logger.error(f"Error generating glossary terms: {e}")
        # Return fallback list of 3 terms
        return [
            {
                "term": "Financial Literacy",
                "definition": "The ability to understand and effectively use various financial skills.",
                "example": "Understanding how investments work and managing a budget."
            },
            {
                "term": "Compound Interest",
                "definition": "Interest calculated on both the initial principal and accumulated interest.",
                "example": "A $1,000 investment earning 5% compounded annually becomes $1,276 after 5 years."
            },
            {
                "term": "Risk Tolerance",
                "definition": "The degree of variability in investment returns an investor can withstand.",
                "example": "A conservative investor might prefer bonds over volatile stocks."
            }
        ]

def get_finance_quote() -> Dict[str, Any]:
    """Get motivational finance quote of the day.
    
    Returns:
        Quote with author
    """
    prompt = """Generate an inspiring quote related to finance, investing, or money management.

The quote should be:
1. Motivational or thought-provoking
2. Attributed to a real person (famous investor, entrepreneur, economist, etc.)
3. Relevant to financial success or wisdom
"""
    
    try:
        # Use schema-based approach for structured response
        from app.services.ai.schemas import FINANCE_QUOTE_SCHEMA
        
        # Get structured response using the schema
        quote_data = call_perplexity_api_with_schema(prompt, FINANCE_QUOTE_SCHEMA)
        
        # Rename key from 'text' to 'quote' for backwards compatibility if needed
        if 'text' in quote_data and 'quote' not in quote_data:
            quote_data['quote'] = quote_data['text']
            
        return quote_data
        
    except Exception as e:
        logger.error(f"Error generating finance quote: {e}")
        return {
            "text": "The best investment you can make is in yourself.",
            "author": "Warren Buffett"
        }