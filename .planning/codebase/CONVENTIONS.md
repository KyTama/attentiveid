# 📏 Code Style & Coding Conventions

> **Focus:** Code style, naming standards, code structure, language patterns, formatting, and error handling.  
> **Updated:** 2026-06-28  
> **Status:** Active  
> **Phase:** 1 (MVP)

---

## 1. Code Style & Language Rules

The codebase utilizes TypeScript across all services to guarantee type safety and clear developer interfaces.

*   **Language Standard:** TypeScript `~5.9.3` (Web) / `latest` (API) running on Bun.
*   **Compilation Strictness:** `strict` mode is enabled globally in both applications.
    *   No implicit `any` allowed.
    *   Strict null checks are active (`strictNullChecks: true`).
    *   Unused local variables and parameters are prevented (`noUnusedLocals: true`, `noUnusedParameters: true`).
*   **Imports & Modules:**
    *   ES Modules format (`import` / `export`) is used exclusively.
    *   Path aliases (`@/*` resolving to `./src/*` and `@api/*` to `../api/src/*`) are configured to keep import paths clean and root-relative.
    *   `verbatimModuleSyntax: true` is enforced in the frontend build pipeline.

---

## 2. Naming Conventions

Consistent naming makes codebases easy to traverse. The following standards are enforced:

### Files and Directories
*   **React Components:** PascalCase (e.g., [LandingPage.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/pages/LandingPage.tsx), [Navbar.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/common/Navbar.tsx)).
*   **Source Files / Scripts:** camelCase for helper/utility files (e.g., [api.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/lib/api.ts), [config.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/i18n/config.ts)).
*   **Asset / Data Files:** camelCase (e.g., [psychologists.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/data/psychologists.ts)).
*   **Directory Names:** camelCase (e.g., `components`, `hooks`, `locales`).

### Code Identifiers
*   **React Components / Functions:** PascalCase (e.g., `export function Hero()`).
*   **Variables, Functions, Hook Names:** camelCase (e.g., `const [isVisible, setIsVisible] = useState(true)`).
*   **Types & Interfaces:** PascalCase (e.g., `export type App = typeof app;`).
*   **Configuration & Constants:** UPPER_SNAKE_CASE (e.g., `NAV_ITEMS`, `WHATSAPP_NUMBER`).

---

## 3. Architecture & Organization

The codebase is structured as a monorepo utilizing native **Bun Workspaces**.

```
attentiveid/
├── apps/
│   ├── api/                   # Bun-native ElysiaJS Backend API
│   │   ├── src/
│   │   │   └── index.ts       # Server configuration and routes
│   │   └── package.json
│   └── web/                   # React 19 SPA (Vite + Tailwind v4)
│       ├── src/
│       │   ├── assets/        # Shared images and SVG declarations
│       │   ├── components/    # Common UI elements and landing sections
│       │   ├── data/          # Mock data structures and helper utilities
│       │   ├── hooks/         # Custom React hooks (e.g., intersection observer)
│       │   ├── i18n/          # Internationalization translations (en, id)
│       │   ├── lib/           # Treaty API client and styling utility
│       │   ├── pages/         # High-level page components
│       │   └── main.tsx       # SPA mount entry point
│       └── package.json
├── packages/                  # Reserved for shared package modules
└── package.json               # Workspace root
```

---

## 4. Formatting, Linting & Style Rules

Uniform formatting is maintained through automated tools rather than manual review.

*   **Linting:** Flat configuration style is adopted in ESLint (`eslint.config.js`). It extends recommended configs:
    *   `js.configs.recommended`
    *   `tseslint.configs.recommended`
    *   `reactHooks.configs.flat.recommended`
    *   `reactRefresh.configs.vite`
*   **JSX / React Guidelines:**
    *   Functional components with explicit, named exports (avoid `export default` for page components and standard UI elements; default exports are permitted for entry points like [App.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/App.tsx) and [i18n/config.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/i18n/config.ts)).
    *   Do not leave dead console lines (`console.log`) in frontend components, except for framework entry logging.
*   **Styling (Tailwind CSS v4):**
    *   Tailwind utility classes are applied directly in JSX components.
    *   For conditional and overlapping classes, the styling merge utility `cn` located in [utils.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/lib/utils.ts) is mandatory. It wraps `clsx` and `tailwind-merge`.
    *   Example:
        ```typescript
        className={cn(
            'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
            isVisible ? 'translate-y-0' : '-translate-y-full',
            isAtTop ? 'bg-transparent' : 'bg-background/95 backdrop-blur-sm'
        )}
        ```

---

## 5. React & Frontend Design Conventions

*   **React version:** React `19.2.x` utilizing modern rendering behaviors.
*   **Type-Safe APIs:** Eden Treaty (`@elysiajs/eden`) acts as the RPC client bridging frontend fetches and Elysia endpoint types. Direct Axios or fetch calls are discouraged in favor of `api.[route].get()` constructs.
*   **Internationalization (i18n):**
    *   Hardcoded text strings in UI components are forbidden. All user-facing strings must be extracted into translations.
    *   Locales live in translation resource files: [en.json](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/i18n/locales/en.json) and [id.json](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/i18n/locales/id.json).
    *   Default fallback locale is Indonesian (`id`), matching the primary deployment target market.
    *   Usage utilizes the `useTranslation` hook:
        ```typescript
        const { t } = useTranslation()
        return <h2>{t('contact.title')}</h2>
        ```

---

## 6. Elysia & Backend API Conventions

*   **Elysia version:** ElysiaJS `^1.2.0` running natively on Bun.
*   **Self-Documenting REST:** Every endpoint must specify swagger tags, summaries, and details in order to keep OpenAPI/Swagger schemas accurate.
    ```typescript
    .get('/health', () => ({ status: 'healthy' }), {
        detail: {
            tags: ['Health'],
            summary: 'Health check',
            description: 'Returns the health status of the API',
        },
    })
    ```
*   **CORS Safeguards:** CORS origin settings must read `FRONTEND_URL` environment variables with local fallback options to prevent deployment mismatches.

---

## 7. Error Handling & Validation

*   **Runtime Failures:** Standard error fallback structures must be utilized.
*   **API Client Responses:** Eden Treaty returns typed objects wrapping `{ data, error, status }`. Codes must explicitly check `.error` objects:
    ```typescript
    const { data, error } = await api.health.get()
    if (error) {
        console.error(`API Error (${error.status}):`, error.value)
        // trigger UI fallback
    }
    ```
*   **Database Constraints:** When connecting to PostgreSQL database connections in subsequent phases, database operations should implement transactions for state mutations with generic handler hooks.
