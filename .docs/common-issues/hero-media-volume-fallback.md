# Hero Media Docker Volume Mount and Bundled Asset Precedence

## Context
In production deployments with containerized Docker Compose (`compose.production.yml`), uploaded user media is stored on a persistent volume mounted at `/srv/media:ro` in the web container.
When database seed records or published CMS revisions reference a path like `media/landing/hero-slide-1.jpg`, the web server serves whatever binary was previously uploaded to that persistent volume rather than any updated asset bundled in the static build.

## Problem
1. When replacing or synchronizing hero images across environments, if the client logic blindly uses `managed.section.media.reference`, it queries `/media/landing/hero-slide-1.jpg`.
2. On VPS, the volume already contains the older uploaded file (e.g., Malang clinic facade photo from prior testing), causing the live website to display the wrong image despite clean static builds.
3. Sub-paths like `/media/landing/pet-friendly/` that only exist in the frontend repository will return SPA fallback (HTML 404) unless served as static assets under `/images/`.

## Solution / Rule
- Always package core campaign visuals and template assets under `/images/` (e.g. `/images/figma/consultation-hero.webp` and `/images/pet-friendly/`) so they are bundled statically in Vite `dist/` and served directly by Caddy.
- When resolving hero images in `HomepageHero.tsx` and CMS simulator (`LandingCmsPage.tsx`), explicitly guard against legacy volume references (`hero-slide-1`, `malang`) and fallback cleanly to the canonical bundled asset (`/images/figma/consultation-hero.webp`).
