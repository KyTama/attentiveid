# Task: Native Booking Engine Migration (`Attentive-Booking` -> `attentiveid`)

> **Branch:** `feat/booking` (rebased onto `origin/master` `369388c`)
> **Commit Policy:** Local commit only on `feat/booking` — DO NOT push until user instructs.
> **Specification:** `.docs/specifications/booking-migration-plan.md`

---

## Checklist

- [x] **Step 0: Sync Branch & Staging Content (Non-PII)**
  - Pulled `origin/master` (`369388c`), rebased `feat/booking` onto `master`.
  - Applied `0000`–`0010` migrations to local Postgres (`attentiveid`) and synced 20 non-PII tables from staging (`tencent-lab`) + re-seeded local dev users (`db:seed:users`).
- [x] **Stage A: Shared Domain Contract (`packages/shared/src/booking.ts`)**
  - Implemented `packages/shared/src/booking.ts` reusing `PRACTICE_BRANCHES` (`tbi | bsd | malang`), `INTAKE_CONCERNS`, `matchPsychologists`, `detectCrisisKeywords`, and `EMERGENCY_CRISIS_HOTLINES`.
  - Added `ZITE_PSYCHOLOGIST_BOOKING_DEFAULTS`, email/WhatsApp E.164 normalizers, booking validators, `parseDaySchedule`, 20:00 WIB cutoff, WhatsApp routing, status transitions, and formula-neutralized operational CSV exporter (no `concernNote`).
  - Extended `FullPsychologistMutation` & validation in `packages/shared/src/content.ts` with optional booking catalog fields, exported in `packages/shared/src/index.ts`, and verified (`48 pass, 0 fail` across `packages/shared/`).
- [x] **Stage B: Schema, Drizzle Migration & Psychologists Compatibility (`apps/api`)**
  - Extended `psychologist_profiles` (preserving `bookingUrl`/`premiumBookingUrl`, adding rates/availability/schedule columns + mode-rate `CHECK` constraints).
  - Added `booking_status`, `webhook_delivery_status`, `bookings` (`client_user_id`, `email_normalized`, `whatsapp_e164`, `onDelete: 'restrict'` on `psychologist_id`, `confirmed_start_at`/`confirmed_end_at`), `booking_clinical_intakes`, and `booking_webhook_deliveries`.
  - Generated Drizzle migration (`0011_booking_foundation.sql`), appended Zite 18-psychologist backfill SQL, migrated local DB (`26` tables, `18` backfilled booking profiles), updated `psychologists.repository.ts`, `psychologist-self.routes.ts`, and `seed-psychologists.ts`, and verified `apps/api` tests (`150 pass, 5 skip, 0 fail`).
- [x] **Stage C: Backend Repositories, Durable Google/n8n Outbox & Separated Routes (`apps/api`)**
  - Implement `booking.repository.ts` (`pg_advisory_xact_lock` + 15-min buffer overlap check, attribution SQL aggregation, Clinical Privacy Wall isolation).
  - Implement `booking-outbox.ts` (`FOR UPDATE SKIP LOCKED`, exponential backoff, Header-Aware direct Google Sheets REST API v4 `A:AC` + Gmail API dispatch, optional HMAC n8n webhook fallback, unredacted Column J operational parity).
  - Implement separated `booking-public.routes.ts` & `booking-admin.routes.ts`, wire into `apps/api/src/app.ts` & `index.ts`, test live append against dev Sheet `1FbwNgk75tRHK299woCw57Oye57d2pyrwgVED1oCRzgc` (`ATT-TEST-002` / row #165), and verify with `bun test`.
- [x] **Stage D: Public `/booking` UI & Global Attribution (`apps/web`)**
  - Add root `captureAttribution()` in `apps/web/src/App.tsx`.
  - Implement `apps/web/src/features/booking/*` (attribution, plain-`fetch` service, `timezone-data.ts`, `booking-i18n.ts`, Framer Motion `INTERACTIVE_SPRING` UI components integrating `matchPsychologists` and `detectCrisisKeywords` crisis banner) and `apps/web/src/pages/BookingPage.tsx` (Meta Pixel `Lead` dedup + `?psychologist=` / `?concern=` / `?mode=` query pre-fill).
- [ ] **Stage E: Public CTA Cutover & Caddy Redirect (Deferred Pending CEO Sign-Off)**
  - Public CTA buttons, `FREE_SESSION_BOOKING_URL`, `PublicLayout.tsx` `?intake=true` modal, and `deploy/Caddyfile` kept on `https://booking.attentiveid.com` until CEO go-ahead (while `/booking` and `/dashboard/bookings` remain mounted and active).
- [x] **Stage F: Portal `/dashboard/bookings`, Psychologist Schedule/Rates CMS & Final Verification + Local Commit**
  - Add `/dashboard/bookings` (`BookingsCmsPage.tsx`) for `admin`/`superadmin` (operational booking queue, confirmation slot + overlap error display, outbox retry, CSV export, Attribution Report tab).
  - Extend `PsychologistsCmsPage.tsx` (Tab 3) and `PsychologistProfileSelfPage.tsx` with rates, branch availability booleans, and Mon–Sun schedule editor with live `parseDaySchedule` preview; update `map-data.ts`.
  - Run full tests (`bun test packages/shared/`, `apps/api` `bun test`, `bun run test:web`, `bun run lint`, `bun run build`, `verify-runtime-config.sh`), rebuild `code-review-graph`, harvest lesson under `.docs/common-issues/`, and create local commit on `feat/booking` (NO `git push`).
