# Task: Attentive Product Dashboard — Phase 1 Public Services Catalog & Server-Authoritative Booking Bridge

> **Branch:** `feat/product-dashboard`
> **Workspace:** `/Users/kytama/Projects/Neo-Attentive/attentiveid-product-dashboard`
> **Strategy:** Option C (Phase 1 Only) — PostgreSQL public catalog + physical table isolation (`service_public_prices` only; zero `fee`/`biaya`/`Historis`/`Usulan`/`asumsi`/`marginThreshold`) + standalone `/services` & `/services/:slug` pages with Navy Topbar + server-authoritative `/booking` bridge.
> **Header CTA Decision:** Keep `SiteHeader.tsx` primary CTA at `https://booking.attentiveid.com/` (honoring CEO hold in `map-data.ts`); activate `Our Services` link to `/services`.

---

## Action Items

- [x] **1. Shared Domain Contracts & Recommender (`packages/shared`)**
  - Create `packages/shared/src/services.ts` with service/variant/program enums, TypeBox DTO schemas (`additionalProperties: false`) including `appliesNewClientFee` and `serviceType` (`'layanan' | 'addon'`), and deterministic rule-based chooser (`SERVICE_ASSISTANT_FLOW`, `matchServicesForNeed`, `scoreServiceAssistantQuery` with `detectCrisisKeywords` integration).
  - Update `packages/shared/src/booking.ts` and `packages/shared/src/index.ts` to support optional `serviceSlug` / `variantSlug` validation and `serviceLabel` / `variantLabel` in WhatsApp messages.
  - Add unit tests in `packages/shared/src/services.test.ts` and `packages/shared/src/booking.test.ts`.

- [x] **2. PostgreSQL Schema, Drizzle Migration, Seed & Runtime Runner (`apps/api/src/db` + deploy guards)**
  - Extend `apps/api/src/db/schema.ts` with normalized public service catalog tables (`serviceCategories`, `serviceSubgroups`, `services` with `appliesNewClientFee`, `serviceVariants`, `servicePublicPrices`, `servicePrograms`, `serviceProgramPrices`, `servicePsychologists`, `serviceDeliverables`, `serviceFaqs`, `serviceReferences`, `serviceReferenceLinks` + translation tables), extend `mediaAttachments` (`serviceId`), and extend `bookings` (`serviceId`, `serviceVariantId`, `serviceNameSnapshot`).
  - Create `apps/api/drizzle/0012_public_services_catalog.sql` + journal entry, and update `apps/api/src/db/schema.test.ts`.
  - Convert prototype card & report images to lowercase `.webp` in `apps/web/public/media/services/` (`cards/` + `reports/`) with explicit pixel dimensions.
  - Create `apps/api/src/db/seed-services.ts` filtering only `Published + Public + !archived` products & variants (preventing `v-acm-x` orphan prices), mapping `pr-dwi -> nichi`, `pr-niputu -> mayda`, `pr-anggita -> gita`, `pr-diptya -> ratri`, `pr-putri -> dewinta`, `pr-risky -> dinda`, `pr-jeanete -> jean`, `pr-riskia -> kia`, `pr-anggriana -> anggun`, linking `konseling-anak` to `gisella` & `anggun`, linking `haykal` to his `fixed_variant` services, and setting `appliesNewClientFee: true` solely on `konseling-dewasa`.
  - Wire `seed-services` build/script/guard in `apps/api/package.json`, `apps/api/Dockerfile`, `compose.production.yml`, and `scripts/ci/verify-runtime-config.sh` (never called in `deploy.sh`).

- [x] **3. Backend Repositories, Public Endpoints, Sitemap & Booking Bridge (`apps/api`)**
  - Create `apps/api/src/repositories/services.repository.ts` with explicit column projection, WIB active promo calculation, live `psychologist_profiles` min/max derivation for `psychologist_rate`, and `haykal` (`onlineRate/offlineRate: null`) preservation on `fixed_variant` services.
  - Expose `GET /api/content/services` and `GET /api/content/services/:slug` in `apps/api/src/routes/public-content.ts` & wire in `apps/api/src/app.ts` + `apps/api/src/index.ts`.
  - Update `apps/api/src/repositories/booking.repository.ts` & `apps/api/src/services/booking-outbox.ts` for server-authoritative `serviceSlug`/`variantSlug` resolution, `appliesNewClientFee`-gated `BOOKING_ASSESSMENT_FEE`, `fixed_variant` baseRate authority (including `haykal` without counseling rates), and service/variant labels in admin outbox emails.
  - Update `apps/api/src/services/sitemap.ts`, `apps/api/src/routes/sitemap.routes.ts`, and `apps/api/src/routes/sitemap.routes.test.ts` to include `/services` and published `/services/:slug` (`serviceType = 'layanan'`).
  - Add `apps/api/src/routes/services-public-security.test.ts` and update `booking.routes.test.ts` & `public-content.test.ts`.

- [x] **4. Frontend Standalone Services Pages, Header Activation, Chooser & Booking Bridge (`apps/web`)**
  - Activate `Our Services` -> `<Link to="/services">` in `SiteHeader.tsx` (desktop & mobile) while keeping primary header CTA at `https://booking.attentiveid.com/`, and update `apps/web/tests/homepage.test.tsx`.
  - Create `apps/web/src/features/services/service.ts` (`fetch()`-based), `ServiceTopbar.tsx` (navy masthead ala prototype with `ID/EN` toggle & Assistant trigger), `ServiceAssistantModal.tsx` (in-memory only + crisis guard), `ServicesPage.tsx` (`/services`, hiding `type === 'addon'` from main cards), and `ServiceDetailPage.tsx` (`/services/:slug`, variant/psychologist pickers, report preview lightbox, DOI references, `/booking` bridge).
  - Update `apps/web/src/pages/BookingPage.tsx`, `BookingForm.tsx`, `PsychologistPicker.tsx`, and `apps/web/src/features/booking/service.ts` to prefill `service` + `variant`, gate `BOOKING_ASSESSMENT_FEE` via `appliesNewClientFee`, handle `fixed_variant` Step 3 (auto-default `recommended` when no `eligiblePsychologists`, preserve fixed `baseRate` without overwriting from psychologist counseling rates), and register standalone `/services` & `/services/:slug` routes in `apps/web/src/App.tsx`.
  - Add frontend tests (`apps/web/tests/services-pages.test.tsx` + `booking-page.test.tsx` updates).

- [x] **5. Verification, Graph Update & Lesson Harvest**
  - Run `bun test packages/shared`, `bun test apps/api/...`, `bun --cwd apps/web run test`, `bun run lint`, `bun run build`, and `bash scripts/ci/verify-runtime-config.sh`.
  - Rebuild `code-review-graph` (`build_or_update_graph_tool`), mark all `tasks/todo.md` items complete, and harvest any lessons learned under `.docs/`.

---

# Phase 2 & Phase 3: Cognitive Demos + AAA-50 + Superadmin Internal Product & Financial Dashboard

> **Scope Confirmed by User:** Phase 2 + Phase 3 Core (excluding QR Generator, Assistant Rule Editor, Settings Editor, Backup JSON).
> **Role Boundary:** Strict **`superadmin`-Only** (`requireRole(['superadmin'])` on API + `allowedRoles={['superadmin']}` in UI).
> **Preview Mode:** `/dashboard/services` + superadmin-only **Mode Demo Internal** toggle on `/services` & `/services/:slug` backed strictly by authenticated `/api/admin/services/preview-catalog` (public `/api/content/services` stays isolated to 26 Published+Public services with zero fee/biaya/draft leakage).

## Phase 2 & 3 Action Items

- [x] **6. Shared Cognitive Demo Engine, AAA-50 Dataset & Internal Service Contracts (`packages/shared`)**
  - Extract bilingual 50-question AAA-50 questionnaire (`packages/shared/src/aaa50-data.ts`) & build pure deterministic AAA-50 + Cognitive Task (`cpt`, `sst`, `nb`, `gng`) engines (`packages/shared/src/cognitive-demo.ts`).
  - Extend `packages/shared/src/services.ts` (`demoConfig` public field on `PublicServiceSummarySchema`/`PublicServiceDetailSchema`) and create `packages/shared/src/services-internal.ts` (`InternalServiceItem`, `InternalCostRecord`, `ServiceDataIssue`, `computeMargin`, CSV export sanitization, request/response schemas).
  - Add unit tests in `packages/shared/src/cognitive-demo.test.ts` and `packages/shared/src/services-internal.test.ts`.

- [x] **7. Isolated Internal Schema, Migration `0013` & Full 53-Product + 351-Record Seed (`apps/api/src/db`)**
  - Extend `apps/api/src/db/schema.ts` with `services.demoConfigJson`, `serviceInternalCosts` (physical financial isolation for `fee`/`biaya`/`usulan`/`historis`), `serviceDataIssues`, `serviceOpsSettings`, and `serviceAuditLogs`, plus `0013_internal_services_ops.sql`.
  - Add `seed-services-internal-data.ts` (27 non-published/internal/archived services + missing categories/subgroups + all prototype `fee`/`biaya`/`historis`/`usulan` price records + 38 `dataIssues` + `marginThreshold`/`asumsi` defaults) and extend `seed-services.ts` idempotently.
  - Update `schema.test.ts` and `seed-services.test.ts`.

- [x] **8. Backend Superadmin Services API & Security Isolation (`apps/api`)**
  - Create `apps/api/src/repositories/services-internal.repository.ts` (full 53-product overview, margin computation, product/variant CRUD, `service_internal_costs` ledger + `setBerlaku` history promotion, program CRUD, psychologist rate/service matrix edits, data issue resolution, superadmin preview catalog projection, CSV export).
  - Update `apps/api/src/repositories/services.repository.ts` to project `demoConfig` cleanly on published services (still strictly excluding unpublished/internal rows and never touching `service_internal_costs`).
  - Create `apps/api/src/routes/services-admin.routes.ts` gated by `requireRole: 'superadmin'`, wire into `apps/api/src/app.ts`, and add `services-admin.routes.test.ts` (asserting 401/403 for unauthenticated/`admin`/`psychologist`, full superadmin CRUD, and zero leakage on public endpoints).

- [x] **9. Frontend Phase 2: 4 Cognitive Tasks + AAA-50 + `/services/demo` + Header Dropdown (`apps/web`)**
  - Build `CognitiveTaskModal.tsx` (`cpt`, `sst`, `nb`, `gng` interactive 30s drills + adaptive SST staircase + keyboard/touch controls + simulated report lightbox), `Aaa50Modal.tsx` (in-memory only 50-question flow, explicit clear + unmount auto-purge, WhatsApp handoff), and `ServiceDemoPage.tsx` (`/services/demo` & `/services/:slug/demo`).
  - Update `ServiceDetailPage.tsx`, `ServicesPage.tsx`, `ServiceTopbar.tsx`, `SiteHeader.tsx` (upgrade `Our Services` into accessible dropdown linking to `/services`, `/services/demo`, and guided recommender, while keeping CTA at `https://booking.attentiveid.com/`), and `App.tsx` (exclude attribution/analytics on `/services/demo*` routes).

- [x] **10. Frontend Phase 3: Superadmin `/dashboard/services` + Mode Demo Internal Toggle (`apps/web`)**
  - Build `apps/web/src/features/services-admin/api.ts` and `apps/web/src/pages/dashboard/ServicesCmsPage.tsx` (Overview & margin <30% alerts, All 53 Products + Slide-over Product Editor Drawer, Harga/Fee/Margin ledger, Promo Programs CRUD, Psychologist Matrix, 38 Data Issues resolution, CSV export, and 1-click "Buka Mode Demo Internal").
  - Register `/dashboard/services` in `App.tsx` with `ProtectedRoute allowedRoles={['superadmin']}` and `DashboardLayout.tsx` nav entry (`user?.role === 'superadmin'`).
  - Add superadmin-only **Mode Publik (26) / Mode Demo Internal (53 + Fee/Margin)** toggle in `ServicesPage.tsx` and `ServiceDetailPage.tsx` backed by `/api/admin/services/preview-catalog`.
  - Add component & integration tests (`services-phase2-phase3.test.tsx`, `homepage.test.tsx`, `services-pages.test.tsx`).

- [x] **11. End-to-End Verification, Local DB Migrate+Seed, Graph Rebuild & Lessons**
  - Run full unit/integration tests (`packages/shared`, `apps/api`, `apps/web`), `bun run lint`, `bun run build`, `verify-runtime-config.sh`.
  - Apply migrations `0012` + `0013` and seed local Postgres so `/` + `/services` + `/services/demo` + `/dashboard/services` are immediately live for team demo.
  - Rebuild `code-review-graph`, mark `tasks/todo.md` done, harvest lessons to `.docs/`.
