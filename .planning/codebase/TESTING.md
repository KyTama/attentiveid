# 🧪 Testing Framework & Patterns

> **Focus:** Testing frameworks, directory structures, mocking strategies, testing levels, and coverage goals.  
> **Updated:** 2026-06-28  
> **Status:** Active  
> **Phase:** 1 (MVP)

---

## 1. Testing Frameworks

The AttentiveId monorepo maps testing frameworks specifically to each environment to maximize speed, compatibility, and simplicity.

| Workspace / Package | Framework | Rationale / Role |
|---------------------|-----------|------------------|
| **Workspace Root** | [Bun Test](https://bun.sh/docs/cli/test) / [Vitest](https://vitest.dev) | Monorepo orchestrator command running all tests |
| **Backend API (`apps/api`)** | [Bun Test](https://bun.sh/docs/cli/test) | Native test runner for Bun, zero configuration, fastest speed |
| **Frontend Client (`apps/web`)** | [Vitest](https://vitest.dev) | High compatibility with Vite configuration, ESM, and React components |
| **End-to-End (`E2E`)** | [Playwright](https://playwright.dev) | Cross-browser verification of critical scheduling and reservation workflows |

---

## 2. Structure & Directory Organization

Test files are colocated with the source code they test, ensuring high discoverability and clear component-to-test mapping.

```
apps/
├── api/
│   └── src/
│       ├── index.ts
│       └── __tests__/                 # API Route & Integration Tests
│           ├── index.test.ts          # Root routing and swagger tests
│           └── health.test.ts         # Health check tests
└── web/
    └── src/
        ├── lib/
        │   ├── utils.ts
        │   └── __tests__/             # Unit Tests for Helper Files
        │       └── utils.test.ts
        └── components/
            └── landing/
                ├── Hero.tsx
                └── __tests__/         # Component Tests
                    └── Hero.test.tsx
```

### Script Execution Configurations
*   **Root `package.json`:**
    ```json
    "scripts": {
        "test": "bun test apps/api && cd apps/web && bun run test",
        "test:coverage": "bun test --coverage apps/api && cd apps/web && bun run test:coverage"
    }
    ```
*   **Web App `package.json`:**
    ```json
    "scripts": {
        "test": "vitest run",
        "test:watch": "vitest",
        "test:coverage": "vitest run --coverage"
    }
    ```
*   **API App `package.json`:**
    ```json
    "scripts": {
        "test": "bun test",
        "test:coverage": "bun test --coverage"
    }
    ```

---

## 3. Mocking Strategy

Mocking isolates code under test and keeps test suites fast and repeatable.

### API/Network Level Mocks
*   **Eden Treaty Mocking:** When unit-testing React components that perform network interactions, mock the `@elysiajs/eden` treaty module or provide a custom wrapper.
*   **Mock data fixtures:** Share pre-defined data structures from [apps/web/src/data/](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/data/) (e.g. `psychologists`, `services`, `testimonials`) instead of generating dynamic mocks.

### Time & Timer Mocking
For time-dependent tests (e.g., active schedule filtering or booking time restrictions), mock the system clock:
*   **Vitest:** Use `vi.useFakeTimers()` / `vi.setSystemTime()`.
*   **Bun Test:** Use mock date methods or mock wrappers.

---

## 4. Testing Pyramid & Levels

Testing focuses on three primary layers:

### Unit Tests
*   **Focus:** Core TypeScript helpers (e.g. `utils.ts`), custom hooks (e.g., `useInView`), and individual React UI component render states.
*   **Conventions:** Follow the **Arrange-Act-Assert (AAA)** pattern strictly. Assert singular behaviors per test block.
*   **Example (Vitest):**
    ```typescript
    import { describe, it, expect } from 'vitest'
    import { cn } from '../utils'

    describe('cn styling helper', () => {
        it('should combine and deduplicate classnames', () => {
            // Arrange & Act
            const result = cn('px-4 py-2', 'px-6')
            // Assert
            expect(result).toBe('py-2 px-6')
        });
    });
    ```

### Integration Tests
*   **Focus:** ElysiaJS REST API route handling, data schema validations, and Eden Treaty type-safe RPC actions.
*   **Example (Bun Test):**
    ```typescript
    import { describe, it, expect } from 'bun:test'
    import { Elysia } from 'elysia'
    
    describe('API Server', () => {
        it('should return healthy status on /health endpoint', async () => {
            const response = await fetch('http://localhost:3000/health')
            const body = await response.json()
            
            expect(response.status).toBe(200)
            expect(body.status).toBe('healthy')
        })
    })
    ```

### E2E Tests (Future Phase)
*   **Focus:** Complete multi-actor flows including:
    *   User scheduling reservation and price negotiation (User ↔ Psychologist).
    *   Psychologist dashboard schedule management.
    *   Admin cancellation approvals.
*   **Framework:** Playwright executing tests in chromium/firefox/webkit.

---

## 5. Coverage Goals & Quality Gates

To ensure software robustness, the project establishes clear coverage quality goals:

| Layer | Statement Coverage | Branch Coverage | Function Coverage |
|-------|--------------------|-----------------|-------------------|
| **API Backend** | 80% | 75% | 80% |
| **Common Helpers** | 90% | 85% | 90% |
| **React Components** | 70% | 60% | 70% |

> **Remember:** Code coverage is a tool to spot untested areas, not a target metric to hit by testing implementation details. Test behavior over lines of code.
