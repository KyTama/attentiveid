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

export const listMhcuSubmissions = async (status?: AssessmentStatus) =>
  (await request<{ data?: AssessmentListItem[] }>(`/api/admin/assessments/mhcu${status ? `?status=${status}` : ''}`)).data ?? []

export const getAssessment = async (id: string) =>
  (await request<{ data: AssessmentDetail }>(`/api/admin/assessments/${encodeURIComponent(id)}`)).data

export const reviewAssessment = async (id: string, status: AssessmentStatus, note: string) =>
  (await request<{ data: AssessmentDetail }>(`/api/admin/assessments/${encodeURIComponent(id)}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, note }),
  })).data
