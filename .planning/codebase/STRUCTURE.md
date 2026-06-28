# 📁 Codebase Directory Structure

> **Focus:** Full directory layout, key configurations, resource paths, and file naming conventions.  
> **Updated:** 2026-06-28  
> **Status:** Active  
> **Phase:** 1 (MVP)

---

## 1. Directory Layout

The AttentiveId monorepo organizes its code into distinct folders targeting local applications, shared rules, and project-planning documentation. The hierarchical structure is detailed below:

```
attentiveid/
├── .agent/                    # Workspace agent tools and instructions
├── .agents/                   # Workspace-specific custom rules and configurations
├── .docs/                     # Shared principles and lesson documents
├── .planning/                 # Project documentation and specifications
│   └── codebase/              # Codebase mappings (ARCHITECTURE.md, STRUCTURE.md, STACK.md, etc.)
├── apps/                      # Monorepo applications
│   ├── api/                   # Bun-native ElysiaJS Backend API
│   │   ├── dist/              # API compilation artifacts
│   │   ├── src/               # Backend source directory
│   │   │   └── index.ts       # Backend server configuration and routes
│   │   ├── .env.example       # Backend environmental variables template
│   │   └── package.json       # Backend app package dependencies and scripts
│   └── web/                   # React 19 Frontend Web SPA (Vite + Tailwind v4)
│       ├── public/            # Static assets served as-is (e.g. SVG assets)
│       ├── src/               # Frontend source directory
│       │   ├── assets/        # Shared CSS styles, images, and visual icons
│       │   ├── components/    # Modular React components
│       │   │   ├── common/    # Navigation, layout, and utility components (e.g. Navbar)
│       │   │   ├── landing/   # Main sections of the landing page
│       │   │   └── ui/        # Atomic UI primitives from shadcn/ui
│       │   ├── data/          # Client-side static mock configurations
│       │   ├── hooks/         # Custom React hooks (e.g. useInView)
│       │   ├── i18n/          # Translation configurations
│       │   │   ├── locales/   # Localization files (en.json, id.json)
│       │   │   └── config.ts  # Translation config and initialization
│       │   ├── lib/           # Styling wrappers (utils.ts) and API RPC wrappers (api.ts)
│       │   ├── pages/         # Page containers combining components (e.g. LandingPage)
│       │   ├── App.css        # Root container styles
│       │   ├── App.tsx        # Base component root
│       │   ├── index.css      # Core Tailwind CSS configuration and theme design tokens
│       │   └── main.tsx       # Web application entry point mount script
│       ├── components.json    # shadcn/ui components manifest
│       ├── eslint.config.js   # Frontend linter rules (Flat config)
│       ├── index.html         # Base HTML document serving the web app
│       ├── package.json       # Web app package dependencies and scripts
│       ├── tsconfig.app.json  # TypeScript configuration for web app code
│       ├── tsconfig.json      # Main TypeScript configuration for web workspace
│       ├── tsconfig.node.json # TypeScript configuration for bundler runtime configurations
│       └── vite.config.ts     # Vite bundler configurations using Tailwind v4 compiler
├── packages/                  # Shared local package libraries (reserved for future shared modules)
├── package.json               # Root monorepo configuration and scripts orchestrator
├── tsconfig.json              # Root TypeScript settings
└── bun.lock                   # Bun package manager lockfile
```

---

## 2. Key Locations & Configuration Paths

### Configuration Files
- **Workspace Orchestration:** Root [package.json](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/package.json) runs development processes and coordinates mono-workspace builds.
- **Frontend Compiler:** [apps/web/vite.config.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/vite.config.ts) defines compilation paths, aliases, and Tailwind Vite plugins.
- **Typing Aliases:**
  - [tsconfig.json](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/tsconfig.json) governs global typing rules.
  - [apps/web/tsconfig.app.json](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/tsconfig.app.json) specifies path mapping for resolving `@/*` and `@api/*`.

### UI Component Collections
- **Shared UI Widgets:** Located in [apps/web/src/components/ui/](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/ui/) containing primitive elements such as buttons, inputs, sheets, and dialog overlays.
- **Section Elements:** Located in [apps/web/src/components/landing/](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/landing/) containing modular elements including Hero, Services grid, and Psychologist cards.

### Core Utilities & Mocks
- **API & Styling Helpers:** Located in [apps/web/src/lib/](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/lib/).
- **Localization Bundles:** Translators live in [apps/web/src/i18n/locales/](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/i18n/locales/) with default Indonesian configurations.
- **Static Content Fixtures:** Roster listings and data tables are managed in [apps/web/src/data/](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/data/).

---

## 3. Strict Naming Conventions

Consistency across naming matches the requirements outlined in global conventions:

### File and Directory Naming
- **React Components / Pages:** Must use **PascalCase** (e.g. `LandingPage.tsx`, `Navbar.tsx`, `Button.tsx`).
- **Source Files / Code Scripts:** Must use **camelCase** (e.g. `api.ts`, `config.ts`, `index.ts`).
- **Assets / Media / Data Files:** Must use **camelCase** (e.g. `psychologists.ts`, `testimonials.ts`).
- **Directory Paths:** Must use **camelCase** (e.g. `components`, `locales`, `pages`, `landing`).

### Code Identifier Naming
- **React Functions:** Must use **PascalCase** matching the filename (e.g. `export function Hero()`).
- **Local Variables, Hook Names, Functions:** Must use **camelCase** (e.g. `const [isVisible, setIsVisible] = useState(true)`, `const { t } = useTranslation()`).
- **TypeScript Types & Interfaces:** Must use **PascalCase** (e.g. `export type App = typeof app;`).
- **Constants & Envs:** Must use **UPPER_SNAKE_CASE** (e.g. `VITE_API_URL`, `FRONTEND_URL`, `WHATSAPP_NUMBER`).
