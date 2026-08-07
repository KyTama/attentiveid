# 🏛️ System Architecture

> **Focus:** Architectural patterns, system layers, data flow, abstractions, and application entry points.  
> **Updated:** 2026-06-28  
> **Status:** Active  
> **Phase:** 1 (MVP)

---

## 1. Architectural Patterns

The AttentiveId system is designed around several core architectural principles to ensure scalability, ease of development, and developer velocity.

### Monorepo Pattern (Bun Workspaces)
The codebase is structured as a monorepo utilizing native **Bun Workspaces**. This approach simplifies dependency management, allows running both API and Web components concurrently during development, and provides a clear foundation for sharing types and utility packages as the application grows.

### End-to-End Type Safety (Eden Treaty)
Instead of standard JSON endpoints consumed via loosely-typed fetch or Axios calls, the codebase leverages **Elysia Eden**. Elysia exports the backend instance type (`export type App = typeof app`), which the React application imports and uses to instantiate the Eden Treaty client. This turns REST API requests into compiler-validated RPC-like method calls:
- Static typing is preserved from backend route definitions to frontend fetch operations.
- Any API route changes or parameter signature changes cause immediate compilation errors in the frontend.

### Component-Driven UI Structure
The frontend architecture relies on atomic and component-driven hierarchies:
- **UI Components:** Low-level, stateless design tokens and structural blocks (e.g., buttons, cards, dialogs) that are reusable across any page.
- **Common Components:** Shell components like headers, footers, and layout grids that are shared across high-level routing contexts.
- **Section Components:** Feature-specific layout elements (e.g., Hero, Psychologists roster) designed to act as modular sections of a single page or view.

---

## 2. System Layers

The system is organized into decoupled layers, each with strict responsibilities:

```mermaid
graph TD
    subgraph Client-Side (Vite SPA)
        UI[View Layer: React Components] -->|Uses| Hooks[State & Hooks Layer: useTranslation, useInView]
        UI -->|Interacts| Mocks[Mock Data Layer: static JSON fixtures]
        Hooks -->|Fetches| Eden[RPC Client Layer: Elysia Eden Treaty]
    end
    
    subgraph Network Boundary
        Eden -->|HTTP/JSON| CORS[CORS Guard & Middleware]
    end

    subgraph Server-Side (Elysia API)
        CORS -->|Route Dispatch| Router[API Routing & Docs Layer: ElysiaJS + Swagger]
        Router -->|Future Phase| Service[Service Layer: Business Logic]
        Service -->|Future Phase| Database[Persistence Layer: PostgreSQL]
    end
```

### 1. Presentation / View Layer (`apps/web/src/pages` & `apps/web/src/components`)
- Responsible only for rendering the user interface, responding to interactions, and binding localized text.
- Uses Tailwind CSS v4 custom theme tokens for style definitions.

### 2. State & Client Hook Layer (`apps/web/src/hooks` & `apps/web/src/i18n`)
- Manages client-side behavioral states, such as visibility observers (`useInView`) and active localization configurations (`useTranslation`).

### 3. API RPC Layer (`apps/web/src/lib/api.ts`)
- Configures the Elysia Eden Treaty client, exposing the backend type definitions natively as type-safe methods.

### 4. Middleware & Boundary Layer (`apps/api/src/index.ts` - CORS / Swagger)
- Manages security rules (CORS configurations) and registers interactive self-documenting OpenAPI schemas (Swagger integration).

### 5. API Routing Layer (`apps/api/src/index.ts`)
- Exposes REST endpoints, validates request signatures, and responds with structured data formats.

---

## 3. Data Flow

Data flows through the system in a unidirectional loop from client interactions to server responses.

### Complete Read Request Cycle
1. **User Action:** The user navigates to the page or triggers an interaction.
2. **Hook Trigger:** The React view references the translation configuration hook (`useTranslation`) or queries the RPC client (`api`).
3. **RPC Fetch:** The Eden Treaty client transforms the method invocation (e.g., `api.health.get()`) into an HTTP request directed at the API server port.
4. **Server Routing:** The Elysia router captures the request, runs CORS validation, and maps the route to the corresponding handler logic.
5. **Execution & Return:** The server constructs a response object containing metadata (e.g., health status or API endpoints info) and returns it as a JSON payload.
6. **State Resolution:** The Eden client returns a typed response wrapper `{ data, error, status }` back to the calling hook, updating the React component state and triggering a re-render.

```
[React View] ──(1. Render Hook)──> [Eden Treaty] ──(2. Type-Safe HTTP)──> [Elysia Server]
     ▲                                                                           │
     └───────────(4. Reactive UI Re-render) <─── { data, error } ◄───────────────┘
```

---

## 4. Architectural Abstractions

To decouple parts of the system and prevent implementation lock-in, the codebase incorporates the following abstractions:

### RPC Integration Boundary
The frontend refers exclusively to the exported Elysia type `App` rather than hardcoding route paths. If the backend changes a route path, TypeScript will instantly throw a compiler error on the frontend, enforcing compile-time synchronization between client and server.

### Styling & Utility Merging (`cn`)
To keep Tailwind CSS properties clean and prevent layout clashes during component composition, the system abstracts styling merges behind the [utils.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/lib/utils.ts) helper:
- Wraps `clsx` and `tailwind-merge` into a unified `cn(...inputs)` call.
- Resolves conflicts between shorthand properties (e.g., combining default paddings with conditional active styles).

### Translation Layer (i18n)
All user-facing text strings are completely abstracted away from the UI components:
- UI files consume keys via `t('key.path')`.
- Localization assets map keys to the respective target language JSON files (`en.json` and `id.json`), making content adjustments independent of application layout or React code logic.

---

## 5. Application Entry Points

The AttentiveId monorepo maps execution bootstrap configurations to specific entry points:

### Monorepo Root
- **Configuration:** [package.json](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/package.json)
  - Coordinates multi-workspace commands and builds.
  - Controls package installations across all child directories.

### Backend API Service
- **Bootstrapper:** [apps/api/src/index.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/api/src/index.ts)
  - Initializes the Elysia server instance, hooks plugins (CORS, Swagger Docs), defines root routers, and spins up the HTTP server listener.

### Frontend Web Application
- **Static Page Host:** [apps/web/index.html](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/index.html)
  - Acts as the initial target for browser navigation, loading the styling system and mounting the TSX script.
- **Application Bootstrapper:** [apps/web/src/main.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/main.tsx)
  - Initializes the React root DOM node, imports global styles, configures the internationalization plugin, and mounts the root container.
- **Root Container:** [apps/web/src/App.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/App.tsx)
  - Manages root component wrappers, provides page layouts, and renders the high-level pages.
