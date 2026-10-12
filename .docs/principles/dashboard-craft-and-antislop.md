# Dashboard Craft Normalization & Anti-AI-Slop Copy Foundations

**When this applies:**
When designing or refactoring administrative dashboard interfaces, portal navigation, and CMS default content models.

**Principle:**
1. **Iconographic Coherence**: Internal tools must never use inconsistent inline raw SVGs when a system design token library (Lucide) is established. Standardize stroke width (e.g. 1.75px) and optical bounding boxes (`size-4.5` or `size-5`) to guarantee visual balance.
2. **Numeric Stability**: Metric counters subject to dynamic fetching or polling must declare `tabular-nums` (`font-variant-numeric: tabular-nums`) to prevent micro horizontal shifts during value hydration.
3. **Concentric Geometry**: Respect inner-outer radius mathematics ($R_{outer} = R_{inner} + padding$) on metric tiles and modal dialogs to prevent visual pinching.
4. **Clinical Grounding over AI-Fluff**: Clinical psychology bureau copy must replace AI clichés (safe non-judgmental space, emotional care journey) with concrete, regulatory-backed facts (HIMPSI ethical codes, active SIP licenses, soundproof consulting suites, and defined goal-oriented session frameworks).
