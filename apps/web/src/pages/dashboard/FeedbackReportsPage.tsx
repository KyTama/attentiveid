import { useEffect, useState, type FormEvent } from 'react'
import { FEEDBACK_NOTE_MAX, FEEDBACK_STATUSES, FEEDBACK_STATUS_LABELS, feedbackFilesProblem, type FeedbackBoard, type FeedbackEvent, type FeedbackFileInfo, type FeedbackReport, type FeedbackStatus } from '@attentiveid/shared'
import { ArrowLeftRight, ExternalLink, Paperclip, Sheet, Trash2, UploadCloud } from 'lucide-react'
import { FeedbackChart } from '@/features/feedback/FeedbackChart'
import { addFeedbackNote, copyFeedbackToDrive, deleteFeedback, listFeedback, updateFeedback } from '@/features/feedback/service'
import { useTx } from '@/features/i18n/use-tx'
import { useAuth } from '@/features/auth/auth-context'

type Filter = FeedbackStatus | 'all'

const selectClass = 'cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 disabled:cursor-default disabled:opacity-70'

function Files({ files }: { files: FeedbackFileInfo[] }) {
  if (files.length === 0) return null
  return (
    <ul className="mt-2 space-y-1">
      {files.map((file) => (
        <li className="flex items-center gap-1.5 text-xs text-slate-600" key={file.name}>
          <Paperclip aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="break-all">{file.name}</span>
          <span className="shrink-0 text-slate-400">{file.size < 1024 * 1024 ? `${Math.ceil(file.size / 1024)} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`}</span>
        </li>
      ))}
    </ul>
  )
}

function NoteForm({ busy, onSend }: { busy: boolean; onSend: (body: string, files: File[]) => Promise<boolean> }) {
  const { tx } = useTx()
  const [body, setBody] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [round, setRound] = useState(0)
  const problem = feedbackFilesProblem(files)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (problem || (!body.trim() && files.length === 0)) return
    if (await onSend(body, files)) {
      setBody('')
      setFiles([])
      setRound((value) => value + 1)
    }
  }

  return (
    <form className="mt-3 space-y-2" onSubmit={submit}>
      <textarea
        aria-label={tx('Catatan baru', 'New note')}
        className="block min-h-16 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
        maxLength={FEEDBACK_NOTE_MAX}
        onChange={(e) => setBody(e.target.value)}
        placeholder={tx('Tambah catatan...', 'Add a note...')}
        value={body}
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label={tx('Lampiran catatan', 'Note attachments')}
          className="min-w-0 flex-1 text-xs text-slate-600"
          key={round}
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          type="file"
        />
        <button className="cursor-pointer rounded-lg bg-navy-700 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-60" disabled={busy || Boolean(problem) || (!body.trim() && files.length === 0)} type="submit">
          {tx('Simpan catatan', 'Save note')}
        </button>
      </div>
      {problem && <p className="text-xs text-rose-700">{tx('Maksimal 3 berkas, 5 MB per berkas, total 7 MB; gambar, PDF, video, Office, TXT.', 'Up to 3 files, 5 MB each, 7 MB together; images, PDF, video, Office, TXT.')}</p>}
    </form>
  )
}

/** Bug reports and suggestions sent from /feedback: every admin reads them, the named handlers work on them. */
export function FeedbackReportsPage() {
  const { tx, isEn } = useTx()
  const [board, setBoard] = useState<FeedbackBoard | null>(null)
  const { user } = useAuth()
  const me = (user?.email ?? '').toLowerCase()
  const [filter, setFilter] = useState<Filter>('new')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listFeedback()
      .then((data) => !cancelled && setBoard(data))
      .catch((caught) => !cancelled && setError(caught instanceof Error ? caught.message : 'Gagal memuat laporan.'))
    return () => {
      cancelled = true
    }
  }, [])

  const run = async (id: string, action: () => Promise<FeedbackReport | null>) => {
    setBusy(id)
    setError(null)
    try {
      const updated = await action()
      setBoard((current) => current && { ...current, reports: updated ? current.reports.map((r) => (r.id === id ? updated : r)) : current.reports.filter((r) => r.id !== id) })
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
      return false
    } finally {
      setBusy(null)
    }
  }

  const remove = (report: FeedbackReport) => {
    if (!window.confirm(tx(`Hapus laporan dari ${report.name}?`, `Delete the report from ${report.name}?`))) return
    void run(report.id, async () => {
      await deleteFeedback(report.id)
      return null
    })
  }

  const when = (iso: string) => new Date(iso).toLocaleString(isEn ? 'en-GB' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  const statusLabel = (status: string) => FEEDBACK_STATUS_LABELS[status as FeedbackStatus]?.[isEn ? 'en' : 'id'] ?? status
  const kindLabel = (kind: string) => (kind === 'bug' ? 'Bug' : tx('Saran', 'Suggestion'))

  const logLine = (event: FeedbackEvent) => {
    const [from = '', to = ''] = event.detail.split(' > ')
    switch (event.action) {
      case 'received':
        return tx('Laporan masuk', 'Report received')
      case 'auto_kind':
        return tx(`Jenis dikoreksi otomatis: ${kindLabel(from)} → ${kindLabel(to)}`, `Type corrected automatically: ${kindLabel(from)} → ${kindLabel(to)}`)
      case 'kind':
        return tx(`Jenis: ${kindLabel(from)} → ${kindLabel(to)}`, `Type: ${kindLabel(from)} → ${kindLabel(to)}`)
      case 'status':
        return `Status: ${statusLabel(from)} → ${statusLabel(to)}`
      case 'assignee':
        return tx(`Dikerjakan oleh: ${from} → ${to}`, `Processed by: ${from} → ${to}`)
      default:
        return event.detail ? tx(`Catatan ditambahkan (${event.detail})`, `Note added (${event.detail})`) : tx('Catatan ditambahkan', 'Note added')
    }
  }

  const reports = board?.reports ?? []
  const count = (value: Filter) => (value === 'all' ? reports.length : reports.filter((r) => r.status === value).length)
  const visible = filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 outline-none sm:text-3xl" data-route-heading tabIndex={-1}>
            {tx('Laporan Bug & Saran', 'Bug Reports & Suggestions')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {board && !board.canHandle
              ? tx('Kiriman dari halaman /feedback. Anda bisa membaca; perubahan dilakukan penanggung jawab.', 'Sent from the /feedback page. You can read them; the handlers make changes.')
              : tx('Kiriman dari halaman /feedback.', 'Sent from the /feedback page.')}
          </p>
        </div>
        {board?.sheetUrl && (
          <a className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" href={board.sheetUrl} rel="noopener noreferrer" target="_blank">
            <Sheet aria-hidden="true" className="size-4" />
            {tx('Buka Google Sheet', 'Open Google Sheet')}
          </a>
        )}
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</p>}
      {!board && !error && <p className="text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>}

      {board && (
        <>
          <div aria-label={tx('Saring menurut status', 'Filter by status')} className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="group">
            {([...FEEDBACK_STATUSES, 'all'] as const).map((value) => (
              <button
                aria-pressed={filter === value}
                className={`cursor-pointer rounded-xl border bg-white px-3 py-2 text-left ${filter === value ? 'border-navy-700 ring-2 ring-gold-300' : 'border-slate-200 hover:bg-slate-50'}`}
                key={value}
                onClick={() => setFilter(value)}
                type="button"
              >
                <span className="block text-xs text-slate-500">{value === 'all' ? tx('Semua', 'All') : statusLabel(value)}</span>
                <span className="block text-2xl font-semibold text-slate-900">{count(value)}</span>
              </button>
            ))}
          </div>

          <FeedbackChart reports={reports} />

          {visible.length === 0 && <p className="text-sm text-slate-500">{tx('Belum ada laporan di sini.', 'No reports here.')}</p>}

          <ul className="space-y-3">
            {visible.map((report) => {
              const locked = !board.canHandle || busy === report.id
              const tone = report.kind === 'bug' ? 'bg-rose-50 text-rose-700' : 'bg-navy-50 text-navy-800'
              return (
                <li className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs" key={report.id}>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {board.canHandle ? (
                      <button
                        aria-label={tx(`Jenis ${kindLabel(report.kind)}. Ganti jenis`, `Type ${kindLabel(report.kind)}. Switch type`)}
                        className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 font-semibold disabled:opacity-60 ${tone}`}
                        disabled={locked}
                        onClick={() => void run(report.id, () => updateFeedback(report.id, { kind: report.kind === 'bug' ? 'suggestion' : 'bug' }))}
                        title={tx('Klik untuk ganti Bug / Saran', 'Click to switch Bug / Suggestion')}
                        type="button"
                      >
                        {kindLabel(report.kind)}
                        <ArrowLeftRight aria-hidden="true" className="size-3" />
                      </button>
                    ) : (
                      <span className={`rounded-full px-2 py-0.5 font-semibold ${tone}`}>{kindLabel(report.kind)}</span>
                    )}
                    <span className="font-semibold text-slate-900">{report.name}</span>
                    <span>{when(report.createdAt)}</span>
                    {report.page && <span className="break-all">· {report.page}</span>}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">{report.message}</p>
                  <Files files={report.files} />

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <label className="flex items-center gap-1.5">
                      Status
                      <select className={selectClass} disabled={locked} onChange={(e) => void run(report.id, () => updateFeedback(report.id, { status: e.target.value as FeedbackStatus }))} value={report.status}>
                        {FEEDBACK_STATUSES.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
                      </select>
                    </label>
                    <span className="flex flex-wrap items-center gap-1.5">
                      {tx('Dikerjakan oleh', 'Processed by')}
                      <span className="font-semibold text-slate-800">{!report.assignee ? tx('Belum ada', 'Nobody yet') : report.assignee === me ? tx('Kamu', 'You') : report.assignee}</span>
                      {board.canHandle && report.assignee !== me && (
                        <button className="cursor-pointer rounded-lg border border-slate-300 px-2 py-1 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60" disabled={locked} onClick={() => void run(report.id, () => updateFeedback(report.id, { assignee: me }))} type="button">
                          {report.assignee ? tx('Ambil alih', 'Take over') : tx('Ambil', 'Take it')}
                        </button>
                      )}
                      {board.canHandle && report.assignee && (report.assignee === me || board.canDelete) && (
                        <button className="cursor-pointer underline disabled:opacity-60" disabled={locked} onClick={() => void run(report.id, () => updateFeedback(report.id, { assignee: '' }))} type="button">
                          {tx('Lepas', 'Release')}
                        </button>
                      )}
                    </span>
                    {report.driveFolderId ? (
                      <a className="inline-flex items-center gap-1.5 font-medium text-navy-800 underline" href={`https://drive.google.com/drive/folders/${encodeURIComponent(report.driveFolderId)}`} rel="noopener noreferrer" target="_blank">
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                        {tx('Buka folder di Drive', 'Open the Drive folder')}
                      </a>
                    ) : (
                      <span className="text-amber-700">{tx('Belum ada di Drive.', 'Not in Drive yet.')} {report.driveError}</span>
                    )}
                    {board.canHandle && (!report.driveFolderId || report.driveError) && (
                      <button className="inline-flex cursor-pointer items-center gap-1 underline" disabled={locked} onClick={() => void run(report.id, () => copyFeedbackToDrive(report.id))} type="button">
                        <UploadCloud aria-hidden="true" className="size-3.5" />
                        {tx('Salin ke Drive', 'Copy to Drive')}
                      </button>
                    )}
                    {board.canDelete && (
                      <button className="ml-auto inline-flex cursor-pointer items-center gap-1 text-rose-600" disabled={busy === report.id} onClick={() => remove(report)} type="button">
                        <Trash2 aria-hidden="true" className="size-3.5" />
                        {tx('Hapus', 'Delete')}
                      </button>
                    )}
                  </div>

                  <details className="mt-3 border-t border-slate-100 pt-2">
                    <summary className="cursor-pointer text-xs font-medium text-slate-600">
                      {tx(`Catatan (${report.notes.length}) dan riwayat`, `Notes (${report.notes.length}) and log`)}
                    </summary>
                    <ul className="mt-2 space-y-2">
                      {report.notes.map((note) => (
                        <li className="rounded-lg bg-slate-50 px-3 py-2" key={note.id}>
                          <p className="text-xs text-slate-500">{note.author} · {when(note.createdAt)}</p>
                          {note.body && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">{note.body}</p>}
                          <Files files={note.files} />
                        </li>
                      ))}
                    </ul>
                    {board.canHandle && <NoteForm busy={busy === report.id} onSend={(body, files) => run(report.id, () => addFeedbackNote(report.id, body, files))} />}
                    <ol className="mt-3 space-y-1 text-xs text-slate-500">
                      {report.log.length === 0 && <li>{tx('Belum ada riwayat.', 'No log yet.')}</li>}
                      {report.log.map((event) => (
                        <li key={event.id}>{when(event.at)} · {logLine(event)}{event.actor && ` · ${event.actor}`}</li>
                      ))}
                    </ol>
                  </details>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
