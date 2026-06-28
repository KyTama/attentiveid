# 🔌 External & Database Integrations

> **Focus:** External APIs, databases, authentication providers, and webhook configurations.  
> **Updated:** 2026-06-28  
> **Status:** Completed  
> **Phase:** 1 (MVP)

---

## 1. Database Configuration

The application currently relies on client-side mocks and static data structures but is architected to transition to a persistent relational database.

| Database | Role | Target Technology | Status / Connection Method |
|-----------|------|-------------------|----------------------------|
| **PostgreSQL** | Primary Relational Database | PostgreSQL | Planned. Connection config placeholder `DATABASE_URL` is defined in the backend environment template. |

- **Mock Data Layer:** Dynamic listings and configurations (e.g., psychologists roster, services, client testimonials) are managed via mock files in the frontend repository:
  - [apps/web/src/data/psychologists.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/data/psychologists.ts)
  - [apps/web/src/data/services.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/data/services.ts)
  - [apps/web/src/data/testimonials.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/data/testimonials.ts)
- **Database Connection Config:**
  - Env Var: `DATABASE_URL` in [apps/api/.env.example](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/api/.env.example)
  - Placeholder: `postgresql://user:password@localhost:5432/attentiveid`

---

## 2. Authentication & Session Providers

A JWT-based local authentication schema is designed to secure user, admin, and psychologist workspaces.

| Provider | Type | Strategy | Status / Key |
|----------|------|----------|--------------|
| **Local JWT** | Token-Based Session Auth | JSON Web Tokens | Planned. Secret key configuration placeholder `JWT_SECRET` is reserved in the API configuration. |

- **Configuration Key:**
  - Env Var: `JWT_SECRET` in [apps/api/.env.example](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/api/.env.example)

---

## 3. External API & Integration Endpoints

The landing page interacts with external systems via protocol redirects and communication widgets.

### WhatsApp Integration
- **Purpose:** Immediate connection to scheduling support or psychologists for bookings/consultation questions.
- **Implementation:** Custom hyperlinks referencing international formatting phone numbers with pre-configured templates.
- **Triggers:**
  - QR Code or button clicks inside the contact card [apps/web/src/components/landing/Contact.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/landing/Contact.tsx).

### Social Media Redirects
- **Purpose:** Brand engagement and counselor profile links.
- **Mechanism:** Direct URL redirects to Instagram pages and related portals.
- **Triggers:**
  - Footer social link icons [apps/web/src/components/landing/Footer.tsx](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/components/landing/Footer.tsx).

---

## 4. Internal API & IPC Client

Type-safe communication between the frontend React client and backend Elysia API is established.

- **Elysia Eden Treaty Client:** Utilized to bind Elysia's type system to the frontend React application at compile time.
  - Client setup: [apps/web/src/lib/api.ts](file:///Users/kytama/Projects/Neo-Attentive/attentiveid/apps/web/src/lib/api.ts)
  - Target Endpoint: Configured via `VITE_API_URL` environment variable (defaults to `http://localhost:3000`).

---

## 5. Webhooks & Event Hooks

- **Status:** No external webhook consumers (such as Stripe, SendGrid, or SMS gateways) or events are currently integrated. All event-driven architectures are marked as pending database implementation.
