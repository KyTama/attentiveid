# CTA Hierarchy and Test Role Uniqueness Across Layout Boundaries

**Symptoms:**
- Route or integration tests using `screen.getByRole('button', { name: /plan a consultation session/i })` fail with `TestingLibraryElementError: Found multiple elements with the role "button"`.
- Action buttons shared between global layouts (e.g. `SiteHeader`) and specific route components (e.g. `PsychologistProfileHero`, `#profile-booking`) share identical text labels.

**Root Cause:**
- Testing Library's `getByRole` expects exactly one matching element across the entire document `<body>`.
- When top-level navigation, page heroes, and bottom conversion sections render identical call-to-action buttons (e.g. intake triggers), query collisions occur unless queries are scoped or quantified.

**Rule:**
- In integration/route tests covering complete page trees, use `screen.getAllByRole('button', { name: ... })` with length assertions (`toBeGreaterThanOrEqual(1)`) or scope queries to semantic landmarks via `within(screen.getByRole('main'))`.
- Assert unique section-specific anchors (e.g. `screen.getByRole('link', { name: /get to know [name]/i })` with `href="#profile-story"`) to verify local component rendering with complete confidence.
