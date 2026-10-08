# Agentic AI Intelligent Investment Planning

**B.Tech Major Project** | Full-Stack AI Investment Advisor

---

## Project Overview

An intelligent investment planning system powered by:
- **Google Gemini** — LLM reasoning and natural language analysis
- **LangGraph** — Agentic multi-step workflow orchestration
- **FastAPI** — High-performance Python backend
- **React + Vite** — Modern, responsive frontend

---

## Project Structure

```
Major Project/
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── main.py       # App entry point
│   │   ├── config.py     # Settings
│   │   ├── api/          # Route handlers
│   │   ├── agents/       # LangGraph workflow nodes
│   │   ├── services/     # Gemini & market data
│   │   └── models/       # Pydantic schemas
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   ├── pages/
    │   └── services/
    └── package.json
```

---

## Getting Started

### Backend

```bash
cd backend

# Copy and fill in your API keys
copy .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn app.main:app --reload --port 8000
```

API docs will be available at: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## Required API Keys

| Key | Get from |
|-----|----------|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `ALPHA_VANTAGE_API_KEY` | [alphavantage.co](https://www.alphavantage.co/support/#api-key) (optional) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | FastAPI + Python 3.13 |
| AI Reasoning | Google Gemini API |
| Agent Workflow | LangGraph |
| Data Analysis | Pandas + NumPy |
| Market Data | yfinance / Alpha Vantage |

---

## Implementation Phases

- [x] Phase 0 — Project setup & basic scaffold
- [ ] Phase 1 — Gemini API integration
- [ ] Phase 2 — User profile schema & API endpoint
- [ ] Phase 3 — LangGraph workflow skeleton
- [ ] Phase 4 — Risk analysis logic
- [ ] Phase 5 — Financial market data integration
- [ ] Phase 6 — Gemini reasoning node
- [ ] Phase 7 — Report generation & dashboard
- [ ] Phase 8 — Polish & testing
