# Dynamic Hero Carousel Schema, Scroll-Container Stacking Contexts, & Adaptive UX

**When this applies:** Adding interactive image carousels, dynamic multi-media attachments, and sticky control toolbars inside nested scrollable dashboard containers (`<main className="overflow-y-auto">`).

**Rule:**
1. **Dock sticky headers edge-to-edge relative to the nearest scroll container:** Never use offset floating sticky cards (e.g. `sticky top-16`) inside an overflowing `<main>`. In CSS, `sticky` elements anchor relative to their scrolling ancestor; vertical offsets leave gaps where scrolled content bleeds through and overlaps form controls. Use full-bleed docking (`-mt-4 -mx-4 sm:-mt-6 sm:-mx-6 ... sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b`) so content tucks under cleanly.
2. **Model dynamic carousel items as dedicated arrays with explicit bounds:** Do not overload fixed repeater slots (such as `hero.items`, bounded to 3–4 trust metrics) with presentation media. Define `slides: Type.Optional(Type.Array(LandingMediaSchema, { minItems: 1, maxItems: 10 }))` and hydrate them in backend repositories from typed `hero_slide` media attachments sorted by `position`.
3. **Adaptive UX for Single vs Multi-Slide:** When `slideCount === 1` (default state), automatically suppress carousel controls (slide counters, arrows, dot indicators, and dark caption overlays) to display a clean, uninterrupted photograph. When `slideCount >= 2`, smoothly activate Framer Motion spring physics (`stiffness: 350, damping: 32`), touch swipe, and WCAG 2.2.2 pause-on-hover/focus controls.
4. **Enforce minimum 1 photo invariant:** Prevent broken empty hero layouts by disabling the delete action whenever `slides.length <= 1`, providing clear inline tooltips and status feedback ("Minimal 1 foto wajib ada").

**Why:**
Sticky cards with vertical offsets produced severe visual overlap where sticky banners clipped directly into section fields. Hardcoding carousel photo counts prevented administrators from adjusting slide quantities independently, and rendering carousel chrome on a single image looked clunky and confused users.
