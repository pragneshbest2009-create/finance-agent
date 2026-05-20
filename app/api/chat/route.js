import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const tools = [
  {
    name: 'get_stock_price',
    description: 'Get current stock price, change, market cap, P/E ratio for a ticker. Supports: AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, JPM, BRK, V',
    input_schema: {
      type: 'object',
      properties: {
        ticker: { type: 'string', description: 'Stock ticker symbol e.g. AAPL' }
      },
      required: ['ticker']
    }
  },
  {
    name: 'convert_currency',
    description: 'Convert an amount between currencies. Supported: USD, EUR, GBP, JPY, CAD, AUD, CHF, INR, CNY, BRL',
    input_schema: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        from: { type: 'string' },
        to: { type: 'string' }
      },
      required: ['amount', 'from', 'to']
    }
  },
  {
    name: 'calculate_compound_interest',
    description: 'Calculate compound interest investment growth over time',
    input_schema: {
      type: 'object',
      properties: {
        principal: { type: 'number' },
        monthly_contribution: { type: 'number' },
        annual_rate: { type: 'number', description: 'Annual rate as percentage e.g. 8 for 8%' },
        years: { type: 'number' }
      },
      required: ['principal', 'annual_rate', 'years']
    }
  },
  {
    name: 'analyze_portfolio',
    description: 'Analyze a stock portfolio given tickers and percentage weights',
    input_schema: {
      type: 'object',
      properties: {
        holdings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ticker: { type: 'string' },
              weight: { type: 'number' }
            }
          }
        }
      },
      required: ['holdings']
    }
  },
  {
    name: 'analyze_budget',
    description: 'Analyze monthly budget: income, expenses, savings rate, and advice',
    input_schema: {
      type: 'object',
      properties: {
        monthly_income: { type: 'number' },
        monthly_expenses: { type: 'number' },
        savings_goal_pct: { type: 'number' }
      },
      required: ['monthly_income', 'monthly_expenses']
    }
  }
]

export async function POST(req) {
  try {
    const { messages } = await req.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `You are a professional Finance AI Agent. Help users with stock prices, currency conversion, compound interest, portfolio analysis, and budget planning. Always use tools when data is needed — never guess numbers. After showing tool results, provide a brief 1-2 sentence insight or recommendation.`,
      tools,
      messages
    })

    return Response.json(response)
  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
