import { fallbackPrayerFor, type PrayerField, type PrayerPublicDto } from '@attentiveid/shared'

export interface PrayerFormValues {
  prayer: string
  /** Honeypot: real people never see or fill this. */
  website: string
}

export type PrayerSubmitResult =
  | { status: 'success'; pendingApproval: boolean }
  | { status: 'invalid'; errors: Partial<Record<PrayerField, string>> }
  | { status: 'rateLimited'; message: string }
  | { status: 'failed' }

const apiBaseUrl = () => import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

export async function submitPrayer(values: PrayerFormValues): Promise<PrayerSubmitResult> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/public/prayers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const body = (await response.json().catch(() => null)) as
      | { errors?: Partial<Record<PrayerField, string>>; message?: string; data?: { pendingApproval?: boolean } }
      | null
    if (response.ok) return { status: 'success', pendingApproval: body?.data?.pendingApproval === true }
    if (response.status === 400 && body?.errors) return { status: 'invalid', errors: body.errors }
    if (response.status === 429) return { status: 'rateLimited', message: body?.message ?? 'Terlalu banyak percobaan. Coba lagi nanti.' }
    return { status: 'failed' }
  } catch {
    return { status: 'failed' }
  }
}

/** A random prayer for the gift. Never fails: a built-in prayer is used when there is none or the request breaks. */
export async function fetchGiftPrayer(lang: 'id' | 'en'): Promise<PrayerPublicDto> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/public/prayers/random`, { cache: 'no-store' })
    if (response.ok) {
      const json = (await response.json()) as { data?: PrayerPublicDto | null }
      if (json.data && typeof json.data.text === 'string' && json.data.text.trim()) return json.data
    }
  } catch {
    // fall through to the built-in prayers
  }
  return fallbackPrayerFor(lang)
}
