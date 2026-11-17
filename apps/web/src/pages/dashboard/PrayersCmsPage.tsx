import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff, Loader2, RefreshCw, Search, Trash2 } from 'lucide-react'
import type { PrayerAdminDto } from '@attentiveid/shared'
import { deleteAdminPrayer, listAdminPrayers, setPrayerHidden } from '../../features/admin-tools/service'
import { useTx } from '@/features/i18n/use-tx'

type Filter = 'all' | 'visible' | 'hidden'

/** Prayers visitors wrote on the Let There Be Light page. A visible one can show up inside the gift; hide or delete the ones that should not. */
export function PrayersCmsPage() {
  const { tx, isEn } = useTx()
  const [prayers, setPrayers] = useState<PrayerAdminDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      setPrayers(await listAdminPrayers())
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal memuat doa.', 'Failed to load the prayers.'))
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    return prayers.filter((item) => {
      if (filter === 'visible' && item.hidden) return false
      if (filter === 'hidden' && !item.hidden) return false
      return !term || item.prayer.toLowerCase().includes(term)
    })
  }, [prayers, search, filter])

  const toggle = async (item: PrayerAdminDto) => {
    setBusyId(item.id)
    setError(null)
    try {
      await setPrayerHidden(item.id, !item.hidden)
      setPrayers((current) => current.map((entry) => (entry.id === item.id ? { ...entry, hidden: !entry.hidden } : entry)))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal mengubah doa.', 'Failed to change the prayer.'))
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (item: PrayerAdminDto) => {
    if (!window.confirm(tx('Hapus doa ini selamanya?', 'Delete this prayer for good?'))) return
    setBusyId(item.id)
    setError(null)
    try {
      await deleteAdminPrayer(item.id)
      setPrayers((current) => current.filter((entry) => entry.id !== item.id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menghapus doa.', 'Failed to delete the prayer.'))
    } finally {
      setBusyId(null)
    }
  }

  const hiddenCount = prayers.filter((item) => item.hidden).length

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
            {tx('Doa Pengunjung', 'Visitor prayers')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {tx(
              'Doa yang ditulis pengunjung di halaman Let There Be Light. Doa yang tampil (tidak disembunyikan) bisa muncul acak di dalam hadiah. Sembunyikan atau hapus doa yang tidak pantas. Pilihan "langsung tampil" atau "setujui dulu" ada di Pengaturan Situs > Hadiah.',
              'Prayers written by visitors on the Let There Be Light page. A visible (not hidden) prayer can show up at random inside the gift. Hide or delete the ones that are not suitable. Whether new prayers show at once or wait for approval is set in Pengaturan Situs > Gift.',
            )}
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

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">{tx('Cari doa', 'Search prayers')}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tx('Cari doa...', 'Search prayers...')}
            type="search"
            value={search}
          />
        </label>
        <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold" role="group" aria-label={tx('Saring', 'Filter')}>
          {(
            [
              ['all', tx('Semua', 'All')],
              ['visible', tx('Tampil', 'Visible')],
              ['hidden', `${tx('Disembunyikan', 'Hidden')} (${hiddenCount})`],
            ] as const
          ).map(([key, label]) => (
            <button
              aria-pressed={filter === key}
              className={`cursor-pointer px-3 py-1.5 ${filter === key ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              key={key}
              onClick={() => setFilter(key)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">{tx(`${visible.length} dari ${prayers.length} doa`, `${visible.length} of ${prayers.length} prayers`)}</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {visible.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">
            {isLoading ? tx('Memuat...', 'Loading...') : prayers.length === 0 ? tx('Belum ada doa dari pengunjung. Sementara itu hadiah memakai doa bawaan.', 'No visitor prayers yet. Until then the gift uses built-in prayers.') : tx('Tidak ada doa yang cocok.', 'No prayers match.')}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((item) => (
              <li className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start ${item.hidden ? 'bg-slate-50/70' : ''}`} key={item.id}>
                <div className="min-w-0 flex-1">
                  <p className={`whitespace-pre-line text-sm leading-relaxed ${item.hidden ? 'text-slate-500' : 'text-slate-900'}`}>{item.prayer}</p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {tx('Anonim', 'Anonymous')} ·{' '}
                    {new Date(item.createdAt).toLocaleString(isEn ? 'en-US' : 'id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    {item.hidden && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">{tx('Disembunyikan', 'Hidden')}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    disabled={busyId === item.id}
                    onClick={() => void toggle(item)}
                    type="button"
                  >
                    {busyId === item.id ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : item.hidden ? <Eye className="size-3.5" aria-hidden="true" /> : <EyeOff className="size-3.5" aria-hidden="true" />}
                    {item.hidden ? tx('Tampilkan', 'Show') : tx('Sembunyikan', 'Hide')}
                  </button>
                  <button
                    aria-label={tx('Hapus doa', 'Delete prayer')}
                    className="flex cursor-pointer items-center rounded-lg border border-rose-200 p-1.5 text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    disabled={busyId === item.id}
                    onClick={() => void remove(item)}
                    type="button"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
