# Non-Intrusive Mobile Action Docks & In-Page Restoration

**When this applies:**
Designing floating action docks, sticky bars, promotional campaign triggers, or conversion quick-access strips on mobile and desktop web applications.

**Principle:**
Floating UI must behave like an unobtrusive utility, not an aggressive advertisement. When dismissed, floating elements should vanish cleanly from viewport space without leaving secondary floating reopen anchors that clutter mobile screens. Restore actions belong in the page content flow (such as the Hero section).

**Why:**
Aggressive floating buttons with loud badges, stacked multiline text, and persistent floating reopen pills create visual fatigue ("kayak web judol/spammy popups"). On mobile viewports, screen real estate is at a premium; persistent floating UI distracts from core reading and comprehension.

**How to apply:**
- **Zero Awkward Text Wrapping**: Keep dock copy ultra-short (1–2 words per action pill) and enforce `whitespace-nowrap leading-none` so labels never break awkwardly into two spaced lines on narrow viewports.
- **Hide Non-Essential Chrome on Mobile**: Hide trailing external arrows (`hidden sm:inline-block`) and excess badge icons on mobile to keep action chips compact (height ~34px–36px).
- **True Viewport Dismissal**: When the user clicks dismiss (`X`), remove the floating dock completely from viewport real estate. Do not replace it with another floating island or pill button.
- **In-Context Section Restoration**: Provide a subtle, inline reopen trigger placed organically within the Hero or relevant section (`✨ Tampilkan bar layanan di bawah`) rather than floating over user content.
- **Preserve Underlying Capabilities on Routing Shifts**: When business requirements pivot primary triggers from local modals to external portals, preserve local modal architectures and state handlers intact so future iterations can reuse them without re-engineering.
