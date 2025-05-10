"""Firebase service for managing user watchlists.

This module provides functions to interact with user watchlists stored in Firebase.
"""
from typing import List
from .client import db


def get_user_watchlist(user_id: str) -> List[str]:
    """Retrieve a user's stock watchlist.
    Args:
        user_id: The unique identifier for the user
    Returns:
        A list of stock symbols in the user's watchlist
    """
    doc = db.collection("watchlists").document(user_id).get()
    return doc.to_dict().get("stocks", []) if doc.exists else []


def add_to_watchlist(user_id: str, stock_symbol: str) -> None:
    """Add a stock to a user's watchlist.
    If the stock is already in the watchlist, it will not be added again.
    If the user doesn't have a watchlist, one will be created.
    Args:
        user_id: The unique identifier for the user
        stock_symbol: The stock symbol to add (e.g., "AAPL")
    """
    ref = db.collection("watchlists").document(user_id)
    doc = ref.get()
    if doc.exists:
        current = doc.to_dict().get("stocks", [])
        if stock_symbol not in current:
            current.append(stock_symbol)
        ref.update({"stocks": current})
    else:
        ref.set({"stocks": [stock_symbol]})


def remove_from_watchlist(user_id: str, stock_symbol: str) -> None:
    """Remove a stock from a user's watchlist.
    Args:
        user_id: The unique identifier for the user
        stock_symbol: The stock symbol to remove
    """
    ref = db.collection("watchlists").document(user_id)
    doc = ref.get()
    if doc.exists:
        current = doc.to_dict().get("stocks", [])
        if stock_symbol in current:
            current.remove(stock_symbol)
            ref.update({"stocks": current})