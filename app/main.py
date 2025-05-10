from fastapi import FastAPI
import uvicorn
import os

from app.api import api_router

# Create FastAPI app
app = FastAPI(
    title="Finlearn",
    description="Financial Learning and Research Platform",
    version="1.0.0"
)

app.include_router(api_router)

@app.get("/")
async def root():
    """Root endpoint returning basic API information"""
    return {
        "message": "Welcome to Finlearn API",
        "version": "1.0.0",
        "docs": "/docs"
    }
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.environ.get("PORT", 8000))
    
    # Run application
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)