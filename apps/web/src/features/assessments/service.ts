import { getActiveAuthHeaders } from '../auth/auth-context'

export type AssessmentStatus = 'new' | 'reviewed' | 'released'

export interface AssessmentListItem {
  id: string
  code: string
  instrument: string
  name: string
  age: number
  email: string
  phone: string
  level: number | null
  status: AssessmentStatus
  researchConsent: boolean
  createdAt: string
}

export interface AssessmentDetail extends AssessmentListItem {
  lang: string
  track: string
  sex: string | null
  guardian: boolean
  consentVersion: string
  answers: Record<string, number>
  /** The scoring result (see scoreMhcu in the shared package). Shown defensively: new fields appear without a page change. */
  scores: Record<string, unknown>
  durationSec: number | null
  reviewerNote: string | null
  reviewedAt: string | null
  releasedAt: string | null
  sheetSyncedAt: string | null
  sheetError: string | null
  resultEmailSentAt?: string | null
  paymentFor?: 'single' | 'package3' | null
  paymentSubmittedAt?: string | null
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      ...getActiveAuthHeaders(),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(json?.message || `Permintaan gagal (${response.status})`)
  return json as T
}

export type AssessmentInstrument = 'mhcu' | 'gsc'

export const listSubmissions = async (instrument: AssessmentInstrument, status?: AssessmentStatus) =>
  (await request<{ data?: AssessmentListItem[] }>(`/api/admin/assessment-lists/${instrument}${status ? `?status=${status}` : ''}`)).data ?? []

export const getAssessment = async (id: string) =>
  (await request<{ data: AssessmentDetail }>(`/api/admin/assessments/${encodeURIComponent(id)}`)).data

export const reviewAssessment = async (id: string, status: AssessmentStatus, note: string) =>
  (await request<{ data: AssessmentDetail }>(`/api/admin/assessments/${encodeURIComponent(id)}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, note }),
  })).data

/** Opens the proof of transfer a participant uploaded. It needs the staff login, so it is fetched and shown from a temporary local address. */
export const openPaymentProof = async (id: string): Promise<void> => {
  // Open the tab right away (still inside the click, so pop-up blockers allow it), then point it at the file once it is loaded.
  const tab = window.open('', '_blank')
  if (tab) tab.opener = null
  try {
    const response = await fetch(`/api/admin/assessments/${encodeURIComponent(id)}/proof`, { credentials: 'include', headers: { ...getActiveAuthHeaders() } })
    if (!response.ok) throw new Error(response.status === 404 ? 'Belum ada bukti transfer.' : `Bukti belum bisa dimuat (${response.status})`)
    const url = URL.createObjectURL(await response.blob())
    if (tab) tab.location.href = url
    else window.open(url, '_blank')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (caught) {
    tab?.close()
    throw caught
  }
}

/** Permanently deletes one result (owner account only; the API refuses everyone else). */
export const deleteAssessment = async (id: string) =>
  (await request<{ data: { id: string; code: string } }>(`/api/admin/assessments/${encodeURIComponent(id)}`, { method: 'DELETE' })).data
