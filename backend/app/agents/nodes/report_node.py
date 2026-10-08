"""
Node 5: Report Node
Assembles the final structured report from all previous nodes.
This is the last step before returning to the API.
"""

import json
from app.agents.state import AgentState


def report_node(state: AgentState) -> AgentState:
    """
    Combines risk analysis + Gemini output into the final report dict.
    """
    try:
        gemini_data = json.loads(state.get("gemini_analysis", "{}"))
    except Exception:
        gemini_data = {}

    final_report = {
        "name": state["name"],
        "summary": gemini_data.get("summary", "Analysis complete."),

        "risk_analysis": {
            "score": state["risk_score"],
            "label": state["risk_label"],
            "reasoning": state["risk_reasoning"],
        },

        "financials": {
            "monthly_income": state["monthly_income"],
            "monthly_expenses": state["monthly_expenses"],
            "monthly_surplus": state["monthly_surplus"],
            "monthly_investment_amount": state["monthly_investment_amount"],
            "existing_savings": state["existing_savings"],
            "existing_investments": state["existing_investments"],
        },

        "investment_profile": {
            "goal": state["investment_goal"].replace("_", " ").title(),
            "horizon_years": state["investment_horizon_years"],
            "risk_tolerance": state["risk_tolerance"],
        },

        "asset_allocation": gemini_data.get("asset_allocation", []),
        "recommendations":  gemini_data.get("recommendations", []),
        "action_plan":      gemini_data.get("action_plan", []),

        "market_snapshot": state.get("market_context", {}),

        "disclaimer": (
            "This investment plan is AI-generated for educational purposes only. "
            "Please consult a SEBI-registered financial advisor before making any investment decisions. "
            "Past performance does not guarantee future returns."
        ),

        "model_used": "gemini-3.6-flash",
        "error": state.get("error"),
    }

    return {
        **state,
        "final_report": final_report,
    }
