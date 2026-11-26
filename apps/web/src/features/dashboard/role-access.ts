/**
 * Who can open which portal page and do which action. Written from the page rules in App.tsx and the role checks in the
 * API (apps/api/src/routes). The server always has the last word: hiding a menu is only a convenience.
 * Keep this in step with the code when a page or a rule changes (the System Map page shows it).
 */

export type Role = 'superadmin' | 'admin' | 'psychologist'

/** none = cannot; own = only what is assigned to them or belongs to them; all = everything */
export type Level = 'none' | 'own' | 'all'

export interface AccessRow {
  id: string
  area: string
  label: string
  route?: string
  superadmin: Level
  admin: Level
  psychologist: Level
  note?: string
}

export const ROLE_LABEL: Record<Role, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  psychologist: 'Psikolog',
}

export const ROLE_SUMMARY: Record<Role, string> = {
  superadmin: 'Semua yang bisa dilakukan Admin, ditambah mengelola akun Superadmin lain.',
  admin: 'Menjalankan situs dan tim: konten, formulir, pembayaran, rilis laporan, staf.',
  psychologist: 'Hanya melihat klien yang ditugaskan kepadanya, menulis catatan, dan memakai alat umum.',
}

export const PAGE_ACCESS: AccessRow[] = [
  { id: 'overview', area: 'Umum', label: 'Overview', route: '/dashboard', superadmin: 'all', admin: 'all', psychologist: 'all' },
  { id: 'forms-hub', area: 'Formulir', label: 'Semua Aktivitas Formulir', route: '/dashboard/forms', superadmin: 'all', admin: 'all', psychologist: 'own', note: 'Psikolog hanya melihat hasil MHCU yang ditugaskan kepadanya.' },
  { id: 'mhcu', area: 'Formulir', label: 'Dasbor MHCU', route: '/dashboard/assessments/mhcu', superadmin: 'all', admin: 'all', psychologist: 'own', note: 'Daftar kosong untuk psikolog sampai Admin menugaskan klien.' },
  { id: 'mhcu-invites', area: 'Formulir', label: 'Undangan MHCU', route: '/dashboard/assessments/mhcu/invites', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'mhcu-settings', area: 'Formulir', label: 'Pengaturan MHCU', route: '/dashboard/assessments/mhcu/settings', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'gsc', area: 'Formulir', label: 'Hasil GSC', route: '/dashboard/assessments/gsc', superadmin: 'all', admin: 'all', psychologist: 'all' },
  { id: 'free-session', area: 'Formulir', label: 'Pendaftar Sesi Gratis', route: '/dashboard/free-session', superadmin: 'all', admin: 'all', psychologist: 'none', note: 'Menu hanya tampil untuk akun yang masuk daftar Experimental.' },
  { id: 'landing', area: 'Konten Website', label: 'Landing Content', route: '/dashboard/landing', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'testimonials', area: 'Konten Website', label: 'Testimoni Klien', route: '/dashboard/testimonials', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'featured', area: 'Konten Website', label: 'Produk Featured', route: '/dashboard/featured-products', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'share', area: 'Konten Website', label: 'Thumbnail Link', route: '/dashboard/share-previews', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'site-settings', area: 'Konten Website', label: 'Pengaturan Situs', route: '/dashboard/site-settings', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'psychologists', area: 'Tim', label: 'Psychologists', route: '/dashboard/psychologists', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'profile', area: 'Tim', label: 'Profil Saya', route: '/dashboard/profile', superadmin: 'all', admin: 'all', psychologist: 'own', note: 'Psikolog hanya mengubah profilnya sendiri.' },
  { id: 'articles', area: 'Riset', label: 'Articles Management', route: '/dashboard/articles', superadmin: 'all', admin: 'all', psychologist: 'own', note: 'Psikolog mengelola artikelnya sendiri.' },
  { id: 'sci-brief', area: 'Riset', label: 'Sci-Brief', route: '/dashboard/sci-brief', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'bookings', area: 'Operasional', label: 'Reservasi & Booking', route: '/dashboard/bookings', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'prayers', area: 'Operasional', label: 'Doa Pengunjung', route: '/dashboard/prayers', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'traffic', area: 'Operasional', label: 'Traffic Monitor', route: '/dashboard/traffic', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'qr', area: 'Alat Bantu', label: 'QR Generator', route: '/dashboard/qr-generator', superadmin: 'all', admin: 'all', psychologist: 'all' },
  { id: 'wiki', area: 'Wiki', label: 'Wiki MHCU', route: '/dashboard/wiki/mhcu', superadmin: 'all', admin: 'all', psychologist: 'all' },
  { id: 'account', area: 'Pengaturan', label: 'Pengaturan Akun', route: '/dashboard/account', superadmin: 'all', admin: 'all', psychologist: 'all', note: 'Setiap orang hanya mengubah akunnya sendiri.' },
  { id: 'users', area: 'Pengaturan', label: 'Manajemen Staff', route: '/dashboard/users', superadmin: 'all', admin: 'all', psychologist: 'none', note: 'Admin tidak bisa membuat atau mengubah akun Superadmin.' },
  { id: 'reports', area: 'Pengaturan', label: 'Laporan Bug & Saran', route: '/dashboard/reports', superadmin: 'all', admin: 'all', psychologist: 'none', note: 'Semua admin membaca; hanya penanggung jawab laporan yang mengubah, dan hanya akun pemilik yang menghapus.' },
  { id: 'updates', area: 'Pengaturan', label: 'Riwayat Update', route: '/dashboard/updates', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'system-map', area: 'Experimental', label: 'System Map', route: '/dashboard/experimental/system-map', superadmin: 'all', admin: 'all', psychologist: 'none', note: 'Hanya akun yang masuk daftar Experimental.' },
]

export const ACTION_ACCESS: AccessRow[] = [
  { id: 'a-mhcu-read', area: 'MHCU', label: 'Melihat hasil, skor, dan riwayat klien', superadmin: 'all', admin: 'all', psychologist: 'own' },
  { id: 'a-mhcu-assign', area: 'MHCU', label: 'Menugaskan psikolog ke klien', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'a-mhcu-note', area: 'MHCU', label: 'Menulis catatan psikolog', superadmin: 'all', admin: 'all', psychologist: 'own' },
  { id: 'a-mhcu-payment', area: 'MHCU', label: 'Mengubah status pembayaran dan harga klien', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'a-mhcu-preview', area: 'MHCU', label: 'Melihat pratinjau laporan klien dan laporan psikolog', superadmin: 'all', admin: 'all', psychologist: 'own' },
  { id: 'a-mhcu-release', area: 'MHCU', label: 'Merilis laporan lengkap ke klien', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'a-mhcu-resend', area: 'MHCU', label: 'Mengirim ulang e-mail hasil', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'a-mhcu-invite', area: 'MHCU', label: 'Membuat dan membatalkan tautan undangan', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'a-mhcu-settings', area: 'MHCU', label: 'Mengubah harga, promo, level peringatan, otomatisasi', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'a-user-create', area: 'Staf', label: 'Membuat akun Admin atau Psikolog', superadmin: 'all', admin: 'all', psychologist: 'none' },
  { id: 'a-user-super', area: 'Staf', label: 'Membuat atau mengubah akun Superadmin', superadmin: 'all', admin: 'none', psychologist: 'none' },
  { id: 'a-user-reset', area: 'Staf', label: 'Mereset password dan menonaktifkan akun orang lain', superadmin: 'all', admin: 'all', psychologist: 'none', note: 'Tidak berlaku untuk akun Superadmin bagi Admin.' },
  { id: 'a-self-password', area: 'Akun sendiri', label: 'Mengganti password, batas waktu sesi, tema', superadmin: 'own', admin: 'own', psychologist: 'own' },
]

export const LEVEL_TEXT: Record<Level, string> = { none: 'Tidak', own: 'Milik sendiri', all: 'Ya' }

/** Everything one role may open or do (at least their own part). */
export const allowedFor = (rows: readonly AccessRow[], role: Role): AccessRow[] => rows.filter((row) => row[role] !== 'none')
