"""Learning routes.

This module provides endpoints for financial learning and educational content.
"""
import asyncio
from datetime import datetime, timedelta
from functools import partial
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
from enum import Enum
import calendar
import logging

logger = logging.getLogger(__name__)

# from app.services.ai import get_deep_dive, get_concept_summary, generate_day_summary, claude_generate_article
# Import both providers' functions
from app.services.ai import (
    generate_article,
    generate_category_topics,
    get_daily_topics
)

from app.services.firebase.reading_log import (
    get_daily_reading_stats,
    get_user_read_history,
    get_user_tooltip_history,
    get_user_streak_data,
    track_viewed_topic
)
from app.services.ai.perplexity import generate_article, generate_quiz_questions
from app.services.firebase import log_topic_read, get_user_day_log
from app.api.models import DeepDiveResponse,ArticleResponse, TooltipView
from app.services.ai.claude import generate_category_topics, get_deep_dive
from app.services.firebase.cache import cache_article, cache_topics, get_cached_article, get_cached_topics,find_topic_by_id, get_cached_topics_fast, get_cached_user_preferences, get_topic_by_id_fast
from app.services.firebase.categories import get_user_categories


# from app.services.ai.claude import get_daily_topics
from app.services.firebase.cache import should_refresh_topics
from app.services.firebase.reading_log import log_tooltip_viewed

from app.services.firebase.selectedcategories import get_user_selected_categories
from app.services.firebase.cache import get_cache_timestamp
from app.services.firebase.watchlist import get_user_expertise_level

# Define expertise levels as an enum for validation
class ExpertiseLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

router = APIRouter()



# @router.get("/articles", response_model=ArticleResponse)
# async def get_articles(
#     user_id: str,
#     category: Optional[str] = None,
#     topic: Optional[str] = None,
#     level: ExpertiseLevel = ExpertiseLevel.intermediate,
#     count: int = Query(2, ge=1, le=5, description="Number of articles to generate")
# ) -> Dict[str, Any]:
#     """Generate articles on financial topics using Perplexity API.
    
#     Args:
#         user_id: User identifier
#         category: Specific category to generate articles for (if None, uses user's selected categories)
#         topic: Specific topic within the category to focus on (optional)
#         level: Expertise level (beginner, intermediate, advanced)
#         count: Number of articles to generate per category
        
#     Returns:
#         Dictionary containing generated articles with tooltips for concepts
#     """
#     if topic:
#         # Generate articles focused on a specific topic
#         articles = []
#         for _ in range(count):
#             article = generate_article(
#                 category=category,
#                 topic=topic,  # Pass the specific topic
#                 expertise_level=level,
#                 user_id=user_id
#             )
#             articles.append(article)
        
#         return {
#             "user_id": user_id,
#             "level": level,
#             "articles": {category: articles}
#         }
#     else:
#         # Original category-based logic
#         categories = [category] if category else get_user_categories(user_id)
        
#         if not categories:
#             raise HTTPException(status_code=404, detail="No categories found for this user")
        
#         articles_by_category = {}
        
#         for cat in categories:
#             articles_by_category[cat] = []
#             for _ in range(count):
#                 article = generate_article(
#                     category=cat,
#                     expertise_level=level,
#                     user_id=user_id
#                 )
#                 articles_by_category[cat].append(article)
        
#         return {
#             "user_id": user_id,
#             "level": level,
#             "articles": articles_by_category
#         }



# @router.get("/topics")
# async def get_category_topics(
#     user_id: str,
#     category: str,
#     level: ExpertiseLevel = ExpertiseLevel.intermediate
# ) -> Dict[str, Any]:
#     """Get a list of relevant topics within a financial category.
    
#     Args:
#         user_id: User identifier
#         category: Financial category to explore
#         level: Expertise level (beginner, intermediate, advanced)
        
#     Returns:
#         List of topics with descriptions suitable for the expertise level
#     """
#     # Check if we have cached topics for this category and level
#     cached_topics = get_cached_topics(category, level)
    
#     if cached_topics:
#         return {
#             "category": category,
#             "level": level,
#             "topics": cached_topics
#         }
    
#     # Generate topics using AI if not cached
#     topics = generate_category_topics(category, level)
    
#     # Cache the results for future use
#     cache_topics(category, level, topics)
    
#     return {
#         "category": category,
#         "level": level,
#         "topics": topics
#     }


# @router.get("/dailytopics")
# async def get_daily_category_topics(
#     user_id: str,
#     category: str,
#     level: ExpertiseLevel = ExpertiseLevel.intermediate,
#     refresh: bool = False  # Allow manual refresh
# ) -> Dict[str, Any]:
#     """Get a list of relevant topics within a financial category based on latest news.
    
#     Args:
#         user_id: User identifier
#         category: Financial category to explore
#         level: Expertise level (beginner, intermediate, advanced)
#         refresh: Force refresh topics even if cache exists
        
#     Returns:
#         List of news-relevant topics with descriptions
#     """
#     # Check if we need to refresh
#     need_refresh = refresh or should_refresh_topics(category, level.value)
    
#     # Get or generate topics
#     if need_refresh:
#         topics = get_daily_topics(category, level.value, user_id)
#     else:
#         from app.services.firebase.cache import get_cached_topics
#         topics = get_cached_topics(category, level.value) or []
    
#     # # Get user's viewing history
#     # user_history = get_user_topic_history(user_id)
#     # viewed_topic_ids = [item['topic_id'] for item in user_history 
#     #                    if item['category'] == category]
    
#     # # Mark topics as viewed or new
#     # for topic in topics:
#     #     topic["viewed"] = topic["topic_id"] in viewed_topic_ids
    
#     # Get refresh timestamp
#     from app.services.firebase.cache import get_cache_timestamp
#     cache_time = get_cache_timestamp(category, level.value)
    
#     return {
#         "category": category,
#         "level": level,
#         "topics": topics,
#         "refreshed_at": cache_time.isoformat() if cache_time else datetime.now().isoformat(),
#         "is_fresh": need_refresh
#     }


@router.get("/user/recommendedtopics")
async def get_user_recommended_topics(
    user_id: str,
    category: Optional[str] = None,  # Add optional category parameter
    refresh: bool = False  # Allow manual refresh option
) -> Dict[str, Any]:
    """Get personalized topic recommendations based on user's selected categories and current news.
    Args:
        user_id: User identifier
        refresh: Force refresh topics even if cache exists
    Returns:
        List of recommended topics across user's selected categories
    """
    # 1. First get user preferences
    cached_preferences = get_cached_user_preferences(user_id)
    if cached_preferences:
        expertise_level = cached_preferences.get("expertise_level", "intermediate")
        selected_categories = cached_preferences.get("categories", [])
    else:
        user_preferences = get_user_selected_categories(user_id)
    
    
    if not user_preferences:
        raise HTTPException(status_code=404, detail="No preferences found for this user")
    
    # 2. Extract expertise level and categories
    expertise_level = user_preferences.get("expertise_level", "intermediate")
    selected_categories = user_preferences.get("categories", [])
    
    if not selected_categories:
        raise HTTPException(status_code=404, detail="No categories selected for this user")
    
    if category:
        # If requested category isn't in user's selections, we can either:
        # Option 1: Return 404 (strict approach)
        # if category not in selected_categories:
        #     raise HTTPException(status_code=404, detail=f"Category '{category}' not found in user's selected categories")
        
        # Option 2: Allow any category (flexible approach)
        categories_to_process = [category]
    else:
        # Process all selected categories as before
        categories_to_process = selected_categories
    
    # 3. Fetch topics for each category
    recommendations = {}
    
    # Define an async function to process each category
    async def process_category(cat):
        need_refresh = refresh or should_refresh_topics(cat, expertise_level)
        
        if need_refresh:
            # Run CPU-intensive operation in a thread pool
            loop = asyncio.get_event_loop()
            topics = await loop.run_in_executor(
                None, 
                partial(get_daily_topics, cat, expertise_level, user_id)
            )
        else:
            topics = get_cached_topics_fast(cat, expertise_level) or []
        
        return cat, topics[:2] if topics else []

    # Process all categories concurrently
    category_tasks = [process_category(cat) for cat in categories_to_process]
    results = await asyncio.gather(*category_tasks)
    
    # Convert results to recommendations dictionary
    recommendations = {cat: topics for cat, topics in results}
    
    # 4. Define date range for reading history (last 90 days)
    from datetime import date, timedelta
    end_date = date.today()
    start_date = end_date - timedelta(days=7)
    
    # 5. Get unified reading history for all categories
    user_history = get_user_read_history(user_id, start_date, end_date)

    # 6. Create a lookup dictionary for efficiency
    viewed_topics_by_category = {}
    for item in user_history:
        cat = item.get('category')
        topic_id = item.get('topic_id')
        if cat and topic_id:
            if cat not in viewed_topics_by_category:
                viewed_topics_by_category[cat] = set()
            viewed_topics_by_category[cat].add(topic_id)

    # 7. Mark topics as viewed in each category
    for cat, topics_list in recommendations.items():
        viewed_topic_ids = viewed_topics_by_category.get(cat, set())
        for topic in topics_list:
            topic["viewed"] = topic["topic_id"] in viewed_topic_ids
    
    # 8. Get cache refresh timestamp
    cache_time = None
    if categories_to_process:
        cache_time = get_cache_timestamp(categories_to_process[0], expertise_level)
    
    return {
        "user_id": user_id,
        "expertise_level": expertise_level,
        "selected_categories": categories_to_process,
        "recommendations": recommendations,
        "refreshed_at": cache_time.isoformat() if cache_time else datetime.now().isoformat()
    }

@router.get("/article/topic/{topic_id}")
async def get_topic_article(
    user_id: str,
    topic_id: str,
    level: ExpertiseLevel = None,  # Optional - will use the topic's level if not specified
    refresh: bool = False
) -> Dict[str, Any]:
    """Generate an article for a specific topic.
    
    Args:
        user_id: User identifier
        topic_id: ID of the topic to generate an article for
        level: Optional override for expertise level
        
    Returns:
        Generated article with tooltips for the specific topic
    """
    # Get the topic details from cache
    topic = get_topic_by_id_fast(topic_id)
    
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic with ID {topic_id} not found")
    
    # Use the topic's level if not specified
    expertise_level = level.value if level else topic.get("expertise_level", "intermediate")
    category = topic.get("category")
    title = topic.get("title")
    
    # Generate article - tooltips are already extracted in this function
    # Only generate if not cached or force refresh requested
    if refresh:
        article = None
    else:
        article = get_cached_article(topic_id, expertise_level)
    
    if not article:
        # Generate article - tooltips are already extracted in this function
        article = generate_article(
            category=category,
            topic=title,
            expertise_level=expertise_level,
            user_id=user_id
        )
        
        # Cache the article for future requests
        cache_article(topic_id, expertise_level, article)
    
    response = {
        "user_id": user_id,
        "topic_id": topic_id,
        "article": article
    }

    # Schedule background task for tracking
    asyncio.create_task(track_article_view(
        user_id=user_id,
        category=category,
        topic_id=topic_id,
        topic_title=title,
        expertise_level=expertise_level,
        tooltips=article.get("tooltip_words", [])
    ))
    
    return response

async def track_article_view(
    user_id: str,
    category: str,
    topic_id: str,
    topic_title: str,
    expertise_level: str,
    tooltips: List[Dict]
):
    """Track article view and tooltips in background."""
    # Run blocking operations in thread pool
    await asyncio.to_thread(
        track_viewed_topic,
        user_id=user_id,
        category=category,
        topic_id=topic_id,
        topic_title=topic_title,
        expertise_level=expertise_level
    )

from fastapi.responses import StreamingResponse
import json

@router.get("/article/topic/{topic_id}/stream")
async def get_topic_article_streaming(
    user_id: str,
    topic_id: str,
    level: ExpertiseLevel = None,
    refresh: bool = False
):
    """Streaming version that shows progress as article is generated."""
    # Get topic details
    topic = get_topic_by_id_fast(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic with ID {topic_id} not found")
    
    expertise_level = level.value if level else topic.get("expertise_level", "intermediate")
    category = topic.get("category")
    title = topic.get("title")
    
    async def generate_stream():
        # Send metadata immediately
        yield json.dumps({
            "type": "metadata",
            "user_id": user_id,
            "topic_id": topic_id,
            "title": title,
            "category": category
        }) + "\n"
        
        # Check cache unless refresh requested
        article = None if refresh else get_cached_article(topic_id, expertise_level)
        
        if article:
            # Send cached article
            yield json.dumps({
                "type": "article",
                "content": article
            }) + "\n"
        else:
            # Send generation status
            yield json.dumps({
                "type": "status",
                "message": "Generating article..."
            }) + "\n"
            
            # Generate article in thread pool
            article = await asyncio.to_thread(
                generate_article,
                category=category,
                topic=title,
                expertise_level=expertise_level,
                user_id=user_id
            )
            
            # Cache generated article
            asyncio.create_task(asyncio.to_thread(
                cache_article,
                topic_id=topic_id,
                expertise_level=expertise_level,
                article=article
            ))
            
            # Send generated article
            yield json.dumps({
                "type": "article",
                "content": article
            }) + "\n"
        
        # Track view in background
        asyncio.create_task(track_article_view(
            user_id=user_id,
            category=category,
            topic_id=topic_id,
            topic_title=title,
            expertise_level=expertise_level,
            tooltips=article.get("tooltip_words", [])
        ))
        
        # Send completion
        yield json.dumps({
            "type": "complete",
            "timestamp": datetime.now().isoformat()
        }) + "\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="application/x-ndjson"
    )

@router.post("/tooltip/view")
async def log_tooltip_view(tooltip_data: TooltipView) -> Dict[str, Any]:
    """Log when a user views a tooltip explanation.
    
    Args:
        tooltip_data: Data about the tooltip view
        
    Returns:
        Success confirmation
    """
    log_tooltip_viewed(
        tooltip_data.user_id, 
        tooltip_data.word, 
        tooltip_data.tooltip, 
        tooltip_data.from_topic
    )

    from app.services.firebase.cache import update_user_activity_timestamp
    update_user_activity_timestamp(tooltip_data.user_id, "tooltip_view")
    
    return {
        "status": "success",
        "message": "Tooltip view logged",
        "user_id": tooltip_data.user_id,
        "word": tooltip_data.word
    }



from app.services.ai.perplexity import generate_reading_summary

@router.get("/summary")
async def get_user_summary(
    user_id: str,
    period: str = "day",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    refresh: bool = False
) -> Dict[str, Any]:
    """Get a summary of user's reading activity with optimized performance."""
    # Calculate date range based on period (existing code stays the same)
    today = datetime.now().date()
    
    if period == "day":
        start_date_obj = today
        end_date_obj = today
    elif period == "week":
        start_date_obj = today - timedelta(days=today.weekday())
        end_date_obj = today
    elif period == "month":
        start_date_obj = today.replace(day=1)
        end_date_obj = today
    else:  # Custom period
        if not start_date or not end_date:
            raise HTTPException(status_code=400, detail="Custom period requires both start_date and end_date")
        
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Convert dates to strings for cache key
    start_date_str = start_date_obj.isoformat()
    end_date_str = end_date_obj.isoformat()
    
    # Try to get from cache first (unless refresh is requested)
    # Try to get from cache first (unless refresh is requested)
    if not refresh:
        from app.services.firebase.cache import get_cached_user_summary
        cached_summary = get_cached_user_summary(user_id, period, start_date_str, end_date_str)
        
        if cached_summary:
            logger.info(f"Returning cached summary for user {user_id}")
            return cached_summary
    
    # Run Firebase queries concurrently - REMOVED TOOLTIP QUERY
    read_history_task = asyncio.create_task(asyncio.to_thread(
        get_user_read_history, user_id, start_date_obj, end_date_obj
    ))
    
    streak_data_task = asyncio.create_task(asyncio.to_thread(
        get_user_streak_data, user_id
    ))
    
    expertise_level_task = asyncio.create_task(asyncio.to_thread(
        get_user_expertise_level, user_id
    ))
    
    # Wait for Firebase queries - REMOVED TOOLTIP AWAIT
    read_history = await read_history_task
    streak_data = await streak_data_task
    expertise_level = await expertise_level_task
    
    if "user_id" in streak_data:
        del streak_data["user_id"]
    
    # Calculate statistics - PASS EMPTY LIST FOR TOOLTIPS
    stats = calculate_reading_stats(read_history, [])
    
    # Run AI operations concurrently - PASS EMPTY LIST FOR TOOLTIPS
    ai_summary_task = asyncio.create_task(asyncio.to_thread(
        generate_reading_summary,
        user_id=user_id,
        read_articles=read_history,
        tooltips=[],  # Empty tooltips list
        period=period,
        stats=stats
    ))
    
    quiz_questions_task = asyncio.create_task(asyncio.to_thread(
        generate_quiz_questions,
        read_articles=read_history,
        expertise_level=expertise_level
    ))
    
    # Wait for AI operations
    ai_summary = await ai_summary_task
    quiz_questions = await quiz_questions_task
    
    # Construct response
    summary = {
        "user_id": user_id,
        "period": period,
        "date_range": {
            "start": start_date_str,
            "end": end_date_str
        },
        "statistics": {
            "articles_read": stats["total_articles_read"],
            "tooltips_viewed": stats["total_tooltips_viewed"],
            "categories": dict(stats["top_categories"]),
        },
        "streak": streak_data,
        "articles_read": [article.get("topic_title", "") for article in read_history],
        "summary": ai_summary,
        "quiz_questions": quiz_questions,
        "generated_at": datetime.now().isoformat()
    }
    
    # Cache the summary for future requests
    from app.services.firebase.cache import cache_user_summary
    asyncio.create_task(asyncio.to_thread(
        cache_user_summary,
        user_id=user_id,
        period=period,
        start_date_str=start_date_str,
        end_date_str=end_date_str,
        summary_data=summary
    ))
    
    return summary


def calculate_reading_stats(read_history: List[Dict], tooltip_history: List[Dict] = None) -> Dict[str, Any]:
    """Calculate statistics from reading history.
    
    Args:
        read_history: List of articles read by the user
        tooltip_history: Optional list of tooltips viewed by the user
        
    Returns:
        Dictionary of calculated statistics
    """
    # Handle case where tooltip_history is None
    tooltip_history = tooltip_history or []
    
    # Count articles by category
    categories = {}
    for article in read_history:
        category = article.get("category", "uncategorized")
        categories[category] = categories.get(category, 0) + 1
    
    # Get top categories
    top_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # Calculate reading level based on article difficulty
    difficulty_levels = [article.get("difficulty_level", "intermediate") for article in read_history]
    beginner_count = difficulty_levels.count("beginner")
    intermediate_count = difficulty_levels.count("intermediate")
    advanced_count = difficulty_levels.count("advanced")
    
    # Determine predominant reading level
    if not difficulty_levels:
        predominant_level = "unknown"
    elif advanced_count > intermediate_count and advanced_count > beginner_count:
        predominant_level = "advanced"
    elif intermediate_count > beginner_count:
        predominant_level = "intermediate"
    else:
        predominant_level = "beginner"
    
    return {
        "total_articles_read": len(read_history),
        "total_tooltips_viewed": len(tooltip_history),  # Will be 0 with empty list
        "category_breakdown": categories,
        "top_categories": top_categories,
        "predominant_level": predominant_level,
        "level_breakdown": {
            "beginner": beginner_count,
            "intermediate": intermediate_count,
            "advanced": advanced_count
        },
        "unique_topics_explored": len(set(article.get("topic", "") for article in read_history if "topic" in article))
    }


@router.get("/summary/progress-chart")
async def get_progress_chart(
    user_id: str,
    period: str = "week",  # Options: week, month
) -> Dict[str, Any]:
    """Get user's reading progress data for charts.
    
    Args:
        user_id: User identifier
        period: Time period for the chart (week, month)
        
    Returns:
        Data suitable for progress charting
    """
    # Calculate date range
    today = datetime.now().date()
    
    if period == "week":
        # Get last 7 days
        start_date = today - timedelta(days=6)
        end_date = today
        # Generate all days in range
        date_range = [(start_date + timedelta(days=i)).isoformat() for i in range((end_date - start_date).days + 1)]
        label_format = "%a"  # Weekday abbreviation
    else:  # month
        # Get last 30 days
        start_date = today - timedelta(days=29)
        end_date = today
        date_range = [(start_date + timedelta(days=i)).isoformat() for i in range((end_date - start_date).days + 1)]
        label_format = "%d %b"  # Day with month abbreviation
    
    # Get daily reading counts
    daily_history = get_daily_reading_stats(user_id, start_date, end_date)
    
    # Format data for chart
    articles_data = []
    tooltips_data = []
    categories_data = {}
    
    # Initialize with zeros for all dates
    for date_str in date_range:
        date_obj = datetime.fromisoformat(date_str).date()
        date_label = date_obj.strftime(label_format)
        
        day_stats = daily_history.get(date_str, {"articles": 0, "tooltips": 0, "categories": {}})
        
        articles_data.append({"date": date_label, "count": day_stats["articles"]})
        tooltips_data.append({"date": date_label, "count": day_stats["tooltips"]})
        
        # Update categories data
        for category, count in day_stats.get("categories", {}).items():
            if category not in categories_data:
                categories_data[category] = []
            
            categories_data[category].append({"date": date_label, "count": count})
    
    return {
        "user_id": user_id,
        "period": period,
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "articles_data": articles_data,
        "tooltips_data": tooltips_data,
        "categories_data": categories_data
    }


@router.get("/user/streak")
async def get_user_streak(user_id: str) -> Dict[str, Any]:
    """Get a user's learning streak information.
    
    Args:
        user_id: User identifier
        
    Returns:
        Details about user's learning streak
    """
    streak_data = get_user_streak_data(user_id)
    
    return {
        "user_id": user_id,
        "streak": streak_data,
        "fetched_at": datetime.now().isoformat()
    }

@router.get("/summary/heatmap")
async def get_yearly_heatmap(
    user_id: str,
    year: int = None  # Default to current year if not specified
) -> Dict[str, Any]:
    """Get user's activity data for a full year calendar heatmap.
    
    Args:
        user_id: User identifier
        year: Year to get data for (defaults to current year)
        
    Returns:
        Daily activity counts suitable for a calendar heatmap
    """
    # Use current year if not specified
    if year is None:
        year = datetime.now().year
    
    # Calculate start and end dates for the year
    start_date = datetime(year, 1, 1).date()
    end_date = datetime(year, 12, 31).date()
    
    # Get activity history from your unified database
    from app.services.firebase.reading_log import get_user_activity_history
    activities = get_user_activity_history(user_id, start_date, end_date)
    
    # Count activities by date
    activity_counts = {}
    for activity in activities:
        date_str = activity.get('date')
        if date_str:
            activity_counts[date_str] = activity_counts.get(date_str, 0) + 1
    
    # Format for heatmap - array of {date, count} objects
    heatmap_data = [
        {"date": date_str, "count": count}
        for date_str, count in activity_counts.items()
    ]
    
    return {
        "user_id": user_id,
        "year": year,
        "data": heatmap_data
    }