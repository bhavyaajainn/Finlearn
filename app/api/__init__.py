"""API package initialization.

This module initializes the API router and includes all route modules.
"""
from fastapi import APIRouter
from .routes import watchlist_router, research_router, learning_router

# Create the main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(watchlist_router, prefix="/watchlist", tags=["watchlist"])
api_router.include_router(research_router, tags=["research"])
api_router.include_router(learning_router, tags=["learning"])