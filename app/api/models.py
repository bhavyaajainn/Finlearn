from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class TooltipWord(BaseModel):
    word: str
    tooltip: str

class DeepDiveResponse(BaseModel):
    text: str
    tooltip_words: List[TooltipWord]  # List of TooltipWord objects



class Article(BaseModel):
    id: str
    title: str
    content: str
    tooltip_words: List[TooltipWord]
    key_concepts: List[str]
    difficulty_level: str
    category: str
    created_at: str

class ArticleResponse(BaseModel):
    user_id: str
    level: str
    articles: Dict[str, List[Article]]