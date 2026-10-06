# Architectural Location Imagery & Synchronized Lifecycle States

**When this applies:**
When introducing or updating physical clinic branch assets, location cards, and lifecycle statuses (`opening_soon` vs `active`) across landing pages, data models, CMS views, and localization dictionaries.

**Principle:**
Physical location presentation requires strict coherence across three planes: asset optimization, state synchronization, and dual-action user pathways. Changing a physical branch state is never a single-field edit; it changes customer expectations, booking capabilities, and map discovery.

**Why:**
Branch readiness often evolves (e.g., Malang clinic transitioning from "Opening Soon" to fully operational with architectural signage in place). If asset cropping or status toggling is treated haphazardly, users face broken expectation loops (e.g., landing card says "online only" while clinic photo shows ready entrance, or booking buttons don't match actual operational status).

**How to apply:**
1. **Asset Geometry & Weight**: Standardize architectural location preview images to uniform aspect ratios (16:10 or 16:9), centered on recognizable brand anchors (signboards, entrance portals). Always compress raw high-res photos to high-efficiency WebP assets with explicit `width`/`height` attributes to guarantee Zero Cumulative Layout Shift (CLS).
2. **Synchronized State Cascade**: When a branch transitions from `opening_soon` to `active`:
   - Update data model statuses (`status: 'active'`, tag to canonical branch name).
   - Update all localization dictionaries (`id.json`, `en.json`) simultaneously for descriptions and feature bullets.
   - Update admin CMS selectors and directory labels so staff and intake pipelines remain in lockstep.
3. **Dual-Action Continuity**: Active physical branches must provide clear dual affordances: direct offline intake reservation (`initialFormat: 'offline'`) and external map navigation (`mapsUrl` with verified geocoordinates).
