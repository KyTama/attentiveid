# Global UI Design Contract

> **Context:** This principle captures the finalized baseline UI decisions from Phase 1.1 and Phase 1.2 to be universally applied to all upcoming frontend/UI phases to ensure consistency and prevent context-rot.

## 1. Typography & Fonts
- **Fonts:** 
  - `Montserrat` for Landing Page Headings
  - `Droid Serif` for Landing Page Body
  - `Inter` for App UI
- **Constraints:** Maximum of 2 font weights per phase (use 400 and 600/700 strictly) to pass the UI checker.

## 2. Color Palette
- **Dominant (60%):** `#FEFAF6` (Off-white / cream for backgrounds and surfaces)
- **Secondary (30%):** `#142c52` (Brand Navy for foreground text, cards, sidebar, nav)
- **Accent (10%):** `#d6a74d` (Gold for primary CTA buttons, active state indicators)
- **Destructive:** `#ef4444` (For destructive actions only)

## 3. Copywriting & i18n
- **Bilingual Support:** All UI elements must specify both English and Indonesian texts natively.
- **Tone:** Must be specific and actionable. Example: Use "No appointments found" instead of "No data". Error states must include a solution path (e.g., "Please refresh or contact support").

## 4. Visual Anchor
- Every screen must explicitly declare a **Primary Visual Anchor (Focal Point)** to guide the user's attention (e.g., The "Book Now" CTA).

## 5. Spacing
- Use a strictly 4-point spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px).

---
*Note: This contract must be read by UI researchers when drafting the `UI-SPEC.md` for new phases.*
