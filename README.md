# 💹 Finance AI Agent

An AI-powered finance assistant built with Next.js and Claude. Ask about stocks, currencies, investments, portfolios, and budgets.

## Features
- 📈 Stock price lookup (AAPL, MSFT, NVDA, TSLA, and more)
- 💱 Currency conversion (10 currencies)
- 🧮 Compound interest calculator
- 📊 Portfolio analysis
- 💰 Budget analyzer

---

## 🚀 Setup & Run Locally

### Step 1 — Install Node.js
Download from https://nodejs.org (choose the LTS version)

### Step 2 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Sign up / log in
3. Click "API Keys" → "Create Key"
4. Copy the key

### Step 3 — Set up the project
Open a terminal in this folder and run:
```bash
npm install
```

### Step 4 — Add your API key
Copy the example env file:
```bash
cp .env.local.example .env.local
```
Then open `.env.local` and replace `your_api_key_here` with your real key.

### Step 5 — Run it
```bash
npm run dev
```
Open http://localhost:3000 in your browser. Done! 🎉

---

## ☁️ Deploy to Vercel (Free)

### Step 1 — Push to GitHub
1. Go to https://github.com and create a new repository
2. Upload all these files to the repository

### Step 2 — Deploy on Vercel
1. Go to https://vercel.com and sign up (free)
2. Click "Add New Project"
3. Import your GitHub repository
4. Click "Deploy"

### Step 3 — Add your API key to Vercel
1. Go to your project settings on Vercel
2. Click "Environment Variables"
3. Add: `ANTHROPIC_API_KEY` = your key
4. Redeploy the project

Your app is now live at `https://your-app.vercel.app` 🚀

---

## Project Structure
```
finance-agent/
├── app/
│   ├── layout.jsx          # Root HTML layout
│   ├── page.jsx            # Main chat UI
│   └── api/
│       └── chat/
│           └── route.js    # Server-side Claude API calls
├── .env.local              # Your API key (never share this!)
├── package.json
└── README.md
```

## How it works
1. You type a message in the chat
2. It's sent to `/api/chat` (server-side — your API key stays secret)
3. Claude decides which finance tool to use
4. The tool runs and returns data
5. Claude explains the results
