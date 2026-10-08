"""
Node 1: Profile Node
Validates and structures the raw user input from the API request.
Calculates monthly surplus (investable amount).
"""

from app.agents.state import AgentState


def profile_node(state: AgentState) -> AgentState:
    """
    Reads the raw profile dict, extracts all fields,
    and calculates the monthly surplus.
    """
    profile = state["profile"]

    monthly_income = float(profile.get("monthly_income", 0))
    monthly_expenses = float(profile.get("monthly_expenses", 0))
    monthly_surplus = monthly_income - monthly_expenses

    return {
        **state,
        "name": profile.get("name", "User"),
        "age": int(profile.get("age", 25)),
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "existing_savings": float(profile.get("existing_savings", 0)),
        "existing_investments": float(profile.get("existing_investments", 0)),
        "risk_tolerance": profile.get("risk_tolerance", "moderate"),
        "investment_goal": profile.get("investment_goal", "wealth_creation"),
        "investment_horizon_years": int(profile.get("investment_horizon_years", 5)),
        "monthly_investment_amount": float(profile.get("monthly_investment_amount", 0)),
        "monthly_surplus": monthly_surplus,
        "error": None,
    }
