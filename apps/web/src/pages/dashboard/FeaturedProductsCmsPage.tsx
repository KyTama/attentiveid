import { useCallback, useEffect, useState } from 'react'
import type { FeaturedProductAdminDto, FeaturedProductState } from '@attentiveid/shared'
import { Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  AdminToolsApiError,
  deleteAdminFeaturedProduct,
  listAdminFeaturedProducts,
  saveAdminFeaturedProduct,
} from '../../features/admin-tools/service'

interface FormState {
  id?: string
  titleId: string
  titleEn: string
  descriptionId: string
  descriptionEn: string
  url: string
  /** datetime-local values (browser local time); empty = open-ended */
  startAt: string
  endAt: string
  enabled: boolean
  sortOrder: string
  slug: string
}

const toLocalInput = (iso: string | null) => {
  if (!iso) return ''
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null)

const emptyForm = (): FormState => ({
  titleId: '',
  titleEn: '',
  descriptionId: '',
  descriptionEn: '',
  url: '',
  startAt: '',
  endAt: '',
  enabled: true,
  sortOrder: '0',
  slug: '',
})

const toForm = (product: FeaturedProductAdminDto): FormState => ({
  id: product.id,
  titleId: product.title.id,
  titleEn: product.title.en,
  descriptionId: product.description.id,
  descriptionEn: product.description.en,
  url: product.url ?? '',
  startAt: toLocalInput(product.startAt),
  endAt: toLocalInput(product.endAt),
  enabled: product.enabled,
  sortOrder: String(product.sortOrder),
  slug: product.slug,
})

const STATE_BADGE: Record<FeaturedProductState, { text: string; style: string }> = {
  active: { text: 'Tampil sekarang', style: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  scheduled: { text: 'Terjadwal', style: 'border-sky-200 bg-sky-50 text-sky-800' },
  ended: { text: 'Masa berakhir', style: 'border-slate-200 bg-slate-100 text-slate-600' },
  disabled: { text: 'Nonaktif', style: 'border-amber-200 bg-amber-50 text-amber-800' },
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : null

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100'

export function FeaturedProductsCmsPage() {
  const [products, setProducts] = useState<FeaturedProductAdminDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setProducts(await listAdminFeaturedProducts())
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal memuat produk.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const update = (patch: Partial<FormState>) => setForm((current) => (current ? { ...current, ...patch } : current))

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form) return
    setIsSaving(true)
    setFieldErrors({})
    setError(null)
    try {
      await saveAdminFeaturedProduct(form.id, {
        slug: form.slug || undefined,
        titleId: form.titleId,
        titleEn: form.titleEn,
        descriptionId: form.descriptionId,
        descriptionEn: form.descriptionEn,
        url: form.url,
        startAt: fromLocalInput(form.startAt),
        endAt: fromLocalInput(form.endAt),
        enabled: form.enabled,
        sortOrder: Number(form.sortOrder),
      })
      setForm(null)
      setNotice('Produk tersimpan.')
      await load()
    } catch (caught) {
      if (caught instanceof AdminToolsApiError) setFieldErrors(caught.fieldErrors)
      setError(caught instanceof Error ? caught.message : 'Gagal menyimpan.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (product: FeaturedProductAdminDto) => {
    if (!window.confirm(`Hapus "${product.title.id}" dari daftar produk featured?`)) return
    try {
      await deleteAdminFeaturedProduct(product.id)
      setNotice('Produk dihapus.')
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal menghapus.')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
            Produk Featured
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Produk yang tampil di menu "Unggulan" pada website selama masa featured-nya. Masa tampil hanya terlihat di sini, tidak di halaman pengunjung.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700 cursor-pointer"
          onClick={() => {
            setFieldErrors({})
            setForm(emptyForm())
          }}
          type="button"
        >
          <Plus className="size-4" aria-hidden="true" />
          Produk Baru
        </button>
      </div>

      {error && !form && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {notice}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {isLoading ? (
          <p className="p-10 text-center text-sm text-slate-500">Memuat produk...</p>
        ) : products.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">Belum ada produk featured.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Halaman</th>
                  <th className="px-4 py-3">Masa featured</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const badge = STATE_BADGE[product.state]
                  const start = formatDate(product.startAt)
                  const end = formatDate(product.endAt)
                  return (
                    <tr className="hover:bg-slate-50/50" key={product.id}>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{product.title.id}</div>
                        <div className="text-[11px] text-slate-500">urutan {product.sortOrder}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {product.url ?? <span className="text-amber-700">Belum ada (tampil "Segera Hadir")</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {start || end ? `${start ?? 'Sejak awal'} → ${end ?? 'Tanpa batas'}` : 'Tanpa batas waktu'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.style}`}>{badge.text}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            aria-label={`Ubah ${product.title.id}`}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                            onClick={() => {
                              setFieldErrors({})
                              setForm(toForm(product))
                            }}
                            type="button"
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </button>
                          <button
                            aria-label={`Hapus ${product.title.id}`}
                            className="rounded-lg border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            onClick={() => handleDelete(product)}
                            type="button"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-label="Form produk featured">
          <form className="my-8 w-full max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSave}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{form.id ? 'Ubah produk' : 'Produk baru'}</h2>
              <button aria-label="Tutup" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer" onClick={() => setForm(null)} type="button">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                {error}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Nama (Indonesia)
                <input className={inputClass} onChange={(e) => update({ titleId: e.target.value })} required value={form.titleId} />
                {fieldErrors.titleId && <span className="text-xs text-rose-700">{fieldErrors.titleId}</span>}
              </label>
              <label className="text-sm font-medium text-slate-700">
                Nama (English)
                <input className={inputClass} onChange={(e) => update({ titleEn: e.target.value })} value={form.titleEn} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Deskripsi singkat (Indonesia)
                <input className={inputClass} onChange={(e) => update({ descriptionId: e.target.value })} value={form.descriptionId} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Deskripsi singkat (English)
                <input className={inputClass} onChange={(e) => update({ descriptionEn: e.target.value })} value={form.descriptionEn} />
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Halaman tujuan
                <input
                  className={inputClass}
                  onChange={(e) => update({ url: e.target.value })}
                  placeholder="/let-there-be-light  — kosongkan jika belum siap (tampil Segera Hadir)"
                  value={form.url}
                />
                {fieldErrors.url && <span className="text-xs text-rose-700">{fieldErrors.url}</span>}
              </label>
              <label className="text-sm font-medium text-slate-700">
                Mulai featured
                <input className={inputClass} onChange={(e) => update({ startAt: e.target.value })} type="datetime-local" value={form.startAt} />
                {fieldErrors.startAt && <span className="text-xs text-rose-700">{fieldErrors.startAt}</span>}
              </label>
              <label className="text-sm font-medium text-slate-700">
                Selesai featured
                <input className={inputClass} onChange={(e) => update({ endAt: e.target.value })} type="datetime-local" value={form.endAt} />
                {fieldErrors.endAt && <span className="text-xs text-rose-700">{fieldErrors.endAt}</span>}
              </label>
              <label className="text-sm font-medium text-slate-700">
                Urutan di menu
                <input className={inputClass} min={0} onChange={(e) => update({ sortOrder: e.target.value })} type="number" value={form.sortOrder} />
              </label>
              <label className="flex items-center gap-2 pt-6 text-sm font-medium text-slate-700">
                <input checked={form.enabled} onChange={(e) => update({ enabled: e.target.checked })} type="checkbox" />
                Aktif (bisa dimatikan tanpa menghapus)
              </label>
            </div>
            <p className="text-xs text-slate-500">Kosongkan tanggal untuk tampil tanpa batas waktu. Waktu mengikuti zona waktu browser Anda.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer" onClick={() => setForm(null)} type="button">
                Batal
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60 cursor-pointer" disabled={isSaving} type="submit">
                {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
