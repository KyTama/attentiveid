/**
 * Link previews ("thumbnails" shown when a page link is shared) per page path.
 * Example: /free-session can have its own title, description and image.
 */

export interface SharePreviewInput {
  /** Normalised page path, e.g. "/free-session". "/" is the home page. */
  path: string
  title: string
  description: string
  /** Relative (/media/...) or https image URL; empty = use the default Attentive logo. */
  imageUrl: string
}

export type SharePreviewField = keyof SharePreviewInput

export type SharePreviewValidationResult =
  | { ok: true; value: SharePreviewInput }
  | { ok: false; errors: Partial<Record<SharePreviewField, string>> }

export interface SharePreviewDto extends SharePreviewInput {
  id: string
  updatedAt: string
}

export const DEFAULT_SHARE_IMAGE = '/images/og-attentive-logo.jpg'

/** "/Free-Session/?a=1#x" -> "/free-session". Returns null for anything that is not a page path. */
export const normalizeSharePath = (value: string): string | null => {
  const text = value.trim()
  if (!text.startsWith('/') || text.startsWith('//')) return null
  const cleaned = text.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, '')
  const path = cleaned === '' ? '/' : cleaned
  if (path.length > 200 || !/^\/[a-z0-9\-._~/%]*$/.test(path)) return null
  if (path.startsWith('/api/') || path.startsWith('/dashboard') || path.startsWith('/portal-gate')) return null
  return path
}

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export const validateSharePreviewInput = (input: unknown): SharePreviewValidationResult => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Partial<Record<SharePreviewField, string>> = {}

  const path = normalizeSharePath(asString(raw.path))
  if (path === null) errors.path = 'Alamat halaman harus diawali / (mis. /free-session).'

  const title = asString(raw.title)
  if (title.length > 90) errors.title = 'Maks 90 karakter.'
  const description = asString(raw.description)
  if (description.length > 200) errors.description = 'Maks 200 karakter.'

  const imageUrl = asString(raw.imageUrl)
  if (imageUrl) {
    const relative = imageUrl.startsWith('/') && !imageUrl.startsWith('//')
    let secure = false
    try {
      secure = new URL(imageUrl).protocol === 'https:'
    } catch {
      secure = false
    }
    if (!relative && !secure) errors.imageUrl = 'Gambar harus berupa alamat /media/... atau https://...'
  }

  if (!title && !description && !imageUrl) errors.title = 'Isi minimal judul, deskripsi, atau gambar.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, value: { path: path as string, title, description, imageUrl } }
}
