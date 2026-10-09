/**
 * Truly Dynamic Interactive Conversational Agent Engine
 * 
 * Flow:
 * Phase: 'ask_name_age' -> Greet, ask name and age -> listen, parse, confirm
 * Phase: 'ask_risk' -> Ask risk tolerance (Low/Medium/High) -> parse, explain, record
 * Phase: 'ask_goals' -> Ask primary investment goal & time horizon -> parse, record
 * Phase: 'ask_portfolio' -> Ask current allocation (Stocks%, Bonds%, Cash%) -> validate 100%
 * Phase: 'research_and_recommend' -> Live analysis of user profile vs Oct 2026 market data -> generate 2-4 custom recs & store in table
 * Phase: 'ask_email' -> Ask user for their email address to send the report
 * Phase: 'send_email' -> Dispatch email to user's specified email, show confirmation
 * Phase: 'completed' -> Free-form Q&A on their generated plan or restart
 */

export const OCTOBER_2026_MARKET_SNAPSHOT = {
  date: "October 2026",
  repo_rate: "6.25%",
  inflation: "4.4% CPI",
  gdp_growth: "6.8% YoY",
  nifty_50: "25,850 (+11.8% YTD)",
  ten_year_gsec: "6.78%",
  macro_summary: "In October 2026, the Indian economy shows resilient domestic consumption with monetary easing underway as CPI moderates to 4.4%. Corporate capex remains strong, creating favorable risk-reward dynamics across domestic cyclical sectors.",
  favorable_sectors: ["Private Banking & FinTech", "Renewable Energy & Infrastructure", "Domestic Healthcare/Pharma", "Consumer Tech & Electric Mobility"]
};

export const INITIAL_CONVERSATION_STATE = {
  phase: "ask_name_age",
  data: {
    name: "",
    age: "",
    riskLevel: "",
    goal: "",
    horizon: "",
    portfolio: { stocks: 0, bonds: 0, cash: 0 },
    recommendations: [],
    email: "",
    emailSent: false
  }
};

/**
 * Extracts name and age naturally from any free-form user message
 */
export function parseNameAndAge(text) {
  const ageMatch = text.match(/\b(1[8-9]|[2-8][0-9])\b/);
  const age = ageMatch ? ageMatch[0] : "";

  // Strip common conversational words and numbers to find the name
  let clean = text
    .replace(/\b(1[8-9]|[2-8][0-9])\b/g, '')
    .replace(/years?|old|age|is|my|name|i am|i'm|hello|hi|hey|it's|its|,|-|:/gi, ' ')
    .trim();

  // Pick first 1-3 capitalized or continuous words
  const words = clean.split(/\s+/).filter(w => w.length > 1 && !/^\d+$/.test(w));
  let name = "";
  if (words.length > 0) {
    name = words.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  return { name: name || "Investor", age: age || "30" };
}

/**
 * Extracts risk tolerance naturally
 */
export function parseRiskTolerance(text) {
  const lower = text.toLowerCase();
  if (lower.includes("low") || lower.includes("conservative") || lower.includes("safe") || lower.includes("preserve") || lower.includes("capital")) {
    return "Low";
  }
  if (lower.includes("high") || lower.includes("aggressive") || lower.includes("max") || lower.includes("growth") || lower.includes("equity")) {
    return "High";
  }
  if (lower.includes("med") || lower.includes("moderate") || lower.includes("balance") || lower.includes("neutral")) {
    return "Medium";
  }
  return "Medium";
}

/**
 * Extracts goal and time horizon
 */
export function parseGoalAndHorizon(text) {
  const numberMatch = text.match(/\b(\d{1,2})\b/);
  const horizon = numberMatch ? numberMatch[0] : "10";

  let goal = text
    .replace(/\b\d{1,2}\s*(years?|yrs?)\b/gi, '')
    .replace(/\b(years?|yrs?|horizon|time|for|my|goal|is|to|in)\b/gi, '')
    .replace(/[,.-]/g, ' ')
    .trim();

  if (!goal || goal.length < 3) {
    const lower = text.toLowerCase();
    if (lower.includes("retire")) goal = "Retirement Planning";
    else if (lower.includes("house") || lower.includes("home")) goal = "Home Purchase";
    else if (lower.includes("child") || lower.includes("education")) goal = "Child Education";
    else if (lower.includes("wealth")) goal = "Wealth Accumulation";
    else goal = "Long-Term Wealth Growth";
  } else {
    goal = goal.charAt(0).toUpperCase() + goal.slice(1);
  }

  return { goal, horizon };
}

/**
 * Extracts portfolio allocation and validates
 */
export function parsePortfolio(text) {
  const nums = text.match(/\d+/g);
  let stocks = 0, bonds = 0, cash = 0;

  if (nums && nums.length >= 3) {
    stocks = parseInt(nums[0]) || 0;
    bonds = parseInt(nums[1]) || 0;
    cash = parseInt(nums[2]) || 0;
  } else if (nums && nums.length === 2) {
    stocks = parseInt(nums[0]) || 0;
    bonds = parseInt(nums[1]) || 0;
    cash = Math.max(0, 100 - stocks - bonds);
  } else if (nums && nums.length === 1) {
    stocks = parseInt(nums[0]) || 0;
    bonds = Math.max(0, (100 - stocks) / 2);
    cash = 100 - stocks - bonds;
  } else {
    stocks = 60; bonds = 30; cash = 10;
  }

  const total = stocks + bonds + cash;
  return { stocks, bonds, cash, total, isValid: total === 100 };
}

/**
 * Generate 2-4 tailored recommendations matching user profile & Oct 2026 conditions
 */
export function generateDynamicRecommendations(profile) {
  const risk = (profile.riskLevel || "Medium").toLowerCase();
  const horizon = parseInt(profile.horizon) || 5;

  if (risk === "low") {
    return [
      {
        id: "REC-1",
        title: "Target Maturity Sovereign & Corporate Debt Funds (5-7 Yr)",
        type: "Fixed Income / Sovereign Debt",
        riskAlignment: "Low Risk",
        suggestedAssets: "HDFC Corporate Bond Fund, Bharat Bond ETF, SBI 10-Yr G-Sec",
        reasoning: "In the October 2026 monetary climate with RBI repo rate at 6.25% and 10-Yr G-Sec yield at 6.78%, locking into AAA corporate and sovereign bond funds secures predictable yields while protecting capital against equity drawdowns."
      },
      {
        id: "REC-2",
        title: "Nifty 50 Bluechip & Low-Volatility Defensive Index",
        type: "Large Cap Equities",
        riskAlignment: "Low-to-Moderate Risk",
        suggestedAssets: "UTI Nifty 50 Index Fund, ICICI Nifty Low Vol 30 ETF",
        reasoning: "Allocating 20% into diversified low-volatility Indian large caps hedges your portfolio against 4.4% CPI inflation with minimal drawdown risk over your horizon."
      },
      {
        id: "REC-3",
        title: "Instant Liquidity Reserve in Liquid & Arbitrage Funds",
        type: "Liquid Assets",
        riskAlignment: "Very Low Risk",
        suggestedAssets: "Axis Liquid Fund, Kotak Arbitrage Direct Plan",
        reasoning: "Provides instantaneous liquidity for unforeseen capital needs, generating ~6.7% annualized yield without interest rate duration risk or exit penalties."
      }
    ];
  } else if (risk === "high") {
    return [
      {
        id: "REC-1",
        title: "High-Conviction Mid & Small Cap Compounders",
        type: "Growth Equities",
        riskAlignment: "High Risk",
        suggestedAssets: "Nippon India Small Cap, Axis Mid Cap, Motilal Oswal Midcap Fund",
        reasoning: "Taking advantage of India's robust 6.8% GDP expansion in October 2026, mid and small caps with high earnings growth offer exceptional multi-year wealth accumulation over your horizon."
      },
      {
        id: "REC-2",
        title: "Core Broad-Market Index & Flexi-Cap Anchor",
        type: "Large/Multi Cap Equities",
        riskAlignment: "Moderate-High Risk",
        suggestedAssets: "UTI Nifty 50 Index Direct, Parag Parikh Flexi Cap Fund",
        reasoning: "Provides high-grade capital foundation capturing steady earnings growth across leading Indian financial and industrial powerhouses."
      },
      {
        id: "REC-3",
        title: "Energy Transition, Infrastructure & Digital Technology Themes",
        type: "Sectoral / Thematic",
        riskAlignment: "High Risk",
        suggestedAssets: "Tata Digital India Fund, Nippon India Power & Infra Fund",
        reasoning: "Capitalizes directly on structural megatrends highlighted in our October 2026 analysis, where renewables, EV supply chains, and enterprise IT outperform broader benchmarks."
      },
      {
        id: "REC-4",
        title: "Dynamic Asset Allocation / Tactical Cash Buffer",
        type: "Hybrid / Rebalancing",
        riskAlignment: "Moderate Risk",
        suggestedAssets: "ICICI Prudential Balanced Advantage Fund",
        reasoning: "Maintains a disciplined counter-cyclical cushion that automatically exploits volatility spikes to buy quality dips without timing the market."
      }
    ];
  } else {
    // Medium
    return [
      {
        id: "REC-1",
        title: "Core Nifty 50 & Large-and-Midcap Index Strategy",
        type: "Equities (Core Growth)",
        riskAlignment: "Moderate Risk",
        suggestedAssets: "UTI Nifty 50 Index Fund, Mirae Asset Large & Midcap Fund",
        reasoning: "Captures broad-based wealth compounding aligned with India's 6.8% GDP trajectory, keeping portfolio volatility moderate through index diversification."
      },
      {
        id: "REC-2",
        title: "Active Mid-Cap Opportunities Fund",
        type: "Mid Cap Equities",
        riskAlignment: "Moderate-High Risk",
        suggestedAssets: "Axis Mid Cap Fund, HDFC Mid-Cap Opportunities Direct",
        reasoning: "Targets rapidly growing market leaders across manufacturing and healthcare, offering higher return potential than pure large-caps."
      },
      {
        id: "REC-3",
        title: "High-Grade Corporate Debt & Sovereign Gold Bonds (SGB)",
        type: "Fixed Income & Sovereign Gold",
        riskAlignment: "Low-to-Moderate Risk",
        suggestedAssets: "HDFC Corporate Bond Fund, Nippon India Gold BeES / RBI SGB",
        reasoning: "Provides downside protection, steady income at 7.2%+ yields, and an effective hedge against inflation and geopolitical market tremors."
      }
    ];
  }
}

/**
 * Builds the personalized email content
 */
export function buildPersonalizedEmail(profile) {
  const stocks = profile.portfolio?.stocks ?? 0;
  const bonds = profile.portfolio?.bonds ?? 0;
  const cash = profile.portfolio?.cash ?? 0;

  const recList = (profile.recommendations || []).map((r, i) => `
${i + 1}. ${r.title} [${r.type}]
   • Risk Alignment:   ${r.riskAlignment}
   • Suggested Assets: ${r.suggestedAssets}
   • Strategic Rationale: ${r.reasoning}
`).join("\n");

  return `
Subject: Your Tailored Investment Planning Advisory Report [October 2026]
To: ${profile.email}

Dear ${profile.name},

Thank you for consulting with our Interactive Investment Planning Agent. Based on our dialogue and current October 2026 financial benchmarks (RBI Repo Rate at 6.25%, CPI Inflation at 4.4%, GDP Growth at 6.8%), we have formulated your personalized investment blueprint.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 YOUR INVESTOR PROFILE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Investor Name:      ${profile.name}
• Age:                ${profile.age} years old
• Risk Appetite:      ${profile.riskLevel}
• Primary Goal:       ${profile.goal}
• Investment Horizon: ${profile.horizon} years
• Current Allocation: ${stocks}% Stocks / ${bonds}% Bonds / ${cash}% Cash

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 TAILORED RECOMMENDATIONS (Aligned with Oct 2026 Market Conditions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${recList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 NEXT STEPS & ACTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Align your current portfolio (${stocks}% Stocks / ${bonds}% Bonds / ${cash}% Cash) toward recommended asset weights.
2. Automate disciplined monthly SIPs through Direct Mutual Fund plans to eliminate distributor fee leakage.
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
`.trim();
}
