"""
Agent State
The shared TypedDict that flows through every node in the LangGraph workflow.
Each node reads from and writes to this state.
"""

from typing import TypedDict, Optional, List, Any


class AgentState(TypedDict):
    """
    Shared state passed between all LangGraph nodes.
    Fields are progressively filled as the workflow advances.
    """

    # ── Raw Input ──────────────────────────────────────────────────────────────
    profile: dict                           # Raw user profile from API request

    # ── After profile_node ────────────────────────────────────────────────────
    name: str
    age: int
    monthly_income: float
    monthly_expenses: float
    existing_savings: float
    existing_investments: float
    risk_tolerance: str
    investment_goal: str
    investment_horizon_years: int
    monthly_investment_amount: float
    monthly_surplus: float

    # ── After risk_node ───────────────────────────────────────────────────────
    risk_score: int                         # 1–10 scale
    risk_label: str                         # conservative / moderate / aggressive
    risk_reasoning: str

    # ── After market_node ─────────────────────────────────────────────────────
    market_context: dict                    # Live market snapshot

    # ── After gemini_node ─────────────────────────────────────────────────────
    gemini_analysis: str                    # Raw LLM output (JSON string)

    # ── After report_node ─────────────────────────────────────────────────────
    final_report: dict                      # Structured final report

    # ── Error Handling ────────────────────────────────────────────────────────
    error: Optional[str]
