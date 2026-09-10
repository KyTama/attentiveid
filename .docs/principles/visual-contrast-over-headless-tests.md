# Visual contrast verification over headless DOM tests

**When this applies:** Designing, refactoring, or reviewing frontend components, dashboard forms, or interactive states across light and dark modes.

**Principle:** Never rely solely on headless unit tests (JSDOM/Vitest) to declare a UI finished; explicitly enforce Impeccable and WCAG contrast floors (≥ 4.5:1 body/placeholder, ≥ 3:1 large text) and audit real rendered appearance across color schemes.

**Why:** Headless tests pass completely on DOM structure even if text is rendered black-on-black or navy-on-dark slate. Relying on node assertions creates a false sense of security while delivering an unusable, invisible interface to real users.

**How to apply:**
- Apply explicit text and placeholder color tokens (`text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500`) to form controls instead of assuming theme inheritance.
- Audit both light mode and dark mode (`prefers-color-scheme: dark`) to prevent CSS variable mismatches between media queries and root class selectors.
- Check contrast ratios against WCAG AA standards (minimum 4.5:1) for all input, label, and copy elements before declaring any surface complete.
- Verify visual rendering directly in the browser rather than assuming passing headless tests equal correct pixels.
