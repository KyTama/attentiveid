# Hero Section Trust Metrics vs CMS Default Template Parity

## Context
Di homepage (`HomepageHero.tsx`), sub-komponen `<dl>` di bawah hero banner menampilkan 4 Trust Metrics Counter resmi:
1. `3.000+` (Sesi terlaksana / Sessions delivered)
2. `18` (Psikolog / Psychologists)
3. `5,0` (Rating Google / Google rating)
4. `53` (Ulasan Google / Google reviews)

Data ini diambil dari `hero.items` di landing page content.

## Masalah
Pada saat CMS Admin Landing Page (`LandingCmsPage.tsx`) dikembangkan, fallback dummy data (`defaultLandingData`) untuk `hero.items` keliru diisi dengan 3 item teks legal & kode etik HIMPSI ("Kerahasiaan Kode Etik", "Psikolog Berizin SIP", "Ruang Konseling Kedap Suara"). Ketika admin melakukan publikasi dari CMS, item tersebut menimpa 4 trust metrics resmi di database. Karena component hero merender `item.title` sebagai label dan `item.description` ke dalam `<AnimatedMetricValue />`, widget counter justru menampilkan kalimat panjang dan bukannya 4 angka metrik resmi.

## Solusi
1. **CMS Default Template Alignment**:
   Sesuaikan `defaultLandingData.sections.find(s => s.key === 'hero').items` di `LandingCmsPage.tsx` agar selalu memuat 4 item canonical trust metrics lengkap dengan translasi bilingual (id/en).
2. **Editor UX Clarity**:
   Beri helper alert pada hero section repeater di CMS editor agar admin memahami bahwa section hero adalah counter angka. Berikan placeholder kontekstual ("Label Metrik" & "Nilai / Angka") serta tombol 1-klik "⚡ Reset ke 4 Metrik Resmi".
3. **Database Migration / Sync**:
   Lakukan update pada revision aktif di database PostgreSQL agar `hero` section memuat kembali 4 metrik canonical tersebut.
