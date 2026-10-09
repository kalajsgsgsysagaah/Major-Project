"""
Interactive LLM Conversational Agent powered by Google Gemini API.
Runs natural, dynamic dialogue just like ChatGPT and Claude while strictly
guiding the user through their investment planning advisory workflow.
"""

import json
import re
from typing import Dict, Any, List
from google import genai
from google.genai import types
from app.config import settings

ACTIVE_CHAT_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest"
]

SYSTEM_INSTRUCTION = """You are an expert, empathetic, and interactive AI Investment Planning Agent (similar to ChatGPT and Claude) assisting Indian investors.

YOUR MISSION:
Engage in a natural, personalized, conversational dialogue with the user to gather their financial information, explain concepts when they are unsure, research current October 2026 Indian market conditions, generate personalized recommendations, present an Investment Suggestions table, and prepare/send their recommendations to their email.

OCTOBER 2026 INDIAN MARKET INDICATORS:
- RBI Repo Rate: 6.25%
- CPI Inflation: 4.4%
- India GDP Growth: 6.8% YoY
- Nifty 50: 25,850 (+11.8% YTD)
- 10-Year G-Sec Benchmark Yield: 6.78%
- Leading sectors: Private Banking & FinTech, Green Energy & Infra, Domestic Healthcare, Auto EV Supply Chains.

CONVERSATION GUIDELINES:
1. Speak naturally, warmly, and intelligently—never sound like a rigid script or robotic questionnaire.
2. If the user asks for explanations (e.g. "can you explain risk tolerance in detail?", "what is a bond?"), explain it clearly with helpful examples and then gently ask for their decision.
3. Keep track of what the user has already told you:
   - Name & Age
   - Email address (if provided in their intro or later)
   - Risk Tolerance (Low, Medium, or High)
   - Primary Goal & Time Horizon
   - Current Portfolio Allocation (Stocks %, Bonds %, Cash %)
4. Progress naturally through the flow:
   - Greet warmly, collect and acknowledge name and age.
   - Clarify and establish risk tolerance.
   - Understand their investment goals and time horizon.
   - Check current portfolio allocation (confirming total is roughly 100%).
   - Conduct market analysis against October 2026 conditions and generate 2-4 tailored recommendations with strategic reasoning, specific fund/asset names (e.g., UTI Nifty 50, Axis Mid Cap, HDFC Corporate Bond), and risk alignment.
   - Present the structured "Investment Suggestions Table" in your response.
   - If you don't have their email address, ask for it. If they already provided it or just gave it, prepare the personalized email summary and confirm dispatch to their exact email address.
5. Format your output cleanly using markdown, bullet points, and tables when presenting recommendations and data.
"""

class LLMConversationalEngine:
    def __init__(self):
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.chats: Dict[str, Any] = {}
        self.session_profiles: Dict[str, Dict[str, Any]] = {}

    def get_or_create_chat(self, session_id: str):
        if session_id in self.chats:
            return self.chats[session_id]

        chat_session = None
        for model in ACTIVE_CHAT_MODELS:
            try:
                chat_session = self.client.chats.create(
                    model=model,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_INSTRUCTION,
                        temperature=0.7,
                    )
                )
                break
            except Exception as e:
                continue

        if not chat_session:
            chat_session = self.client.chats.create(
                model="gemini-flash-lite-latest",
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    temperature=0.7
                )
            )

        self.chats[session_id] = chat_session
        self.session_profiles[session_id] = {}
        return chat_session

    def reset_chat(self, session_id: str):
        if session_id in self.chats:
            del self.chats[session_id]
        if session_id in self.session_profiles:
            del self.session_profiles[session_id]

    def process_message(self, session_id: str, message: str) -> str:
        chat = self.get_or_create_chat(session_id)
        
        # Track email if present in user message
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', message)
        if email_match:
            self.session_profiles[session_id]["email"] = email_match.group(0)

        response = chat.send_message(message)
        return response.text

llm_agent = LLMConversationalEngine()
