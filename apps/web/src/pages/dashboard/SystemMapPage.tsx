import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Network } from 'lucide-react'
import {
  MAP_EDGES,
  MAP_NODES,
  NODE_BY_ID,
  STATUS_META,
  edgesOf,
  summarize,
  type MapColumn,
  type MapEdge,
  type MapNode,
  type MapStatus,
} from '../../features/system-map/map-data'

const COLUMN_X: Record<MapColumn, number> = { portal: 10, source: 340, public: 670 }
const NODE_W = 230
const NODE_H = 50
const ROW = 62
const TOP = 56
const WIDTH = 910

const COLUMN_TITLE: Record<MapColumn, { title: string; hint: string }> = {
  portal: { title: 'Menu portal', hint: 'Tempat Anda mengubah' },
  source: { title: 'Sumber data', hint: 'Database atau kode' },
  public: { title: 'Yang dilihat pengunjung', hint: 'Halaman & komponen situs' },
}

const STATUS_STYLE: Record<MapStatus, { stroke: string; dot: string; chip: string; dash?: string }> = {
  live: { stroke: '#059669', dot: 'bg-emerald-600', chip: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  code: { stroke: '#d97706', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-800 border-amber-200' },
  missing: { stroke: '#e11d48', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-800 border-rose-200', dash: '6 5' },
  proposed: { stroke: '#0284c7', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-800 border-sky-200', dash: '3 4' },
}

const ALL_STATUSES: MapStatus[] = ['live', 'code', 'missing', 'proposed']

function layout() {
  const rows: Record<MapColumn, number> = { portal: 0, source: 0, public: 0 }
  const positions: Record<string, { x: number; y: number }> = {}
  for (const node of MAP_NODES) {
    positions[node.id] = { x: COLUMN_X[node.column], y: TOP + rows[node.column]++ * ROW }
  }
  return { positions, height: TOP + Math.max(...Object.values(rows)) * ROW + 10 }
}

function edgePath(edge: MapEdge, positions: Record<string, { x: number; y: number }>) {
  const from = positions[edge.from]
  const to = positions[edge.to]
  const forward = COLUMN_X[NODE_BY_ID[edge.from].column] <= COLUMN_X[NODE_BY_ID[edge.to].column]
  const x1 = forward ? from.x + NODE_W : from.x
  const x2 = forward ? to.x : to.x + NODE_W
  const y1 = from.y + NODE_H / 2
  const y2 = to.y + NODE_H / 2
  const mid = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
}

// The map never changes while the page is open, so compute it once.
const LAYOUT = layout()
const TOTALS = summarize()

export function SystemMapPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [visible, setVisible] = useState<Set<MapStatus>>(new Set(ALL_STATUSES))

  const { positions, height } = LAYOUT
  const totals = TOTALS
  const selected = selectedId ? NODE_BY_ID[selectedId] : null
  const selectedEdges = selectedId ? edgesOf(selectedId) : []
  const connectedIds = new Set(selectedEdges.flatMap((edge) => [edge.from, edge.to]))
  const missingEdges = MAP_EDGES.filter((edge) => edge.status === 'missing')

  const toggle = (status: MapStatus) =>
    setVisible((current) => {
      const next = new Set(current)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })

  const isNodeDimmed = (node: MapNode) => Boolean(selectedId) && node.id !== selectedId && !connectedIds.has(node.id)

  return (
    <div className="max-w-7xl space-y-6 pb-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="mb-1 inline-block rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
          Experimental
        </div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900" data-route-heading tabIndex={-1}>
          <Network className="size-6 text-slate-500" aria-hidden="true" />
          System Map
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Peta hubungan antara menu portal, tempat data disimpan, dan apa yang dilihat pengunjung. Klik sebuah kotak untuk
          melihat apa yang terhubung dengannya dan apa yang perlu diperbaiki.
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              ['live', totals.live, 'koneksi berjalan'],
              ['code', totals.code, 'terkunci di kode'],
              ['missing', totals.missing, 'belum tersambung'],
              ['proposed', totals.proposed, 'menu usulan'],
            ] as const
          ).map(([status, count, label]) => (
            <div className="rounded-xl border border-slate-200 p-3" key={status}>
              <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className={`size-2 rounded-full ${STATUS_STYLE[status].dot}`} aria-hidden="true" />
                {STATUS_META[status].label}
              </dt>
              <dd className="mt-1 text-2xl font-bold text-slate-900">
                {count} <span className="text-xs font-medium text-slate-500">{label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter garis">
          {ALL_STATUSES.map((status) => (
            <button
              aria-pressed={visible.has(status)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-opacity cursor-pointer ${STATUS_STYLE[status].chip} ${
                visible.has(status) ? '' : 'opacity-40'
              }`}
              key={status}
              onClick={() => toggle(status)}
              title={STATUS_META[status].description}
              type="button"
            >
              <span className={`size-2 rounded-full ${STATUS_STYLE[status].dot}`} aria-hidden="true" />
              {STATUS_META[status].label}
            </button>
          ))}
          {selectedId && (
            <button
              className="ml-auto rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              onClick={() => setSelectedId(null)}
              type="button"
            >
              Hapus pilihan
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
          <svg
            aria-label="Diagram hubungan portal, sumber data, dan halaman publik"
            className="min-w-[820px]"
            role="group"
            viewBox={`0 0 ${WIDTH} ${height}`}
            width="100%"
          >
            {(Object.keys(COLUMN_TITLE) as MapColumn[]).map((column) => (
              <g key={column}>
                <text className="fill-slate-900" fontSize="14" fontWeight="700" x={COLUMN_X[column]} y="20">
                  {COLUMN_TITLE[column].title}
                </text>
                <text className="fill-slate-500" fontSize="11" x={COLUMN_X[column]} y="36">
                  {COLUMN_TITLE[column].hint}
                </text>
              </g>
            ))}

            {MAP_EDGES.filter((edge) => visible.has(edge.status)).map((edge) => {
              const style = STATUS_STYLE[edge.status]
              const highlighted = selectedId ? edge.from === selectedId || edge.to === selectedId : false
              const opacity = selectedId ? (highlighted ? 1 : 0.06) : 0.5
              return (
                <path
                  d={edgePath(edge, positions)}
                  data-edge={`${edge.from}>${edge.to}`}
                  fill="none"
                  key={`${edge.from}>${edge.to}>${edge.status}`}
                  opacity={opacity}
                  stroke={style.stroke}
                  strokeDasharray={style.dash}
                  strokeWidth={highlighted ? 2.5 : 1.5}
                >
                  <title>{`${NODE_BY_ID[edge.from].label} → ${NODE_BY_ID[edge.to].label}: ${edge.label}`}</title>
                </path>
              )
            })}

            {MAP_NODES.map((node) => {
              const { x, y } = positions[node.id]
              const style = STATUS_STYLE[node.status]
              const isSelected = node.id === selectedId
              return (
                <g
                  aria-label={`${node.label}. ${STATUS_META[node.status].label}`}
                  aria-pressed={isSelected}
                  className="cursor-pointer outline-none"
                  data-node={node.id}
                  key={node.id}
                  onClick={() => setSelectedId(isSelected ? null : node.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedId(isSelected ? null : node.id)
                    }
                  }}
                  opacity={isNodeDimmed(node) ? 0.3 : 1}
                  role="button"
                  tabIndex={0}
                >
                  <rect
                    className={isSelected ? 'fill-slate-50' : 'fill-white'}
                    height={NODE_H}
                    rx="12"
                    stroke={style.stroke}
                    strokeDasharray={node.status === 'proposed' ? '4 3' : undefined}
                    strokeWidth={isSelected ? 3 : 1.5}
                    width={NODE_W}
                    x={x}
                    y={y}
                  />
                  <rect fill={style.stroke} height={NODE_H - 16} rx="2" width="4" x={x + 10} y={y + 8} />
                  <text className="fill-slate-900" fontSize="13" fontWeight="600" x={x + 24} y={y + 22}>
                    {node.label}
                  </text>
                  <text className="fill-slate-500" fontSize="11" x={x + 24} y={y + 38}>
                    {node.sub}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <aside aria-label="Detail kotak terpilih" aria-live="polite" className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          {selected ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[selected.status].chip}`}>
                <span className={`size-2 rounded-full ${STATUS_STYLE[selected.status].dot}`} aria-hidden="true" />
                {STATUS_META[selected.status].label}
              </span>
              <h2 className="mt-2 text-lg font-bold text-slate-900">{selected.label}</h2>
              <p className="text-xs text-slate-500">{selected.sub}</p>
              <p className="mt-3 text-sm text-slate-700">{selected.about}</p>
              {selected.note && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{selected.note}</p>
              )}
              {selected.route && (
                <Link
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                  to={selected.route}
                >
                  Buka menu ini <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              )}
              <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Terhubung ke</h3>
              <ul className="mt-2 space-y-1.5">
                {selectedEdges.map((edge) => {
                  const otherId = edge.from === selected.id ? edge.to : edge.from
                  return (
                    <li key={`${edge.from}>${edge.to}>${edge.status}`}>
                      <button
                        className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedId(otherId)}
                        type="button"
                      >
                        <span className={`mt-1 size-2 shrink-0 rounded-full ${STATUS_STYLE[edge.status].dot}`} aria-hidden="true" />
                        <span>
                          <span className="font-semibold text-slate-800">{NODE_BY_ID[otherId].label}</span>
                          <span className="block text-slate-500">
                            {edge.from === selected.id ? '→' : '←'} {edge.label}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
              Pilih sebuah kotak di diagram untuk melihat penjelasan dan sambungannya.
            </div>
          )}

          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
            <h2 className="text-sm font-bold text-rose-900">Perlu disambungkan ({missingEdges.length})</h2>
            {missingEdges.length === 0 && (
              <p className="mt-2 text-xs text-rose-800">Semua sambungan yang dipetakan sudah terhubung.</p>
            )}
            <ul className="mt-2 space-y-1.5">
              {missingEdges.map((edge) => (
                <li key={`${edge.from}>${edge.to}`}>
                  <button
                    className="w-full rounded-lg px-2 py-1 text-left text-xs text-rose-900 hover:bg-rose-100/70 cursor-pointer"
                    onClick={() => setSelectedId(edge.to)}
                    type="button"
                  >
                    <span className="font-semibold">{NODE_BY_ID[edge.from].label}</span> → {NODE_BY_ID[edge.to].label}
                    <span className="block text-rose-700/80">{edge.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
