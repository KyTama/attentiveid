/**
 * The gift that opens on the public pages: where it shows, how often, what it looks like, and the letter inside.
 * Edited in the portal (Pengaturan Situs > Hadiah). The cats' own switches live in site-settings.ts.
 */

/** Pages (sections) where the gift can be switched on. Sub pages follow their section. */
export const GIFT_PAGES = [
  { path: '/', labelId: 'Beranda', labelEn: 'Home' },
  { path: '/our-services', labelId: 'Layanan kami', labelEn: 'Our services' },
  { path: '/psychologists', labelId: 'Psikolog (daftar dan profil)', labelEn: 'Psychologists (list and profiles)' },
  { path: '/articles', labelId: 'Artikel (daftar dan isi artikel)', labelEn: 'Articles (list and article pages)' },
  { path: '/sci-brief', labelId: 'Sci-Brief (daftar dan edisi)', labelEn: 'Sci-Brief (list and issues)' },
] as const

/** Never with a gift: the forms and the page where prayers are written. */
export const GIFT_BLOCKED_PAGES = [
  { path: '/free-session', labelId: 'Formulir Sesi Gratis', labelEn: 'Free Session form' },
  { path: '/booking', labelId: 'Formulir Booking', labelEn: 'Booking form' },
  { path: '/let-there-be-light', labelId: 'Let There Be Light', labelEn: 'Let There Be Light' },
] as const

export type GiftPagePath = typeof GIFT_PAGES[number]['path']

export const GIFT_FREQUENCIES = ['session', 'day', 'always'] as const
export type GiftFrequency = typeof GIFT_FREQUENCIES[number]

export const GIFT_PRAYER_TOKEN = '[Prayer]'
export const GIFT_MESSAGE_MAX = 1200

export interface GiftSettings {
  enabled: boolean
  pages: Record<GiftPagePath, boolean>
  /** session: once per browser session; day: once a day; always: on every visit (for testing). */
  frequency: GiftFrequency
  /** Empty = the built-in 3D red box with a yellow ribbon. */
  giftImageUrl: string
  /** The two faces of the letter's seal. Empty = the Attentive mark and the lights logo. */
  sealFrontUrl: string
  sealBackUrl: string
  /** Letter text. [Prayer] is replaced by the prayer. */
  messageId: string
  messageEn: string
  showName: boolean
  showCity: boolean
  /** auto: a new prayer can be shown at once; manual: an admin approves it first. */
  moderation: 'auto' | 'manual'
}

export const DEFAULT_GIFT_MESSAGE_EN = `Hi there!
Greetings, glad you open this gift for you. I know that you might be tired, stressed, and or exhausted. Here's a prayer special for you

${GIFT_PRAYER_TOKEN}

Hope you feeling well! have a great day!`

export const DEFAULT_GIFT_MESSAGE_ID = `Hai!
Senang sekali kamu membuka hadiah ini. Aku tahu kamu mungkin sedang lelah, stres, atau kewalahan. Ini doa khusus untukmu

${GIFT_PRAYER_TOKEN}

Semoga kamu baik-baik saja! Selamat menjalani harimu!`

export const DEFAULT_GIFT: GiftSettings = {
  enabled: true,
  pages: Object.fromEntries(GIFT_PAGES.map((page) => [page.path, page.path === '/'])) as Record<GiftPagePath, boolean>,
  frequency: 'session',
  giftImageUrl: '',
  sealFrontUrl: '',
  sealBackUrl: '',
  messageId: DEFAULT_GIFT_MESSAGE_ID,
  messageEn: DEFAULT_GIFT_MESSAGE_EN,
  showName: true,
  showCity: true,
  moderation: 'auto',
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const imageUrlOk = (value: string) => value === '' || (value.startsWith('/') && !value.startsWith('//')) || /^https:\/\//.test(value)

export type GiftValidation = { ok: true; value: GiftSettings } | { ok: false; errors: Record<string, string> }

export const validateGift = (input: unknown): GiftValidation => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Record<string, string> = {}
  const pagesRaw = (raw.pages && typeof raw.pages === 'object' ? raw.pages : {}) as Record<string, unknown>
  const pages = Object.fromEntries(
    GIFT_PAGES.map((page) => [page.path, page.path in pagesRaw ? pagesRaw[page.path] === true : DEFAULT_GIFT.pages[page.path]]),
  ) as Record<GiftPagePath, boolean>

  const frequency = (GIFT_FREQUENCIES as readonly string[]).includes(asString(raw.frequency)) ? (asString(raw.frequency) as GiftFrequency) : DEFAULT_GIFT.frequency

  const giftImageUrl = asString(raw.giftImageUrl)
  const sealFrontUrl = asString(raw.sealFrontUrl)
  const sealBackUrl = asString(raw.sealBackUrl)
  if (!imageUrlOk(giftImageUrl)) errors.giftImageUrl = 'Gambar harus berupa alamat /media/... atau https://...'
  if (!imageUrlOk(sealFrontUrl)) errors.sealFrontUrl = 'Gambar harus berupa alamat /media/... atau https://...'
  if (!imageUrlOk(sealBackUrl)) errors.sealBackUrl = 'Gambar harus berupa alamat /media/... atau https://...'

  const messageId = typeof raw.messageId === 'string' && raw.messageId.trim() ? raw.messageId.replace(/\r\n/g, '\n').trim() : DEFAULT_GIFT.messageId
  const messageEn =
    typeof raw.messageEn === 'string' && raw.messageEn.trim()
      ? raw.messageEn.replace(/\r\n/g, '\n').trim()
      : messageId === DEFAULT_GIFT.messageId
        ? DEFAULT_GIFT.messageEn
        : messageId
  for (const [key, message] of [['messageId', messageId], ['messageEn', messageEn]] as const) {
    if (message.length > GIFT_MESSAGE_MAX) errors[key] = `Maks ${GIFT_MESSAGE_MAX} karakter.`
    else if (!message.includes(GIFT_PRAYER_TOKEN)) errors[key] = `Teks surat harus memuat ${GIFT_PRAYER_TOKEN} di tempat doa akan muncul.`
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: {
      enabled: raw.enabled !== false,
      pages,
      frequency,
      giftImageUrl,
      sealFrontUrl,
      sealBackUrl,
      messageId,
      messageEn,
      showName: raw.showName !== false,
      showCity: raw.showCity !== false,
      moderation: raw.moderation === 'manual' ? 'manual' : 'auto',
    },
  }
}

/** The gift section a path belongs to, or null (forms, the prayer page, the portal and unknown pages never have a gift). */
export const giftPageFor = (pathname: string): GiftPagePath | null => {
  const path = pathname.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '') || '/'
  if (path === '/') return '/'
  const section = `/${path.split('/')[1]}`
  return (GIFT_PAGES as readonly { path: string }[]).some((page) => page.path === section) ? (section as GiftPagePath) : null
}

export const giftAllowedOn = (gift: GiftSettings, pathname: string): boolean => {
  if (!gift.enabled) return false
  const page = giftPageFor(pathname)
  return page !== null && gift.pages[page] === true
}

/** The letter text with the prayer (and, when the admin allows, the sender's name and city) put in. */
export const renderGiftMessage = (
  template: string,
  prayer: { text: string; name?: string; city?: string },
  options: { showName: boolean; showCity: boolean },
): string => {
  const parts = [options.showName ? (prayer.name ?? '').trim() : '', options.showCity ? (prayer.city ?? '').trim() : ''].filter(Boolean)
  const signature = parts.length > 0 ? `\n— ${parts.join(', ')}` : ''
  return template.split(GIFT_PRAYER_TOKEN).join(`${prayer.text.trim()}${signature}`)
}
