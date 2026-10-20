# Active Task Checklist: Update BSD Branch Photo with Optimized WebP

> **Status:** COMPLETED  
> **Milestone:** Visual Polish & Clinic Branch Showcase  
> **Active Focus:** Replaced BSD branch clinic photo with `/Users/kytama/Projects/Neo-Attentive/Docs/Images/additional LP/bsd.jpeg` converted to 800x500 WebP (`apps/web/public/images/locations/bsd.webp`) with zero CLS and optimal framing. Provided SQL restoration for truncated `media_attachments`.

---

## Action Items
- [x] **Convert BSD branch photo to WebP**:
  - Converted `/Users/kytama/Projects/Neo-Attentive/Docs/Images/additional LP/bsd.jpeg` to WebP.
  - Centered framing on the Attentive sign with sleek modern architecture (crop y=600, 800x500 at 90% quality, 28 KB).
  - Saved to `apps/web/public/images/locations/bsd.webp`.
- [x] **Verify Layout and Zero CLS**:
  - Checked `apps/web/src/data/contact.ts` and `apps/web/src/components/landing/OurLocations.tsx`.
  - Intrinsic image aspect ratio (16:10, 800x500) matches HTML dimensions (`width="800"` and `height="500"`).
- [x] **Verification**:
  - Ran `bun run test:web` (58/58 tests passing).
  - Ran `cd apps/web && bun run build` (build succeeded cleanly).
- [x] **Database `media_attachments` Recovery Guidance**:
  - Formulated SQL query to re-link all 24 psychologists with their media objects in PostgreSQL.
