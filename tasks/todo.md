# Task: Hero Showcase, Pet-Friendly Neutralization & Live Production Sync

> **Status:** COMPLETED  
> **Target:** `https://attentiveid.com`  

---

## Action Items
- [x] **1. Official Consultation Hero Image Parity**:
  - Guard against legacy Docker volume reference (`hero-slide-1.jpg`) which had the old Malang clinic facade photo.
  - Set default Slide 1 hero to `/images/figma/consultation-hero.webp`.
  - Overwrite `og-attentive.jpg` and fallback assets with the official consultation picture.
- [x] **2. Pet-Friendly Static Assets Packaging**:
  - Relocate pet-friendly assets to `apps/web/public/images/pet-friendly/` so they are packaged into the static build instead of falling through to the backend volume.
  - Neutralize copy: remove Malang lock, update button to `Lihat 3 Lokasi Praktik →` linking to `#locations`.
- [x] **3. Layout & Section Re-ordering**:
  - Position 1: Editorial Hero Highlight Card (2 Slides).
  - Position 2: Minimalist Trust Ticker Ribbon (`✻ Thoughtful psychological support...`).
  - Position 3: Sub-Hero Command Strip (**Program & Layanan Unggulan** moved UP).
  - Position 4: **4 Trust Counter Metrics** moved DOWN directly below Program Unggulan.
- [x] **4. CMS Hero Multi-Slide Editor Upgrade**:
  - Added Slide 1 (Konseling Klinis) and Slide 2 (Ruang Ramah Anabul 🐾) tab controls.
  - Dual-color heading support with `**text**` gold syntax.
  - Live simulator preview reflects edits accurately.
- [x] **5. Production Deployment & Live Verification**:
  - Pushed commit `b5c78fc` to `origin/master`.
  - GitHub Actions `Build Images` & `Deploy Staging` completed successfully.
  - Verified live bundle (`index-BQSgIBz0.js`), consultation hero webp, and pet-friendly images returning HTTP 200 on `https://attentiveid.com`.
