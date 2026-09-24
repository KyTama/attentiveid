# Active Task Checklist: Restore WhatsApp Booking Action in PsychologistProfileHero

> **Status:** COMPLETED  
> **Milestone:** Milestone 1.9 (Psychologist Profile Journey & Action Parity)  
> **Active Focus:** Reinstated direct WhatsApp reservation CTA button for psychologist profile in `PsychologistProfileHero.tsx` alongside intake dialog trigger and story anchor.

---

## Task Checklist
- [x] **Step 1: Graph & Git Analysis**:
  - Traced previous button layout in commit `5865a3d` and `4f1d677`.
  - Identified target location: `PsychologistProfileHero.tsx` lines 68-91.
- [x] **Step 2: Reinstate WhatsApp Button in PsychologistProfileHero**:
  - Re-added the direct WhatsApp link button (`href={psychologist.bookingUrl}`) with `MessageCircle` icon and translated label `routes.profile.bookWhatsApp`.
  - Maintained primary visual hierarchy:
    - Primary CTA: WhatsApp direct booking (`bg-secondary text-white`) with `MessageCircle`.
    - Secondary CTA: Intake questionnaire dialog (`border border-secondary/25 bg-white text-secondary`).
    - Tertiary CTA: `#profile-story` letter jump link (`border border-primary/40 bg-[#fcf8f1]`).
  - Applied Emil Kowalski spring physics (`INTERACTIVE_SPRING` with `whileHover={{ y: -3 }}` and `whileTap={{ scale: 0.98 }}`).
- [x] **Step 3: Verification & Knowledge Graph Rebuild**:
  - `bun run test:web`: 56/56 passing.
  - `./scripts/ci/verify.sh`: passed (build + test + contract + migrations).
