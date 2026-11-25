import { useEffect, useState } from 'react'
import type { FeedbackReport } from '@attentiveid/shared'
import { Check, RotateCcw, Trash2 } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { isOwnerUser } from '@/features/auth/owner'
import { deleteFeedback, listFeedback, setFeedbackDone } from '@/features/feedback/service'
import { useTx } from '@/features/i18n/use-tx'

type Filter = 'open' | 'done' | 'all'

/** Owner only: the bug reports and suggestions sent from /feedback. */
export function FeedbackReportsPage() {
  const { tx, isEn } = useTx()
  const { user } = useAuth()
  const owner = isOwnerUser(user)
  const [reports, setReports] = useState<FeedbackReport[] | null>(null)
  const [filter, setFilter] = useState<Filter>('open')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (!owner) return
    let cancelled = false
    listFeedback()
      .then((data) => !cancelled && setReports(data))
      .catch((caught) => !cancelled && setError(caught instanceof Error ? caught.message : 'Gagal memuat laporan.'))
    return () => {
      cancelled = true
    }
  }, [owner])

  const act = async (id: string, action: () => Promise<unknown>, apply: (current: FeedbackReport[]) => FeedbackReport[]) => {
    setBusy(id)
    setError(null)
    try {
      await action()
      setReports((current) => (current ? apply(current) : current))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setBusy(null)
    }
  }

  const toggle = (report: FeedbackReport) => {
    const done = !report.doneAt
    void act(report.id, () => setFeedbackDone(report.id, done), (current) =>
      current.map((item) => (item.id === report.id ? { ...item, doneAt: done ? new Date().toISOString() : null } : item)),
    )
  }

  const remove = (report: FeedbackReport) => {
    if (!window.confirm(tx(`Hapus laporan dari ${report.name}?`, `Delete the report from ${report.name}?`))) return
    void act(report.id, () => deleteFeedback(report.id), (current) => current.filter((item) => item.id !== report.id))
  }

  const when = (iso: string) => new Date(iso).toLocaleString(isEn ? 'en-GB' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  const counts = { open: reports?.filter((r) => !r.doneAt).length ?? 0, done: reports?.filter((r) => r.doneAt).length ?? 0, all: reports?.length ?? 0 }
  const visible = (reports ?? []).filter((r) => (filter === 'all' ? true : filter === 'done' ? Boolean(r.doneAt) : !r.doneAt))

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          {tx('Laporan Bug & Saran', 'Bug Reports & Suggestions')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {tx('Kiriman dari halaman /feedback. Hanya akun pemilik yang bisa melihatnya.', 'Sent from the /feedback page. Only the owner account can see them.')}
        </p>
      </div>

      {!owner ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {tx('Halaman ini khusus akun pemilik.', 'This page is for the owner account only.')}
        </p>
      ) : (
        <>
          <div aria-label={tx('Saring', 'Filter')} className="flex flex-wrap gap-2" role="group">
            {(
              [
                ['open', tx('Belum selesai', 'Open')],
                ['done', tx('Selesai', 'Done')],
                ['all', tx('Semua', 'All')],
              ] as const
            ).map(([value, label]) => (
              <button
                aria-pressed={filter === value}
                className={`cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium ${
                  filter === value ? 'border-navy-700 bg-navy-50 text-navy-800 ring-2 ring-gold-300' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                key={value}
                onClick={() => setFilter(value)}
                type="button"
              >
                {label} ({counts[value]})
              </button>
            ))}
          </div>

          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</p>}
          {!reports && !error && <p className="text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>}
          {reports && visible.length === 0 && <p className="text-sm text-slate-500">{tx('Belum ada laporan di sini.', 'No reports here.')}</p>}

          <ul className="space-y-3">
            {visible.map((report) => (
              <li className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs" key={report.id}>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${report.kind === 'bug' ? 'bg-rose-50 text-rose-700' : 'bg-navy-50 text-navy-800'}`}>
                    {report.kind === 'bug' ? 'Bug' : tx('Saran', 'Suggestion')}
                  </span>
                  <span className="font-semibold text-slate-900">{report.name}</span>
                  <span>{when(report.createdAt)}</span>
                  {report.page && <span className="break-all">· {report.page}</span>}
                  {report.doneAt && <span className="font-semibold text-emerald-700">· {tx('Selesai', 'Done')} {when(report.doneAt)}</span>}
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">{report.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-navy-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60"
                    disabled={busy === report.id}
                    onClick={() => toggle(report)}
                    type="button"
                  >
                    {report.doneAt ? <RotateCcw aria-hidden="true" className="size-4" /> : <Check aria-hidden="true" className="size-4" />}
                    {report.doneAt ? tx('Buka lagi', 'Reopen') : tx('Tandai selesai', 'Mark done')}
                  </button>
                  <button
                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                    disabled={busy === report.id}
                    onClick={() => remove(report)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    {tx('Hapus', 'Delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
