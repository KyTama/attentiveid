import type { FeedbackErrors, FeedbackReport, FeedbackSubmission, UpdateLogEntry } from '@attentiveid/shared'
import { getActiveAuthHeaders } from '@/features/auth/auth-context'

export type FeedbackSendResult =
  | { status: 'success' }
  | { status: 'invalid'; errors: FeedbackErrors }
  | { status: 'rateLimited' }
  | { status: 'failed' }

export async function sendFeedback(values: FeedbackSubmission & { website: string }, files: File[] = []): Promise<FeedbackSendResult> {
  try {
    // Without files the report goes as JSON; with files as a form upload (the browser sets that header itself).
    let init: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) }
    if (files.length > 0) {
      const form = new FormData()
      for (const [key, value] of Object.entries(values)) form.append(key, value)
      for (const file of files) form.append('files', file)
      init = { method: 'POST', body: form }
    }
    const response = await fetch('/api/public/feedback', init)
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

export const copyFeedbackToDrive = async (id: string) =>
  (await request<{ data: FeedbackReport }>(`/api/admin/feedback/${id}/drive`, { method: 'POST' })).data

export const deleteFeedback = (id: string) => request(`/api/admin/feedback/${id}`, { method: 'DELETE' })

export const listUpdateLog = async () => (await request<{ data: UpdateLogEntry[] }>('/api/admin/update-log')).data
