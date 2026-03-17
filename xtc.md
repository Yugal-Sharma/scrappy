# Wikipedia Viral Post Scraper - Phase 1: Infrastructure

## Goal
Build a fully functional automated scraper that identifies viral Wikipedia topics every 30 minutes and displays them in a sleek, "dull" aesthetic UI.

## Tech Stack
- **Frontend:** Next.js + Tailwind CSS (Sleek, minimal UI)
- **Backend:** FastAPI 
- **Database:** SQLite (via SQLAlchemy)
- **Agent Tooling:** OpenClaw for scraping + Wikimedia Pageviews API
- **Scheduler:** APScheduler (30-minute intervals)

## Task 1: Environment Setup & Scraper Logic
1. Initialize a `/backend` folder with a FastAPI project.
2. Create `scraper.py` using the Wikimedia Pageviews API to fetch the top 50 trending articles.
3. Setup `database.py` with a schema for: `id`, `title`, `views`, `timestamp`, and `wiki_url`.
4. Implement a background task that runs every 30 minutes to populate the DB.
5. Create a GET `/trending` endpoint to serve the latest data to the frontend.

## Instructions for Agent
- Read this file and acknowledge the architecture.
- Generate the backend folder structure first.
- Install necessary Python dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `requests`, `apscheduler`.
- Confirm when the backend server is ready for a test run.
## Phase 2: Frontend Dashboard (Next.js + Tailwind)

## Goal
Create a high-performance dashboard that fetches the trending Wikipedia data from our FastAPI backend and displays it in a sleek, minimalist grid.

## Tasks
1. Initialize a Next.js 15 app in the `/frontend` directory using the App Router and TypeScript.
2. Install UI dependencies: `framer-motion` (for animations), `lucide-react` (for icons), and `axios` (for data fetching).
3. Design a "Dull Aesthetic" UI:
   - Use a **Zinc/Slate** color palette (Dark mode by default).
   - Create a `TrendingCard` component to show Article Title, Pageviews, and a "Read More" button.
   - Add a "Scraper Status" badge that shows the last sync time.
4. Implement a `useEffect` hook to fetch data from `http://localhost:8000/trending` every 1 minute to keep the UI fresh.
5. Setup a Proxy in `next.config.js` to avoid CORS issues if necessary.
## Phase 3: Automation, Persistence & Live Polish

## Goal
Finalize the 30-minute scraping heartbeat and add interactive "Agent" features to the UI to make it look high-end and professional.

## Tasks
1. **Background Heartbeat:** Ensure the `APScheduler` in the backend is correctly logging hits. Add a `/status` endpoint that returns the "Time until next scrape."
2. **Database Persistence:** Ensure the SQLite database doesn't reset on restart. Use a volume or local file `wiki_data.db`.
3. **Live Agent Console:** On the Frontend, add a "Terminal" component at the bottom of the page that streams logs from the backend (using WebSockets or Long Polling). 
4. **Visual Polish:** Add a "Trending Intensity" sparkline chart for each post using `recharts` to show view-count growth.
5. **Deployment Script:** Create a `docker-compose.yml` file to spin up both the Frontend and Backend with one command. 
## Phase 4: Verification & Cloud Flight

## Goal
Verify all features using the Browser Agent and deploy the application to a live URL.

## Tasks
1. **Automated Verification:** Use the Antigravity Browser Agent to:
   - Navigate to the local dashboard.
   - Verify that at least 10 viral posts are displayed.
   - Click a "Read More" link to ensure it opens the correct Wikipedia page.
   - Capture a screenshot of the "Live Agent Terminal" working.
2. **GitHub Integration:** - Initialize a Git repo.
   - Create a high-quality `README.md` with screenshots captured in Task 1.
   - Push the code to a new GitHub repository.
3. **Cloud Deployment:**
   - Use the `gcloud` CLI (via Antigravity terminal) to deploy the Backend to **Cloud Run**.
   - Deploy the Next.js Frontend to **Vercel** or **Firebase Hosting**.
4. **Final Polish:** Add a "Share to X/Twitter" button on viral posts so users can spread the news instantly.