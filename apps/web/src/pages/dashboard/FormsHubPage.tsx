import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Compass, Loader2 } from 'lucide-react'
import { listSubmissions, type AssessmentListItem } from '@/features/assessments/service'
import { mergeActivity, summarizeForm, type FormKey } from '@/features/dashboard/forms-activity'
import { useTx } from '@/features/i18n/use-tx'

const FORMS: Array<{ key: FormKey; title: string; open: string; blurb: string; blurbEn: string }> = [
  {
    key: 'mhcu',
    title: 'Mental Health Check-Up (MHCU)',
    open: '/dashboard/assessments/mhcu',
    blurb: 'Hasil, pembayaran, catatan psikolog, dan rilis laporan.',
    blurbEn: 'Results, payment, psychologist notes and report release.',
  },
  {
    key: 'gsc',
    title: 'Goal System Compass (GSC)',
    open: '/dashboard/assessments/gsc',
    blurb: 'Hasil pengisian Goal System Compass.',
    blurbEn: 'Goal System Compass submissions.',
  },
]

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) : '–'

/** One page for the activity of every form; each form has its own menu below it for the details. */
export function FormsHubPage() {
  const { tx, isEn } = useTx()
  const [lists, setLists] = useState<Partial<Record<FormKey, AssessmentListItem[]>>>({})
  const [failed, setFailed] = useState<FormKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    void (async () => {
      const results = await Promise.allSettled(FORMS.map((form) => listSubmissions(form.key)))
      if (!alive) return
      const next: Partial<Record<FormKey, AssessmentListItem[]>> = {}
      const bad: FormKey[] = []
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') next[FORMS[index].key] = result.value
        else bad.push(FORMS[index].key)
      })
      setLists(next)
      setFailed(bad)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const activity = mergeActivity(lists, 12)

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          {tx('Aktivitas Formulir', 'Form activity')}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {tx('Semua formulir di satu tempat. Pilih formulirnya di menu kiri untuk melihat detail.', 'All forms in one place. Pick a form in the left menu for the details.')}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FORMS.map((form) => {
          const items = lists[form.key]
          const summary = items ? summarizeForm(form.key, items) : null
          const Icon = form.key === 'mhcu' ? ClipboardCheck : Compass
          return (
            <Link
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-navy-300"
              key={form.key}
              to={form.open}
            >
              <div className="flex items-center gap-2">
                <Icon aria-hidden="true" className="size-5 text-navy-700" />
                <h2 className="text-base font-bold text-slate-900">{form.title}</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">{isEn ? form.blurbEn : form.blurb}</p>
              {loading ? (
                <Loader2 aria-label="Loading" className="mt-3 size-4 animate-spin text-slate-400" />
              ) : summary ? (
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-slate-500">{tx('Total', 'Total')}</dt>
                    <dd className="text-lg font-bold text-slate-900">{summary.total}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{tx('7 hari', 'Last 7 days')}</dt>
                    <dd className="text-lg font-bold text-slate-900">{summary.last7Days}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">{tx('Terbaru', 'Newest')}</dt>
                    <dd className="text-xs font-semibold text-slate-800">{when(summary.newest)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-3 text-xs text-rose-700">{tx('Belum bisa dimuat, atau Anda belum punya akses.', 'Could not load, or you do not have access.')}</p>
              )}
            </Link>
          )
        })}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">{tx('Aktivitas terbaru', 'Latest activity')}</h2>
        {loading ? (
          <Loader2 aria-label="Loading" className="mt-3 size-4 animate-spin text-slate-400" />
        ) : activity.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{tx('Belum ada aktivitas.', 'No activity yet.')}</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100">
            {activity.map((entry) => (
              <li key={`${entry.key}-${entry.id}`}>
                <Link
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-1 py-2 text-sm hover:bg-slate-50"
                  to={entry.key === 'mhcu' ? `/dashboard/assessments/mhcu/${entry.id}` : '/dashboard/assessments/gsc'}
                >
                  <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[11px] font-bold uppercase text-navy-800">{entry.key}</span>
                  <span className="font-semibold text-slate-900">{entry.name}</span>
                  <span className="text-xs text-slate-500">{entry.code}</span>
                  <span className="ml-auto text-xs text-slate-500">{when(entry.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {failed.length > 0 && !loading && (
          <p className="mt-2 text-xs text-slate-500">
            {tx('Tidak termuat: ', 'Not loaded: ')}
            {failed.join(', ').toUpperCase()}
          </p>
        )}
      </section>
    </div>
  )
}
