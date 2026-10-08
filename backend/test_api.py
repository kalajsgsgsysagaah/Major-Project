import requests
import json

payload = {
    "name": "Gaurav Kalyan",
    "age": 22,
    "employment_status": "student",
    "monthly_income": 25000,
    "monthly_expenses": 12000,
    "existing_savings": 50000,
    "existing_investments": 10000,
    "risk_tolerance": "aggressive",
    "investment_goal": "wealth_creation",
    "investment_horizon_years": 15,
    "monthly_investment_amount": 8000
}

print("Sending profile to API...")
r = requests.post("http://localhost:8000/api/v1/planner/analyze", json=payload, timeout=120)
data = r.json()

if r.status_code == 200:
    print()
    print("=" * 50)
    print("    INVESTMENT PLAN GENERATED SUCCESSFULLY")
    print("=" * 50)
    print("Name        :", data["name"])
    print("Summary     :", data["summary"])
    print()
    ra = data["risk_analysis"]
    print("Risk Score  :", ra["score"], "/ 10 -", ra["label"])
    print("Risk Reason :", ra["reasoning"])
    fin = data["financials"]
    print("Surplus/mo  : Rs", fin["monthly_surplus"])
    print()

    print("--- ASSET ALLOCATION ---")
    for a in data["asset_allocation"]:
        print(" ", a["asset_class"], ":", a["percentage"], "%")
        print("   Rationale:", a["rationale"])
        print("   Examples :", ", ".join(a.get("examples", [])))
    print()

    print("--- RECOMMENDATIONS ---")
    for rec in data["recommendations"]:
        print(" [" + rec["risk_level"] + "]", rec["title"])
        print("   Return  :", rec["expected_return"])
        print("   Details :", rec["description"])
    print()

    print("--- ACTION PLAN ---")
    for i, step in enumerate(data["action_plan"], 1):
        print(" " + str(i) + ".", step)
    print()
    print("Model Used  :", data["model_used"])
    print("Error       :", data["error"])
    print()
    print("STATUS: ALL GOOD")
else:
    print("HTTP ERROR:", r.status_code)
    print(json.dumps(data, indent=2))
