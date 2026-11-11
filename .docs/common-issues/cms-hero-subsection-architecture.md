# Common Issues: CMS Hero Sub-Section Architecture & CTA Link Binding

## Context
Attentive's homepage hero evolved from a generic carousel into a multi-tiered editorial structure:
1. **Hero Highlight Card (2 Slides)**: Clinical Consultation & Pet-Friendly Space.
2. **Sub-Hero Command Strip**: Quick access to featured programs (First Free Session, Direct Booking, Digital Test Centre).
3. **Trust Metrics Counter Bar**: 4 credibility numbers (Sessions delivered, Psychologists, Google Rating, Reviews).

## Anti-Pattern (What went wrong)
- In the initial CMS dashboard, Hero was fragmented across multiple disconnected areas:
  - An outdated "Kelola Foto Carousel (1–10 foto)" block at the top managed an array of photos disconnected from the actual 2 slides.
  - Slide text was edited midway down the page.
  - CTA button text was editable, but **there were zero input fields for button destination URLs**, making it impossible for admins to change target paths or tracking parameters.
  - Program & Layanan Unggulan was hardcoded and could not be edited in the CMS.
  - Trust metrics were placed at the very bottom in a generic item repeater.

## Settled Rule & Solution
1. **Unified Sub-Section Navigation**:
   - Provide sub-section tabs for Hero in both the left sidebar and within the editor header:
     - `1. Highlight Card (2 Slide)`
     - `2. Program & Layanan Unggulan (3 Card)`
     - `3. Trust Metrics Counter Bar (4 Item)`
2. **Explicit CTA Destination URL Inputs**:
   - Every CTA button must have both bilingual label inputs (`id`, `en`) AND a dedicated target URL input (`primaryCtaUrl`, `secondaryCtaUrl`, or card `url`).
   - The frontend (`HomepageHero.tsx`) dynamically binds these URLs, supporting anchor hashes (`#services`), internal SPA routes (`/reservasi`), and external protocols (`https://`).
3. **Simulator Reactive Highlighting**:
   - When editing a sub-section in the CMS, the live simulator displays the sub-section with an active border highlight (`ring-2 ring-amber-400`) and live real-time content reflection.
