# Active Task Checklist: Portrait Normalization & Crop Standardization

> **Status:** COMPLETED (Verified across Cards, Carousel, and Profiles)  
> **Milestone:** Milestone 1.9 (Stakeholder Review & Brand Architecture Convergence)  
> **Active Focus:** Reverted Fizul/Haykal to original photo asset and re-cropped Audria's portrait to a balanced close-up eliminating excessive top headroom.

---

## Task Checklist
- [x] **Step 1: Revert Fizul (Dr. Haykal) to Original Asset**:
  - Reverted `apps/web/public/media/psychologists/haykal.webp` and `apps/web/public/images/psychologists/Haykal.webp` to original uncropped asset.
  - Maintained `object-[60%_10%]` focal position in `FeaturedPsychologists.tsx` carousel.
- [x] **Step 2: Re-crop Audria to Close-up Head-and-Shoulders**:
  - Processed `Audri_Psikolog/acbd4923-2893-40aa-afdf-1684f5de538b.jpg` to remove excessive top wall space (reduced headroom from 45% down to 12%).
  - Fine-tuned horizontal centering (+10px window offset): hair part at x=301, nose bridge at x=298 (exact center of 600px width), balancing left and right margins across both full 4:5 portraits and 1.65:1 card views.
  - Saved to `media/psychologists/audria.webp` and `images/psychologists/Audria.webp`.
- [x] **Step 3: Keep Gisella, Syazka, and Anggita (Gita) Normalized**:
  - Gisella: cropped `Gisella_Psikolog/selected/DSC00063.JPG` to close-up 600x750 WebP.
  - Syazka: cropped `Syazka_Psikolog/DSC05401.JPG` to close-up 600x750 WebP.
  - Anggita (Gita): cropped `Gita_Psikolog/Gita1.jpg` from 3/4 standing to close-up 600x750 WebP.
- [x] **Step 4: Keep All Placeholder Replacements**:
  - Angelina (`angelina.webp`), Dewinta (`dewinta.webp`), Dominika (`dominika.webp`), Farahdilla (`farahdilla.webp`), Farhan (`farhan.webp`), Grace (`grace.webp`), Nuzul (`nuzul.webp`).
- [x] **Step 5: Verify Rendering across Card, Profile, and Recommendations**:
  - Ran `bun run test:web` (57/57 tests passing).
  - Built production bundle (`cd apps/web && bun run build`) with zero TypeScript/Vite errors.
- [x] **Step 6: Update Knowledge Graph**:
  - Ran `build_or_update_graph_tool`.
- [x] **Step 7: Update Malang Location Address & Google Maps Link**:
  - Address: `Grand Arumba B17, Jl. Grand Arumba, Blok B No.17, Tunggulwulung, Kota Malang 65143`
  - Maps URL: `https://goo.gl/maps/2F9E5WrHKEPvhTYX7?g_st=ac`
  - Updated `contact.ts`, `id.json`, `en.json`, CMS branch label, and scripts. Verified dual buttons (Online Consultation booking + Google Maps).
- [x] **Step 8: Unify Directory Card Aspect Ratio to 4:5 (Portrait)**:
  - Updated `PsychologistDirectoryCard.tsx`: changed image container from `aspect-[1.65/1]` to `aspect-[4/5]`.
  - Normalised image framing with `object-cover object-[center_12%]`.
  - Updated `DirectoryLoadingState` in `PsychologistDirectory.tsx` to `aspect-[4/5]` to preserve zero CLS.
  - Verified 57/57 unit tests and clean Vite production build.
  - Rebuilt AST knowledge graph index.



