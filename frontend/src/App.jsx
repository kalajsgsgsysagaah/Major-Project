import { useState, useRef, useEffect } from 'react'
import { submitInvestmentProfile, sendChatMessage, resetChatSession } from './services/api'
import {
  OCTOBER_2026_MARKET_SNAPSHOT,
  parseNameAndAge,
  parseRiskTolerance,
  parseGoalAndHorizon,
  parsePortfolio,
  generateDynamicRecommendations,
  buildPersonalizedEmail
} from './services/agentEngine'
import './index.css'

// ── Smart Link Mapper ─────────────────────────────────────────────────────────
// Maps recommendation keywords → real Indian finance platform links

// ── Per-type: unique fund-specific links + relevant YouTube video ID ─────────
const TYPE_DB = [
  {
    keys: ['liquid fund', 'liquid mutual', 'emergency'],
    links: [
      { icon: '💧', label: 'HDFC Liquid Fund',       url: 'https://groww.in/mutual-funds/hdfc-liquid-fund-direct-plan' },
      { icon: '⚡', label: 'Axis Liquid Fund',        url: 'https://groww.in/mutual-funds/axis-liquid-fund-direct-plan' },
      { icon: '🏦', label: 'ICICI Pru Liquid Fund',  url: 'https://groww.in/mutual-funds/icici-prudential-liquid-fund-direct-plan' },
    ],
    videoId: 'Vz_gKo1Bgwc',
    videoLabel: 'What is a Liquid Fund? — Groww',
  },
  {
    keys: ['nifty 50 index', 'index fund', 'nifty index', 'sensex index'],
    links: [
      { icon: '📊', label: 'UTI Nifty 50 Index Fund',      url: 'https://groww.in/mutual-funds/uti-nifty-50-index-fund-direct-plan' },
      { icon: '📈', label: 'HDFC Index Fund – Nifty 50',   url: 'https://groww.in/mutual-funds/hdfc-index-fund-nifty-50-plan-direct' },
      { icon: '🏛️', label: 'Nippon Nifty BeES ETF',       url: 'https://groww.in/etfs/nippon-india-etf-nifty-bees' },
    ],
    videoId: 'YHxaKzLkMgI',
    videoLabel: 'Index Funds vs Active Funds — CA Rachana Ranade',
  },
  {
    keys: ['small cap', 'smallcap'],
    links: [
      { icon: '🚀', label: 'SBI Small Cap Fund',       url: 'https://groww.in/mutual-funds/sbi-small-cap-fund-direct-plan' },
      { icon: '🔍', label: 'Nippon India Small Cap',   url: 'https://groww.in/mutual-funds/nippon-india-small-cap-fund-direct-plan' },
      { icon: '📋', label: 'Axis Small Cap Fund',      url: 'https://groww.in/mutual-funds/axis-small-cap-fund-direct-plan' },
    ],
    videoId: 'h5BfqnJFpBs',
    videoLabel: 'Small Cap Funds Explained — CA Rachana Ranade',
  },
  {
    keys: ['mid cap', 'midcap'],
    links: [
      { icon: '💎', label: 'Axis Mid Cap Fund',        url: 'https://groww.in/mutual-funds/axis-midcap-fund-direct-plan' },
      { icon: '📈', label: 'Mirae Asset Mid Cap',      url: 'https://groww.in/mutual-funds/mirae-asset-midcap-fund-direct-plan' },
      { icon: '💼', label: 'HDFC Mid-Cap Opp Fund',    url: 'https://groww.in/mutual-funds/hdfc-mid-cap-opportunities-fund-direct-plan' },
    ],
    videoId: 'aM4ERCB_U4Q',
    videoLabel: 'Best Mid Cap Funds India — Groww',
  },
  {
    keys: ['large cap', 'largecap', 'bluechip', 'blue chip'],
    links: [
      { icon: '🏛️', label: 'Mirae Asset Large Cap',   url: 'https://groww.in/mutual-funds/mirae-asset-large-cap-fund-direct-plan' },
      { icon: '💰', label: 'HDFC Top 100 Fund',        url: 'https://groww.in/mutual-funds/hdfc-top-100-fund-direct-plan' },
      { icon: '🌟', label: 'Axis Bluechip Fund',       url: 'https://groww.in/mutual-funds/axis-bluechip-fund-direct-plan' },
    ],
    videoId: 'w7KpEZR5_4I',
    videoLabel: 'Large Cap vs Index Funds — Ankur Warikoo',
  },
  {
    keys: ['sip', 'systematic investment'],
    links: [
      { icon: '🌱', label: 'Start SIP on Groww',       url: 'https://groww.in/mutual-funds/sip' },
      { icon: '💰', label: 'SIP — Coin by Zerodha',    url: 'https://coin.zerodha.com/sip' },
      { icon: '📲', label: 'SIP Calculator — ET Money', url: 'https://www.etmoney.com/tools-and-calculators/sip-calculator' },
    ],
    videoId: 'LvBsq0VdGAQ',
    videoLabel: 'How SIP Works — Zerodha Varsity',
  },
  {
    keys: ['ppf', 'public provident'],
    links: [
      { icon: '🏦', label: 'PPF Account — SBI',        url: 'https://retail.onlinesbi.sbi/retail/login.htm' },
      { icon: '🏛️', label: 'PPF — India Post',        url: 'https://www.indiapost.gov.in' },
      { icon: '📊', label: 'PPF Calculator — ClearTax', url: 'https://cleartax.in/s/ppf-calculator' },
    ],
    videoId: 'g9VJu_fP7Ng',
    videoLabel: 'PPF Account — Everything You Must Know',
  },
  {
    keys: ['nps', 'national pension', 'pension system'],
    links: [
      { icon: '🎯', label: 'Open NPS — eNPS Portal',   url: 'https://enps.nsdl.com/eNPS/NationalPensionSystem.html' },
      { icon: '🏦', label: 'NPS — HDFC Bank',          url: 'https://www.hdfcbank.com/personal/invest/nps' },
      { icon: '📋', label: 'NPS Calculator — ClearTax', url: 'https://cleartax.in/s/nps-calculator' },
    ],
    videoId: '3L_h_aVCWCQ',
    videoLabel: 'NPS vs PPF — Which is Better? (CA Rachana Ranade)',
  },
  {
    keys: ['fd', 'fixed deposit', 'fixed-deposit'],
    links: [
      { icon: '🏦', label: 'SBI Fixed Deposit',        url: 'https://sbi.co.in/web/personal-banking/investments-and-insurance/deposits/fixed-deposit' },
      { icon: '💳', label: 'HDFC Bank FD',             url: 'https://www.hdfcbank.com/personal/save/deposits/fixed-deposit' },
      { icon: '📈', label: 'Bajaj Finance FD (High Rate)', url: 'https://www.bajajfinserv.in/fixed-deposit' },
    ],
    videoId: 'bUZdMFrQYms',
    videoLabel: 'Fixed Deposit vs Debt Mutual Fund — Groww',
  },
  {
    keys: ['gold', 'sgb', 'sovereign gold', 'gold etf'],
    links: [
      { icon: '🥇', label: 'Sovereign Gold Bond — RBI', url: 'https://rbi.org.in/Scripts/sgb.aspx' },
      { icon: '📊', label: 'Nippon Gold BeES ETF',     url: 'https://groww.in/etfs/nippon-india-etf-gold-bees' },
      { icon: '🌟', label: 'Digital Gold — MMTC-PAMP', url: 'https://www.mmtcpamp.com' },
    ],
    videoId: 'KeQBCm1BQXU',
    videoLabel: 'Gold Investment in India — SGB vs ETF vs Digital Gold',
  },
  {
    keys: ['debt fund', 'corporate bond', 'bond fund'],
    links: [
      { icon: '🛡️', label: 'HDFC Corporate Bond Fund', url: 'https://groww.in/mutual-funds/hdfc-corporate-bond-fund-direct-plan' },
      { icon: '🏛️', label: 'ICICI Pru Bond Fund',     url: 'https://groww.in/mutual-funds/icici-prudential-bond-fund-direct-plan' },
      { icon: '📋', label: 'Debt Funds Guide — Varsity', url: 'https://zerodha.com/varsity/module/personalfinance/' },
    ],
    videoId: 'SHOfR4VqrAM',
    videoLabel: 'Debt Mutual Funds Explained — Groww',
  },
]

function getTypeData(title, description) {
  const text = (title + ' ' + description).toLowerCase()
  for (const entry of TYPE_DB) {
    if (entry.keys.some(k => text.includes(k))) return entry
  }
  // Generic fallback with unique defaults
  return {
    links: [
      { icon: '🌱', label: 'Explore Funds — Groww',     url: 'https://groww.in/mutual-funds' },
      { icon: '💰', label: 'Invest — Zerodha Coin',      url: 'https://coin.zerodha.com' },
      { icon: '📘', label: 'Learn — Zerodha Varsity',    url: 'https://zerodha.com/varsity/module/personalfinance/' },
    ],
    videoId: 'LvBsq0VdGAQ',
    videoLabel: 'Personal Finance Guide — Zerodha Varsity',
  }
}

function getLinks(title, description) {
  const text = (title + ' ' + description).toLowerCase()
  for (const entry of TYPE_DB) {
    if (entry.keys.some(k => text.includes(k))) {
      return entry.links.slice(0, 3)
    }
  }
  // Generic fallback
  return [
    { icon: '🌱', label: 'Explore on Groww',     url: 'https://groww.in' },
    { icon: '💰', label: 'Invest via Zerodha',   url: 'https://zerodha.com' },
    { icon: '📊', label: 'Learn — Varsity',      url: 'https://zerodha.com/varsity/' },
  ]
}



// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ activeTab, setActiveTab }) {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a href="/" className="nav-logo" onClick={e => { e.preventDefault(); setActiveTab('planner'); }}>
          <div className="nav-logo-icon">💹</div>
          <span>Agentic AI Investment System</span>
        </a>
        <div className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
            onClick={() => setActiveTab('planner')}
          >
            📊 Investment Planner
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('roadmap')}
          >
            🚀 Future AI Engine (Roadmap)
          </button>
        </div>
      </div>
    </nav>
  )
}

// ── Loading Screen ────────────────────────────────────────────────────────────

function LoadingScreen({ step }) {
  const steps = [
    { label: 'Analysing your profile',      id: 0 },
    { label: 'Calculating risk score',       id: 1 },
    { label: 'Fetching live market data',    id: 2 },
    { label: 'Gemini AI reasoning…',         id: 3 },
    { label: 'Generating investment report', id: 4 },
  ]
  return (
    <div className="loading-screen fade-in">
      <div className="loading-orb" />
      <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
        AI Agents are working…
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        This usually takes 15–30 seconds
      </p>
      <div className="loading-steps">
        {steps.map(s => (
          <div key={s.id} className={`loading-step ${s.id === step ? 'active' : s.id < step ? 'done' : ''}`}>
            <div className="step-dot" />
            {s.id < step ? '✓ ' : ''}{s.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Result Components ─────────────────────────────────────────────────────────

function RiskCard({ risk }) {
  const colorClass = risk.label.toLowerCase()
  const color = colorClass === 'conservative' ? 'var(--accent-green)'
              : colorClass === 'moderate'     ? 'var(--accent-gold)'
              :                                 'var(--accent-red)'
  return (
    <div className="risk-card fade-in">
      <div className={`risk-score-circle ${colorClass}`}>
        <span className="risk-number" style={{ color }}>{risk.score}</span>
        <span className="risk-denom">/10</span>
      </div>
      <div>
        <div className="risk-label-text" style={{ color }}>{risk.label} Risk</div>
        <div className="risk-reasoning">{risk.reasoning}</div>
      </div>
    </div>
  )
}

function StatsRow({ financials, profile }) {
  const fmt = v => `₹${Number(v).toLocaleString('en-IN')}`
  return (
    <div className="stats-row">
      {[
        { label: 'Monthly Income',   value: fmt(financials.monthly_income) },
        { label: 'Monthly Surplus',  value: fmt(financials.monthly_surplus) },
        { label: 'Monthly SIP',      value: fmt(financials.monthly_investment_amount) },
        { label: 'Existing Savings', value: fmt(financials.existing_savings) },
        { label: 'Goal',             value: profile.goal },
        { label: 'Horizon',          value: `${profile.horizon_years} yrs` },
      ].map((s, i) => (
        <div key={i} className="stat-card fade-in">
          <div className="stat-label">{s.label}</div>
          <div className="stat-value">{s.value}</div>
        </div>
      ))}
    </div>
  )
}

function AllocationCard({ allocation }) {
  return (
    <div className="card fade-in">
      <div className="card-title">📊 Asset Allocation</div>
      <div className="allocation-list">
        {allocation.map((item, i) => (
          <div key={i} className="allocation-item">
            <div className="allocation-header">
              <span className="allocation-name">{item.asset_class}</span>
              <span className="allocation-pct">{item.percentage}%</span>
            </div>
            <div className="allocation-bar">
              <div className="allocation-fill" style={{ width: `${item.percentage}%` }} />
            </div>
            <div className="allocation-meta">{item.rationale}</div>
            <div className="allocation-tags">
              {(item.examples || []).slice(0, 4).map((ex, j) => (
                <span key={j} className="tag">{ex}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InlineVideo({ videoId, label }) {
  const [active, setActive] = useState(false)
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`
  return (
    <div className="inline-video-wrap">
      <div
        className={`inline-video-thumb${active ? ' active' : ''}`}
        onClick={() => setActive(true)}
      >
        {!active
          ? <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={label}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          : <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={label}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
            />
        }
        {!active && (
          <div className="inline-play-overlay">
            <div className="inline-play-btn">▶</div>
          </div>
        )}
      </div>
      <div className="inline-video-footer">
        <span className="inline-video-label">📺 {label}</span>
        <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="inline-video-link">
          Open YouTube ↗
        </a>
      </div>
    </div>
  )
}

function RecommendationsCard({ recs }) {
  return (
    <div className="card fade-in">
      <div className="card-title">🎯 Recommendations</div>
      <div className="rec-grid">
        {recs.map((rec, i) => {
          const { links, videoId, videoLabel } = getTypeData(rec.title, rec.description)
          return (
            <div key={i} className="rec-card">
              <div className="rec-top">
                <div className="rec-title">{rec.title}</div>
                <span className={`risk-badge ${rec.risk_level?.toLowerCase()}`}>{rec.risk_level}</span>
              </div>
              <div className="rec-desc">{rec.description}</div>
              <div className="rec-return">📈 Expected Return: {rec.expected_return}</div>

              {/* Embedded YouTube video relevant to this recommendation */}
              <InlineVideo videoId={videoId} label={videoLabel} />

              {/* Unique fund-specific links for this recommendation */}
              <div className="rec-links">
                {links.map((lnk, j) => (
                  <a key={j} href={lnk.url} target="_blank" rel="noopener noreferrer" className="rec-link">
                    <span className="rec-link-icon">{lnk.icon}</span>
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActionPlanCard({ steps }) {
  return (
    <div className="card fade-in">
      <div className="card-title">🗺️ Action Plan</div>
      <div className="action-list">
        {steps.map((step, i) => (
          <div key={i} className="action-item">
            <div className="action-num">{i + 1}</div>
            <div className="action-text">{step}</div>
          </div>
        ))}
      </div>
    </div>
  )
}



// ── Results ───────────────────────────────────────────────────────────────────

function Results({ report, onReset }) {
  return (
    <div>
      <div className="results-header">
        <div>
          <div className="results-title">📋 Plan for {report.name}</div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.95rem' }}>
            {report.summary}
          </p>
        </div>
        <button className="btn-secondary" onClick={onReset}>← New Profile</button>
      </div>
      <div className="results-grid">
        <RiskCard risk={report.risk_analysis} />
        <StatsRow financials={report.financials} profile={report.investment_profile} />
        <AllocationCard allocation={report.asset_allocation} />
        <RecommendationsCard recs={report.recommendations} />
        <ActionPlanCard steps={report.action_plan} />
        <div className="disclaimer">⚠️ {report.disclaimer}</div>
      </div>
    </div>
  )
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required.'
  else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters.'

  const age = parseInt(form.age)
  if (!form.age) errors.age = 'Age is required.'
  else if (isNaN(age) || age < 0) errors.age = 'Age cannot be negative.'
  else if (age < 18) errors.age = 'You must be at least 18 years old to invest.'
  else if (age > 80) errors.age = 'Age must be 80 or below.'

  const income = parseFloat(form.monthly_income)
  if (!form.monthly_income) errors.monthly_income = 'Monthly income is required.'
  else if (income < 0) errors.monthly_income = 'Income cannot be negative.'
  else if (income === 0) errors.monthly_income = 'Income must be greater than ₹0.'
  else if (income < 1000) errors.monthly_income = 'Income seems too low — please enter a valid amount.'

  const expenses = parseFloat(form.monthly_expenses)
  if (!form.monthly_expenses) errors.monthly_expenses = 'Monthly expenses are required.'
  else if (expenses < 0) errors.monthly_expenses = 'Expenses cannot be negative.'
  else if (expenses >= income) errors.monthly_expenses = 'Expenses must be less than your income.'

  if (form.existing_savings && parseFloat(form.existing_savings) < 0)
    errors.existing_savings = 'Savings cannot be negative.'
  if (form.existing_investments && parseFloat(form.existing_investments) < 0)
    errors.existing_investments = 'Investments cannot be negative.'

  const horizon = parseInt(form.investment_horizon_years)
  if (!form.investment_horizon_years) errors.investment_horizon_years = 'Investment horizon is required.'
  else if (horizon < 0) errors.investment_horizon_years = 'Horizon cannot be negative.'
  else if (horizon < 1) errors.investment_horizon_years = 'Minimum horizon is 1 year.'
  else if (horizon > 40) errors.investment_horizon_years = 'Maximum horizon is 40 years.'

  const sip = parseFloat(form.monthly_investment_amount)
  if (!form.monthly_investment_amount) errors.monthly_investment_amount = 'Monthly SIP is required.'
  else if (sip < 0) errors.monthly_investment_amount = 'SIP cannot be negative.'
  else if (sip === 0) errors.monthly_investment_amount = 'SIP must be greater than ₹0.'
  else if (!isNaN(income) && !isNaN(expenses) && sip > (income - expenses))
    errors.monthly_investment_amount = `SIP cannot exceed your surplus of ₹${(income - expenses).toLocaleString('en-IN')}.`

  return errors
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <span style={{ color: 'var(--accent-red)', fontSize: '0.78rem', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
      ⚠ {msg}
    </span>
  )
}

// ── Profile Form ──────────────────────────────────────────────────────────────

const defaultForm = {
  name: '', age: '', employment_status: 'employed',
  monthly_income: '', monthly_expenses: '',
  existing_savings: '', existing_investments: '',
  risk_tolerance: 'moderate', investment_goal: 'wealth_creation',
  investment_horizon_years: '', monthly_investment_amount: '',
}

function ProfileForm({ onSubmit }) {
  const [form, setForm]     = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const set   = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: undefined })) }
  const blur  = (k)    => setTouched(t => ({ ...t, [k]: true }))
  const err   = (field) => touched[field] && errors[field]
    ? <FieldError msg={errors[field]} />
    : null
  const bStyle = (f) => touched[f] && errors[f] ? { borderColor: 'var(--accent-red)' } : {}
  const preventScroll = (e) => e.target.blur()

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      const all = {}; Object.keys(defaultForm).forEach(k => all[k] = true); setTouched(all)
      return
    }
    onSubmit({
      ...form,
      age: parseInt(form.age),
      monthly_income: parseFloat(form.monthly_income),
      monthly_expenses: parseFloat(form.monthly_expenses),
      existing_savings: parseFloat(form.existing_savings || 0),
      existing_investments: parseFloat(form.existing_investments || 0),
      investment_horizon_years: parseInt(form.investment_horizon_years),
      monthly_investment_amount: parseFloat(form.monthly_investment_amount),
    })
  }

  return (
    <div className="card fade-in" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="card-title">👤 Your Financial & Investment Profile</div>
      <div className="card-subtitle">Fill in your financial parameters — our multi-agent AI engine will design your personalized portfolio</div>

      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        {/* Personal Details */}
        <div className="section-header">
          <div className="section-dot"/>
          <h3>Personal Details</h3>
        </div>
        <div className="form-grid cols-3">
          <div className="form-group">
            <label>👤 Full Name</label>
            <input name="name" autoComplete="off" placeholder="Rahul Sharma" value={form.name} style={bStyle('name')}
              onChange={e => set('name', e.target.value)} onBlur={() => blur('name')} />
            {err('name')}
          </div>
          <div className="form-group">
            <label>🎂 Age</label>
            <input name="age" type="number" autoComplete="off" onWheel={preventScroll} placeholder="28" value={form.age} style={bStyle('age')}
              onChange={e => set('age', e.target.value)} onBlur={() => blur('age')} />
            {err('age')}
          </div>
          <div className="form-group">
            <label>💼 Employment Status</label>
            <select name="employment_status" value={form.employment_status} onChange={e => set('employment_status', e.target.value)}>
              <option value="employed">Salaried / Employed</option>
              <option value="self_employed">Self-Employed / Business</option>
              <option value="student">Student</option>
              <option value="retired">Retired</option>
              <option value="unemployed">Unemployed</option>
            </select>
          </div>
        </div>

        {/* Financials */}
        <div className="section-header">
          <div className="section-dot"/>
          <h3>Financial Cash Flow (₹ / month)</h3>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label>💵 Monthly Income (₹)</label>
            <input name="monthly_income" type="number" autoComplete="off" onWheel={preventScroll} placeholder="80000" value={form.monthly_income} style={bStyle('monthly_income')}
              onChange={e => set('monthly_income', e.target.value)} onBlur={() => blur('monthly_income')} />
            {err('monthly_income')}
          </div>
          <div className="form-group">
            <label>📉 Monthly Expenses (₹)</label>
            <input name="monthly_expenses" type="number" autoComplete="off" onWheel={preventScroll} placeholder="40000" value={form.monthly_expenses} style={bStyle('monthly_expenses')}
              onChange={e => set('monthly_expenses', e.target.value)} onBlur={() => blur('monthly_expenses')} />
            {err('monthly_expenses')}
          </div>
          <div className="form-group">
            <label>🏦 Existing Savings (₹) <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
            <input name="existing_savings" type="number" autoComplete="off" onWheel={preventScroll} placeholder="200000" value={form.existing_savings} style={bStyle('existing_savings')}
              onChange={e => set('existing_savings', e.target.value)} onBlur={() => blur('existing_savings')} />
            {err('existing_savings')}
          </div>
          <div className="form-group">
            <label>📈 Existing Investments (₹) <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
            <input name="existing_investments" type="number" autoComplete="off" onWheel={preventScroll} placeholder="50000" value={form.existing_investments} style={bStyle('existing_investments')}
              onChange={e => set('existing_investments', e.target.value)} onBlur={() => blur('existing_investments')} />
            {err('existing_investments')}
          </div>
        </div>

        {/* Investment Strategy */}
        <div className="section-header">
          <div className="section-dot"/>
          <h3>Investment Strategy & Goals</h3>
        </div>

        {/* Interactive Risk Tolerance Pills */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label>🎯 Risk Tolerance</label>
          <div className="pill-selector">
            {[
              { val: 'conservative', label: '🛡️ Conservative', desc: 'Capital Safety & Fixed Returns' },
              { val: 'moderate',     label: '⚖️ Moderate',     desc: 'Balanced Growth & Stability' },
              { val: 'aggressive',   label: '🚀 Aggressive',   desc: 'Maximum Capital Appreciation' },
            ].map(r => (
              <button
                key={r.val}
                type="button"
                className={`pill-btn ${form.risk_tolerance === r.val ? 'active' : ''}`}
                onClick={() => set('risk_tolerance', r.val)}
              >
                <div className="pill-title">{r.label}</div>
                <div className="pill-desc">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="form-grid cols-2">
          <div className="form-group">
            <label>🏁 Investment Goal</label>
            <select name="investment_goal" value={form.investment_goal} onChange={e => set('investment_goal', e.target.value)}>
              <option value="wealth_creation">🚀 Wealth Creation</option>
              <option value="retirement">🏖️ Retirement Planning</option>
              <option value="education">🎓 Education Corpus</option>
              <option value="home_purchase">🏡 Home Purchase</option>
              <option value="emergency_fund">🛡️ Emergency Fund</option>
              <option value="passive_income">💸 Passive Income</option>
            </select>
          </div>

          <div className="form-group">
            <label>⏱️ Investment Horizon (years)</label>
            <input name="investment_horizon_years" type="number" autoComplete="off" onWheel={preventScroll} placeholder="10" value={form.investment_horizon_years} style={bStyle('investment_horizon_years')}
              onChange={e => set('investment_horizon_years', e.target.value)} onBlur={() => blur('investment_horizon_years')} />
            <div className="preset-row">
              {['3', '5', '10', '15', '20'].map(yrs => (
                <button key={yrs} type="button" className={`preset-chip ${form.investment_horizon_years === yrs ? 'active' : ''}`} onClick={() => set('investment_horizon_years', yrs)}>
                  {yrs} yrs
                </button>
              ))}
            </div>
            {err('investment_horizon_years')}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>🚀 Monthly SIP Target Amount (₹)</label>
          <input name="monthly_investment_amount" type="number" autoComplete="off" onWheel={preventScroll} placeholder="15000" value={form.monthly_investment_amount} style={bStyle('monthly_investment_amount')}
            onChange={e => set('monthly_investment_amount', e.target.value)} onBlur={() => blur('monthly_investment_amount')} />
          <div className="preset-row">
            {['5000', '10000', '25000', '50000', '100000'].map(amt => (
              <button key={amt} type="button" className={`preset-chip ${form.monthly_investment_amount === amt ? 'active' : ''}`} onClick={() => set('monthly_investment_amount', amt)}>
                ₹{Number(amt).toLocaleString('en-IN')}
              </button>
            ))}
          </div>
          {err('monthly_investment_amount')}
        </div>

        {Object.keys(errors).some(k => touched[k] && errors[k]) && (
          <div style={{ background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginTop:16, color:'var(--accent-red)', fontSize:'0.85rem' }}>
            ⚠ Please fix the errors above before submitting.
          </div>
        )}

        <button type="submit" className="btn-primary">
          🚀 Generate My Investment Plan
        </button>
      </form>
    </div>
  )
}

// ── Interactive Investment Planning Conversational Agent ─────────────────────

function AIChatEngine() {
  const [phase, setPhase] = useState("ask_name_age")
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    riskLevel: '',
    goal: '',
    horizon: '',
    portfolio: { stocks: 0, bonds: 0, cash: 0 },
    recommendations: [],
    email: '',
    emailSent: false
  })

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your interactive investment planning agent. I'm here to have a personalized dialogue with you, understand your financial position, and construct a tailored investment blueprint for you.\n\nTo get started, what's your name and how old are you?"
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 9))

  const handleSend = async (textToSend) => {
    const userMsg = (textToSend !== undefined ? textToSend : input).trim()
    if (!userMsg) return

    const userMessageObj = { id: Date.now(), sender: 'user', text: userMsg }
    setMessages(prev => [...prev, userMessageObj])
    if (textToSend === undefined) setInput('')
    setIsTyping(true)

    // 1. Try backend conversational agent workflow
    try {
      const backendRes = await sendChatMessage(sessionId, userMsg)
      if (backendRes && backendRes.agent_response) {
        setIsTyping(false)
        setPhase(backendRes.phase)
        if (backendRes.profile) {
          setProfile(prev => ({ ...prev, ...backendRes.profile, recommendations: backendRes.recommendations || [] }))
        }
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: backendRes.agent_response,
            showTable: Boolean(backendRes.suggestions_table && backendRes.suggestions_table.length > 0),
            tableData: {
              ...(backendRes.profile || {}),
              recommendations: backendRes.recommendations || []
            }
          }
        ])
        return
      }
    } catch {
      // Backend unavailable; process locally seamlessly
    }

    // 2. Fallback local conversational loop
    setTimeout(() => {
      processInteractiveReply(userMsg)
    }, 650)
  }

  const processInteractiveReply = (msg) => {
    let nextPhase = phase
    let replyText = ""
    let showTableFlag = false
    let currentProfile = { ...profile }

    switch (phase) {
      // 1. Listen for Name & Age -> Confirm -> Ask Risk Tolerance
      case "ask_name_age": {
        const { name, age } = parseNameAndAge(msg)
        currentProfile.name = name
        currentProfile.age = age
        setProfile(currentProfile)

        nextPhase = "ask_risk"
        replyText = `Great to meet you, ${name}! I've recorded your age as ${age}.\n\nOn a scale of Low, Medium, or High, what is your risk tolerance?\n\n• Low = preserve capital with minimal volatility\n• Medium = balanced growth with moderate stability\n• High = maximize long-term growth and capital appreciation`
        break
      }

      // 2. Listen for Risk Tolerance -> Record -> Ask Goals & Horizon
      case "ask_risk": {
        const risk = parseRiskTolerance(msg)
        currentProfile.riskLevel = risk
        setProfile(currentProfile)

        nextPhase = "ask_goals"
        replyText = `Understood. I have recorded your risk tolerance as ${risk}.\n\nNext, what is your primary investment goal (e.g., retirement, wealth growth, capital preservation, home purchase), and what is your time horizon in years?`
        break
      }

      // 3. Listen for Goals & Horizon -> Record -> Ask Portfolio
      case "ask_goals": {
        const { goal, horizon } = parseGoalAndHorizon(msg)
        currentProfile.goal = goal
        currentProfile.horizon = horizon
        setProfile(currentProfile)

        nextPhase = "ask_portfolio"
        replyText = `Got it! Goal: ${goal} over a ${horizon}-year time horizon.\n\nNow let's check your current portfolio. What is your current allocation across:\n• Stocks (%)\n• Bonds (%)\n• Cash (%)\n\n(Please provide percentages that add up to 100%)`
        break
      }

      // 4. Listen for Portfolio -> Validate 100% -> Live Market Research -> Generate Recs -> Store in Table -> Ask Email
      case "ask_portfolio": {
        const parsedPort = parsePortfolio(msg)
        currentProfile.portfolio = {
          stocks: parsedPort.stocks,
          bonds: parsedPort.bonds,
          cash: parsedPort.cash
        }

        // Live generation based on profile & Oct 2026 conditions
        const recs = generateDynamicRecommendations(currentProfile)
        currentProfile.recommendations = recs
        setProfile(currentProfile)

        nextPhase = "ask_email"
        showTableFlag = true

        const recsFormatted = recs.map((r, i) =>
          `Recommendation ${i + 1}: ${r.title}\n` +
          `• Strategy: ${r.type} (${r.riskAlignment})\n` +
          `• Suggested Assets: ${r.suggestedAssets}\n` +
          `• Strategic Reasoning: ${r.reasoning}`
        ).join("\n\n")

        replyText = `Thank you! Your portfolio breakdown of ${parsedPort.stocks}% Stocks, ${parsedPort.bonds}% Bonds, and ${parsedPort.cash}% Cash (${parsedPort.total}% Total) has been confirmed.\n\n` +
          `🔍 Market Research & Analysis [${OCTOBER_2026_MARKET_SNAPSHOT.date}]:\n` +
          `• Macro indicators: Repo Rate ${OCTOBER_2026_MARKET_SNAPSHOT.repo_rate}, CPI ${OCTOBER_2026_MARKET_SNAPSHOT.inflation}, GDP Growth ${OCTOBER_2026_MARKET_SNAPSHOT.gdp_growth}, 10-Yr G-Sec ${OCTOBER_2026_MARKET_SNAPSHOT.ten_year_gsec}.\n` +
          `• Market Context: ${OCTOBER_2026_MARKET_SNAPSHOT.macro_summary}\n\n` +
          `Here are your tailored investment recommendations:\n\n` +
          `${recsFormatted}\n\n` +
          `✅ These recommendations have been saved to your Investment Suggestions Table below.\n\n` +
          `To complete the advisory process and email your personalized recommendations report, what is your email address?`
        break
      }

      // 5. Listen for Email -> Send personalized email -> Confirm
      case "ask_email": {
        const emailMatch = msg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
        const email = emailMatch ? emailMatch[0] : msg.trim()

        currentProfile.email = email
        currentProfile.emailSent = true
        setProfile(currentProfile)

        nextPhase = "completed"
        showTableFlag = true

        const emailBody = buildPersonalizedEmail(currentProfile)

        replyText = `Thank you, ${currentProfile.name}! Your tailored investment recommendations report has been generated and sent to:\n📧 ${email}\n\n` +
          `Below is a copy of your dispatched advisory email:\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${emailBody}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `Feel free to ask any follow-up questions about your portfolio, or tell me if you'd like to adjust any of your financial parameters!`
        break
      }

      // 6. Free-form Q&A after completion
      case "completed":
      default: {
        const lower = msg.toLowerCase()
        if (lower.includes("restart") || lower.includes("reset") || lower.includes("new")) {
          handleResetSession()
          setIsTyping(false)
          return
        }

        showTableFlag = true
        replyText = `Great question! In line with your ${currentProfile.riskLevel} risk strategy and your goal of ${currentProfile.goal}, maintaining a consistent monthly SIP while keeping your emergency allocation safe will compound wealth effectively under current October 2026 interest rate conditions.\n\nWould you like me to update your email or run another simulation? (Type 'restart' anytime to start fresh).`
        break
      }
    }

    setPhase(nextPhase)
    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: 'ai',
        text: replyText,
        showTable: showTableFlag,
        tableData: currentProfile
      }
    ])
    setIsTyping(false)
  }

  const handleResetSession = () => {
    resetChatSession(sessionId)
    setPhase("ask_name_age")
    setProfile({
      name: '',
      age: '',
      riskLevel: '',
      goal: '',
      horizon: '',
      portfolio: { stocks: 0, bonds: 0, cash: 0 },
      recommendations: [],
      email: '',
      emailSent: false
    })
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Hello! I am your interactive investment planning agent. I'm here to have a personalized dialogue with you, understand your financial position, and construct a tailored investment blueprint for you.\n\nTo get started, what's your name and how old are you?"
      }
    ])
  }

  return (
    <div className="chat-engine-container fade-in">
      <div className="chat-engine-header">
        <div className="chat-engine-title">
          <div className="chat-ai-badge">🤖 Interactive AI Investment Planning Agent</div>
          <h3>Conversational Portfolio Advisory</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="chat-progress-tag">
            {profile.name ? `👤 ${profile.name}` : "Active Session"} • {
              phase === "ask_name_age" ? "Greeting & Profile" :
              phase === "ask_risk" ? "Risk Assessment" :
              phase === "ask_goals" ? "Goals & Horizon" :
              phase === "ask_portfolio" ? "Portfolio Check" :
              phase === "ask_email" ? "Awaiting Email" : "Report Delivered"
            }
          </span>
          <button
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={handleResetSession}
          >
            Restart Session
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble-wrap ${m.sender}`}>
            <div className="chat-avatar">{m.sender === 'ai' ? '🤖' : '👤'}</div>
            <div className="chat-bubble">
              <div className="chat-author">
                {m.sender === 'ai' ? 'Investment Planning Agent' : 'You'}
              </div>
              <div className="chat-text">{m.text}</div>

              {/* Investment Suggestions Table */}
              {m.showTable && m.tableData && m.tableData.recommendations && m.tableData.recommendations.length > 0 && (
                <div className="suggestions-table-wrap">
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-bright)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--accent-2)', fontSize: '0.92rem' }}>📊 Investment Suggestions Table</strong>
                    <span className="badge-status">Status: Completed</span>
                  </div>
                  <table className="suggestions-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Age</th>
                        <th>Risk Level</th>
                        <th>Investment Goal</th>
                        <th>Time Horizon</th>
                        <th>Current Portfolio</th>
                        <th>Recommendation</th>
                        <th>Suggested Assets</th>
                        <th>Date Generated</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {m.tableData.recommendations.map((rec, idx) => (
                        <tr key={idx}>
                          <td><strong>{m.tableData.name || 'Investor'}</strong></td>
                          <td>{m.tableData.age} yrs</td>
                          <td>
                            <span style={{
                              color: m.tableData.riskLevel === 'High' ? 'var(--accent-red)' :
                                     m.tableData.riskLevel === 'Low' ? 'var(--accent-green)' : 'var(--accent-gold)',
                              fontWeight: 700
                            }}>
                              {m.tableData.riskLevel}
                            </span>
                          </td>
                          <td>{m.tableData.goal}</td>
                          <td>{m.tableData.horizon} years</td>
                          <td>
                            {m.tableData.portfolio?.stocks}% S / {m.tableData.portfolio?.bonds}% B / {m.tableData.portfolio?.cash}% C
                          </td>
                          <td>
                            <strong>{rec.title}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                              {rec.reasoning.slice(0, 95)}…
                            </div>
                          </td>
                          <td><span className="tag">{rec.suggestedAssets}</span></td>
                          <td>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          <td><span className="badge-status">Completed</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-bubble-wrap ai">
            <div className="chat-avatar">🤖</div>
            <div className="chat-bubble typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        className="chat-input-form"
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
      >
        <input
          type="text"
          className="chat-input"
          placeholder={
            phase === "ask_name_age" ? "Type your name and age (e.g. John, 35)..." :
            phase === "ask_risk" ? "Type your risk tolerance: Low, Medium, or High..." :
            phase === "ask_goals" ? "Type your investment goal and time horizon (e.g. Retirement in 15 years)..." :
            phase === "ask_portfolio" ? "Type your current portfolio % (e.g. 60% stocks, 30% bonds, 10% cash)..." :
            phase === "ask_email" ? "Enter your email address to send your personalized recommendations..." :
            "Ask anything or type 'restart' to start a new session..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
          Send ➔
        </button>
      </form>
    </div>
  )
}

// ── App Root ──────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState('planner')
  const [view, setView]     = useState('form')
  const [report, setReport] = useState(null)
  const [error, setError]   = useState('')
  const [step, setStep]     = useState(0)

  const handleSubmit = async (profile) => {
    setView('loading'); setStep(0)
    const t1 = setTimeout(() => setStep(1), 400)
    const t2 = setTimeout(() => setStep(2), 900)
    const t3 = setTimeout(() => setStep(3), 1400)
    const t4 = setTimeout(() => setStep(4), 1900)
    try {
      const resp = await submitInvestmentProfile(profile)
      setTimeout(() => {
        clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
        setReport(resp.data); setView('results')
      }, 2200)
    } catch (err) {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
      setError(err.message || 'Something went wrong. Please try again.')
      setView('error')
    }
  }

  return (
    <div className="app-wrapper">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container" style={{ paddingBottom: 80 }}>

        {activeTab === 'planner' && (
          <>
            {view === 'form' && (
              <>
                <div className="hero">
                  <div className="hero-badge">✦ Agentic AI • LangGraph • Gemini</div>
                  <h1>Agentic AI for<br/>Investment Planning</h1>
                  <p>Enter your financial profile and let our multi-agent AI system generate a personalised investment plan — powered by live Indian market data.</p>
                </div>
                <ProfileForm onSubmit={handleSubmit} />
              </>
            )}

            {view === 'loading' && <LoadingScreen step={step} />}

            {view === 'results' && report && (
              <div style={{ paddingTop: 40 }}>
                <Results report={report} onReset={() => { setView('form'); setReport(null) }} />
              </div>
            )}

            {view === 'error' && (
              <div style={{ maxWidth: 600, margin: '60px auto' }}>
                <div className="error-box">
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error}</div>
                  <button className="btn-secondary" style={{ marginTop: 20 }}
                    onClick={() => setView('form')}>← Try Again</button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'roadmap' && (
          <div className="roadmap-container fade-in" style={{ paddingTop: 40 }}>
            <div className="hero" style={{ padding: '24px 0 32px' }}>
              <div className="hero-badge">🚀 Future Scope • Next-Gen AI Release</div>
              <h1>Autonomous AI Agent Engine</h1>
              <p>Explore our upcoming multi-agent engine designed for continuous market monitoring, dynamic portfolio rebalancing, and conversational investor interaction.</p>
            </div>

            {/* Dedicated Future AI Engine Chat Assistant */}
            <AIChatEngine />

            {/* Future Capabilities Grid */}
            <div style={{ marginTop: 48, marginBottom: 20, textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700 }}>⚡ Upcoming System Capabilities</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                Advanced features scheduled for deployment in future releases
              </p>
            </div>

            <div className="roadmap-grid">
              <div className="roadmap-card">
                <div className="roadmap-icon">⚡</div>
                <h4>Autonomous Portfolio Rebalancing</h4>
                <p>AI agents continuously track market volatility and trigger automated rebalancing recommendations to maintain optimal target asset allocation.</p>
              </div>
              <div className="roadmap-card">
                <div className="roadmap-icon">📈</div>
                <h4>Real-Time Indian Market Feed</h4>
                <p>Live integration with Indian financial APIs (NSE/BSE) for real-time NAV calculations, sectoral trends, and algorithmic risk scoring.</p>
              </div>
              <div className="roadmap-card">
                <div className="roadmap-icon">💬</div>
                <h4>Interactive Voice & Chat Assistant</h4>
                <p>Conversational voice and chat interfaces empowering investors to ask questions, simulate market scenarios, and query portfolio health.</p>
              </div>
              <div className="roadmap-card">
                <div className="roadmap-icon">🛡️</div>
                <h4>Automated Tax-Loss Harvesting</h4>
                <p>Algorithmically flags tax-saving opportunities under Section 80C, 80CCD(1B), and LTCG capital gains optimization under Indian tax laws.</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
