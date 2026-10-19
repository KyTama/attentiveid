# Active Task Checklist: Redirect Intake CTA Buttons to External Booking Portal

> **Status:** COMPLETED  
> **Milestone:** Milestone 2.3 (Conversion Flow & External Booking Integration)  
> **Active Focus:** Redirected all consultation intake buttons/triggers to `https://booking.attentiveid.com/` (`target="_blank" rel="noopener noreferrer"`), while completely preserving existing dialog architecture for future reuse.

---

## Action Items
- [x] **Audit all `openIntake` call sites across the codebase**:
  - `HomepageHero.tsx` (Completed)
  - `SiteHeader.tsx` (Completed)
  - `SupportExplorer.tsx` (Completed)
  - `ClosingInvitation.tsx` (Completed)
  - `OurLocations.tsx` (Completed)
  - `PsychologistProfileHero.tsx` (Completed)
  - `PsychologistProfileDetails.tsx` (Completed)
  - Legacy components: `Navbar.tsx`, `CtaScreening.tsx`, `HeroSection.tsx` (Completed)
- [x] **Update SupportExplorer.tsx & ClosingInvitation.tsx**:
  - Replaced button click handlers with direct external anchors to `https://booking.attentiveid.com/` (`target="_blank" rel="noopener noreferrer"`).
- [x] **Update OurLocations.tsx**:
  - Replaced online & offline booking buttons with direct anchors to `https://booking.attentiveid.com/`.
- [x] **Update Psychologist Profile components (`PsychologistProfileHero.tsx`, `PsychologistProfileDetails.tsx`)**:
  - Linked consultation intake CTAs directly to `https://booking.attentiveid.com/`.
- [x] **Update legacy landing components (`Navbar.tsx`, `CtaScreening.tsx`, `HeroSection.tsx`)**:
  - Converted desktop and mobile intake CTA buttons to direct external anchors.
- [x] **Preserve Modal Code & Verify Integrity**:
  - Kept `ConsultationIntakeModal.tsx`, `IntakeModalContext.tsx`, `useIntakeModal.ts` untouched and functional.
  - Verified 58/58 tests passing (`bun run test:web`).
  - Verified clean TypeScript checks and production bundle build (`bun run build`).
  - Synchronized knowledge graph via `code-review-graph`.
