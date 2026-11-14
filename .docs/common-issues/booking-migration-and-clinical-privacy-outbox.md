# Booking Migration: Clinical Privacy Wall, Slot Locks, n8n Outbox & Test Normalization

## Symptoms & Risks
1. **Clinical Intake Leakage across Admin Roles**: Storing sensitive psychological complaints (complaints, crisis/self-harm screening flags, detailed intake notes) on the main `bookings` table or leaking full clinical payloads to admin queues/n8n/Sheets violates the Clinical Privacy Wall.
2. **Double-Booking Race Conditions & Missing Session Buffers**: Concurrent public booking submissions or admin status promotions into `confirmed`/`in_session` without database serialization or inter-session buffer windows risk double-booking a psychologist at overlapping times.
3. **Synchronous n8n Webhook Coupling**: Calling n8n inline during a DB transaction causes lost bookings on webhook downtime or leaves partial commits when n8n times out; pushing unredacted intake notes into Google Sheets (`A:V`) leaks clinical PII.
4. **Vitest `@/lib/api` Global Mock & Legacy URL Rewriting**:
   - `apps/web/tests/setup.ts` globally mocks `../src/lib/api`, causing feature modules built on `@/lib/api` to fail component integration tests that stub `globalThis.fetch`.
   - Prefix-stripping legacy URLs (`booking.attentiveid.com/...`) without exact-root guards rewrites subpaths like `/enterprise` to `/booking` incorrectly.

## Root Fixes
- **Strict Table Split (Clinical Privacy Wall)**: Keep scheduling/billing/status metadata in `bookings` (with future registered-client hooks `clientUserId`, `emailNormalized`, `whatsappE164`) and isolate clinical intake details inside `booking_clinical_intakes` so `/api/admin/bookings*`, CSV exports, and n8n/Sheets rows receive only scheduling metadata (plus redacted `A:V` payload).
- **Advisory Lock + 15-Minute Buffer Overlap Check**: Wrap slot reservations and `confirmed`/`in_session` transitions in PostgreSQL transactions guarded by `pg_advisory_xact_lock` keyed per psychologist/date and reject conflicting slots (including a 15-minute buffer) with HTTP `409`.
- **Durable PostgreSQL Webhook Outbox (`booking_webhook_deliveries`)**: Enqueue webhook events transactionally with idempotency keys, HMAC signature headers, retry metadata, and manual admin retry endpoints instead of blocking booking creation on external n8n availability.
- **Native `fetch()` in Feature Services & Exact-Root Legacy Normalizers**: Use native `fetch()` in `apps/web/src/features/booking/service.ts` (aligned with `apps/web/tests/setup.ts`) and match only exact root `^https?:\/\/booking\.attentiveid\.com\/?$` when normalizing legacy CTA links so `/enterprise` and subpath URLs stay intact.
