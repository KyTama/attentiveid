/**
 * Featured products (for example "Let there be light"): listed in the site's Featured menu while
 * their featured period is running. The period (start/end) is an admin setting and is never shown to visitors.
 */

export const FEATURED_PRODUCT_STATES = ['active', 'scheduled', 'ended', 'disabled'] as const
export type FeaturedProductState = typeof FEATURED_PRODUCT_STATES[number]

/** Card looks, same options as the homepage strip's own card editor. */
export const FEATURED_CARD_THEMES = ['gold', 'navy', 'blue', 'emerald'] as const
export type FeaturedCardTheme = typeof FEATURED_CARD_THEMES[number]

export const FEATURED_CARD_ICONS = ['gift', 'calendar', 'clipboard', 'sparkles', 'shield', 'message'] as const
export type FeaturedCardIcon = typeof FEATURED_CARD_ICONS[number]

export interface FeaturedProductInput {
  slug: string
  titleId: string
  titleEn: string
  descriptionId: string
  descriptionEn: string
  /** Card look and icon on the homepage strip. */
  theme: FeaturedCardTheme
  icon: FeaturedCardIcon
  /** Small label at the top of the card (empty = default "Produk Baru"). */
  badgeId: string
  badgeEn: string
  /** Button text at the bottom of the card (empty = default "Buka" / "Segera Hadir"). */
  ctaId: string
  ctaEn: string
  /** Internal path ("/let-there-be-light") or https URL. Empty = "coming soon" (listed, not clickable). */
  url: string
  /** ISO timestamps; null = open-ended. */
  startAt: string | null
  endAt: string | null
  enabled: boolean
  sortOrder: number
}

export type FeaturedProductField = keyof FeaturedProductInput

export type FeaturedProductValidationResult =
  | { ok: true; value: FeaturedProductInput }
  | { ok: false; errors: Partial<Record<FeaturedProductField, string>> }

export interface FeaturedProductPublicDto {
  id: string
  slug: string
  title: { id: string; en: string }
  description: { id: string; en: string }
  theme: FeaturedCardTheme
  icon: FeaturedCardIcon
  badge: { id: string; en: string }
  cta: { id: string; en: string }
  /** null = coming soon */
  url: string | null
}

export interface FeaturedProductAdminDto extends FeaturedProductPublicDto {
  startAt: string | null
  endAt: string | null
  enabled: boolean
  sortOrder: number
  state: FeaturedProductState
  createdAt: string
  updatedAt: string
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const parseDate = (value: unknown): { ok: true; iso: string | null } | { ok: false } => {
  if (value === null || value === undefined || value === '') return { ok: true, iso: null }
  const text = asString(value)
  const ms = Date.parse(text)
  return Number.isNaN(ms) ? { ok: false } : { ok: true, iso: new Date(ms).toISOString() }
}

/** Internal path or http(s) URL. Returns null when the value is not usable. */
export const normalizeFeaturedUrl = (value: string): string | null => {
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

export const validateFeaturedProductInput = (input: unknown): FeaturedProductValidationResult => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Partial<Record<FeaturedProductField, string>> = {}

  const titleId = asString(raw.titleId)
  const titleEn = asString(raw.titleEn) || titleId
  if (titleId.length < 2 || titleId.length > 80) errors.titleId = 'Nama produk wajib diisi (maks 80 karakter).'
  if (titleEn.length > 80) errors.titleEn = 'Maks 80 karakter.'

  const descriptionId = asString(raw.descriptionId)
  const descriptionEn = asString(raw.descriptionEn) || descriptionId
  if (descriptionId.length > 200) errors.descriptionId = 'Maks 200 karakter.'
  if (descriptionEn.length > 200) errors.descriptionEn = 'Maks 200 karakter.'

  const themeRaw = asString(raw.theme) || 'blue'
  if (!(FEATURED_CARD_THEMES as readonly string[]).includes(themeRaw)) errors.theme = 'Pilih salah satu tema kartu.'
  const iconRaw = asString(raw.icon) || 'sparkles'
  if (!(FEATURED_CARD_ICONS as readonly string[]).includes(iconRaw)) errors.icon = 'Pilih salah satu ikon.'

  const badgeId = asString(raw.badgeId)
  const badgeEn = asString(raw.badgeEn) || badgeId
  if (badgeId.length > 30) errors.badgeId = 'Maks 30 karakter.'
  if (badgeEn.length > 30) errors.badgeEn = 'Maks 30 karakter.'
  const ctaId = asString(raw.ctaId)
  const ctaEn = asString(raw.ctaEn) || ctaId
  if (ctaId.length > 40) errors.ctaId = 'Maks 40 karakter.'
  if (ctaEn.length > 40) errors.ctaEn = 'Maks 40 karakter.'

  const url = normalizeFeaturedUrl(asString(raw.url))
  if (url === null) errors.url = 'Isi dengan alamat halaman (mis. /let-there-be-light) atau https://...'

  const start = parseDate(raw.startAt)
  const end = parseDate(raw.endAt)
  if (!start.ok) errors.startAt = 'Tanggal mulai tidak valid.'
  if (!end.ok) errors.endAt = 'Tanggal selesai tidak valid.'
  if (start.ok && end.ok && start.iso && end.iso && Date.parse(end.iso) <= Date.parse(start.iso)) {
    errors.endAt = 'Tanggal selesai harus setelah tanggal mulai.'
  }

  const sortOrder = raw.sortOrder === undefined || raw.sortOrder === '' ? 0 : Number(raw.sortOrder)
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 1000) errors.sortOrder = 'Urutan 0–1000.'

  const slug = asString(raw.slug) || titleEn.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
  if (!SLUG_PATTERN.test(slug)) errors.slug = 'Slug tidak valid (huruf kecil, angka, tanda hubung).'

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: {
      slug,
      titleId,
      titleEn,
      descriptionId,
      descriptionEn,
      theme: themeRaw as FeaturedCardTheme,
      icon: iconRaw as FeaturedCardIcon,
      badgeId,
      badgeEn,
      ctaId,
      ctaEn,
      url: url ?? '',
      startAt: start.ok ? start.iso : null,
      endAt: end.ok ? end.iso : null,
      enabled: raw.enabled === undefined ? true : Boolean(raw.enabled),
      sortOrder,
    },
  }
}

export const featuredProductState = (
  product: { enabled: boolean; startAt: string | null; endAt: string | null },
  now: Date = new Date(),
): FeaturedProductState => {
  if (!product.enabled) return 'disabled'
  const time = now.getTime()
  if (product.startAt && Date.parse(product.startAt) > time) return 'scheduled'
  if (product.endAt && Date.parse(product.endAt) <= time) return 'ended'
  return 'active'
}
