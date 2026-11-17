/**
 * Prayers visitors write for each other on the Let There Be Light page. A random one is shown inside the gift.
 * Nothing but what the visitor typed is stored: an optional first name and city, and the prayer.
 */

export const PRAYER_MIN = 10
export const PRAYER_MAX = 400
export const PRAYER_NAME_MAX = 60
export const PRAYER_CITY_MAX = 60

export interface PrayerInput {
  name: string
  city: string
  prayer: string
}

export interface PrayerPublicDto {
  text: string
  /** Empty when the visitor left it out. */
  name: string
  city: string
}

export interface PrayerAdminDto {
  id: string
  name: string
  city: string
  prayer: string
  hidden: boolean
  createdAt: string
}

export type PrayerField = 'name' | 'city' | 'prayer'

export type PrayerValidation = { ok: true; value: PrayerInput } | { ok: false; errors: Partial<Record<PrayerField, string>> }

/** Links, e-mail addresses and phone numbers do not belong in a prayer shown to strangers. */
const CONTACT_LIKE = /(https?:\/\/|www\.|\b[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d[\d\s().-]{8,}\d)/i

const clean = (value: unknown) => (typeof value === 'string' ? value.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim() : '')

export const validatePrayerInput = (input: unknown): PrayerValidation => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const name = clean(raw.name).replace(/\n/g, ' ')
  const city = clean(raw.city).replace(/\n/g, ' ')
  const prayer = clean(raw.prayer)
  const errors: Partial<Record<PrayerField, string>> = {}

  if (prayer.length < PRAYER_MIN) errors.prayer = `Doa minimal ${PRAYER_MIN} karakter.`
  else if (prayer.length > PRAYER_MAX) errors.prayer = `Doa maksimal ${PRAYER_MAX} karakter.`
  else if (CONTACT_LIKE.test(prayer)) errors.prayer = 'Jangan menulis tautan, email, atau nomor telepon di dalam doa.'

  if (name.length > PRAYER_NAME_MAX) errors.name = `Nama maksimal ${PRAYER_NAME_MAX} karakter.`
  else if (CONTACT_LIKE.test(name)) errors.name = 'Nama tidak boleh berisi tautan, email, atau nomor telepon.'
  if (city.length > PRAYER_CITY_MAX) errors.city = `Kota maksimal ${PRAYER_CITY_MAX} karakter.`
  else if (CONTACT_LIKE.test(city)) errors.city = 'Kota tidak boleh berisi tautan, email, atau nomor telepon.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { name, city, prayer } }
}

/** Shown when nobody has written a prayer yet (or the list could not be loaded), so a gift is never empty. */
export const FALLBACK_PRAYERS: ReadonlyArray<{ id: string; en: string }> = [
  { id: 'Semoga hari ini terasa sedikit lebih ringan untukmu, dan kamu diberi tenaga untuk satu langkah kecil berikutnya.', en: 'May today feel a little lighter for you, and may you find the strength for one small next step.' },
  { id: 'Semoga kamu diberi ketenangan di tengah riuh pikiranmu, dan dikelilingi orang-orang yang memahami.', en: 'May you find calm in the noise of your thoughts, and be surrounded by people who understand.' },
  { id: 'Semoga lelahmu didengar, bebanmu dibagi, dan istirahatmu dicukupkan.', en: 'May your tiredness be heard, your load be shared, and your rest be enough.' },
  { id: 'Semoga kamu ingat bahwa kamu sudah berusaha, dan itu sudah berarti.', en: 'May you remember that you have been trying, and that it already means something.' },
  { id: 'Semoga ada cahaya kecil yang menemanimu malam ini, dan pagi yang lebih lembut esok hari.', en: 'May a small light keep you company tonight, and a gentler morning tomorrow.' },
  { id: 'Semoga hatimu dimudahkan, jalanmu dilapangkan, dan kamu diberi keberanian untuk meminta bantuan.', en: 'May your heart be eased, your path widened, and may you find the courage to ask for help.' },
  { id: 'Semoga kamu diberi kelembutan pada dirimu sendiri, seperti kamu lembut pada orang yang kamu sayangi.', en: 'May you be as gentle with yourself as you are with the people you love.' },
  { id: 'Semoga hal-hal baik menemukanmu hari ini, sekecil apa pun bentuknya.', en: 'May good things find you today, however small they are.' },
]

export const fallbackPrayerFor = (lang: 'id' | 'en', random: () => number = Math.random): PrayerPublicDto => {
  const pick = FALLBACK_PRAYERS[Math.floor(random() * FALLBACK_PRAYERS.length)] ?? FALLBACK_PRAYERS[0]
  return { text: lang === 'en' ? pick.en : pick.id, name: '', city: '' }
}
