
from fastapi import FastAPI
import uvicorn
import os
import yaml
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.api import api_router

# Create FastAPI app
app = FastAPI(
    title="Finlearn",
    description="Financial Learning and Research Platform",
    version="1.0.0"
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Finlearn API",
        version="1.0.0",
        description="Financial Learning and Research Platform",
        routes=app.routes,
    )

    openapi_schema["openapi"] = "3.0.0"
    
    # Customize server URLs if needed
    openapi_schema["servers"] = [
        {"url": "https://finlearn-217321872324.asia-south1.run.app", "description": "Production server"}
    ]
    
    # Save schema to YAML file
    openapi_path = Path(__file__).parent.parent / "openapi.yaml"
    with open(openapi_path, "w") as file:
        yaml.dump(openapi_schema, file, sort_keys=False)
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

# Set custom OpenAPI function
app.openapi = custom_openapi


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - consider restricting this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# Add this after your other routes

@app.get("/dev/refresh-openapi", include_in_schema=False)
async def refresh_openapi():
    """Force refresh the OpenAPI schema file (development only)"""
    # Clear the cached schema to force regeneration
    app.openapi_schema = None
    
    # Force generation by calling openapi()
    _ = app.openapi()
    
    return {"status": "success", "message": "OpenAPI schema updated"}

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.environ.get("PORT", 8000))
    
    # Run application
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)