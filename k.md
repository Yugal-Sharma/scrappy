## Phase 9: Mesmerizing UI & Universal Imagery

## Goal
Eliminate empty boxes, fix the sidebar aesthetics, and create a "Rare & Unique" sliding experience.

## Tasks
1. **The "Mesmerizing" Sidebar:** Replace the white background with a 'Glassmorphism' panel (semi-transparent blur). Underneath it, add an animated 'Mesh Gradient' that slowly shifts colors.
2. **Universal Image Fallback (No Black Boxes):** - For Movies/Actors: Use TMDb API.
   - For Songs/Singers: Use Spotify Metadata API.
   - For General/Science: Use Unsplash API with specific keywords.
   - If no image is found: Generate an abstract AI gradient image that matches the category color (e.g., Green for Science, Gold for Movies).
3. **Cinematic Transitions:** Implement a 'Scale-In' and 'Fade' transition using Framer Motion. When the user scrolls, the next card should look like it’s approaching the camera.
4. **Vast Content Refresh:** Re-trigger the scraper to fill every page with 30+ items now that categories are fixed.