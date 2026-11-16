import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TrafficRow } from '@attentiveid/shared'
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw, Search } from 'lucide-react'
import { getTraffic } from '../../features/admin-tools/service'
import {
  PAGE_LABELS,
  emptyTrafficFilters,
  filterAndSortTraffic,
  pageLabel,
  type TrafficFilters,
  type TrafficSortKey,
} from '../../features/admin-tools/traffic-table'

const COLUMNS: Array<{ key: TrafficSortKey; label: string; numeric: boolean }> = [
  { key: 'path', label: 'Halaman', numeric: false },
  { key: 'today', label: 'Hari ini', numeric: true },
  { key: 'last7Days', label: '7 hari', numeric: true },
  { key: 'last30Days', label: '30 hari', numeric: true },
  { key: 'total', label: 'Total', numeric: true },
  { key: 'sessionsLast30Days', label: 'Sesi 30 hari', numeric: true },
  { key: 'lastVisitAt', label: 'Kunjungan terakhir', numeric: false },
]

const minFilterKey: Partial<Record<TrafficSortKey, keyof TrafficFilters>> = {
  today: 'minToday',
  last7Days: 'minLast7Days',
  last30Days: 'minLast30Days',
  total: 'minTotal',
}

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-normal normal-case tracking-normal text-slate-900 outline-none focus:border-sky-500'

export function TrafficMonitorPage() {
  const [rows, setRows] = useState<TrafficRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [filters, setFilters] = useState<TrafficFilters>(emptyTrafficFilters)
  const [sortKey, setSortKey] = useState<TrafficSortKey>('total')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      setRows(await getTraffic())
      setUpdatedAt(new Date())
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal memuat traffic.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(() => filterAndSortTraffic(rows, filters, sortKey, direction), [rows, filters, sortKey, direction])
  const totals = useMemo(
    () => visible.reduce((sum, row) => ({ today: sum.today + row.today, last7Days: sum.last7Days + row.last7Days, last30Days: sum.last30Days + row.last30Days, total: sum.total + row.total }), { today: 0, last7Days: 0, last30Days: 0, total: 0 }),
    [visible],
  )

  const toggleSort = (key: TrafficSortKey) => {
    if (key === sortKey) setDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setDirection(key === 'path' ? 'asc' : 'desc')
    }
  }

  const setMin = (key: keyof TrafficFilters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value === '' ? null : Math.max(0, Number(value)) }))

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(emptyTrafficFilters())

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
            Traffic Monitor
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Jumlah kunjungan halaman utama saja. Halaman dengan banyak sub-halaman (artikel, profil psikolog, edisi Sci-Brief) dihitung di halaman awalnya. Tidak ada data pribadi yang disimpan; bot dan "Do Not Track" tidak dihitung.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          disabled={isLoading}
          onClick={() => void load()}
          type="button"
        >
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Muat ulang
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Cari halaman</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
            placeholder="Cari halaman..."
            type="search"
            value={filters.search}
          />
        </label>
        {isFiltered && (
          <button className="text-sm text-slate-500 underline cursor-pointer" onClick={() => setFilters(emptyTrafficFilters())} type="button">
            Hapus semua filter
          </button>
        )}
        <span className="ml-auto text-xs text-slate-500">
          {visible.length} dari {rows.length} halaman{updatedAt ? ` · diperbarui ${updatedAt.toLocaleTimeString('id-ID', { timeStyle: 'short' })}` : ''}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {COLUMNS.map((column) => {
                  const active = sortKey === column.key
                  return (
                    <th
                      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                      className={`px-4 pt-3 ${column.numeric ? 'text-right' : ''}`}
                      key={column.key}
                      scope="col"
                    >
                      <button
                        className={`inline-flex cursor-pointer items-center gap-1 uppercase tracking-wider ${column.numeric ? 'flex-row-reverse' : ''} ${active ? 'text-slate-900' : ''}`}
                        onClick={() => toggleSort(column.key)}
                        type="button"
                      >
                        {column.label}
                        {active ? (direction === 'asc' ? <ArrowUp className="size-3.5" aria-hidden="true" /> : <ArrowDown className="size-3.5" aria-hidden="true" />) : <ArrowUpDown className="size-3.5 opacity-40" aria-hidden="true" />}
                      </button>
                    </th>
                  )
                })}
              </tr>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {COLUMNS.map((column) => {
                  const filterKey = minFilterKey[column.key]
                  return (
                    <th className="px-4 pb-3 pt-1" key={column.key}>
                      {column.key === 'path' ? (
                        <input
                          aria-label="Filter halaman"
                          className={inputClass}
                          onChange={(e) => setFilters((current) => ({ ...current, page: e.target.value }))}
                          placeholder="Filter..."
                          value={filters.page}
                        />
                      ) : filterKey ? (
                        <input
                          aria-label={`Minimal ${column.label}`}
                          className={`${inputClass} text-right`}
                          min={0}
                          onChange={(e) => setMin(filterKey, e.target.value)}
                          placeholder="min"
                          type="number"
                          value={(filters[filterKey] as number | null) ?? ''}
                        />
                      ) : null}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={COLUMNS.length}>
                    {isLoading ? 'Memuat...' : 'Tidak ada halaman yang cocok dengan filter.'}
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr className="hover:bg-slate-50/50" key={row.path}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{pageLabel(row.path)}</div>
                      <div className="text-xs text-slate-500">{row.path}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.today.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.last7Days.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.last30Days.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{row.total.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.sessionsLast30Days.toLocaleString('id-ID')}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.lastVisitAt ? new Date(row.lastVisitAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {visible.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-700">
                  <td className="px-4 py-3">Jumlah ({visible.length} halaman)</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totals.today.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totals.last7Days.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totals.last30Days.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totals.total.toLocaleString('id-ID')}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      <p className="text-xs text-slate-500">Halaman yang dihitung: {Object.values(PAGE_LABELS).join(', ')}. Hari dihitung menurut waktu Jakarta (WIB).</p>
    </div>
  )
}
