# PRD — 3D Immersive Art Gallery Portfolio (Parv Malav)

## Original Problem Statement
Build an extraordinary, immersive 3D digital art gallery portfolio website — a luxury museum experience. Phase 1: cinematic landing page (charcoal/white/gold, animated particles, custom cursor, breathing "ENTER THE GALLERY" CTA, curtain transition). Phase 2: first-person 3D gallery walking simulator (Three.js) with spotlit framed exhibits, WASD + mouselook, inspect overlays, favorites and analytics. User also asked for code push to github.com/P-2005/new-testfable5 (handled via Emergent "Save to GitHub" feature — agent cannot push directly).

## User Choices
- Accent: white & gold "real gallery" luxury feel
- Exhibits: SMASH.CLUB project + skills, certifications, education from resume (real images to be provided later)
- No sound design
- Include favorites + view analytics (backend persisted)

## Architecture
- **Frontend**: React 19 + React Three Fiber 9 + drei 10 + framer-motion + zustand. Fonts: Cormorant Garamond (display) + Outfit (body).
- **Backend**: FastAPI + MongoDB (motor). Routes prefixed /api.
- **Key fix**: craco.config.js wraps the visual-edits babel plugin to skip R3F files (Room/Exhibit/Player/GalleryExperience) — lowercase R3F JSX elements reject injected x-* attrs. DO NOT REMOVE.

## Implemented (June 2026)
- Landing page: particle canvas, drifting gold orbs, grain, staggered letter title, word-stagger subtitle, breathing CTA with shimmer, Enter-key entry, custom gold cursor (dot+ring+trail), social links
- Curtain wipe transition (dual panels + "The Gallery Awaits")
- 3D gallery: 28×20m hall, reflective polished floor (MeshReflectorMaterial), white walls, gold baseboards/cornices, 5 emissive ceiling panels with point lights
- 8 exhibits (gold frame + white mat + artwork + placard + warm spotlight): smash-club (featured 4.4m), elo-engine, languages, web-cloud, education, certifications, about (portrait), contact
- First-person controller (custom, no drei PointerLockControls): native pointer lock with AUTOMATIC drag-to-look fallback (sandboxed iframes block pointer lock — SecurityError handled); exponentially smoothed look + movement velocity; WASD/arrows, Shift run, Space jump, head bob, wall-clamped collision; movement spike clamp for Chromium lock quirk
- Center-reticle raycast hover (gold expand + title + "click to inspect"), click/tap to inspect
- Artwork modal: image, type, title, year/medium, description, detail bullets, external links, favorite toggle, live view count from backend, ESC/close
- Favorites: zustand + backend persistence per visitor_id (localStorage uuid), drawer with view/remove
- Analytics: POST /api/artworks/{id}/view (upsert inc), GET /api/analytics/views
- Mobile: touch joystick (bottom-left) + drag-look on canvas, tap-to-inspect via R3F onClick
- Debug helpers (dev): window.__galleryDebug, window.__gallerySetView(x, z, yaw)

## Iteration 2 (June 2026)
- Fixed ceiling light z-fighting (white striped patches) — recessed light panel separated from gold trim
- Reduced floor reflections (mirror 0.45→0.15) so floor reads clearly
- Game-style controls: gallery starts instantly explorable (no popup); click empty space = pointer lock (cursor hides), L = toggle mouselock, P/ESC = pause menu (Resume / controls guide / Leave Gallery), crosshair reticle with ticks
- New entry transition: "Now Entering — The Private Collection" cinematic fade (replaced curtain shutters)
- Modal close no longer pops any overlay

## Iteration 3 (June 2026)
- Landing: removed "Admission Free" + "Press Enter to begin" texts
- Reticle: minimal horror-game circle (removed crosshair ticks); "Lock Cursor" button in top bar (data-testid lock-cursor-btn)
- Centre sofa (leather + gold legs, faces featured wall): click/reticle-click to sit (camera eases to seat y1.18), 360° free look while seated, WASD/Space stands up (steps off to front), solid collision footprint (±2.05 x, ±1.05 z)
- Real images: smash-club + education (VIT campus) + about (portrait) use user-uploaded assets (customer-assets URLs in artworks.js); elo=badminton, languages=code, web-cloud=servers, certifications=graduation (Unsplash)
- Input: continuous per-frame polling via refs (keyboard + mouse fully parallel, no event blocking)
- NOTE: craco.config.js R3F babel exclusion regex now includes Sofa — any NEW R3F file must be added there

## Backend API
- GET /api/ — health
- POST /api/artworks/{artwork_id}/view → {artwork_id, views}
- GET /api/analytics/views → {views: [...]}
- GET /api/favorites/{visitor_id} → {artwork_ids: []}
- POST /api/favorites {visitor_id, artwork_id} (idempotent upsert)
- DELETE /api/favorites/{visitor_id}/{artwork_id}

## Testing
- iteration_1: backend 9/9 pytest pass (/app/backend/tests/test_gallery_api.py); frontend 90% (z-index nit fixed → top bar z-[45])
- Manual playwright: walk, hover, inspect modal, favorite, view count, close — all pass
- Note: headless browsers throttle rAF → slow walking in tests only; real browsers 60fps

## Backlog
- P0: Replace placeholder Unsplash artwork images with user's real screenshots/images (user will provide)
- P1: Inspection zoom camera animation toward artwork; analytics dashboard view; guided tour mode
- P2: Multiple gallery rooms/sections, pedestal 3D pieces, time-of-day lighting, screenshot/share tool, sound design (deferred by user)

## Next Tasks
1. Await user's real portfolio images + descriptions, swap into /app/frontend/src/data/artworks.js
2. Remind user: use "Save to GitHub" in Emergent UI to push to P-2005/new-testfable5
