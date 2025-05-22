ARTICLE_SCHEMA_DEFINITION = {
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "description": "The title of the financial article"
        },
        "content": {
            "type": "string",
            "description": "The full article content in markdown format"
        },
        "tooltip_words": {
            "type": "array",
            "description": "List of financial terms with their definitions",
            "items": {
                "type": "object",
                "properties": {
                    "word": {"type": "string", "description": "The financial term"},
                    "tooltip": {"type": "string", "description": "Definition of the term"}
                },
                "required": ["word", "tooltip"]
            }
        },
        "references": {
            "type": "array",
            "description": "List of properly formatted references including publication name, article title, link, and date",
            "items": {
                "type": "string",
                "description": "Each reference in the format: 'Publication name. (Year). Article title, link, date'"
            }
        }
    },
    "required": ["title", "content", "tooltip_words", "references"]
}




GLOSSARY_TERMS_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "term": {
                "type": "string",
                "description": "The financial term or concept being defined"
            },
            "definition": {
                "type": "string",
                "description": "Clear explanation of the term adjusted to user's expertise level"
            },
            "example": {
                "type": "string",
                "description": "Real-world example or application of the term"
            }
        },
        "required": ["term", "definition"]
    }
}

FINANCE_QUOTE_SCHEMA = {
    "type": "object",
    "properties": {
        "text": {
            "type": "string",
            "description": "Quote text related to finance, investing, or financial literacy"
        },
        "author": {
            "type": "string",
            "description": "Name of the person who said or wrote the quote"
        }
    },
    "required": ["text"]
}

NEWS_ITEM_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {
            "type": "string", 
            "description": "Unique identifier for the news item in UUID format"
        },
        "title": {
            "type": "string",
            "description": "Title of the news article"
        },
        "summary": {
            "type": "string",
            "description": "Brief summary of the news tailored to user's expertise level"
        },
        "source": {
            "type": "string",
            "description": "Original source of the news (publication, website, etc.)"
        },
        "url": {
            "type": "string",
            "description": "Link to the full article"
        },
        "published_at": {
            "type": "string",
            "format": "date-time",
            "description": "Publication date and time in ISO format"
        },
        "topics": {
            "type": "array",
            "description": "List of financial topics related to the article",
            "items": {
                "type": "string"
            }
        }
    },
    "required": ["id", "title", "summary", "source"]
}

TRENDING_NEWS_SCHEMA = {
    "type": "array",
    "description": "List of trending finance news items",
    "items": NEWS_ITEM_SCHEMA
}

DASHBOARD_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "user_id": {
            "type": "string",
            "description": "Identifier for the user"
        },
        "expertise_level": {
            "type": "string",
            "enum": ["beginner", "intermediate", "advanced"],
            "description": "User's financial expertise level"
        },
        "glossary_term": GLOSSARY_TERMS_SCHEMA,
        "quote": FINANCE_QUOTE_SCHEMA,
        "trending_news": TRENDING_NEWS_SCHEMA,
        "timestamp": {
            "type": "string",
            "format": "date-time",
            "description": "Timestamp when the dashboard content was generated"
        }
    },
    "required": ["user_id", "expertise_level", "glossary_term", "quote", "trending_news", "timestamp"]
}

NEWS_ARTICLE_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "description": "Engaging article title"
        },
        "content": {
            "type": "string",
            "description": "Full article content with citations [1][2] etc."
        },
        "tooltip_words": {
            "type": "array",
            "description": "List of terms used in the article and their explanations",
            "items": {
                "type": "object",
                "properties": {
                    "word": {
                        "type": "string",
                        "description": "Financial term actually appearing in the content"
                    },
                    "tooltip": {
                        "type": "string", 
                        "description": "Explanation appropriate for user's expertise level"
                    }
                },
                "required": ["word", "tooltip"]
            }
        },
        "references": {
            "type": "array",
            "items": {"type": "string"},
            "description": "List of citation sources used in creating the article"
        }
    },
    "required": ["title", "content", "tooltip_words", "references"]
}