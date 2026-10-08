"""
FastAPI Application Entry Point
Agentic AI Intelligent Investment Planning — Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import health, planner

# ─── App Initialization ──────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    description="Agentic AI-powered investment planning backend using Gemini + LangGraph",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS Middleware ──────────────────────────────────────────────────────────
# Allows the React frontend (running on port 5173) to communicate with this API

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────

app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(planner.router, prefix="/api/v1/planner", tags=["Planner"])

# NOTE: More routers will be added here in later phases


# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "message": "Agentic AI Investment Planner API",
        "version": "0.1.0",
        "docs": "/docs",
        "status": "running",
    }
