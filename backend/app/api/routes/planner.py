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


# ─── Stateful LLM Conversational Agent Store ────────────────────────────────
from pydantic import BaseModel
from app.agents.llm_agent import llm_agent
from app.agents.conversational_agent import process_agent_turn

CONVERSATION_SESSIONS = {}

class ChatMessageRequest(BaseModel):
    session_id: str
    message: str

@router.post("/chat", summary="Interactive LLM Conversational Agent Turn")
async def chat_with_agent(req: ChatMessageRequest):
    """
    Genuine interactive conversational dialogue powered by Google Gemini LLM.
    Understands context, answers questions in detail (e.g. risk tolerance explanations),
    gathers info dynamically, generates personalized plans, and sends email summaries.
    """
    session_id = req.session_id or "default_session"
    user_msg = (req.message or "").strip()

    try:
        # 1. Primary: Run LLM multi-turn chat (ChatGPT / Claude style)
        response_text = llm_agent.process_message(session_id, user_msg)
        
        return {
            "session_id": session_id,
            "agent_response": response_text,
            "mode": "llm"
        }
    except Exception as llm_err:
        # 2. Fallback: Stateful rule engine
        state = CONVERSATION_SESSIONS.get(session_id)
        if not state:
            state = {
                "session_id": session_id,
                "phase": "greet_and_collect",
                "history": [],
                "name": None,
                "age": None,
                "risk_level": None,
                "goal": None,
                "time_horizon_years": None,
                "portfolio": None,
                "recommendations": None,
                "suggestions_table": None,
                "email": None,
                "email_summary": None,
                "email_dispatched": False,
                "error": None
            }
        updated_state = process_agent_turn(state, user_msg)
        CONVERSATION_SESSIONS[session_id] = updated_state
        return {
            "session_id": session_id,
            "agent_response": updated_state["agent_response"],
            "mode": "fallback"
        }


@router.post("/chat/reset", summary="Reset Conversational Agent Session")
async def reset_chat_session(req: ChatMessageRequest):
    """Resets conversational session memory for a fresh start."""
    session_id = req.session_id or "default_session"
    llm_agent.reset_chat(session_id)
    if session_id in CONVERSATION_SESSIONS:
        del CONVERSATION_SESSIONS[session_id]
    return {"status": "reset", "session_id": session_id}

