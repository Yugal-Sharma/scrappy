## Phase 8: Strict Category Guardrails & Visual Perfection

## Goal
Ensure 100% category accuracy, full image coverage, and high-end "Inshorts" navigation.

## Tasks
1. **AI Classifier (The Guardrail):** - Before saving to the DB, the Agent MUST use an LLM (Gemini/GPT) to categorize the post.
   - If a post's category confidence is below 90%, do not show it in a specific category.
   - STRICT RULE: Actors/Celebs are forbidden in #Science.
2. **The "Full-Bleed" Image Engine:**
   - Implement a fallback chain: Wikipedia API -> Unsplash API (Search by Title) -> Google Search API.
   - If all fail, generate a realistic AI image using a 'Nano Banana 2' call.
3. **Smooth Navigation (The "Inshorts" Feel):**
   - Replace standard scrolling with `framer-motion` Page Transitions.
   - Use "Vertical Snap Scrolling" (CSS Scroll Snapping) so each post feels like a slide.
4. **Massive Content Density:**
   - Expand the scraper to pull at least 20 items per category (Songs, Cars, Companies, etc.).