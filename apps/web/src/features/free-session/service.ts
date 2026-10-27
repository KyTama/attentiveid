import type { FreeSessionField } from '@attentiveid/shared'

export type FreeSessionFormValues = {
  eligible: '' | 'baru' | 'lama'
  name: string
  age: string
  gender: string
  phone: string
  email: string
  keluhan: string
  keluhanDetail: string
  agreed: boolean
  /** Honeypot: real people never see or fill this. */
  website: string
}

export type FreeSessionFieldErrors = Partial<Record<FreeSessionField, string>>

export type FreeSessionSubmitResult =
  | { status: 'success' }
  | { status: 'invalid'; errors: FreeSessionFieldErrors }
  | { status: 'rateLimited'; message: string }
  | { status: 'failed' }

const apiBaseUrl = () =>
  import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

export const FREE_SESSION_WHATSAPP_NUMBER =
  import.meta.env.VITE_FREE_SESSION_WA_NUMBER || '6285156410912'

export async function submitFreeSession(values: FreeSessionFormValues): Promise<FreeSessionSubmitResult> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/public/free-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (response.ok) return { status: 'success' }

    const body = (await response.json().catch(() => null)) as
      | { errors?: FreeSessionFieldErrors; message?: string }
      | null

    if (response.status === 400 && body?.errors) return { status: 'invalid', errors: body.errors }
    if (response.status === 429) {
      return { status: 'rateLimited', message: body?.message ?? 'Terlalu banyak percobaan. Coba lagi nanti.' }
    }
    return { status: 'failed' }
  } catch {
    return { status: 'failed' }
  }
}
