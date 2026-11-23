import { Search } from 'lucide-react'
import { useTx } from '../i18n/use-tx'
import type { MhcuListItem, PsychologistOption } from './api'
import { LEVEL_STYLE, PAYMENT_STYLE, dateText, summarize, type MhcuFilters, type StatusFilter, type TodoFilter } from './helpers'

const LEVEL_BAR = ['bg-emerald-500', 'bg-lime-500', 'bg-amber-400', 'bg-orange-500', 'bg-rose-600']

const selectClass =
  'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100'

export function LevelBadge({ level }: { level: number | null }) {
  const { tx } = useTx()
  if (level === null) return <span className="text-xs text-slate-400">–</span>
  return (
    <span aria-label={tx(`Level ${level}`, `Level ${level}`)} className={`inline-flex min-w-7 justify-center rounded-md px-1.5 py-0.5 text-xs font-bold ${LEVEL_STYLE[level] ?? 'bg-slate-100 text-slate-700'}`}>
      L{level}
    </span>
  )
}

export function PaymentChip({ status }: { status: string }) {
  const { tx } = useTx()
  const names: Record<string, string> = {
    UNPAID: tx('Belum bayar', 'Unpaid'),
    PAID: tx('Lunas', 'Paid'),
    FREE: tx('Gratis', 'Free'),
    INCLUDED: tx('Termasuk', 'Included'),
    LEGACY: tx('Data lama', 'Legacy'),
  }
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${PAYMENT_STYLE[status] ?? PAYMENT_STYLE.LEGACY}`}>{names[status] ?? status}</span>
}

export function StatusText({ status }: { status: string }) {
  const { tx } = useTx()
  return <>{status === 'new' ? tx('Baru', 'New') : status === 'reviewed' ? tx('Ditinjau', 'Reviewed') : tx('Dirilis', 'Released')}</>
}

/** Counts from the list: how many results, people, returning people, and what still needs doing. */
export function CohortTiles({ items }: { items: readonly MhcuListItem[] }) {
  const { tx } = useTx()
  const s = summarize(items)
  const total = s.levels.reduce((a, b) => a + b, 0) || 1
  const tiles: [string, number][] = [
    [tx('Hasil', 'Results'), s.results],
    [tx('Peserta unik', 'People'), s.people],
    [tx('Pemeriksaan ulang (T2+)', 'Repeat check-ups (T2+)'), s.returning],
    [tx('Belum bayar', 'Unpaid'), s.unpaid],
    [tx('Belum ditugaskan', 'Not assigned'), s.unassigned],
    [tx('Belum dirilis', 'Not released'), s.unreleased],
  ]
  return (
    <section aria-label={tx('Ringkasan', 'Summary')} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map(([label, value]) => (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3" key={label}>
          <p className="text-2xl font-bold text-navy-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      ))}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:col-span-3 lg:col-span-6">
        <p className="text-xs text-slate-500">{tx('Sebaran level', 'Level distribution')}</p>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={s.levels.map((n, i) => `L${i + 1}: ${n}`).join(', ')}>
          {s.levels.map((n, i) => (n ? <span className={LEVEL_BAR[i]} key={i} style={{ width: `${(n / total) * 100}%` }} /> : null))}
        </div>
        <p className="mt-1 text-xs text-slate-600">{s.levels.map((n, i) => `L${i + 1} ${n}`).join(' · ')}</p>
      </div>
    </section>
  )
}

export function SessionFilters({
  filters,
  onChange,
  psychologists,
  shown,
}: {
  filters: MhcuFilters
  onChange: (next: MhcuFilters) => void
  psychologists: PsychologistOption[]
  shown: number
}) {
  const { tx } = useTx()
  const set = <K extends keyof MhcuFilters>(key: K, value: MhcuFilters[K]) => onChange({ ...filters, [key]: value })
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <label className="relative block w-full min-w-48 flex-1 sm:max-w-xs">
        <span className="sr-only">{tx('Cari', 'Search')}</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
          onChange={(e) => set('q', e.target.value)}
          placeholder={tx('Cari nama, kode, email, telepon...', 'Search name, code, e-mail, phone...')}
          type="search"
          value={filters.q}
        />
      </label>
      <label>
        <span className="sr-only">{tx('Status', 'Status')}</span>
        <select className={selectClass} onChange={(e) => set('status', e.target.value as StatusFilter)} value={filters.status}>
          <option value="all">{tx('Semua status', 'All statuses')}</option>
          <option value="new">{tx('Baru', 'New')}</option>
          <option value="reviewed">{tx('Ditinjau', 'Reviewed')}</option>
          <option value="released">{tx('Dirilis', 'Released')}</option>
        </select>
      </label>
      <label>
        <span className="sr-only">Level</span>
        <select className={selectClass} onChange={(e) => set('level', e.target.value as MhcuFilters['level'])} value={filters.level}>
          <option value="">{tx('Semua level', 'All levels')}</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={String(n)}>
              Level {n}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">{tx('Pembayaran', 'Payment')}</span>
        <select className={selectClass} onChange={(e) => set('payment', e.target.value as MhcuFilters['payment'])} value={filters.payment}>
          <option value="">{tx('Semua pembayaran', 'All payments')}</option>
          {['UNPAID', 'PAID', 'FREE', 'INCLUDED', 'LEGACY'].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      {psychologists.length > 0 && (
        <label>
          <span className="sr-only">{tx('Psikolog', 'Psychologist')}</span>
          <select className={selectClass} onChange={(e) => set('psychologist', e.target.value)} value={filters.psychologist}>
            <option value="">{tx('Semua psikolog', 'All psychologists')}</option>
            <option value="none">{tx('Belum ditugaskan', 'Not assigned')}</option>
            {psychologists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span className="sr-only">{tx('Perlu ditangani', 'To do')}</span>
        <select className={selectClass} onChange={(e) => set('todo', e.target.value as TodoFilter)} value={filters.todo}>
          <option value="">{tx('Semua', 'Everything')}</option>
          <option value="unreleased">{tx('Belum dirilis', 'Not released yet')}</option>
          <option value="unassigned">{tx('Belum ditugaskan', 'Not assigned')}</option>
          <option value="return">{tx('Peserta kembali (T2+)', 'Repeat check-ups (T2+)')}</option>
          <option value="urgent">{tx('Level 4–5', 'Level 4–5')}</option>
        </select>
      </label>
      <span aria-live="polite" className="text-sm text-slate-500">
        {shown} {tx('hasil', 'results')}
      </span>
    </div>
  )
}

export function SessionTable({
  items,
  selectedId,
  psychologists,
  onOpen,
}: {
  items: readonly MhcuListItem[]
  selectedId: string | null
  psychologists: PsychologistOption[]
  onOpen: (id: string) => void
}) {
  // With a result open beside the list the table is narrow: the less important columns wait until the screen is wide.
  const narrow = selectedId ? 'hidden 2xl:table-cell' : ''
  const { tx } = useTx()
  const nameOf = (id: string | null) => (id ? psychologists.find((p) => p.id === id)?.name.split(',')[0] ?? tx('Ditugaskan', 'Assigned') : tx('belum ditugaskan', 'not assigned'))
  if (items.length === 0) return <p className="p-6 text-sm text-slate-500">{tx('Tidak ada hasil yang cocok.', 'No matching results.')}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <caption className="sr-only">{tx('Daftar hasil MHCU', 'MHCU results')}</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2 font-semibold" scope="col">{tx('Tanggal', 'Date')}</th>
            <th className="px-3 py-2 font-semibold" scope="col">{tx('Nama', 'Name')}</th>
            <th className="px-3 py-2 font-semibold" scope="col">T</th>
            <th className="px-3 py-2 font-semibold" scope="col">Level</th>
            <th className={`px-3 py-2 font-semibold ${narrow}`} scope="col">{tx('Psikolog', 'Psychologist')}</th>
            <th className="px-3 py-2 font-semibold" scope="col">{tx('Bayar', 'Payment')}</th>
            <th className={`px-3 py-2 font-semibold ${narrow}`} scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr className={`border-b border-slate-100 hover:bg-slate-50 ${selectedId === item.id ? 'bg-navy-50/60' : ''}`} key={item.id}>
              <td className="whitespace-nowrap px-3 py-2 text-slate-600">{dateText(item.createdAt)}</td>
              <td className="max-w-56 px-3 py-2">
                <button
                  aria-current={selectedId === item.id ? 'true' : undefined}
                  className="block w-full min-w-0 cursor-pointer text-left"
                  onClick={() => onOpen(item.id)}
                  type="button"
                >
                  <span className="block truncate font-semibold text-slate-900">{item.name}</span>
                  <span className="block truncate text-xs text-slate-500">{item.code}</span>
                </button>
              </td>
              <td className="px-3 py-2 text-slate-700">{item.waveNo ? `T${item.waveNo}` : '–'}</td>
              <td className="px-3 py-2"><LevelBadge level={item.level} /></td>
              <td className={`px-3 py-2 text-slate-600 ${narrow}`}>{nameOf(item.psychologistId)}</td>
              <td className="px-3 py-2"><PaymentChip status={item.paymentStatus} /></td>
              <td className={`px-3 py-2 text-slate-600 ${narrow}`}><StatusText status={item.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
