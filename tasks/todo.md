# Attentive.id Refactor Todo List

This is the active workspace checklist to track features and deliverables for the refactoring.

## Milestone 1: Web Facelift, Dynamic Screening & Server Repointing (Target: July 19, 2026)
- [ ] **Task 1.1: Project Setup**
  - [ ] Configure Bun monorepo workspaces (`apps/web`, `apps/api`, `packages/db`)
  - [ ] Scaffold local PostgreSQL development database compose
  - [ ] Initialize Prisma/Drizzle connection in `@attentiveid/db`
- [ ] **Task 1.2: Web UI Facelift**
  - [ ] Port Hugo-Vex layout assets (colors, fonts) into Tailwind CSS v4 design system
  - [ ] Rebuild landing page sections as modular React components in `apps/web`
  - [ ] Integrate `i18next` for English and Indonesian languages switcher
- [ ] **Task 1.3: Dynamic Screening Survey Service**
  - [ ] Define PostgreSQL schema for dynamic kuesioner responses
  - [ ] Build multi-step dynamic survey UI on `apps/web`
  - [ ] Implement Elysia API route to receive, validate, and store survey answers
- [ ] **Task 1.4: Server Pointing & Deployment**
  - [ ] Configure `docker-compose` and Caddy reverse proxy for Tencent VPS
  - [ ] Verify SSL certs auto-generation for `attentiveid.com`
  - [ ] Repoint registrar DNS records to new Tencent Cloud VPS IP
  - [ ] Setup Caddy 301 redirects for any old sub-paths

## Milestone 2: Authentication & Consultation Booking Engine (Target: August 16, 2026)
- [ ] **Task 2.1: Authentication Systems**
  - [ ] Implement secure email/password signup and signin APIs in Elysia
  - [ ] Configure JWT-based state validation and role routing guards
  - [ ] Create Patient and Psychologist account registration and login UI views
- [ ] **Task 2.2: Admin & Psychologist Slot Configuration**
  - [ ] Build admin UI to configure slot templates and assign to psychologists
  - [ ] Create read-only calendar view for psychologists to review schedules
- [ ] **Task 2.3: Patient Reservation & Review UI**
  - [ ] Create calendar interface for patients to search and select slots
  - [ ] Build reservation flow setting status to "Pending/Menunggu Verifikasi"
- [ ] **Task 2.4: Concurrency Lock & Approval Engine**
  - [ ] Write Elysia booking reservation API with PostgreSQL row locks to prevent collision booking
  - [ ] Build API endpoints for Admin to approve/reject bookings
  - [ ] Integrate transactional emails dispatch on booking status changes (Pending/Approved)
  - [ ] Run automated concurrent tests checking collision safety

## Milestone 3: Back-office Dashboard & System Handover (Target: August 31, 2026)
- [ ] **Task 3.1: Admin Console Panel**
  - [ ] Create operations dashboard UI to approve/reject slot bookings
  - [ ] Build survey history table logs interface
  - [ ] Implement consolidated internal calendar showing schedules for all psychologists
- [ ] **Task 3.2: DevOps Hardening**
  - [ ] Write automated daily backup script for PostgreSQL uploading to cloud bucket
  - [ ] Perform VPS resources health logging
- [ ] **Task 3.3: Handover**
  - [ ] Finalize code cleanup, documentation guides, and developer handover
  - [ ] Hand over administrative accounts
