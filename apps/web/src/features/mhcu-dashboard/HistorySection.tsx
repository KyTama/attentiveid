import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTx } from '../i18n/use-tx'
import { getHistory, type HistoryData } from './api'
import { CHART, LEVEL_HEX, MHI_BANDS, chartPoints, deltaTone, fmt1, signed1, yOfScore } from './helpers'
import { LevelBadge } from './ListParts'

/** MHI over T1..Tn on the four reference bands, then the table of all check-ups of the person. */
export function HistorySection({ id, onOpenWave }: { id: string; onOpenWave: (id: string) => void }) {
  const { tx } = useTx()
  const [data, setData] = useState<HistoryData | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')

  useEffect(() => {
    let alive = true
    getHistory(id)
      .then((d) => {
        if (!alive) return
        setData(d)
        setState('ready')
      })
      .catch(() => alive && setState('failed'))
    return () => {
      alive = false
    }
  }, [id])

  if (state === 'loading') {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
        <Loader2 aria-hidden="true" className="size-4 animate-spin" /> {tx('Memuat riwayat...', 'Loading history...')}
      </p>
    )
  }
  if (state === 'failed' || !data || data.waves.length === 0) {
    return <p className="text-xs text-slate-500">{tx('Riwayat peserta belum bisa dimuat.', 'The history of this person could not be loaded.')}</p>
  }

  const points = chartPoints(data.waves, data.current)
  const plotRight = CHART.W - CHART.right
  return (
    <section aria-label={tx('Riwayat peserta', 'History of the participant')} className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">{tx('Riwayat peserta (longitudinal)', 'History of the participant')}</h3>
        <p className="text-xs text-slate-500">
          {data.participantNo ? `P${String(data.participantNo).padStart(5, '0')} · ` : ''}
          {data.nSessions} {tx('pemeriksaan', 'check-ups')}
          {data.nSessions > 1 ? ` · ${data.spanDays} ${tx('hari', 'days')}` : ''}
        </p>
      </div>

      <svg aria-label={tx('Grafik MHI per pemeriksaan', 'MHI per check-up')} className="w-full" role="img" viewBox={`0 0 ${CHART.W} ${CHART.H}`}>
        {MHI_BANDS.map((band) => (
          <rect fill={band.fill} height={yOfScore(band.from) - yOfScore(band.to)} key={band.from} opacity="0.13" width={plotRight - CHART.left} x={CHART.left} y={yOfScore(band.to)} />
        ))}
        {[0, 40, 55, 70, 100].map((tick) => (
          <text fill="#667085" fontSize="12" key={tick} textAnchor="end" x={CHART.left - 6} y={yOfScore(tick) + 3}>
            {tick}
          </text>
        ))}
        {points.length > 1 && <polyline fill="none" points={points.map((p) => `${p.x},${p.y}`).join(' ')} stroke="#142B51" strokeWidth="2.5" />}
        {points.map((p) => (
          <g
            aria-label={`${p.caption}: MHI ${p.label}${p.current ? ` (${tx('dibuka', 'open')})` : ''}`}
            className="cursor-pointer outline-none focus-visible:[&>circle]:stroke-navy-900"
            key={p.id}
            onClick={() => onOpenWave(p.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpenWave(p.id))}
            role="button"
            tabIndex={0}
          >
            {p.current && <circle cx={p.x} cy={p.y} fill="none" r="10" stroke="#142B51" strokeWidth="2" />}
            <circle cx={p.x} cy={p.y} fill={LEVEL_HEX[p.level] ?? '#98A2B3'} r={p.current ? 6.5 : 5} stroke="#fff" strokeWidth="2" />
            <text fill="#142B51" fontSize="13" fontWeight="700" textAnchor="middle" x={p.x} y={p.y - 13}>
              {p.label}
            </text>
            <text fill={p.current ? '#142B51' : '#667085'} fontSize="11" fontWeight={p.current ? 700 : 400} textAnchor="middle" x={p.x} y={CHART.H - 8}>
              {p.caption}
            </text>
          </g>
        ))}
      </svg>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] border-collapse text-left text-xs">
          <caption className="sr-only">{tx('Semua pemeriksaan peserta ini', 'All check-ups of this participant')}</caption>
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              {['T', tx('Tanggal', 'Date'), 'MHI', 'DI', 'WI', 'BHI', 'Level', 'Δ MHI'].map((h) => (
                <th className="px-2 py-1.5 font-semibold" key={h} scope="col">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.waves.map((w) => (
              <tr className={`border-b border-slate-100 ${w.id === data.current ? 'bg-navy-50 font-semibold' : ''}`} key={w.id}>
                <td className="px-2 py-1.5">
                  {w.id === data.current ? (
                    <span aria-current="true">T{w.waveNo}</span>
                  ) : (
                    <button
                      aria-label={`${tx('Buka pemeriksaan', 'Open check-up')} T${w.waveNo}`}
                      className="min-h-8 min-w-8 cursor-pointer rounded-md font-semibold text-navy-800 underline hover:bg-slate-100"
                      onClick={() => onOpenWave(w.id)}
                      type="button"
                    >
                      T{w.waveNo}
                    </button>
                  )}
                </td>
                <td className="whitespace-nowrap px-2 py-1.5">{w.date}</td>
                <td className="px-2 py-1.5">{fmt1(w.mhi)}</td>
                <td className="px-2 py-1.5">{fmt1(w.di)}</td>
                <td className="px-2 py-1.5">{fmt1(w.wi)}</td>
                <td className="px-2 py-1.5">{fmt1(w.bhi)}</td>
                <td className="px-2 py-1.5"><LevelBadge level={w.level} /></td>
                <td className={`px-2 py-1.5 ${deltaTone(w.deltaMhi)}`}>{signed1(w.deltaMhi)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
