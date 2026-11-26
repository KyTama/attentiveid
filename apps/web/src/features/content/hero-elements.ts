import type { HeroSlideLayout } from '@attentiveid/shared'

/**
 * Every part of a hero slide that staff can change or hide. The layout itself is fixed: hiding a part leaves its place empty.
 * `text` parts can be reworded (both languages), `image` parts can be given another picture, `block` parts can only be hidden.
 */
export interface HeroElement {
  key: string
  /** Shown to staff in the editor (Indonesian). */
  label: string
  kind: 'text' | 'image' | 'block'
  /** The built-in wording or picture. A text without a default follows other data (for example the psychologist's profile). */
  text?: { id: string; en: string }
  src?: string
}

const text = (key: string, label: string, id: string, en: string = id): HeroElement => ({ key, label, kind: 'text', text: { id, en } })
const image = (key: string, label: string, src: string): HeroElement => ({ key, label, kind: 'image', src })
const block = (key: string, label: string): HeroElement => ({ key, label, kind: 'block' })

const COPY: HeroElement[] = [
  block('tag', 'Label kecil di atas judul'),
  block('description', 'Paragraf deskripsi'),
  block('primaryCta', 'Tombol utama'),
  block('secondaryCta', 'Tombol kedua'),
  block('photo', 'Foto utama'),
]

export const HERO_ELEMENTS: Record<HeroSlideLayout, HeroElement[]> = {
  practice: [
    ...COPY,
    block('location', 'Baris lokasi'),
    block('sticker', 'Stiker bulat emas'),
    text('stickerText', 'Tulisan stiker (satu kata per baris)', 'SIP\nRESMI\n✦'),
    block('caption', 'Kartu putih kiri bawah'),
    text('captionTitle', 'Judul kartu', 'COME AS YOU ARE'),
    text('captionText', 'Isi kartu', 'Ruang aman untuk didengar.', 'A safe space to be heard.'),
  ],
  'pet-garden': [
    ...COPY,
    block('note', 'Catatan alergi kucing'),
    block('kittensBox', 'Foto anak kucing (kanan atas)'),
    image('kittens', 'Ganti foto anak kucing', '/images/hero-v3/slide-02-cat-kittens.jpg'),
    block('tabbyBox', 'Foto kucing tabby (kanan bawah)'),
    image('tabby', 'Ganti foto tabby', '/images/hero-v3/slide-02-cat-tabby.jpg'),
    block('circle', 'Lingkaran foto kucing'),
    image('circlePhoto', 'Ganti foto di lingkaran', '/images/hero-v3/slide-02-cat-nap.jpg'),
    block('sticker', 'Stiker bulat emas'),
    text('stickerText', 'Tulisan stiker (satu kata per baris)', 'KENALI\nPENGHUNI\nKAMI', 'MEET\nTHE\nRESIDENTS'),
  ],
  big10: [
    ...COPY,
    block('steps', 'Kotak langkah (01, 02, 03)'),
    block('normCard', 'Kartu skor vs. norma'),
    text('normLabel', 'Label kartu skor', 'Skor kamu vs. norma', 'Your scores vs. the norm'),
    image('normImage', 'Gambar kartu skor', '/images/hero-v3/slide-03-big10-norm.png'),
    block('typeCard', 'Kartu kode 4 huruf'),
    text('typeLabel', 'Label kartu kode', 'Kode 4-hurufmu', 'Your 4-letter type'),
    image('typeImage', 'Gambar kartu kode', '/images/hero-v3/slide-03-big10-type.png'),
    block('matchCard', 'Kartu sesi pertama (tidak tampil di ponsel)'),
    text('matchTitle', 'Judul kartu sesi', 'SESI PERTAMA · GRATIS', 'FIRST SESSION · FREE'),
    text('matchText', 'Isi kartu sesi', 'Bahas hasilnya bersama psikolog yang cocok.', 'Talk it through with a psychologist who fits.'),
    block('avatars', 'Deretan foto kecil'),
    image('avatar1', 'Foto kecil 1', '/images/hero-v3/slide-03-avatar-1.jpg'),
    image('avatar2', 'Foto kecil 2', '/images/hero-v3/slide-03-avatar-2.jpg'),
    image('avatar3', 'Foto kecil 3', '/images/hero-v3/slide-03-avatar-3.jpg'),
    image('avatar4', 'Foto kecil 4', '/images/hero-v3/slide-03-avatar-4.jpg'),
    text('matchHint', 'Keterangan di samping foto', 'Disesuaikan dengan\nhasil & kebutuhanmu', 'Matched to your\nresults & needs'),
    block('pill', 'Pil kanan atas'),
    text('pillText', 'Tulisan pil', 'Contoh laporan', 'Example report'),
  ],
  'scientific-brief': [
    ...COPY,
    block('chips', 'Deretan judul brief'),
    block('leftSheet', 'Lembar belakang kiri (tidak tampil di ponsel)'),
    image('leftImage', 'Gambar lembar kiri', '/images/hero-v3/slide-04-brief-dec.png'),
    block('rightSheet', 'Lembar belakang kanan'),
    image('rightImage', 'Gambar lembar kanan', '/images/hero-v3/slide-04-brief-catdog.png'),
    block('badge', 'Label di lembar depan'),
    text('badgeText', 'Tulisan label', 'November · More Than Mine'),
    block('stat', 'Kartu angka biru'),
    text('statNumber', 'Angka besar', '1 dari 5', '1 in 5'),
    text('statText', 'Kalimat angka', 'Orang dewasa di Indonesia rela berkorban nyawa demi kucing atau anjingnya.', 'Indonesian adults would give their life for their cat or dog.'),
    text('statSource', 'Sumber angka', 'N = 2,885 · Nov brief'),
    block('pill', 'Pil kanan bawah (tidak tampil di ponsel)'),
    text('pillText', 'Tulisan pil', 'Terbit tiap bulan', 'New every month'),
  ],
  'wisdom-ella': [
    ...COPY,
    block('quote', 'Kartu kutipan (tidak tampil di ponsel)'),
    { key: 'quoteText', label: 'Kutipan (kosong = dari profil psikolog)', kind: 'text' },
    text('quoteAuthor', 'Nama di bawah kutipan', '— ELLA'),
    block('focus', 'Kartu fokus biru (tidak tampil di ponsel)'),
    text('focusTitle', 'Judul kartu fokus', 'FOKUS PENDAMPINGANNYA', 'SHE OFTEN WORKS WITH'),
    { key: 'focusList', label: 'Daftar fokus, satu per baris (kosong = dari profil psikolog)', kind: 'text' },
    block('pill', 'Pil kanan bawah'),
    text('pillText', 'Tulisan pil', 'Berpraktik sejak 2010', 'Practicing since 2010'),
    block('facts', 'Tiga fakta di bawah deskripsi'),
    text('fact1Title', 'Fakta 1: judul', '15+ thn', '15+ yrs'),
    text('fact1Text', 'Fakta 1: keterangan', 'berpraktik sejak 2010', 'practicing since 2010'),
    text('fact2Title', 'Fakta 2: judul', 'International experienced'),
    text('fact2Text', 'Fakta 2: keterangan', 'dukungan psikososial bagi pekerja kemanusiaan untuk UN-IOM Asia Pacific Regional', 'psychosocial support for humanitarian workers for UN-IOM Asia Pacific Regional'),
    text('fact3Title', 'Fakta 3: judul', 'Trauma-informed'),
    text('fact3Text', 'Fakta 3: keterangan', 'Brainspotting · DBT Art therapy'),
  ],
}
