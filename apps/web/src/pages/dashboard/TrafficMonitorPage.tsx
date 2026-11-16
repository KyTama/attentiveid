import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTx } from '@/features/i18n/use-tx'
import { dailySeries, TRACKED_PAGES, type TrafficDayRow, type TrafficRow } from '@attentiveid/shared'
import { ArrowDown, ArrowUp, ArrowUpDown, RefreshCw, Search } from 'lucide-react'
import { getTraffic } from '../../features/admin-tools/service'
import {
  PAGE_LABELS,
  PAGE_LABELS_EN,
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

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-normal normal-case tracking-normal text-slate-900 outline-none focus:border-navy-500'

export function TrafficMonitorPage() {
  const { tx, isEn } = useTx()
  const columns = COLUMNS.map((column) => ({
    ...column,
    label: {
      path: tx('Halaman', 'Page'),
      today: tx('Hari ini', 'Today'),
      last7Days: tx('7 hari', '7 days'),
      last30Days: tx('30 hari', '30 days'),
      total: 'Total',
      sessionsLast30Days: tx('Sesi 30 hari', 'Sessions 30 days'),
      lastVisitAt: tx('Kunjungan terakhir', 'Last visit'),
    }[column.key],
  }))
  const [rows, setRows] = useState<TrafficRow[]>([])
  const [daily, setDaily] = useState<TrafficDayRow[]>([])
  const [range, setRange] = useState(30)
  const [chartPage, setChartPage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [filters, setFilters] = useState<TrafficFilters>(emptyTrafficFilters)
  const [sortKey, setSortKey] = useState<TrafficSortKey>('total')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const traffic = await getTraffic()
      setRows(traffic.rows)
      setDaily(traffic.daily)
      setUpdatedAt(new Date())
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal memuat traffic.', 'Failed to load traffic.'))
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

  const series = useMemo(() => dailySeries(daily, range, new Date(), chartPage || undefined), [daily, range, chartPage])

  const toggleSort =(key: TrafficSortKey) => {
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
            {tx('Jumlah kunjungan halaman utama saja. Halaman dengan banyak sub-halaman (artikel, profil psikolog, edisi Sci-Brief) dihitung di halaman awalnya. Tidak ada data pribadi yang disimpan; bot dan "Do Not Track" tidak dihitung.', 'Visits to the main pages only. Sections with many sub-pages (articles, psychologist profiles, Sci-Brief issues) are counted once, on their first page. No personal data is stored; bots and "Do Not Track" visitors are not counted.')}
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          disabled={isLoading}
          onClick={() => void load()}
          type="button"
        >
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {tx('Muat ulang', 'Refresh')}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}

      <section aria-label={tx('Grafik kunjungan harian', 'Daily visits graph')} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">{tx('Grafik kunjungan harian', 'Daily visits graph')}</h2>
            <p className="text-xs text-slate-500">{tx('Hitungan harian dimulai ulang tiap tengah malam WIB; riwayat semua hari tetap tersimpan.', 'Counts restart every midnight (WIB); the history of every day is kept.')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label={tx('Halaman grafik', 'Graph page')} className={`${inputClass} w-auto`} onChange={(e) => setChartPage(e.target.value)} value={chartPage}>
              <option value="">{tx('Semua halaman', 'All pages')}</option>
              {TRACKED_PAGES.map((path) => (
                <option key={path} value={path}>{pageLabel(path, isEn)}</option>
              ))}
            </select>
            <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold" role="group" aria-label={tx('Rentang waktu', 'Time range')}>
              {[7, 30, 90, 365].map((days) => (
                <button
                  aria-pressed={range === days}
                  className={`cursor-pointer px-3 py-1.5 ${range === days ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                  key={days}
                  onClick={() => setRange(days)}
                  type="button"
                >
                  {days === 365 ? tx('1 tahun', '1 year') : tx(`${days} hari`, `${days} days`)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <TrafficChart isEn={isEn} points={series} />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">{tx('Cari halaman', 'Search pages')}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
            onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
            placeholder={tx('Cari halaman...', 'Search pages...')}
            type="search"
            value={filters.search}
          />
        </label>
        {isFiltered && (
          <button className="text-sm text-slate-500 underline cursor-pointer" onClick={() => setFilters(emptyTrafficFilters())} type="button">
            {tx('Hapus semua filter', 'Clear all filters')}
          </button>
        )}
        <span className="ml-auto text-xs text-slate-500">
          {tx(`${visible.length} dari ${rows.length} halaman`, `${visible.length} of ${rows.length} pages`)}{updatedAt ? ` · ${tx('diperbarui', 'updated')} ${updatedAt.toLocaleTimeString(isEn ? 'en-US' : 'id-ID', { timeStyle: 'short' })}` : ''}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {columns.map((column) => {
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
                {columns.map((column) => {
                  const filterKey = minFilterKey[column.key]
                  return (
                    <th className="px-4 pb-3 pt-1" key={column.key}>
                      {column.key === 'path' ? (
                        <input
                          aria-label={tx('Filter halaman', 'Filter page')}
                          className={inputClass}
                          onChange={(e) => setFilters((current) => ({ ...current, page: e.target.value }))}
                          placeholder="Filter..."
                          value={filters.page}
                        />
                      ) : filterKey ? (
                        <input
                          aria-label={tx(`Minimal ${column.label}`, `Minimum ${column.label}`)}
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
                    {isLoading ? tx('Memuat...', 'Loading...') : tx('Tidak ada halaman yang cocok dengan filter.', 'No pages match the filters.')}
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr className="hover:bg-slate-50/50" key={row.path}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{pageLabel(row.path, isEn)}</div>
                      <div className="text-xs text-slate-500">{row.path}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.today.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.last7Days.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.last30Days.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{row.total.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.sessionsLast30Days.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {row.lastVisitAt ? new Date(row.lastVisitAt).toLocaleString(isEn ? 'en-US' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {visible.length > 0 && (
              <tfoot>
                <tr className="border-t border-slate-200 bg-slate-50/50 text-sm font-semibold text-slate-700">
                  <td className="px-4 py-3">{tx(`Jumlah (${visible.length} halaman)`, `Total (${visible.length} pages)`)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totals.today.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totals.last7Days.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totals.last30Days.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{totals.total.toLocaleString(isEn ? 'en-US' : 'id-ID')}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      <p className="text-xs text-slate-500">{tx('Halaman yang dihitung', 'Pages counted')}: {Object.values(isEn ? PAGE_LABELS_EN : PAGE_LABELS).join(', ')}. {tx('Hari dihitung menurut waktu Jakarta (WIB).', 'Days follow Jakarta time (WIB).')}</p>
    </div>
  )
}

function TrafficChart({ points, isEn }: { points: Array<{ day: string; views: number }>; isEn: boolean }) {
  const [hover, setHover] = useState<number | null>(null)
  const width = 760
  const height = 220
  const pad = { top: 12, right: 12, bottom: 24, left: 36 }
  const max = Math.max(1, ...points.map((point) => point.views))
  const niceMax = max <= 4 ? 4 : Math.ceil(max / 4) * 4
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const slot = innerW / Math.max(1, points.length)
  const barW = Math.max(1, slot * 0.7)
  const total = points.reduce((sum, point) => sum + point.views, 0)
  const locale = isEn ? 'en-US' : 'id-ID'
  const label = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })
  const active = hover === null ? null : points[hover]
  const tickEvery = Math.max(1, Math.ceil(points.length / 7))

  return (
    <div>
      <div className="mb-1 min-h-5 text-xs text-slate-600" aria-live="polite">
        {active
          ? `${label(active.day)}: ${active.views.toLocaleString(locale)} ${isEn ? 'visits' : 'kunjungan'}`
          : `${total.toLocaleString(locale)} ${isEn ? 'visits in this period' : 'kunjungan pada periode ini'}`}
      </div>
      <svg aria-label={isEn ? 'Bar chart of visits per day' : 'Grafik batang kunjungan per hari'} className="h-auto w-full" onMouseLeave={() => setHover(null)} role="img" viewBox={`0 0 ${width} ${height}`}>
        {[0, 1, 2, 3, 4].map((step) => {
          const y = pad.top + innerH - (innerH * step) / 4
          return (
            <g key={step}>
              <line className="stroke-slate-100" x1={pad.left} x2={width - pad.right} y1={y} y2={y} />
              <text className="fill-slate-400" fontSize="10" textAnchor="end" x={pad.left - 6} y={y + 3}>{Math.round((niceMax * step) / 4)}</text>
            </g>
          )
        })}
        {points.map((point, index) => {
          const h = (point.views / niceMax) * innerH
          const x = pad.left + index * slot + (slot - barW) / 2
          return (
            <g key={point.day} onMouseEnter={() => setHover(index)}>
              <rect fill="transparent" height={innerH} width={slot} x={pad.left + index * slot} y={pad.top} />
              <rect className={hover === index ? 'fill-gold-500' : 'fill-navy-700'} height={Math.max(point.views > 0 ? 1 : 0, h)} rx={Math.min(2, barW / 2)} width={barW} x={x} y={pad.top + innerH - h} />
              {index % tickEvery === 0 && (
                <text className="fill-slate-400" fontSize="10" textAnchor="middle" x={pad.left + index * slot + slot / 2} y={height - 6}>{label(point.day)}</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
