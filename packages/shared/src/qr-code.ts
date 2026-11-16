/**
 * Saved QR codes with a custom logo. Only the settings are stored; the image is generated in the
 * browser (error correction level H so a centre logo does not break scanning).
 */

export const QR_MAX_LOGO_BYTES = 150 * 1024
export const QR_LOGO_SCALE_RANGE = { min: 0.12, max: 0.26 } as const

export interface QrCodeInput {
  name: string
  targetUrl: string
  foreground: string
  background: string
  /** data:image/png|jpeg|webp;base64,... or empty for no logo. */
  logoDataUrl: string
  /** Logo width as a share of the QR width. */
  logoScale: number
}

export type QrCodeField = keyof QrCodeInput

export type QrCodeValidationResult =
  | { ok: true; value: QrCodeInput }
  | { ok: false; errors: Partial<Record<QrCodeField, string>> }

export interface QrCodeDto extends QrCodeInput {
  id: string
  createdAt: string
  updatedAt: string
}

const HEX = /^#[0-9a-fA-F]{6}$/
const LOGO = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/
const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/** Approximate decoded size of a base64 data URL. */
export const dataUrlBytes = (dataUrl: string): number => {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.floor((base64.length * 3) / 4)
}

export const validateQrCodeInput = (input: unknown): QrCodeValidationResult => {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const errors: Partial<Record<QrCodeField, string>> = {}

  const name = asString(raw.name)
  if (name.length < 2 || name.length > 80) errors.name = 'Nama wajib diisi (2–80 karakter).'

  const targetUrl = asString(raw.targetUrl)
  let validUrl = false
  try {
    const protocol = new URL(targetUrl).protocol
    validUrl = (protocol === 'https:' || protocol === 'http:') && targetUrl.length <= 1000
  } catch {
    validUrl = false
  }
  if (!validUrl) errors.targetUrl = 'Isi dengan alamat lengkap yang diawali https://'

  const foreground = asString(raw.foreground) || '#14284B'
  const background = asString(raw.background) || '#FFFFFF'
  if (!HEX.test(foreground)) errors.foreground = 'Warna tidak valid (#RRGGBB).'
  if (!HEX.test(background)) errors.background = 'Warna tidak valid (#RRGGBB).'

  const logoDataUrl = asString(raw.logoDataUrl)
  if (logoDataUrl) {
    if (!LOGO.test(logoDataUrl)) errors.logoDataUrl = 'Logo harus PNG, JPG, atau WebP.'
    else if (dataUrlBytes(logoDataUrl) > QR_MAX_LOGO_BYTES) errors.logoDataUrl = 'Ukuran logo maks 150 KB.'
  }

  const scale = raw.logoScale === undefined || raw.logoScale === '' ? 0.2 : Number(raw.logoScale)
  if (!Number.isFinite(scale) || scale < QR_LOGO_SCALE_RANGE.min || scale > QR_LOGO_SCALE_RANGE.max) {
    errors.logoScale = `Ukuran logo ${QR_LOGO_SCALE_RANGE.min}–${QR_LOGO_SCALE_RANGE.max}.`
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: { name, targetUrl, foreground, background, logoDataUrl, logoScale: scale },
  }
}
