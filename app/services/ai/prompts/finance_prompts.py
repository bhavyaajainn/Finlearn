def get_concept_explanation_prompt(concept: str) -> str:
    """Generate a prompt to explain a financial concept."""
    return f"In finance, explain the concept of: {concept}"


def get_stock_analysis_prompt(symbol: str) -> str:
    """Generate a prompt to analyze stock sentiment."""
    return f"Analyze the sentiment for the stock symbol: {symbol}."