import { useCallback, useEffect, useState } from 'react'
import { useTx } from '@/features/i18n/use-tx'
import { DEFAULT_SHARE_IMAGE, normalizeSharePath, type SharePreviewDto } from '@attentiveid/shared'
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  AdminToolsApiError,
  deleteAdminSharePreview,
  listAdminSharePreviews,
  saveAdminSharePreview,
  uploadSharePreviewImage,
} from '../../features/admin-tools/service'

/** Pages offered in the list even before a custom preview exists. */
const SUGGESTED_PATHS = ['/', '/psychologists', '/articles', '/sci-brief', '/free-session', '/let-there-be-light', '/booking']

interface FormState {
  path: string
  pathLocked: boolean
  title: string
  description: string
  imageUrl: string
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100'

export function SharePreviewsCmsPage() {
  const { tx } = useTx()
  const [previews, setPreviews] = useState<SharePreviewDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const load = useCallback(async () => {
    try {
      setPreviews(await listAdminSharePreviews())
      setError(null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal memuat thumbnail.', 'Failed to load thumbnails.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const byPath = new Map(previews.map((preview) => [preview.path, preview]))
  const paths = [...new Set([...SUGGESTED_PATHS, ...previews.map((preview) => preview.path)])]

  const openFor = (path: string) => {
    const existing = byPath.get(path)
    setFieldErrors({})
    setError(null)
    setForm({
      path,
      pathLocked: true,
      title: existing?.title ?? '',
      description: existing?.description ?? '',
      imageUrl: existing?.imageUrl ?? '',
    })
  }

  const update = (patch: Partial<FormState>) => setForm((current) => (current ? { ...current, ...patch } : current))

  const handleUpload = async (file: File | undefined) => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      update({ imageUrl: await uploadSharePreviewImage(file) })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal mengunggah gambar.', 'Failed to upload the image.'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form) return
    setIsSaving(true)
    setFieldErrors({})
    setError(null)
    try {
      await saveAdminSharePreview({ path: form.path, title: form.title, description: form.description, imageUrl: form.imageUrl })
      setForm(null)
      setNotice(tx('Thumbnail tersimpan. Aplikasi chat dan media sosial bisa butuh waktu untuk memperbarui tampilan lama.', 'Thumbnail saved. Chat and social apps may take a while to refresh old previews.'))
      await load()
    } catch (caught) {
      if (caught instanceof AdminToolsApiError) setFieldErrors(caught.fieldErrors)
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async (preview: SharePreviewDto) => {
    if (!window.confirm(tx(`Kembalikan thumbnail ${preview.path} ke bawaan (logo Attentive)?`, `Reset the thumbnail of ${preview.path} to the default (Attentive logo)?`))) return
    try {
      await deleteAdminSharePreview(preview.id)
      setNotice(tx('Thumbnail dikembalikan ke bawaan.', 'Thumbnail reset to default.'))
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menghapus.', 'Failed to delete.'))
    }
  }

  const previewImage = form?.imageUrl || DEFAULT_SHARE_IMAGE

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
            {tx('Thumbnail Link', 'Link Thumbnails')}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {tx('Judul, deskripsi, dan gambar yang muncul saat link halaman dibagikan (WhatsApp, media sosial). Halaman tanpa pengaturan memakai logo Attentive.', 'Title, description and image shown when a page link is shared (WhatsApp, social media). Pages without a setting use the Attentive logo.')}
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-navy-800 cursor-pointer"
          onClick={() => {
            setFieldErrors({})
            setError(null)
            setForm({ path: '/', pathLocked: false, title: '', description: '', imageUrl: '' })
          }}
          type="button"
        >
          <Plus className="size-4" aria-hidden="true" />
          {tx('Halaman Lain', 'Other page')}
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
          <p className="p-10 text-center text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">{tx('Halaman', 'Page')}</th>
                  <th className="px-4 py-3">{tx('Gambar', 'Image')}</th>
                  <th className="px-4 py-3">{tx('Judul & deskripsi', 'Title & description')}</th>
                  <th className="px-4 py-3 text-right">{tx('Aksi', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paths.map((path) => {
                  const preview = byPath.get(path)
                  return (
                    <tr className="hover:bg-slate-50/50" key={path}>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">{path}</td>
                      <td className="px-4 py-3.5">
                        <img
                          alt=""
                          className="h-10 w-20 rounded-md border border-slate-200 object-cover"
                          height={40}
                          src={preview?.imageUrl || DEFAULT_SHARE_IMAGE}
                          width={80}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {preview ? (
                          <>
                            <div className="font-medium">{preview.title || <span className="text-slate-400">{tx('Judul bawaan', 'Default title')}</span>}</div>
                            <div className="text-slate-500">{preview.description}</div>
                          </>
                        ) : (
                          <span className="text-slate-400">{tx('Bawaan (logo Attentive)', 'Default (Attentive logo)')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            aria-label={tx(`Atur thumbnail ${path}`, `Set thumbnail ${path}`)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                            onClick={() => openFor(path)}
                            type="button"
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </button>
                          {preview && (
                            <button
                              aria-label={tx(`Kembalikan ${path} ke bawaan`, `Reset ${path} to default`)}
                              className="rounded-lg border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer"
                              onClick={() => handleReset(preview)}
                              type="button"
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                            </button>
                          )}
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
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-label={tx('Form thumbnail link', 'Link thumbnail form')}>
          <form className="my-8 w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSave}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{tx('Thumbnail', 'Thumbnail')} {form.pathLocked ? form.path : tx('halaman', 'page')}</h2>
              <button aria-label={tx('Tutup', 'Close')} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer" onClick={() => setForm(null)} type="button">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                {error}
              </div>
            )}
            {!form.pathLocked && (
              <label className="block text-sm font-medium text-slate-700">
                {tx('Alamat halaman', 'Page address')}
                <input
                  className={inputClass}
                  onBlur={(e) => update({ path: normalizeSharePath(e.target.value) ?? e.target.value })}
                  onChange={(e) => update({ path: e.target.value })}
                  placeholder="/free-session"
                  value={form.path}
                />
                {fieldErrors.path && <span className="text-xs text-rose-700">{fieldErrors.path}</span>}
              </label>
            )}
            <label className="block text-sm font-medium text-slate-700">
              {tx('Judul (maks 90)', 'Title (max 90)')}
              <input className={inputClass} maxLength={90} onChange={(e) => update({ title: e.target.value })} value={form.title} />
              {fieldErrors.title && <span className="text-xs text-rose-700">{fieldErrors.title}</span>}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {tx('Deskripsi (maks 200)', 'Description (max 200)')}
              <textarea className={inputClass} maxLength={200} onChange={(e) => update({ description: e.target.value })} rows={3} value={form.description} />
            </label>
            <div>
              <span className="text-sm font-medium text-slate-700">{tx('Gambar (JPG/PNG/WebP, maks 2 MB — disarankan 1200×630)', 'Image (JPG/PNG/WebP, max 2 MB — 1200×630 recommended)')}</span>
              <img alt={tx('Pratinjau thumbnail', 'Thumbnail preview')} className="mt-2 aspect-[1200/630] w-full rounded-xl border border-slate-200 object-cover" src={previewImage} />
              <div className="mt-2 flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {isUploading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="size-4" aria-hidden="true" />}
                  {tx('Unggah gambar', 'Upload image')}
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      e.target.value = ''
                      handleUpload(file)
                    }}
                    type="file"
                  />
                </label>
                {form.imageUrl && (
                  <button className="text-sm text-slate-500 underline cursor-pointer" onClick={() => update({ imageUrl: '' })} type="button">
                    {tx('Pakai gambar bawaan', 'Use default image')}
                  </button>
                )}
              </div>
              {fieldErrors.imageUrl && <span className="text-xs text-rose-700">{fieldErrors.imageUrl}</span>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer" onClick={() => setForm(null)} type="button">
                {tx('Batal', 'Cancel')}
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 cursor-pointer" disabled={isSaving || isUploading} type="submit">
                {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {tx('Simpan', 'Save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
