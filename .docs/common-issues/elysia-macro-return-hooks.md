# Elysia Macro Return Hooks

**When this applies:** Writing custom Elysia macros for authentication, role guards, or request validation using `.macro()`.

**Rule:** Elysia macros MUST return an object containing lifecycle hook definitions (e.g. `{ beforeHandle(ctx) { ... } }`), rather than calling builder methods imperatively inside the macro callback.

**Why:** Calling `onBeforeHandle(...)` inside `.macro(({ onBeforeHandle }) => ...)` does not correctly attach the lifecycle interceptor to individual route handlers in Elysia v1.x, causing route guards to be silently skipped.

**How to apply:**
- Define macro functions using the object return pattern:
```ts
.macro({
    requireRole(roles: UserRole | UserRole[]) {
        return {
            async beforeHandle(ctx) {
                // Return 401 / 403 or assign context properties
            }
        };
    }
})
```
