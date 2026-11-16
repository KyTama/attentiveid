import { useCallback, useEffect, useState } from 'react'
import { keluhanLabel, type FreeSessionRecord } from '@attentiveid/shared'
import { useAuth } from '../../features/auth/auth-context'
import { useTx } from '@/features/i18n/use-tx'

interface FreeSessionReport {
  total: number
  unique: number
  duplicates: number
  records: FreeSessionRecord[]
}

const apiBaseUrl = () =>
  import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

interface SheetStatus {
  configured: boolean
  pending: number
  failed: number
  spreadsheetUrl: string | null
}

export function FreeSessionCmsPage() {
  const { accessToken } = useAuth()
  const { tx } = useTx()
  const [sheet, setSheet] = useState<SheetStatus | null>(null)
  const [sheetMessage, setSheetMessage] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [report, setReport] = useState<FreeSessionReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  const authHeaders = useCallback(
    (): HeadersInit => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken],
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`${apiBaseUrl()}/api/admin/free-session/submissions`, { headers: authHeaders() })
        if (!res.ok) throw new Error('Gagal memuat data sesi gratis.')
        const json = (await res.json()) as { data: FreeSessionReport }
        if (!cancelled) setReport(json.data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat data sesi gratis.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [authHeaders])

  const loadSheetStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiBaseUrl()}/api/admin/free-session/sheet-status`, { headers: authHeaders() })
      if (res.ok) setSheet(((await res.json()) as { data: SheetStatus }).data)
    } catch {
      // the status is informational; the report still works without it
    }
  }, [authHeaders])

  useEffect(() => {
    void loadSheetStatus()
  }, [loadSheetStatus])

  async function syncSheet() {
    setIsSyncing(true)
    setSheetMessage(null)
    try {
      const res = await fetch(`${apiBaseUrl()}/api/admin/free-session/sync-sheet`, { method: 'POST', headers: authHeaders() })
      const json = (await res.json().catch(() => null)) as { data?: { synced: number; pending: number; error: string | null } } | null
      if (!res.ok || !json?.data) throw new Error(tx('Gagal menjalankan sinkronisasi.', 'Failed to run the sync.'))
      const { synced, pending, error: syncError } = json.data
      setSheetMessage(
        syncError
          ? tx(`Belum berhasil: ${syncError}`, `Not successful yet: ${syncError}`)
          : tx(`${synced} baris dikirim ke Google Sheet. Sisa belum terkirim: ${pending}.`, `${synced} rows sent to the Google Sheet. Still not sent: ${pending}.`),
      )
      await loadSheetStatus()
    } catch (err) {
      setSheetMessage(err instanceof Error ? err.message : tx('Gagal menjalankan sinkronisasi.', 'Failed to run the sync.'))
    } finally {
      setIsSyncing(false)
    }
  }

  async function downloadCsv() {
    setIsDownloading(true)
    setError(null)
    try {
      const res = await fetch(`${apiBaseUrl()}/api/admin/free-session/export.csv`, { headers: authHeaders() })
      if (!res.ok) throw new Error('Gagal mengunduh report.')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `sesi-gratis-report-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunduh report.')
    } finally {
      setIsDownloading(false)
    }
  }

  const stats = [
    { label: 'Total submission', value: report?.total },
    { label: 'Setelah dedup', value: report?.unique },
    { label: 'Duplikat disaring', value: report?.duplicates },
  ]

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" data-route-heading tabIndex={-1}>
            Sesi Gratis
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Pendaftar dari formulir /free-session. Duplikat (nama + nomor WhatsApp) disaring di report; data asli
            tetap tersimpan utuh.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={isDownloading || !report}
          className="inline-flex items-center justify-center rounded-xl bg-navy-700 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isDownloading ? 'Mengunduh…' : 'Download report .csv'}
        </button>
      </div>

      <section aria-label="Google Sheet" className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Google Sheet</p>
          {sheet === null ? (
            <p className="text-xs text-slate-500">{tx('Memuat status…', 'Loading status…')}</p>
          ) : !sheet.configured ? (
            <p className="text-xs text-amber-700">
              {tx(
                'Belum tersambung: kredensial Google belum diatur di server, jadi pendaftar baru hanya tersimpan di database.',
                'Not connected: the Google credentials are not set on the server, so new sign-ups are only stored in the database.',
              )}
            </p>
          ) : (
            <p className="text-xs text-slate-600">
              {sheet.pending === 0
                ? tx('Semua pendaftar sudah ada di Google Sheet.', 'Every sign-up is in the Google Sheet.')
                : tx(`${sheet.pending} pendaftar belum ada di Google Sheet${sheet.failed ? ` (${sheet.failed} gagal terkirim)` : ''}.`, `${sheet.pending} sign-ups are not in the Google Sheet yet${sheet.failed ? ` (${sheet.failed} failed to send)` : ''}.`)}{' '}
              {tx('Pendaftar baru dikirim otomatis.', 'New sign-ups are sent automatically.')}
              {sheet.spreadsheetUrl ? (
                <>
                  {' '}
                  <a className="font-semibold text-navy-700 underline" href={sheet.spreadsheetUrl} rel="noopener noreferrer" target="_blank">
                    {tx('Buka sheet', 'Open the sheet')}
                  </a>
                </>
              ) : null}
            </p>
          )}
          {sheetMessage ? (
            <p className="mt-1 text-xs font-medium text-slate-800" role="status">
              {sheetMessage}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={syncSheet}
          disabled={isSyncing || !sheet?.configured}
          className="inline-flex items-center justify-center rounded-xl border border-navy-700 px-4 py-2.5 text-xs font-semibold text-navy-700 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSyncing ? tx('Mengirim…', 'Sending…') : tx('Kirim yang belum ke Google Sheet', 'Send the missing ones to the Google Sheet')}
        </button>
      </section>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <dl className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <dd className="text-3xl font-bold text-slate-900">{isLoading ? '…' : (stat.value ?? '–')}</dd>
            <dt className="text-xs text-slate-500">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Waktu</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Umur</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Keluhan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {report?.records.map((record) => (
              <tr key={record.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                  {new Date(record.createdAt).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{record.name}</td>
                <td className="px-4 py-3">{record.age}</td>
                <td className="px-4 py-3">{record.phone}</td>
                <td className="px-4 py-3">{keluhanLabel(record.keluhan) ?? record.keluhan}</td>
              </tr>
            ))}
            {!isLoading && report?.records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Belum ada pendaftar.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
