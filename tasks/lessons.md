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
