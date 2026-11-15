# Scope Experimental Pages as Native SPA Routes, Guard Null 2D/WebGL Contexts, and Clean Up Side Effects on Unmount

- **Category:** Routing, CSS Isolation & Browser APIs
- **Triggered by:** Porting standalone experimental HTML/WebGL/Canvas apps (`/let-there-be-light`) into the React + Tailwind v4 SPA (`apps/web`) served behind Caddy (`apps/web/Caddyfile`) and tested under jsdom/Vitest.

## Problem / Trap

1. **Caddy SPA fallback traps static directories without trailing slashes:** `apps/web/Caddyfile` uses `try_files {path} /index.html`. Putting an HTML page at `public/<slug>/index.html` fails when users visit `/<slug>` directly because Caddy checks for a file at `/srv/<slug>`, misses, and falls through to React's `/index.html` (`NotFoundPage`).
2. **Global root styles and side effects leak across SPA navigation:** Porting `:root`, `:root.lit`, `body { overflow: hidden }`, `requestAnimationFrame`, `AudioContext`, or `window` idle listeners un-scoped causes dark themes, scroll locks, timers, or audio to leak when navigating away from the route.
3. **2D Canvas throws in jsdom if unguarded:** Just like WebGL (`getContext('webgl')`), `HTMLCanvasElement.getContext('2d')` returns `null` in jsdom unless explicitly guarded before calling `.setTransform()` or drawing methods.

## Rule

- Mount standalone experimental pages as native React routes under `PublicLayout` in `apps/web/src/App.tsx` rather than static subdirectories in `apps/web/public/`.
- Scope CSS variables, typography, and viewport lock inside a route root class (e.g. `.attend-root`, `.attend-root.lit`), inject route-specific font stylesheets idempotently by element ID, and restore `document.title` / `document.documentElement.lang` while tearing down all `rAF` loops, timers, listeners, and `AudioContext` instances in the `useEffect` cleanup.
- Guard both `getContext('webgl')` and `getContext('2d')` against `null` with safe no-op controllers.
