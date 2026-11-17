/**
 * Prayers visitors write for each other on the Let There Be Light page. A random one is shown inside the gift.
 * Prayers are anonymous: only the text the visitor typed is stored. No name, no city, nothing that identifies them.
 */

export const PRAYER_MIN = 10
export const PRAYER_MAX = 400

export interface PrayerInput {
  prayer: string
}

export interface PrayerPublicDto {
  text: string
}

export interface PrayerAdminDto {
  id: string
  prayer: string
  hidden: boolean
  createdAt: string
}

export type PrayerField = 'prayer'

export type PrayerValidation = { ok: true; value: PrayerInput } | { ok: false; errors: Partial<Record<PrayerField, string>> }

/** Links, e-mail addresses and phone numbers do not belong in a prayer shown to strangers. */
const CONTACT_LIKE = /(https?:\/\/|www\.|\b[\w.+-]+@[\w-]+\.[\w.-]+|\+?\d[\d\s().-]{8,}\d)/i

const clean = (value: unknown) => (typeof value === 'string' ? value.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim() : '')

export const validatePrayerInput = (input: unknown): PrayerValidation => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const prayer = clean(raw.prayer)
  const errors: Partial<Record<PrayerField, string>> = {}

  if (prayer.length < PRAYER_MIN) errors.prayer = `Doa minimal ${PRAYER_MIN} karakter.`
  else if (prayer.length > PRAYER_MAX) errors.prayer = `Doa maksimal ${PRAYER_MAX} karakter.`
  else if (CONTACT_LIKE.test(prayer)) errors.prayer = 'Jangan menulis tautan, email, atau nomor telepon di dalam doa.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  // anything else in the request (such as a name or a city) is ignored on purpose
  return { ok: true, value: { prayer } }
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
  return { text: lang === 'en' ? pick.en : pick.id }
}
