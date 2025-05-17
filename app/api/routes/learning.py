"""Learning routes.

This module provides endpoints for financial learning and educational content.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
from enum import Enum
import calendar

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
    get_user_streak_data
)
from app.services.ai.perplexity import generate_article, generate_quiz_questions
from app.services.firebase import log_topic_read, get_user_day_log
from app.api.models import DeepDiveResponse,ArticleResponse, TooltipView
from app.services.ai.claude import generate_category_topics, get_deep_dive
from app.services.firebase.cache import cache_topics, get_cached_topics,find_topic_by_id
from app.services.firebase.categories import get_user_categories


# from app.services.ai.claude import get_daily_topics
from app.services.firebase.cache import should_refresh_topics
from app.services.firebase.reading_log import log_tooltip_viewed

from app.services.firebase.selectedcategories import get_user_selected_categories
from app.services.firebase.cache import get_cache_timestamp

# Define expertise levels as an enum for validation
class ExpertiseLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

router = APIRouter()



@router.get("/articles", response_model=ArticleResponse)
async def get_articles(
    user_id: str,
    category: Optional[str] = None,
    topic: Optional[str] = None,
    level: ExpertiseLevel = ExpertiseLevel.intermediate,
    count: int = Query(2, ge=1, le=5, description="Number of articles to generate")
) -> Dict[str, Any]:
    """Generate articles on financial topics using Perplexity API.
    
    Args:
        user_id: User identifier
        category: Specific category to generate articles for (if None, uses user's selected categories)
        topic: Specific topic within the category to focus on (optional)
        level: Expertise level (beginner, intermediate, advanced)
        count: Number of articles to generate per category
        
    Returns:
        Dictionary containing generated articles with tooltips for concepts
    """
    if topic:
        # Generate articles focused on a specific topic
        articles = []
        for _ in range(count):
            article = generate_article(
                category=category,
                topic=topic,  # Pass the specific topic
                expertise_level=level,
                user_id=user_id
            )
            articles.append(article)
        
        return {
            "user_id": user_id,
            "level": level,
            "articles": {category: articles}
        }
    else:
        # Original category-based logic
        categories = [category] if category else get_user_categories(user_id)
        
        if not categories:
            raise HTTPException(status_code=404, detail="No categories found for this user")
        
        articles_by_category = {}
        
        for cat in categories:
            articles_by_category[cat] = []
            for _ in range(count):
                article = generate_article(
                    category=cat,
                    expertise_level=level,
                    user_id=user_id
                )
                articles_by_category[cat].append(article)
        
        return {
            "user_id": user_id,
            "level": level,
            "articles": articles_by_category
        }



@router.get("/topics")
async def get_category_topics(
    user_id: str,
    category: str,
    level: ExpertiseLevel = ExpertiseLevel.intermediate
) -> Dict[str, Any]:
    """Get a list of relevant topics within a financial category.
    
    Args:
        user_id: User identifier
        category: Financial category to explore
        level: Expertise level (beginner, intermediate, advanced)
        
    Returns:
        List of topics with descriptions suitable for the expertise level
    """
    # Check if we have cached topics for this category and level
    cached_topics = get_cached_topics(category, level)
    
    if cached_topics:
        return {
            "category": category,
            "level": level,
            "topics": cached_topics
        }
    
    # Generate topics using AI if not cached
    topics = generate_category_topics(category, level)
    
    # Cache the results for future use
    cache_topics(category, level, topics)
    
    return {
        "category": category,
        "level": level,
        "topics": topics
    }


@router.get("/dailytopics")
async def get_daily_category_topics(
    user_id: str,
    category: str,
    level: ExpertiseLevel = ExpertiseLevel.intermediate,
    refresh: bool = False  # Allow manual refresh
) -> Dict[str, Any]:
    """Get a list of relevant topics within a financial category based on latest news.
    
    Args:
        user_id: User identifier
        category: Financial category to explore
        level: Expertise level (beginner, intermediate, advanced)
        refresh: Force refresh topics even if cache exists
        
    Returns:
        List of news-relevant topics with descriptions
    """
    # Check if we need to refresh
    need_refresh = refresh or should_refresh_topics(category, level.value)
    
    # Get or generate topics
    if need_refresh:
        topics = get_daily_topics(category, level.value, user_id)
    else:
        from app.services.firebase.cache import get_cached_topics
        topics = get_cached_topics(category, level.value) or []
    
    # # Get user's viewing history
    # user_history = get_user_topic_history(user_id)
    # viewed_topic_ids = [item['topic_id'] for item in user_history 
    #                    if item['category'] == category]
    
    # # Mark topics as viewed or new
    # for topic in topics:
    #     topic["viewed"] = topic["topic_id"] in viewed_topic_ids
    
    # Get refresh timestamp
    from app.services.firebase.cache import get_cache_timestamp
    cache_time = get_cache_timestamp(category, level.value)
    
    return {
        "category": category,
        "level": level,
        "topics": topics,
        "refreshed_at": cache_time.isoformat() if cache_time else datetime.now().isoformat(),
        "is_fresh": need_refresh
    }


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
    
    for cat in categories_to_process:
        # Check if we need to refresh
        need_refresh = refresh or should_refresh_topics(cat, expertise_level)
        
        # Get or generate topics
        if need_refresh:
            topics = get_daily_topics(cat, expertise_level, user_id)
        else:
            topics = get_cached_topics(cat, expertise_level) or []
        
        # Select 2 topics from each category (or fewer if not enough)
        recommendations[cat] = topics[:2] if topics else []
    
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
    level: ExpertiseLevel = None  # Optional - will use the topic's level if not specified
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
    topic = find_topic_by_id(topic_id)
    
    if not topic:
        raise HTTPException(status_code=404, detail=f"Topic with ID {topic_id} not found")
    
    # Use the topic's level if not specified
    expertise_level = level.value if level else topic.get("expertise_level", "intermediate")
    category = topic.get("category")
    title = topic.get("title")
    
    # Generate article
    article = generate_article(
        category=category,
        topic=title,
        expertise_level=expertise_level,
        user_id=user_id
    )
    
    # Track that the user viewed this topic - with title
    from app.services.firebase.reading_log import track_viewed_topic
    track_viewed_topic(
        user_id=user_id, 
        category=category, 
        topic_id=topic_id,
        topic_title=title,  # Pass title
        expertise_level=expertise_level
    )

    # Track tooltips
    for tooltip_item in article.get("tooltip_words", []):
        word = tooltip_item.get("word")
        tooltip = tooltip_item.get("tooltip")
        if word and tooltip:
            log_tooltip_viewed(
                user_id=user_id, 
                word=word, 
                tooltip=tooltip, 
                from_topic=title,  # Pass topic title
                topic_id=topic_id  # Associate with topic
            )
    
    return {
        "user_id": user_id,
        "topic_id": topic_id,
        "topic_info": topic,
        "article": article
    }

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
    period: str = "day",  # Options: day, week, month, custom
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
) -> Dict[str, Any]:
    """Get a summary of a user's reading activity.
    
    Args:
        user_id: User identifier
        period: Time period for the summary (day, week, month, custom)
        start_date: Custom start date (format: YYYY-MM-DD)
        end_date: Custom end date (format: YYYY-MM-DD)
        
    Returns:
        Summary of user's reading activity for the specified period
    """
    # Calculate date range based on period
    today = datetime.now().date()
    
    if period == "day":
        start_date = today
        end_date = today
    elif period == "week":
        # Start from Monday of current week
        start_date = today - timedelta(days=today.weekday())
        end_date = today
    elif period == "month":
        # Start from first day of current month
        start_date = today.replace(day=1)
        end_date = today
    else:  # Custom period
        if not start_date or not end_date:
            raise HTTPException(status_code=400, detail="Custom period requires both start_date and end_date")
        
        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get reading history
    read_history = get_user_read_history(user_id, start_date, end_date)
    
    # Get tooltip history
    tooltip_history = get_user_tooltip_history(user_id, start_date, end_date)
    
    # Get user's streak data
    streak_data = get_user_streak_data(user_id)
    
    # Calculate statistics
    stats = calculate_reading_stats(read_history, tooltip_history)
    
    # Generate AI summary
    ai_summary = generate_reading_summary(
        user_id=user_id,
        read_articles=read_history,
        tooltips=tooltip_history,
        period=period,
        stats=stats
    )

    # Get user's expertise level
    from app.services.firebase.watchlist import get_user_expertise_level
    expertise_level = get_user_expertise_level(user_id)
    
    # Generate quiz questions based on reading history
    quiz_questions = generate_quiz_questions(
        read_articles=read_history,
        expertise_level=expertise_level
    )
    
    return {
        "user_id": user_id,
        "period": period,
        "date_range": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "statistics": stats,
        "streak": streak_data,
        "articles_read": read_history,
        "tooltips_viewed": tooltip_history,
        "summary": ai_summary,
        "quiz_questions": quiz_questions,
        "generated_at": datetime.now().isoformat()
    }


def calculate_reading_stats(read_history: List[Dict], tooltip_history: List[Dict]) -> Dict[str, Any]:
    """Calculate statistics from reading history.
    
    Args:
        read_history: List of articles read by the user
        tooltip_history: List of tooltips viewed by the user
        
    Returns:
        Dictionary of calculated statistics
    """
    # Count articles by category
    categories = {}
    for article in read_history:
        category = article.get("category", "uncategorized")
        categories[category] = categories.get(category, 0) + 1
    
    # Get top categories
    top_categories = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # Count tooltips by category/topic
    tooltip_topics = {}
    for tooltip in tooltip_history:
        topic = tooltip.get("from_topic", "general")
        tooltip_topics[topic] = tooltip_topics.get(topic, 0) + 1
    
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
        "total_tooltips_viewed": len(tooltip_history),
        "category_breakdown": categories,
        "top_categories": top_categories,
        "predominant_level": predominant_level,
        "level_breakdown": {
            "beginner": beginner_count,
            "intermediate": intermediate_count,
            "advanced": advanced_count
        },
        "unique_topics_explored": len(set(article.get("topic", "") for article in read_history if "topic" in article)),
        "unique_terms_learned": len(set(tooltip.get("word", "") for tooltip in tooltip_history))
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