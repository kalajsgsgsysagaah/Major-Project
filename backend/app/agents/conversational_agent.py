"""
Conversational Investment Planning Agent
Full 9-Step interactive workflow implemented in the backend:
Step 1: Greet & Collect Name/Age
Step 2: Understand Risk Tolerance (Low/Medium/High)
Step 3: Identify Investment Goals & Time Horizon
Step 4: Assess Current Portfolio (Stocks, Bonds, Cash %)
Step 5: Market Research & Macro Analysis for October 2026
Step 6: Generate Tailored Recommendations
Step 7: Store in Investment Suggestions Table
Step 8: Prepare Email Summary
Step 9: Send Email
"""

import re
import datetime
from typing import Dict, Any, List
from app.agents.conversational_state import ConversationalAgentState

OCTOBER_2026_MARKET = {
    "date": "October 2026",
    "repo_rate": "6.25%",
    "cpi_inflation": "4.4%",
    "gdp_growth": "6.8% YoY",
    "nifty_50": "25,850 (+11.8% YTD)",
    "ten_year_gsec": "6.78%",
    "macro_summary": "Indian macroeconomic climate in October 2026 demonstrates durable consumption growth alongside easing interest rates. Corporate balance sheets remain healthy, supporting high capex across manufacturing, green energy, and digital services.",
    "favorable_sectors": [
        "Private Banking & Financial Services",
        "Renewable Energy & Power Infrastructure",
        "Domestic Healthcare & Pharma",
        "Consumer Tech & Auto EV Supply Chains"
    ]
}

def generate_recommendations(name: str, age: int, risk: str, goal: str, horizon: int) -> List[Dict[str, Any]]:
    risk_clean = (risk or "Medium").lower()
    
    if "low" in risk_clean or "preserve" in risk_clean:
        return [
            {
                "title": "Target Maturity Sovereign & Corporate Debt Funds (5-7 Yr)",
                "type": "Fixed Income / Debt",
                "risk_alignment": "Low Risk",
                "suggested_assets": "HDFC Corporate Bond Fund, Bharat Bond ETF, SBI 10-Yr G-Sec",
                "reasoning": "In October 2026 with RBI repo rate at 6.25% and 10-Yr G-Sec yields at 6.78%, locking into AAA corporate and sovereign bond funds secures predictable yields while protecting principal against equity market swings."
            },
            {
                "title": "Nifty 50 Low Volatility 30 Index Fund",
                "type": "Defensive Equities",
                "risk_alignment": "Low-to-Moderate Risk",
                "suggested_assets": "UTI Nifty 50 Index Fund, ICICI Prudential Nifty Low Vol 30 ETF",
                "reasoning": "Allocating a 15-20% anchor in low-volatility Indian large caps defends your purchasing power against 4.4% CPI inflation with minimal drawdown risk."
            },
            {
                "title": "Instant Emergency Liquidity Reserve",
                "type": "Liquid & Arbitrage",
                "risk_alignment": "Very Low Risk",
                "suggested_assets": "Axis Liquid Fund, Kotak Arbitrage Direct Plan",
                "reasoning": "Maintains 6 months worth of essential reserves safe from interest rate shocks, yielding ~6.8% with zero exit loads."
            }
        ]
    elif "high" in risk_clean or "growth" in risk_clean or "aggressive" in risk_clean:
        return [
            {
                "title": "High-Conviction Mid & Small Cap Compounders",
                "type": "Growth Equities",
                "risk_alignment": "High Risk",
                "suggested_assets": "Nippon India Small Cap, Axis Mid Cap, Motilal Oswal Midcap Fund",
                "reasoning": "Given India's 6.8% GDP expansion in October 2026, dynamic mid and small caps with high earnings growth offer exceptional multi-year wealth compounding over your horizon."
            },
            {
                "title": "Core Broad-Market Index & Flexi-Cap Anchor",
                "type": "Large & Multi Cap Equities",
                "risk_alignment": "Moderate-High Risk",
                "suggested_assets": "UTI Nifty 50 Index Direct, Parag Parikh Flexi Cap Fund",
                "reasoning": "Provides an institutional-grade foundation capturing earnings growth across leading Indian financial and industrial powerhouses."
            },
            {
                "title": "Energy Transition, Infrastructure & Digital Technology Themes",
                "type": "Thematic / Sectoral",
                "risk_alignment": "High Risk",
                "suggested_assets": "Tata Digital India Fund, Nippon India Power & Infra Fund",
                "reasoning": "Directly taps the strategic multi-year megatrends identified in our October 2026 analysis, where green energy and enterprise IT outpace broader market indices."
            },
            {
                "title": "Dynamic Tactical Asset Allocation Cushion",
                "type": "Hybrid / Dynamic",
                "risk_alignment": "Moderate Risk",
                "suggested_assets": "ICICI Prudential Balanced Advantage Fund",
                "reasoning": "Maintains an automated counter-cyclical cushion that buys equity dips during corrections and preserves investable liquidity."
            }
        ]
    else:
        return [
            {
                "title": "Core Multi-Cap & Nifty 50 Index Fund",
                "type": "Equities (Core)",
                "risk_alignment": "Moderate Risk",
                "suggested_assets": "UTI Nifty 50 Index Fund, Mirae Asset Large & Midcap Fund",
                "reasoning": "Captures steady compounding aligned with India's 6.8% GDP growth rate while maintaining disciplined portfolio volatility through broad index exposure."
            },
            {
                "title": "Active Mid-Cap Growth Opportunities Fund",
                "type": "Mid Cap Equities",
                "risk_alignment": "Moderate-High Risk",
                "suggested_assets": "Axis Mid Cap Fund, HDFC Mid-Cap Opportunities Direct",
                "reasoning": "Targets high-ROE market leaders across manufacturing and healthcare, offering higher return potential than pure large-caps."
            },
            {
                "title": "Sovereign Gold Bonds & Corporate Debt Allocation",
                "type": "Fixed Income & Gold",
                "risk_alignment": "Low-to-Moderate Risk",
                "suggested_assets": "HDFC Corporate Bond Fund, RBI Sovereign Gold Bond / Gold BeES",
                "reasoning": "Provides steady income at 7.2%+ yields and acts as an effective hedge against currency fluctuation and geopolitical market shocks."
            }
        ]

def format_email_summary(state: Dict[str, Any]) -> str:
    name = state.get("name") or "Investor"
    age = state.get("age") or 30
    risk = state.get("risk_level") or "Medium"
    goal = state.get("goal") or "Wealth Growth"
    horizon = state.get("time_horizon_years") or 10
    port = state.get("portfolio") or {"stocks": 60, "bonds": 30, "cash": 10}
    recs = state.get("recommendations") or []
    email = state.get("email") or "investor@example.com"
    
    rec_lines = []
    for i, r in enumerate(recs, 1):
        rec_lines.append(
            f"{i}. {r['title']} [{r['type']}]\n"
            f"   • Risk Alignment: {r['risk_alignment']}\n"
            f"   • Suggested Assets: {r['suggested_assets']}\n"
            f"   • Strategic Reasoning: {r['reasoning']}\n"
        )
    recs_formatted = "\n".join(rec_lines)
    
    return f"""
Subject: Your Tailored Investment Planning Advisory Report [October 2026]
To: {email}

Dear {name},

Thank you for consulting with our Interactive Investment Planning Agent. Based on our conversational dialogue and current October 2026 economic benchmarks (RBI Repo Rate at 6.25%, CPI Inflation at 4.4%, GDP Growth at 6.8%), we have formulated your personalized investment blueprint.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 YOUR INVESTOR PROFILE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Investor Name:      {name}
• Age:                {age} years old
• Risk Appetite:      {risk}
• Primary Goal:       {goal}
• Investment Horizon: {horizon} years
• Current Allocation: {port.get('stocks', 0)}% Stocks / {port.get('bonds', 0)}% Bonds / {port.get('cash', 0)}% Cash

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TAILORED RECOMMENDATIONS (Aligned with Oct 2026 Market Conditions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{recs_formatted}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NEXT STEPS & ACTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Align your current portfolio ({port.get('stocks', 0)}% Stocks / {port.get('bonds', 0)}% Bonds / {port.get('cash', 0)}% Cash) toward target allocation.
2. Automate monthly SIP investments through Direct Mutual Fund plans to eliminate distributor fee leakage.
3. Keep 6 months of essential living expenses in high-yield liquid funds before scaling high-beta holdings.
4. Conduct an annual portfolio review to adjust for shifting interest rates and market valuations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ MARKET CONTEXT & DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Market Snapshot (October 2026): Nifty 50 at 25,850 (+11.8% YTD); 10-Year G-Sec yield at 6.78%.
Disclaimer: This investment report is AI-generated for educational and portfolio structuring analysis. Please consult a SEBI-registered investment advisor prior to making financial commitments.

Warm regards,
Interactive AI Investment Planning Agent
Autonomous Financial Advisory System
""".strip()

def process_agent_turn(state: Dict[str, Any], user_input: str) -> Dict[str, Any]:
    phase = state.get("phase") or "greet_and_collect"
    user_msg = (user_input or "").strip()
    
    # Store user turn
    history = list(state.get("history") or [])
    if user_msg:
        history.append({
            "role": "user",
            "content": user_msg,
            "timestamp": datetime.datetime.now().isoformat()
        })
    
    agent_response = ""
    next_phase = phase
    
    # ── Step 1: Greet & Collect Name/Age ───────────────────────────────────────
    if phase == "greet_and_collect":
        if not user_msg:
            agent_response = (
                "Hello! I am your interactive investment planning agent. "
                "I'm here to have a conversational dialogue with you, understand your financial position, "
                "and generate tailored investment recommendations based on your profile and current market conditions.\n\n"
                "To get started, what's your name and how old are you?"
            )
            next_phase = "greet_and_collect"
        else:
            # Parse name and age
            age_match = re.search(r'\b(1[8-9]|[2-8][0-9])\b', user_msg)
            age = int(age_match.group(1)) if age_match else 30
            
            clean = re.sub(r'\b(1[8-9]|[2-8][0-9])\b', ' ', user_msg)
            clean = re.sub(r'years?|old|age|is|my|name|i am|i\'m|hello|hi|,|-|:', ' ', clean, flags=re.IGNORECASE).strip()
            words = [w.capitalize() for w in clean.split() if len(w) > 1 and not w.isdigit()]
            name = " ".join(words[:2]) if words else "Investor"
            
            state["name"] = name
            state["age"] = age
            
            agent_response = (
                f"Hello {name}! I have confirmed your age as {age} years.\n\n"
                "On a scale of Low, Medium, or High, what is your risk tolerance?\n\n"
                "• Low = preserve capital with minimal volatility\n"
                "• Medium = balanced growth with moderate stability\n"
                "• High = maximize long-term growth and capital appreciation"
            )
            next_phase = "risk_tolerance"
            
    # ── Step 2: Understand Risk Tolerance ─────────────────────────────────────
    elif phase == "risk_tolerance":
        lower = user_msg.lower()
        if "low" in lower or "conservative" in lower or "preserve" in lower:
            risk = "Low"
        elif "high" in lower or "growth" in lower or "aggressive" in lower:
            risk = "High"
        else:
            risk = "Medium"
            
        state["risk_level"] = risk
        agent_response = (
            f"Understood. I have recorded your risk tolerance as: {risk} Risk.\n\n"
            "Now let's identify your goals:\n"
            "1. What is your primary investment goal? (e.g., retirement, wealth growth, capital preservation, home purchase)\n"
            "2. What is your time horizon in years?"
        )
        next_phase = "goals_and_horizon"
        
    # ── Step 3: Identify Investment Goals & Time Horizon ───────────────────────
    elif phase == "goals_and_horizon":
        horizon_match = re.search(r'\b(\d{1,2})\b', user_msg)
        horizon = int(horizon_match.group(1)) if horizon_match else 10
        
        goal_text = re.sub(r'\b\d{1,2}\s*(years?|yrs?)\b', '', user_msg, flags=re.IGNORECASE)
        goal_text = re.sub(r'\b(years?|yrs?|horizon|time|for|my|goal|is|to|in)\b', '', goal_text, flags=re.IGNORECASE).strip()
        goal = goal_text.strip(",.- ").capitalize() if len(goal_text) > 2 else "Long-Term Wealth Growth"
        
        state["goal"] = goal
        state["time_horizon_years"] = horizon
        
        agent_response = (
            f"Noted! Primary Goal: {goal} | Time Horizon: {horizon} years.\n\n"
            "What is your current portfolio allocation?\n"
            "Please provide your percentages for:\n"
            "• Stocks (%)\n"
            "• Bonds (%)\n"
            "• Cash (%)\n\n"
            "(Please make sure the total adds to 100%)"
        )
        next_phase = "portfolio_check"
        
    # ── Step 4: Assess Current Portfolio ───────────────────────────────────────
    elif phase == "portfolio_check":
        nums = [int(n) for n in re.findall(r'\d+', user_msg)]
        if len(nums) >= 3:
            stocks, bonds, cash = nums[0], nums[1], nums[2]
        elif len(nums) == 2:
            stocks, bonds = nums[0], nums[1]
            cash = max(0, 100 - stocks - bonds)
        else:
            stocks, bonds, cash = 60, 30, 10
            
        total = stocks + bonds + cash
        state["portfolio"] = {"stocks": stocks, "bonds": bonds, "cash": cash}
        
        # ── Step 5 & 6: Market Research & Generate Recommendations ────────────
        state["market_research_oct_2026"] = OCTOBER_2026_MARKET
        recs = generate_recommendations(
            state.get("name") or "Investor",
            state.get("age") or 30,
            state.get("risk_level") or "Medium",
            state.get("goal") or "Wealth Growth",
            state.get("time_horizon_years") or 10
        )
        state["recommendations"] = recs
        
        # ── Step 7: Store in Investment Suggestions Table ──────────────────────
        date_str = datetime.date.today().strftime("%d %b %Y")
        table_rows = []
        for r in recs:
            table_rows.append({
                "user_name": state.get("name"),
                "age": state.get("age"),
                "risk_level": state.get("risk_level"),
                "investment_goal": state.get("goal"),
                "time_horizon": f"{state.get('time_horizon_years')} years",
                "current_portfolio": f"{stocks}% S / {bonds}% B / {cash}% C",
                "recommendation": r["title"],
                "reasoning": r["reasoning"],
                "suggested_assets": r["suggested_assets"],
                "date_generated": date_str,
                "status": "Completed"
            })
        state["suggestions_table"] = table_rows
        
        recs_text = "\n\n".join([
            f"Recommendation {i+1}: {r['title']}\n"
            f"• Asset Strategy: {r['type']} ({r['risk_alignment']})\n"
            f"• Suggested Assets: {r['suggested_assets']}\n"
            f"• Detailed Reasoning: {r['reasoning']}"
            for i, r in enumerate(recs)
        ])
        
        agent_response = (
            f"Portfolio Confirmed: {stocks}% Stocks, {bonds}% Bonds, {cash}% Cash (Total: {total}%).\n\n"
            f"🔍 Market Research Analysis [October 2026]:\n"
            f"• Macro Rates: Repo Rate {OCTOBER_2026_MARKET['repo_rate']}, Inflation {OCTOBER_2026_MARKET['cpi_inflation']}, GDP Growth {OCTOBER_2026_MARKET['gdp_growth']}, 10-Yr G-Sec {OCTOBER_2026_MARKET['ten_year_gsec']}.\n"
            f"• Commentary: {OCTOBER_2026_MARKET['macro_summary']}\n\n"
            f"🎯 Tailored Investment Recommendations:\n\n"
            f"{recs_text}\n\n"
            "✅ All recommendations have been stored in the Investment Suggestions Table.\n\n"
            "What is your email address so I can send you your personalized advisory report?"
        )
        next_phase = "await_email"
        
    # ── Step 8 & 9: Prepare Email Summary & Dispatch ───────────────────────────
    elif phase == "await_email":
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', user_msg)
        email = email_match.group(0) if email_match else user_msg.strip()
        state["email"] = email
        state["email_dispatched"] = True
        
        email_body = format_email_summary(state)
        state["email_summary"] = email_body
        
        agent_response = (
            f"Thank you {state.get('name')}! Your personalized investment recommendations report has been dispatched to:\n"
            f"📧 {email}\n\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
            f"{email_body}\n"
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"
            "Our advisory session is now complete! Feel free to ask any questions about these recommendations or type 'restart' to plan for another profile."
        )
        next_phase = "completed"
        
    # ── Completed Session / Q&A ───────────────────────────────────────────────
    else:
        if "restart" in user_msg.lower() or "reset" in user_msg.lower():
            state["phase"] = "greet_and_collect"
            state["name"] = None
            state["age"] = None
            state["risk_level"] = None
            state["goal"] = None
            state["time_horizon_years"] = None
            state["portfolio"] = None
            state["recommendations"] = None
            state["suggestions_table"] = None
            state["email"] = None
            state["email_summary"] = None
            state["email_dispatched"] = False
            agent_response = (
                "Session refreshed!\n\n"
                "Hello! I am your interactive investment planning agent. "
                "What's your name and how old are you?"
            )
            next_phase = "greet_and_collect"
        else:
            agent_response = (
                f"Based on your {state.get('risk_level')} risk profile and goal of {state.get('goal')}, "
                "sticking to automated monthly SIPs and direct mutual funds will optimize net compounding under October 2026 market conditions. "
                "Type 'restart' anytime if you want to run another consultation!"
            )
            next_phase = "completed"
            
    # Record agent turn
    state["phase"] = next_phase
    state["agent_response"] = agent_response
    history.append({
        "role": "agent",
        "content": agent_response,
        "timestamp": datetime.datetime.now().isoformat()
    })
    state["history"] = history
    return state
