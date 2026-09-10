# Standalone Service Auth Propagation

**When this applies:** Calling protected API endpoints from pure TypeScript/JavaScript service modules (e.g. `psychologist-cms.ts`, SDK clients) outside the React component lifecycle.

**Rule:** Standalone API service modules MUST provide a mechanism to receive and propagate Authorization Bearer tokens (via optional `headers` argument and an ambient module-level getter like `getActiveAuthHeaders()`), rather than hardcoding unauthenticated headers (`{ 'Content-Type': 'application/json' }`).

**Why:** React hooks (`useAuth()`) cannot be executed inside pure TypeScript utility/service functions. If a service hardcodes static headers without an auth bearer token, all requests to protected routes (`requireRole(['admin'])`) fail with `401 Unauthorized`.

**How to apply:**
1. Export a synchronized module-level token/header accessor from `auth-context.tsx`:
```ts
let activeAccessToken: string | null = null;

export function getActiveAuthHeaders(): Record<string, string> {
    return activeAccessToken ? { Authorization: `Bearer ${activeAccessToken}` } : {};
}
```
2. In service modules, blend ambient auth headers with caller-provided custom headers:
```ts
function buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
        'Content-Type': 'application/json',
        ...getActiveAuthHeaders(),
        ...(customHeaders || {})
    };
}
```
3. Allow callers to explicitly pass `headers: getAuthHeaders()` when invoked inside components.
