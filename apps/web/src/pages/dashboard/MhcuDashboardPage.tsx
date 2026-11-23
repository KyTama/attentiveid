import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { useTx } from '@/features/i18n/use-tx'
import { listMhcu, listPsychologistOptions, type MhcuDetail, type MhcuListItem, type PsychologistOption } from '@/features/mhcu-dashboard/api'
import { DetailPanel } from '@/features/mhcu-dashboard/DetailPanel'
import { NO_FILTERS, filterItems, type MhcuFilters } from '@/features/mhcu-dashboard/helpers'
import { CohortTiles, SessionFilters, SessionTable } from '@/features/mhcu-dashboard/ListParts'

/**
 * Mental Health Check-Up dashboard for staff: the list with filters, and one result open beside it
 * (scores, psychologist, note, payment, report). Admins do everything; a psychologist sees their own clients and writes notes.
 */
export function MhcuDashboardPage() {
  const { tx } = useTx()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const { id: selectedId = null } = useParams()
  const navigate = useNavigate()
  const [items, setItems] = useState<MhcuListItem[]>([])
  const [psychologists, setPsychologists] = useState<PsychologistOption[]>([])
  const [filters, setFilters] = useState<MhcuFilters>(NO_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [list, people] = await Promise.all([listMhcu(), isAdmin ? listPsychologistOptions().catch(() => []) : Promise.resolve([])])
      setItems(list)
      setPsychologists(people)
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal memuat data.', 'Failed to load the data.'))
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(() => filterItems(items, filters), [items, filters])

  const changed = (row: MhcuDetail) =>
    setItems((current) => current.map((item) => (item.id === row.id ? { ...item, psychologistId: row.psychologistId, paymentStatus: row.paymentStatus, status: row.status, level: row.level } : item)))

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
            {tx('Dasbor MHCU', 'MHCU dashboard')}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            {tx(
              'Daftar hasil Mental Health Check-Up: tugaskan psikolog, tulis keterangan, konfirmasi pembayaran, lalu rilis laporan. Ini data kesehatan: buka hanya bila perlu dan jangan dibagikan.',
              'Mental Health Check-Up results: assign a psychologist, write the note, confirm payment, then release the report. This is health data: open it only when needed and do not share it.',
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link className="flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" to="/dashboard/assessments">
            {tx('Hasil asesmen', 'Assessment results')}
          </Link>
          <button
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            disabled={loading}
            onClick={() => void load()}
            type="button"
          >
            <RefreshCw aria-hidden="true" className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            {tx('Muat ulang', 'Refresh')}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}

      {/* On a phone the open result takes the whole screen; the summary and filters come back with "Daftar hasil". */}
      <div className={`space-y-5 ${selectedId ? 'hidden xl:block xl:space-y-5' : ''}`}>
        <CohortTiles items={items} onShowProof={() => setFilters({ ...NO_FILTERS, todo: 'proof' })} />
        <SessionFilters filters={filters} onChange={setFilters} psychologists={psychologists} shown={visible.length} />
      </div>

      <div className={`grid min-w-0 gap-5 ${selectedId ? 'xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]' : ''}`}>
        <div className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white ${selectedId ? 'hidden xl:block' : ''}`}>
          {loading ? (
            <p className="flex items-center gap-2 p-6 text-sm text-slate-500" role="status">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" /> {tx('Memuat...', 'Loading...')}
            </p>
          ) : (
            <SessionTable
              items={visible}
              onOpen={(id) => navigate(`/dashboard/assessments/mhcu/${id}`)}
              psychologists={psychologists}
              selectedId={selectedId}
            />
          )}
        </div>
        {selectedId && (
          <aside aria-label={tx('Detail hasil', 'Result detail')} className="min-w-0 rounded-2xl border border-slate-200 bg-white xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)] xl:self-start xl:overflow-y-auto">
            <DetailPanel
              id={selectedId}
              isAdmin={isAdmin}
              onChanged={changed}
              onClose={() => navigate('/dashboard/assessments/mhcu')}
              psychologists={psychologists}
            />
          </aside>
        )}
      </div>
    </div>
  )
}
