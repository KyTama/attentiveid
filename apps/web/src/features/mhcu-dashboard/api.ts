import { getActiveAuthHeaders } from '../auth/auth-context'
import type { AssessmentDetail, AssessmentListItem } from '../assessments/service'

/** Payment states staff can set. A report can only be released when the state is one of REPORT_READY_PAYMENT. */
export const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'FREE', 'INCLUDED', 'LEGACY'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]
/** Same list as the server (`REPORT_READY_PAYMENT`): the release button is only offered for these. */
export const REPORT_READY_PAYMENT: readonly string[] = ['PAID', 'FREE', 'INCLUDED', 'LEGACY']

export interface MhcuListItem extends AssessmentListItem {
  psychologistId: string | null
  paymentStatus: string
  waveNo: number | null
}

export interface MhcuDetail extends AssessmentDetail {
  psychologistId: string | null
  participantId: string | null
  waveNo: number | null
  noteTemplate: string | null
  noteCustom: string | null
  noteFinal: boolean
  noteUpdatedAt: string | null
  paymentStatus: string
  paymentPackage: string | null
  paymentAmount: number | null
  paymentRef: string | null
  adminAlertAt?: string | null
}

export interface PsychologistOption {
  id: string
  name: string
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

const base = (id: string) => `/api/admin/assessments/${encodeURIComponent(id)}`
const put = (body: unknown): RequestInit => ({ method: 'PUT', body: JSON.stringify(body) })

export const listMhcu = async (): Promise<MhcuListItem[]> =>
  (await request<{ data?: MhcuListItem[] }>('/api/admin/assessment-lists/mhcu')).data ?? []

export const getMhcu = async (id: string): Promise<MhcuDetail> => (await request<{ data: MhcuDetail }>(base(id))).data

export const listPsychologistOptions = async (): Promise<PsychologistOption[]> =>
  (await request<{ data?: PsychologistOption[] }>('/api/admin/assessment-psychologists')).data ?? []

export const assignPsychologist = async (id: string, psychologistId: string | null): Promise<MhcuDetail> =>
  (await request<{ data: MhcuDetail }>(`${base(id)}/psychologist`, put({ psychologistId }))).data

export interface NoteInput {
  /** Edited recommendation; null = use the standard text of the level. */
  template: string | null
  /** The psychologist's own addition, at most 500 characters. */
  custom: string | null
  final: boolean
}

export const saveNote = async (id: string, input: NoteInput): Promise<MhcuDetail> =>
  (await request<{ data: MhcuDetail }>(`${base(id)}/note`, put(input))).data

export interface PaymentInput {
  status: PaymentStatus
  package: string | null
  amount: number | null
  ref: string | null
}

export const savePayment = async (id: string, input: PaymentInput): Promise<MhcuDetail> =>
  (await request<{ data: MhcuDetail }>(`${base(id)}/payment`, put(input))).data

export const releaseReport = async (id: string): Promise<{ released: boolean; emailed: boolean }> =>
  (await request<{ data: { released: boolean; emailed: boolean } }>(`${base(id)}/release-report`, { method: 'POST' })).data

/**
 * Opens a report as a print-ready page in a new tab. The page needs the staff login, so it is fetched here and shown from a
 * temporary local address; `<base>` makes the logo and font links work from there.
 */
export const openReport = async (id: string, kind: 'client' | 'psychologist'): Promise<void> => {
  const tab = window.open('', '_blank')
  if (tab) tab.opener = null
  try {
    const response = await fetch(`${base(id)}/report/${kind}`, { credentials: 'include', headers: { ...getActiveAuthHeaders() } })
    if (!response.ok) throw new Error(response.status === 404 ? 'Laporan tidak ditemukan.' : `Laporan belum bisa dimuat (${response.status})`)
    const html = (await response.text()).replace('<head>', `<head><base href="${window.location.origin}/">`)
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
    if (tab) tab.location.href = url
    else window.open(url, '_blank')
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
  } catch (caught) {
    tab?.close()
    throw caught
  }
}
