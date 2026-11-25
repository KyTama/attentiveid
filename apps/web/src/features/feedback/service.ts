import type { FeedbackErrors, FeedbackReport, FeedbackSubmission, UpdateLogEntry } from '@attentiveid/shared'
import { getActiveAuthHeaders } from '@/features/auth/auth-context'

export type FeedbackSendResult =
  | { status: 'success' }
  | { status: 'invalid'; errors: FeedbackErrors }
  | { status: 'rateLimited' }
  | { status: 'failed' }

export async function sendFeedback(values: FeedbackSubmission & { website: string }): Promise<FeedbackSendResult> {
  try {
    const response = await fetch('/api/public/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (response.ok) return { status: 'success' }
    if (response.status === 429) return { status: 'rateLimited' }
    const body = (await response.json().catch(() => null)) as { errors?: FeedbackErrors } | null
    if (response.status === 400 && body?.errors) return { status: 'invalid', errors: body.errors }
    return { status: 'failed' }
  } catch {
    return { status: 'failed' }
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: { ...getActiveAuthHeaders(), ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(json?.message || `Permintaan gagal (${response.status})`)
  return json as T
}

export const listFeedback = async () => (await request<{ data: FeedbackReport[] }>('/api/admin/feedback')).data

export const setFeedbackDone = (id: string, done: boolean) =>
  request(`/api/admin/feedback/${id}`, { method: 'PUT', body: JSON.stringify({ done }) })

export const deleteFeedback = (id: string) => request(`/api/admin/feedback/${id}`, { method: 'DELETE' })

export const listUpdateLog = async () => (await request<{ data: UpdateLogEntry[] }>('/api/admin/update-log')).data
