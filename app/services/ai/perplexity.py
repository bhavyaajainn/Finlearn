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
import logging  # Add standard Python logging instead

# Create a logger instance for this module
logger = logging.getLogger(__name__)

from app.services.ai.prompts.learning_prompts import (
    get_article_prompt,
    get_beginner_article_prompt,
    get_intermediate_article_prompt,
    get_advanced_article_prompt,
    get_topic_article_prompt
)
from app.services.ai.prompts.asset_prompts import (
    get_asset_search_prompt,
    get_comprehensive_research_prompt,
    get_similar_stocks_prompt,
    get_similar_crypto_prompt
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
# Update this function to properly extract tooltips

def generate_article(
    category: str,
    expertise_level: str,
    topic: Optional[str] = None,
    user_id: Optional[str] = None
) -> Dict[str, Any]:
    """Generate a financial article using Perplexity SONAR API."""
    # Select appropriate prompt
    prompt = get_article_prompt(category, expertise_level, topic)
        
    # Call Perplexity SONAR API
    try:
        response = call_perplexity_api(prompt)
        
        # Parse the response and ensure it has the expected format
        try:
            # Handle various JSON formats
            if response.startswith("```json"):
                response = response[7:-3].strip()
            elif "json\n{" in response:
                json_start = response.find("json\n{") + 5
                json_end = response.rfind("}")
                if json_end > json_start:
                    response = response[json_start:json_end+1].strip()
            
            # Parse the outer JSON
            parsed = json.loads(response)
            
            # Initialize result structure
            result = {
                "id": str(uuid.uuid4()),
                "title": None,
                "content": None,
                "tooltip_words": [],
                "difficulty_level": expertise_level,
                "category": category,
                "topic": topic if topic else category,
                "created_at": datetime.now().isoformat()
            }
            
            # Check if content field contains nested JSON
            if isinstance(parsed.get("content"), str) and parsed["content"].strip().startswith("{"):
                try:
                    # Replace any problematic newlines or special characters in JSON
                    content_json_str = parsed["content"].replace('\n', '\\n')
                    
                    # Try to parse the nested JSON using a more robust method
                    import re
                    json_match = re.search(r'\{.*\}', content_json_str, re.DOTALL)
                    if json_match:
                        nested_json_str = json_match.group(0)
                        try:
                            content_json = json.loads(nested_json_str)
                            
                            # Extract title and content from nested JSON
                            if "title" in content_json:
                                result["title"] = content_json["title"]
                            if "content" in content_json:
                                result["content"] = content_json["content"]
                                
                            # Extract tooltips from nested JSON
                            if "tooltip_words" in content_json and isinstance(content_json["tooltip_words"], list):
                                result["tooltip_words"] = content_json["tooltip_words"]
                                logger.info(f"Extracted {len(content_json['tooltip_words'])} tooltips from nested JSON")
                        except json.JSONDecodeError:
                            # If that fails, try manual regex extraction
                            title_match = re.search(r'"title":\s*"([^"]+)"', nested_json_str)
                            if title_match:
                                result["title"] = title_match.group(1)
                                
                            content_match = re.search(r'"content":\s*"([^"]+)"', nested_json_str, re.DOTALL)
                            if content_match:
                                result["content"] = content_match.group(1)
                                
                            tooltip_match = re.search(r'"tooltip_words":\s*(\[\s*\{.*?\}\s*\])', nested_json_str, re.DOTALL)
                            if tooltip_match:
                                try:
                                    tooltip_list = json.loads(tooltip_match.group(1))
                                    result["tooltip_words"] = tooltip_list
                                except:
                                    pass
                except Exception as e:
                    logger.error(f"Error extracting from nested JSON: {e}")
            
            # If we haven't set title/content from nested JSON, use the outer JSON
            if not result["title"]:
                result["title"] = parsed.get("title", f"Latest in {category.capitalize()}" + (f": {topic}" if topic else ""))
            if not result["content"]:
                result["content"] = parsed.get("content", "")
            
            # If we still have no tooltips, check the outer JSON
            if not result["tooltip_words"] and "tooltip_words" in parsed:
                result["tooltip_words"] = parsed["tooltip_words"]
            
            return result
        # Handle API errors as before
               
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")

            return {
                "id": str(uuid.uuid4()),
                "title": f"Latest in {category.capitalize()}" + (f": {topic}" if topic else ""),
                "content": response,
                "tooltip_words": [],  # No key_concepts
                "difficulty_level": expertise_level,
                "category": category, 
                "topic": topic if topic else category,
                "created_at": datetime.now().isoformat()
            }
            
    except Exception as e:
        # Handle API errors
        logger.error(f"Error generating article with Perplexity: {e}")
        return {
            "id": str(uuid.uuid4()),
            "title": f"Error generating {category}" + (f" {topic}" if topic else "") + " article",
            "content": f"Failed to generate article: {str(e)}",
            "tooltip_words": [],  # No key_concepts
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

####ASSETS######

def search_assets_with_perplexity(query: str, asset_type: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
    """Search for financial assets using Perplexity SONAR."""
    prompt = get_asset_search_prompt(query, asset_type, limit)
    
    try:
        response = call_perplexity_api(prompt)
        
        # Extract JSON from response
        if "```json" in response:
            json_start = response.find("```json") + 7
            json_end = response.find("```", json_start)
            json_str = response[json_start:json_end].strip()
            results = json.loads(json_str)
        else:
            # Try to parse the entire response
            try:
                results = json.loads(response)
            except:
                # If parsing fails, return empty list
                logger.error(f"Failed to parse JSON response from Perplexity: {response}")
                return []
        
        return results[:limit]
    except Exception as e:
        logger.error(f"Error searching assets with Perplexity: {e}")
        return [] 


def get_similar_stocks(symbol: str, limit: int = 3) -> List[Dict[str, Any]]:
    """Get similar stocks based on business model, sector, and competition."""
    prompt = get_similar_stocks_prompt(symbol, limit)
    
    try:
        response = call_perplexity_api(prompt)
        if "```json" in response:
            json_start = response.find("```json") + 7
            json_end = response.find("```", json_start)
            json_str = response[json_start:json_end].strip()
            results = json.loads(json_str)
        else:
            # Try to parse the entire response
            try:
                results = json.loads(response)
            except:
                # If parsing fails, return empty list
                logger.error(f"Failed to parse JSON response from Perplexity: {response}")
                return []
        
        return results[:limit]
        # ...
    except Exception as e:
        print(f"Error finding similar stocks: {e}")
        return []


def get_similar_crypto(symbol: str, limit: int = 3) -> List[Dict[str, Any]]:
    """Get similar cryptocurrencies based on technology and use case."""
    prompt = get_similar_crypto_prompt(symbol, limit)
    
    try:
        response = call_perplexity_api(prompt)
        if "```json" in response:
            json_start = response.find("```json") + 7
            json_end = response.find("```", json_start)
            json_str = response[json_start:json_end].strip()
            results = json.loads(json_str)
        else:
            # Try to parse the entire response
            try:
                results = json.loads(response)
            except:
                # If parsing fails, return empty list
                logger.error(f"Failed to parse JSON response from Perplexity: {response}")
                return []
        
        return results[:limit]
    except Exception as e:
        print(f"Error finding similar cryptocurrencies: {e}")
        return []



## analysis
from app.services.ai.prompts.asset_prompts import get_narrative_research_prompt

def get_narrative_asset_analysis(
    symbol: str,
    asset_type: str,
    expertise_level: str,
    asset_info: Dict[str, Any],
    similar_assets: List[Dict[str, Any]] = None,
    user_interests: List[str] = None
) -> Dict[str, Any]:
    """Generate narrative research article with embedded tooltips.
    
    Args:
        symbol: Asset symbol
        asset_type: Type of asset (stock/crypto)
        expertise_level: User's expertise level (beginner/intermediate/advanced)
        asset_info: Detailed asset information
        similar_assets: List of similar assets for comparison
        user_interests: User's investment interests/categories
        
    Returns:
        Dictionary with sections of the research article and embedded tooltips
    """
    # Create the narrative research prompt
    prompt = get_narrative_research_prompt(
        symbol=symbol,
        asset_type=asset_type,
        expertise_level=expertise_level,
        asset_info=asset_info,
        similar_assets=similar_assets,
        user_interests=user_interests
    )
    
    try:
        # Use SONAR model for deep research capabilities
        response = call_perplexity_api(prompt)
        
        # Parse the response as a JSON object with article sections
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                research = json.loads(json_str)
            else:
                # Try parsing the entire response as JSON
                research = json.loads(response)
                
            # Make sure all expected sections are present
            required_sections = [
                "title", "summary", "introduction", "sections", 
                "comparison", "conclusion", "recommendation"
            ]
            
            for section in required_sections:
                if section not in research:
                    research[section] = f"Missing {section} section"
                    
            return research
            
        except Exception as e:
            logger.error(f"Error parsing research JSON: {e}")
            # If JSON parsing fails, structure the raw text
            sections = response.split("\n\n## ")
            
            if len(sections) > 1:
                # Try to extract title
                title_section = sections[0]
                if title_section.startswith("# "):
                    title = title_section.split("\n")[0].replace("# ", "")
                else:
                    title = f"Research Analysis: {symbol}"
                    
                # Structure the remaining content
                article_sections = []
                for section in sections[1:]:
                    if section.strip():
                        parts = section.split("\n", 1)
                        if len(parts) > 1:
                            section_title = parts[0].strip()
                            section_content = parts[1].strip()
                            article_sections.append({
                                "title": section_title,
                                "content": section_content
                            })
                
                return {
                    "title": title,
                    "summary": sections[0].replace("# " + title, "").strip(),
                    "sections": article_sections,
                    "format": "text"
                }
            
            # If we can't parse sections, return the raw text
            return {
                "title": f"Research Analysis: {symbol}",
                "content": response,
                "format": "raw_text"
            }
        
    except Exception as e:
        logger.error(f"Error generating narrative analysis: {e}")
        return {
            "error": str(e),
            "title": f"Unable to generate analysis for {symbol}",
            "content": f"An error occurred: {str(e)}"
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
        response = call_perplexity_api(prompt)
        # Parse the response as a JSON object with article sections
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                research = json.loads(json_str)
            else:
                # Try parsing the entire response as JSON
                research = json.loads(response)
                
            # Make sure all expected sections are present
            required_sections = [
                "title", "summary", "sections", 
                "connections", "conclusion", "recommendation"
            ]
            
            for section in required_sections:
                if section not in research:
                    research[section] = f"Missing {section} section"
                    
            return research
            
        except Exception as e:
            logger.error(f"Error parsing interactive research JSON: {e}")
            # If JSON parsing fails, structure the raw text
            sections = response.split("\n\n## ")
            
            if len(sections) > 1:
                # Try to extract greeting and title
                greeting_section = sections[0]
                title = greeting_section.split("\n")[0].replace("# ", "")
                greeting = greeting_section.replace("# " + title, "").strip()
                    
                # Structure the remaining content
                article_sections = []
                for section in sections[1:]:
                    if section.strip():
                        parts = section.split("\n", 1)
                        if len(parts) > 1:
                            section_title = parts[0].strip()
                            section_content = parts[1].strip()
                            article_sections.append({
                                "title": section_title,
                                "content": section_content
                            })
                
                return {
                    "title": title,
                    "sections": article_sections,
                    "format": "text"
                }
            
            # If we can't parse sections, return the raw text
            return {
                "title": f"Research Analysis: {symbol}",
                "content": response,
                "format": "raw_text"
            }
        
    except Exception as e:
        logger.error(f"Error generating interactive analysis: {e}")
        return {
            "error": str(e),
            "title": f"Unable to generate analysis for {symbol}",
            "content": f"We apologize, but we encountered an error while preparing your personalized research: {str(e)}"
        }



def fetch_asset_news(
    symbol: str, 
    asset_type: str,
    limit: int = 3,
    include_citations: bool = True
) -> List[Dict[str, Any]]:
    """Fetch recent news for a specific asset using Perplexity with proper citations.
    
    Args:
        symbol: Asset symbol
        asset_type: Type of asset (stock/crypto)
        limit: Maximum number of news items to return
        include_citations: Whether to include detailed citation information
        
    Returns:
        List of recent news items with analysis and citations
    """
    # Create prompt for Perplexity API
    prompt = f"""Find the {limit} most significant recent news stories about {symbol} ({asset_type}) from the past 2 weeks.

For each news item, provide:
1. Headline
2. Date published (in ISO format YYYY-MM-DD)
3. Source name (publication or website)
4. Author(s) if available
5. URL to the original article
6. Brief summary (1-2 sentences)
7. Potential impact on the asset (positive/negative/neutral and why)

{"Include citation information that allows proper attribution of the news sources." if include_citations else ""}

Format your response as a valid JSON array with this structure:
[
  {{
    "headline": "Example Headline About {symbol}",
    "date": "2023-05-10",
    "source": "Bloomberg",
    "author": "John Smith",
    "url": "https://example.com/article-link",
    "summary": "Brief summary of the news item.",
    "impact": {{
      "direction": "positive",  // or "negative" or "neutral"
      "reason": "Explanation of why this news is positive/negative/neutral for {symbol}"
    }},
    "citation": "Smith, J. (2023, May 10). Example Headline About {symbol}. Bloomberg. https://example.com/article-link"
  }}
]

Only return the most important news that could potentially affect the asset's value or investment thesis. Ensure all URLs and citation information are accurate.
"""
    
    try:
        response = call_perplexity_api(prompt)
        
        # Parse the response
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                news_items = json.loads(json_str)
            else:
                # Try to parse the entire response as JSON
                news_items = json.loads(response)
            
            # Ensure the response is a list
            if not isinstance(news_items, list):
                logger.warning(f"Unexpected news response format for {symbol}: {type(news_items)}")
                return []
                
            # Validate and enhance each news item
            validated_items = []
            for item in news_items:
                if "headline" in item and "summary" in item:
                    # Ensure impact is properly formatted
                    if "impact" not in item or not isinstance(item["impact"], dict):
                        item["impact"] = {
                            "direction": "neutral",
                            "reason": "Impact assessment not available"
                        }
                    
                    # Ensure date is present
                    if "date" not in item:
                        item["date"] = "recent"
                    
                    # Ensure source is present
                    if "source" not in item:
                        item["source"] = "Financial news source"
                    
                    # Generate citation if not provided
                    if include_citations and "citation" not in item:
                        # Build a citation in APA format if we have the necessary parts
                        authors = item.get("author", "")
                        year = item.get("date", "")[:4] if item.get("date") else ""
                        title = item.get("headline", "")
                        source = item.get("source", "")
                        url = item.get("url", "")
                        
                        if year and title and source:
                            if authors:
                                last_name = authors.split()[-1]
                                item["citation"] = f"{last_name}, {authors[0]}. ({year}). {title}. {source}. {url}"
                            else:
                                item["citation"] = f"{source}. ({year}). {title}. {url}"
                        else:
                            item["citation"] = f"Source: {item.get('source', 'Not available')}"
                    
                    validated_items.append(item)
            
            return validated_items[:limit]
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse news JSON for {symbol}: {e}")
            # Attempt to extract news from text if JSON parsing fails
            fallback_news = []
            if "headlines" in response.lower() or "news" in response.lower():
                parts = response.split("\n\n")
                for part in parts:
                    if ":" in part and len(part.strip()) > 20:
                        fallback_news.append({
                            "headline": part.strip()[:100],
                            "date": "recent",
                            "source": "Financial news",
                            "summary": part.strip()[:200],
                            "impact": {
                                "direction": "neutral",
                                "reason": "Impact assessment not available"
                            },
                            "citation": "Source information not available"
                        })
            return fallback_news[:limit]
        
    except Exception as e:
        logger.error(f"Error fetching news for {symbol}: {e}")
        return []


# Add these functions to your existing perplexity.py file

def fetch_trending_finance_news(
    expertise_level: str,
    user_interests: List[str] = None,
    limit: int = 3
) -> List[Dict[str, Any]]:
    """Fetch trending finance news tailored to the user's expertise and interests.
    
    Args:
        expertise_level: User's expertise level (beginner/intermediate/advanced)
        user_interests: List of financial topics the user is interested in
        limit: Maximum number of news items to return
        
    Returns:
        List of trending news items with details
    """
    # Create interest string for personalization
    interest_str = ", ".join(user_interests) if user_interests else "general finance"
    
    prompt = f"""Find the {limit} most significant trending finance news stories from the past 24 hours.
    
Focus on topics related to: {interest_str}

The content should be appropriate for a {expertise_level}-level investor.

For each news item, provide:
1. A unique ID (create an alphanumeric identifier)
2. Headline (attention-grabbing but accurate)
3. Brief summary (1-2 sentences)
4. Category (e.g., stocks, cryptocurrency, personal finance)
5. Why it matters (explain significance for investors at {expertise_level} level)
6. Source name (publication)
7. Publication date (ISO format)

Format your response as a valid JSON array with this structure:
[
  {{
    "id": "unique-alphanumeric-id",
    "headline": "Headline about the news",
    "summary": "Brief summary of the news item",
    "category": "Category of the news",
    "why_it_matters": "Why this news is significant",
    "source": "Source publication",
    "date": "2023-05-15T13:45:00Z"
  }},
  ...
]
"""
    
    try:
        response = call_perplexity_api(prompt)
        
        # Parse the response
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                news_items = json.loads(json_str)
            else:
                # Try parsing the entire response as JSON
                news_items = json.loads(response)
            
            # Ensure the response is a list
            if not isinstance(news_items, list):
                logger.warning(f"Unexpected news response format: {type(news_items)}")
                return []
            
            return news_items[:limit]
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse news JSON: {e}")
            return []
        
    except Exception as e:
        logger.error(f"Error fetching trending finance news: {e}")
        return []

def generate_news_article(
    news_id: str,
    expertise_level: str
) -> Dict[str, Any]:
    """Generate a detailed article for a trending news item with appropriate tooltips.
    
    Args:
        news_id: ID of the news item
        expertise_level: User's expertise level
        
    Returns:
        Detailed article with tooltips
    """
    prompt = f"""Write a comprehensive analysis of a recent financial news story for a {expertise_level}-level investor.

IMPORTANT FORMATTING: For any financial term or concept that might need explanation for a {expertise_level}-level reader, embed a tooltip using this exact format:
"[concept name]{{tooltip:Explanation appropriate for {expertise_level} level.}}"

Examples:
- "The [Federal Reserve]{{tooltip:The central banking system of the United States that manages the country's monetary policy.}} announced..."
- "This could impact the [yield curve]{{tooltip:A line plotting interest rates of bonds with equal credit quality but different maturity dates.}}..."

Your article should:
1. Start with a compelling title and introduction
2. Provide thorough analysis of the news and its implications
3. Include relevant context and background information
4. Discuss potential impacts on different market sectors
5. Mention expert opinions or market reactions
6. End with a conclusion or outlook

Include at least 5-10 tooltips for financial terms appropriate to the user's {expertise_level} level.

Format your response as a valid JSON object with these fields:
{{
  "title": "Engaging article title",
  "content": "Full article with embedded tooltips using the format specified",
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "related_topics": ["Topic 1", "Topic 2"]
}}
"""
    
    try:
        response = call_perplexity_api(prompt)
        
        # Parse the response
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                article = json.loads(json_str)
            else:
                # Try parsing the entire response as JSON
                article = json.loads(response)
            
            return article
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse article JSON: {e}")
            # Return a basic structure for the article if JSON parsing fails
            return {
                "title": "Analysis of Recent Financial News",
                "content": response,
                "key_points": ["Unable to format key points"],
                "related_topics": []
            }
        
    except Exception as e:
        logger.error(f"Error generating news article: {e}")
        return {
            "title": "Error Generating Article",
            "content": f"We encountered an error while generating this article: {str(e)}",
            "key_points": [],
            "related_topics": []
        }

def get_financial_glossary_term(expertise_level: str) -> Dict[str, Any]:
    """Get financial glossary terms of the day tailored to user's expertise level.
    
    Args:
        expertise_level: User's expertise level
        
    Returns:
        Three financial terms with definitions and examples
    """
    prompt = f"""Generate three different 'Financial Terms of the Day' for a {expertise_level}-level investor.

Each term should be:
1. Appropriate for a {expertise_level} level of understanding
2. Relevant to current financial markets or fundamental concepts
3. Explained clearly with a definition
4. Illustrated with a practical example
5. Accompanied by why it's important to understand

The three terms should cover different areas of finance (e.g., investing, economics, personal finance).

Format your response as a valid JSON object with these fields:
{{
  "terms": [
    {{
      "term": "First financial term",
      "definition": "Clear and concise definition",
      "example": "Practical example of the term in use",
      "importance": "Why this term matters for investors"
    }},
    {{
      "term": "Second financial term",
      "definition": "Clear and concise definition",
      "example": "Practical example of the term in use",
      "importance": "Why this term matters for investors"
    }},
    {{
      "term": "Third financial term",
      "definition": "Clear and concise definition",
      "example": "Practical example of the term in use",
      "importance": "Why this term matters for investors"
    }}
  ]
}}
"""
    
    try:
        response = call_perplexity_api(prompt)
        
        # Parse the response
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                terms_data = json.loads(json_str)
            else:
                # Try parsing the entire response as JSON
                terms_data = json.loads(response)
            
            # Ensure we have a terms array, even if parsing didn't work as expected
            if "terms" not in terms_data or not isinstance(terms_data["terms"], list):
                # Create a default structure
                return {
                    "terms": [
                        {
                            "term": "Financial Literacy",
                            "definition": "The ability to understand and effectively use various financial skills.",
                            "example": "Understanding how investments work and managing a budget.",
                            "importance": "Helps individuals make informed financial decisions."
                        }
                    ]
                }
                
            return terms_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse glossary terms JSON: {e}")
            return {
                "terms": [
                    {
                        "term": "Financial Literacy",
                        "definition": "The ability to understand and effectively use various financial skills.",
                        "example": "Understanding how investments work and managing a budget.",
                        "importance": "Helps individuals make informed financial decisions."
                    },
                    {
                        "term": "Compound Interest",
                        "definition": "Interest calculated on both the initial principal and previously accumulated interest.",
                        "example": "A $1,000 investment earning 5% compounded annually becomes $1,276 after 5 years.",
                        "importance": "Shows how investments can grow exponentially over time."
                    },
                    {
                        "term": "Risk Tolerance",
                        "definition": "The degree of variability in investment returns that an investor is willing to withstand.",
                        "example": "A conservative investor might prefer bonds over volatile stocks.",
                        "importance": "Helps determine the appropriate asset allocation for an investor."
                    }
                ]
            }
        
    except Exception as e:
        logger.error(f"Error generating glossary terms: {e}")
        return {
            "terms": [
                {
                    "term": "Error",
                    "definition": "Unable to generate terms",
                    "example": "",
                    "importance": ""
                }
            ]
        }

def get_finance_quote() -> Dict[str, Any]:
    """Get motivational finance quote of the day.
    
    Returns:
        Quote with author and explanation
    """
    prompt = """Generate an inspiring quote related to finance, investing, or money management.

The quote should be:
1. Motivational or thought-provoking
2. Attributed to a real person (famous investor, entrepreneur, economist, etc.)
3. Relevant to financial success or wisdom
4. Accompanied by a brief explanation of its meaning

Format your response as a valid JSON object with these fields:
{
  "quote": "The full quote text",
  "author": "Name of the person who said it",
  "explanation": "Brief explanation of what this quote means"
}
"""
    
    try:
        response = call_perplexity_api(prompt)
        
        # Parse the response
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
                quote = json.loads(json_str)
            else:
                # Try parsing the entire response as JSON
                quote = json.loads(response)
            
            return quote
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse quote JSON: {e}")
            return {
                "quote": "The best investment you can make is in yourself.",
                "author": "Warren Buffett",
                "explanation": "Investing in your knowledge and skills provides the highest return."
            }
        
    except Exception as e:
        logger.error(f"Error generating finance quote: {e}")
        return {
            "quote": "Error generating quote",
            "author": "",
            "explanation": ""
        }
