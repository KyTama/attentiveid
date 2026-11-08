# Multi-Step Form UX, Silent Browser Native Validation Blocks, & Unique Constraint Translation

**When this applies:** Designing complex admin CRUD workflows with multi-tab or multi-step modal forms, file uploads, and PostgreSQL unique constraints (e.g. `psychologists_featured_order_unique`, `psychologists_slug_unique`).

**Rule:**
1. **Never use native HTML5 `required` attributes inside unmounted or hidden tabs:** Hidden inputs with `required` block native form submission silently or throw unhandled DOM exceptions (`An invalid form control is not focusable`). Handle all validation reactively in component state with pre-flight checks and explicit inline error messaging.
2. **Consolidate forms into cohesive steps with live required-field checklists:** Rather than fragmenting forms into 5–6 tiny tabs that hide required fields, group inputs into 2–3 logical steps (e.g., `Identitas & SIP`, `Layanan & Keahlian`, `Bio & Jadwal`). Provide a live status bar at the top highlighting missing required items with 1-click jump links.
3. **Keep media/photo upload permanently visible alongside live card previews:** Maintain instant drag-and-drop photo upload with strict client-side & server-side size limits (5 MB) and automatic image dimension resolution next to the preview, rather than burying photo upload in an isolated sub-tab.
4. **Translate database unique constraint violations into friendly HTTP 400 badRequest messages:** Intercept PostgreSQL duplicate key errors (`code: '23505'`) on the backend API and return contextual user-facing guidance rather than raw 500 database exceptions. Provide smart auto-suggestions for sequential unique numbers (e.g. `max(featuredOrder) + 1`).
5. **Keep `drizzle/meta/_journal.json` synchronized when introducing SQL migrations:** Any new database migration file (e.g. `0008_superadmin_user_role.sql`) must have its entry recorded in `_journal.json` so `drizzle-orm/migrator` applies it reliably during automated deployments.

**Why:**
Creating new psychologist profiles across 6 disjointed tabs forced excessive clicking, obscured which inputs were required, caused obscure browser submission failures, and crashed with 500 errors when users entered colliding featured numbers or slugs. Streamlining the form and translating errors eliminated all submission blocks and provided an ergonomic benchmark for dashboard refactoring.
