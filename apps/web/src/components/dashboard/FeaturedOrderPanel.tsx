import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Loader2, RotateCcw, Save, Star } from 'lucide-react'
import {
  listAdminPsychologists,
  reorderFeaturedPsychologists,
  type AdminPsychologistItem,
} from '../../features/psychologists/psychologist-cms'
import { isSameOrder, moveToPosition } from '../../features/psychologists/featured-order'
import { useAuth } from '../../features/auth/auth-context'

export type DirectoryViewMode = 'row' | 'grid'

const photoOf = (item: AdminPsychologistItem) =>
  item.media?.reference
    ? item.media.reference.startsWith('/')
      ? item.media.reference
      : `/${item.media.reference}`
    : '/media/psychologists/default.webp'

const PAGE_SIZE = 100

async function loadAllFeatured(headers: Record<string, string>) {
  const featured: AdminPsychologistItem[] = []
  let offset = 0
  for (;;) {
    const page = await listAdminPsychologists({ limit: PAGE_SIZE, offset, headers })
    const batch = page.psychologists ?? []
    featured.push(...batch.filter((item) => item.featured))
    offset += batch.length
    if (batch.length === 0 || offset >= (page.total ?? 0)) break
  }
  return featured.sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0))
}

interface FeaturedOrderPanelProps {
  viewMode: DirectoryViewMode
  /** Changes whenever the directory is reloaded, so the panel refreshes too. */
  refreshKey: number
  onSaved: () => void
}

export function FeaturedOrderPanel({ viewMode, refreshKey, onSaved }: FeaturedOrderPanelProps) {
  const { getAuthHeaders } = useAuth()
  const [items, setItems] = useState<AdminPsychologistItem[]>([])
  const [order, setOrder] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const featured = await loadAllFeatured(getAuthHeaders())
      setItems(featured)
      const ids = featured.map((item) => item.id)
      setOrder(ids)
      setSaved(ids)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar Featured.')
    } finally {
      setIsLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])
  const isDirty = !isSameOrder(order, saved)

  const move = (id: string, position: number) => {
    setNotice(null)
    setOrder((current) => moveToPosition(current, id, position))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setNotice(null)
    try {
      await reorderFeaturedPsychologists(order, { headers: getAuthHeaders() })
      setSaved(order)
      setNotice('Urutan Featured tersimpan.')
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan urutan Featured.')
    } finally {
      setIsSaving(false)
    }
  }

  const rankOptions = order.map((_, index) => index + 1)

  const controls = (id: string, index: number, horizontal: boolean) => {
    const name = byId.get(id)?.nickname ?? ''
    const Back = horizontal ? ArrowLeft : ArrowUp
    const Forward = horizontal ? ArrowRight : ArrowDown
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => move(id, index)}
          disabled={index === 0}
          aria-label={`Naikkan ${name}`}
          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Back className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => move(id, index + 2)}
          disabled={index === order.length - 1}
          aria-label={`Turunkan ${name}`}
          className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Forward className="size-3.5" aria-hidden="true" />
        </button>
        <select
          value={index + 1}
          onChange={(event) => move(id, Number(event.target.value))}
          aria-label={`Posisi ${name}`}
          className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          {rankOptions.map((rank) => (
            <option key={rank} value={rank}>
              #{rank}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <section
      aria-labelledby="featured-order-title"
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="featured-order-title" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Star className="size-4 text-amber-500" aria-hidden="true" />
            Urutan Featured
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Urutan kartu di carousel Featured pada halaman utama. Pindahkan, lalu simpan; nomor lain bergeser otomatis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOrder(saved)
              setNotice(null)
            }}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" /> Batalkan
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-3.5" aria-hidden="true" />
            )}
            Simpan urutan
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {notice}
        </div>
      )}

      {isLoading ? (
        <p className="py-6 text-center text-xs text-slate-500">Memuat daftar Featured...</p>
      ) : order.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500">
          Belum ada psikolog Featured. Aktifkan lewat tab "Layanan &amp; Tag" pada profil psikolog.
        </p>
      ) : viewMode === 'grid' ? (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {order.map((id, index) => {
            const item = byId.get(id)
            if (!item) return null
            return (
              <li key={id} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-center">
                <div className="relative">
                  <img
                    src={photoOf(item)}
                    alt=""
                    className="size-16 rounded-full border border-slate-200 bg-slate-100 object-cover"
                  />
                  <span className="absolute -left-1 -top-1 flex size-6 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-slate-900">{item.nickname}</div>
                  <div className="truncate text-[10px] text-slate-500">{item.status}</div>
                </div>
                {controls(id, index, true)}
              </li>
            )
          })}
        </ol>
      ) : (
        <ol className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {order.map((id, index) => {
            const item = byId.get(id)
            if (!item) return null
            return (
              <li key={id} className="flex items-center gap-3 px-3 py-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                  {index + 1}
                </span>
                <img
                  src={photoOf(item)}
                  alt=""
                  className="size-9 shrink-0 rounded-full border border-slate-200 bg-slate-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-slate-900">{item.name}</div>
                  <div className="text-[10px] text-slate-500">{item.status}</div>
                </div>
                {controls(id, index, false)}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
