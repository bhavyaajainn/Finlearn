from typing import List
from firebase_admin import firestore

def get_user_categories(user_id: str) -> List[str]:
    """Get the financial categories a user has selected.
    
    Args:
        user_id: User identifier
        
    Returns:
        List of category names
    """
    # Firebase implementation to fetch user categories
    db = firestore.client()
    user_doc = db.collection('users').document(user_id).get()
    
    if not user_doc.exists:
        return []
    
    user_data = user_doc.to_dict()
    return user_data.get('categories', [])