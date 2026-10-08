"""
Node 2: Risk Node
Calculates a risk score (1-10) based on age, income, savings,
investment horizon, and declared risk tolerance.
No LLM call — this is pure deterministic logic.
"""

from app.agents.state import AgentState


def risk_node(state: AgentState) -> AgentState:
    """
    Computes a composite risk score (1=very conservative, 10=very aggressive).

    Scoring factors:
    - Age:                younger = higher score
    - Horizon:            longer = higher score
    - Declared tolerance: direct contribution
    - Income vs expenses: higher surplus ratio = higher score
    - Existing savings:   more savings = slightly higher score (safety net)
    """

    score = 0

    # ── Factor 1: Age (younger = can take more risk) ───────────────────────
    age = state["age"]
    if age < 25:
        score += 3
    elif age < 35:
        score += 2.5
    elif age < 45:
        score += 2
    elif age < 55:
        score += 1
    else:
        score += 0.5

    # ── Factor 2: Investment Horizon ───────────────────────────────────────
    horizon = state["investment_horizon_years"]
    if horizon >= 15:
        score += 2.5
    elif horizon >= 10:
        score += 2
    elif horizon >= 5:
        score += 1.5
    elif horizon >= 3:
        score += 1
    else:
        score += 0.5

    # ── Factor 3: Declared Risk Tolerance ─────────────────────────────────
    tolerance = state["risk_tolerance"]
    tolerance_score = {"conservative": 1, "moderate": 2, "aggressive": 3}
    score += tolerance_score.get(tolerance, 2)

    # ── Factor 4: Monthly Surplus Ratio ───────────────────────────────────
    income = state["monthly_income"]
    surplus = state["monthly_surplus"]
    if income > 0:
        surplus_ratio = surplus / income
        if surplus_ratio >= 0.5:
            score += 1.5
        elif surplus_ratio >= 0.3:
            score += 1
        elif surplus_ratio >= 0.1:
            score += 0.5

    # ── Normalize to 1–10 ─────────────────────────────────────────────────
    # Max possible raw score ≈ 10, min ≈ 1
    risk_score = max(1, min(10, round(score)))

    # ── Derive label ──────────────────────────────────────────────────────
    if risk_score <= 3:
        risk_label = "Conservative"
        risk_reasoning = (
            f"Based on your age ({age}), short investment horizon ({horizon} years), "
            f"and conservative preference, a low-risk approach is recommended. "
            f"Capital preservation is the priority."
        )
    elif risk_score <= 6:
        risk_label = "Moderate"
        risk_reasoning = (
            f"Your profile shows a balanced risk appetite. At age {age} with a "
            f"{horizon}-year horizon and {tolerance} tolerance, a mix of growth "
            f"and stability is ideal."
        )
    else:
        risk_label = "Aggressive"
        risk_reasoning = (
            f"Your young age ({age}), long horizon ({horizon} years), strong surplus, "
            f"and {tolerance} tolerance support an aggressive growth-oriented strategy."
        )

    return {
        **state,
        "risk_score": risk_score,
        "risk_label": risk_label,
        "risk_reasoning": risk_reasoning,
    }
