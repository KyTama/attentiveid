/**
 * Site settings edited in the portal (menu: Pengaturan Situs):
 *  - the floating quick bar at the bottom of the public pages
 *  - the browser tab (title and icon)
 */
import { FEATURED_CARD_ICONS, type FeaturedCardIcon } from './featured-product'

export const FLOATING_BAR_MAX_ITEMS = 4

export interface SiteText {
  id: string
  en: string
}

/** The round badge at the top centre of the bar: the lights logo, or a text link with an icon. */
export interface FloatingBarTop {
  visible: boolean
  mode: 'image' | 'link'
  /** Image for mode "image" ("/media/..." or "/images/..." or https). */
  imageUrl: string
  /** Text + icon for mode "link". Also used as the tooltip/alt text for the image. */
  label: SiteText
  icon: FeaturedCardIcon
  url: string
}

export interface FloatingBarItem {
  id: string
  visible: boolean
  label: SiteText
  icon: FeaturedCardIcon
  url: string
  /** Gold (highlighted) button. */
  highlight: boolean
}

export interface FloatingBarSettings {
  visible: boolean
  top: FloatingBarTop
  items: FloatingBarItem[]
}

export interface BrowserTabSettings {
  titleId: string
  titleEn: string
  /** Empty = the default Attentive icon. */
  faviconUrl: string
}

export interface SiteSettings {
  floatingBar: FloatingBarSettings
  browserTab: BrowserTabSettings
}

export const DEFAULT_FLOATING_BAR: FloatingBarSettings = {
  visible: true,
  top: {
    visible: true,
    mode: 'image',
    imageUrl: '/images/brand/attend-mark.png',
    label: { id: 'Attend', en: 'Attend' },
    icon: 'lightbulb',
    url: '/let-there-be-light',
  },
  items: [
    { id: 'free-session', visible: true, label: { id: 'Sesi Gratis Pertama', en: '1st Free Session' }, icon: 'gift', url: 'https://free-session.attentiveid.com', highlight: true },
    { id: 'booking', visible: true, label: { id: 'Booking Langsung', en: 'Direct Booking' }, icon: 'calendar', url: 'https://booking.attentiveid.com/', highlight: false },
    { id: 'personality-test', visible: true, label: { id: 'Tes Kepribadian Gratis', en: 'Free Personality Test' }, icon: 'clipboard', url: 'https://big10.attentiveid.com/', highlight: false },
  ],
}

export const DEFAULT_BROWSER_TAB: BrowserTabSettings = {
  titleId: 'Attentive.id — Biro Psikologi & Konseling Profesional',
  titleEn: 'Attentive.id — Professional Psychology & Counselling Bureau',
  faviconUrl: '',
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  floatingBar: DEFAULT_FLOATING_BAR,
  browserTab: DEFAULT_BROWSER_TAB,
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** Internal path ("/x"), https/http URL, or empty. Returns null when unusable. */
export const normalizeLinkUrl = (value: string): string | null => {
  const text = value.trim()
  if (!text) return ''
  if (text.startsWith('/') && !text.startsWith('//') && !/\s/.test(text)) return text
  try {
    const parsed = new URL(text)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : null
  } catch {
    return null
  }
}

const imageUrlOk = (value: string) => value === '' || (value.startsWith('/') && !value.startsWith('//')) || /^https:\/\//.test(value)

const icon = (value: unknown, fallback: FeaturedCardIcon): FeaturedCardIcon =>
  (FEATURED_CARD_ICONS as readonly string[]).includes(asString(value)) ? (asString(value) as FeaturedCardIcon) : fallback

const text = (value: unknown, fallback = ''): SiteText => {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
  const id = asString(raw.id) || fallback
  return { id, en: asString(raw.en) || id }
}

export type SettingsValidation<T> = { ok: true; value: T } | { ok: false; errors: Record<string, string> }

export const validateFloatingBar = (input: unknown): SettingsValidation<FloatingBarSettings> => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Record<string, string> = {}

  const topRaw = (raw.top && typeof raw.top === 'object' ? raw.top : {}) as Record<string, unknown>
  const mode = asString(topRaw.mode) === 'link' ? 'link' : 'image'
  const topLabel = text(topRaw.label)
  const topUrl = normalizeLinkUrl(asString(topRaw.url))
  const imageUrl = asString(topRaw.imageUrl)
  if (topUrl === null) errors['top.url'] = 'Alamat tautan tidak valid.'
  if (!imageUrlOk(imageUrl)) errors['top.imageUrl'] = 'Gambar harus berupa alamat /media/... atau https://...'
  if (topLabel.id.length > 40 || topLabel.en.length > 40) errors['top.label'] = 'Maks 40 karakter.'
  if (mode === 'link' && !topLabel.id) errors['top.label'] = 'Teks tautan wajib diisi.'
  if (mode === 'image' && !imageUrl) errors['top.imageUrl'] = 'Pilih gambar logo.'

  const itemsRaw = Array.isArray(raw.items) ? raw.items : []
  if (itemsRaw.length > FLOATING_BAR_MAX_ITEMS) errors.items = `Maks ${FLOATING_BAR_MAX_ITEMS} tombol.`
  const items: FloatingBarItem[] = []
  const seen = new Set<string>()
  itemsRaw.slice(0, FLOATING_BAR_MAX_ITEMS).forEach((entry, index) => {
    const item = (entry && typeof entry === 'object' ? entry : {}) as Record<string, unknown>
    const label = text(item.label)
    const url = normalizeLinkUrl(asString(item.url))
    let id = asString(item.id).toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 40) || `item-${index + 1}`
    while (seen.has(id)) id = `${id}-x`
    seen.add(id)
    if (!label.id) errors[`items.${index}.label`] = 'Teks tombol wajib diisi.'
    if (label.id.length > 40 || label.en.length > 40) errors[`items.${index}.label`] = 'Maks 40 karakter.'
    if (url === null) errors[`items.${index}.url`] = 'Alamat tautan tidak valid.'
    items.push({ id, visible: item.visible !== false, label, icon: icon(item.icon, 'sparkles'), url: url ?? '', highlight: Boolean(item.highlight) })
  })

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: {
      visible: raw.visible !== false,
      top: {
        visible: topRaw.visible !== false,
        mode,
        imageUrl,
        label: topLabel,
        icon: icon(topRaw.icon, 'lightbulb'),
        url: topUrl ?? '',
      },
      items,
    },
  }
}

export const validateBrowserTab = (input: unknown): SettingsValidation<BrowserTabSettings> => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Record<string, string> = {}
  const titleId = asString(raw.titleId)
  const titleEn = asString(raw.titleEn) || titleId
  if (titleId.length < 2 || titleId.length > 70) errors.titleId = 'Judul tab 2–70 karakter.'
  if (titleEn.length > 70) errors.titleEn = 'Maks 70 karakter.'
  const faviconUrl = asString(raw.faviconUrl)
  if (!imageUrlOk(faviconUrl)) errors.faviconUrl = 'Ikon harus berupa alamat /media/... atau https://...'
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { titleId, titleEn, faviconUrl } }
}

/** Fills anything missing/invalid in stored settings with the defaults, so the site never breaks. */
export const mergeSiteSettings = (stored: { floatingBar?: unknown; browserTab?: unknown } | null | undefined): SiteSettings => {
  const bar = stored?.floatingBar ? validateFloatingBar(stored.floatingBar) : null
  const tab = stored?.browserTab ? validateBrowserTab(stored.browserTab) : null
  return {
    floatingBar: bar?.ok ? bar.value : DEFAULT_FLOATING_BAR,
    browserTab: tab?.ok ? tab.value : DEFAULT_BROWSER_TAB,
  }
}
