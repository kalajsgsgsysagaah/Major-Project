"""
Node 3: Market Node
Fetches live Indian market data using yfinance with a timeout.
"""

import yfinance as yf
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout
from app.agents.state import AgentState


def _safe_fetch(ticker: str) -> dict:
    """Fetch ticker data safely with a 5-second timeout."""
    try:
        def fetch():
            t = yf.Ticker(ticker)
            hist = t.history(period="5d")
            if hist.empty:
                return {}
            latest = hist["Close"].iloc[-1]
            prev   = hist["Close"].iloc[-2] if len(hist) > 1 else latest
            change = ((latest - prev) / prev) * 100
            return {"price": round(float(latest), 2), "change_pct": round(float(change), 2)}

        with ThreadPoolExecutor(max_workers=1) as ex:
            future = ex.submit(fetch)
            return future.result(timeout=5)
    except Exception:
        return {}


def market_node(state: AgentState) -> AgentState:
    """
    Fetches live snapshots of key Indian market indices.
    Data is passed to the Gemini node as market context.
    """
    market_context = {
        "nifty_50":     _safe_fetch("^NSEI"),
        "sensex":       _safe_fetch("^BSESN"),
        "gold_inr":     _safe_fetch("GC=F"),
        "usd_inr":      _safe_fetch("INR=X"),
        "nifty_it":     _safe_fetch("^CNXIT"),
        "nifty_pharma": _safe_fetch("^CNXPHARMA"),
    }

    return {
        **state,
        "market_context": market_context,
    }
