import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Copy, Loader2, MessageCircle, Upload } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { buildPaymentWhatsAppUrl, formatRupiah, type PaymentOption } from '@/features/assessments/payment'

interface PaymentInfo {
  code: string
  name: string
  lang: 'id' | 'en'
  submitted: boolean
  account: { bank: string; number: string; holder: string }
  whatsapp: string
  options: PaymentOption[]
}

const MAX_BYTES = 5 * 1024 * 1024

/** The page behind "Get Your Full Analyzed Report Here!" in the result e-mail: how to pay, upload the proof, then reach us on WhatsApp. */
export function AssessmentPaymentPage() {
  const [params] = useSearchParams()
  const id = params.get('id') ?? ''
  const token = params.get('t') ?? ''
  const [info, setInfo] = useState<PaymentInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [choice, setChoice] = useState<'single' | 'package3'>('single')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  // Bahasa Indonesia is the default; English only when the result was taken in English or the link asks for it.
  const en = (params.get('lang') ?? info?.lang) === 'en'
  const tx = (indonesian: string, english: string) => (en ? english : indonesian)

  useEffect(() => {
    document.title = 'Laporan Lengkap MHCU — Attentive.id'
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`/api/public/assessments/payment-info?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`)
        const json = await response.json().catch(() => ({}))
        if (cancelled) return
        if (!response.ok) throw new Error(json?.message || 'Tautan tidak valid. Gunakan tombol di email hasil Anda.')
        setInfo(json.data as PaymentInfo)
        setSaved(Boolean(json.data?.submitted))
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : 'Gagal memuat halaman.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, token])

  const selected = useMemo(() => info?.options.find((option) => option.key === choice) ?? null, [info, choice])

  const copyNumber = async () => {
    if (!info) return
    try {
      await navigator.clipboard.writeText(info.account.number)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked: the number is visible to copy by hand
    }
  }

  const saveAndReach = async () => {
    if (!info || !selected) return
    setError(null)
    if (!file) {
      setError(tx('Unggah bukti transfer dulu (gambar JPG/PNG/WebP atau PDF, maksimal 5 MB).', 'Please upload your proof of transfer first (JPG/PNG/WebP image or PDF, up to 5 MB).'))
      return
    }
    if (file.size > MAX_BYTES) {
      setError(tx(`Ukuran file ${(file.size / 1048576).toFixed(1)} MB melebihi batas 5 MB.`, `The file is ${(file.size / 1048576).toFixed(1)} MB, over the 5 MB limit.`))
      return
    }
    setBusy(true)
    try {
      if (!saved) {
        const form = new FormData()
        form.set('id', id)
        form.set('t', token)
        form.set('paymentFor', choice)
        form.set('proof', file)
        const response = await fetch('/api/public/assessments/payment', { method: 'POST', body: form })
        const json = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(json?.message || tx('Gagal menyimpan bukti.', 'Could not save the proof.'))
        setSaved(true)
      }
      // Open WhatsApp with the message ready to send.
      window.open(buildPaymentWhatsAppUrl({ whatsapp: info.whatsapp, name: info.name, code: info.code, option: selected, lang: en ? 'en' : 'id' }), '_blank', 'noopener,noreferrer')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan bukti.', 'Could not save the proof.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        {loading ? (
          <p className="flex items-center gap-2 text-sm text-secondary/70">
            <Loader2 aria-hidden="true" className="size-4 animate-spin" /> {tx('Memuat…', 'Loading…')}
          </p>
        ) : !info ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800" role="alert">
            {error ?? 'Tautan tidak valid.'}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary/60">MHCU · {info.code}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight" data-route-heading tabIndex={-1}>
                {tx('Laporan Lengkap Anda', 'Your full report')}
              </h1>
              <p className="mt-2 text-sm text-secondary/75">
                {tx(`Halo ${info.name}. Ikuti langkah berikut untuk mendapatkan laporan lengkap yang dianalisis psikolog Attentive.`, `Hello ${info.name}. Follow these steps to get the full report analysed by an Attentive psychologist.`)}
              </p>
            </div>

            <section className="space-y-3 rounded-2xl border border-secondary/10 bg-white p-5">
              <h2 className="text-base font-bold">{tx('1. Pilih laporan', '1. Choose your report')}</h2>
              <div className="space-y-2">
                {info.options.map((option) => (
                  <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${choice === option.key ? 'border-primary bg-primary/5' : 'border-secondary/15'}`} key={option.key}>
                    <input checked={choice === option.key} className="mt-1" name="option" onChange={() => setChoice(option.key)} type="radio" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{en ? option.labelEn : option.labelId}</span>
                      <span className="block text-secondary/70">
                        <b className="text-secondary">{formatRupiah(option.amount)}</b>
                        {option.amount < option.normal && <span className="ml-2 line-through">{formatRupiah(option.normal)}</span>}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-secondary/10 bg-white p-5">
              <h2 className="text-base font-bold">{tx('2. Transfer pembayaran', '2. Transfer the payment')}</h2>
              <dl className="grid gap-2 text-sm sm:grid-cols-[9rem_1fr]">
                <dt className="text-secondary/60">{tx('Bank', 'Bank')}</dt>
                <dd className="font-semibold">Rek. {info.account.bank}</dd>
                <dt className="text-secondary/60">{tx('Nomor rekening', 'Account number')}</dt>
                <dd className="flex items-center gap-2 font-mono text-base font-bold">
                  {info.account.number}
                  <button
                    aria-label={tx('Salin nomor rekening', 'Copy the account number')}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-secondary/15 px-2 py-1 text-xs font-semibold hover:bg-secondary/5"
                    onClick={() => void copyNumber()}
                    type="button"
                  >
                    <Copy aria-hidden="true" className="size-3.5" />
                    {copied ? tx('Tersalin', 'Copied') : tx('Salin', 'Copy')}
                  </button>
                </dd>
                <dt className="text-secondary/60">{tx('Atas nama', 'Account holder')}</dt>
                <dd className="font-semibold">{info.account.holder}</dd>
                <dt className="text-secondary/60">{tx('Jumlah', 'Amount')}</dt>
                <dd className="font-bold">{selected ? formatRupiah(selected.amount) : '–'}</dd>
              </dl>
            </section>

            <section className="space-y-3 rounded-2xl border border-secondary/10 bg-white p-5">
              <h2 className="text-base font-bold">{tx('3. Unggah bukti transfer', '3. Upload your proof of transfer')}</h2>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-secondary/25 p-5 text-center text-sm hover:bg-secondary/5">
                <Upload aria-hidden="true" className="size-6 text-secondary/60" />
                <span className="font-semibold">{file ? file.name : tx('Pilih berkas bukti transfer', 'Choose the proof file')}</span>
                <span className="text-xs text-secondary/60">{tx('Gambar JPG, PNG, WebP atau PDF · maksimal 5 MB', 'JPG, PNG, WebP image or PDF · up to 5 MB')}</span>
                <input
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="sr-only"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  type="file"
                />
              </label>
              {saved && (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700" role="status">
                  <CheckCircle2 aria-hidden="true" className="size-4" />
                  {tx('Bukti transfer Anda sudah tersimpan.', 'Your proof of transfer is saved.')}
                </p>
              )}
            </section>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                {error}
              </div>
            )}

            <button
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-base font-semibold text-white hover:opacity-90 disabled:opacity-60"
              disabled={busy}
              onClick={() => void saveAndReach()}
              type="button"
            >
              {busy ? <Loader2 aria-hidden="true" className="size-5 animate-spin" /> : <MessageCircle aria-hidden="true" className="size-5" />}
              {tx('Simpan & Hubungi Kami', 'Save & Reach Us')}
            </button>
            <p className="text-center text-xs text-secondary/60">
              {tx('Tombol ini menyimpan bukti Anda lalu membuka WhatsApp dengan pesan konfirmasi yang sudah siap dikirim.', 'This saves your proof and opens WhatsApp with a confirmation message ready to send.')}
            </p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
