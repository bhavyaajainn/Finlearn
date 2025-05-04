"""Learning routes.

This module provides endpoints for financial learning and educational content.
"""
from fastapi import APIRouter, Query
from typing import Dict, Any

from app.services.ai import get_deep_dive, get_concept_summary, generate_day_summary
from app.services.firebase import log_topic_read, get_user_day_log

router = APIRouter()

@router.get("/deep-dive")
async def deep_dive(user_id: str, topic: str) -> Dict[str, str]:
    """Get a deep dive analysis on a financial topic.
    
    Args:
        user_id: User identifier
        topic: Financial topic to analyze
        
    Returns:
        Deep dive insight on the requested topic
    """
    log_topic_read(user_id, topic)
    return {"topic": topic, "insight": get_deep_dive(topic)}

@router.get("/concept")
async def concept(user_id: str, topic: str, concept: str) -> Dict[str, str]:
    """Get an explanation of a financial concept.
    
    Args:
        user_id: User identifier
        topic: Parent topic
        concept: Financial concept to explain
        
    Returns:
        Explanation of the requested concept
    """
    log_topic_read(user_id, topic, subtopic=concept)
    return {"concept": concept, "definition": get_concept_summary(concept)}

@router.get("/summary")
async def summary(user_id: str) -> Dict[str, str]:
    """Get a summary of topics a user has learned.
    
    Args:
        user_id: User identifier
        
    Returns:
        Summary of learned topics with quiz questions
    """
    topics = get_user_day_log(user_id)
    return {"summary": generate_day_summary(topics)}