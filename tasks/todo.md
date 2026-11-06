# Task: Update Official Contact Email to contact@attentiveid.com

> **Status:** COMPLETED  
> **Goal:** Update all occurrences of legacy contact email `halo@attentive.id` to official `contact@attentiveid.com` across contact data, footer, and landing CMS.

---

## Action Items
- [x] **1. Update Contact Data & Mailto Link**:
  - Update `apps/web/src/data/contact.ts` to `mailto:contact@attentiveid.com`.
- [x] **2. Update Site Footer Display**:
  - Update `apps/web/src/components/landing/SiteFooter.tsx` email label to `contact@attentiveid.com`.
- [x] **3. Update Landing CMS Default Copy**:
  - Update `apps/web/src/pages/dashboard/LandingCmsPage.tsx` closing invitation contact email to `contact@attentiveid.com`.
- [x] **4. Verify Tests & Build**:
  - Run `bun run test:web` and `bun run build:web`.
  - Rebuild knowledge graph with `build_or_update_graph_tool`.
