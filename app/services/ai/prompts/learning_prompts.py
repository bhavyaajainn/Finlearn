from typing import List, Dict, Optional
import json

def get_day_summary_prompt(topics: List[Dict[str, str]]) -> str:
    """Generate a prompt to summarize daily learning topics."""
    joined = ", ".join(t["topic"] for t in topics)
    return f"Summarize what a user learned today based on reading: {joined}. Then give 3 quiz questions on it."


def get_beginner_article_prompt(category: str, topic: Optional[str] = None) -> str:
    """Get prompt for generating beginner-level financial articles.
    
    Args:
        category: The financial category to focus on
        topic: Optional specific topic within the category
        
    Returns:
        Specialized prompt for beginner-level content
    """
    # Determine focus: general category or specific topic
    focus = f"{topic} in the context of {category}" if topic else category
    title_focus = f"{topic}" if topic else f"{category}"
    
    return f"""Generate a comprehensive beginner-friendly article about {focus}.

    The article should:
    - Start with fundamental concepts that novice investors need to understand
    - Explain recent news or trends in simple, accessible language
    - Define all financial terms when they first appear
    - Use clear real-world examples and analogies
    - Avoid jargon or provide immediate explanations when it's used
    - Include a "Why This Matters" section explaining practical implications
    - Be structured with clear headings and subheadings
    - End with actionable next steps for beginners
    - Include a glossary of key terms
    
    Identify all technical financial terms that would benefit from tooltips. For each term, extract:
    1. The exact term as it appears in the article
    2. A brief 1-2 sentence explanation suitable for beginners
    
    IMPORTANT: Make sure to include all key concepts as tooltip words too!
    
    Format your response as valid JSON with this exact structure:
    {{
      "title": "Engaging article title about {title_focus}",
      "content": "The full article with markdown formatting",
      "tooltip_words": [
        {{"word": "term1", "tooltip": "Simple explanation of term1"}},
        {{"word": "term2", "tooltip": "Simple explanation of term2"}}
      ],
      "key_concepts": ["concept1", "concept2", "concept3"],
      "difficulty_level": "beginner",
      "category": "{category}",
      "topic": "{topic if topic else category}"
    }}
    """

def get_intermediate_article_prompt(category: str, topic: Optional[str] = None) -> str:
    """Get prompt for generating intermediate-level financial articles.
    
    Args:
        category: The financial category to focus on
        topic: Optional specific topic within the category
        
    Returns:
        Specialized prompt for intermediate-level content
    """
    # Determine focus: general category or specific topic
    focus = f"{topic} in the context of {category}" if topic else category
    title_focus = f"{topic}" if topic else f"{category}"
    
    return f"""Generate a comprehensive intermediate-level article about {focus}.

    The article should:
    - Assume basic knowledge of financial concepts but provide context for specialized terms
    - Cover recent trends and news with moderate analytical depth
    - Connect concepts to broader market implications
    - Include relevant data points and statistics with interpretation
    - Discuss practical applications with some nuance
    - Reference relevant financial theories where appropriate
    - Compare different perspectives on important issues
    - End with strategic considerations for readers
    
    Identify technical financial terms or concepts that would benefit from tooltips. For each term, extract:
    1. The exact term as it appears in the article
    2. A concise explanation suitable for intermediate readers
    
    IMPORTANT: Make sure to include all key concepts as tooltip words too!
    
    Format your response as valid JSON with this exact structure:
    {{
      "title": "Engaging and informative article title about {title_focus}",
      "content": "The full article with markdown formatting",
      "tooltip_words": [
        {{"word": "term1", "tooltip": "Concise explanation of term1"}},
        {{"word": "term2", "tooltip": "Concise explanation of term2"}}
      ],
      "key_concepts": ["concept1", "concept2", "concept3"],
      "difficulty_level": "intermediate",
      "category": "{category}",
      "topic": "{topic if topic else category}"
    }}
    """

def get_advanced_article_prompt(category: str, topic: Optional[str] = None) -> str:
    """Get prompt for generating advanced-level financial articles.
    
    Args:
        category: The financial category to focus on
        topic: Optional specific topic within the category
        
    Returns:
        Specialized prompt for advanced-level content
    """
    # Determine focus: general category or specific topic
    focus = f"{topic} in the context of {category}" if topic else category
    title_focus = f"{topic}" if topic else f"{category}"
    
    return f"""Generate a comprehensive advanced-level article about {focus}.

    The article should:
    - Provide sophisticated analysis of recent developments without simplifying complex concepts
    - Include detailed examination of market implications with nuanced consideration of factors
    - Reference advanced financial theories and models where relevant
    - Incorporate technical analysis and quantitative considerations
    - Discuss regulatory implications and potential future developments
    - Consider multiple perspectives with critical analysis
    - Cite relevant research or expert opinions
    - End with strategic implications for sophisticated investors
    
    Identify specialized financial terms or concepts that even advanced readers might benefit from having explained. For each term, extract:
    1. The exact term as it appears in the article
    2. A precise, technical explanation suitable for advanced readers
    
    IMPORTANT: Make sure to include all key concepts as tooltip words too!
    
    Format your response as valid JSON with this exact structure:
    {{
      "title": "Sophisticated and precise article title about {title_focus}",
      "content": "The full article with markdown formatting",
      "tooltip_words": [
        {{"word": "term1", "tooltip": "Technical explanation of term1"}},
        {{"word": "term2", "tooltip": "Technical explanation of term2"}}
      ],
      "key_concepts": ["concept1", "concept2", "concept3"],
      "difficulty_level": "advanced",
      "category": "{category}",
      "topic": "{topic if topic else category}"
    }}
    """




def get_topic_article_prompt(category: str, topic: str, expertise_level: str) -> str:
    """Get prompt for generating an article about a specific topic within a category.
    
    Args:
        category: The financial category
        topic: The specific topic to focus on
        expertise_level: Target audience expertise level
        
    Returns:
        Specialized prompt for topic-specific content
    """
    depth_instruction = ""
    if expertise_level == "beginner":
        depth_instruction = "Explain concepts clearly with simple language and examples. Define all terminology."
    elif expertise_level == "intermediate":
        depth_instruction = "Provide practical insights and moderate analytical depth. Assume basic financial knowledge."
    else:  # advanced
        depth_instruction = "Include sophisticated analysis and technical details. Reference advanced theories and models where appropriate."
    
    return f"""Generate a comprehensive article about {topic} within the broader category of {category}.

    The article should:
    - Focus specifically on {topic}, not just {category} in general
    - {depth_instruction}
    - Include the latest developments or research on this topic
    - Provide context about how this topic relates to the broader {category} area
    - Highlight practical applications or implications
    - Maintain appropriate depth for a {expertise_level}-level audience
    
    Identify all technical financial terms that would benefit from tooltips. For each term, extract:
    1. The exact term as it appears in the article
    2. A concise explanation appropriate for the {expertise_level} level
    
    Format your response as valid JSON with this exact structure:
    {{
      "title": "Engaging and specific article title about {topic}",
      "content": "The full article with markdown formatting",
      "tooltip_words": [
        {{"word": "term1", "tooltip": "Explanation of term1"}},
        {{"word": "term2", "tooltip": "Explanation of term2"}}
      ],
      "key_concepts": ["concept1", "concept2", "concept3"],
      "difficulty_level": "{expertise_level}",
      "category": "{category}",
      "topic": "{topic}"
    }}
    """

def get_article_prompt(category: str, expertise_level: str, topic: Optional[str] = None) -> str:
    """Get prompt for generating financial articles at any expertise level.
    
    Args:
        category: The financial category
        expertise_level: Target audience level (beginner, intermediate, advanced)
        topic: Optional specific topic within the category
        
    Returns:
        Specialized prompt for content generation
    """
    # Determine focus and customize instructions based on expertise level
    focus = f"{topic} in the context of {category}" if topic else category
    
    # Expertise-specific instructions
    if expertise_level == "beginner":
        depth = "- Use simple language with clear examples\n    - Define all terminology\n    - Include real-world analogies\n    - Explain practical implications"
    elif expertise_level == "advanced":
        depth = "- Include sophisticated analysis\n    - Reference advanced theories and models\n    - Provide technical details\n    - Discuss strategic implications"
    else:  # intermediate
        depth = "- Balance depth with accessibility\n    - Provide practical insights\n    - Assume basic financial knowledge\n    - Include some technical details"
    
    return f"""Generate a financial article about {focus} for {expertise_level}-level readers.

    Structure requirements:
    - Create an engaging, specific title
    - Use clear headings and subheadings
    - Include latest developments and context
    
    Content requirements:
    {depth}
    - Focus on providing valuable insights
    - Include the most current information available
    - IMPORTANT: Add numerical citations [1][2] etc. for all facts and statements
    - Include a brief references section at the end listing the citation sources
    
    IMPORTANT: Identify technical financial terms and concepts that need explanation.
    For each term, provide a concise explanation appropriate for the {expertise_level} level.
    
    Return ONLY the following JSON structure (no markdown blocks, no preamble):
    {{
      "title": "Your article title here",
      "content": "The full article with markdown formatting",
      "tooltip_words": [
        {{"word": "term1", "tooltip": "Explanation for term1"}},
        {{"word": "term2", "tooltip": "Explanation for term2"}}
      ],
      "references": [
        "Source 1: Publication/website name, article title, date",
        "Source 2: Publication/website name, article title, date"
      ]
    }}
    """