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
  /** When the person sent a proof of transfer (the API adds this to the list); null/absent = no proof yet. */
  paymentSubmittedAt?: string | null
  /** What they say they paid for: 'single' | 'package3'. */
  paymentFor?: string | null
  /** mandiri | asesmen | free | paket | lanjutan | legacy; absent on older API versions. */
  track?: string
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
  /** When the full report was released to the person. */
  reportSentAt?: string | null
  /**
   * OPTIONAL HOOK (invites API): remaining credits of a 3x package. The field name is a guess until the invites API is final;
   * change it here (and in `creditsOf`) only.
   */
  creditsRemaining?: number | null
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

/** Saves (or saves again) the released report to Google Drive; returns the folder path. */
export const saveReportToDrive = async (id: string): Promise<{ path: string }> =>
  (await request<{ data: { path: string } }>(`${base(id)}/save-to-drive`, { method: 'POST' })).data

export const releaseReport = async (id: string): Promise<{ released: boolean; emailed: boolean; drivePath?: string | null; drive?: 'off' | 'saved' | 'failed'; driveError?: string | null }> =>
  (await request<{ data: { released: boolean; emailed: boolean; drivePath?: string | null; drive?: 'off' | 'saved' | 'failed'; driveError?: string | null } }>(`${base(id)}/release-report`, { method: 'POST' })).data

/**
 * Opens a report as a print-ready page in a new tab. The page needs the staff login, so it is fetched here and shown from a
 * temporary local address; `<base>` makes the logo and font links work from there.
 */
export const openReport = async (id: string, kind: 'client' | 'psychologist', lang?: 'id' | 'en'): Promise<void> => {
  const tab = window.open('', '_blank')
  if (tab) tab.opener = null
  try {
    const response = await fetch(`${base(id)}/report/${kind}${lang ? `?lang=${lang}` : ''}`, { credentials: 'include', headers: { ...getActiveAuthHeaders() } })
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

/* ------------------------------ history of one person ------------------------------ */

export interface HistoryWave {
  id: string
  code: string
  waveNo: number
  /** YYYY-MM-DD */
  date: string
  mhi: number | null
  di: number | null
  wi: number | null
  bhi: number | null
  level: number
  deltaMhi: number | null
  daysSincePrev: number | null
}

export interface HistoryData {
  participantNo: number | null
  nSessions: number
  spanDays: number
  /** id of the check-up that is open */
  current: string
  waves: HistoryWave[]
}

export const getHistory = async (id: string): Promise<HistoryData> => (await request<{ data: HistoryData }>(`${base(id)}/history`)).data

/** Sends the result e-mail again (admin). */
export const resendResult = async (id: string): Promise<{ sent: boolean }> =>
  (await request<{ data: { sent: boolean } }>(`${base(id)}/resend-result`, { method: 'POST' })).data

/* ------------------------------------ overview ------------------------------------ */

export interface Overview {
  sessions: number
  participants: number
  returning: number
  /** Count per level, index 0 = level 1. */
  levels: number[]
  meanMhi: number | null
  meanChange: number | null
  months: { m: string; n: number; mhi: number | null }[]
  unpaid: number
  awaitingConfirmation: number
  notesToFinish: number
  readyNotReleased: number
  notAssigned: number
}

export const getOverview = async (): Promise<Overview> =>
  (await request<{ data: Overview }>('/api/admin/assessments/mhcu/overview')).data

/* ------------------------------------ settings ------------------------------------ */

export interface MhcuSettings {
  pricing: {
    single: { normal: number; promo: number }
    package3: { normal: number; promo: number }
    /** YYYY-MM-DD */
    promoUntil: string
  }
  alertLevel: number
  alertEmail: string
  autoAssign: boolean
  autoSend: boolean
}

export const getSettings = async (): Promise<MhcuSettings> =>
  (await request<{ data: MhcuSettings }>('/api/admin/assessments/mhcu/settings')).data

export const saveSettings = async (settings: MhcuSettings): Promise<MhcuSettings> =>
  (await request<{ data: MhcuSettings }>('/api/admin/assessments/mhcu/settings', put(settings))).data

/* ------------------------------------- invites -------------------------------------
 * Contract = docs/assessments-work/dashboard-spec.md section 3. The invites API is still being built: if a name or shape
 * differs, change this block only (the pages use the types below, never the raw JSON). */

export type InviteTrack = 'asesmen' | 'free'
export type InviteStatus = 'OPEN' | 'USED' | 'CANCELLED'

export interface Invite {
  id: string
  track: InviteTrack
  psychologistId: string | null
  psychologistName: string | null
  clientName: string | null
  clientEmail: string | null
  clientPhone?: string | null
  note: string | null
  status: InviteStatus
  createdAt: string
  usedAt?: string | null
  url: string
}

export interface NewInvite {
  track: InviteTrack
  psychologistId: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  note?: string
}

const INVITES = '/api/admin/assessments/mhcu/invites'

export const listInvites = async (): Promise<Invite[]> => {
  const json = await request<{ data?: Invite[] }>(INVITES)
  return json.data ?? []
}

export const createInvite = async (input: NewInvite): Promise<{ invite: Invite; url: string; invites: Invite[] }> =>
  (await request<{ data: { invite: Invite; url: string; invites: Invite[] } }>(INVITES, { method: 'POST', body: JSON.stringify(input) })).data

export const cancelInvite = async (id: string): Promise<Invite[]> =>
  (await request<{ data?: Invite[] }>(`${INVITES}/${encodeURIComponent(id)}`, { method: 'DELETE' })).data ?? []

/** Remaining package credits of the person, when the API gives them (see `creditsRemaining`). */
export const creditsOf = (detail: Pick<MhcuDetail, 'creditsRemaining'>): number | null =>
  typeof detail.creditsRemaining === 'number' && detail.creditsRemaining > 0 ? detail.creditsRemaining : null
