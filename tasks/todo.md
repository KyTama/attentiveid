# Active Task Checklist: Phase 1.17 — Header De-cluttering & Navigator Streamlining

> **Status:** COMPLETED  
> **Milestone:** Milestone 1.7 (Navigation Clarity & Visual Polish)  
> **Active Focus:** Eliminate navbar clutter by removing redundant "How it works" link, routing "Find your psychologist" directly as a clean primary nav item, eliminating the redundant second desktop CTA button to leave a single authoritative Consultation CTA, upgrading layout spacing and typography, verifying tests, and pushing atomic commits.

---

## Task Checklist
- [x] **Step 1: Streamline Nav Items in SiteHeader**:
  - Remove `{ key: 'process', href: '/#process' }` ("How it works") from top navigation.
  - Consolidate psychologist navigation into `{ key: 'find', href: '/psychologists' }` as a first-class nav link.
  - Settle on 5 clean, focused links: Services, Find your psychologist, Locations, Articles, FAQ.
- [x] **Step 2: Eliminate Redundant Secondary Desktop CTA**:
  - Remove redundant "Find your psychologist" secondary button from header action group.
  - Establish a single, authoritative primary CTA: "Plan a Consultation Session" (`openIntake`) styled with rounded-full gold pill and Emil Kowalski spring physics.
- [x] **Step 3: Elevate Visual Architecture & Spacing**:
  - Reduce bloated header height to a sleek `h-18` (72px).
  - Open up spacious link gaps (`gap-6 xl:gap-8`) for an uncluttered, modern boutique aesthetic.
  - Streamline mobile menu drawer to display the clean 5 links with chevrons and a single primary consultation CTA.
- [x] **Step 4: Verification & Atomic Push**:
  - Run `apps/web` linter and full vitest suite (56 tests).
  - Run `./scripts/ci/verify-runtime-config.sh` and `./scripts/ci/verify.sh && DATABASE_ADMIN_URL=... bun run verify:shared-content`.
  - Make atomic git commits and push to `origin/master`.





