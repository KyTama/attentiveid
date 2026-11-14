/**
 * Map of how content flows through the Attentive.id app:
 *   Portal menu  ->  where the data lives  ->  where visitors see it.
 *
 * This is hand-maintained documentation (read from the code on 2026-11-14), shown
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
    about: 'Judul, deskripsi, dan gambar share per halaman, plus sitemap yang dibuat otomatis dari data.' },

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
  { id: 'c-booking', column: 'source', label: 'Link booking & WhatsApp', sub: 'Tersebar ±15 file', status: 'code',
    about: 'Tautan booking.attentiveid.com, nomor WhatsApp (ada di tiga tempat), dan alihan lama free-session.attentiveid.com.' },
  { id: 'c-i18n', column: 'source', label: 'File terjemahan', sub: 'en.json / id.json', status: 'code',
    about: 'Menu, footer, teks kampanye, teks tetap halaman profil (langkah pertama, judul catatan, dll.).' },
  { id: 'c-seo', column: 'source', label: 'sitemap.xml & meta', sub: 'File statis', status: 'code',
    about: 'Daftar 24 halaman psikolog + beberapa halaman tetap, dan satu judul/thumbnail global.',
    note: 'Psikolog, artikel, dan Sci-Brief baru tidak masuk sitemap otomatis.' },
  { id: 'c-photos', column: 'source', label: 'Daftar foto (kode)', sub: 'assets/images.ts', status: 'code',
    about: 'Daftar nama file foto psikolog di kode. Perlu diperiksa apakah masih ada yang memakainya selain foto unggahan portal.' },

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
  { id: 'u-booking', column: 'public', label: 'Pop-up konsultasi', sub: 'Pilih psikolog & booking', status: 'live',
    about: 'Memilih psikolog lalu menuju booking.',
    note: 'Daftar psikolognya dari kode, bukan dari portal.' },
  { id: 'u-locations', column: 'public', label: 'Bagian lokasi', sub: 'Beranda', status: 'live',
    about: 'Kartu tiga cabang dengan alamat dan peta.' },
  { id: 'u-footer', column: 'public', label: 'Header & footer', sub: 'Menu, kontak, cabang', status: 'live',
    about: 'Menu Products, tautan, alamat, dan kontak.' },
  { id: 'u-campaign', column: 'public', label: 'Banner kampanye', sub: 'Dock Sesi Gratis/Booking', status: 'live',
    about: 'Dock melayang dan blok promo.' },
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

  // Data -> public (working)
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
  { from: 'c-herovisual', to: 'u-hero', status: 'code', label: 'kartu & kutipan slide' },
  { from: 'c-psychlist', to: 'u-booking', status: 'code', label: 'daftar psikolog manual' },
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
  { from: 'd-psych', to: 'u-hero', status: 'missing', label: 'kutipan, tahun, fokus Ella' },
  { from: 'd-sci', to: 'u-hero', status: 'missing', label: 'chip bulan brief terbaru' },
  { from: 'd-psych', to: 'u-booking', status: 'missing', label: 'psikolog aktif & foto' },
  { from: 'd-psych', to: 'u-seo', status: 'missing', label: 'sitemap otomatis' },
  { from: 'd-articles', to: 'u-seo', status: 'missing', label: 'sitemap otomatis' },
  { from: 'd-sci', to: 'u-seo', status: 'missing', label: 'sitemap otomatis' },

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
