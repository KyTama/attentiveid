# Hero Campaigns Envelope Persistence & VPS Non-PII Seed Sync

**Rule:** Extended `hero` metadata (`campaigns`, `slideItems`, `primaryCtaUrl`, `secondaryCtaUrl`) is persisted inside the serialized JSON envelope in `landing_section_translations.contact` (`encodeHeroExtraPayload` / `decodeHeroExtraPayload`), deprecated portal URLs like `assessment.attentiveid.com` must be filtered out at both landing renderers and CMS defaults, and syncing local DB/seeds against VPS `attentive_staging` must include ONLY non-PII content tables.

## Why It Matters
1. **`hero` persistence without schema churn**: The `landing_sections` Postgres table has no standalone JSONB column for hero sub-structures (`campaigns`, `slideItems`, CTA URLs), and `hero` does not expose a separate `contact` field like `closingInvitation`. Encoding those fields into `landing_section_translations.contact` preserves zero-downtime Postgres persistence while letting every campaign card's visibility, order, theme, icon, title, description, CTA, and URL survive save/publish round-trips.
2. **Defense-in-depth portal filtering**: Even if older revisions or CMS drafts still hold an `assessment.attentiveid.com` item, filtering `!url.includes('assessment.attentiveid.com')` in `HomepageHero` and `CampaignFloatingDock` (alongside removing it from `CampaignSection` and `LandingCmsPage` defaults) guarantees visitors never see dead/unwanted links until the portal is ready.
3. **Safe VPS -> local DB/repo sync**: `attentive_staging` contains PII (`free_session_submissions`, production `users` password hashes, refresh tokens). Syncing local dev/repo seeds (`apps/api/src/db/seed-landing.ts`) must dump and restore only the 17 public content/media tables (`landing_*`, `articles*`, `psychologist*`, `media_*`), then re-seed local dev users (`bun run db:seed:users`). Note: truncating `media_objects` or `landing_revisions` with `CASCADE` clears local `users` via FK relations, so always follow with `db:seed:users`.

## Verification
- `cd apps/api && bun test` passes hero campaign round-trip (`src/repositories/repositories.test.ts`), seed contract (`src/db/seed-landing.test.ts`), and integration tests (`src/db/shared-content.integration.test.ts`).
- `bun run test:web && bun run build:web` verifies editable/adjustable/hideable/deletable campaign rendering, floating dock behavior, and zero `assessment.attentiveid.com` links.
