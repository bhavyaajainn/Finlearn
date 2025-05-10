"""Claude AI integration service via AWS Bedrock.

This module handles interactions with Claude 3.7 Sonnet via AWS Bedrock
for financial insights and analysis.
"""
import json
import boto3
from typing import List, Dict, Any, Optional
from app.services.ai.prompts.finance_prompts import get_concept_explanation_prompt
from app.services.ai.prompts.learning_prompts import get_day_summary_prompt, get_topic_article_prompt
from app.services.ai.prompts.research_prompts import get_deep_dive_prompt
import uuid
from datetime import datetime
from app.services.ai.prompts.learning_prompts import (
    get_beginner_article_prompt,
    get_intermediate_article_prompt,
    get_advanced_article_prompt
)

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
        "max_tokens": 4000, 
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


def get_deep_dive(topic: str) -> Dict[str, Any]:
    """Generate a deep dive analysis on a financial topic.
    
    Args:
        topic: The financial topic to analyze
        
    Returns:
        Detailed research insight on the topic
    """
    prompt = get_deep_dive_prompt(topic)
    response = invoke_claude(prompt)
    
    # Handle potential JSON parsing errors
    try:
        # Parse the JSON response
        parsed_response = json.loads(response)
        # Ensure tooltip_words is always a list of dictionaries
        tooltip_words = parsed_response.get("tooltip_words", [])
        if not isinstance(tooltip_words, list):
            tooltip_words = []

        return {
            "text": parsed_response.get("text", ""),
            "tooltip_words": tooltip_words
        }
    except json.JSONDecodeError:
        # Fallback if response isn't valid JSON
        return {
            "text": response,
            "tooltip_words": []
        }


def get_concept_summary(concept: str) -> str:
    """Get a concise explanation of a financial concept.
    
    Args:
        concept: The financial concept to explain
        
    Returns:
        A concise explanation of the concept
    """
    prompt = get_concept_explanation_prompt(concept)
    # prompt = f"In finance, explain the concept of: {concept}"
    return invoke_claude(prompt)


def generate_day_summary(topics: List[Dict[str, str]]) -> str:
    """Generate a summary of all topics a user has learned about in a day.
    Args:
        topics: List of topic dictionaries with keys "topic" and optional "subtopic"
    Returns:
        A summary connecting all the topics with quiz questions
    """
    prompt = get_day_summary_prompt(topics)
    # joined = ", ".join(t["topic"] for t in topics)
    # prompt = f"Summarize what a user learned today based on reading: {joined}. Then give 3 quiz questions on it."
    return invoke_claude(prompt)

# Add this function to the file
def generate_article(
    category: str,
    expertise_level: str,
    topic: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate a financial article using Claude API.
    
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
    
    # Call Claude API
    try:
        response = invoke_claude(prompt)
        
        # Parse the response and ensure it has the expected format
        try:
            # Try to parse the response as JSON
            # Sometimes the model might wrap the JSON in markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                parsed_article = json.loads(json_str)
            else:
                parsed_article = json.loads(response)
            
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
                
            return parsed_article
            
        except json.JSONDecodeError:
            # Fallback if response isn't valid JSON
            return {
                "id": str(uuid.uuid4()),
                "title": f"Latest in {category.capitalize()}",
                "content": response,
                "tooltip_words": [],
                "key_concepts": [],
                "difficulty_level": expertise_level,
                "category": category,
                "created_at": datetime.now().isoformat()
            }
            
    except Exception as e:
        # Handle API errors
        print(f"Error generating article with Claude: {e}")
        return {
            "id": str(uuid.uuid4()),
            "title": f"Error generating {category} article",
            "content": f"Failed to generate article: {str(e)}",
            "tooltip_words": [],
            "key_concepts": [],
            "difficulty_level": expertise_level,
            "category": category,
            "created_at": datetime.now().isoformat()
        }



def generate_category_topics(category: str, expertise_level: str) -> List[Dict[str, Any]]:
    """Generate a list of specific topics within a financial category.
    
    Args:
        category: The financial category
        expertise_level: Target audience expertise level
        
    Returns:
        List of topics with descriptions
    """
    prompt = f"""Generate a list of 8-10 specific topics or concepts within the financial category of {category} that would be appropriate for a {expertise_level} level audience.
    
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
    
    response = invoke_claude(prompt)
    
    # Parse the response
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
                "importance": "Essential foundation for understanding this area"
            },
            {
                "topic_id": str(uuid.uuid4()),
                "title": f"Current Trends in {category.capitalize()}",
                "description": f"Recent developments in {category}",
                "importance": "Staying current with market changes"
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
    
    # Get latest news context for this category using Claude
    news_context = fetch_category_news_with_claude(category)
    
    # Generate topics based on latest news
    topics = generate_news_based_topics(category, expertise_level, news_context)
    
    # Cache the topics with today's timestamp
    cache_topics(category, expertise_level, topics)
    
    return topics

def fetch_category_news_with_claude(category: str) -> str:
    """Fetch latest news about a financial category using Claude.
    
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
    
    news_context = invoke_claude(prompt)
    return news_context

def generate_news_based_topics(category: str, expertise_level: str, news_context: str) -> List[Dict[str, Any]]:
    """Generate topics based on category, expertise level, and latest news.
    
    Args:
        category: Financial category
        expertise_level: Target audience expertise level
        news_context: Context about latest developments from Claude
        
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
    "topic_id": "{category}-{{uniqueId}}",
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
    
    response = invoke_claude(prompt)
    
    # Parse the response
    try:
        if "```json" in response:
            json_start = response.find("```json") + 7
            json_end = response.find("```", json_start)
            json_str = response[json_start:json_end].strip()
            topics = json.loads(json_str)
        else:
            topics = json.loads(response)
        
        # Add date to each topic for reference
        for topic in topics:
            topic["topic_id"] = str(uuid.uuid4())
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
                "generated_date": datetime.now().isoformat()
            },
            {
                "topic_id": str(uuid.uuid4()),
                "title": f"How Recent Events Impact {category.capitalize()}",
                "description": f"Understanding the implications of current events on {category}",
                "importance": "Helps anticipate market movements",
                "relevance": "Connected to ongoing economic developments",
                "generated_date": datetime.now().isoformat()
            }
        ]