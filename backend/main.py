from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import json
import asyncio
from typing import List
import logging

from src.presentation.api.routes import simulation_router, image_router
from src.infrastructure.websocket.connection_manager import ConnectionManager
from src.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Traffic Simulation Platform",
    description="A platform for converting road infrastructure photos into interactive traffic simulations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connection manager
connection_manager = ConnectionManager()

# Include routers
app.include_router(simulation_router.router, prefix="/api/simulation", tags=["simulation"])
app.include_router(image_router.router, prefix="/api/image", tags=["image"])

@app.get("/")
async def root():
    return {"message": "Traffic Simulation Platform API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "traffic-simulation-platform"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 