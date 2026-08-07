# Project Requirements

## UI/UX & Frontend
- **Design Tokens:** Use Figma design for tokens, layout, and branding.
- **Responsiveness:** Mobile-first, sub-1.5 second load time.
- **Styling:** Tailwind CSS v4, shadcn/ui.
- **i18n:** English and Bahasa Indonesia.

## Backend & Database
- **Performance:** High-speed server on low-RAM VPS using Bun and Elysia.
- **Database:** PostgreSQL for robust transaction handling (prevent double booking using SERIALIZABLE/select-for-update).
- **Authentication:** Standard Email/Password with Role-based guards (Admin, Psychologist, Patient).

## DevOps & Infrastructure
- **Server:** Tencent Cloud VPS.
- **Deployment:** Docker Compose (web, api, db).
- **Reverse Proxy:** Caddy for automatic Let's Encrypt SSL.
- **Data Protection:** Database backup scripts.
