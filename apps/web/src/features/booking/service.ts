import type {
  BookingAdminRecord,
  BookingPsychologistCatalogItem,
  BookingStatus,
  BookingSubmissionInput,
} from '@attentiveid/shared'
import { getActiveAuthHeaders } from '../auth/auth-context'

const apiBaseUrl = () =>
  import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

export interface BookingSubmitSuccessData {
  id: string
  bookingCode: string
  submittedAt: string
  baseRate: number
  assessmentFee: number
  totalRate: number
  whatsappRouting: {
    target: 'malang' | 'pusat'
    whatsappNumber: string
  }
}

export type BookingSubmitResult =
  | { ok: true; data: BookingSubmitSuccessData }
  | { ok: false; status: number; message: string; errors?: Record<string, string> }

export async function fetchBookingPsychologists(params?: {
  mode?: string
  location?: string
}): Promise<BookingPsychologistCatalogItem[]> {
  const qs = new URLSearchParams()
  if (params?.mode) qs.set('mode', params.mode)
  if (params?.location) qs.set('location', params.location)
  const suffix = qs.toString() ? `?${qs.toString()}` : ''

  const response = await fetch(`${apiBaseUrl()}/api/public/booking/psychologists${suffix}`)
  if (!response.ok) {
    throw new Error(`Gagal memuat data psikolog (${response.status})`)
  }
  const body = (await response.json()) as { status?: string; data?: BookingPsychologistCatalogItem[] }
  return Array.isArray(body.data) ? body.data : []
}

export async function submitPublicBooking(payload: BookingSubmissionInput): Promise<BookingSubmitResult> {
  try {
    const response = await fetch(`${apiBaseUrl()}/api/public/booking/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const body = (await response.json().catch(() => null)) as {
      status?: string
      data?: BookingSubmitSuccessData
      message?: string
      errors?: Record<string, string>
    } | null

    if (response.ok && body?.data) {
      return { ok: true, data: body.data }
    }

    return {
      ok: false,
      status: response.status,
      message: body?.message || 'Gagal mengirim pengajuan booking. Silakan coba lagi.',
      errors: body?.errors,
    }
  } catch {
    return {
      ok: false,
      status: 0,
      message: 'Koneksi bermasalah. Periksa jaringan internet kamu dan coba lagi.',
    }
  }
}

// ---- Admin Portal Services ------------------------------------------------

export interface AdminBookingFilters {
  status?: string
  consultationMode?: string
  location?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}

export interface AttributionSummaryBucket {
  key: string
  count: number
  online: number
  offline: number
}

export interface AttributionReportRow {
  id: string
  bookingCode: string
  submittedAt: string
  name: string
  status: BookingStatus
  consultationMode: string
  location: string | null
  marketingSource: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  campaignId: string | null
  adsetId: string | null
  adId: string | null
}

export interface BookingAttributionReport {
  total: number
  attributed: number
  unattributed: number
  rows: AttributionReportRow[]
  byCampaign: AttributionSummaryBucket[]
  byAdset: AttributionSummaryBucket[]
  byAd: AttributionSummaryBucket[]
}

const buildFilterQuery = (filters?: AdminBookingFilters): string => {
  if (!filters) return ''
  const qs = new URLSearchParams()
  if (filters.status) qs.set('status', filters.status)
  if (filters.consultationMode) qs.set('consultationMode', filters.consultationMode)
  if (filters.location) qs.set('location', filters.location)
  if (filters.search) qs.set('search', filters.search)
  if (filters.dateFrom) qs.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) qs.set('dateTo', filters.dateTo)
  if (filters.limit !== undefined) qs.set('limit', String(filters.limit))
  if (filters.offset !== undefined) qs.set('offset', String(filters.offset))
  return qs.toString() ? `?${qs.toString()}` : ''
}

const authHeaders = (extra?: Record<string, string>) => ({ ...getActiveAuthHeaders(), ...extra })

export async function listAdminBookings(filters?: AdminBookingFilters): Promise<{
  total: number
  records: BookingAdminRecord[]
}> {
  const response = await fetch(`${apiBaseUrl()}/api/admin/bookings${buildFilterQuery(filters)}`, {
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Gagal memuat daftar booking (${response.status})`)
  }
  const body = (await response.json()) as { data?: { total: number; records: BookingAdminRecord[] } }
  return body.data ?? { total: 0, records: [] }
}

export async function transitionAdminBookingStatus(
  id: string,
  payload: {
    status: BookingStatus
    confirmedStartAt?: string | null
    confirmedEndAt?: string | null
  },
): Promise<{ ok: true; record: BookingAdminRecord } | { ok: false; status: number; code?: string; message: string }> {
  const response = await fetch(`${apiBaseUrl()}/api/admin/bookings/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const body = (await response.json().catch(() => null)) as {
    data?: BookingAdminRecord
    code?: string
    message?: string
  } | null

  if (response.ok && body?.data) {
    return { ok: true, record: body.data }
  }
  return {
    ok: false,
    status: response.status,
    code: body?.code,
    message: body?.message || `Gagal memperbarui status (${response.status})`,
  }
}

/** Permanently deletes one booking (owner account only; the API refuses everyone else). */
export async function deleteAdminBooking(id: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl()}/api/admin/bookings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message || 'Gagal menghapus reservasi.')
  }
}

export async function retryAdminBookingWebhook(id: string): Promise<{
  ok: boolean
  deliveryId?: string
  message: string
}> {
  const response = await fetch(`${apiBaseUrl()}/api/admin/bookings/${encodeURIComponent(id)}/retry-webhook`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
  })
  const body = (await response.json().catch(() => null)) as {
    data?: { deliveryId: string }
    message?: string
  } | null

  return {
    ok: response.ok,
    deliveryId: body?.data?.deliveryId,
    message: body?.message || (response.ok ? 'Webhook dijadwalkan ulang.' : `Gagal (${response.status})`),
  }
}

export async function getAdminBookingAttribution(filters?: {
  dateFrom?: string
  dateTo?: string
}): Promise<BookingAttributionReport> {
  const response = await fetch(`${apiBaseUrl()}/api/admin/bookings/attribution${buildFilterQuery(filters)}`, {
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Gagal memuat laporan atribusi (${response.status})`)
  }
  const body = (await response.json()) as { data: BookingAttributionReport }
  return body.data
}

export async function downloadAdminBookingsCsv(filters?: AdminBookingFilters): Promise<Blob> {
  const response = await fetch(`${apiBaseUrl()}/api/admin/bookings/export.csv${buildFilterQuery(filters)}`, {
    headers: authHeaders(),
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error(`Gagal mengekspor CSV booking (${response.status})`)
  }
  return response.blob()
}
