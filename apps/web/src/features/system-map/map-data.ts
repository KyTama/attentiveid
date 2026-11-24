/**
 * Map of how content flows through the Attentive.id app:
 *   Portal menu  ->  where the data lives  ->  where visitors see it.
 *
 * This is hand-maintained documentation (read from the code on 2026-11-14, forms and MHCU added 2026-11-24), shown
 * in the portal under Experimental > System Map. Update it when a connection is
 * added or fixed so the diagram stays true.
 */

export type MapColumn = 'portal' | 'source' | 'public'

/**
 * - live:     editable in the portal and the site follows it automatically
 * - code:     the text/data is typed in the code; the portal cannot change it
 * - missing:  a connection that should exist but does not yet
 * - proposed: a portal menu we recommend adding
 */
export type MapStatus = 'live' | 'code' | 'missing' | 'proposed'

export interface MapNode {
  id: string
  column: MapColumn
  label: string
  sub: string
  status: MapStatus
  /** Portal route to open (portal column only). */
  route?: string
  /** What this controls / holds. */
  about: string
  /** Practical note: what to know or what to do about it. */
  note?: string
}

export interface MapEdge {
  from: string
  to: string
  status: MapStatus
  /** What flows along this connection. */
  label: string
}

export const STATUS_META: Record<MapStatus, { label: string; description: string }> = {
  live: { label: 'Terhubung', description: 'Diubah di portal, situs ikut berubah otomatis.' },
  code: { label: 'Terkunci di kode', description: 'Teks/data diketik di kode; portal belum bisa mengubahnya.' },
  missing: { label: 'Belum tersambung', description: 'Seharusnya terhubung ke data portal, tapi belum.' },
  proposed: { label: 'Menu usulan', description: 'Menu portal yang disarankan untuk ditambahkan.' },
}

export const MAP_NODES: MapNode[] = [
  // ---- Portal menus (existing) --------------------------------------------
  { id: 'p-landing', column: 'portal', label: 'Landing Content', sub: 'Teks beranda', status: 'live', route: '/dashboard/landing',
    about: 'Mengedit teks bagian beranda: hero, layanan, janji layanan, judul psikolog unggulan, alur, cerita klien, FAQ, dan penutup (ID/EN, draft lalu publish).',
    note: 'Slide hero hanya teks utama dan tombolnya. Kartu di dalam gambar slide tidak bisa diedit di sini.' },
  { id: 'p-testi', column: 'portal', label: 'Testimoni Klien', sub: 'Cerita klien', status: 'live', route: '/dashboard/testimonials',
    about: 'Mengelola ulasan klien. Datanya bagian dari konten beranda (bagian "Cerita Klien").' },
  { id: 'p-psych', column: 'portal', label: 'Psychologists', sub: 'Direktori & Featured', status: 'live', route: '/dashboard/psychologists',
    about: 'Profil lengkap psikolog: identitas, SIP, bio, foto, status, urutan Featured, dan kutipan halaman profil.' },
  { id: 'p-self', column: 'portal', label: 'Profil Saya', sub: 'Psikolog mengedit diri', status: 'live', route: '/dashboard/profile',
    about: 'Psikolog login dan mengedit profilnya sendiri (data yang sama dengan menu Psychologists).' },
  { id: 'p-articles', column: 'portal', label: 'Articles Management', sub: 'Artikel & publikasi', status: 'live', route: '/dashboard/articles',
    about: 'Menulis, mengajukan, menerbitkan, dan menarik artikel. Sudah memuat 19 publikasi ilmiah yang diimpor.' },
  { id: 'p-sci', column: 'portal', label: 'Sci-Brief', sub: 'Ringkasan riset bulanan', status: 'live', route: '/dashboard/sci-brief',
    about: 'Judul, deskripsi, bulan, tanggal rilis, draft/published, dan PDF. Hanya halaman pratinjau yang menjadi publik.' },
  { id: 'p-users', column: 'portal', label: 'Manajemen Staff', sub: 'Akun & peran', status: 'live', route: '/dashboard/users',
    about: 'Membuat dan mengatur akun admin dan psikolog.' },
  { id: 'p-free', column: 'portal', label: 'Sesi Gratis', sub: 'Leads form (Experimental)', status: 'live', route: '/dashboard/free-session',
    about: 'Melihat dan mengekspor pendaftar Sesi Gratis 60 Menit.' },
  { id: 'p-bookings', column: 'portal', label: 'Reservasi & Booking', sub: 'Antrean booking & atribusi', status: 'live', route: '/dashboard/bookings',
    about: 'Mengelola pengajuan reservasi /booking, transisi status, pencegahan konflik slot 15 menit, retry webhook n8n, ekspor CSV operasional, dan laporan atribusi UTM/Meta Ads.' },

  { id: 'p-featured', column: 'portal', label: 'Produk Featured', sub: 'Kartu di beranda + masa tampil', status: 'live', route: '/dashboard/featured-products',
    about: 'Semua kartu di bagian Featured Campaigns & Portals beranda (Sesi Gratis, Booking, Let There Be Light, Your Social World): tema/warna emas, ikon, label, teks tombol, tautan, urutan, saklar aktif, dan masa tampil. Masa tampil tidak terlihat oleh pengunjung.' },
  { id: 'p-share', column: 'portal', label: 'Thumbnail Link', sub: 'Judul, deskripsi, gambar per halaman', status: 'live', route: '/dashboard/share-previews',
    about: 'Mengatur tampilan link saat dibagikan (WhatsApp, media sosial) untuk tiap alamat halaman, mis. /free-session. Halaman tanpa pengaturan memakai logo Attentive.' },
  { id: 'p-traffic', column: 'portal', label: 'Traffic Monitor', sub: 'Untuk semua admin', status: 'live', route: '/dashboard/traffic',
    about: 'Tabel kunjungan halaman utama (hari ini, 7, 30 hari, total) dengan pencarian, filter header, dan urutan. Hanya akun pemilik; dijaga di server.' },
  { id: 'p-qr', column: 'portal', label: 'QR Generator', sub: 'Alat Bantu (semua akun staf)', status: 'live', route: '/dashboard/qr-generator',
    about: 'Membuat QR dengan logo Attentive di tengah (atau logo sendiri), menyimpan desainnya, dan mengunduh PNG. Bisa dipakai semua akun staf (admin dan psikolog).' },

  // ---- Forms: MHCU & Goal System Compass (portal) ------------------------
  { id: 'p-forms', column: 'portal', label: 'Semua Aktivitas Formulir', sub: 'Ringkasan semua formulir', status: 'live', route: '/dashboard/forms',
    about: 'Satu halaman untuk aktivitas semua formulir: jumlah total, 7 hari terakhir, kiriman terbaru, dan tautan ke tiap formulir.' },
  { id: 'p-mhcu', column: 'portal', label: 'Dasbor MHCU', sub: 'Hasil, pembayaran, catatan, rilis', status: 'live', route: '/dashboard/assessments/mhcu',
    about: 'Daftar dan detail hasil MHCU: skor, 13 area, riwayat T1..Tn, tugaskan psikolog, catatan, status pembayaran, pratinjau laporan, rilis laporan, kirim ulang e-mail.',
    note: 'Psikolog hanya melihat klien yang ditugaskan kepadanya.' },
  { id: 'p-mhcu-inv', column: 'portal', label: 'Undangan MHCU', sub: 'Tautan sekali pakai', status: 'live', route: '/dashboard/assessments/mhcu/invites',
    about: 'Membuat tautan undangan untuk Asesmen Awal dan Free Session, serta kuota paket 3x.' },
  { id: 'p-mhcu-set', column: 'portal', label: 'Pengaturan MHCU', sub: 'Harga, promo, peringatan', status: 'live', route: '/dashboard/assessments/mhcu/settings',
    about: 'Harga normal dan promo, tanggal akhir promo, level dan alamat peringatan, serta dua sakelar otomatis (tugaskan psikolog, rilis laporan).' },
  { id: 'p-gsc', column: 'portal', label: 'Hasil GSC', sub: 'Goal System Compass', status: 'live', route: '/dashboard/assessments/gsc',
    about: 'Hasil pengisian Goal System Compass.' },
  { id: 'p-account', column: 'portal', label: 'Pengaturan Akun', sub: 'Password, sesi, tema', status: 'live', route: '/dashboard/account',
    about: 'Setiap orang mengganti password sendiri, mengatur batas waktu tidak aktif, dan memilih tema terang atau gelap.' },
  { id: 'p-wiki', column: 'portal', label: 'Wiki MHCU', sub: 'Panduan langkah demi langkah', status: 'live', route: '/dashboard/wiki/mhcu',
    about: 'Panduan lengkap MHCU untuk staf, dari formulir sampai rilis laporan. Wiki sistem lain menyusul.' },

  // ---- Portal menus (proposed) --------------------------------------------
  { id: 'g-settings', column: 'portal', label: 'Site Settings', sub: 'Kontak, booking, kampanye', status: 'proposed',
    about: 'Satu tempat untuk nomor WhatsApp, email, tautan booking, media sosial, banner/kampanye (dengan tanggal mulai-selesai), dan thumbnail share default.',
    note: 'Menyelesaikan: nomor & link booking yang tersebar di ±15 file, teks kampanye, dan thumbnail.' },
  { id: 'g-locations', column: 'portal', label: 'Locations (Cabang)', sub: 'Alamat & peta', status: 'proposed',
    about: 'Mengelola cabang: nama, alamat, link peta, foto, status buka, dan fitur. Dipakai bagian lokasi, footer, dan pilihan cabang psikolog.' },
  { id: 'g-hero', column: 'portal', label: 'Hero Slides Editor', sub: 'Kartu di tiap slide', status: 'proposed',
    about: 'Memperluas editor hero agar kartu di dalam slide bisa diedit. Slide Ella dan Sci-Brief bisa memilih sumber data otomatis.' },
  { id: 'g-media', column: 'portal', label: 'Media Library', sub: 'Gambar terpusat', status: 'proposed',
    about: 'Unggah gambar sekali, pakai ulang, dengan pengecilan otomatis agar foto tidak pecah/berat.' },
  { id: 'g-seo', column: 'portal', label: 'SEO & Sitemap', sub: 'Judul, deskripsi, share', status: 'proposed',
    about: 'Sisa yang belum ada: judul & deskripsi SEO untuk Google (bukan hanya thumbnail share) per halaman. Thumbnail share dan sitemap otomatis sudah tersedia.' },

  // ---- Forms: where the data lives -----------------------------------------
  { id: 'd-assess', column: 'source', label: 'Hasil formulir', sub: 'Database: MHCU & GSC', status: 'live',
    about: 'Jawaban, skor, level, catatan psikolog, status, dan tautan laporan. Skor dihitung di server.' },
  { id: 'd-people', column: 'source', label: 'Peserta & riwayat', sub: 'Database: nomor peserta, T1..Tn', status: 'live',
    about: 'Orang yang sama dikenali dari e-mail atau nomor WhatsApp; pemeriksaan diberi nomor T1, T2, T3.' },
  { id: 'd-pay', column: 'source', label: 'Pembayaran & bukti transfer', sub: 'Database', status: 'live',
    about: 'Status pembayaran, paket, harga, dan berkas bukti transfer.' },
  { id: 'd-invites', column: 'source', label: 'Undangan & kuota', sub: 'Database', status: 'live',
    about: 'Tautan undangan (satu kali pakai) dan sisa kuota paket.' },
  { id: 'd-mhcu-set', column: 'source', label: 'Pengaturan MHCU', sub: 'Database: site_settings', status: 'live',
    about: 'Harga, promo, level peringatan, alamat peringatan, dan sakelar otomatis.' },
  { id: 'd-audit', column: 'source', label: 'Catatan perubahan staf', sub: 'Database', status: 'live',
    about: 'Siapa mengubah apa pada hasil mana, tanpa data pribadi.' },
  { id: 'c-mail', column: 'source', label: 'Pengiriman e-mail (SMTP)', sub: 'Rahasia server', status: 'code',
    about: 'Surel hasil, konfirmasi bukti transfer, rilis laporan, dan salinan ke contact@ dikirim lewat SMTP yang diatur di server.',
    note: 'Pengaturan SMTP ada di rahasia server, bukan di portal.' },

  // ---- Where the data lives ------------------------------------------------
  { id: 'd-landing', column: 'source', label: 'Konten beranda', sub: 'Database (draft/publish)', status: 'live',
    about: 'Semua bagian beranda yang diatur lewat Landing Content dan Testimoni.' },
  { id: 'd-psych', column: 'source', label: 'Psikolog', sub: 'Database: profil, bio, foto, kutipan', status: 'live',
    about: 'Satu-satunya sumber resmi untuk data psikolog di direktori dan halaman profil.' },
  { id: 'd-articles', column: 'source', label: 'Artikel', sub: 'Database: artikel & revisi', status: 'live',
    about: 'Artikel dan publikasi, termasuk 19 publikasi ilmiah hasil impor.' },
  { id: 'd-sci', column: 'source', label: 'Sci-Brief', sub: 'Database: brief & PDF', status: 'live',
    about: 'Brief bulanan, file pratinjau publik, dan file lengkap privat.' },
  { id: 'd-free', column: 'source', label: 'Leads Sesi Gratis', sub: 'Database', status: 'live',
    about: 'Pendaftar form Sesi Gratis.' },
  { id: 'd-bookings', column: 'source', label: 'Reservasi & Outbox', sub: 'Database: bookings & outbox Google/n8n', status: 'live',
    about: 'Data booking klien, catatan triase klinis terisolasi (Clinical Privacy Wall), jadwal & tarif psikolog, serta outbox sinkronisasi langsung Google Sheets (header-aware) + Gmail / n8n.' },
  { id: 'd-featured', column: 'source', label: 'Produk featured', sub: 'Database: produk + masa tampil', status: 'live',
    about: 'Daftar produk unggulan beserta tanggal mulai-selesai dan status aktif.' },
  { id: 'd-share', column: 'source', label: 'Thumbnail link', sub: 'Database + /media/share', status: 'live',
    about: 'Judul, deskripsi, dan gambar share per alamat halaman.' },
  { id: 'd-traffic', column: 'source', label: 'Hitungan kunjungan', sub: 'Database: counter harian', status: 'live',
    about: 'Hanya angka per halaman per hari (tanpa data pribadi). Halaman dengan sub-halaman dihitung di halaman awalnya.' },
  { id: 'd-qr', column: 'source', label: 'Desain QR', sub: 'Database', status: 'live',
    about: 'Pengaturan QR tersimpan (alamat, warna, logo, ukuran logo).' },
  { id: 'd-users', column: 'source', label: 'Akun & peran', sub: 'Database', status: 'live',
    about: 'Akun staf, peran admin/psikolog, dan status aktif.' },

  { id: 'c-herovisual', column: 'source', label: 'Kartu hero (kode)', sub: 'HeroSlideVisual.tsx', status: 'code',
    about: 'Kutipan Ella, "15+ yrs", "UN · IOM", daftar fokus, "— ELLA", serta kartu slide praktik, taman/kucing, Big 10, dan chip bulan Sci-Brief.',
    note: 'Inilah sebab kutipan di hero tidak ikut berubah saat kutipan profil diedit di portal.' },
  { id: 'c-psychlist', column: 'source', label: 'Daftar psikolog (kode)', sub: 'data/psychologists.ts', status: 'code',
    about: 'Daftar psikolog yang ditulis manual di kode, dipakai pop-up konsultasi/booking.',
    note: 'Psikolog baru, nonaktif, atau yang diedit di portal tidak tercermin di pop-up ini.' },
  { id: 'c-contact', column: 'source', label: 'Kontak & cabang (kode)', sub: 'data/contact.ts + terjemahan', status: 'code',
    about: 'Nomor WhatsApp, alamat tiga cabang, link peta, foto lokasi, fitur cabang.' },
  { id: 'c-booking', column: 'source', label: 'Tautan booking (eksternal) & WhatsApp', sub: 'booking.attentiveid.com + /booking staged', status: 'code',
    about: 'Tombol CTA konsultasi dan pop-up publik masih mengarah ke https://booking.attentiveid.com sesuai arahan sementara menunggu go-ahead CEO; rute native /booking dan /dashboard/bookings sudah aktif untuk pengujian.',
    note: 'Saat siap cutover, tinggal arahkan CTA publik dan redirect subdomain ke /booking.' },
  { id: 'c-i18n', column: 'source', label: 'File terjemahan', sub: 'en.json / id.json', status: 'code',
    about: 'Menu, footer, teks kampanye, teks tetap halaman profil (langkah pertama, judul catatan, dll.).' },
  { id: 'c-seo', column: 'source', label: 'sitemap.xml & meta', sub: 'File statis', status: 'code',
    about: 'Cadangan: sitemap.xml statis dipakai hanya jika API tidak terjangkau; thumbnail bawaan (logo Attentive) untuk halaman tanpa pengaturan.',
    note: 'Sitemap utama kini dibuat otomatis dari database.' },
  { id: 'c-photos', column: 'source', label: 'Daftar foto (kode)', sub: 'assets/images.ts', status: 'code',
    about: 'Daftar nama file foto psikolog di kode. Perlu diperiksa apakah masih ada yang memakainya selain foto unggahan portal.' },

  // ---- Forms: what visitors see ----------------------------------------------
  { id: 'u-mhcu', column: 'public', label: '/assessments/mhcu', sub: 'Formulir & layar terima kasih', status: 'live',
    about: 'Formulir MHCU, hasil singkat, dan tawaran laporan lengkap dengan harga.' },
  { id: 'u-gsc', column: 'public', label: '/assessments/gsc', sub: 'Formulir GSC', status: 'live',
    about: 'Formulir Goal System Compass.' },
  { id: 'u-pay', column: 'public', label: '/assessments/payment', sub: 'Halaman pembayaran', status: 'live',
    about: 'Rekening, pilihan 1x atau paket 3x, unggah bukti, dan pesan WhatsApp.' },
  { id: 'u-report', column: 'public', label: 'Halaman laporan hasil', sub: 'Tautan bertanda tangan', status: 'live',
    about: 'Laporan lengkap yang dirilis, dibuka dari tautan di e-mail; bisa dicetak atau disimpan sebagai PDF.' },
  { id: 'u-mail', column: 'public', label: 'E-mail ke peserta', sub: 'Hasil, bukti diterima, rilis', status: 'live',
    about: 'E-mail yang diterima peserta, serta salinan dan pemberitahuan ke tim.' },

  // ---- What visitors see ---------------------------------------------------
  { id: 'u-hero', column: 'public', label: 'Hero beranda', sub: 'Carousel 5 slide', status: 'live',
    about: 'Teks utama slide mengikuti Landing Content; kartu di dalam slide masih dari kode.' },
  { id: 'u-sections', column: 'public', label: 'Bagian beranda', sub: 'Layanan sampai FAQ', status: 'live',
    about: 'Layanan, janji layanan, alur, cerita klien, reassurance, FAQ, dan penutup.' },
  { id: 'u-featured', column: 'public', label: 'Carousel psikolog', sub: 'Beranda', status: 'live',
    about: 'Mengikuti urutan Featured dan status di portal.' },
  { id: 'u-directory', column: 'public', label: '/psychologists', sub: 'Direktori', status: 'live',
    about: 'Mengikuti urutan Featured, status, bio, dan foto dari portal.' },
  { id: 'u-profile', column: 'public', label: 'Halaman profil', sub: '/psychologists/:slug', status: 'live',
    about: 'Bio, foto, kutipan, dan jadwal dari portal; sebagian teks tetap dari file terjemahan.' },
  { id: 'u-articles', column: 'public', label: '/articles', sub: 'Daftar & detail', status: 'live',
    about: 'Artikel terbit dari database.' },
  { id: 'u-sci', column: 'public', label: '/sci-brief', sub: 'Daftar & detail', status: 'live',
    about: 'Brief yang sudah rilis, pratinjau halaman, dan permintaan akses lewat email/WhatsApp.' },
  { id: 'u-free', column: 'public', label: '/free-session', sub: 'Form pendaftaran', status: 'live',
    about: 'Form Sesi Gratis; kiriman masuk ke menu Sesi Gratis.' },
  { id: 'u-booking', column: 'public', label: 'Alur /booking (staged) & pop-up konsultasi', sub: 'Booking 5 langkah + CTA booking.attentiveid.com', status: 'live',
    about: 'Rute native /booking mengambil katalog psikolog, jadwal mingguan, tarif online/offline, dan slot terisi langsung dari /api/booking/* dengan isolasi Clinical Privacy Wall; CTA web utama dan pop-up masih mempertahankan https://booking.attentiveid.com sambil menunggu aba-aba CEO.',
    note: 'Pengajuan di /booking sudah tersimpan ke PostgreSQL dan tersinkron ke Google Sheets via outbox.' },
  { id: 'u-locations', column: 'public', label: 'Bagian lokasi', sub: 'Beranda', status: 'live',
    about: 'Kartu tiga cabang dengan alamat dan peta.' },
  { id: 'u-footer', column: 'public', label: 'Header & footer', sub: 'Menu, kontak, cabang', status: 'live',
    about: 'Menu Our Services, Our Science, tautan, alamat, dan kontak.' },
  { id: 'u-campaign', column: 'public', label: 'Banner kampanye', sub: 'Dock Sesi Gratis/Booking', status: 'live',
    about: 'Dock melayang dan blok promo.' },
  { id: 'u-featuredmenu', column: 'public', label: 'Featured Campaigns & Portals', sub: 'Strip kartu di bawah hero beranda', status: 'live',
    about: 'Semua kartu (Sesi Gratis, Booking, Let There Be Light, dst.) berasal dari Produk Featured: tema, ikon, label, tombol, urutan, dan masa tampil. Kartu di Landing Content hanya cadangan dan untuk dock bawah.' },
  { id: 'u-lights', column: 'public', label: 'Cahaya kursor (LTBL)', sub: 'Semua halaman publik kecuali form', status: 'live',
    about: 'Cahaya kecil berkelip di dekat kursor. Mati di /free-session, /booking, dan halaman LTBL, mati saat kursor di atas input/form, dan mati untuk perangkat sentuh atau pengaturan "kurangi gerakan".' },
  { id: 'u-seo', column: 'public', label: 'Pencarian & share', sub: 'Sitemap, judul, thumbnail', status: 'live',
    about: 'Cara situs muncul di Google dan saat tautan dibagikan.' },
]

export const MAP_EDGES: MapEdge[] = [
  // Portal -> data (working)
  { from: 'p-landing', to: 'd-landing', status: 'live', label: 'teks bagian beranda' },
  { from: 'p-testi', to: 'd-landing', status: 'live', label: 'cerita klien' },
  { from: 'p-psych', to: 'd-psych', status: 'live', label: 'profil, bio, foto, Featured, kutipan' },
  { from: 'p-self', to: 'd-psych', status: 'live', label: 'profil sendiri' },
  { from: 'p-articles', to: 'd-articles', status: 'live', label: 'artikel & status' },
  { from: 'p-sci', to: 'd-sci', status: 'live', label: 'brief & PDF' },
  { from: 'p-users', to: 'd-users', status: 'live', label: 'akun & peran' },
  { from: 'p-free', to: 'd-free', status: 'live', label: 'baca & ekspor leads' },

  { from: 'p-featured', to: 'd-featured', status: 'live', label: 'produk & masa tampil' },
  { from: 'p-share', to: 'd-share', status: 'live', label: 'thumbnail per halaman' },
  { from: 'p-traffic', to: 'd-traffic', status: 'live', label: 'baca hitungan' },
  { from: 'p-qr', to: 'd-qr', status: 'live', label: 'desain QR' },

  // Data -> public (working)
  { from: 'd-featured', to: 'u-featuredmenu', status: 'live', label: 'produk aktif' },
  { from: 'd-share', to: 'u-seo', status: 'live', label: 'thumbnail per halaman' },
  { from: 'u-hero', to: 'd-traffic', status: 'live', label: 'hitung kunjungan halaman utama' },
  { from: 'd-landing', to: 'u-hero', status: 'live', label: 'judul, deskripsi, tombol slide' },
  { from: 'd-landing', to: 'u-sections', status: 'live', label: 'teks bagian' },
  { from: 'd-landing', to: 'u-featured', status: 'live', label: 'judul bagian' },
  { from: 'd-psych', to: 'u-featured', status: 'live', label: 'psikolog & urutan' },
  { from: 'd-psych', to: 'u-directory', status: 'live', label: 'daftar & urutan' },
  { from: 'd-psych', to: 'u-profile', status: 'live', label: 'bio, foto, kutipan' },
  { from: 'd-articles', to: 'u-articles', status: 'live', label: 'artikel terbit' },
  { from: 'd-sci', to: 'u-sci', status: 'live', label: 'brief rilis & pratinjau' },
  { from: 'u-free', to: 'd-free', status: 'live', label: 'kiriman form' },

  // Typed in code -> public (portal cannot change)
  { from: 'c-herovisual', to: 'u-hero', status: 'code', label: 'cadangan teks kartu slide' },
  { from: 'c-psychlist', to: 'u-booking', status: 'code', label: 'cadangan jika portal tak terjangkau' },
  { from: 'c-contact', to: 'u-locations', status: 'code', label: 'alamat & peta' },
  { from: 'c-contact', to: 'u-footer', status: 'code', label: 'kontak & cabang' },
  { from: 'c-booking', to: 'u-campaign', status: 'code', label: 'link booking/WA' },
  { from: 'c-booking', to: 'u-footer', status: 'code', label: 'link booking/WA' },
  { from: 'c-i18n', to: 'u-footer', status: 'code', label: 'menu & footer' },
  { from: 'c-i18n', to: 'u-campaign', status: 'code', label: 'teks kampanye' },
  { from: 'c-i18n', to: 'u-profile', status: 'code', label: 'teks tetap profil' },
  { from: 'c-photos', to: 'u-profile', status: 'code', label: 'daftar foto (periksa)' },
  { from: 'c-seo', to: 'u-seo', status: 'code', label: 'sitemap & thumbnail' },

  // Connections that should exist but do not
  { from: 'd-psych', to: 'u-hero', status: 'live', label: 'kutipan & fokus Ella' },
  { from: 'd-sci', to: 'u-hero', status: 'live', label: 'chip bulan brief terbaru' },
  { from: 'd-psych', to: 'u-booking', status: 'live', label: 'psikolog aktif & foto' },
  { from: 'p-bookings', to: 'd-bookings', status: 'live', label: 'antrean reservasi, status, webhook & atribusi' },
  { from: 'u-booking', to: 'd-bookings', status: 'live', label: 'pengajuan /booking & catatan klinis terisolasi' },
  { from: 'd-psych', to: 'u-seo', status: 'live', label: 'sitemap otomatis' },
  { from: 'd-articles', to: 'u-seo', status: 'live', label: 'sitemap otomatis' },
  { from: 'd-sci', to: 'u-seo', status: 'live', label: 'sitemap otomatis' },

  // Forms
  { from: 'p-forms', to: 'd-assess', status: 'live', label: 'ringkasan semua formulir' },
  { from: 'p-mhcu', to: 'd-assess', status: 'live', label: 'hasil, catatan, rilis' },
  { from: 'p-mhcu', to: 'd-people', status: 'live', label: 'riwayat T1..Tn' },
  { from: 'p-mhcu', to: 'd-pay', status: 'live', label: 'status & bukti transfer' },
  { from: 'p-mhcu', to: 'd-audit', status: 'live', label: 'catatan perubahan' },
  { from: 'p-mhcu-inv', to: 'd-invites', status: 'live', label: 'buat & batalkan undangan' },
  { from: 'p-mhcu-set', to: 'd-mhcu-set', status: 'live', label: 'harga, promo, peringatan' },
  { from: 'p-gsc', to: 'd-assess', status: 'live', label: 'hasil GSC' },
  { from: 'p-account', to: 'd-users', status: 'live', label: 'password & batas waktu sesi' },
  { from: 'u-mhcu', to: 'd-assess', status: 'live', label: 'kiriman formulir & skor' },
  { from: 'u-mhcu', to: 'd-people', status: 'live', label: 'pengenalan peserta' },
  { from: 'u-gsc', to: 'd-assess', status: 'live', label: 'kiriman formulir' },
  { from: 'u-pay', to: 'd-pay', status: 'live', label: 'bukti transfer' },
  { from: 'd-invites', to: 'u-mhcu', status: 'live', label: 'jalur undangan' },
  { from: 'd-mhcu-set', to: 'u-mhcu', status: 'live', label: 'harga & tanggal promo' },
  { from: 'd-mhcu-set', to: 'u-pay', status: 'live', label: 'harga & tanggal promo' },
  { from: 'd-assess', to: 'u-report', status: 'live', label: 'laporan yang dirilis' },
  { from: 'c-mail', to: 'u-mail', status: 'code', label: 'pengiriman SMTP' },
  { from: 'd-assess', to: 'u-mail', status: 'live', label: 'isi hasil' },

  // Proposed portal menus
  { from: 'g-settings', to: 'c-booking', status: 'proposed', label: 'satu pengaturan' },
  { from: 'g-settings', to: 'c-contact', status: 'proposed', label: 'WhatsApp, email, sosial' },
  { from: 'g-settings', to: 'c-i18n', status: 'proposed', label: 'teks kampanye & footer' },
  { from: 'g-locations', to: 'c-contact', status: 'proposed', label: 'cabang' },
  { from: 'g-hero', to: 'c-herovisual', status: 'proposed', label: 'kartu slide' },
  { from: 'g-media', to: 'd-psych', status: 'proposed', label: 'foto terpusat' },
  { from: 'g-media', to: 'c-photos', status: 'proposed', label: 'gambar terpusat' },
  { from: 'g-seo', to: 'c-seo', status: 'proposed', label: 'judul, share, sitemap' },
]

export const NODE_BY_ID: Record<string, MapNode> = Object.fromEntries(MAP_NODES.map((node) => [node.id, node]))

export const edgesOf = (nodeId: string) =>
  MAP_EDGES.filter((edge) => edge.from === nodeId || edge.to === nodeId)

export const summarize = () => ({
  live: MAP_EDGES.filter((edge) => edge.status === 'live').length,
  code: MAP_EDGES.filter((edge) => edge.status === 'code').length,
  missing: MAP_EDGES.filter((edge) => edge.status === 'missing').length,
  proposed: MAP_NODES.filter((node) => node.status === 'proposed').length,
})
