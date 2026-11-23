import { createHmac, timingSafeEqual } from 'node:crypto'

/** Where people send the transfer, and what the full report costs (same prices as the check-up page). */
export const PAYMENT_ACCOUNT = {
    bank: 'BCA',
    number: '4500499562',
    holder: 'Atensi Kini Group PT'
} as const

export const WHATSAPP_NUMBER = '6285156410912'

export type PaymentFor = 'single' | 'package3'
export const PAYMENT_OPTIONS: Record<PaymentFor, { amount: number; normal: number; labelId: string; labelEn: string }> = {
    single: { amount: 227_000, normal: 297_000, labelId: 'Laporan Lengkap MHCU (1x pemeriksaan)', labelEn: 'Full MHCU report (1 check-up)' },
    package3: { amount: 647_000, normal: 885_000, labelId: 'Paket Laporan Lengkap MHCU (3x pemeriksaan)', labelEn: 'Full MHCU report package (3 check-ups)' }
}
/** The prices above are introductory until this date (Jakarta); after it the normal price applies. */
export let PROMO_UNTIL = '2027-04-30'
/** Staff can move the promo end date in the dashboard settings. */
export const setPromoUntil = (day: string): void => {
    PROMO_UNTIL = day
}

export const isPaymentFor = (value: unknown): value is PaymentFor => value === 'single' || value === 'package3'

export const priceFor = (option: PaymentFor, today: Date = new Date()): number => {
    const jakartaDay = new Date(today.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10)
    const prices = PAYMENT_OPTIONS[option]
    return jakartaDay <= PROMO_UNTIL ? prices.amount : prices.normal
}

/** A short signed token so the link in the e-mail only works for the person it was sent to (the result code alone is not enough). */
export const paymentToken = (secret: string, code: string): string =>
    createHmac('sha256', secret).update(`payment:${code}`).digest('base64url').slice(0, 24)

export const verifyPaymentToken = (secret: string, code: string, token: unknown): boolean => {
    if (typeof token !== 'string' || token.length !== 24) return false
    const expected = Buffer.from(paymentToken(secret, code))
    const given = Buffer.from(token)
    return expected.length === given.length && timingSafeEqual(expected, given)
}

export const paymentLink = (origin: string, secret: string, code: string, lang: string): string =>
    `${origin.replace(/\/$/, '')}/assessments/payment?id=${encodeURIComponent(code)}&t=${paymentToken(secret, code)}${lang === 'en' ? '&lang=en' : ''}`

/** What the proof of transfer may be: a screenshot or a PDF receipt, up to 5 MB. */
export const PROOF_MAX_BYTES = 5 * 1024 * 1024

export const detectProofType = (buffer: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf' | null => {
    if (buffer.length < 12) return null
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png'
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
    if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
    if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf'
    return null
}
