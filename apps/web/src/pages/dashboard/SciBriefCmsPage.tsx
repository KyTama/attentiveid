import { useCallback, useEffect, useRef, useState } from 'react'
import {
  SCI_BRIEF_DEFAULT_PREVIEW_PAGES,
  SCI_BRIEF_MAX_PDF_BYTES,
  formatSciBriefMonth,
  isSciBriefPublic,
  slugifySciBrief,
  type SciBriefAdminDto,
  type SciBriefField,
} from '@attentiveid/shared'
import { Download, FileText, Loader2, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import {
  SciBriefApiError,
  deleteAdminSciBrief,
  downloadAdminSciBriefDocument,
  listAdminSciBriefs,
  saveAdminSciBrief,
  uploadAdminSciBriefDocument,
} from '../../features/sci-brief/service'

interface FormState {
  id?: string
  titleId: string
  titleEn: string
  summaryId: string
  summaryEn: string
  periodMonth: string
  /** datetime-local value (browser local time). */
  releaseAt: string
  status: 'draft' | 'published'
  previewPages: string
  slug: string
  slugTouched: boolean
  documentName: string | null
  totalPages: number | null
}

const toLocalInput = (iso: string) => {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const currentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const emptyForm = (): FormState => ({
  titleId: '',
  titleEn: '',
  summaryId: '',
  summaryEn: '',
  periodMonth: currentMonth(),
  releaseAt: toLocalInput(new Date().toISOString()),
  status: 'draft',
  previewPages: String(SCI_BRIEF_DEFAULT_PREVIEW_PAGES),
  slug: '',
  slugTouched: false,
  documentName: null,
  totalPages: null,
})

const fromBrief = (brief: SciBriefAdminDto): FormState => ({
  id: brief.id,
  titleId: brief.title.id,
  titleEn: brief.title.en,
  summaryId: brief.summary.id,
  summaryEn: brief.summary.en,
  periodMonth: brief.periodMonth,
  releaseAt: toLocalInput(brief.releaseAt),
  status: brief.status,
  previewPages: String(brief.previewPages),
  slug: brief.slug,
  slugTouched: true,
  documentName: brief.documentName,
  totalPages: brief.totalPages,
})

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20'

function statusLabel(brief: SciBriefAdminDto) {
  if (brief.status === 'draft') return { text: 'Draft', style: 'bg-amber-50 text-amber-800 border-amber-200/60' }
  if (isSciBriefPublic(brief)) return { text: 'Tayang', style: 'bg-emerald-50 text-emerald-800 border-emerald-200/60' }
  return { text: 'Terjadwal', style: 'bg-sky-50 text-sky-800 border-sky-200/60' }
}

export function SciBriefCmsPage() {
  const [briefs, setBriefs] = useState<SciBriefAdminDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SciBriefField, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setBriefs(await listAdminSciBriefs())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat Sci-Brief.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openForm = (next: FormState) => {
    setForm(next)
    setFieldErrors({})
    setFormError(null)
    setPendingFile(null)
  }

  const update = (patch: Partial<FormState>) => setForm((current) => (current ? { ...current, ...patch } : current))

  const chooseFile = (file: File | undefined) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setFormError('Dokumen harus berupa file PDF.')
      return
    }
    if (file.size > SCI_BRIEF_MAX_PDF_BYTES) {
      setFormError(`Ukuran PDF melebihi batas ${SCI_BRIEF_MAX_PDF_BYTES / (1024 * 1024)} MB.`)
      return
    }
    setFormError(null)
    setPendingFile(file)
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form) return
    setIsSaving(true)
    setFormError(null)
    setFieldErrors({})
    try {
      const saved = await saveAdminSciBrief(form.id, {
        slug: form.slug.trim() || undefined,
        titleId: form.titleId,
        titleEn: form.titleEn,
        summaryId: form.summaryId,
        summaryEn: form.summaryEn,
        periodMonth: form.periodMonth,
        releaseAt: new Date(form.releaseAt).toISOString(),
        status: form.status,
        previewPages: Number(form.previewPages),
      })
      if (pendingFile) {
        await uploadAdminSciBriefDocument(saved.id, pendingFile)
      }
      setForm(null)
      setNotice(pendingFile ? 'Sci-Brief dan dokumen tersimpan.' : 'Sci-Brief tersimpan.')
      await load()
    } catch (err) {
      if (err instanceof SciBriefApiError) {
        setFieldErrors(err.fieldErrors)
        setFormError(err.message)
      } else {
        setFormError(err instanceof Error ? err.message : 'Gagal menyimpan.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (brief: SciBriefAdminDto) => {
    if (!window.confirm(`Hapus Sci-Brief "${brief.title.id}"? Dokumen ikut terhapus dan tidak bisa dikembalikan.`)) return
    try {
      await deleteAdminSciBrief(brief.id)
      setNotice('Sci-Brief dihapus.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus.')
    }
  }

  const handleDownload = async (brief: SciBriefAdminDto) => {
    try {
      await downloadAdminSciBriefDocument(brief.id, brief.documentName ?? `${brief.slug}.pdf`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunduh.')
    }
  }

  const error_ = (field: SciBriefField) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-xs text-rose-700" role="alert">
        {fieldErrors[field]}
      </p>
    ) : null

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
            Sci-Brief
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ringkasan riset bulanan. Atur tanggal rilis agar bisa disiapkan lebih dulu sebagai draft.
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700 cursor-pointer"
          onClick={() => openForm(emptyForm())}
          type="button"
        >
          <Plus className="size-4" aria-hidden="true" />
          Sci-Brief Baru
        </button>
      </div>

      {error && (
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
          <p className="p-10 text-center text-sm text-slate-500">Memuat Sci-Brief...</p>
        ) : briefs.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">Belum ada Sci-Brief. Klik "Sci-Brief Baru" untuk membuat yang pertama.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Bulan</th>
                  <th className="px-4 py-3">Rilis</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dokumen</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {briefs.map((brief) => {
                  const status = statusLabel(brief)
                  return (
                    <tr className="hover:bg-slate-50/50" key={brief.id}>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{brief.title.id}</div>
                        <div className="text-[11px] text-slate-500">/{brief.slug}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{formatSciBriefMonth(brief.periodMonth, 'id')}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">
                        {new Date(brief.releaseAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${status.style}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {brief.hasDocument ? (
                          <span className="inline-flex items-center gap-1">
                            <FileText className="size-3.5 text-slate-400" aria-hidden="true" />
                            {brief.totalPages} hlm · pratinjau {brief.previewPages}
                          </span>
                        ) : (
                          <span className="text-amber-700">Belum ada PDF</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {brief.hasDocument && (
                            <button
                              aria-label={`Unduh dokumen ${brief.title.id}`}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer"
                              onClick={() => handleDownload(brief)}
                              type="button"
                            >
                              <Download className="size-3.5" aria-hidden="true" />
                            </button>
                          )}
                          <button
                            aria-label={`Edit ${brief.title.id}`}
                            className="rounded-lg bg-sky-50 p-1.5 text-sky-700 hover:bg-sky-100 cursor-pointer"
                            onClick={() => openForm(fromBrief(brief))}
                            type="button"
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                          </button>
                          <button
                            aria-label={`Hapus ${brief.title.id}`}
                            className="rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 cursor-pointer"
                            onClick={() => handleDelete(brief)}
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="sci-brief-form-title">
          <form className="w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl" onSubmit={handleSave}>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-slate-900" id="sci-brief-form-title">
                {form.id ? 'Edit Sci-Brief' : 'Sci-Brief Baru'}
              </h2>
              <button aria-label="Tutup" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer" onClick={() => setForm(null)} type="button">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">
                {formError}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-title-id">Judul (Bahasa Indonesia)</label>
                <input
                  className={fieldClass}
                  id="sb-title-id"
                  onChange={(event) =>
                    update({
                      titleId: event.target.value,
                      ...(form.slugTouched || form.titleEn ? {} : { slug: slugifySciBrief(event.target.value) }),
                    })
                  }
                  required
                  value={form.titleId}
                />
                {error_('titleId')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-title-en">Title (English)</label>
                <input
                  className={fieldClass}
                  id="sb-title-en"
                  onChange={(event) =>
                    update({
                      titleEn: event.target.value,
                      ...(form.slugTouched ? {} : { slug: slugifySciBrief(event.target.value || form.titleId) }),
                    })
                  }
                  placeholder="Kosong = sama dengan Indonesia"
                  value={form.titleEn}
                />
                {error_('titleEn')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-summary-id">Deskripsi singkat (Indonesia)</label>
                <textarea className={fieldClass} id="sb-summary-id" maxLength={600} onChange={(event) => update({ summaryId: event.target.value })} required rows={3} value={form.summaryId} />
                {error_('summaryId')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-summary-en">Short description (English)</label>
                <textarea className={fieldClass} id="sb-summary-en" maxLength={600} onChange={(event) => update({ summaryEn: event.target.value })} placeholder="Kosong = sama dengan Indonesia" rows={3} value={form.summaryEn} />
                {error_('summaryEn')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-month">Bulan brief</label>
                <input className={fieldClass} id="sb-month" onChange={(event) => update({ periodMonth: event.target.value })} required type="month" value={form.periodMonth} />
                {error_('periodMonth')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-release">Tanggal & jam rilis</label>
                <input className={fieldClass} id="sb-release" onChange={(event) => update({ releaseAt: event.target.value })} required type="datetime-local" value={form.releaseAt} />
                {error_('releaseAt')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-status">Status</label>
                <select className={fieldClass} id="sb-status" onChange={(event) => update({ status: event.target.value as FormState['status'] })} value={form.status}>
                  <option value="draft">Draft (tidak tampil)</option>
                  <option value="published">Published (tampil mulai tanggal rilis)</option>
                </select>
                {error_('status')}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-preview">Halaman yang tampil publik</label>
                <input className={fieldClass} id="sb-preview" max={10} min={1} onChange={(event) => update({ previewPages: event.target.value })} type="number" value={form.previewPages} />
                <p className="mt-1 text-[11px] text-slate-500">Halaman berikutnya diburamkan dan hanya dibuka lewat permintaan.</p>
                {error_('previewPages')}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sb-slug">Slug (alamat halaman)</label>
              <input
                className={`${fieldClass} font-mono`}
                id="sb-slug"
                onChange={(event) => update({ slug: event.target.value, slugTouched: true })}
                placeholder="otomatis dari judul"
                value={form.slug}
              />
              {error_('slug')}
            </div>

            <div className="rounded-xl border border-dashed border-slate-300 p-4">
              <div className="text-xs font-semibold text-slate-700">Dokumen (PDF)</div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Maks 15 MB. Hanya {form.previewPages || SCI_BRIEF_DEFAULT_PREVIEW_PAGES} halaman pertama yang dibuat untuk publik; file lengkap tetap privat.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="size-3.5" aria-hidden="true" />
                  {form.documentName || pendingFile ? 'Ganti PDF' : 'Pilih PDF'}
                </button>
                <input accept="application/pdf,.pdf" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} ref={fileInputRef} tabIndex={-1} type="file" />
                <span className="text-xs text-slate-600">
                  {pendingFile
                    ? `${pendingFile.name} (akan diunggah saat disimpan)`
                    : form.documentName
                      ? `${form.documentName} · ${form.totalPages} halaman`
                      : 'Belum ada dokumen'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer" onClick={() => setForm(null)} type="button">
                Batal
              </button>
              <button
                className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60 cursor-pointer"
                disabled={isSaving}
                type="submit"
              >
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
