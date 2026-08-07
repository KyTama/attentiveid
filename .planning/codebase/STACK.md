# 💻 Technology Stack

> **Focus:** Programming languages, runtime environment, frameworks, core dependencies, and configuration.  
> **Updated:** 2026-06-28  
> **Status:** Completed  
> **Phase:** 1 (MVP)

---

## 1. Languages & Runtime Environment

The codebase is structured as a modern monorepo powered by Bun for runtime execution, package management, and bundling.

| Component | Technology | Target / Version | Purpose / Role |
|-----------|------------|------------------|----------------|
| **Runtime Engine** | [Bun](https://bun.sh) | `v1.3.4+` | Native JavaScript/TypeScript runtime, package manager, and dev server orchestration |
| **Language** | TypeScript | `~5.9.3` (Web) / `latest` (API) | Static typing, interface sharing, and compile-time type-safety |
| **Language** | JavaScript | ESNext / Node compatible | Configuration modules (e.g., ESLint config) |
| **Styling** | CSS / Tailwind | `v4.1.18` | Modern CSS styling with CSS-first custom theme tokens |

---

## 2. Monorepo & Workspace Orchestration

The project uses native **Bun Workspaces** for multi-package management.

- **Root configuration:** [package.json](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/package.json)
  ```json
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
  ```
- **Shared packages:** The folder `packages/` is reserved for future shared codebases (e.g., shared validation schemas, shared TS types).
- **Core Scripts:**
  - `bun run dev`: Runs development servers for both `apps/api` and `apps/web` concurrently.
  - `bun run build`: Triggers builds for both the Elysia API and the React Vite web app.
  - `bun run start`: Starts the compiled backend API service.

---

## 3. Backend API (`apps/api`)

The backend is built as a lightweight, high-performance API service using **ElysiaJS** running natively on Bun.

### 📦 Key Dependencies
- `elysia` (`^1.2.0`): Bun-native fast web framework.
- `@elysiajs/swagger` (`^1.2.0`): Auto-generation of OpenAPI documentation at `/swagger`.
- `@elysiajs/cors` (`^1.2.0`): Handles CORS requests from the frontend app.
- `@types/bun` (`latest`): Type declarations for Bun API.

### ⚙️ Configuration & Entrypoints
- **Entrypoint:** [apps/api/src/index.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/api/src/index.ts)
- **Local Port:** Configured via `PORT` variable (defaults to `3000`).
- **CORS Origin:** Controlled by `FRONTEND_URL` (defaults to `http://localhost:5173`).
- **Environment Template:** [apps/api/.env.example](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/api/.env.example)

---

## 4. Frontend Web SPA (`apps/web`)

The frontend client is a React 19 Single Page Application (SPA) built using Vite and styled with Tailwind CSS v4.

### 📦 Key Dependencies
- `react` / `react-dom` (`^19.2.0`): View rendering engine.
- `@elysiajs/eden` (`^1.4.5`): End-to-end type-safe RPC client linking to Elysia API endpoints using [apps/web/src/lib/api.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/lib/api.ts).
- `i18next` (`^25.7.4`) / `react-i18next` (`^16.5.3`): Translation system configured in [apps/web/src/i18n/config.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/i18n/config.ts) supporting:
  - English (`en.json`)
  - Bahasa Indonesia (`id.json` - Default/Primary)
- `i18next-browser-languagedetector` (`^8.2.0`): Custom language detection with LocalStorage caching.
- `lucide-react` (`^0.562.0`): Icon pack.
- `clsx` (`^2.1.1`) / `tailwind-merge` (`^3.4.0`): Tailwind class combination helper.
- **shadcn/ui Primitives:** Dialog, Sheet, Button, Card, Input, Label, Textarea based on Radix UI (`@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-slot`).

### ⚙️ Build and Tooling Configuration
- **Vite Bundler:** [apps/web/vite.config.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/vite.config.ts) utilizing `@tailwindcss/vite` and `@vitejs/plugin-react`.
- **CSS-First Theme Config:** Located in [apps/web/src/index.css](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/index.css) utilizing `@theme` directives for custom colors (`--color-primary: #d6a74d`, `--color-foreground: #142c52`), typography (`Josefin Sans`, `Droid Serif`), and border radiuses.
- **shadcn/ui Configuration:** Stored in [apps/web/components.json](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/components.json).
- **TypeScript Settings:** Configured via `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json` in the web application directory.
- **Linter:** [apps/web/eslint.config.js](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/eslint.config.js) using Flat config structure.
