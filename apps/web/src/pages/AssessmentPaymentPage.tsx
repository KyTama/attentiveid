import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { buildPaymentWhatsAppUrl, formatRupiah, type PaymentOption } from '@/features/assessments/payment'

interface PaymentInfo {
  code: string
  name: string
  lang: 'id' | 'en'
  submitted: boolean
  mhi: number | null
  level: number | null
  levelName: { id?: string; en?: string } | null
  track: string
  account: { bank: string; number: string; holder: string }
  whatsapp: string
  options: PaymentOption[]
}

const MAX_BYTES = 5 * 1024 * 1024
const PROMO_UNTIL = { id: '30 April 2027', en: '30 April 2027' }

/** The team's stylesheet for the report-access page (RMHCU/new, "Halaman laporan"), scoped to this page. */
const CSS = `
.mhcu-unlock{--navy:#142B51;--navy-2:#1D3B6C;--ink:#1B2533;--ink-2:#3C4858;--mute:#667085;--faint:#98A2B3;--line:#DCE2EA;background:#F3F5F8;color:var(--ink);font:400 15px/1.6 Montserrat,'Segoe UI',Arial,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
.mhcu-unlock *{box-sizing:border-box}
.mhcu-unlock .hd{background:#fff;border-bottom:1px solid var(--line)}
.mhcu-unlock .hd .in{max-width:760px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:14px}
.mhcu-unlock .hd img{height:30px;display:block}
.mhcu-unlock .sp{flex:1}
.mhcu-unlock .hd small{font-size:10.5px;letter-spacing:1.6px;font-weight:700;color:var(--mute);text-transform:uppercase}
.mhcu-unlock .rule{height:2px;background:var(--navy)}
.mhcu-unlock main{max-width:760px;margin:0 auto;padding:26px 20px 50px}
.mhcu-unlock .card{background:#fff;border:1px solid var(--line);border-radius:10px;padding:28px 30px}
.mhcu-unlock .eyebrow{font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:var(--mute);font-weight:700;margin:0 0 8px;display:flex;gap:8px;align-items:center}
.mhcu-unlock .eyebrow i{width:8px;height:8px;border-radius:50%;background:var(--faint);display:inline-block}
.mhcu-unlock .eyebrow i.ok{background:#1E6B42}
.mhcu-unlock h1{font-size:23px;line-height:1.3;color:var(--navy);margin:0 0 8px;letter-spacing:-.3px}
.mhcu-unlock h2{font-size:16px;color:var(--navy);margin:22px 0 6px}
.mhcu-unlock p{margin:0 0 10px}
.mhcu-unlock .muted{color:var(--mute);font-size:13.5px}
.mhcu-unlock .doc{display:grid;grid-template-columns:92px 1fr;gap:20px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:18px;margin:20px 0}
.mhcu-unlock .paper{position:relative;width:92px;height:122px;border-radius:3px;background:#fff;border:1px solid #D0D5DD;box-shadow:0 3px 10px rgba(20,43,81,.10);overflow:hidden}
.mhcu-unlock .paper i{position:absolute;left:10px;right:10px;height:4px;border-radius:2px;background:#E4E7EC}
.mhcu-unlock .paper .bar{position:absolute;left:10px;right:10px;top:46px;height:7px;display:flex}
.mhcu-unlock .paper .bar span{flex:1}
.mhcu-unlock .paper .lock{position:absolute;inset:0;background:rgba(244,245,247,.78);display:flex;align-items:center;justify-content:center}
.mhcu-unlock .paper .lock svg{width:26px;height:26px;stroke:var(--navy);fill:none;stroke-width:1.8}
.mhcu-unlock .doc b{font-size:15px;color:var(--ink)}
.mhcu-unlock .doc dl{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;margin:8px 0 0;font-size:13px}
.mhcu-unlock .doc dt{color:var(--mute)}
.mhcu-unlock .doc dd{margin:0;font-weight:600;overflow-wrap:anywhere}
.mhcu-unlock .opts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 12px}
.mhcu-unlock .opt{border:1px solid var(--line);border-radius:10px;padding:16px;display:flex;flex-direction:column;gap:10px}
.mhcu-unlock .opt.sel{border-color:var(--navy);box-shadow:0 0 0 1px var(--navy)}
.mhcu-unlock .opt b{display:block;font-size:15px;color:var(--ink)}
.mhcu-unlock .opt .muted{font-size:12.5px;display:block;margin-top:2px}
.mhcu-unlock .opt .pr{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;margin-top:auto}
.mhcu-unlock .opt .now{font-size:21px;font-weight:800;color:var(--navy)}
.mhcu-unlock .opt s{color:var(--faint);font-size:13.5px}
.mhcu-unlock .opt .btn{text-align:center}
@media (max-width:600px){.mhcu-unlock .opts{grid-template-columns:1fr}}
.mhcu-unlock ol.st{margin:16px 0 0;padding:0;list-style:none;counter-reset:n}
.mhcu-unlock ol.st li{counter-increment:n;position:relative;padding:0 0 12px 36px;font-size:14px;color:var(--ink-2)}
.mhcu-unlock ol.st li::before{content:counter(n);position:absolute;left:0;top:0;width:24px;height:24px;border-radius:50%;border:1.5px solid var(--navy);color:var(--navy);font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center}
.mhcu-unlock .row{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.mhcu-unlock .btn{display:inline-block;border:1px solid transparent;font:700 14px Montserrat,Arial,sans-serif;padding:12px 20px;border-radius:8px;cursor:pointer;text-decoration:none;min-height:44px}
.mhcu-unlock .btn.pri{background:var(--navy);color:#fff}
.mhcu-unlock .btn.pri:hover{background:var(--navy-2)}
.mhcu-unlock .btn.sec{background:#fff;color:var(--navy);border-color:var(--line)}
.mhcu-unlock .btn:disabled{opacity:.6;cursor:default}
.mhcu-unlock .note{border:1px solid var(--line);border-left:3px solid #B42318;background:#FEF3F2;border-radius:0 8px 8px 0;padding:11px 15px;font-size:13px;color:#5C1A14;margin-top:22px}
.mhcu-unlock .err{border:1px solid #F4C7C3;background:#FEF3F2;color:#7A271A;border-radius:8px;padding:10px 14px;font-size:13px;margin-top:12px}
.mhcu-unlock .pay{border:1px solid var(--line);border-radius:10px;padding:16px 18px;margin:14px 0 0}
.mhcu-unlock .pay dl{display:grid;grid-template-columns:9rem 1fr;gap:6px 12px;margin:8px 0 0;font-size:14px}
.mhcu-unlock .pay dt{color:var(--mute)}
.mhcu-unlock .pay dd{margin:0;font-weight:600}
.mhcu-unlock .acct{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:16px;font-weight:800}
.mhcu-unlock .copy{margin-left:8px;border:1px solid var(--line);background:#fff;border-radius:8px;padding:0 12px;min-height:44px;min-width:44px;font:700 12px Montserrat,Arial,sans-serif;color:var(--navy);cursor:pointer}
.mhcu-unlock .drop{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;border:2px dashed #C5CCD6;border-radius:10px;padding:18px;margin-top:10px;font-size:13.5px;cursor:pointer}
.mhcu-unlock .drop:hover{background:#F7F8FA}
.mhcu-unlock .drop input{position:absolute;opacity:0;width:1px;height:1px}
.mhcu-unlock .drop:focus-within{outline:2px solid var(--navy);outline-offset:2px}
.mhcu-unlock .ok{color:#1E6B42;font-weight:700;font-size:13.5px;margin-top:8px}
.mhcu-unlock footer{max-width:760px;margin:0 auto;padding:0 20px 30px;font-size:12px;color:var(--mute)}
@media (max-width:600px){.mhcu-unlock .card{padding:22px 18px}.mhcu-unlock .doc{grid-template-columns:70px 1fr}.mhcu-unlock .paper{width:70px;height:94px}.mhcu-unlock .pay dl{grid-template-columns:1fr}}
`

const lockSvg = (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <rect height="10" rx="2" width="14" x="5" y="10.5" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </svg>
)

/** "Halaman laporan": where the button in the result e-mail leads. Follows the team's design (RMHCU/new), with the transfer details and the proof upload added. */
export function AssessmentPaymentPage() {
  const [params] = useSearchParams()
  const id = params.get('id') ?? ''
  const token = params.get('t') ?? ''
  const [info, setInfo] = useState<PaymentInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [choice, setChoice] = useState<'single' | 'package3'>('single')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const payRef = useRef<HTMLDivElement>(null)

  // Bahasa Indonesia is the default; English only when the result was taken in English or the link asks for it.
  const en = (params.get('lang') ?? info?.lang) === 'en'
  const t = (indonesian: string, english: string) => (en ? english : indonesian)

  useEffect(() => {
    document.title = 'Laporan Mental Health Check-Up — Attentive.id'
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const response = await fetch(`/api/public/assessments/payment-info?id=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`)
        const json = await response.json().catch(() => ({}))
        if (cancelled) return
        if (response.status === 404) {
          setNotFound(true)
          return
        }
        if (!response.ok) throw new Error(json?.message || 'Gagal memuat halaman.')
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

  const mhiText = (value: number | null) => (value === null ? '–' : (Math.round(value * 10) / 10).toFixed(1).replace('.', en ? '.' : ','))

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

  const choose = (key: 'single' | 'package3') => {
    setChoice(key)
    window.setTimeout(() => payRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const saveAndReach = async () => {
    if (!info || !selected) return
    setError(null)
    if (!file) {
      setError(t('Unggah bukti transfer dulu (gambar JPG/PNG/WebP atau PDF, maksimal 5 MB).', 'Please upload your proof of transfer first (JPG/PNG/WebP image or PDF, up to 5 MB).'))
      return
    }
    if (file.size > MAX_BYTES) {
      setError(t(`Ukuran file ${(file.size / 1048576).toFixed(1)} MB melebihi batas 5 MB.`, `The file is ${(file.size / 1048576).toFixed(1)} MB, over the 5 MB limit.`))
      return
    }
    setBusy(true)
    try {
      const key = `${choice}:${file.name}:${file.size}:${file.lastModified}`
      if (!saved || key !== savedKey) {
        const form = new FormData()
        form.set('id', id)
        form.set('t', token)
        form.set('paymentFor', choice)
        form.set('proof', file)
        const response = await fetch('/api/public/assessments/payment', { method: 'POST', body: form })
        const json = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(json?.message || t('Gagal menyimpan bukti.', 'Could not save the proof.'))
        setSaved(true)
        setSavedKey(key)
      }
      window.open(buildPaymentWhatsAppUrl({ whatsapp: info.whatsapp, name: info.name, code: info.code, option: selected, lang: en ? 'en' : 'id' }), '_blank', 'noopener,noreferrer')
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : ''
      setError(
        !message || message === 'Failed to fetch' || message === 'Load failed' || message === 'NetworkError when attempting to fetch resource.'
          ? t('Koneksi bermasalah. Periksa internet Anda lalu coba lagi.', 'Connection problem. Please check your internet and try again.')
          : message,
      )
    } finally {
      setBusy(false)
    }
  }

  const waAdmin = (text: string) => `https://wa.me/${info?.whatsapp ?? '6285156410912'}?text=${encodeURIComponent(text)}`
  const levelName = info?.levelName ? (en ? info.levelName.en : info.levelName.id) : ''

  const docLine = info && (
    <div className="doc">
      <div className="paper">
        <i style={{ top: 12, width: '42%' }} />
        <i style={{ top: 21 }} />
        <i style={{ top: 29, width: '70%' }} />
        <div className="bar">
          <span style={{ background: '#D0D5DD' }} />
          <span style={{ background: '#DDE1E7' }} />
          <span style={{ background: '#E8EBEF' }} />
          <span style={{ background: '#F4F5F7' }} />
        </div>
        <i style={{ top: 64 }} />
        <i style={{ top: 72, width: '80%' }} />
        <i style={{ top: 84 }} />
        <i style={{ top: 92, width: '60%' }} />
        <i style={{ top: 104, width: '40%', left: 'auto' }} />
        <div className="lock">{lockSvg}</div>
      </div>
      <div>
        <b>
          {t('Laporan lengkap', 'Full report')} {info.code}
        </b>
        <dl>
          <dt>{t('Atas nama', 'Name')}</dt>
          <dd>{info.name}</dd>
          <dt>{t('Isi', 'Content')}</dt>
          <dd>{t('1 halaman', '1 page')}</dd>
          <dt>MHI</dt>
          <dd>
            {mhiText(info.mhi)}
            {info.level ? ` (Level ${info.level}${levelName ? `, ${levelName}` : ''})` : ''}
          </dd>
          <dt>{t('Psikolog', 'Psychologist')}</dt>
          <dd>{t('Ditugaskan setelah pembelian', 'Assigned after purchase')}</dd>
        </dl>
      </div>
    </div>
  )

  return (
    <div className="mhcu-unlock">
      <style>{CSS}</style>
      <header className="hd">
        <div className="in">
          <img alt="attentive." src="/images/assessments/attentive-logo-light.png" />
          <span className="sp" />
          <small>{t('Laporan Mental Health Check-Up', 'Mental Health Check-Up Report')}</small>
        </div>
        <div className="rule" />
      </header>
      <main>
        <div className="card">
          {loading ? (
            <p className="muted">{t('Memuat…', 'Loading…')}</p>
          ) : notFound || !info ? (
            <div role="alert">
              <p className="eyebrow">
                <i />
                {t('Tautan tidak berlaku', 'Link not valid')}
              </p>
              <h1 data-route-heading tabIndex={-1}>
                {t('Laporan tidak ditemukan', 'Report not found')}
              </h1>
              <p className="muted">
                {error ??
                  t(
                    'Tautan laporan tidak valid atau sudah tidak berlaku. Silakan hubungi Admin Attentive.',
                    'This report link is invalid or no longer valid. Please contact the Attentive admin.',
                  )}
              </p>
              <div className="row">
                <a className="btn pri" href="https://wa.me/6285156410912">
                  WhatsApp Admin
                </a>
              </div>
            </div>
          ) : saved && info.submitted ? (
            <>
              <p className="eyebrow">
                <i className="ok" />
                {t('Pembayaran sedang dikonfirmasi', 'Payment being confirmed')}
              </p>
              <h1 data-route-heading tabIndex={-1}>
                {t('Laporan sedang disiapkan', 'Your report is being prepared')}
              </h1>
              {docLine}
              <p className="muted">
                {t(
                  'Bukti transfer Anda sudah kami terima. Admin kami akan mengonfirmasi pembayaran, lalu psikolog Attentive ditugaskan untuk meninjau hasil Anda dan menandatangani laporannya. Laporan akan dikirim ke email Anda begitu selesai.',
                  'We have received your proof of transfer. Our admin will confirm the payment, then an Attentive psychologist is assigned to review your result and sign the report. It will be emailed to you as soon as it is ready.',
                )}
              </p>
              <div className="row">
                <a
                  className="btn pri"
                  href={waAdmin(t('Halo Admin Attentive, saya sudah membayar laporan lengkap MHCU saya. Kode laporan: ', 'Hello Attentive Admin, I have paid for my full MHCU report. Report code: ') + info.code + ` (${info.name})`)}
                >
                  {t('Hubungi admin via WhatsApp', 'Contact admin on WhatsApp')}
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">
                <i />
                {t('Laporan lengkap belum dibeli', 'Full report not yet purchased')}
              </p>
              <h1 data-route-heading tabIndex={-1}>
                {t('Dapatkan laporan lengkap', 'Get the full report')}
              </h1>
              <p className="muted">
                {t(
                  'Ringkasan hasil sudah dikirim ke email Anda tanpa biaya. Laporan lengkap berisi hasil per indeks serta keterangan dan rekomendasi dari psikolog. Setelah pembelian, psikolog Attentive akan ditugaskan untuk meninjau hasil Anda dan menandatangani laporannya. Pembelian bersifat opsional.',
                  'Your result summary has already been emailed to you free of charge. The full report contains results per index plus notes and recommendations from a psychologist. After purchase, an Attentive psychologist is assigned to review your result and sign the report. Buying it is optional.',
                )}
              </p>
              {docLine}
              <div className="opts">
                {info.options.map((option) => (
                  <div className={`opt ${choice === option.key ? 'sel' : ''}`} key={option.key}>
                    <div>
                      <b>{option.key === 'single' ? t('Laporan 1x', 'Single report') : t('Paket 3x', 'Package of 3')}</b>
                      <span className="muted">
                        {option.key === 'single'
                          ? t('Laporan lengkap untuk pemeriksaan ini.', 'Full report for this check-up.')
                          : t(
                              'Laporan lengkap untuk pemeriksaan ini, ditambah 2 kali MHCU berikutnya lengkap dengan laporannya. Cocok untuk memantau perkembangan.',
                              'Full report for this check-up plus 2 more check-ups with full reports. Useful for following your progress.',
                            )}
                      </span>
                    </div>
                    <div className="pr">
                      <span className="now">{formatRupiah(option.amount)}</span>
                      {option.amount < option.normal && <s>{formatRupiah(option.normal)}</s>}
                    </div>
                    <button className="btn pri" onClick={() => choose(option.key)} type="button">
                      {option.key === 'single' ? t('Beli 1x', 'Buy single') : t('Beli paket 3x', 'Buy package')}
                    </button>
                  </div>
                ))}
              </div>
              {info.options.some((option) => option.amount < option.normal) && (
                <p className="muted">{t(`Harga promo berlaku hingga ${PROMO_UNTIL.id}.`, `Introductory prices valid until ${PROMO_UNTIL.en}.`)}</p>
              )}

              <div className="pay" id="bayar" ref={payRef}>
                <b>{t('Pembayaran', 'Payment')}</b>
                <dl>
                  <dt>{t('Pilihan', 'Option')}</dt>
                  <dd>{selected ? (en ? selected.labelEn : selected.labelId) : '–'}</dd>
                  <dt>{t('Jumlah', 'Amount')}</dt>
                  <dd>{selected ? formatRupiah(selected.amount) : '–'}</dd>
                  <dt>{t('Bank', 'Bank')}</dt>
                  <dd>Rek. {info.account.bank}</dd>
                  <dt>{t('Nomor rekening', 'Account number')}</dt>
                  <dd>
                    <span className="acct">{info.account.number}</span>
                    <button aria-label={t('Salin nomor rekening', 'Copy the account number')} className="copy" onClick={() => void copyNumber()} type="button">
                      {copied ? t('Tersalin', 'Copied') : t('Salin', 'Copy')}
                    </button>
                  </dd>
                  <dt>{t('Atas nama', 'Account holder')}</dt>
                  <dd>{info.account.holder}</dd>
                </dl>
                <label className="drop">
                  <b>{file ? file.name : t('Unggah bukti transfer', 'Upload your proof of transfer')}</b>
                  <span className="muted">{t('Gambar JPG, PNG, WebP atau PDF · maksimal 5 MB', 'JPG, PNG, WebP image or PDF · up to 5 MB')}</span>
                  <input
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                </label>
                {saved && (
                  <p className="ok" role="status">
                    {t('Bukti transfer Anda sudah tersimpan.', 'Your proof of transfer is saved.')}
                  </p>
                )}
                {error && (
                  <div className="err" role="alert">
                    {error}
                  </div>
                )}
                <div className="row">
                  <button className="btn pri" disabled={busy} onClick={() => void saveAndReach()} type="button">
                    {t('Simpan & Hubungi Kami', 'Save & Reach Us')}
                  </button>
                </div>
                <p className="muted" style={{ marginTop: 10 }}>
                  {t(
                    'Tombol ini menyimpan bukti Anda lalu membuka WhatsApp dengan pesan konfirmasi yang sudah siap dikirim.',
                    'This saves your proof and opens WhatsApp with a confirmation message ready to send.',
                  )}
                </p>
              </div>

              <ol className="st">
                <li>
                  {t('Pilih paket, lalu transfer sesuai jumlah ke rekening di atas. Kode laporan Anda ', 'Choose an option, then transfer the amount to the account above. Your report code ')}
                  <b>{info.code}</b>
                  {t(' akan tertulis di pesan WhatsApp.', ' will be written in the WhatsApp message.')}
                </li>
                <li>{t('Unggah bukti transfer, lalu tekan Simpan & Hubungi Kami.', 'Upload the proof of transfer, then press Save & Reach Us.')}</li>
                <li>
                  {t(
                    'Setelah pembayaran dikonfirmasi, psikolog ditugaskan untuk meninjau hasil Anda. Laporan yang sudah ditandatangani dikirim ke email Anda.',
                    'Once payment is confirmed, a psychologist is assigned to review your result. The signed report is emailed to you.',
                  )}
                </li>
              </ol>
            </>
          )}
          {!loading && (
            <div className="note">
              {t('Jika Anda memiliki pikiran untuk menyakiti diri sendiri atau merasa tidak aman, segera hubungi layanan darurat medis ', 'If you are having thoughts of harming yourself or feel unsafe, contact emergency medical services (')}
              <b>119</b>
              {t(' atau kunjungi IGD terdekat.', ' in Indonesia) or go to the nearest emergency department right away.')}
            </div>
          )}
        </div>
      </main>
      <footer>{t('Biro Psikologi Attentive', 'Attentive Psychology Bureau')} | attentiveid.com | contact@attentiveid.com | WhatsApp +62 851-5641-0912</footer>
    </div>
  )
}
