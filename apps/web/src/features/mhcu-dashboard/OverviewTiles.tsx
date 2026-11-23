import { useTx } from '../i18n/use-tx'
import type { MhcuListItem, Overview } from './api'
import { LEVEL_HEX, deltaTone, fmt1, monthLabel, overviewFromList, signed1 } from './helpers'
import type { TodoFilter } from './helpers'

export type TileFilter = { todo?: TodoFilter; payment?: 'UNPAID' }

/** The cohort tiles at the top of the dashboard: counts from the overview call, or from the list when that call failed. */
export function OverviewTiles({ overview, items, onFilter }: { overview: Overview | null; items: readonly MhcuListItem[]; onFilter: (filter: TileFilter) => void }) {
  const { tx, isEn } = useTx()
  const fallback = !overview
  const o = overview ?? { ...overviewFromList(items), meanMhi: null, meanChange: null, months: [], notesToFinish: null, readyNotReleased: null, notAssigned: overviewFromList(items).notAssigned }
  const dash = '–'
  const total = o.levels.reduce((a, b) => a + b, 0) || 1

  const tiles: { label: string; value: string; tone?: string; filter?: TileFilter; hot?: boolean }[] = [
    { label: tx('Sesi', 'Sessions'), value: String(o.sessions) },
    { label: tx('Peserta unik', 'People'), value: String(o.participants) },
    { label: tx('Peserta kembali (2 sesi atau lebih)', 'Returning (2 sessions or more)'), value: String(o.returning), filter: { todo: 'return' } },
    { label: tx('Rata-rata MHI', 'Mean MHI'), value: fmt1(o.meanMhi) },
    { label: tx('Rata-rata perubahan MHI (sesi pertama ke terakhir)', 'Mean MHI change (first to last session)'), value: o.meanChange === null ? dash : signed1(o.meanChange), tone: deltaTone(o.meanChange) },
    { label: tx('Belum bayar', 'Unpaid'), value: String(o.unpaid), filter: { payment: 'UNPAID' } },
    { label: tx('Bukti transfer masuk', 'Proof of transfer received'), value: String(o.awaitingConfirmation), filter: { todo: 'proof' }, hot: o.awaitingConfirmation > 0 },
    { label: tx('Catatan belum final', 'Notes not final'), value: o.notesToFinish === null ? dash : String(o.notesToFinish) },
    { label: tx('Siap kirim, belum dirilis', 'Ready, not released'), value: o.readyNotReleased === null ? dash : String(o.readyNotReleased) },
    { label: tx('Belum ditugaskan', 'Not assigned'), value: String(o.notAssigned), filter: { todo: 'unassigned' } },
  ]

  return (
    <section aria-label={tx('Ringkasan', 'Summary')} className="space-y-3">
      {fallback && <p className="text-xs text-amber-700" role="status">{tx('Ringkasan lengkap belum bisa dimuat; angka dihitung dari daftar.', 'The full summary could not be loaded; the numbers are counted from the list.')}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => {
          const body = (
            <>
              <span className={`block text-2xl font-bold ${tile.hot ? 'text-amber-800' : (tile.tone ?? 'text-navy-900')}`}>{tile.value}</span>
              <span className="block text-xs text-slate-600">{tile.label}</span>
            </>
          )
          const cls = `rounded-2xl border px-4 py-3 text-left ${tile.hot ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`
          return tile.filter ? (
            <button aria-label={`${tile.label}: ${tile.value}`} className={`${cls} cursor-pointer hover:bg-slate-50`} key={tile.label} onClick={() => onFilter(tile.filter as TileFilter)} type="button">
              {body}
            </button>
          ) : (
            <div className={cls} key={tile.label}>{body}</div>
          )
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">{tx('Sebaran level', 'Level distribution')}</p>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={o.levels.map((n, i) => `L${i + 1}: ${n}`).join(', ')}>
            {o.levels.map((n, i) => (n ? <span key={i} style={{ width: `${(n / total) * 100}%`, backgroundColor: LEVEL_HEX[i + 1] }} /> : null))}
          </div>
          <p className="mt-1 text-xs text-slate-600">{o.levels.map((n, i) => `L${i + 1} ${n}`).join(' · ')}</p>
        </div>
        {o.months.length > 0 && <MonthlyChart months={o.months} lang={isEn ? 'en' : 'id'} />}
      </div>
    </section>
  )
}

/** Sessions per month as plain bars (the demo returned this data and never drew it). */
export function MonthlyChart({ months, lang }: { months: Overview['months']; lang: 'id' | 'en' }) {
  const { tx } = useTx()
  const max = Math.max(1, ...months.map((m) => m.n))
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{tx('Sesi per bulan', 'Sessions per month')}</p>
      <ul aria-label={tx('Sesi per bulan', 'Sessions per month')} className="mt-2 flex h-24 items-end gap-1.5">
        {months.map((m) => (
          <li className="flex h-full min-w-0 flex-1 flex-col justify-end text-center" key={m.m}>
            <span className="text-[10px] font-semibold text-slate-700">{m.n}</span>
            <span aria-hidden="true" className="mx-auto w-full max-w-8 rounded-t bg-navy-700" style={{ height: `${Math.max(4, (m.n / max) * 70)}%` }} />
            <span className="mt-1 truncate text-[10px] text-slate-500">{monthLabel(m.m, lang)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
