"""
Node 4: Gemini Node
LLM reasoning core. Sends investor context to Gemini,
gets back a structured JSON investment plan.
Uses json-repair to handle any partial/truncated responses.
"""

import json
import re
from json_repair import repair_json
from app.agents.state import AgentState
from app.services.gemini_service import gemini_service


def _build_prompt(state: AgentState) -> str:
    """Builds a concise, structured prompt for Gemini."""

    market = state.get("market_context", {})
    nifty  = market.get("nifty_50", {})
    sensex = market.get("sensex", {})

    prompt = f"""You are an expert Indian investment advisor. Generate a concise investment plan as valid JSON only.

INVESTOR:
- Name: {state['name']}, Age: {state['age']}, Employment: {state['profile'].get('employment_status','employed')}
- Income: Rs{state['monthly_income']:,.0f}/mo, Expenses: Rs{state['monthly_expenses']:,.0f}/mo, Surplus: Rs{state['monthly_surplus']:,.0f}/mo
- Monthly SIP: Rs{state['monthly_investment_amount']:,.0f}
- Savings: Rs{state['existing_savings']:,.0f}, Investments: Rs{state['existing_investments']:,.0f}
- Risk: {state['risk_tolerance']} (Score: {state['risk_score']}/10 - {state['risk_label']})
- Goal: {state['investment_goal'].replace('_',' ')}, Horizon: {state['investment_horizon_years']} years

MARKET: Nifty50={nifty.get('price','N/A')} ({nifty.get('change_pct','N/A')}%), Sensex={sensex.get('price','N/A')}

RULES:
- Use Indian instruments only (SIP, MF, PPF, NPS, FD, Nifty ETF, etc.)
- Keep each field brief (max 1-2 sentences)
- asset_allocation percentages must sum to 100
- Exactly 4 asset classes, exactly 4 recommendations, exactly 5 action steps
- Return ONLY raw JSON, no markdown, no extra text

OUTPUT FORMAT (return exactly this structure):
{{
  "summary": "2 sentence summary for this investor",
  "asset_allocation": [
    {{"asset_class": "name", "percentage": 40, "rationale": "one sentence", "examples": ["fund1", "fund2"]}},
    {{"asset_class": "name", "percentage": 30, "rationale": "one sentence", "examples": ["fund1"]}},
    {{"asset_class": "name", "percentage": 20, "rationale": "one sentence", "examples": ["instrument1"]}},
    {{"asset_class": "name", "percentage": 10, "rationale": "one sentence", "examples": ["instrument1"]}}
  ],
  "recommendations": [
    {{"title": "title", "description": "one sentence", "expected_return": "X-Y% p.a.", "risk_level": "Low"}},
    {{"title": "title", "description": "one sentence", "expected_return": "X-Y% p.a.", "risk_level": "Medium"}},
    {{"title": "title", "description": "one sentence", "expected_return": "X-Y% p.a.", "risk_level": "Medium"}},
    {{"title": "title", "description": "one sentence", "expected_return": "X-Y% p.a.", "risk_level": "High"}}
  ],
  "action_plan": [
    "Step 1: action",
    "Step 2: action",
    "Step 3: action",
    "Step 4: action",
    "Step 5: action"
  ]
}}"""
    return prompt.strip()


def _extract_json(text: str) -> str:
    """Extract JSON object from raw text, stripping markdown fences."""
    # Remove markdown fences
    text = re.sub(r"```json|```", "", text).strip()
    # Find the outermost { ... }
    start = text.find("{")
    end   = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end + 1]
    return text


def gemini_node(state: AgentState) -> AgentState:
    """Calls Gemini, repairs and parses JSON, stores result in state."""
    try:
        prompt      = _build_prompt(state)
        raw         = gemini_service.generate_structured(prompt)
        extracted   = _extract_json(raw)

        # Try normal parse first
        try:
            parsed = json.loads(extracted)
        except json.JSONDecodeError:
            # Use json-repair to fix truncated/malformed JSON
            repaired = repair_json(extracted, return_objects=True)
            parsed   = repaired if isinstance(repaired, dict) else {}

        # Validate required keys exist
        required = ["summary", "asset_allocation", "recommendations", "action_plan"]
        for key in required:
            if key not in parsed:
                parsed[key] = [] if key != "summary" else "Analysis complete."

        return {
            **state,
            "gemini_analysis": json.dumps(parsed),
            "error": None,
        }

    except Exception as e:
        return {
            **state,
            "gemini_analysis": "{}",
            "error": f"Gemini call failed: {str(e)}",
        }
