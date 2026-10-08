"""
Planner Routes
Investment planning API endpoints.
"""

from fastapi import APIRouter, HTTPException
from app.services.gemini_service import gemini_service
from app.models.schemas import InvestmentProfileRequest, InvestmentPlanResponse
from app.agents.graph import investment_graph

router = APIRouter()


@router.get("/test-gemini", summary="Test Gemini API Connection")
async def test_gemini():
    """Sends a simple test prompt to verify the Gemini API key works."""
    try:
        result = gemini_service.test_connection()
        return result
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Gemini API error: {str(e)}",
        )


@router.post("/analyze", summary="Generate AI Investment Plan")
async def analyze_investment_profile(profile: InvestmentProfileRequest):
    """
    Accepts a user investment profile and runs the full LangGraph
    agentic workflow to generate a personalized investment plan.

    Workflow:
      profile_node → risk_node → market_node → gemini_node → report_node
    """
    try:
        # Build initial state
        initial_state = {
            "profile": profile.model_dump(),
            "name": "",
            "age": 0,
            "monthly_income": 0.0,
            "monthly_expenses": 0.0,
            "existing_savings": 0.0,
            "existing_investments": 0.0,
            "risk_tolerance": "",
            "investment_goal": "",
            "investment_horizon_years": 0,
            "monthly_investment_amount": 0.0,
            "monthly_surplus": 0.0,
            "risk_score": 0,
            "risk_label": "",
            "risk_reasoning": "",
            "market_context": {},
            "gemini_analysis": "",
            "final_report": {},
            "error": None,
        }

        # Run the LangGraph workflow
        result_state = investment_graph.invoke(initial_state)

        # Check for errors
        if result_state.get("error"):
            raise HTTPException(
                status_code=500,
                detail=f"Agent error: {result_state['error']}",
            )

        return result_state["final_report"]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}",
        )
