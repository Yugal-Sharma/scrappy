# Wikipedia Viral Post Scraper

A fully functional automated scraper that identifies viral Wikipedia topics every 30 minutes and displays them in a sleek, "dull" aesthetic UI. 

![Wikipedia Viral Scraper Showcase Dashboard Screenshot](/images/11.png)

## Overview
This project consists of:
*   **Infrastructure:** A Node.js background agent that runs a cron job hitting the `wikimedia.org` pageviews API, downloading the top 50 trending articles and saving them to a persistent SQLite database (`wiki_data.db`).
*   **Minimalist Dashboard UI:** Built with Next.js 15 App Router, Tailwind CSS, and `framer-motion`, this UI displays the trending articles in a sleek dark mode "Dull Aesthetic".
*   **Live Agent Terminal:** A WebSocket-connected terminal (`socket.io`) at the bottom of the dashboard streams real-time scraper agent logs directly to the user.
*   **Trending Intensity:** Article cards use `recharts` to render a beautiful area sparkline denoting view velocity over time.
*   **AI Insights & Research:** Clicking any trending card opens a modal powered by the Google Gemini LLM API, determining **why** the subject is currently going viral.

## Setup Instructions

### Backend (Agent)
1. `cd backend`
2. `npm install`
3. `node server.js`

### Frontend (Next.js Dashboard)
1. Get a Gemini API key and set `GEMINI_API_KEY` in your `.env.local`
2. `cd frontend`
3. `npm install`
4. `npm run dev`

### Docker Deployment
Run everything at once with:
```bash
docker-compose up -d --build
```
