"""API routes package.

This module exports all route modules.
"""
from .watchlist import router as watchlist_router
# from .research import router as research_router
from .learning import router as learning_router
from .selectedcategories import router as selectedcategories_router
from .dashboard import router as dashboard_router

__all__ = ["watchlist_router", "learning_router", "selectedcategories_router", "dashboard_router"]
