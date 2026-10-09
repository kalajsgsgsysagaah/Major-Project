/**
 * Standalone Client-side Investment Planner Generator
 * Allows the entire frontend to work seamlessly without running any backend server.
 */

export function generateLocalInvestmentPlan(profile) {
  const age = Number(profile.age) || 28;
  const horizon = Number(profile.investment_horizon_years) || 5;
  const tolerance = (profile.risk_tolerance || "moderate").toLowerCase();
  const income = Number(profile.monthly_income) || 0;
  const expenses = Number(profile.monthly_expenses) || 0;
  const surplus = income - expenses;
  const sip = Number(profile.monthly_investment_amount) || 0;
  const savings = Number(profile.existing_savings) || 0;
  const investments = Number(profile.existing_investments) || 0;

  // 1. Calculate Risk Score (1 to 10)
  let score = 0;
  if (age < 25) score += 3;
  else if (age < 35) score += 2.5;
  else if (age < 45) score += 2;
  else if (age < 55) score += 1;
  else score += 0.5;

  if (horizon >= 15) score += 2.5;
  else if (horizon >= 10) score += 2;
  else if (horizon >= 5) score += 1.5;
  else if (horizon >= 3) score += 1;
  else score += 0.5;

  const tolMap = { conservative: 1, moderate: 2, aggressive: 3 };
  score += tolMap[tolerance] || 2;

  if (income > 0) {
    const surplusRatio = surplus / income;
    if (surplusRatio >= 0.5) score += 1.5;
    else if (surplusRatio >= 0.3) score += 1;
    else if (surplusRatio >= 0.1) score += 0.5;
  }

  const riskScore = Math.max(1, Math.min(10, Math.round(score)));

  let riskLabel = "Moderate";
  let riskReasoning = "";
  if (riskScore <= 3) {
    riskLabel = "Conservative";
    riskReasoning = `Based on your age (${age}), investment horizon (${horizon} years), and preference, capital protection and steady fixed income are recommended.`;
  } else if (riskScore <= 6) {
    riskLabel = "Moderate";
    riskReasoning = `Your profile shows a balanced risk profile. At age ${age} with a ${horizon}-year horizon, a diversified blend of equities and debt yields consistent growth with controlled downside.`;
  } else {
    riskLabel = "Aggressive";
    riskReasoning = `At age ${age} with a ${horizon}-year investment horizon and healthy monthly cash flow, an aggressive growth strategy in high-alpha equities will maximize wealth creation.`;
  }

  // 2. Determine Asset Allocation based on risk
  let assetAllocation = [];
  let recommendations = [];

  if (riskLabel === "Conservative") {
    assetAllocation = [
      {
        asset_class: "Debt & Fixed Income",
        percentage: 50,
        rationale: "Ensures capital safety and stable yields via sovereign & corporate debt.",
        examples: ["HDFC Corporate Bond Fund", "SBI Short Term Debt", "Govt Bonds"]
      },
      {
        asset_class: "Large Cap & Index Equities",
        percentage: 25,
        rationale: "Provides moderate inflation-beating equity appreciation with low volatility.",
        examples: ["UTI Nifty 50 Index Fund", "ICICI Pru Bluechip"]
      },
      {
        asset_class: "Liquid Mutual Funds / Emergency",
        percentage: 15,
        rationale: "High liquidity for immediate emergencies and cash requirements.",
        examples: ["HDFC Liquid Fund", "Axis Liquid Fund"]
      },
      {
        asset_class: "Gold & SGB",
        percentage: 10,
        rationale: "Acts as a reliable hedge against market volatility and inflation.",
        examples: ["Nippon India Gold BeES ETF", "Sovereign Gold Bonds (SGB)"]
      }
    ];

    recommendations = [
      {
        title: "Liquid Mutual Fund Reserve",
        description: "Maintain 3-6 months worth of emergency cash in instant-redemption liquid funds.",
        expected_return: "6.5% - 7.2% p.a.",
        risk_level: "Low"
      },
      {
        title: "HDFC Corporate Bond Fund",
        description: "High credit quality corporate debt offering steady monthly accrual returns.",
        expected_return: "7.5% - 8.2% p.a.",
        risk_level: "Low"
      },
      {
        title: "Nifty 50 Index Mutual Fund",
        description: "Low-cost index investing in India's top 50 bluechip companies for steady equity gains.",
        expected_return: "11% - 13% p.a.",
        risk_level: "Medium"
      },
      {
        title: "Sovereign Gold Bonds / Gold ETF",
        description: "Hedge capital through digital gold with zero storage costs.",
        expected_return: "9% - 11% p.a.",
        risk_level: "Low"
      }
    ];
  } else if (riskLabel === "Moderate") {
    assetAllocation = [
      {
        asset_class: "Nifty Index & Large Cap Equity",
        percentage: 45,
        rationale: "Core compounding engine investing across bluechip industry leaders.",
        examples: ["UTI Nifty 50 Index Fund", "Mirae Asset Large Cap"]
      },
      {
        asset_class: "Mid Cap & Flexi Cap Equities",
        percentage: 25,
        rationale: "Accelerates portfolio growth through rapidly expanding mid-size market leaders.",
        examples: ["Axis Mid Cap Fund", "Parag Parikh Flexi Cap"]
      },
      {
        asset_class: "Debt & Provident Funds",
        percentage: 20,
        rationale: "Provides downside buffer, safety cushion, and tax benefits.",
        examples: ["PPF", "HDFC Corporate Bond", "ICICI Pru Bond"]
      },
      {
        asset_class: "Liquid Fund & Gold",
        percentage: 10,
        rationale: "Emergency resilience and strategic hedge against equity drawdowns.",
        examples: ["HDFC Liquid Fund", "Gold BeES ETF"]
      }
    ];

    recommendations = [
      {
        title: "UTI Nifty 50 Index Fund",
        description: "Core passive equity building long-term wealth mirroring the Indian economy.",
        expected_return: "12% - 14% p.a.",
        risk_level: "Medium"
      },
      {
        title: "Axis Mid Cap Fund",
        description: "Focused allocation in high-growth companies with strong earnings momentum.",
        expected_return: "14% - 16% p.a.",
        risk_level: "Medium"
      },
      {
        title: "Public Provident Fund (PPF) & Debt Funds",
        description: "Government-backed guaranteed compounding and Section 80C tax exemption.",
        expected_return: "7.1% - 8.0% p.a.",
        risk_level: "Low"
      },
      {
        title: "Emergency Liquid Fund",
        description: "Parking essential funds for unpredicted cashflow needs without locking capital.",
        expected_return: "6.8% - 7.3% p.a.",
        risk_level: "Low"
      }
    ];
  } else {
    // Aggressive
    assetAllocation = [
      {
        asset_class: "Mid & Small Cap Equities",
        percentage: 40,
        rationale: "High-alpha growth potential capitalizing on fast-expanding emerging companies.",
        examples: ["Nippon India Small Cap", "Axis Mid Cap Fund"]
      },
      {
        asset_class: "Nifty 50 & Flexi Cap",
        percentage: 35,
        rationale: "Provides solid foundation and resilience while capturing overall market upside.",
        examples: ["UTI Nifty 50 Index Fund", "Parag Parikh Flexi Cap"]
      },
      {
        asset_class: "Dynamic Debt & Hybrid",
        percentage: 15,
        rationale: "Mitigates sharp corrections and provides opportunistic rebalancing capital.",
        examples: ["HDFC Corporate Bond", "ICICI Balanced Advantage"]
      },
      {
        asset_class: "Emergency Reserve & Gold",
        percentage: 10,
        rationale: "Ensures uninterrupted SIP continuity during market cycles.",
        examples: ["HDFC Liquid Fund", "Gold BeES ETF"]
      }
    ];

    recommendations = [
      {
        title: "Nippon India Small Cap Fund",
        description: "High-conviction small-cap portfolio for superior multi-year capital appreciation.",
        expected_return: "16% - 19% p.a.",
        risk_level: "High"
      },
      {
        title: "UTI Nifty 50 Index Fund",
        description: "Steady anchor allocation providing broad market diversification.",
        expected_return: "12% - 14% p.a.",
        risk_level: "Medium"
      },
      {
        title: "Axis Mid Cap Mutual Fund",
        description: "Capturing emerging leaders in high-growth sectors across manufacturing and tech.",
        expected_return: "14% - 17% p.a.",
        risk_level: "Medium"
      },
      {
        title: "HDFC Liquid Fund (Emergency Cushion)",
        description: "Sustaining regular SIP commitments without liquidating investments in market dips.",
        expected_return: "6.8% - 7.2% p.a.",
        risk_level: "Low"
      }
    ];
  }

  const actionPlan = [
    `Set up an automated monthly SIP of ₹${sip.toLocaleString('en-IN')} on the 1st or 5th of every month.`,
    `Establish an emergency liquidity cushion of ₹${Math.max(50000, expenses * 3).toLocaleString('en-IN')} in a liquid mutual fund.`,
    `Allocate into low-cost index and multi-cap funds through direct growth plans to minimize commission drag.`,
    `Utilize tax deductions under Section 80C (PPF / ELSS) and 80CCD(1B) for optimal net returns.`,
    `Perform a portfolio health check once every 12 months to rebalance back to target weights.`
  ];

  const summary = `Based on your profile as an investor aiming for ${profile.investment_goal ? profile.investment_goal.replace(/_/g, " ") : "wealth creation"} over ${horizon} years, we've designed a tailored ${riskLabel.toLowerCase()} portfolio optimized for risk-adjusted returns in the Indian market.`;

  return {
    name: profile.name || "Investor",
    summary,
    risk_analysis: {
      score: riskScore,
      label: riskLabel,
      reasoning: riskReasoning
    },
    financials: {
      monthly_income: income,
      monthly_expenses: expenses,
      monthly_surplus: surplus,
      monthly_investment_amount: sip,
      existing_savings: savings,
      existing_investments: investments
    },
    investment_profile: {
      goal: (profile.investment_goal || "wealth_creation").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      horizon_years: horizon,
      risk_tolerance: tolerance
    },
    asset_allocation: assetAllocation,
    recommendations: recommendations,
    action_plan: actionPlan,
    disclaimer: "This investment plan is generated for educational purposes. Consult a SEBI-registered financial advisor before making actual financial decisions."
  };
}
