# Task: Add Admin Article Entry, Unpublish, and Delete in Dashboard & API

> **Status:** COMPLETED  
> **Milestone:** CMS Article Governance & Admin Controls  
> **Goal:** Empower admins to create & directly publish articles, unpublish live articles, and delete articles from both the backend API and CMS Dashboard.

---

## Action Items
- [x] **1. Backend API Updates**:
  - Add `POST /api/admin/articles/:id/unpublish` (Admin only) to `apps/api/src/routes/articles.ts`.
  - Add `DELETE /api/admin/articles/:id` (Admin only) to `apps/api/src/routes/articles.ts`.
  - Support direct entry & publish in `POST /api/admin/articles` for Admin.
  - Add unit & integration tests in `apps/api/src/routes/articles.test.ts`.
- [x] **2. Frontend Dashboard Updates**:
  - Update `apps/web/src/pages/dashboard/ArticlesCmsPage.tsx` with:
    - "Tarik Publikasi (Unpublish)" button for published articles.
    - "Hapus Artikel (Delete)" button with confirmation dialog.
    - "Simpan & Terbitkan Langsung" button in modal when admin enters an article.
    - Support for "Terbitkan Langsung" on drafts for admin.
- [x] **3. Verification**:
  - Run backend route tests: `bun test apps/api/src/routes/articles.test.ts` (10/10 passed).
  - Run web tests: `bun --cwd apps/web test` (58/58 passed).
  - Run web build: `bun run build:web` (0 errors).
