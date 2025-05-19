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