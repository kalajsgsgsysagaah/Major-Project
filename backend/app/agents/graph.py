"""
LangGraph Workflow Graph
Wires all agent nodes into a directed workflow.

Flow:
  START → profile_node → risk_node → market_node → gemini_node → report_node → END
"""

from langgraph.graph import StateGraph, START, END
from app.agents.state import AgentState
from app.agents.nodes.profile_node import profile_node
from app.agents.nodes.risk_node    import risk_node
from app.agents.nodes.market_node  import market_node
from app.agents.nodes.gemini_node  import gemini_node
from app.agents.nodes.report_node  import report_node


def build_investment_graph() -> StateGraph:
    """
    Builds and compiles the investment planning LangGraph workflow.

    Graph topology:
        START
          ↓
      profile_node  ← Structures & validates user profile
          ↓
       risk_node    ← Deterministic risk scoring (no LLM)
          ↓
      market_node   ← Fetches live Indian market data
          ↓
      gemini_node   ← LLM reasoning → structured JSON plan
          ↓
      report_node   ← Final report assembly
          ↓
         END
    """
    graph = StateGraph(AgentState)

    # ── Register Nodes ────────────────────────────────────────────────────────
    graph.add_node("profile_node", profile_node)
    graph.add_node("risk_node",    risk_node)
    graph.add_node("market_node",  market_node)
    graph.add_node("gemini_node",  gemini_node)
    graph.add_node("report_node",  report_node)

    # ── Define Edges (linear flow) ────────────────────────────────────────────
    graph.add_edge(START,          "profile_node")
    graph.add_edge("profile_node", "risk_node")
    graph.add_edge("risk_node",    "market_node")
    graph.add_edge("market_node",  "gemini_node")
    graph.add_edge("gemini_node",  "report_node")
    graph.add_edge("report_node",  END)

    return graph.compile()


# ── Singleton compiled graph ──────────────────────────────────────────────────
# Import this in routes: from app.agents.graph import investment_graph
investment_graph = build_investment_graph()
