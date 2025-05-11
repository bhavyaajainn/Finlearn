"""Perplexity AI integration service.

This module handles interactions with the Perplexity API for 
research and financial insights.
"""
import os
import requests
import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.services.ai.prompts.learning_prompts import (
    get_beginner_article_prompt,
    get_intermediate_article_prompt,
    get_advanced_article_prompt,
    get_topic_article_prompt
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
        "model": "sonar",  # Use the appropriate model
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

# Add these new functions to support the same functionality as Claude

def generate_category_topics(category: str, expertise_level: str) -> List[Dict[str, Any]]:
    """Generate a list of specific topics within a financial category.
    
    Args:
        category: The financial category
        expertise_level: Target audience expertise level
        
    Returns:
        List of topics with descriptions
    """
    prompt = f"""Generate a list of 2-3 specific topics or concepts within the financial category of {category} that would be appropriate for a {expertise_level} level audience.
    
    For each topic:
    1. Provide a concise but specific title (not too broad)
    2. Include a brief 1-2 sentence description
    3. Indicate why this topic is important for someone at a {expertise_level} level
    
    Format your response as valid JSON with this structure:
    [
      {{
        "topic_id": "unique-id-1",
        "title": "Topic Title 1",
        "description": "Brief description of the topic",
        "importance": "Why this topic matters for {expertise_level} learners"
      }},
      ...
    ]
    
    Ensure that:
    - For beginners: focus on foundational concepts and terminology
    - For intermediate: include practical applications and strategies
    - For advanced: cover complex mechanisms, advanced strategies, and emerging trends
    """
    
    try:
        response = call_perplexity_api(prompt)
        
        try:
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                topics = json.loads(json_str)
            else:
                topics = json.loads(response)
            
            # Add UUIDs to each topic
            for topic in topics:
                if "topic_id" not in topic or topic["topic_id"].startswith("unique-id"):
                    topic["topic_id"] = str(uuid.uuid4())
                
                # Add category and level for reference
                topic["category"] = category
                topic["expertise_level"] = expertise_level
            
            return topics
        except json.JSONDecodeError:
            # Fallback with basic topics if parsing fails
            return [
                {
                    "topic_id": str(uuid.uuid4()),
                    "title": f"{category.capitalize()} Fundamentals",
                    "description": f"Basic overview of {category}",
                    "importance": "Essential foundation for understanding this area",
                    "category": category,
                    "expertise_level": expertise_level
                },
                {
                    "topic_id": str(uuid.uuid4()),
                    "title": f"Current Trends in {category.capitalize()}",
                    "description": f"Recent developments in {category}",
                    "importance": "Staying current with market changes",
                    "category": category,
                    "expertise_level": expertise_level
                }
            ]
    except Exception as e:
        print(f"Error generating category topics: {e}")
        # Fallback with basic topics if API fails
        return [
            {
                "topic_id": str(uuid.uuid4()),
                "title": f"{category.capitalize()} Fundamentals",
                "description": f"Basic overview of {category}",
                "importance": "Essential foundation for understanding this area",
                "category": category,
                "expertise_level": expertise_level
            },
            {
                "topic_id": str(uuid.uuid4()),
                "title": f"Current Trends in {category.capitalize()}",
                "description": f"Recent developments in {category}",
                "importance": "Staying current with market changes",
                "category": category,
                "expertise_level": expertise_level
            }
        ]


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

Generate a list of 8-10 specific topics within the financial category of {category} that would be:
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


# Update the existing generate_article function to handle topic parameter
def generate_article(
    category: str,
    expertise_level: str,
    topic: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate a financial article using Perplexity SONAR API.
    
    Args:
        category: Financial category for the article
        expertise_level: Target audience expertise level (beginner, intermediate, advanced)
        topic: Specific topic within the category (optional)
        user_id: Optional user identifier for personalization
        
    Returns:
        Dictionary containing the generated article with tooltips
    """
    # Select the appropriate prompt based on expertise level and topic specificity
    if topic:
        # Use topic-specific prompt when a topic is provided
        prompt = get_topic_article_prompt(category, topic, expertise_level)
    else:
        # Fall back to category-level prompts
        if expertise_level == "beginner":
            prompt = get_beginner_article_prompt(category)
        elif expertise_level == "advanced":
            prompt = get_advanced_article_prompt(category)
        else:  # Default to intermediate
            prompt = get_intermediate_article_prompt(category)
    
    # Call Perplexity SONAR API
    try:
        article = call_perplexity_api(prompt)
        
        # Parse the response and ensure it has the expected format
        try:
            # Try to parse the response as JSON
            if "```json" in article:
                json_start = article.find("```json") + 7
                json_end = article.find("```", json_start)
                json_str = article[json_start:json_end].strip()
                parsed_article = json.loads(json_str)
            else:
                # If not in a code block, try to parse the entire response
                parsed_article = json.loads(article)
                
            # Add unique ID and timestamp if not present
            if "id" not in parsed_article:
                parsed_article["id"] = str(uuid.uuid4())
            
            if "created_at" not in parsed_article:
                parsed_article["created_at"] = datetime.now().isoformat()
                
            # Ensure the response has all required fields
            if "tooltip_words" not in parsed_article:
                parsed_article["tooltip_words"] = []
                
            if "key_concepts" not in parsed_article:
                parsed_article["key_concepts"] = []
                
            if "topic" not in parsed_article and topic:
                parsed_article["topic"] = topic
                
            if "category" not in parsed_article:
                parsed_article["category"] = category
                
            if "difficulty_level" not in parsed_article:
                parsed_article["difficulty_level"] = expertise_level
                
            return parsed_article
            
        except json.JSONDecodeError:
            # Fallback if response isn't valid JSON
            return {
                "id": str(uuid.uuid4()),
                "title": f"Latest in {category.capitalize()}" + (f": {topic}" if topic else ""),
                "content": article,
                "tooltip_words": [],
                "key_concepts": [],
                "difficulty_level": expertise_level,
                "category": category,
                "topic": topic,
                "created_at": datetime.now().isoformat()
            }
            
    except Exception as e:
        # Handle API errors
        print(f"Error generating article with Perplexity: {e}")
        return {
            "id": str(uuid.uuid4()),
            "title": f"Error generating {category}" + (f" {topic}" if topic else "") + " article",
            "content": f"Failed to generate article: {str(e)}",
            "tooltip_words": [],
            "key_concepts": [],
            "difficulty_level": expertise_level,
            "category": category,
            "topic": topic if topic else None,
            "created_at": datetime.now().isoformat()
        }
    

def generate_reading_summary(
    user_id: str,
    read_articles: List[Dict[str, Any]],
    tooltips: List[Dict[str, Any]],
    period: str,
    stats: Dict[str, Any]
) -> str:
    """Generate an AI summary of user's reading activity.
    
    Args:
        user_id: User identifier
        read_articles: List of articles read by the user
        tooltips: List of tooltips viewed by the user
        period: Time period (day, week, month)
        stats: Calculated statistics
        
    Returns:
        AI-generated summary text
    """
    # Create article list for prompt
    article_list = []
    for article in read_articles:
        category = article.get("category", "uncategorized")
        if "topic_details" in article and article["topic_details"]:
            title = article["topic_details"].get("title", "Untitled")
            description = article["topic_details"].get("description", "")
            article_list.append(f"- {title} ({category}): {description}")
        else:
            topic_id = article.get("topic_id", "unknown")
            article_list.append(f"- Article on {category} (ID: {topic_id})")
    
    # Create tooltip list for prompt
    tooltip_list = []
    for tip in tooltips[:10]:  # Limit to 10 for prompt size
        word = tip.get("word", "unknown term")
        tooltip_list.append(f"- {word}")
    
    # Build prompt
    period_text = "today" if period == "day" else f"this {period}"
    
    prompt = f"""Create a personalized financial learning summary for a user based on their reading activity {period_text}. 
    
User's reading statistics:
- Total articles read: {stats['total_articles_read']}
- Total tooltips viewed: {stats['total_tooltips_viewed']}
- Top categories: {', '.join(f"{cat} ({count})" for cat, count in stats.get('top_categories', [])[:3])}
- Current reading level: {stats.get('predominant_level', 'intermediate')}

Articles read:
{chr(10).join(article_list[:10]) if article_list else "No articles read in this period."}

Financial terms explored:
{chr(10).join(tooltip_list) if tooltip_list else "No financial terms explored in this period."}

Please provide:
1. A personalized summary of their learning activity
2. Insights about their focus areas
3. Suggestions for what to explore next based on their interests
4. A motivational note about their learning streak and progress

Keep the summary conversational, encouraging, and highlight patterns in their learning habits.
"""
    
    try:
        summary = call_perplexity_api(prompt)
        return summary
    except Exception as e:
        print(f"Error generating reading summary: {e}")
        # Fallback response
        return f"You've read {stats['total_articles_read']} articles and explored {stats['total_tooltips_viewed']} financial terms {period_text}. Keep up the great work on your financial learning journey!"