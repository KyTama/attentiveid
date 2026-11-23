import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, Search, X } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import {
  getAssessment,
  listSubmissions,
  openPaymentProof,
  type AssessmentInstrument,
  reviewAssessment,
  type AssessmentDetail,
  type AssessmentListItem,
  type AssessmentStatus,
} from '@/features/assessments/service'
import { useTx } from '@/features/i18n/use-tx'

type Filter = 'all' | AssessmentStatus

const LEVEL_STYLE: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-800',
  2: 'bg-sky-100 text-sky-800',
  3: 'bg-amber-100 text-amber-800',
  4: 'bg-orange-100 text-orange-800',
  5: 'bg-rose-100 text-rose-800',
}

const asNumber = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)
const fmt = (value: unknown) => {
  const n = asNumber(value)
  return n === null ? '–' : (Math.round(n * 10) / 10).toString()
}
const dateText = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })

/** Mental Health Check-Up results. A psychologist reads the scores, writes a note, then marks the result as reviewed or released. */
export function AssessmentsCmsPage() {
  const { tx, isEn } = useTx()
  const { user } = useAuth()
  const [items, setItems] = useState<AssessmentListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instrument, setInstrument] = useState<AssessmentInstrument>('mhcu')
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [detail, setDetail] = useState<AssessmentDetail | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      setItems(await listSubmissions(instrument))
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal memuat data.', 'Failed to load the data.'))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrument])

  useEffect(() => {
    setDetail(null)
    void load()
  }, [load])

  const open = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const row = await getAssessment(id)
      setDetail(row)
      setNote(row.reviewerNote ?? '')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal membuka data.', 'Failed to open the record.'))
    } finally {
      setBusy(false)
    }
  }

  const mark = async (status: AssessmentStatus) => {
    if (!detail) return
    if (status === 'released' && !window.confirm(tx('Rilis hasil ini? Hasil yang dirilis boleh dikirim ke peserta.', 'Release this result? A released result may be sent to the participant.'))) return
    setBusy(true)
    setError(null)
    try {
      const row = await reviewAssessment(detail.id, status, note)
      setDetail({ ...detail, ...row })
      setItems((current) => current.map((entry) => (entry.id === row.id ? { ...entry, status: row.status } : entry)))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setBusy(false)
    }
  }

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false
      return !term || `${item.name} ${item.code} ${item.email}`.toLowerCase().includes(term)
    })
  }, [items, filter, search])

  const statusLabel = (status: AssessmentStatus) =>
    status === 'new' ? tx('Baru', 'New') : status === 'reviewed' ? tx('Ditinjau', 'Reviewed') : tx('Dirilis', 'Released')

  const reasons = Array.isArray(detail?.scores?.reasons) ? (detail?.scores.reasons as { id?: string; en?: string }[]) : []
  const levelName = (detail?.scores?.levelName ?? null) as { id?: string; en?: string } | null
  const followUp = (detail?.scores?.followUp ?? null) as { responseTimeId?: string; responseTimeEn?: string; actionId?: string; actionEn?: string } | null
  const ati = (detail?.scores?.ati ?? null) as { total?: number | null } | null
  const mhiBand = (detail?.scores?.mhiBand ?? null) as { id?: string; en?: string } | null
  const domains = Array.isArray(detail?.scores?.domains) ? (detail?.scores.domains as { id: string; en: string; score: number | null; flagged: boolean }[]) : []

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
            {instrument === 'mhcu' ? tx('Hasil MHCU', 'MHCU results') : tx('Hasil Goal System Compass', 'Goal System Compass results')}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            {instrument === 'mhcu'
              ? tx(
                  'Hasil Mental Health Check-Up dari halaman Asesmen. Ini data kesehatan: buka hanya bila perlu, jangan dibagikan, dan jangan diekspor ke tempat umum. Hasil sebaiknya ditinjau psikolog sebelum dirilis.',
                  'Mental Health Check-Up results from the Assessments page. This is health data: open it only when needed, do not share it and do not export it anywhere public. A psychologist should review a result before it is released.',
                )
              : tx(
                  'Sesi Goal System Compass dari halaman Asesmen. Ini data pribadi: buka hanya bila perlu dan jangan dibagikan. Analisis dan laporan dikerjakan di Konsol Konselor.',
                  'Goal System Compass sessions from the Assessments page. This is personal data: open it only when needed and do not share it. The analysis and report are done in the Counselor Console.',
                )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" to="/dashboard/assessments/mhcu">
            {tx('Buka Dasbor MHCU', 'Open the MHCU dashboard')}
          </Link>
          <button
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void load()}
            type="button"
          >
            <RefreshCw aria-hidden="true" className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            {tx('Muat ulang', 'Refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}

      <div aria-label={tx('Jenis asesmen', 'Assessment')} className="flex w-fit overflow-hidden rounded-lg border border-slate-200 text-sm font-semibold" role="group">
        {(['mhcu', 'gsc'] as AssessmentInstrument[]).map((value) => (
          <button
            aria-pressed={instrument === value}
            className={`cursor-pointer px-4 py-2 ${instrument === value ? 'bg-navy-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            key={value}
            onClick={() => setInstrument(value)}
            type="button"
          >
            {value === 'mhcu' ? 'MHCU' : 'Goal System Compass'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">{tx('Cari', 'Search')}</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tx('Cari nama, kode, atau email...', 'Search name, code or e-mail...')}
            type="search"
            value={search}
          />
        </label>
        <div aria-label={tx('Saring', 'Filter')} className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold" role="group">
          {(['all', 'new', 'reviewed', 'released'] as Filter[]).map((value) => (
            <button
              className={`cursor-pointer px-3 py-2 ${filter === value ? 'bg-navy-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              key={value}
              onClick={() => setFilter(value)}
              type="button"
            >
              {value === 'all' ? tx('Semua', 'All') : statusLabel(value)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {isLoading ? (
            <p className="flex items-center gap-2 p-6 text-sm text-slate-500">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" /> {tx('Memuat...', 'Loading...')}
            </p>
          ) : visible.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              {user?.role === 'psychologist' && instrument === 'mhcu' && items.length === 0
                ? tx(
                    'Hasil akan muncul di sini setelah admin menugaskan klien kepada Anda.',
                    'Results will appear here after an admin assigns clients to you.',
                  )
                : tx('Belum ada data.', 'Nothing here yet.')}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visible.map((item) => (
                <li key={item.id}>
                  <button
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 ${detail?.id === item.id ? 'bg-slate-50' : ''}`}
                    onClick={() => void open(item.id)}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-900">{item.name}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {item.code} · {dateText(item.createdAt)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      {item.level !== null && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${LEVEL_STYLE[item.level] ?? 'bg-slate-100 text-slate-700'}`}>L{item.level}</span>
                      )}
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">{statusLabel(item.status)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
          {!detail ? (
            <p className="text-sm text-slate-500">{tx('Pilih satu hasil di kiri untuk melihat skor dan menulis catatan.', 'Choose a result on the left to see the scores and write a note.')}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                  <h2 className="text-lg font-bold text-slate-900">{detail.name}</h2>
                  <p className="text-xs text-slate-500">
                    {detail.code} · {detail.age} {tx('tahun', 'years')} · {detail.sex ?? '–'} · {detail.lang.toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {detail.email} · {detail.phone}
                  </p>
                </div>
                <button aria-label={tx('Tutup', 'Close')} className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" onClick={() => setDetail(null)} type="button">
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>

              {(detail.level ?? 0) >= 4 && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                  <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <span>
                    {levelName ? (isEn ? levelName.en : levelName.id) : `Level ${detail.level}`}
                    {followUp ? ` — ${isEn ? followUp.responseTimeEn : followUp.responseTimeId}. ${isEn ? followUp.actionEn : followUp.actionId}` : ''}
                  </span>
                </div>
              )}

              {detail.instrument === 'gsc' && (
                <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <p>
                    <b>{tx('Pendidikan', 'Education')}:</b> {String(detail.scores.edu ?? '–')} · <b>{tx('Waktu isi', 'Time taken')}:</b>{' '}
                    {asNumber(detail.scores.minutes) === null ? '–' : `${detail.scores.minutes} ${tx('menit', 'min')}`}
                  </p>
                  {Array.isArray((detail.answers as unknown as { goals?: string[] }).goals) && (
                    <ul className="list-disc pl-5">
                      {(detail.answers as unknown as { goals: string[] }).goals.map((goal, index) => (
                        <li key={index}>{goal}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-slate-500">
                    {tx(
                      'Peta tujuan, analisis, dan laporan dikerjakan di Konsol Konselor. Catatan di konsol tersimpan di peramban ini saja, bukan di server.',
                      'The goals map, analysis and report are done in the Counselor Console. Notes made there are kept in this browser only, not on the server.',
                    )}
                  </p>
                  <button
                    className="cursor-pointer rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    onClick={() => {
                      const packed = (detail.answers as unknown as { code?: string }).code
                      if (packed) window.open(`/assessments/goal-compass/konselor#d=${packed}`, '_blank', 'noopener,noreferrer')
                    }}
                    type="button"
                  >
                    {tx('Buka di Konsol Konselor', 'Open in the Counselor Console')}
                  </button>
                </div>
              )}

              <dl className={`grid grid-cols-2 gap-2 text-sm sm:grid-cols-5 ${detail.instrument === 'gsc' ? 'hidden' : ''}`}>
                {[
                  ['MHI', fmt(detail.scores.mhi)],
                  ['DI', fmt(detail.scores.di)],
                  ['WI', fmt(detail.scores.wi)],
                  ['BHI', fmt(detail.scores.bhi)],
                  ['ATI', fmt(ati?.total)],
                ].map(([label, value]) => (
                  <div className="rounded-xl bg-slate-50 px-3 py-2" key={label}>
                    <dt className="text-xs font-semibold text-slate-500">{label}</dt>
                    <dd className="text-lg font-bold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              {mhiBand && <p className="text-xs text-slate-500">MHI: {isEn ? mhiBand.en : mhiBand.id}</p>}

              {reasons.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tx('Pemicu tinjauan', 'Review triggers')}</h3>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-700">
                    {reasons.map((reason, index) => (
                      <li key={index}>{isEn ? reason.en : reason.id}</li>
                    ))}
                  </ul>
                </div>
              )}

              {domains.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tx('Domain gejala (0–4)', 'Symptom domains (0–4)')}</h3>
                  <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
                    {domains.map((domain) => (
                      <li className="flex justify-between gap-2 rounded-lg px-2 py-1 odd:bg-slate-50" key={domain.id}>
                        <span className={domain.flagged ? 'font-semibold text-rose-700' : 'text-slate-700'}>{isEn ? domain.en : domain.id}</span>
                        <span className="font-mono text-slate-900">{domain.score ?? '–'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detail.instrument === 'mhcu' && (
                <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  <p>
                    <b>{tx('Email hasil ke peserta', 'Result e-mail to the participant')}:</b>{' '}
                    {detail.resultEmailSentAt ? dateText(detail.resultEmailSentAt) : tx('belum terkirim', 'not sent')}
                  </p>
                  <p>
                    <b>{tx('Laporan lengkap', 'Full report')}:</b>{' '}
                    {detail.paymentSubmittedAt
                      ? `${detail.paymentFor === 'package3' ? tx('Paket 3x', 'Package of 3') : tx('1x pemeriksaan', '1 check-up')} · ${tx('bukti transfer diterima', 'proof of transfer received')} ${dateText(detail.paymentSubmittedAt)}`
                      : tx('belum ada pembayaran', 'no payment yet')}
                  </p>
                  {detail.paymentSubmittedAt && (
                    <button
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      onClick={() => {
                        void openPaymentProof(detail.id).catch((caught) => setError(caught instanceof Error ? caught.message : tx('Gagal membuka bukti.', 'Could not open the proof.')))
                      }}
                      type="button"
                    >
                      {tx('Lihat bukti transfer', 'View proof of transfer')}
                    </button>
                  )}
                </div>
              )}

              <p className="text-xs text-slate-500">
                {detail.researchConsent
                  ? tx('Peserta mengizinkan data dipakai untuk riset (anonim).', 'The participant allows anonymous use of the data for research.')
                  : tx('Peserta TIDAK mengizinkan data dipakai untuk riset.', 'The participant does NOT allow use of the data for research.')}
                {detail.guardian ? ` ${tx('Di bawah 18 tahun: perlu persetujuan wali.', 'Under 18: guardian consent needed.')}` : ''}
              </p>

              <label className="block">
                <span className="text-sm font-bold text-slate-900">{tx('Catatan psikolog', 'Psychologist note')}</span>
                <textarea
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                  maxLength={4000}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  value={note}
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  disabled={busy}
                  onClick={() => void mark('reviewed')}
                  type="button"
                >
                  {tx('Tandai sudah ditinjau', 'Mark as reviewed')}
                </button>
                <button
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  disabled={busy}
                  onClick={() => void mark('released')}
                  type="button"
                >
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                  {tx('Rilis hasil', 'Release result')}
                </button>
                <span className="text-xs text-slate-500">
                  {tx('Status', 'Status')}: {statusLabel(detail.status)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
