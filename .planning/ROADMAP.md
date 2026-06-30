# Project Roadmap

## Milestones

- 🚧 **v1.0 Milestone 1: Web, Surveys & Domain Switch** - Phases 1.1-1.8 (in progress, target: July 19, 2026)
- 📋 **v2.0 Milestone 2: Booking & Auth** - Phases 2.1-2.4 (planned, target: August 16, 2026)
- 📋 **v3.0 Milestone 3: Launch** - Phases 3.1-3.2 (planned, target: August 31, 2026)

## Phases

- [x] **Phase 1.1: Project Scaffolding & PostgreSQL Integration** - Scaffold Elysia api, React web, local PostgreSQL container, and Drizzle/Prisma setup.
- [x] **Phase 1.2: Vex Page Sections Porting & Tailwind v4 Customization** - Re-create Vex landing page layout using React + Tailwind v4.
- [x] **Phase 1.3: Internationalization (i18n) Logic** - Integrate react-i18next with English & Bahasa Indonesia toggles. (completed 2026-06-30)
- [ ] **Phase 1.4: Staging Deployment on Tencent VPS** - Staging deployment configuration on Tencent Cloud VPS via Docker Compose.
- [ ] **Phase 1.5: Dynamic Intake Survey / Screening UI** - Multi-step interactive screening form.
- [ ] **Phase 1.6: Survey API & PostgreSQL Storage** - Backend screening survey storage API endpoint.
- [ ] **Phase 1.7: DNS Repointing to Tencent VPS & SSL Activation** - Update DNS registrar records to point to VPS IP and activate SSL.
- [ ] **Phase 1.8: HTTP 301 Permanent Redirect from GitHub Pages** - Route traffic from old github page domain.
- [ ] **Phase 2.1: JWT Authentication & User/Psychologist Roles** - Standard Email & Password auth with role-based routing guards.
- [ ] **Phase 2.2: Psychologist Slots Planner UI** - Interactive schedule configuration board for psychologists.
- [ ] **Phase 2.3: Patient Reservation Scheduling Calendar** - Interactive slots selector for booking.
- [ ] **Phase 2.4: Booking Reservation Transaction Engine** - Concurrency-safe backend transaction system to prevent double-booking.
- [ ] **Phase 3.1: Admin Console (Dashboard)** - Admin portal for managing slots, bookings, and viewing surveys.
- [ ] **Phase 3.2: E2E Verification & Handover** - Final scenario testing, deployment script hardening, and credential handoff.

## Phase Details

### Phase 1.1: Project Scaffolding & PostgreSQL Integration
**Goal**: Scaffold monorepo apps and set up local PostgreSQL connection.
**Depends on**: Nothing
**Requirements**: REQ-10, REQ-11
**Success Criteria**:
  1. Bun/Elysia running locally
  2. React/Vite running locally
  3. PostgreSQL container connected and migrations work
**Plans**: TBD

Plans:
- [x] 1.1-01: Scaffold monorepo workspace and Docker database

### Phase 1.2: Vex Page Sections Porting & Tailwind v4 Customization
**Goal**: Re-create landing page using React + Tailwind v4 CSS.
**Depends on**: Phase 1.1
**Requirements**: REQ-04, REQ-06
**Success Criteria**:
  1. Landing page displays correctly in browser with responsive layout
  2. Tailwind v4 styling applied according to Figma tokens
**Plans**: TBD

Plans:
- [x] 1.2-01: Implement landing page UI components

### Phase 1.3: Internationalization (i18n) Logic
**Goal**: Add multi-language support (English and Bahasa Indonesia).
**Depends on**: Phase 1.2
**Requirements**: REQ-07
**Success Criteria**:
  1. Language toggle switch changes language between English and Bahasa Indonesia
  2. UI copy displays localized text
**Plans**: TBD

Plans:
- [ ] 1.3-01: Set up react-i18next and translation catalogs

### Phase 1.3.2: Refactor Landing Page UI and Migrate Legacy Content (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 1.3
**Plans:** 1/1 plans complete

Plans:
- [x] TBD (run /gsd-plan-phase 1.3.2 to break down) (completed 2026-06-30)

### Phase 1.4: Staging Deployment on Tencent VPS
**Goal**: Configure and test Docker Compose deployment on staging.
**Depends on**: Phase 1.3
**Requirements**: REQ-15, REQ-16
**Success Criteria**:
  1. Staging site reachable at staging domain with HTTPS
**Plans**: TBD

Plans:
- [ ] 1.4-01: Set up docker-compose configuration and VPS deploy script

### Phase 1.5: Dynamic Intake Survey / Screening UI
**Goal**: Build multi-step interactive screening form.
**Depends on**: Phase 1.3
**Requirements**: REQ-05
**Success Criteria**:
  1. Multistep form functions with dynamic steps, validations, progress indicators
**Plans**: TBD

Plans:
- [ ] 1.5-01: Build multistep React survey form

### Phase 1.6: Survey API & PostgreSQL Storage
**Goal**: Create backend screening survey storage API endpoint.
**Depends on**: Phase 1.1, Phase 1.5
**Requirements**: REQ-10, REQ-11
**Success Criteria**:
  1. Elysia API handles submissions and stores them in PostgreSQL
**Plans**: TBD

Plans:
- [ ] 1.6-01: Implement survey API routes and database storage logic

### Phase 1.7: DNS Repointing to Tencent VPS & SSL Activation
**Goal**: Point domain registrar to new VPS IP and configure Caddy SSL.
**Depends on**: Phase 1.4
**Requirements**: REQ-15, REQ-17
**Success Criteria**:
  1. attentiveid.com resolves to Tencent VPS IP with valid SSL certificate
**Plans**: TBD

Plans:
- [ ] 1.7-01: Configure DNS repointing and automatic Let's Encrypt Caddyfile

### Phase 1.8: HTTP 301 Permanent Redirect from GitHub Pages
**Goal**: Set up redirects from old GitHub Pages hosting to the new server.
**Depends on**: Phase 1.7
**Requirements**: REQ-17
**Success Criteria**:
  1. Requests to attentiveid.github.io are redirected with status 301 to attentiveid.com
**Plans**: TBD

Plans:
- [ ] 1.8-01: Setup permanent redirect rules

### Phase 2.1: JWT Authentication & User/Psychologist Roles
**Goal**: Secure system with role-based auth.
**Depends on**: Phase 1.1
**Requirements**: REQ-12
**Success Criteria**:
  1. Login/register endpoints authenticate users
  2. Routing guards prevent unauthorized role access
**Plans**: TBD

Plans:
- [ ] 2.1-01: Setup JWT and role guards

### Phase 2.2: Psychologist Slots Planner UI
**Goal**: Create schedule configuration calendar board for psychologists.
**Depends on**: Phase 2.1
**Requirements**: REQ-04
**Success Criteria**:
  1. Psychologist can configure weekly and hourly slots availability
**Plans**: TBD

Plans:
- [ ] 2.2-01: Build slot manager board UI

### Phase 2.3: Patient Reservation Scheduling Calendar
**Goal**: Patient slot booking selection view.
**Depends on**: Phase 1.5, Phase 2.2
**Requirements**: REQ-04
**Success Criteria**:
  1. Patient can view availability calendar and select a slot for booking
**Plans**: TBD

Plans:
- [ ] 2.3-01: Implement booking calendar view

### Phase 2.4: Booking Reservation Transaction Engine
**Goal**: High-reliability transaction safety for bookings.
**Depends on**: Phase 2.3
**Requirements**: REQ-11
**Success Criteria**:
  1. Database transactions lock selected slot to prevent double-booking
**Plans**: TBD

Plans:
- [ ] 2.4-01: Implement reservation transactions API

### Phase 3.1: Admin Console (Dashboard)
**Goal**: Portal for platform administrator to manage schedules and view surveys.
**Depends on**: Phase 2.1, Phase 2.4
**Requirements**: REQ-12
**Success Criteria**:
  1. Admin dashboard loads slot stats, user reviews, and manages booking entries
**Plans**: TBD

Plans:
- [ ] 3.1-01: Create administrator dashboard layout and charts

### Phase 3.2: E2E Verification & Handover
**Goal**: Final system validation and delivery.
**Depends on**: Phase 3.1
**Requirements**: REQ-18
**Success Criteria**:
  1. Production system verified through e2e flow testing
  2. Backup scripts and handover document delivered
**Plans**: TBD

Plans:
- [ ] 3.2-01: Run end-to-end tests and package backup tooling

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1.1: Scaffolding | v1.0 | 1/1 | Completed | 2026-06-29 |
| 1.2: Vex Porting | v1.0 | 1/1 | Completed | 2026-06-28 |
| 1.3: i18n Logic  | v1.0 | 0/1 | Not started | - |
| 1.4: Staging VPS | v1.0 | 0/1 | Not started | - |
| 1.5: Survey UI   | v1.0 | 0/1 | Not started | - |
| 1.6: Survey API  | v1.0 | 0/1 | Not started | - |
| 1.7: DNS Cutover | v1.0 | 0/1 | Not started | - |
| 1.8: Redirects   | v1.0 | 0/1 | Not started | - |
| 2.1: Auth Roles  | v2.0 | 0/1 | Not started | - |
| 2.2: Slots Board | v2.0 | 0/1 | Not started | - |
| 2.3: Calendar UI | v2.0 | 0/1 | Not started | - |
| 2.4: Booking Tx  | v2.0 | 0/1 | Not started | - |
| 3.1: Admin Panel | v3.0 | 0/1 | Not started | - |
| 3.2: Handover    | v3.0 | 0/1 | Not started | - |
