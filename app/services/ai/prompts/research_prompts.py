def get_deep_dive_prompt(topic: str) -> str:
    """Generate a prompt for deep dive analysis on a financial topic.
    
    Args:
        topic: The financial topic to analyze
        
    Returns:
        Structured prompt for deep financial research
    """
    return f"""Provide a comprehensive analysis on the financial topic: {topic}
    
    Please structure your response in this specific way:
    1. Start with the basic concepts related to {topic}
    2. Then progressively go deeper into the subject matter
    3. Include relevant citations and sources
    4. Highlight key financial concepts that might need explanation
    
    Important: Identify all technical financial terms or concepts in your response that would benefit from a tooltip explanation.
    
    Format your response as valid JSON with this exact structure:
    {{
      "text": "Your complete analysis with all paragraphs as a single text string",
      "tooltip_words": [
        {{"word": "concept1", "tooltip": "Brief explanation of concept1"}},
        {{"word": "concept2", "tooltip": "Brief explanation of concept2"}}
      ]
    }}
    
    Focus on depth, accuracy, and making complex information digestible to investors.
    """