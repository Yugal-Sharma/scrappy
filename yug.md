## Phase 6: Multi-Page Discovery & Vertical "Inshorts" Feed

## Goal
Transform the single-page dashboard into a multi-page discovery engine with full image coverage and category deep-dives.

## Tasks
1. **Robust Image Fetching:** Update the backend `scraper.py` to use the `prop=pageimages` and `piprop=original` Wikipedia API parameters. Ensure every article has a high-res image or a high-quality category-based fallback.
2. **Multi-Page Routing:** - Move the current dashboard to `/app/dashboard/page.tsx`.
   - Create a dynamic route `/app/explore/[category]/page.tsx`.
3. **The "Inshorts" Mode:** - Implement a "Vertical Snap Scroll" component for the Explore pages.
   - Each "Slide" should be a full-screen image with a text overlay (Headline + 60-word summary).
4. **Vast Categories:** Implement a sidebar navigation with links to:
   - 🌍 **Geopolitics** (Filtered by keywords: war, embassy, treaty)
   - 📈 **Trade & Tariffs** (Filtered by: economy, import, tax)
   - 🛡️ **Security & Terrorism** (Filtered by: conflict, defense, security)
   - 🏖️ **Global Tourism** (Filtered by: travel, landmark, heritage)
5. **Auto-Categorization Agent:** Use an LLM to tag incoming viral posts into these specific categories in the DB.