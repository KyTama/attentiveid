import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  BOOKING_BRANCH_LABELS,
  BOOKING_TRANSITIONS,
  type BookingAdminRecord,
  type BookingStatus,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '../../lib/motion'
import {
  downloadAdminBookingsCsv,
  getAdminBookingAttribution,
  listAdminBookings,
  retryAdminBookingWebhook,
  transitionAdminBookingStatus,
  type AdminBookingFilters,
  type BookingAttributionReport,
} from '../../features/booking/service'

type PortalTab = 'queue' | 'attribution'

const STATUS_META: Record<
  BookingStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  confirmed: {
    label: 'Confirmed',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  in_session: {
    label: 'In Session',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
}

const WEBHOOK_META: Record<string, { label: string; className: string }> = {
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  processing: { label: 'Processing', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  pending: { label: 'Queued', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  failed: { label: 'Failed', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  dead_letter: { label: 'Dead Letter', className: 'bg-red-100 text-red-800 border-red-300' },
}

const TRANSITION_LABELS: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: 'Set Pending', className: 'bg-amber-600 hover:bg-amber-700 text-white' },
  confirmed: { label: 'Konfirmasi Slot', className: 'bg-teal-600 hover:bg-teal-700 text-white' },
  in_session: { label: 'Mulai Sesi', className: 'bg-sky-600 hover:bg-sky-700 text-white' },
  completed: { label: 'Tandai Selesai', className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  cancelled: { label: 'Batalkan', className: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' },
}

const formatRupiah = (amount: number): string =>
  `Rp ${amount.toLocaleString('id-ID')}`

const formatWibDateTime = (iso: string | null): string => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  })
}

const toLocalInputValue = (iso: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function BookingsCmsPage() {
  const [activeTab, setActiveTab] = useState<PortalTab>('queue')

  // Queue filters & data
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [modeFilter, setModeFilter] = useState<string>('')
  const [locationFilter, setLocationFilter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const [records, setRecords] = useState<BookingAdminRecord[]>([])
  const [total, setTotal] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  // Status transition & retry state
  const [slotEditDraft, setSlotEditDraft] = useState<{
    recordId: string
    start: string
    end: string
  } | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [slotConflictError, setSlotConflictError] = useState<string | null>(null)
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Attribution report state
  const [attrDateFrom, setAttrDateFrom] = useState('')
  const [attrDateTo, setAttrDateTo] = useState('')
  const [attribution, setAttribution] = useState<BookingAttributionReport | null>(null)
  const [attrLoading, setAttrLoading] = useState(false)

  const currentFilters = useCallback(
    (): AdminBookingFilters => ({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(modeFilter ? { consultationMode: modeFilter } : {}),
      ...(locationFilter ? { location: locationFilter } : {}),
      ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      limit: 100,
    }),
    [statusFilter, modeFilter, locationFilter, searchQuery, dateFrom, dateTo],
  )

  const loadBookings = useCallback(async () => {
    setIsLoading(true)
    setPageError(null)
    try {
      const res = await listAdminBookings(currentFilters())
      setRecords(res.records)
      setTotal(res.total)
      setSelectedId((prev) => {
        if (prev && res.records.some((r) => r.id === prev)) return prev
        return res.records[0]?.id ?? null
      })
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Gagal memuat daftar reservasi.')
    } finally {
      setIsLoading(false)
    }
  }, [currentFilters])

  const loadAttribution = useCallback(async () => {
    setAttrLoading(true)
    setPageError(null)
    try {
      const report = await getAdminBookingAttribution({
        ...(attrDateFrom ? { dateFrom: attrDateFrom } : {}),
        ...(attrDateTo ? { dateTo: attrDateTo } : {}),
      })
      setAttribution(report)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Gagal memuat laporan atribusi.')
    } finally {
      setAttrLoading(false)
    }
  }, [attrDateFrom, attrDateTo])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  useEffect(() => {
    if (activeTab === 'attribution') {
      void loadAttribution()
    }
  }, [activeTab, loadAttribution])

  const selectedRecord = records.find((r) => r.id === selectedId) ?? null
  const confirmedStartInput =
    slotEditDraft && selectedRecord && slotEditDraft.recordId === selectedRecord.id
      ? slotEditDraft.start
      : toLocalInputValue(selectedRecord?.confirmedStartAt ?? null)
  const confirmedEndInput =
    slotEditDraft && selectedRecord && slotEditDraft.recordId === selectedRecord.id
      ? slotEditDraft.end
      : toLocalInputValue(selectedRecord?.confirmedEndAt ?? null)

  const handleSelectRecord = (recordId: string) => {
    setSelectedId(recordId)
    setSlotConflictError(null)
    setActionNotice(null)
    setSlotEditDraft(null)
  }

  const handleExportCsv = async () => {
    setIsExporting(true)
    setPageError(null)
    try {
      const blob = await downloadAdminBookingsCsv(currentFilters())
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `attentive-bookings-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Gagal mengekspor CSV.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleTransition = async (nextStatus: BookingStatus) => {
    if (!selectedRecord) return
    setActionBusy(true)
    setSlotConflictError(null)
    setActionNotice(null)

    try {
      let confirmedStartAt: string | null | undefined
      let confirmedEndAt: string | null | undefined

      if (nextStatus === 'confirmed' && confirmedStartInput) {
        const startDate = new Date(confirmedStartInput)
        if (Number.isNaN(startDate.getTime())) {
          setActionNotice({ type: 'error', text: 'Format waktu mulai tidak valid.' })
          setActionBusy(false)
          return
        }
        confirmedStartAt = startDate.toISOString()

        if (confirmedEndInput) {
          const endDate = new Date(confirmedEndInput)
          if (Number.isNaN(endDate.getTime()) || endDate <= startDate) {
            setActionNotice({ type: 'error', text: 'Waktu selesai harus setelah waktu mulai.' })
            setActionBusy(false)
            return
          }
          confirmedEndAt = endDate.toISOString()
        } else {
          confirmedEndAt = new Date(startDate.getTime() + 60 * 60 * 1000).toISOString()
        }
      }

      const result = await transitionAdminBookingStatus(selectedRecord.id, {
        status: nextStatus,
        ...(confirmedStartAt !== undefined ? { confirmedStartAt } : {}),
        ...(confirmedEndAt !== undefined ? { confirmedEndAt } : {}),
      })

      if (!result.ok) {
        if (result.status === 409 || result.code === 'SLOT_CONFLICT_BUFFER') {
          setSlotConflictError(
            result.message ||
              'Konflik jadwal (409): Psikolog sudah memiliki sesi aktif atau berada dalam rentang buffer 15 menit.',
          )
        } else {
          setActionNotice({ type: 'error', text: result.message })
        }
        return
      }

      setRecords((prev) =>
        prev.map((item) => (item.id === result.record.id ? result.record : item)),
      )
      setSlotEditDraft(null)
      setActionNotice({
        type: 'success',
        text: `Status booking ${result.record.bookingCode} diperbarui ke ${result.record.status}.`,
      })
    } finally {
      setActionBusy(false)
    }
  }

  const handleRetryWebhook = async (id: string) => {
    setActionBusy(true)
    setActionNotice(null)
    try {
      const result = await retryAdminBookingWebhook(id)
      setActionNotice({
        type: result.ok ? 'success' : 'error',
        text: result.message,
      })
      if (result.ok) {
        await loadBookings()
      }
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Reservasi &amp; Booking
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Kelola antrean reservasi masuk, konfirmasi slot bebas konflik 15 menit, outbox webhook n8n, dan laporan atribusi UTM/Meta Ads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-teal-50 text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck2 className="size-3.5" aria-hidden="true" />
              <span>Daftar Booking</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('attribution')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'attribution'
                  ? 'bg-teal-50 text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="size-3.5" aria-hidden="true" />
              <span>Attribution Report</span>
            </button>
          </div>

          {activeTab === 'queue' && (
            <button
              type="button"
              onClick={() => void handleExportCsv()}
              disabled={isExporting || records.length === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Download className="size-3.5" aria-hidden="true" />
              <span>{isExporting ? 'Mengunduh...' : 'Export CSV'}</span>
            </button>
          )}
        </div>
      </div>

      {pageError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {pageError}
        </div>
      )}

      {activeTab === 'queue' ? (
        <div className="space-y-5">
          {/* Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <label htmlFor="booking-search" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cari Kode / Klien / Psikolog
                </label>
                <div className="relative">
                  <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="booking-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ATT-... / nama / email / WA"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="booking-filter-status" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Status
                </label>
                <select
                  id="booking-filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_session">In Session</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="booking-filter-mode" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mode
                </label>
                <select
                  id="booking-filter-mode"
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                >
                  <option value="">Semua Mode</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label htmlFor="booking-filter-location" className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cabang
                </label>
                <select
                  id="booking-filter-location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                >
                  <option value="">Semua Cabang</option>
                  <option value="TBI">Jakarta Selatan (TBI)</option>
                  <option value="BSD">BSD</option>
                  <option value="MALANG">Malang</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => void loadBookings()}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  <span>Muat Ulang</span>
                </button>
                {(statusFilter || modeFilter || locationFilter || searchQuery || dateFrom || dateTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('')
                      setModeFilter('')
                      setLocationFilter('')
                      setSearchQuery('')
                      setDateFrom('')
                      setDateTo('')
                    }}
                    className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs text-slate-500 hover:bg-slate-100 cursor-pointer"
                    aria-label="Reset filter"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <label htmlFor="booking-date-from">Dari:</label>
                <input
                  id="booking-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <label htmlFor="booking-date-to">Sampai:</label>
                <input
                  id="booking-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-800"
                />
              </div>
              <span className="ml-auto font-medium text-slate-700 tabular-nums">
                Total ditampilkan: {records.length} / {total}
              </span>
            </div>
          </div>

          {/* Queue Grid + Detail Panel */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center p-10 text-sm text-slate-500">
                  Memuat daftar reservasi...
                </div>
              ) : records.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  Tidak ada reservasi yang sesuai dengan filter saat ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-left font-semibold text-slate-700">
                      <tr>
                        <th className="px-4 py-3">Kode &amp; Waktu</th>
                        <th className="px-4 py-3">Klien</th>
                        <th className="px-4 py-3">Sesi &amp; Psikolog</th>
                        <th className="px-4 py-3">Tarif</th>
                        <th className="px-4 py-3">Status &amp; Outbox</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((item) => {
                        const isSelected = item.id === selectedRecord?.id
                        const statusStyle = STATUS_META[item.status] ?? STATUS_META.pending
                        const whStyle =
                          WEBHOOK_META[item.webhookStatus ?? 'pending'] ?? WEBHOOK_META.pending

                        return (
                          <tr
                            key={item.id}
                            onClick={() => handleSelectRecord(item.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-teal-50/70' : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="px-4 py-3 align-top">
                              <div className="font-mono font-bold text-slate-900">
                                {item.bookingCode}
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-500">
                                {formatWibDateTime(item.submittedAt)}
                              </div>
                              {item.crisisFlagTriggered && (
                                <span className="mt-1 inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                                  <AlertTriangle className="size-3" aria-hidden="true" />
                                  Krisis
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 align-top">
                              <div className="font-semibold text-slate-900">{item.name}</div>
                              <div className="text-[11px] text-slate-500">{item.whatsappE164}</div>
                              <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                {item.clientStatus === 'new' ? 'Klien Baru' : 'Klien Lama'}
                              </span>
                            </td>

                            <td className="px-4 py-3 align-top">
                              <div className="font-medium text-slate-800">
                                {item.consultationMode === 'offline'
                                  ? `Offline · ${item.location ?? '-'}`
                                  : 'Online'}
                              </div>
                              <div className="text-[11px] text-slate-600">
                                {item.selectedPsychologistName || `(${item.psychologistChoice})`}
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-500">
                                Opt 1: {item.scheduleOption1}
                              </div>
                            </td>

                            <td className="px-4 py-3 align-top tabular-nums">
                              <div className="font-semibold text-slate-900">
                                {formatRupiah(item.totalRate)}
                              </div>
                              {item.assessmentFee > 0 && (
                                <div className="text-[10px] text-slate-500">
                                  Termasuk asesmen {formatRupiah(item.assessmentFee)}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3 align-top space-y-1">
                              <div>
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyle.badgeClass}`}
                                >
                                  {statusStyle.label}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${whStyle.className}`}
                                >
                                  n8n: {whStyle.label}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Detail Panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5 self-start sticky top-6">
              {selectedRecord ? (
                <>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="font-mono text-xs font-bold text-teal-700">
                        {selectedRecord.bookingCode}
                      </div>
                      <h2 className="mt-0.5 text-lg font-bold text-slate-900">
                        {selectedRecord.name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {selectedRecord.email} · {selectedRecord.whatsappE164}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        STATUS_META[selectedRecord.status].badgeClass
                      }`}
                    >
                      {STATUS_META[selectedRecord.status].label}
                    </span>
                  </div>

                  {/* Clinical Privacy Wall Notice */}
                  <div
                    className={`rounded-xl border p-3 text-xs ${
                      selectedRecord.crisisFlagTriggered
                        ? 'border-red-200 bg-red-50 text-red-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {selectedRecord.crisisFlagTriggered ? (
                        <ShieldAlert className="size-4 text-red-600 shrink-0" aria-hidden="true" />
                      ) : (
                        <ShieldCheck className="size-4 text-teal-600 shrink-0" aria-hidden="true" />
                      )}
                      <span>Clinical Privacy Wall Aktif</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      {selectedRecord.hasClinicalNote
                        ? 'Klien mengisi catatan keluhan klinis. Isi naratif disimpan terpisah dan tidak pernah diekspos ke portal operasional admin.'
                        : 'Tidak ada narasi keluhan klinis terlampir.'}
                    </p>
                    {selectedRecord.crisisFlagTriggered && (
                      <p className="mt-1.5 text-[11px] font-bold text-red-800">
                        Flag krisis / darurat aktif — prioritaskan tindak lanjut klinis.
                      </p>
                    )}
                  </div>

                  {/* Operational Metadata */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Status Klien</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRecord.clientStatus === 'new' ? 'Klien Baru' : 'Klien Lama'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Mode &amp; Lokasi</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRecord.consultationMode === 'offline' && selectedRecord.location
                          ? `Offline (${
                              BOOKING_BRANCH_LABELS.id[
                                selectedRecord.location.toLowerCase() as 'tbi' | 'bsd' | 'malang'
                              ] ?? selectedRecord.location
                            })`
                          : 'Online'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Psikolog</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRecord.selectedPsychologistName || selectedRecord.psychologistChoice}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500">Kebutuhan</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedRecord.concernCategory || selectedRecord.concernId || '—'}
                      </span>
                    </div>
                    <div className="border-t border-slate-100 pt-2">
                      <div className="text-slate-500 mb-1">Pilihan Jadwal Klien</div>
                      <ul className="space-y-0.5 text-[11px] font-medium text-slate-800">
                        <li>1. {selectedRecord.scheduleOption1}</li>
                        {selectedRecord.scheduleOption2 && <li>2. {selectedRecord.scheduleOption2}</li>}
                        {selectedRecord.scheduleOption3 && <li>3. {selectedRecord.scheduleOption3}</li>}
                      </ul>
                    </div>
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-slate-900">
                      <span>Estimasi Tagihan</span>
                      <span className="tabular-nums">{formatRupiah(selectedRecord.totalRate)}</span>
                    </div>
                  </div>

                  {/* Feedback & 409 Conflict Banner */}
                  <AnimatePresence>
                    {slotConflictError && (
                      <motion.div
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={INTERACTIVE_SPRING}
                        className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-900"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-red-800">
                          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                          <span>Konflik Jadwal &amp; Buffer 15 Menit</span>
                        </div>
                        <p className="mt-1 leading-relaxed">{slotConflictError}</p>
                      </motion.div>
                    )}

                    {actionNotice && (
                      <motion.div
                        role="status"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={INTERACTIVE_SPRING}
                        className={`rounded-xl border p-3 text-xs flex items-start gap-2 ${
                          actionNotice.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-rose-200 bg-rose-50 text-rose-800'
                        }`}
                      >
                        {actionNotice.type === 'success' && (
                          <CheckCircle2 className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                        )}
                        <span>{actionNotice.text}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* State Machine Controls */}
                  {BOOKING_TRANSITIONS[selectedRecord.status].length > 0 && (
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <CalendarClock className="size-4 text-teal-600" aria-hidden="true" />
                        <span>Transisi Status</span>
                      </div>

                      {BOOKING_TRANSITIONS[selectedRecord.status].includes('confirmed') && (
                        <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div>
                            <label
                              htmlFor="confirmed-start-at"
                              className="block text-[11px] font-semibold text-slate-700 mb-1"
                            >
                              Mulai Sesi Terkonfirmasi (WIB)
                            </label>
                            <input
                              id="confirmed-start-at"
                              type="datetime-local"
                              value={confirmedStartInput}
                              onChange={(e) =>
                                setSlotEditDraft({
                                  recordId: selectedRecord.id,
                                  start: e.target.value,
                                  end: confirmedEndInput,
                                })
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="confirmed-end-at"
                              className="block text-[11px] font-semibold text-slate-700 mb-1"
                            >
                              Selesai Sesi (Opsional, default +60 mnt)
                            </label>
                            <input
                              id="confirmed-end-at"
                              type="datetime-local"
                              value={confirmedEndInput}
                              onChange={(e) =>
                                setSlotEditDraft({
                                  recordId: selectedRecord.id,
                                  start: confirmedStartInput,
                                  end: e.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {BOOKING_TRANSITIONS[selectedRecord.status].map((nextStatus) => {
                          const meta = TRANSITION_LABELS[nextStatus]
                          return (
                            <motion.button
                              key={nextStatus}
                              type="button"
                              disabled={actionBusy}
                              onClick={() => void handleTransition(nextStatus)}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              transition={INTERACTIVE_SPRING}
                              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer ${meta.className}`}
                            >
                              {meta.label}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* n8n Outbox Status + Retry */}
                  <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">n8n Outbox Delivery</span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          (WEBHOOK_META[selectedRecord.webhookStatus ?? 'pending'] ?? WEBHOOK_META.pending).className
                        }`}
                      >
                        {selectedRecord.webhookStatus ?? 'pending'} (percobaan: {selectedRecord.webhookAttempts})
                      </span>
                    </div>
                    {selectedRecord.webhookLastError && (
                      <p className="rounded-lg bg-rose-50 p-2 text-[11px] text-rose-700 break-all">
                        {selectedRecord.webhookLastError}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => void handleRetryWebhook(selectedRecord.id)}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="size-3.5" aria-hidden="true" />
                      <span>Retry Webhook</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center text-xs text-slate-500">
                  Pilih salah satu baris reservasi untuk melihat detail operasional &amp; kontrol status.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Attribution Report Tab */
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div>
              <label htmlFor="attr-date-from" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Dari Tanggal
              </label>
              <input
                id="attr-date-from"
                type="date"
                value={attrDateFrom}
                onChange={(e) => setAttrDateFrom(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
            <div>
              <label htmlFor="attr-date-to" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Sampai Tanggal
              </label>
              <input
                id="attr-date-to"
                type="date"
                value={attrDateTo}
                onChange={(e) => setAttrDateTo(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadAttribution()}
              disabled={attrLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              <span>{attrLoading ? 'Memuat...' : 'Perbarui Laporan'}</span>
            </button>
          </div>

          {attribution && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Total Booking</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
                    {attribution.total}
                  </div>
                </div>
                <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 shadow-xs">
                  <div className="text-xs font-semibold text-teal-800">Tercatat UTM / Meta Ads</div>
                  <div className="mt-2 text-3xl font-bold text-teal-900 tabular-nums">
                    {attribution.attributed}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500">Organik / Tanpa UTM</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">
                    {attribution.unattributed}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {[
                  { title: 'By Campaign', rows: attribution.byCampaign },
                  { title: 'By AdSet', rows: attribution.byAdset },
                  { title: 'By Ad', rows: attribution.byAd },
                ].map((group) => (
                  <div key={group.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      {group.title}
                    </h3>
                    {group.rows.length === 0 ? (
                      <p className="text-xs text-slate-500">Belum ada data pada rentang ini.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-left text-slate-500">
                            <th className="py-1.5">Key</th>
                            <th className="py-1.5 text-right">Total</th>
                            <th className="py-1.5 text-right">On</th>
                            <th className="py-1.5 text-right">Off</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.rows.map((bucket) => (
                            <tr key={bucket.key}>
                              <td className="py-1.5 font-medium text-slate-800 truncate max-w-[160px]">
                                {bucket.key}
                              </td>
                              <td className="py-1.5 text-right font-bold tabular-nums">{bucket.count}</td>
                              <td className="py-1.5 text-right text-slate-600 tabular-nums">{bucket.online}</td>
                              <td className="py-1.5 text-right text-slate-600 tabular-nums">{bucket.offline}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold text-slate-800">
                  Riwayat Booking dengan Data Sumber / Atribusi
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 text-left font-semibold text-slate-700">
                      <tr>
                        <th className="px-4 py-2.5">Kode</th>
                        <th className="px-4 py-2.5">Klien</th>
                        <th className="px-4 py-2.5">Sumber Marketing</th>
                        <th className="px-4 py-2.5">UTM Source / Medium</th>
                        <th className="px-4 py-2.5">Campaign / AdSet / Ad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attribution.rows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                            {row.bookingCode}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="font-medium text-slate-800">{row.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {formatWibDateTime(row.submittedAt)}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">{row.marketingSource || '—'}</td>
                          <td className="px-4 py-2.5 text-slate-700">
                            {[row.utmSource, row.utmMedium].filter(Boolean).join(' / ') || '—'}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">
                            {[row.utmCampaign || row.campaignId, row.adsetId, row.adId]
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
