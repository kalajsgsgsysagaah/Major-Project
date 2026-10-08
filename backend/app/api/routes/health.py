"""
Health Check Route
Simple endpoint to verify the API is running.
"""

from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health", summary="Health Check")
async def health_check():
    """Returns the current health status of the API."""
    return {
        "status": "healthy",
        "service": "Agentic AI Investment Planner",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "0.1.0",
    }
