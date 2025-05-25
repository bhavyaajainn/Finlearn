"""Firebase service for managing user watchlists.

This module provides functions to interact with user watchlists stored in Firebase.
"""
from datetime import datetime
import logging
from typing import Any, Dict, List, Optional
from app.services.firebase.reading_log import get_user_topic_history
from app.services.firebase.cache import find_topic_by_id

from app.api.models import AssetType
from .client import db

logger = logging.getLogger(__name__)


def get_user_watchlists(
    user_id: str, 
    asset_type: Optional[AssetType] = None
) -> List[Dict[str, Any]]:
    """Get a user's watchlist items from Firestore."""
    watchlist_ref = db.collection('watchlists').document(user_id)
    watchlist_doc = watchlist_ref.get()
    
    if not watchlist_doc.exists:
        return []
    
    watchlist_data = watchlist_doc.to_dict()
    assets = watchlist_data.get('assets', [])
    
    # Filter by asset type if specified
    if asset_type:
        assets = [asset for asset in assets if asset.get('asset_type') == asset_type]
        
    return assets


def add_to_watchlist(
    user_id: str,
    symbol: str,
    asset_type: AssetType,
    notes: Optional[str] = None
) -> None:
    """Add an asset to a user's watchlist."""
    watchlist_ref = db.collection('watchlists').document(user_id)
    
    # Get current watchlist
    watchlist_doc = watchlist_ref.get()
    
    if watchlist_doc.exists:
        watchlist_data = watchlist_doc.to_dict()
        assets = watchlist_data.get('assets', [])
        
        # Check if asset already exists
        for asset in assets:
            if asset.get('symbol') == symbol and asset.get('asset_type') == asset_type:
                # Asset already in watchlist, update notes if provided
                if notes is not None:
                    asset['notes'] = notes
                watchlist_ref.update({'assets': assets})
                return
        
        # Asset not in watchlist, add it
        assets.append({
            'symbol': symbol,
            'asset_type': asset_type,
            'notes': notes,
            'added_on': datetime.now().isoformat()
        })
        
        watchlist_ref.update({'assets': assets})
    else:
        # Create new watchlist
        watchlist_ref.set({
            'user_id': user_id,
            'assets': [{
                'symbol': symbol,
                'asset_type': asset_type,
                'notes': notes,
                'added_on': datetime.now().isoformat()
            }]
        })


def remove_from_watchlist(
    user_id: str,
    symbol: str,
    asset_type: AssetType
) -> None:
    """Remove an asset from a user's watchlist."""
    watchlist_ref = db.collection('watchlists').document(user_id)
    
    # Get current watchlist
    watchlist_doc = watchlist_ref.get()
    
    if not watchlist_doc.exists:
        return
    
    watchlist_data = watchlist_doc.to_dict()
    assets = watchlist_data.get('assets', [])
    
    # Remove asset
    updated_assets = [
        asset for asset in assets 
        if not (asset.get('symbol') == symbol and asset.get('asset_type') == asset_type)
    ]
    
    # Update watchlist
    watchlist_ref.update({'assets': updated_assets})



def get_user_preferences(user_id: str) -> Dict[str, Any]:
    """Get user's expertise level and selected categories.
    
    Args:
        user_id: User identifier
        
    Returns:
        User preferences including expertise_level and selected categories
    """
    try:
        categories_ref = db.collection('selected_categories').document(user_id)
        categories_doc = categories_ref.get()
        
        if categories_doc.exists:
            preferences = categories_doc.to_dict()
            return preferences
        else:
            # Return default preferences if not found
            logger.info(f"No preferences found for user {user_id}, using defaults")
            return {
                'expertise_level': 'beginner',
                'categories': ['stocks', 'investing_basics']
            }
            
    except Exception as e:
        logger.error(f"Error retrieving user preferences: {e}")
        # Return a default profile in case of error
        return {
            'expertise_level': 'beginner',
            'categories': ['stocks', 'investing_basics'],
            'error': str(e)
        }

def get_user_expertise_level(user_id: str) -> str:
    """Get user's expertise level.
    
    Args:
        user_id: User identifier
        
    Returns:
        User's expertise level (beginner, intermediate, or advanced)
    """
    preferences = get_user_preferences(user_id)
    return preferences.get('expertise_level', 'beginner')

def get_user_interests(user_id: str) -> List[str]:
    """Get user's selected investment categories.
    
    Args:
        user_id: User identifier
        
    Returns:
        List of categories the user is interested in
    """
    preferences = get_user_preferences(user_id)
    return preferences.get('categories', [])

"""Correlate asset research with user's reading history."""

def get_related_topics(user_id: str, asset_symbol: str, asset_type: str) -> List[Dict[str, Any]]:
    """Find topics from user's reading history that are relevant to the current asset.
    
    Args:
        user_id: User identifier
        asset_symbol: Symbol of the asset being researched
        asset_type: Type of asset (stock/crypto)
        
    Returns:
        List of relevant topics with correlation explanation
    """
    try:
        # Get user's reading history
        topic_history = get_user_topic_history(user_id)
        if not topic_history:
            return []
            
        
        # Try to get asset details from our database if we have any
        asset_details = None
        try:
            if asset_type == "stock":
                details_ref = db.collection('stock_details').document(asset_symbol)
            else:
                details_ref = db.collection('crypto_details').document(asset_symbol)
                
            details_doc = details_ref.get()
            if details_doc.exists:
                asset_details = details_doc.to_dict()
        except Exception as e:
            logger.warning(f"Could not retrieve asset details: {e}")
        
        # Keywords to match for correlations
        keywords = set()
        
        # Add asset symbol
        keywords.add(asset_symbol.lower())
        
        # Add company name if available
        if asset_details and 'name' in asset_details:
            name_words = asset_details['name'].lower().split()
            keywords.update(name_words)
            
        # Add sector if available
        if asset_details and 'sector' in asset_details:
            sector = asset_details['sector'].lower()
            keywords.add(sector)
            
        # Add industry if available
        if asset_details and 'industry' in asset_details:
            industry = asset_details['industry'].lower()
            keywords.add(industry)
        
        # Find correlations with topic history
        related_topics = []
        
        for item in topic_history:
            topic_id = item.get('topic_id')
            if not topic_id:
                continue
                
            # Get full topic details
            topic_details = find_topic_by_id(topic_id)
            if not topic_details:
                continue
            
            # Check for correlations
            correlation_type = None
            correlation_strength = 0
            
            title = topic_details.get('title', '').lower()
            content = topic_details.get('content', '').lower()
            category = topic_details.get('category', '').lower()
            
            # Check for direct mentions
            for keyword in keywords:
                if keyword in title:
                    correlation_type = "direct_mention_title"
                    correlation_strength = 3  # High correlation
                    break
                elif keyword in content:
                    correlation_type = "direct_mention_content"
                    correlation_strength = 2  # Medium correlation
                    break
            
            # Check for category correlation if no direct mention
            if not correlation_type:
                if asset_type.lower() in category:
                    correlation_type = "same_category"
                    correlation_strength = 1  # Low correlation
                elif "invest" in category:
                    correlation_type = "investment_related"
                    correlation_strength = 1  # Low correlation
            
            # If we found a correlation, add to results
            if correlation_type and correlation_strength > 0:
                related_topics.append({
                    "topic_id": topic_id,
                    "title": topic_details.get('title'),
                    "category": topic_details.get('category'),
                    "correlation_type": correlation_type,
                    "correlation_strength": correlation_strength,
                    "viewed_at": item.get('viewed_at')
                })
        
        # Sort by correlation strength (highest first)
        related_topics.sort(key=lambda x: x['correlation_strength'], reverse=True)
        
        return related_topics[:5]  # Return up to 5 most relevant topics
        
    except Exception as e:
        logger.error(f"Error finding related topics: {e}")
        return []
    

def log_asset_research(
    user_id: str, 
    symbol: str, 
    asset_type: str
) -> None:
    """Log that a user has researched an asset.
    
    Args:
        user_id: User identifier
        symbol: Asset symbol
        asset_type: Type of asset (stock/crypto)
    """
    try:
        # Get current timestamp
        now = datetime.now().isoformat()
        
        # Create research entry
        research_entry = {
            "user_id": user_id,
            "symbol": symbol,
            "asset_type": asset_type,
            "timestamp": now,
            "date": datetime.now().date().isoformat()
        }
        
        # Add to unified activity collection
        db.collection("user_asset_research").add(research_entry)
        
        # Update user's asset research history
        history_ref = db.collection('asset_research_history').document(user_id)
        history_doc = history_ref.get()
        
        if history_doc.exists:
            history_data = history_doc.to_dict()
            research_items = history_data.get('items', [])
            
            # Check if this asset exists in the history
            existing_idx = next((i for i, item in enumerate(research_items) 
                               if item.get('symbol') == symbol and 
                                  item.get('asset_type') == asset_type), None)
            
            if existing_idx is not None:
                # Update existing entry
                research_items[existing_idx] = {
                    "symbol": symbol,
                    "asset_type": asset_type,
                    "last_researched": now,
                    "count": research_items[existing_idx].get('count', 0) + 1
                }
            else:
                # Add new entry
                research_items.append({
                    "symbol": symbol,
                    "asset_type": asset_type,
                    "first_researched": now,
                    "last_researched": now,
                    "count": 1
                })
            
            # Update document
            history_ref.update({
                'items': research_items,
                'last_updated': now
            })
        else:
            # Create new document
            history_ref.set({
                'user_id': user_id,
                'items': [{
                    "symbol": symbol,
                    "asset_type": asset_type,
                    "first_researched": now,
                    "last_researched": now,
                    "count": 1
                }],
                'last_updated': now
            })
        
    except Exception as e:
        logger.error(f"Error logging asset research: {e}")