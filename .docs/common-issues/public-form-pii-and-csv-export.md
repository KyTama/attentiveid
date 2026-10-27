# Public Lead Forms: Keep PII Out of Git, Secrets Out of Source, Neutralize CSV Cells

## Context
The Free Session form (`/free-session`) was ported from a standalone PHP app that shipped with its `data/submissions.json`, a hardcoded admin password and a Google Sheets webhook secret. This repository is public.

## Problem
- Importing a legacy form's data folder into git publishes names, phone numbers and mental-health complaints.
- Hardcoded passwords and webhook secrets in source stay in git history forever.
- A CSV export that writes user text verbatim lets a submitted `=HYPERLINK(...)` run as a formula in Excel.
- `apps/web/tests/setup.ts` mocks `src/lib/api` for the whole web suite, so new pages that import it get the mock, not a real client.

## Solution
1. Never copy submission data, `.env` values or secrets from a legacy app. Import existing leads out of band, directly into the database.
2. Store submissions in Postgres (append-only); dedupe only in the admin report, never in storage.
3. Prefix any exported cell starting with `=`, `+`, `-`, `@`, tab or CR with `'` (see `neutralizeFormula` in `packages/shared/src/free-session.ts`).
4. Rate-limit by the last `X-Forwarded-For` entry (the one the ingress appends), not the first (client-controlled).
5. Use a plain `fetch` service for new public pages (as `features/free-session/service.ts`) so tests can stub `fetch` directly.
