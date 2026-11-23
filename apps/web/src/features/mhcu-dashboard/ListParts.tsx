import { useState } from 'react'
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { useTx } from '../i18n/use-tx'
import type { MhcuListItem, PsychologistOption } from './api'
import { LEVEL_STYLE, PAYMENT_STYLE, awaitsConfirmation, dateText, summarize, type MhcuFilters, type StatusFilter, type TodoFilter } from './helpers'

const LEVEL_BAR = ['bg-emerald-500', 'bg-lime-500', 'bg-amber-400', 'bg-orange-500', 'bg-rose-600']

const selectClass =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 sm:min-h-0 sm:w-auto'

export function LevelBadge({ level }: { level: number | null }) {
  if (level === null) return <span className="text-xs text-slate-400">–</span>
  return (
    <span aria-label={`Level ${level}`} className={`inline-flex min-w-7 justify-center rounded-md px-1.5 py-0.5 text-xs font-bold ${LEVEL_STYLE[level] ?? 'bg-slate-100 text-slate-700'}`}>
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

/** "Bukti transfer masuk": the person sent proof of transfer and the payment is still unconfirmed. */
export function ProofBadge() {
  const { tx } = useTx()
  return <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">{tx('Bukti transfer masuk', 'Proof of transfer received')}</span>
}

export function StatusText({ status }: { status: string }) {
  const { tx } = useTx()
  return <>{status === 'new' ? tx('Baru', 'New') : status === 'reviewed' ? tx('Ditinjau', 'Reviewed') : tx('Dirilis', 'Released')}</>
}

/** Counts from the list: how many results, people, returning people, and what still needs doing. */
export function CohortTiles({ items, onShowProof }: { items: readonly MhcuListItem[]; onShowProof?: () => void }) {
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
    <section aria-label={tx('Ringkasan', 'Summary')} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      <button
        aria-label={`${tx('Bukti transfer masuk', 'Proof of transfer received')}: ${s.awaiting}`}
        className={`cursor-pointer rounded-2xl border px-4 py-3 text-left ${s.awaiting > 0 ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}
        onClick={onShowProof}
        type="button"
      >
        <span className={`block text-2xl font-bold ${s.awaiting > 0 ? 'text-amber-800' : 'text-navy-900'}`}>{s.awaiting}</span>
        <span className="block text-xs text-slate-600">{tx('Bukti transfer masuk', 'Proof of transfer received')}</span>
      </button>
      {tiles.map(([label, value]) => (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3" key={label}>
          <p className="text-2xl font-bold text-navy-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      ))}
      <div className="col-span-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:col-span-4 lg:col-span-7">
        <p className="text-xs text-slate-500">{tx('Sebaran level', 'Level distribution')}</p>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={s.levels.map((n, i) => `L${i + 1}: ${n}`).join(', ')}>
          {s.levels.map((n, i) => (n ? <span className={LEVEL_BAR[i]} key={i} style={{ width: `${(n / total) * 100}%` }} /> : null))}
        </div>
        <p className="mt-1 text-xs text-slate-600">{s.levels.map((n, i) => `L${i + 1} ${n}`).join(' · ')}</p>
      </div>
    </section>
  )
}

const activeCount = (f: MhcuFilters): number => [f.status !== 'all', f.level !== '', f.payment !== '', f.psychologist !== '', f.todo !== ''].filter(Boolean).length

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
  // On a phone the selects wait behind one button; from "sm" up they are always in view.
  const [open, setOpen] = useState(false)
  const set = <K extends keyof MhcuFilters>(key: K, value: MhcuFilters[K]) => onChange({ ...filters, [key]: value })
  const active = activeCount(filters)
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2">
        <label className="relative block min-w-0 flex-1 sm:max-w-xs">
          <span className="sr-only">{tx('Cari', 'Search')}</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 sm:min-h-0"
            onChange={(e) => set('q', e.target.value)}
            placeholder={tx('Cari nama, kode, email, telepon...', 'Search name, code, e-mail, phone...')}
            type="search"
            value={filters.q}
          />
        </label>
        <button
          aria-controls="mhcu-filters"
          aria-expanded={open}
          className="flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:hidden"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" className="size-4" />
          {tx('Filter', 'Filters')}
          {active > 0 && <span className="rounded-full bg-navy-900 px-1.5 text-xs text-white">{active}</span>}
          <ChevronDown aria-hidden="true" className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <span aria-live="polite" className="hidden whitespace-nowrap text-sm text-slate-500 sm:inline">
          {shown} {tx('hasil', 'results')}
        </span>
      </div>
      <div className={`${open ? 'grid' : 'hidden'} grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3`} id="mhcu-filters">
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
            <option value="proof">{tx('Bukti transfer masuk (perlu dikonfirmasi)', 'Proof received (to confirm)')}</option>
            <option value="unreleased">{tx('Belum dirilis', 'Not released yet')}</option>
            <option value="unassigned">{tx('Belum ditugaskan', 'Not assigned')}</option>
            <option value="return">{tx('Peserta kembali (T2+)', 'Repeat check-ups (T2+)')}</option>
            <option value="urgent">{tx('Level 4–5', 'Level 4–5')}</option>
          </select>
        </label>
        {active > 0 && (
          <button
            className="min-h-11 cursor-pointer rounded-xl px-3 text-sm font-semibold text-navy-800 underline sm:min-h-0"
            onClick={() => onChange({ ...filters, status: 'all', level: '', payment: '', psychologist: '', todo: '' })}
            type="button"
          >
            {tx('Hapus filter', 'Clear filters')}
          </button>
        )}
      </div>
      <p aria-live="polite" className="text-sm text-slate-500 sm:hidden">
        {shown} {tx('hasil', 'results')}
      </p>
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
  const { tx } = useTx()
  // With a result open beside the list the table is narrow: the less important columns wait until the screen is wide.
  const narrow = selectedId ? 'hidden 2xl:table-cell' : ''
  const nameOf = (id: string | null) => (id ? psychologists.find((p) => p.id === id)?.name.split(',')[0] ?? tx('Ditugaskan', 'Assigned') : tx('belum ditugaskan', 'not assigned'))
  if (items.length === 0) return <p className="p-6 text-sm text-slate-500">{tx('Tidak ada hasil yang cocok.', 'No matching results.')}</p>
  return (
    <>
      {/* Phone: one card per result, the whole card is the button. */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <button
              aria-current={selectedId === item.id ? 'true' : undefined}
              className={`block min-h-11 w-full cursor-pointer px-4 py-3 text-left hover:bg-slate-50 ${selectedId === item.id ? 'bg-navy-50/60' : ''}`}
              onClick={() => onOpen(item.id)}
              type="button"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  <span className="block font-semibold text-slate-900">{item.name}</span>
                  <span className="block text-xs text-slate-500">{item.code}{item.waveNo ? ` · T${item.waveNo}` : ''} · {dateText(item.createdAt)}</span>
                </span>
                <LevelBadge level={item.level} />
              </span>
              <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <PaymentChip status={item.paymentStatus} />
                {awaitsConfirmation(item) && <ProofBadge />}
                <span><StatusText status={item.status} /></span>
                <span>· {nameOf(item.psychologistId)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
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
                <td className="px-3 py-2">
                  <span className="flex flex-col items-start gap-1">
                    <PaymentChip status={item.paymentStatus} />
                    {awaitsConfirmation(item) && <ProofBadge />}
                  </span>
                </td>
                <td className={`px-3 py-2 text-slate-600 ${narrow}`}><StatusText status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
