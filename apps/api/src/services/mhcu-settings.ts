import { PAYMENT_OPTIONS, PROMO_UNTIL, setPromoUntil } from './assessment-payment'

/** What staff can change for the Mental Health Check-Up without a new release. Stored in site_settings (key mhcuSettings). */
export interface MhcuSettings {
    pricing: {
        single: { normal: number; promo: number }
        package3: { normal: number; promo: number }
        /** Last day (Jakarta, YYYY-MM-DD) the promo prices apply. */
        promoUntil: string
    }
    /** Results at this level or higher get the urgent subject in the admin inbox (and go to the psychologist when assigned). */
    alertLevel: number
    /** Where the copy of every result and the payment notices go. */
    alertEmail: string
    /** When a payment is confirmed and nobody is assigned yet, pick a psychologist automatically (fewest open cases first). */
    autoAssign: boolean
    /** Release the full report by itself once the payment is confirmed, a psychologist is assigned and the note is final. */
    autoSend: boolean
}

export const SETTINGS_KEY = 'mhcuSettings'

/** The built-in prices, captured when the server starts (before staff can change anything), so the defaults never move. */
const BUILT_IN = {
    single: { normal: PAYMENT_OPTIONS.single.normal, promo: PAYMENT_OPTIONS.single.amount },
    package3: { normal: PAYMENT_OPTIONS.package3.normal, promo: PAYMENT_OPTIONS.package3.amount },
    promoUntil: PROMO_UNTIL
}

export const defaultSettings = (alertEmail = 'contact@attentiveid.com'): MhcuSettings => ({
    pricing: {
        single: { ...BUILT_IN.single },
        package3: { ...BUILT_IN.package3 },
        promoUntil: BUILT_IN.promoUntil
    },
    alertLevel: 4,
    alertEmail,
    autoAssign: true,
    autoSend: false
})

const isMoney = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100_000_000
const isDay = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
const EMAIL = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[^\s@<>"']{2,}$/

export type SettingsResult = { ok: true; value: MhcuSettings } | { ok: false; error: string }

/** Checks a full settings body from the dashboard. Nothing is trusted: every field is checked. */
export const validateSettings = (body: unknown): SettingsResult => {
    const input = (body && typeof body === 'object' ? body : {}) as Record<string, any>
    const pricing = (input.pricing && typeof input.pricing === 'object' ? input.pricing : {}) as Record<string, any>
    const single = pricing.single ?? {}
    const package3 = pricing.package3 ?? {}
    if (![single.normal, single.promo, package3.normal, package3.promo].every(isMoney)) return { ok: false, error: 'Harga harus berupa angka rupiah utuh (0 sampai 100.000.000).' }
    if (single.promo > single.normal || package3.promo > package3.normal) return { ok: false, error: 'Harga promo tidak boleh lebih tinggi dari harga normal.' }
    if (!isDay(pricing.promoUntil)) return { ok: false, error: 'Tanggal akhir promo harus berformat YYYY-MM-DD.' }
    if (!Number.isInteger(input.alertLevel) || input.alertLevel < 1 || input.alertLevel > 5) return { ok: false, error: 'Level peringatan harus 1 sampai 5.' }
    if (typeof input.alertEmail !== 'string' || !EMAIL.test(input.alertEmail.trim())) return { ok: false, error: 'Alamat e-mail peringatan tidak valid.' }
    if (typeof input.autoAssign !== 'boolean' || typeof input.autoSend !== 'boolean') return { ok: false, error: 'Pengaturan otomatis tidak valid.' }
    return {
        ok: true,
        value: {
            pricing: {
                single: { normal: single.normal, promo: single.promo },
                package3: { normal: package3.normal, promo: package3.promo },
                promoUntil: pricing.promoUntil
            },
            alertLevel: input.alertLevel,
            alertEmail: input.alertEmail.trim(),
            autoAssign: input.autoAssign,
            autoSend: input.autoSend
        }
    }
}

/** Fills missing or damaged stored values from the defaults, so an old or hand-edited row can never break the site. */
export const mergeSettings = (stored: unknown, alertEmail?: string): MhcuSettings => {
    const defaults = defaultSettings(alertEmail)
    const result = validateSettings({ ...defaults, ...(stored && typeof stored === 'object' ? stored : {}), pricing: { ...defaults.pricing, ...((stored as any)?.pricing ?? {}) } })
    return result.ok ? result.value : defaults
}

/** Makes the prices and the promo date used by the e-mails, the payment page and the amounts shown in the dashboard. */
export const applyPricing = (settings: MhcuSettings): void => {
    PAYMENT_OPTIONS.single.normal = settings.pricing.single.normal
    PAYMENT_OPTIONS.single.amount = settings.pricing.single.promo
    PAYMENT_OPTIONS.package3.normal = settings.pricing.package3.normal
    PAYMENT_OPTIONS.package3.amount = settings.pricing.package3.promo
    setPromoUntil(settings.pricing.promoUntil)
}
