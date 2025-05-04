from fastapi import FastAPI, Query
from firebase_setup import add_to_watchlist, get_user_watchlist
from stock_data import get_stock_info
from perplexity_client import get_deep_research_on_stock, get_trending_topics, get_deep_dive, get_concept_summary
# from claude_client import get_deep_research_on_stock, get_trending_topics, get_deep_dive, get_concept_summary
from topic_tracker import track_topic, get_daily_summary_and_quiz

app = FastAPI()

@app.post("/watchlist/add")
def add_stock(user_id: str = Query(...), symbol: str = Query(...)):
    add_to_watchlist(user_id, symbol)
    return {"message": f"{symbol} added to {user_id}'s watchlist."}

@app.get("/watchlist")
def view_watchlist(user_id: str):
    symbols = get_user_watchlist(user_id)
    return {"watchlist": symbols}

@app.get("/watchlist/details")
def get_watchlist_info(user_id: str):
    symbols = get_user_watchlist(user_id)
    data = [get_stock_info(s) for s in symbols]
    return {"data": data}

@app.get("/watchlist/research")
def get_research(user_id: str):
    symbols = get_user_watchlist(user_id)
    research = {s: get_deep_research_on_stock(s) for s in symbols}
    return {"research": research}


@app.get("/trending")
def trending():
    return {"topics": get_trending_topics()}

@app.get("/deep-dive")
def deep_dive(user_id: str, topic: str):
    track_topic(user_id, topic)
    return {"topic": topic, "insight": get_deep_dive(topic)}

@app.get("/concept")
def concept(user_id: str, topic: str, concept: str):
    track_topic(user_id, topic, subtopic=concept)
    return {"concept": concept, "definition": get_concept_summary(concept)}

@app.get("/summary")
def summary(user_id: str):
    return {"summary": get_daily_summary_and_quiz(user_id)}