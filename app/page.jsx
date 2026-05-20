'use client'
import { useState, useRef, useEffect } from 'react'

// ── Finance tool logic (runs client-side) ──────────────────────────────────
const STOCK_DATA = {
  AAPL: { name: 'Apple Inc.', price: 213.32, change: 1.24, pct: 0.59, mktCap: '3.27T', pe: 35.2, sector: 'Technology' },
  MSFT: { name: 'Microsoft Corp.', price: 425.18, change: -2.11, pct: -0.49, mktCap: '3.16T', pe: 36.8, sector: 'Technology' },
  GOOGL: { name: 'Alphabet Inc.', price: 178.44, change: 0.87, pct: 0.49, mktCap: '2.19T', pe: 24.1, sector: 'Technology' },
  AMZN: { name: 'Amazon.com Inc.', price: 202.75, change: 3.45, pct: 1.73, mktCap: '2.16T', pe: 43.6, sector: 'Consumer' },
  TSLA: { name: 'Tesla Inc.', price: 178.21, change: -5.32, pct: -2.90, mktCap: '570B', pe: 55.1, sector: 'Auto' },
  NVDA: { name: 'NVIDIA Corp.', price: 131.38, change: 4.67, pct: 3.69, mktCap: '3.22T', pe: 50.3, sector: 'Technology' },
  META: { name: 'Meta Platforms', price: 584.91, change: 2.18, pct: 0.37, mktCap: '1.48T', pe: 28.4, sector: 'Technology' },
  JPM: { name: 'JPMorgan Chase', price: 266.43, change: -0.54, pct: -0.20, mktCap: '760B', pe: 13.2, sector: 'Finance' },
  BRK: { name: 'Berkshire Hathaway', price: 529.10, change: 1.02, pct: 0.19, mktCap: '1.16T', pe: 22.3, sector: 'Finance' },
  V: { name: 'Visa Inc.', price: 351.22, change: 0.78, pct: 0.22, mktCap: '716B', pe: 31.5, sector: 'Finance' },
}

const FX = { USD:1, EUR:0.921, GBP:0.787, JPY:149.52, CAD:1.361, AUD:1.524, CHF:0.896, INR:83.42, CNY:7.241, BRL:4.972 }

function executeTool(name, args) {
  if (name === 'get_stock_price') {
    const t = args.ticker.toUpperCase()
    const s = STOCK_DATA[t]
    if (!s) return { error: `Ticker ${t} not found. Try: ${Object.keys(STOCK_DATA).join(', ')}` }
    return { ticker: t, ...s }
  }
  if (name === 'convert_currency') {
    const { amount, from, to } = args
    const f = from.toUpperCase(), t = to.toUpperCase()
    if (!FX[f] || !FX[t]) return { error: 'Unsupported currency' }
    const result = (amount / FX[f]) * FX[t]
    return { from: f, to: t, amount, result: +result.toFixed(2), rate: +(FX[t]/FX[f]).toFixed(4) }
  }
  if (name === 'calculate_compound_interest') {
    const { principal = 0, monthly_contribution = 0, annual_rate, years } = args
    const r = annual_rate / 100 / 12, n = years * 12
    let fv = principal * Math.pow(1 + r, n)
    if (monthly_contribution > 0) fv += monthly_contribution * ((Math.pow(1 + r, n) - 1) / r)
    const total = principal + monthly_contribution * n
    return {
      future_value: +fv.toFixed(2),
      total_contributed: +total.toFixed(2),
      interest_earned: +(fv - total).toFixed(2),
      return_pct: +((fv / total - 1) * 100).toFixed(1)
    }
  }
  if (name === 'analyze_portfolio') {
    const details = args.holdings.map(h => {
      const t = h.ticker.toUpperCase()
      const s = STOCK_DATA[t]
      return s ? { ticker: t, weight: h.weight, name: s.name, price: s.price, sector: s.sector, pct: s.pct } : { ticker: t, weight: h.weight, error: 'Not found' }
    })
    const avgPct = details.filter(d => d.pct != null).reduce((s, d) => s + d.pct * d.weight / 100, 0)
    const sectors = {}
    details.forEach(d => { if (d.sector) sectors[d.sector] = (sectors[d.sector] || 0) + d.weight })
    return { holdings: details, sectors, weighted_change_pct: +avgPct.toFixed(2) }
  }
  if (name === 'analyze_budget') {
    const { monthly_income, monthly_expenses, savings_goal_pct = 20 } = args
    const savings = monthly_income - monthly_expenses
    const savings_rate = (savings / monthly_income) * 100
    const goal = monthly_income * savings_goal_pct / 100
    return {
      income: monthly_income, expenses: monthly_expenses,
      savings: +savings.toFixed(2),
      savings_rate: +savings_rate.toFixed(1),
      goal_amount: +goal.toFixed(2),
      on_track: savings >= goal,
      surplus_or_deficit: +(savings - goal).toFixed(2),
      annual_savings: +(savings * 12).toFixed(2)
    }
  }
  return { error: 'Unknown tool' }
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', background: '#0f1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  card: { width: '100%', maxWidth: '760px', background: '#1a1d27', borderRadius: '16px', border: '1px solid #2a2d3a', display: 'flex', flexDirection: 'column', height: '90vh', maxHeight: '800px', overflow: 'hidden' },
  header: { padding: '16px 20px', borderBottom: '1px solid #2a2d3a', display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #00c896, #0066cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  headerText: { flex: 1 },
  title: { fontSize: '15px', fontWeight: '600', color: '#e8eaf0', margin: 0 },
  subtitle: { fontSize: '12px', color: '#6b7280', margin: 0, marginTop: '2px' },
  toolBadges: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  badge: { fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: '#252836', border: '1px solid #2a2d3a', color: '#9ca3af' },
  messages: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  msgRow: (role) => ({ display: 'flex', gap: '10px', flexDirection: role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }),
  avatar: (role) => ({
    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
    background: role === 'agent' ? 'linear-gradient(135deg, #00c896, #0066cc)' : '#252836',
    border: role === 'user' ? '1px solid #2a2d3a' : 'none'
  }),
  bubble: (role) => ({
    maxWidth: '80%', padding: '12px 16px', borderRadius: role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
    background: role === 'user' ? 'linear-gradient(135deg, #00c896, #0066cc)' : '#252836',
    color: '#e8eaf0', fontSize: '14px', lineHeight: '1.6', border: role === 'agent' ? '1px solid #2a2d3a' : 'none'
  }),
  toolCard: { marginTop: '10px', background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: '10px', overflow: 'hidden' },
  toolHeader: { padding: '8px 12px', background: '#0f1117', borderBottom: '1px solid #2a2d3a', fontSize: '11px', color: '#00c896', fontWeight: '600', letterSpacing: '0.5px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  td: { padding: '7px 12px', borderBottom: '1px solid #2a2d3a', color: '#9ca3af' },
  tdVal: { padding: '7px 12px', borderBottom: '1px solid #2a2d3a', textAlign: 'right', color: '#e8eaf0', fontWeight: '500' },
  pos: { color: '#00c896' },
  neg: { color: '#ef4444' },
  thinking: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#252836', borderRadius: '4px 16px 16px 16px', border: '1px solid #2a2d3a', width: 'fit-content' },
  suggestions: { padding: '0 20px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px' },
  suggestion: { fontSize: '12px', padding: '6px 12px', borderRadius: '20px', border: '1px solid #2a2d3a', color: '#9ca3af', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' },
  inputRow: { padding: '12px 16px', borderTop: '1px solid #2a2d3a', display: 'flex', gap: '10px', alignItems: 'center' },
  input: { flex: 1, padding: '11px 16px', borderRadius: '24px', border: '1px solid #2a2d3a', background: '#252836', color: '#e8eaf0', fontSize: '14px', outline: 'none', fontFamily: 'inherit' },
  sendBtn: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00c896, #0066cc)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
}

// ── Result renderers ────────────────────────────────────────────────────────
function ToolResult({ name, result }) {
  if (result.error) return <div style={{ ...s.toolCard }}><div style={s.toolHeader}>⚠ Error</div><div style={{ padding: '10px 12px', fontSize: '13px', color: '#ef4444' }}>{result.error}</div></div>

  const Row = ({ label, value, valueStyle }) => (
    <tr><td style={s.td}>{label}</td><td style={{ ...s.tdVal, ...valueStyle }}>{value}</td></tr>
  )

  if (name === 'get_stock_price') {
    const up = result.change >= 0
    return <div style={s.toolCard}><div style={s.toolHeader}>⚡ STOCK DATA — {result.ticker}</div>
      <table style={s.table}><tbody>
        <Row label="Company" value={result.name} />
        <Row label="Price" value={`$${result.price.toFixed(2)}`} />
        <Row label="Today's Change" value={`${up?'+':''}$${result.change.toFixed(2)} (${up?'+':''}${result.pct}%)`} valueStyle={up ? s.pos : s.neg} />
        <Row label="Market Cap" value={result.mktCap} />
        <Row label="P/E Ratio" value={`${result.pe}x`} />
        <Row label="Sector" value={result.sector} />
      </tbody></table></div>
  }

  if (name === 'convert_currency') {
    return <div style={s.toolCard}><div style={s.toolHeader}>⚡ CURRENCY CONVERSION</div>
      <table style={s.table}><tbody>
        <Row label="You send" value={`${result.amount.toLocaleString()} ${result.from}`} />
        <Row label="You receive" value={`${result.result.toLocaleString()} ${result.to}`} valueStyle={s.pos} />
        <Row label="Exchange rate" value={`1 ${result.from} = ${result.rate} ${result.to}`} />
      </tbody></table></div>
  }

  if (name === 'calculate_compound_interest') {
    return <div style={s.toolCard}><div style={s.toolHeader}>⚡ COMPOUND INTEREST</div>
      <table style={s.table}><tbody>
        <Row label="Total contributed" value={`$${result.total_contributed.toLocaleString()}`} />
        <Row label="Interest earned" value={`+$${result.interest_earned.toLocaleString()}`} valueStyle={s.pos} />
        <Row label="Future value" value={`$${result.future_value.toLocaleString()}`} valueStyle={{ ...s.pos, fontWeight: '700', fontSize: '15px' }} />
        <Row label="Total return" value={`+${result.return_pct}%`} valueStyle={s.pos} />
      </tbody></table></div>
  }

  if (name === 'analyze_portfolio') {
    const wc = result.weighted_change_pct
    return <div style={s.toolCard}><div style={s.toolHeader}>⚡ PORTFOLIO ANALYSIS</div>
      <table style={s.table}><tbody>
        <tr><td style={{ ...s.td, fontSize: '11px', color: '#6b7280' }}>Ticker</td><td style={{ ...s.td, fontSize: '11px', color: '#6b7280' }}>Weight</td><td style={{ ...s.tdVal, fontSize: '11px', color: '#6b7280' }}>Today</td></tr>
        {result.holdings.map(h => <tr key={h.ticker}>
          <td style={s.td}><strong style={{ color: '#e8eaf0' }}>{h.ticker}</strong><span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '6px' }}>{h.sector}</span></td>
          <td style={s.td}>{h.weight}%</td>
          <td style={{ ...s.tdVal, ...(h.pct >= 0 ? s.pos : s.neg) }}>{h.pct >= 0 ? '+' : ''}{h.pct}%</td>
        </tr>)}
        <tr><td style={{ ...s.td, fontWeight: '600', color: '#e8eaf0' }} colSpan={2}>Portfolio today</td><td style={{ ...s.tdVal, ...(wc >= 0 ? s.pos : s.neg), fontWeight: '700' }}>{wc >= 0 ? '+' : ''}{wc}%</td></tr>
      </tbody></table></div>
  }

  if (name === 'analyze_budget') {
    const ok = result.on_track
    return <div style={s.toolCard}><div style={s.toolHeader}>⚡ BUDGET ANALYSIS</div>
      <table style={s.table}><tbody>
        <Row label="Monthly income" value={`$${result.income.toLocaleString()}`} />
        <Row label="Monthly expenses" value={`$${result.expenses.toLocaleString()}`} />
        <Row label="Monthly savings" value={`$${result.savings.toLocaleString()}`} valueStyle={ok ? s.pos : s.neg} />
        <Row label="Savings rate" value={`${result.savings_rate}%`} valueStyle={ok ? s.pos : s.neg} />
        <Row label="Annual savings" value={`$${result.annual_savings.toLocaleString()}`} />
        <Row label="Status" value={ok ? `✅ On track (+$${result.surplus_or_deficit})` : `⚠️ $${Math.abs(result.surplus_or_deficit)} below goal`} valueStyle={ok ? s.pos : s.neg} />
      </tbody></table></div>
  }

  return null
}

// ── Main component ──────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What's NVDA's stock price?",
  "Convert $2,000 to EUR",
  "Invest $300/month at 9% for 25 years",
  "Portfolio: 40% AAPL, 35% MSFT, 25% NVDA",
  "I earn $6,000/month and spend $4,100"
]

export default function FinanceAgent() {
  const [messages, setMessages] = useState([])   // Claude API message history
  const [display, setDisplay] = useState([])     // What to render in the UI
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [display, loading])

  async function runAgent(userText) {
    const newHistory = [...messages, { role: 'user', content: userText }]
    setMessages(newHistory)
    setDisplay(prev => [...prev, { type: 'user', text: userText }])
    setLoading(true)
    setShowSuggestions(false)

    let history = newHistory

    try {
      while (true) {
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) })
        const data = await res.json()
        if (data.error) throw new Error(data.error)

        const textBlocks = data.content.filter(b => b.type === 'text')
        const toolUses = data.content.filter(b => b.type === 'tool_use')

        history = [...history, { role: 'assistant', content: data.content }]

        if (data.stop_reason === 'tool_use' && toolUses.length > 0) {
          const toolResults = []
          const toolDisplays = []

          for (const tu of toolUses) {
            const result = executeTool(tu.name, tu.input)
            toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(result) })
            toolDisplays.push({ toolName: tu.name, result })
          }

          setDisplay(prev => [...prev, {
            type: 'agent',
            text: textBlocks.map(b => b.text).join(''),
            tools: toolDisplays
          }])

          history = [...history, { role: 'user', content: toolResults }]
        } else {
          setDisplay(prev => [...prev, { type: 'agent', text: textBlocks.map(b => b.text).join('') }])
          setMessages(history)
          break
        }
      }
    } catch (err) {
      setDisplay(prev => [...prev, { type: 'agent', text: `Sorry, something went wrong: ${err.message}` }])
    }

    setLoading(false)
  }

  function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    runAgent(text)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.logo}>💹</div>
          <div style={s.headerText}>
            <p style={s.title}>Finance AI Agent</p>
            <p style={s.subtitle}>Powered by Claude · 5 tools active</p>
          </div>
          <div style={s.toolBadges}>
            {['📈 Stocks', '💱 Forex', '📊 Portfolio', '🧮 Calculator', '💰 Budget'].map(t => (
              <span key={t} style={s.badge}>{t}</span>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={s.messages}>
          {display.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💹</div>
              <p style={{ color: '#e8eaf0', fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Your Finance AI Agent</p>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Ask about stocks, currency, investments, portfolios, or budget</p>
            </div>
          )}

          {display.map((msg, i) => (
            <div key={i} style={s.msgRow(msg.type)}>
              <div style={s.avatar(msg.type)}>{msg.type === 'agent' ? '🤖' : '👤'}</div>
              <div>
                <div style={s.bubble(msg.type)}>
                  {msg.text && <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>}
                  {msg.tools?.map((t, j) => <ToolResult key={j} name={t.toolName} result={t.result} />)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={s.avatar('agent')}>🤖</div>
              <div style={s.thinking}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c896', animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div style={s.suggestions}>
            {SUGGESTIONS.map(q => (
              <button key={q} style={s.suggestion} onClick={() => { setInput(q); setShowSuggestions(false) }}
                onMouseEnter={e => { e.target.style.background = '#252836'; e.target.style.color = '#e8eaf0' }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#9ca3af' }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={s.inputRow}>
          <input style={s.input} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about finance..." />
          <button style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.4 : 1 }} onClick={send} disabled={loading || !input.trim()}>➤</button>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 4px; }
        @keyframes bounce { 0%,80%,100%{opacity:.3;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        input::placeholder { color: #4b5563; }
      `}</style>
    </div>
  )
}
