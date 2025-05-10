"""Firebase service package.

This module exposes Firebase functionality to the rest of the application.
"""

# Import the client
from .client import db

# Import and expose watchlist functionality
from .watchlist import (
    get_user_watchlist,
    add_to_watchlist,
    remove_from_watchlist  # Uncomment if you have a remove function
)

# Import and expose reading log functionality
from .reading_log import (
    get_user_day_log,
    log_topic_read
)

from .categories import get_user_categories

# You can add any package initialization code here if needed

__all__ = [
    "db",
    "get_user_watchlist",
    "add_to_watchlist",
    "remove_from_watchlist",
    "get_user_day_log",
    "log_topic_read",
    "get_user_categories"
]