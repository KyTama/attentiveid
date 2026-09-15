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


