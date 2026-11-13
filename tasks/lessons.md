# Lessons Learned & Engineering Patterns

## 1. Monorepo Test Runner Segregation
- **Problem**: Running `bun test` from the root directory attempts to run `apps/web` Vitest tests using Bun's native test runner, which fails due to root `tsconfig.json` path alias `@/* -> ./apps/api/src/*`.
- **Solution**: Segregate runners explicitly:
  - Frontend (React / DOM / Vitest): `bun --cwd apps/web test`
  - Backend (Elysia / Bun Native): `bun test apps/api/src/routes/...`
- **Rule**: Never run blind root `bun test` for React components that rely on jsdom and `@vitejs/plugin-react` transforms.

## 2. Shared Content Type Boundaries
- **Problem**: Using `any` on API responses (`data.article as any`) triggers `@typescript-eslint/no-explicit-any` and loses end-to-end type safety between API TypeBox schemas and React page components.
- **Solution**: Define explicit interfaces (`ArticleDetailData`, `ArticleListItem`, `ArticleCmsItem`) that mirror the API Drizzle schemas and share them or import them cleanly.

## 3. Zero CLS on Dynamic Content Cards
- **Problem**: Article listings fetching asynchronous cards cause Cumulative Layout Shift (CLS) if image containers lack explicit aspect ratios or skeleton placeholders.
- **Solution**: Enforce `aspect-[16/9] w-full object-cover` on all image thumbnails and use matching skeleton loaders while data is fetching.

## 4. Resilient Context Hook Defaults in Component Unit Tests
- **Problem**: Calling a context hook like `useIntakeModal()` directly in isolated sub-components crashes unit tests with `must be used within an IntakeModalProvider` when components (`Homepage`, `PsychologistProfileDetails`) are tested in isolation.
- **Solution**: Provide a safe no-op `defaultContext` fallback in `useIntakeModal()` so components render safely in any test or preview harness, while full interactivity activates whenever `IntakeModalProvider` is present.

## 5. Derived State vs Effect Cascades in Modals
- **Problem**: Synchronously updating state inside `useEffect` on prop change triggers `react-hooks/set-state-in-effect` lint errors and unnecessary re-renders.
- **Solution**: Derive effective values (e.g. `effectivePsychologistId`, `effectiveIsCrisis`) directly via `useMemo` from current inputs, and use composite keys (`key={`${isOpen}-${options.concernId}`}`) on the modal wrapper to ensure clean mount state.

## 6. Design Token Inversion: `text-primary-foreground` vs `text-primary` / `text-secondary`
- **Problem**: In shadcn/Tailwind design tokens, `--color-primary-foreground` is white (`#ffffff`), intended exclusively for contrast against filled `bg-primary` (#d6a74d) elements. Applying `text-primary-foreground` to active state text on light/cream surfaces causes text to vanish into pure white.
- **Solution**: For active/highlighted labels on light backgrounds, apply `text-secondary font-bold`. Reserve `text-primary-foreground` strictly for elements with solid `bg-primary` fills.

## 7. Operational Status Preservation & Referential Integrity for Clinical Staff
- **Problem**: When clinical practitioners resign or pause practice (e.g., Riskia Murad), hard-deleting their row from the database destroys foreign key integrity (`ON DELETE RESTRICT`) against historical consultation records, clinical session notes, and audit logs.
- **Solution**: Never delete clinical practitioners. Preserve them using lifecycle states (`status: 'inactive'`, `accepting_new_clients: false`). In public directory queries and intake matching engines, filter strictly by `status = 'active' AND accepting_new_clients = true`. In integration tests, assert query result lengths against `count(*) FILTER (WHERE status = 'active')` rather than total table rows.



## 8. Studio Portrait EXIF Orientation & Aspect Ratio Uniformity
- **Problem**: Raw camera portraits often contain EXIF orientation tags (e.g. Orientation 6, 90° CW) that raw conversion tools (`cwebp`) ignore, causing images to display sideways. Furthermore, mixing landscape thumbnails (`aspect-[4/3]`) with portrait showcases (`aspect-[4/5]`) creates awkward facial crops, while using a real person's photo as a fallback placeholder causes confusion.
- **Solution**:
  1. Inspect and rotate raw camera JPEGs using `sips -r 270` (90° CCW) and crop them to exact 4:5 proportions (`3376x4220` down to `600x750`) before webp conversion, eliminating all squish/stretch distortion.
  2. Standardize all practitioner visual assets in `apps/web/public/media/psychologists/` to 600x750 (4:5).
  3. Keep carousel thumbnails in `FeaturedPsychologists.tsx` in matching portrait `aspect-[4/5]` rather than landscape `aspect-[4/3]`.
  4. Generate a brand-aligned, gender-neutral editorial illustration profpic (sage green, cream, terracotta) for missing or invalid portrait assets (`default.webp`, `nuzul.webp`), and accurately track `readinessStatus: 'NEED_PHOTO'` in operational databases.

## 9. Unique Constraint Idempotency During Sequence Reordering in PostgreSQL
- **Problem**: When changing sequential display ranks (`featured_order`) in a table with a unique constraint (e.g., promoting Dr. Haykal to `featured_order: 0`), row-by-row `ON CONFLICT DO UPDATE` queries fail with `duplicate key value violates unique constraint "psychologists_featured_order_unique"` because earlier rows still hold the target rank until the loop reaches them.
- **Solution**: Within the transactional seed operation, execute `resetFeaturedOrders()` (temporarily clearing `featured = false, featuredOrder = null` in compliance with check constraint `psychologists_featured_order_consistent`) before applying the new sequence from fixtures. This guarantees ACID rollback safety while allowing arbitrary practitioner reordering without constraint collisions.

## 10. Tailwind v4 Dark Mode Isolation & Pure Light Theme Guard
- **Problem**: In Tailwind CSS v4, default setup listens to OS-level `@media (prefers-color-scheme: dark)`. When a user operates macOS in Dark Mode, dashboard elements containing `dark:` variants inadvertently trigger high-contrast dark styles, clashing with the brand's warm clinical aesthetic. Furthermore, mixing loosely-typed form handlers with `any` creates silent runtime bugs on state transitions.
- **Solution**:
  - Enforce explicit light theme root locking and disable unintended OS dark-mode overrides in core layout wrappers.
  - Eliminate all `any` usages in dashboard form handlers, replacing them with strict type unions matching schema models.

## 11. CSS Flexbox/Grid Track Containment & Unbounded String Blowout in Responsive Carousels
- **Problem**: When rendering data with variable-length text (e.g. detailed professional licenses like `Peneliti & Konsultan Psikologi Sosial (Non-Klinis)` or `Lulusan Baru Profesi UI (Proses SIPP/STR)`), missing `min-w-0` on CSS flex and grid ancestor containers causes them to fall back to `min-width: auto`. This prevents child text from truncating or wrapping within the mobile viewport width (e.g. 360px–440px), forcing the entire carousel slide card to expand beyond 100vw. As a consequence, `mx-auto` on the photo calculates centering relative to the oversized card (shifting the photo rightward/off-center), and the right edge of text and CTAs gets clipped by the carousel's `overflow-hidden` viewport.
- **Solution**:
  1. Enforce `min-w-0` and `w-full` on all levels of the carousel slide hierarchy (`CarouselItem`, card root, details column, and badge flex containers).
  2. Use `break-words leading-snug` with `items-start` on badge labels rather than relying on uncontained truncation, allowing lengthy descriptions to wrap cleanly onto two lines without blowing out container width.
  3. Ensure headings and titles include `break-words` and scale fluidly (`text-2xl sm:text-3xl lg:text-4xl`) for long multi-word practitioner names.

  1. Scope dark variants explicitly in CSS: `@custom-variant dark (&:where(.dark, .dark *));`. This ensures dark classes only apply when an ancestor explicitly possesses the `.dark` class, eliminating OS-driven style leaks.
  2. In internal portals (Dashboard/Admin/Psychologist CMS), systematically replace disparate `dark:` utility classes with warm light clinical tokens (`#FEFAF6` canvas, pure white card containers, slate typography, teal accents).
  3. Strongly type all CMS API responses and mutation payloads (`AdminPsychologistItem`, `LandingCmsData`, `LandingSection`) to eliminate `@typescript-eslint/no-explicit-any` and ensure clean Vite production builds (`tsc -b`).

## 11. Drizzle ORM Migration Journaling & Seed Upsert Synchronization
- **Problem**: When adding new schema columns (such as `short_bio` in `psychologist_profile_translations`), manually creating a `.sql` file without registering it via `drizzle-kit generate` leaves `drizzle/meta/_journal.json` out of sync. As a result, `drizzle-orm/migrator` silently skips the unindexed SQL file during `migrate()`, causing Postgres runtime errors: `column "short_bio" does not exist`. Furthermore, seed scripts that check `count(*)` will skip updating existing rows if records already exist.
- **Solution**:
  1. Always run `drizzle-kit generate` to let Drizzle maintain `meta/_journal.json` and snapshot integrity (`0005_snapshot.json`).
  2. Execute `migrate.ts` against the live target database (`attentiveid`).
  3. Run seed scripts with `--force` or `--upsert` (e.g. `bun src/db/seed-psychologists.ts --force`) so existing relational rows receive the newly migrated column values.

## 12. CI/CD Sudo Privilege Boundary & Production Hardening Protocol
- **Problem**: Granting unrestricted `sudo ALL` to automated CI/CD deployment accounts creates severe security vulnerabilities (remote arbitrary code execution via compromised runner tokens / supply-chain scripts) and causes silent operational breakage (*file ownership pollution* where files generated as root cause runtime `EACCES: permission denied` for non-root application daemons).
- **Solution**:
  1. **Staging Velocity Phase**: If temporary sudo is granted to unblock initial CI/CD plumbing, isolate it strictly in `/etc/sudoers.d/99-temp-<user>` with `0440` permissions, validate via `visudo -cf`, and never touch `/etc/sudoers` directly.
  2. **Audit Extraction**: Post-deployment, inspect `/var/log/auth.log` or `/var/log/secure` for `COMMAND=` entries to isolate the exact binaries invoked by the runner.
  3. **Ownership Normalization**: Check and normalize app directories using `find <app-dir> -user root` and `chown -R <deployer>:<deployer>`.
  4. **Production Hardening**: Replace unrestricted rules with explicit command whitelists or Unix group memberships (`usermod -aG docker <user>`). Never deploy unrestricted sudo to production environments. Reference runbook: `.docs/guides/ci-cd-sudo-and-prod-hardening.md`.

## 13. Seed Fixture Evolution & Exact Assertion Coupling in Integration Tests
- **Problem**: When updating or enriching canonical practitioner fixtures (e.g., adding Brainspotting credentials to Gisella Tani Pratiwi), existing integration test assertions that check search queries with exact arrays (e.g., `expect(psychologists.map(({ slug }) => slug)).toEqual(['gita'])`) fail in CI because the query legitimately returns all active matching practitioners (`['gita', 'gisella']`).
- **Solution**: Always audit integration tests when enriching canonical seed fixtures. Update exact match assertions to reflect the complete set of matching fixtures in alphabetical order, or use subset assertions (`toContain`) when testing modality matching in isolation.

## 14. JSX Inline Sibling Whitespace Collapsing & Accessible Name Testing
- **Problem**: When rendering adjacent inline JSX elements (e.g. `<span className="font-bold">{psychologist.nickname}</span>` and `<span ...>{t(supportArea)}</span>`) without an explicit whitespace literal `{' '}`, JSX collapses them into a single string in the DOM (`"JeanetteAdult clinical"`). Accessible name queries like `getByRole('button', { name: /jeanette adult clinical/i })` fail because the expected word boundary space is absent.
- **Solution**: Always insert an explicit `{' '}` between adjacent inline text elements when they represent distinct words, or assign an explicit `title` or `aria-label` attribute on the interactive parent element.

## 15. CTA Hierarchy & Test Role Uniqueness Across Layout Boundaries
- **Problem**: When elevating or adding action buttons in page views (e.g., promoting consultation intake in `PsychologistProfileHero`), standard Testing Library queries like `screen.getByRole('button', { name: /plan a consultation session/i })` fail with `Found multiple elements with the role "button"` because global layout components (`SiteHeader`) and bottom booking sections simultaneously render buttons with identical accessible names.
- **Solution**:
  1. In route and page tests where layout headers and page bodies coexist, use `screen.getAllByRole('button', { name: ... })` with length assertions (`toBeGreaterThanOrEqual(1)`) or scope queries to semantic landmarks (`within(screen.getByRole('main')).getByRole(...)`).
  2. Pair global accessible name assertions with unique section-specific anchors (e.g., asserting `screen.getByRole('link', { name: /get to know syazka/i })` with `href="#profile-story"`) to conclusively prove the hero component rendered correctly without ambiguity.

## 16. PostgreSQL Enum Migrations & Junction Table Seed Replacement
- **Problem**: When changing an entity's category to a newly introduced enum value in a junction table with composite unique constraints (e.g. `(psychologist_id, position)`), two issues arise:
  1. PostgreSQL enums are static in the DB and reject values added only in TypeScript code without an explicit `ALTER TYPE ... ADD VALUE` migration.
  2. Drizzle's `onConflictDoUpdate` targeting `[psychologist_id, support_area]` fails because the changed category triggers an `INSERT` rather than an `UPDATE`, colliding with existing rows at `position = 0`.
- **Solution**:
  1. Always generate a Drizzle migration (`0006_psychology_scientist_support_area.sql`) using `drizzle-kit generate`.
  2. Implement `deleteSupportAreas(psychologistId)` inside the seed transaction to clean out stale category links before inserting the updated ones.

## 17. Multi-Tab Form UX, Silent Browser Native Validation Blocks, & Unique Constraint Error Translation
- **Problem**:
  1. Splitting an entity form across 6 fragmented tabs forces excessive clicking, hides mandatory fields across unrendered tab DOM trees, and creates silent form submission freezes when hidden native `<input required>` elements block browser form dispatch without UI feedback.
  2. Database unique constraints (such as `psychologists_featured_order_unique` or `psychologists_slug_unique`) throw raw Postgres 500 exceptions if duplicate numbers/slugs are entered, leaving users confused.
- **Solution**:
  1. Consolidate form into 3 high-cohesion logical steps (`1. Identitas & SIP`, `2. Layanan & Keahlian`, `3. Bio & Jadwal`), keeping the photo dropzone permanently visible on the Left Column alongside the live 4:5 aspect ratio card preview.
  2. Provide a Live Required Validation Tracker Banner at the top of the form with interactive badges that let admins jump directly to any missing field in 1 click.
  3. Eliminate native `required` attributes on hidden DOM inputs, handling validation entirely through reactive state pre-flight checks with inline field highlights.
  4. Provide smart helpers: auto-generate slug, nickname, and booking URL on name input; auto-suggest the next available `featuredOrder` (`max + 1`); and offer a 1-click `⚡ Salin Semua ID ke EN` sync button and `Isi Contoh Cepat` prefill button.
  5. Intercept PostgreSQL duplicate key errors (`code: '23505'`) on the backend API and translate them into actionable 400 badRequest responses.





## 11. Dual-Declaration TypeBox & Drizzle Enum Consistency
- **Problem**: When adding a new role (e.g., `'superadmin'`) to a shared enum (`USER_ROLES`), updating `const USER_ROLES = [...]` is not enough if TypeBox schemas (`UserRoleSchema = Type.Union([...])`) and JWT payload validators (`isJwtPayload`) are declared independently. This results in cryptic runtime 401s from `authenticateBearerToken` because `isJwtPayload` silently rejects the new role.
- **Solution**: Whenever extending a domain enum:
  1. Add migration in PostgreSQL (`ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'superadmin';`).
  2. Update TypeBox schemas (`UserRoleSchema`) and runtime guards (`isJwtPayload`, `role-guard.ts`).
  3. Ensure token issuers, refresh stores, and frontend role checks (`ProtectedRoute`, `DashboardLayout`) recognize the elevated permissions.

## 18. Dynamic Carousel Schema Design, Scroll-Container Stacking Contexts, & Adaptive Single/Multi Slide UX
- **Problem**:
  1. CSS `position: sticky` is scoped to the nearest scrolling ancestor container (`main.overflow-y-auto`). Placing a `sticky top-16` floating card inside an overflowing `main` causes scrolled content to pass through the 64px gap above the card and clip directly underneath form elements.
  2. Reusing existing repeater slots (`hero.items`) for carousel photos breaks database bounds `{ min: 3, max: 4 }` meant for bottom trust metrics.
  3. Forcing carousel chrome (counters, navigation arrows, dot indicators) when only 1 photo is configured looks amateurish and clutters the interface.
- **Solution**:
  1. Dock the control topbar edge-to-edge at `-mt-4 -mx-4 ... sticky top-0 z-20` relative to `main`, ensuring scrolled content cleanly tucks under the solid blur backdrop without clipping.
  2. Model carousel slides as a distinct array (`slides: Type.Array(LandingMediaSchema, { minItems: 1, maxItems: 10 })`) hydrated from `hero_slide` media attachments with `position` order.
  3. Adaptive carousel rendering: when `slideCount === 1`, automatically suppress counter, arrows, caption overlays, and dot indicators to deliver a clean single photograph view; when `slideCount >= 2`, smoothly activate Framer Motion spring physics (`stiffness: 350, damping: 32`), swipe navigation, auto-advance timers, and accessibility pause-on-hover controls.

## 19. Containerized Media Storage in Hardened Read-Only Environments (EROFS Prevention)
- **Problem**:
  1. In production VPS deployments (`compose.production.yml`), security-hardened containers run with `read_only: true`, dropping all capabilities (`cap_drop: ALL`) and running as non-root users (`USER bun`, UID 1000).
  2. Relative path resolutions like `path.resolve(process.cwd(), '../web/public/media/...')` fail because:
     - The `apps/web` directory does not exist in the API container image.
     - Node/Bun attempts `fs.mkdirSync('/app/apps/web/public/media/...')` against the root container filesystem, which throws `EROFS: read-only file system, mkdir '/app/apps/web'`.
  3. Even without read-only rootfs, writing files to the API container's internal filesystem prevents the web container (Caddy reverse proxy) from serving those uploaded files to clients.
- **Solution**:
  1. Centralize all media file operations in a resilient storage service (`media-storage.ts`) that reads `process.env.MEDIA_DIR`, falls back to local monorepo web public directories in dev, and falls back to writable tmpfs (`/tmp/uploads/media`) if `EROFS` occurs.
  2. Define a shared Docker volume (`attentive_media`) mounted read-write to API at `/app/apps/api/uploads/media` and read-only to Web at `/srv/media:ro`.
  3. Copy seed media assets during Docker build into `/app/apps/api/uploads/media` with `bun:bun` ownership (UID 1000) so newly created volumes initialize with seed photos.
  4. Provide native high-performance Bun static file serving in the API (`/media/*` and `/api/media/*`) using `Bun.file()` with directory traversal guards so assets are accessible through both reverse proxy paths.

## 20. Content Transitions Method Signatures & Atomic CMS Publish
- **Problem**:
  1. Method naming mismatch between routes and services: `landing-cms.ts` called `publishLandingRevision(adminCap, timestamp)` while `content-transitions.ts` only exposed `publishLandingDraft(adminCap, revisionId)`. This caused runtime `TypeError: publishLandingRevision is not a function`.
  2. If the user clicked "Publish" without saving an active draft first, or if no active draft existed (`activeDraftRevisionId: null`), publishing failed.
- **Solution**:
  1. Align service methods: support both `publishLandingDraft(adminCap, revisionId?)` and alias `publishLandingRevision(adminCap, revisionId?)`. If `revisionId` is omitted, automatically target `aggregate.activeDraftRevisionId`.
  2. Allow `POST /api/admin/landing/publish` to accept optional `body: LandingContentMutation`: if provided, create the draft and publish it atomically in one step so on-screen edits in the CMS are always published live immediately.
  3. Ensure mock dependencies in unit tests provide full function signatures so API test suites catch missing transition methods before deployment.

## 21. Deployment Seeding Clobbering Live CMS Edits
- **Problem**: Running `seed-psychologists --upsert` inside `scripts/deploy/deploy.sh` caused every automated deployment to execute `resetFeaturedOrders()`, `onConflictDoUpdate`, and `deleteSupportAreas()`, silently reverting live psychologist updates made by staff in the CMS back to hardcoded `psychologistSeedFixtures`.
- **Solution**:
  1. Remove all automatic seed runs (`seed-landing` and `seed-psychologists --upsert`) from `scripts/deploy/deploy.sh` so deployments only run `migrate`.
  2. Keep `seed-landing` and `seed-psychologists` under `profiles: [maintenance]` in `compose.production.yml` strictly for manual operator execution when needed.
  3. Add a negative CI contract check in `scripts/ci/verify-runtime-config.sh` rejecting `seed-landing`, `seed-psychologists`, `--upsert`, or `--force` in `deploy.sh`.
