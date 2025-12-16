---
description: AttentiveId
---

# 👨‍💻 Development Plan: Project "AttentiveId"

**Status:** 📝 *Drafting / To Be Filled*
**Core Stack:** Bun, ElysiaJS, React, PostgreSQL.

## 0. Prep Phase (No Code)
**Objective:** Define the blueprint before typing a single line of code.

- [ ] **UML Design Flow:**
  - Create Sequence Diagram (User Login -> Reservation Flow).
  - Save as `design_flow.png` or `.mermaid` in `/docs`.
- [ ] **Database Schema Design:**
  - Define tables (Users, Schedules, Reservations).
  - Define relationships (One-to-Many, Many-to-Many).

## 1. Monorepo Structure
- [ ] **Workspace Setup:**
  - `apps/api` (Backend)
  - `apps/web` (Frontend)
  - `packages/config` (Shared configs - Optional)

## 2. Frontend Migration (Operation: Vex Port)
**Objective:** Port existing Hugo/Vex static site to React before building app logic.

- [ ] **Asset Migration:**
  - Move Vex CSS/Fonts/Images from Hugo `/static` to `apps/web/public`.
- [ ] **Component Refactor (Antigravity Mode):**
  - Convert `index.html` monolith into React Components (`Hero.tsx`, `Features.tsx`).
  - Convert Hugo partials (Header/Footer) to shared Layout components.
- [ ] **Script Cleanup:**
  - Replace jQuery dependencies with React alternatives where possible.
  - Ensure Vex animations load correctly in `useEffect`.
- [ ] **Routing Setup:**
  - Install `react-router-dom`.
  - Configure `LandingPage` (Public) vs `Dashboard` (Private) routes.

## 3. Backend Development (ElysiaJS)
> *To be detailed later.*

- [ ] **API Architecture:** (Grouped by features vs. MVC?)
- [ ] **Authentication:** (JWT? Session? OAuth?)
- [ ] **Validation:** (TypeBox schemas)

## 4. Frontend Integration (React + Vite)
> *To be detailed later.*

- [ ] **State Management:** (Context API? Zustand?)
- [ ] **Integration:** (Eden Treaty setup)
- [ ] **Dashboard UI:** Build the actual reservation interface.

## 5. Testing Strategy
- [ ] **Unit Tests:** (Bun Test)
- [ ] **E2E:** (Optional - Playwright)


# 🚀 Deployment Strategy: Project "AttentiveId"

**Objective:** A specific roadmap to evolve from a zero-cost MVP to a high-performance, self-hosted Indonesian production environment.

## 🗓️ Phase 1: The "Free Ride" (MVP)
**Goal:** Zero financial commitment. Get a public URL for client demos and integration testing.

### 1. Architecture Diagram
* **Frontend (User Interface):** Served statically via GitHub Pages.
* **Backend (API & Logic):** On-demand serverless (Render Web Service).
* **Database:** Cloud-hosted PostgreSQL (Render/Supabase).

### 2. Provider Stack
| Component | Service Provider | Cost | Constraints |
| :--- | :--- | :--- | :--- |
| **Frontend** | **GitHub Pages** | Free | Static files only. Requires build step before deploy. |
| **Backend** | **Render.com** | Free | "Cold start" delay (~50s) if inactive for 15m. |
| **Database** | **Render.com** (PostgreSQL) | Free | Database wiped after 90 days (Free tier limit). |

### 3. Connection Logic (The "Glue")
* **CORS Policy:**
  * The Elysia server on Render must explicitly whitelist `https://your-username.github.io`.
  * *Config:* `app.use(cors({ origin: 'https://your-username.github.io' }))`
* **Environment Variables:**
  * **Frontend:** `VITE_API_URL` → Points to `https://attentive-id.onrender.com`.
  * **Backend:** `DATABASE_URL` → Points to the internal Render Postgres address.

### 4. MVP Launch Checklist
- [ ] **Push to GitHub:** Main branch triggers deployment.
- [ ] **Render Setup:** Connect Repo, select "Bun" runtime.
- [ ] **GH Pages Setup:** Set `gh-pages` branch as source.

---

## 🗓️ Phase 2: The "Homecoming" (VPS Migration)
**Goal:** Low latency (<20ms for Indo users), persistent processes, full root control.

### 1. Architecture Diagram
* **Single Node:** Everything lives on one Linux server.
* **Reverse Proxy:** Nginx handles SSL and traffic routing.
* **Process Manager:** Docker or PM2 keeps Bun alive.

### 2. Provider Specs (Indonesian Region)
* **Recommended Providers:** Biznet Gio (NEO Lite), IDCloudHost, or JagoanHosting.
* **Target Spec:** 1 vCPU, 1-2GB RAM, Ubuntu 22.04/24.04.
* **Budget:** ~Rp 70.000 - Rp 100.000 / month.

### 3. Migration Strategy
1. **The Move:**
   * Clone repo to `/var/www/attentive-id`.
   * Build React app locally on VPS (`bun run build`).
2. **The Configuration (Nginx):**
   * **Route `/`**: Serves static files from `apps/web/dist`.
   * **Route `/api`**: `proxy_pass http://localhost:3000`.
3. **The Database:**
   * Run PostgreSQL via Docker container on the same VPS for max speed.
   * *Note:* Ensure frequent automated backups (cron job) to S3/Object Storage.