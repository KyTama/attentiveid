import { useCallback, useEffect, useRef, useState } from 'react'
import { useTx } from '@/features/i18n/use-tx'
import { QR_LOGO_SCALE_RANGE, QR_MAX_LOGO_BYTES, dataUrlBytes, type QrCodeDto } from '@attentiveid/shared'
import { Download, ImagePlus, Loader2, Pencil, Trash2 } from 'lucide-react'
import { AdminToolsApiError, deleteQrCode, listQrCodes, saveQrCode } from '../../features/admin-tools/service'
import { downloadCanvasPng, loadAttentiveMarkDataUrl, renderQrToCanvas } from '../../features/admin-tools/qr-render'

interface Design {
  id?: string
  name: string
  targetUrl: string
  foreground: string
  background: string
  logoDataUrl: string
  logoScale: number
}

const emptyDesign = (): Design => ({
  name: '',
  targetUrl: 'https://attentiveid.com/',
  foreground: '#14284B',
  background: '#FFFFFF',
  logoDataUrl: '',
  logoScale: 0.2,
})

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100'

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('File tidak bisa dibaca.'))
    reader.readAsDataURL(file)
  })

export function QrGeneratorPage() {
  const { tx } = useTx()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [design, setDesign] = useState<Design>(emptyDesign)
  const [attentiveMark, setAttentiveMark] = useState('')
  const [saved, setSaved] = useState<QrCodeDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      setSaved(await listQrCodes())
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal memuat QR tersimpan.', 'Failed to load saved QR codes.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // New designs start with the small Attentive mark in the middle (just the mark, no name).
  useEffect(() => {
    let cancelled = false
    loadAttentiveMarkDataUrl()
      .then((dataUrl) => {
        if (cancelled) return
        setAttentiveMark(dataUrl)
        setDesign((current) => (current.id || current.logoDataUrl || current.name ? current : { ...current, logoDataUrl: dataUrl }))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    renderQrToCanvas(canvas, design).catch((caught) => {
      if (!cancelled) setError(caught instanceof Error ? caught.message : tx('Gagal membuat QR.', 'Failed to generate the QR code.'))
    })
    return () => {
      cancelled = true
    }
  }, [design.targetUrl, design.foreground, design.background, design.logoDataUrl, design.logoScale])

  const update = (patch: Partial<Design>) => setDesign((current) => ({ ...current, ...patch }))

  const handleLogo = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError(tx('Logo harus PNG, JPG, atau WebP.', 'Logo must be PNG, JPG or WebP.'))
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    if (dataUrlBytes(dataUrl) > QR_MAX_LOGO_BYTES) {
      setError(tx('Ukuran logo maks 150 KB. Kecilkan dulu gambarnya.', 'Logo must be 150 KB or smaller. Please shrink the image first.'))
      return
    }
    update({ logoDataUrl: dataUrl })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setFieldErrors({})
    try {
      const { id, ...input } = design
      const result = await saveQrCode(id, input)
      setDesign((current) => ({ ...current, id: result.id }))
      setNotice(tx('QR tersimpan di daftar di bawah.', 'QR saved in the list below.'))
      await load()
    } catch (caught) {
      if (caught instanceof AdminToolsApiError) setFieldErrors(caught.fieldErrors)
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan.', 'Failed to save.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (item: QrCodeDto) => {
    if (!window.confirm(tx(`Hapus QR "${item.name}"?`, `Delete QR "${item.name}"?`))) return
    try {
      await deleteQrCode(item.id)
      if (design.id === item.id) setDesign({ ...emptyDesign(), logoDataUrl: attentiveMark })
      setNotice(tx('QR dihapus.', 'QR deleted.'))
      await load()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menghapus.', 'Failed to delete.'))
    }
  }

  const handleDownloadSaved = async (item: QrCodeDto) => {
    const canvas = document.createElement('canvas')
    await renderQrToCanvas(canvas, item, 1024)
    downloadCanvasPng(canvas, item.name)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
          QR Generator
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {tx('Buat QR code dengan logo Attentive di tengah (atau logo sendiri), simpan desainnya, dan unduh sebagai PNG. Selalu tes scan sebelum dicetak.', 'Create a QR code with the Attentive logo in the middle (or your own logo), save the design and download it as PNG. Always test-scan before printing.')}
        </p>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <label className="block text-sm font-medium text-slate-700">
            {tx('Nama QR', 'QR name')}
            <input className={inputClass} onChange={(e) => update({ name: e.target.value })} placeholder={tx('Poster Sesi Gratis', 'Free Session poster')} value={design.name} />
            {fieldErrors.name && <span className="text-xs text-rose-700">{fieldErrors.name}</span>}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {tx('Alamat tujuan', 'Destination address')}
            <input className={inputClass} onChange={(e) => update({ targetUrl: e.target.value })} placeholder="https://attentiveid.com/free-session" value={design.targetUrl} />
            {fieldErrors.targetUrl && <span className="text-xs text-rose-700">{fieldErrors.targetUrl}</span>}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium text-slate-700">
              {tx('Warna QR', 'QR color')}
              <input aria-label={tx('Warna QR', 'QR color')} className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200" onChange={(e) => update({ foreground: e.target.value.toUpperCase() })} type="color" value={design.foreground} />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              {tx('Warna latar', 'Background color')}
              <input aria-label={tx('Warna latar', 'Background color')} className="mt-1 h-10 w-full cursor-pointer rounded-xl border border-slate-200" onChange={(e) => update({ background: e.target.value.toUpperCase() })} type="color" value={design.background} />
            </label>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-700">{tx('Logo di tengah QR', 'Logo in the middle of the QR')}</span>
            <p className="text-xs text-slate-500">{tx('Bawaan: logo Attentive (hanya simbol, tanpa nama). Bisa diganti logo sendiri (PNG/JPG/WebP, maks 150 KB) atau dihapus.', 'Default: the Attentive logo (symbol only, no name). You can replace it with your own logo (PNG/JPG/WebP, max 150 KB) or remove it.')}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                aria-pressed={Boolean(attentiveMark) && design.logoDataUrl === attentiveMark}
                className={`rounded-xl border px-3 py-2 text-sm font-medium cursor-pointer ${
                  attentiveMark && design.logoDataUrl === attentiveMark ? 'border-navy-700 bg-navy-50 text-navy-800 ring-2 ring-gold-300' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                disabled={!attentiveMark}
                onClick={() => update({ logoDataUrl: attentiveMark })}
                type="button"
              >
                {tx('Logo Attentive', 'Attentive logo')}
              </button>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <ImagePlus className="size-4" aria-hidden="true" />
                {tx('Unggah logo sendiri', 'Upload your own logo')}
                <input
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    handleLogo(file)
                  }}
                  type="file"
                />
              </label>
              <button
                aria-pressed={!design.logoDataUrl}
                className={`rounded-xl border px-3 py-2 text-sm font-medium cursor-pointer ${
                  !design.logoDataUrl ? 'border-navy-700 bg-navy-50 text-navy-800 ring-2 ring-gold-300' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => update({ logoDataUrl: '' })}
                type="button"
              >
                {tx('Tanpa logo', 'No logo')}
              </button>
              {design.logoDataUrl && <img alt={tx('Logo terpilih', 'Selected logo')} className="h-10 w-auto rounded border border-slate-200 bg-white p-0.5" src={design.logoDataUrl} />}
            </div>
            {fieldErrors.logoDataUrl && <span className="text-xs text-rose-700">{fieldErrors.logoDataUrl}</span>}
            {design.logoDataUrl && (
              <label className="mt-3 block text-sm font-medium text-slate-700">
                {tx('Ukuran logo', 'Logo size')} ({Math.round(design.logoScale * 100)}%)
                <input
                  className="mt-1 w-full"
                  max={QR_LOGO_SCALE_RANGE.max}
                  min={QR_LOGO_SCALE_RANGE.min}
                  onChange={(e) => update({ logoScale: Number(e.target.value) })}
                  step={0.01}
                  type="range"
                  value={design.logoScale}
                />
              </label>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button className="flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-60 cursor-pointer" disabled={isSaving} onClick={handleSave} type="button">
              {isSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {design.id ? tx('Simpan perubahan', 'Save changes') : tx('Simpan QR', 'Save QR')}
            </button>
            <button
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              onClick={() => canvasRef.current && downloadCanvasPng(canvasRef.current, design.name || 'qr-code')}
              type="button"
            >
              <Download className="size-4" aria-hidden="true" />
              {tx('Unduh PNG', 'Download PNG')}
            </button>
            {design.id && (
              <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer" onClick={() => setDesign({ ...emptyDesign(), logoDataUrl: attentiveMark })} type="button">
                {tx('QR baru', 'New QR')}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <p className="mb-3 text-sm font-medium text-slate-700">{tx('Pratinjau', 'Preview')}</p>
          <canvas aria-label={tx('Pratinjau QR code', 'QR code preview')} className="aspect-square w-full rounded-xl border border-slate-200" ref={canvasRef} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-5 py-3 text-sm font-semibold text-slate-800">{tx('QR tersimpan', 'Saved QR codes')}</div>
        {isLoading ? (
          <p className="p-8 text-center text-sm text-slate-500">{tx('Memuat...', 'Loading...')}</p>
        ) : saved.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">{tx('Belum ada QR tersimpan.', 'No saved QR codes yet.')}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {saved.map((item) => (
              <li className="flex items-center justify-between gap-3 px-5 py-3" key={item.id}>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{item.name}</div>
                  <div className="truncate text-xs text-slate-500">{item.targetUrl}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button aria-label={tx(`Muat ${item.name}`, `Load ${item.name}`)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => setDesign({ ...item })} type="button">
                    <Pencil className="size-3.5" aria-hidden="true" />
                  </button>
                  <button aria-label={tx(`Unduh ${item.name}`, `Download ${item.name}`)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50 cursor-pointer" onClick={() => handleDownloadSaved(item)} type="button">
                    <Download className="size-3.5" aria-hidden="true" />
                  </button>
                  <button aria-label={tx(`Hapus ${item.name}`, `Delete ${item.name}`)} className="rounded-lg border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer" onClick={() => handleDelete(item)} type="button">
                    <Trash2 className="size-3.5" aria-hidden="true" />
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
