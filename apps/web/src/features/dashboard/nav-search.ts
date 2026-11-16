export interface NavSearchItem {
  to: string
  label: string
  /** Menu path shown under the label, e.g. "Konten Website". */
  trail: string[]
  /** Extra words people might type (synonyms, Indonesian/English). */
  keywords: string
}

/** Words that help people find a menu without knowing its exact name. */
export const NAV_KEYWORDS: Record<string, string> = {
  '/dashboard': 'beranda home ringkasan statistik dashboard utama',
  '/dashboard/landing': 'beranda homepage hero slide teks bagian faq layanan halaman depan konten',
  '/dashboard/testimonials': 'ulasan review cerita klien testimoni',
  '/dashboard/featured-products': 'unggulan featured kartu campaign produk ltbl let there be light social world tanggal mulai selesai masa tampil menu',
  '/dashboard/share-previews': 'thumbnail link share bagikan whatsapp preview gambar og judul deskripsi sosial media',
  '/dashboard/psychologists': 'psikolog profil bio foto kutipan featured urutan direktori status aktif nonaktif tim',
  '/dashboard/profile': 'profil saya akun diri sendiri psikolog bio',
  '/dashboard/articles': 'artikel publikasi tulisan jurnal tulis terbit draft',
  '/dashboard/sci-brief': 'sci brief riset ringkasan bulanan pdf dokumen rilis',
  '/dashboard/bookings': 'reservasi booking jadwal pemesanan klien antrean konsultasi slot',
  '/dashboard/users': 'staff akun pengguna peran admin password manajemen user',
  '/dashboard/free-session': 'sesi gratis leads pendaftar form ekspor',
  '/dashboard/experimental/forms': 'form formulir eksperimen',
  '/dashboard/experimental/traffic': 'traffic kunjungan analitik pengunjung statistik visitor monitor halaman',
  '/dashboard/qr-generator': 'qr code barcode logo attentive kode scan poster cetak alat bantu',
  '/dashboard/experimental/system-map': 'peta sistem diagram koneksi hubungan arsitektur',
}

const normalize = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').trim()

const scoreItem = (item: NavSearchItem, terms: string[]): number => {
  const label = normalize(item.label)
  const trail = normalize(item.trail.join(' '))
  const keywords = normalize(item.keywords)
  let total = 0
  for (const term of terms) {
    let best = 0
    if (label.startsWith(term)) best = 100
    else if (label.split(/[\s/&-]+/).some((word) => word.startsWith(term))) best = 80
    else if (label.includes(term)) best = 60
    else if (trail.includes(term)) best = 40
    else if (keywords.split(/\s+/).some((word) => word.startsWith(term))) best = 30
    else if (keywords.includes(term)) best = 15
    if (best === 0) return 0
    total += best
  }
  return total
}

/** Every term must match somewhere; best matches (label first) come first. */
export function searchNav(items: readonly NavSearchItem[], query: string, limit = 8): NavSearchItem[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []
  return items
    .map((item, index) => ({ item, index, score: scoreItem(item, terms) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.item)
}
