"""
Conversational State Model for LangGraph Agent
Defines the memory and state structure for the multi-turn interactive session.
"""

from typing import TypedDict, List, Dict, Any, Optional

class ConversationTurn(TypedDict):
    role: str       # 'agent' or 'user'
    content: str
    timestamp: str

class ConversationalAgentState(TypedDict):
    session_id: str
    phase: str      # 'greet_and_collect', 'risk_tolerance', 'goals_and_horizon', 'portfolio_check', 'research_and_recommend', 'await_email', 'completed'
    history: List[ConversationTurn]
    user_input: str
    
    # Collected Fields
    name: Optional[str]
    age: Optional[int]
    risk_level: Optional[str]
    goal: Optional[str]
    time_horizon_years: Optional[int]
    portfolio: Optional[Dict[str, float]] # {'stocks': 60, 'bonds': 30, 'cash': 10}
    
    # Generated Intelligence
    market_research_oct_2026: Optional[Dict[str, Any]]
    recommendations: Optional[List[Dict[str, Any]]]
    suggestions_table: Optional[List[Dict[str, Any]]]
    
    # Delivery
    email: Optional[str]
    email_summary: Optional[str]
    email_dispatched: bool
    
    # Output to user for the turn
    agent_response: str
    error: Optional[str]
