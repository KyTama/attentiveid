import { useState } from 'react'
import type { FeedbackReport } from '@attentiveid/shared'
import { useTx } from '@/features/i18n/use-tx'
import { feedbackPeriods } from './periods'

// Two series, checked for colour-blind separation and contrast on both portal surfaces.
const SERIES = [
  { key: 'bug', swatch: 'bg-[#eb6834] dark:bg-[#d95926]' },
  { key: 'suggestion', swatch: 'bg-[#2a78d6] dark:bg-[#3987e5]' },
] as const

/** Reports received per day (or per week for a longer history), split into bugs and suggestions. */
export function FeedbackChart({ reports }: { reports: FeedbackReport[] }) {
  const { tx, isEn } = useTx()
  const [active, setActive] = useState<number | null>(null)
  const [table, setTable] = useState(false)
  const { periods, weekly } = feedbackPeriods(reports, new Date())
  const max = Math.max(1, ...periods.map((p) => p.bug + p.suggestion))
  const labels = { bug: 'Bug', suggestion: tx('Saran', 'Suggestion') }
  const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(isEn ? 'en-GB' : 'id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const name = (start: string) => (weekly ? tx(`Minggu ${day(start)}`, `Week of ${day(start)}`) : day(start))
  const shown = active === null ? null : periods[active]

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">
          {weekly ? tx('Laporan masuk per minggu', 'Reports received per week') : tx('Laporan masuk per hari', 'Reports received per day')}
        </h2>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          {SERIES.map((series) => (
            <span className="flex items-center gap-1.5" key={series.key}>
              <span aria-hidden="true" className={`size-2.5 rounded-sm ${series.swatch}`} />
              {labels[series.key]}
            </span>
          ))}
          <button className="cursor-pointer underline" onClick={() => setTable((value) => !value)} type="button">
            {table ? tx('Lihat grafik', 'Show chart') : tx('Lihat tabel', 'Show table')}
          </button>
        </div>
      </div>

      {table ? (
        <table className="mt-3 w-full text-left text-xs text-slate-700">
          <thead>
            <tr className="text-slate-500">
              <th className="py-1 font-medium">{tx('Periode', 'Period')}</th>
              <th className="py-1 font-medium">{labels.bug}</th>
              <th className="py-1 font-medium">{labels.suggestion}</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr className="border-t border-slate-100" key={period.start}>
                <td className="py-1">{name(period.start)}</td>
                <td className="py-1 tabular-nums">{period.bug}</td>
                <td className="py-1 tabular-nums">{period.suggestion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <p aria-live="polite" className="mt-2 h-4 text-xs text-slate-600">
            {shown ? `${name(shown.start)}: ${shown.bug} ${labels.bug}, ${shown.suggestion} ${labels.suggestion}` : tx(`Tertinggi: ${max}`, `Peak: ${max}`)}
          </p>
          <div className="mt-1 flex h-36 items-stretch gap-1 border-b border-slate-200" onMouseLeave={() => setActive(null)}>
            {periods.map((period, index) => (
              <button
                aria-label={`${name(period.start)}: ${period.bug} ${labels.bug}, ${period.suggestion} ${labels.suggestion}`}
                className={`flex min-w-0 flex-1 cursor-default flex-col items-center justify-end gap-0.5 rounded-t ${active === index ? 'bg-slate-100' : ''}`}
                key={period.start}
                onBlur={() => setActive(null)}
                onFocus={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
                type="button"
              >
                {/* Suggestions on top of bugs, with a 2px gap; only the top of the stack is rounded. */}
                {period.suggestion > 0 && <span className={`w-full max-w-6 rounded-t ${SERIES[1].swatch}`} style={{ height: `${(period.suggestion / max) * 92}%` }} />}
                {period.bug > 0 && <span className={`w-full max-w-6 ${period.suggestion > 0 ? '' : 'rounded-t'} ${SERIES[0].swatch}`} style={{ height: `${(period.bug / max) * 92}%` }} />}
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-slate-500">
            <span>{day(periods[0].start)}</span>
            <span>{day(periods[periods.length - 1].start)}</span>
          </div>
        </>
      )}
    </section>
  )
}
