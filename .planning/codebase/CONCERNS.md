# ⚠️ Technical Debt, Bugs, & Areas of Concern

> **Focus:** Technical debt, active bugs, security issues, performance bottlenecks, and fragile areas in the codebase.  
> **Updated:** 2026-06-28  
> **Status:** Active  
> **Phase:** 1 (MVP)

---

## 1. Active Bugs & Layout Issues

These are logic defects, layout anomalies, or standard implementation failures that currently exist in the client or server.

### 🔴 Critical CSS Positioning Bug in Testimonials
*   **File:** [Testimonials.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/landing/Testimonials.tsx)
*   **Description:** The slide items use `absolute inset-0` to stack testimonials on top of each other. However, their immediate parent wrapper `div` (`className="text-center min-h-[200px] flex flex-col justify-center"`) is not positioned (`relative` or `absolute`).
*   **Impact:** The testimonials position themselves relative to the nearest positioned ancestor (which ends up being the entire section or outer container). This causes visual overlaps, layout breakage, or height issues when resizing screen viewports.
*   **Remediation:** Add `relative` to the parent wrapper class list.

### 🟡 Animation Delay Configuration Override
*   **File:** [AnimatedSection.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/common/AnimatedSection.tsx) & [index.css](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/index.css)
*   **Description:** The animation delay mappings use `delay-100`, `delay-200`, etc. class names to control keyframe timing. In Tailwind CSS, `delay-*` is a core utility for transition duration (`transition-delay`). Redefining these names under `@layer utilities` to target `animation-delay` is extremely fragile and collides with native Tailwind mappings.
*   **Impact:** Build issues or compiler warnings in Tailwind CSS v4, along with transition delays failing to register elsewhere in the app.
*   **Remediation:** Rename the classes to `animate-delay-100`, `animate-delay-200`, etc. and apply matching styles in the CSS.

### 🟡 Fragile i18n Language Toggle Logic
*   **File:** [LanguageSwitcher.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/common/LanguageSwitcher.tsx) & [config.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/i18n/config.ts)
*   **Description:** The helper `getCurrentLanguage()` returns `i18n.language` directly, which could be set to regional codes like `en-US` or `id-ID` by the automated detector. The switcher toggles language via:
    ```typescript
    const newLang = currentLang === 'en' ? 'id' : 'en'
    ```
*   **Impact:** If `currentLang` is `en-US`, the evaluation `currentLang === 'en'` evaluates to `false`, causing it to toggle to `en` instead of `id`, locking users in a loop or failing to switch altogether.
*   **Remediation:** Implement check via prefix `currentLang.startsWith('en')` or use `i18n.resolvedLanguage` for switching.

---

## 2. Technical Debt & Scaffolding Gaps

Issues relating to design decisions, mock setups, and code structures that limit long-term maintainability.

### 🔴 Mocked Scheduling & Reservation system
*   **File:** [psychologists.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/data/psychologists.ts) & [Contact.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/landing/Contact.tsx)
*   **Description:** The reservation feature redirects users to WhatsApp with a prefilled message query. The monorepo has no backend routing, DB setup, user profile dashboard, or session state, which makes it a simple marketing page instead of a schedule reservation application.
*   **Impact:** High manual workload for bureau administration, zero automation, and a lack of data-driven scheduling.
*   **Remediation:** Next phase must implement a SQLite/PostgreSQL schema, scheduling algorithms, and Elysia controllers for booking.

### 🟡 Dead Code / Unused Radix UI Components
*   **Files:** [input.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/ui/input.tsx), [textarea.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/ui/textarea.tsx), [dialog.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/ui/dialog.tsx)
*   **Description:** Multiple shadcn/ui components were bootstrapped during project setup but are completely unused by any landing section or page.
*   **Impact:** Inflates project directory structure, bundle size, and build overhead with useless node dependencies (`@radix-ui/react-dialog`).
*   **Remediation:** Remove components or implement them in upcoming scheduling forms.

### 🟡 Broken Router Navigation in Footer
*   **File:** [Footer.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/landing/Footer.tsx)
*   **Description:** The footer has direct anchor tags pointing to `/privacy-policy` and `/terms-conditions`. However, the app is a Single Page Application without any client-side router configured.
*   **Impact:** Clicking these links will trigger a server routing 404 or page reload failure.
*   **Remediation:** Implement React Router or Elysia static templates to serve legal assets.

---

## 3. Security Concerns

Risks associated with input validation, infrastructure leaks, or unsafe default parameters.

### 🔴 Unvalidated CORS Configuration Fallback
*   **File:** [index.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/api/src/index.ts)
*   **Description:** The CORS plugin fallback defaults to a hardcoded address:
    ```typescript
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
    ```
*   **Impact:** If `FRONTEND_URL` is misconfigured or omitted in high-level deployment environments, the backend defaults to trusting `localhost`, allowing unauthorized local test scripts to query production instances.
*   **Remediation:** Fail server start or throw errors if crucial environment configuration keys are absent or invalid.

### 🟡 Lack of Server Configuration & Schema Validation
*   **File:** [index.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/api/src/index.ts)
*   **Description:** The Elysia backend reads environment variables directly from `process.env` without validation rules.
*   **Impact:** Typos or missing environment keys will cause runtime failures that are hard to diagnose without pre-flight assertions.
*   **Remediation:** Integrate a validation layer (e.g. Typebox or Zod) to check configuration on startup.

---

## 4. Performance & Styling Bottlenecks

Areas impacting load speed, render blocking, or scroll fluidity.

### 🟡 Dynamic Font Fetch Blocking
*   **File:** [index.css](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/index.css)
*   **Description:** Fonts (`Josefin Sans` & `Droid Serif`) are loaded dynamically using a Google Fonts `@import` declaration.
*   **Impact:** This blocks CSS parsing and delays initial page paint. In poor network conditions, it causes FOIT/FOUT (Flash of Unstyled Text).
*   **Remediation:** Self-host the webp/woff2 font files in the public directory and reference them via `@font-face`.

### 🟡 Unthrottled Scroll Event Listener in Navbar
*   **File:** [Navbar.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/common/Navbar.tsx)
*   **Description:** The scrolling visibility toggle triggers updates to react state hook variables (`isVisible`, `isAtTop`, `lastScrollY`) on every single scroll tick.
*   **Impact:** Triggers frequent React re-render passes, potentially creating scroll jank on low-end hardware or high refresh-rate monitors.
*   **Remediation:** Throttle scroll events using standard lodash throttle patterns, or replace with a scroll-linked CSS variable.

---

## 5. Testing & Quality Gaps

Missing testing configurations, deployment checks, or code audit pipelines.

### 🔴 Zero Test Coverage
*   **Files:** Monorepo-wide
*   **Description:** Although [TESTING.md](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/.planning/codebase/TESTING.md) describes testing architecture, frameworks, and patterns (such as Vitest and Bun Test), there are literally no test files (`*.test.ts` or `*.spec.ts`) in the workspace.
*   **Impact:** Uncaught regressions will slip into main branches, violating the project’s high-quality code guidelines.
*   **Remediation:** Write unit tests for styling helper libraries, custom hooks, and route integration tests.
