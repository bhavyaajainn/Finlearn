"""Firebase service for managing user watchlists.

This module provides functions to interact with user watchlists stored in Firebase.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.api.models import AssetType
from .client import db


def get_user_watchlist(
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