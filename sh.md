## Phase 10: Dynamic Sorting & Freshness Protocol

## Goal
Ensure the newest trending topics always appear at the top and the "30-minute refresh" actually updates the UI.

## Tasks
1. **Backend Query Sorting:** Update the SQLAlchemy/FastAPI GET `/trending` and `/explore` endpoints to include `.order_by(Post.timestamp.desc())`.
2. **Scraper "Upsert" Logic:** - Instead of just adding rows, use an "Upsert" (Update or Insert). 
   - If a topic is still viral, update its `view_count` and `timestamp` to "now" so it stays at the top.
3. **Frontend Refresh Trigger:** - Implement a `pull-to-refresh` or a "New Posts Available" toast notification.
   - Ensure the Next.js `fetch` call has `{ cache: 'no-store' }` to bypass stale data.
4. **Data Cleanup:** Automatically delete posts older than 48 hours to keep the "vast" database from getting cluttered with stale news.