"""
Pydantic Schemas
Request and response models for the Investment Planner API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


# ─── Enums ────────────────────────────────────────────────────────────────────

class RiskTolerance(str, Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"


class InvestmentGoal(str, Enum):
    wealth_creation = "wealth_creation"
    retirement = "retirement"
    education = "education"
    home_purchase = "home_purchase"
    emergency_fund = "emergency_fund"
    passive_income = "passive_income"


class EmploymentStatus(str, Enum):
    employed = "employed"
    self_employed = "self_employed"
    student = "student"
    retired = "retired"
    unemployed = "unemployed"


# ─── Request: User Investment Profile ────────────────────────────────────────

class InvestmentProfileRequest(BaseModel):
    # Personal Info
    name: str = Field(..., min_length=1, max_length=100, description="Full name")
    age: int = Field(..., ge=18, le=80, description="Age in years")
    employment_status: EmploymentStatus = Field(..., description="Current employment status")

    # Financial Info
    monthly_income: float = Field(..., gt=0, description="Monthly income in INR")
    monthly_expenses: float = Field(..., gt=0, description="Monthly expenses in INR")
    existing_savings: float = Field(..., ge=0, description="Total existing savings in INR")
    existing_investments: float = Field(default=0, ge=0, description="Current investment value in INR")

    # Investment Preferences
    risk_tolerance: RiskTolerance = Field(..., description="Risk tolerance level")
    investment_goal: InvestmentGoal = Field(..., description="Primary investment goal")
    investment_horizon_years: int = Field(..., ge=1, le=40, description="Investment horizon in years")
    monthly_investment_amount: float = Field(..., gt=0, description="Amount willing to invest monthly in INR")



    class Config:
        json_schema_extra = {
            "example": {
                "name": "Rahul Sharma",
                "age": 28,
                "employment_status": "employed",
                "monthly_income": 80000,
                "monthly_expenses": 40000,
                "existing_savings": 200000,
                "existing_investments": 50000,
                "risk_tolerance": "moderate",
                "investment_goal": "wealth_creation",
                "investment_horizon_years": 10,
                "monthly_investment_amount": 15000
            }
        }


# ─── Response Models ──────────────────────────────────────────────────────────

class RiskAnalysis(BaseModel):
    score: int = Field(..., ge=1, le=10, description="Risk score from 1 (very conservative) to 10 (very aggressive)")
    label: str
    reasoning: str


class AssetAllocation(BaseModel):
    asset_class: str
    percentage: float
    rationale: str
    examples: List[str]


class InvestmentRecommendation(BaseModel):
    title: str
    description: str
    expected_return: str
    risk_level: str


class InvestmentPlanResponse(BaseModel):
    name: str
    summary: str
    risk_analysis: RiskAnalysis
    monthly_surplus: float
    investable_amount: float
    asset_allocation: List[AssetAllocation]
    recommendations: List[InvestmentRecommendation]
    action_plan: List[str]
    disclaimer: str
    model_used: str
