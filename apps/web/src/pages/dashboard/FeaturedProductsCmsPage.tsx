import { useCallback, useEffect, useState } from 'react'
import {
  FEATURED_CARD_ICONS,
  FEATURED_CARD_THEMES,
  type FeaturedCardIcon,
  type FeaturedCardTheme,
  type FeaturedProductAdminDto,
  type FeaturedProductState,
} from '@attentiveid/shared'
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  AdminToolsApiError,
  deleteAdminFeaturedProduct,
  reorderAdminFeaturedProducts,
  listAdminFeaturedProducts,
  saveAdminFeaturedProduct,
} from '../../features/admin-tools/service'
import {
  CARD_ICONS,
  CARD_ICON_LABELS,
  CARD_THEME_LABELS,
  CARD_THEME_STYLES,
} from '../../features/featured/card-style'
import { moveToPosition } from '../../features/psychologists/featured-order'

interface FormState {
  id?: string
  titleId: string
  titleEn: string
  descriptionId: string
  descriptionEn: string
  theme: FeaturedCardTheme
  icon: FeaturedCardIcon
  badgeId: string
  badgeEn: string
  ctaId: string
  ctaEn: string
  url: string
  /** datetime-local values (browser local time); empty = open-ended */
  startAt: string
  endAt: string
  enabled: boolean
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
  theme: 'blue',
  icon: 'sparkles',
  badgeId: '',
  badgeEn: '',
  ctaId: '',
  ctaEn: '',
  url: '',
  startAt: '',
  endAt: '',
  enabled: true,
  slug: '',
})

const toForm = (product: FeaturedProductAdminDto): FormState => ({
  id: product.id,
  titleId: product.title.id,
  titleEn: product.title.en,
  descriptionId: product.description.id,
  descriptionEn: product.description.en,
  theme: product.theme,
  icon: product.icon,
  badgeId: product.badge.id,
  badgeEn: product.badge.en,
  ctaId: product.cta.id,
  ctaEn: product.cta.en,
  url: product.url ?? '',
  startAt: toLocalInput(product.startAt),
  endAt: toLocalInput(product.endAt),
  enabled: product.enabled,
  slug: product.slug,
})

const STATE_BADGE: Record<FeaturedProductState, { text: string; style: string }> = {
  active: { text: 'Tampil sekarang', style: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  scheduled: { text: 'Terjadwal', style: 'border-navy-200 bg-navy-50 text-navy-900' },
  ended: { text: 'Masa berakhir', style: 'border-slate-200 bg-slate-100 text-slate-600' },
  disabled: { text: 'Nonaktif', style: 'border-amber-200 bg-amber-50 text-amber-800' },
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : null

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100'

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
        theme: form.theme,
        icon: form.icon,
        badgeId: form.badgeId,
        badgeEn: form.badgeEn,
        ctaId: form.ctaId,
        ctaEn: form.ctaEn,
        url: form.url,
        startAt: fromLocalInput(form.startAt),
        endAt: fromLocalInput(form.endAt),
        enabled: form.enabled,
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

  const [isReordering, setIsReordering] = useState(false)

  const applyOrder = async (ids: string[]) => {
    const previous = products
    setProducts(ids.map((id) => previous.find((product) => product.id === id)!).filter(Boolean))
    setIsReordering(true)
    setError(null)
    try {
      setProducts(await reorderAdminFeaturedProducts(ids))
      setNotice('Urutan tersimpan.')
    } catch (caught) {
      setProducts(previous)
      setError(caught instanceof Error ? caught.message : 'Gagal menyimpan urutan.')
    } finally {
      setIsReordering(false)
    }
  }

  const moveCard = (product: FeaturedProductAdminDto, position: number) => {
    const ids = products.map((item) => item.id)
    const next = moveToPosition(ids, product.id, position)
    if (next.join() !== ids.join()) void applyOrder(next)
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
            Semua kartu di bagian "Featured Campaigns & Portals" pada beranda diatur di sini: urutan (kartu #1 tampil paling kiri), tema (termasuk kartu emas), ikon, label, teks tombol, tautan, dan masa featured. Masa tampil hanya terlihat di sini, tidak di halaman pengunjung.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-navy-800 cursor-pointer"
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
                  <th className="px-4 py-3">Urutan</th>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Halaman</th>
                  <th className="px-4 py-3">Masa featured</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product, index) => {
                  const badge = STATE_BADGE[product.state]
                  const start = formatDate(product.startAt)
                  const end = formatDate(product.endAt)
                  return (
                    <tr className="hover:bg-slate-50/50" key={product.id}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <select
                            aria-label={`Posisi ${product.title.id}`}
                            className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-gold-500"
                            disabled={isReordering}
                            onChange={(e) => moveCard(product, Number(e.target.value))}
                            value={index + 1}
                          >
                            {products.map((_, position) => (
                              <option key={position} value={position + 1}>
                                #{position + 1}
                              </option>
                            ))}
                          </select>
                          <button
                            aria-label={`Naikkan ${product.title.id}`}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                            disabled={isReordering || index === 0}
                            onClick={() => moveCard(product, index)}
                            type="button"
                          >
                            <ArrowUp className="size-3.5" aria-hidden="true" />
                          </button>
                          <button
                            aria-label={`Turunkan ${product.title.id}`}
                            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                            disabled={isReordering || index === products.length - 1}
                            onClick={() => moveCard(product, index + 2)}
                            type="button"
                          >
                            <ArrowDown className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`grid size-7 place-items-center rounded-lg ${CARD_THEME_STYLES[product.theme].iconBox}`}>
                            {(() => {
                              const Icon = CARD_ICONS[product.icon]
                              return <Icon size={15} strokeWidth={2.2} />
                            })()}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">{product.title.id}</div>
                            <div className="text-[11px] text-slate-500">
                              {product.badge.id || 'Tanpa label'}
                            </div>
                          </div>
                        </div>
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
              <div className="sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Tema kartu</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {FEATURED_CARD_THEMES.map((theme) => (
                    <button
                      aria-pressed={form.theme === theme}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium cursor-pointer ${
                        form.theme === theme ? 'border-navy-700 bg-navy-50 text-navy-800 ring-2 ring-gold-300' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                      key={theme}
                      onClick={() => update({ theme })}
                      type="button"
                    >
                      <span className={`size-4 rounded-full ${CARD_THEME_STYLES[theme].badge}`} aria-hidden="true" />
                      {CARD_THEME_LABELS[theme]}
                    </button>
                  ))}
                </div>
                {fieldErrors.theme && <span className="text-xs text-rose-700">{fieldErrors.theme}</span>}
              </div>
              <div className="sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Ikon kartu</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {FEATURED_CARD_ICONS.map((icon) => {
                    const Icon = CARD_ICONS[icon]
                    return (
                      <button
                        aria-label={`Ikon ${CARD_ICON_LABELS[icon]}`}
                        aria-pressed={form.icon === icon}
                        className={`grid size-11 place-items-center rounded-xl border cursor-pointer ${
                          form.icon === icon ? 'border-navy-700 bg-navy-50 text-navy-800 ring-2 ring-gold-300' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        key={icon}
                        onClick={() => update({ icon })}
                        title={CARD_ICON_LABELS[icon]}
                        type="button"
                      >
                        <Icon size={20} strokeWidth={2.2} />
                      </button>
                    )
                  })}
                </div>
              </div>
              <label className="text-sm font-medium text-slate-700">
                Label kartu (Indonesia)
                <input className={inputClass} maxLength={30} onChange={(e) => update({ badgeId: e.target.value })} placeholder="Produk Baru" value={form.badgeId} />
                {fieldErrors.badgeId && <span className="text-xs text-rose-700">{fieldErrors.badgeId}</span>}
              </label>
              <label className="text-sm font-medium text-slate-700">
                Label kartu (English)
                <input className={inputClass} maxLength={30} onChange={(e) => update({ badgeEn: e.target.value })} placeholder="New Product" value={form.badgeEn} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Teks tombol (Indonesia)
                <input className={inputClass} maxLength={40} onChange={(e) => update({ ctaId: e.target.value })} placeholder="Buka" value={form.ctaId} />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Teks tombol (English)
                <input className={inputClass} maxLength={40} onChange={(e) => update({ ctaEn: e.target.value })} placeholder="Open" value={form.ctaEn} />
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
              <label className="flex items-center gap-2 pt-6 text-sm font-medium text-slate-700">
                <input checked={form.enabled} onChange={(e) => update({ enabled: e.target.checked })} type="checkbox" />
                Aktif (bisa dimatikan tanpa menghapus)
              </label>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700">Pratinjau kartu (Indonesia)</span>
              {(() => {
                const style = CARD_THEME_STYLES[form.theme]
                const Icon = CARD_ICONS[form.icon]
                return (
                  <div className={`mt-1.5 max-w-xs rounded-xl border p-5 shadow-xs ${style.card}`}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${style.badge}`}>
                        {form.badgeId || 'Produk Baru'}
                      </span>
                      <div className={`grid size-9 place-items-center rounded-lg ${style.iconBox}`}>
                        <Icon size={18} strokeWidth={2.2} />
                      </div>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-secondary">{form.titleId || 'Nama produk'}</h3>
                    {form.descriptionId && <p className="mt-1.5 text-xs leading-relaxed text-secondary/80">{form.descriptionId}</p>}
                    <div className={`mt-5 border-t pt-3 text-xs font-semibold ${style.footer}`}>
                      {form.ctaId || (form.url ? 'Buka' : 'Segera Hadir')}
                    </div>
                  </div>
                )
              })()}
            </div>
            <p className="text-xs text-slate-500">Kosongkan tanggal untuk tampil tanpa batas waktu. Waktu mengikuti zona waktu browser Anda.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer" onClick={() => setForm(null)} type="button">
                Batal
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 cursor-pointer" disabled={isSaving} type="submit">
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
