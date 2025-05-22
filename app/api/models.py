from pydantic import BaseModel, Field, validator, constr
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class TooltipWord(BaseModel):
    word: str
    tooltip: str

class DeepDiveResponse(BaseModel):
    text: str
    tooltip_words: List[TooltipWord]  # List of TooltipWord objects

class Topics(BaseModel):
    expertise_level: str
    topics: List[str]

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

class TooltipView(BaseModel):
    user_id: str
    word: str
    tooltip: str
    from_topic: Optional[str] = None

# Define expertise level enum for validation
class ExpertiseLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

# Define the model for category data with proper validation
class Categories(BaseModel):
    expertise_level: ExpertiseLevel
    categories: List[constr(min_length=1, max_length=100)] = Field(..., min_items=1, max_items=50)
    
    @validator('categories')
    def validate_categories(cls, categories):
        """Ensure categories are valid and not empty."""
        if not categories:
            raise ValueError("At least one category must be selected")
        
        # Validate each category content
        for category in categories:
            # Check for empty strings after stripping whitespace
            if not category.strip():
                raise ValueError("categories cannot be empty strings")
                
        return categories
    
    class Config:
        # Example for documentation
        schema_extra = {
            "example": {
                "expertise_level": "intermediate",
                "categories": ["ETFs", "Value Investing", "Tax-Efficient Investing"],
            }
        }

class AssetType(str, Enum):
    stock = "stock"
    crypto = "crypto"

# Watchlist Models
class AddAssetRequest(BaseModel):
    symbol: str
    asset_type: AssetType
    notes: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "symbol": "AAPL",
                "asset_type": "stock",
                "notes": "Potential long-term investment"
            }
        }

class WatchlistItem(BaseModel):
    symbol: str
    asset_type: AssetType
    name: str
    current_price: float
    price_change_percent: float
    market_cap: Optional[float] = None
    volume: Optional[float] = None
    added_on: Optional[datetime] = None
    notes: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "symbol": "AAPL",
                "asset_type": "stock",
                "name": "Apple Inc.",
                "current_price": 187.82,
                "price_change_percent": 1.24,
                "market_cap": 2950000000000,
                "volume": 58903000,
                "added_on": "2023-05-15T08:30:00",
                "notes": "Potential long-term investment"
            }
        }

class StockDetails(WatchlistItem):
    pe_ratio: Optional[float] = None
    eps: Optional[float] = None
    dividend_yield: Optional[float] = None
    high_52week: Optional[float] = None
    low_52week: Optional[float] = None
    sector: Optional[str] = None
    industry: Optional[str] = None

class CryptoDetails(WatchlistItem):
    volume_24h: Optional[float] = None
    circulating_supply: Optional[float] = None
    max_supply: Optional[float] = None
    change_24h: Optional[float] = None

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2)
    asset_type: Optional[AssetType] = None
    limit: int = Field(10, ge=1, le=50)
    
    class Config:
        schema_extra = {
            "example": {
                "query": "app",
                "asset_type": "stock",
                "limit": 10
            }
        }

class SimilarAsset(BaseModel):
    symbol: str
    name: str
    price: float
    reason: str


class GlossaryTerm(BaseModel):
    term: str
    definition: str
    example: Optional[str] = None


class Quote(BaseModel):
    text: str
    author: Optional[str] = None


class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    topics: List[str] = Field(default_factory=list)


class DashboardResponse(BaseModel):
    user_id: str
    expertise_level: ExpertiseLevel
    glossary_term: List[GlossaryTerm]
    quote: Quote
    trending_news: List[NewsItem]
    timestamp: datetime

class DashboardEssentialResponse(BaseModel):
    """Light dashboard response with glossary and quote only."""
    user_id: str
    expertise_level: str
    glossary_term: List[GlossaryTerm]
    quote: Quote
    timestamp: datetime

class DashboardNewsResponse(BaseModel):
    """Dashboard news response."""
    user_id: str
    trending_news: List[NewsItem]
    timestamp: datetime