# Task: Superadmin Accounts & Psychologists CRUD/Upload Overhaul

> **Status:** COMPLETED  
> **Goal:** 
> 1. Add `superadmin` role to database enum and types with whole-access permissions.
> 2. Seed `kytama@attentiveid.com` and `haykal@attentiveid.com` as superadmins with password `@Password6969`.
> 3. Implement specialized psychologist media upload API (`POST /api/admin/psychologists/upload-photo`) storing to `apps/web/public/media/psychologists/` with auto-geometry and `media_objects` registration.
> 4. Overhaul Psychologists CMS CRUD UI: preview layout, replace manual file/geometry entry with drag-and-drop dropzone + preview, and provide modern ergonomic UX benchmark for the dashboard.
> 5. Add strict file size limits (5 MB) on client & server with friendly user error messages.

---

## Action Items
- [x] **1. Types & Database Migration for `superadmin`**:
  - Update `USER_ROLES` and `UserRoleSchema` in `packages/shared/src/content.ts` to include `'superadmin'`.
  - Add DB migration `0008_superadmin_user_role.sql` and execute postgres alter type for `user_role` enum.
  - Update `role-guard.ts` and `ProtectedRoute.tsx` so `superadmin` bypasses single-role checks with universal access.
- [x] **2. Seed Superadmin Accounts**:
  - Update `seed-users.ts` with `kytama@attentiveid.com` and `haykal@attentiveid.com` (password: `@Password6969`, role: `superadmin`).
  - Run seeding script to verify accounts in database.
- [x] **3. Backend Media Upload Endpoint for Psychologists**:
  - Create route `POST /api/admin/psychologists/upload-photo` in Elysia.
  - Process multipart upload, validate mime type (`webp`, `jpeg`, `png`), measure width/height, save to `apps/web/public/media/psychologists/`.
  - Register in `media_objects` table with reference and dimensions.
- [x] **4. Layout Benchmark & Frontend Component Preview**:
  - Design benchmark layout for Psychologist CMS (Split-pane canvas with live practitioner card preview).
- [x] **5. Psychologists CMS UI Overhaul**:
  - Replace manual path & dimension inputs with Drag-and-Drop Image Uploader.
  - Add client-side instant preview via `URL.createObjectURL` and auto dimension resolution.
  - Polish form states, validations, and Emil Kowalski spring animations.
- [x] **6. File Size Limit (5 MB) Enforcement**:
  - Enforce max 5 MB on backend (`POST /api/admin/psychologists/upload-photo`) with HTTP 413 / informative message.
  - Enforce immediate client-side validation in `PsychologistsCmsPage.tsx` with user-friendly error pill.
  - Add test asserting that oversized files (> 5MB) are rejected with clear error.
- [x] **7. Verification & Knowledge Graph Rebuild**:
  - Run unit and integration tests (`bun test` across API and Web).
  - Verify build integrity with `bun run build:api` and `bun run build:web`.
  - Rebuild knowledge graph with `build_or_update_graph_tool`.
- [x] **8. Ergonomic Psychologist Form Overhaul & Edit Testing**:
  - Tested editing existing psychologists in live DB and test harness (Haykal, Syazka, new drafts).
  - Replaced clunky 6 tabs with 3 cohesive steps (`1. Identitas & SIP`, `2. Layanan & Keahlian`, `3. Bio & Jadwal`).
  - Added live required validation tracker banner with 1-click jump pills to missing fields.
  - Added smart helpers: `Isi Contoh Cepat` button, `Salin Semua ID → EN` sync, and automatic next `featuredOrder` suggestion.
  - Handled Postgres unique constraint collisions (slug & featured order) with friendly Indonesian error messages.
