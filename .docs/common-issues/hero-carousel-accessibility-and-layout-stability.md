# Hero Carousel Accessibility, Typography Spacing, and Fixed Stage Height

- **Trigger / Symptoms:**
  - Dual-color JSX headings (`<span>prefix </span><span>highlight</span>`) glue adjacent words together in `dom-accessibility-api` accessible names (e.g. `&Professional` or `KonselingProfesional`).
  - Carousel tabs feel delayed or fail DOM assertions under `<AnimatePresence mode="wait">`, or React Compiler flags `react-hooks/preserve-manual-memoization` when inline conditional arrays are passed to `useCallback`.
  - Switching carousel slides with differing copy lengths or extra step/chip blocks causes visible vertical jumping (CLS).
  - Extracted inline HTML/canvas images look blurry compared to authentic source photography (`hero-slide-1.jpg`, `3072×4096`).

- **Rules:**
  1. Emit literal `' '` text nodes inside `React.Fragment` outside styled `<span>` elements in `renderDualColorHeading` so HTML whitespace normalization preserves spaces between words.
  2. Memoize derived visible slide lists with `useMemo` before passing to `useCallback`, and avoid blocking tab switches with exit-delaying `<AnimatePresence mode="wait">`.
  3. Lock desktop stage heights (`lg:h-[640px]`) alongside fixed responsive visual container heights (`h-[340px] sm:h-[400px] lg:h-[640px]`) and balanced mobile copy `min-h` so multi-slide carousels maintain zero layout shift.
  4. Keep authentic high-resolution photography (`/media/landing/hero-slide-1.jpg`) on Slide 1 with explicit `width`/`height` and `fetchPriority="high"` rather than downscaled HTML extracts.
