"""
Node 3: Market Node
Fetches live Indian market data using yfinance with parallel fetches and timeout.
"""

import yfinance as yf
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.agents.state import AgentState


def _fetch_single(ticker: str) -> tuple:
    """Fetch ticker data safely."""
    try:
        t = yf.Ticker(ticker)
        hist = t.history(period="5d")
        if hist.empty:
            return ticker, {}
        latest = hist["Close"].iloc[-1]
        prev   = hist["Close"].iloc[-2] if len(hist) > 1 else latest
        change = ((latest - prev) / prev) * 100
        return ticker, {"price": round(float(latest), 2), "change_pct": round(float(change), 2)}
    except Exception:
        return ticker, {}


def market_node(state: AgentState) -> AgentState:
    """
    Fetches live snapshots of key Indian market indices in parallel.
    Data is passed to the Gemini node as market context.
    """
    tickers = {
        "nifty_50":     "^NSEI",
        "sensex":       "^BSESN",
        "gold_inr":     "GC=F",
        "usd_inr":      "INR=X",
        "nifty_it":     "^CNXIT",
        "nifty_pharma": "^CNXPHARMA",
    }

    market_context = {}

    with ThreadPoolExecutor(max_workers=len(tickers)) as executor:
        future_to_key = {
            executor.submit(_fetch_single, symbol): key
            for key, symbol in tickers.items()
        }
        for future in as_completed(future_to_key):
            key = future_to_key[future]
            try:
                _, data = future.result(timeout=4)
                market_context[key] = data
            except Exception:
                market_context[key] = {}

    return {
        **state,
        "market_context": market_context,
    }

