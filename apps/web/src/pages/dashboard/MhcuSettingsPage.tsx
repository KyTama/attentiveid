import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useTx } from '@/features/i18n/use-tx'
import { getSettings, saveSettings, type MhcuSettings } from '@/features/mhcu-dashboard/api'
import { formatThousands, levelNameOf, regroupRupiah, rupiahValue, settingsEqual, settingsProblem } from '@/features/mhcu-dashboard/helpers'

const fieldClass = 'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100'

/** Texts of the money fields while they are being typed (the saved numbers are whole rupiah). */
interface PriceText {
  singleNormal: string
  singlePromo: string
  packageNormal: string
  packagePromo: string
}

const priceTextOf = (s: MhcuSettings): PriceText => ({
  singleNormal: formatThousands(s.pricing.single.normal),
  singlePromo: formatThousands(s.pricing.single.promo),
  packageNormal: formatThousands(s.pricing.package3.normal),
  packagePromo: formatThousands(s.pricing.package3.promo),
})

/** Prices, promo end, alert level and e-mail, and the two automatic steps of the MHCU flow (admin only). */
export function MhcuSettingsPage() {
  const { tx, isEn } = useTx()
  const [saved, setSaved] = useState<MhcuSettings | null>(null)
  const [draft, setDraft] = useState<MhcuSettings | null>(null)
  const [prices, setPrices] = useState<PriceText | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getSettings()
      .then((s) => {
        if (!alive) return
        setSaved(s)
        setDraft(s)
        setPrices(priceTextOf(s))
      })
      .catch((caught) => alive && setError(caught instanceof Error ? caught.message : tx('Pengaturan belum bisa dimuat.', 'The settings could not be loaded.')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const header = (
    <div className="space-y-2">
      <Link className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-navy-800" to="/dashboard/assessments/mhcu">
        <ArrowLeft aria-hidden="true" className="size-4" /> {tx('Dasbor MHCU', 'MHCU dashboard')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" data-route-heading tabIndex={-1}>
        {tx('Pengaturan MHCU', 'MHCU settings')}
      </h1>
      <p className="max-w-2xl text-sm text-slate-600">
        {tx('Harga laporan lengkap, peringatan untuk level tinggi, dan langkah otomatis. Perubahan berlaku setelah disimpan.', 'Full report prices, alerts for high levels and the automatic steps. Changes apply once saved.')}
      </p>
    </div>
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 pb-12">
        {header}
        <p className="flex items-center gap-2 text-sm text-slate-500" role="status"><Loader2 aria-hidden="true" className="size-4 animate-spin" /> {tx('Memuat...', 'Loading...')}</p>
      </div>
    )
  }
  if (!draft || !saved || !prices) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 pb-12">
        {header}
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error ?? tx('Pengaturan tidak ditemukan.', 'Settings not found.')}</p>
      </div>
    )
  }

  const dirty = !settingsEqual(draft, saved)
  const lang = isEn ? 'en' : 'id'

  const setPrice = (key: keyof PriceText, typed: string) => {
    const grouped = regroupRupiah(typed)
    setPrices({ ...prices, [key]: grouped })
    const value = rupiahValue(grouped)
    const n = value ?? Number.NaN
    const pricing = { ...draft.pricing, single: { ...draft.pricing.single }, package3: { ...draft.pricing.package3 } }
    if (key === 'singleNormal') pricing.single.normal = n
    if (key === 'singlePromo') pricing.single.promo = n
    if (key === 'packageNormal') pricing.package3.normal = n
    if (key === 'packagePromo') pricing.package3.promo = n
    setDraft({ ...draft, pricing })
  }

  const save = () => {
    const problem = settingsProblem(draft, lang)
    if (problem) {
      setNotice(null)
      setError(problem)
      return
    }
    setBusy(true)
    setError(null)
    saveSettings({ ...draft, alertEmail: draft.alertEmail.trim() })
      .then((s) => {
        setSaved(s)
        setDraft(s)
        setPrices(priceTextOf(s))
        setNotice(tx('Pengaturan disimpan.', 'Settings saved.'))
      })
      .catch((caught) => {
        setNotice(null)
        setError(caught instanceof Error ? caught.message : tx('Gagal menyimpan pengaturan.', 'Failed to save the settings.'))
      })
      .finally(() => setBusy(false))
  }

  const money = (label: string, key: keyof PriceText) => (
    <label className="block text-xs font-semibold text-slate-600">
      {label}
      <span className="mt-1 flex items-center gap-2">
        <span className="text-sm font-normal text-slate-500">Rp</span>
        <input className={fieldClass} inputMode="numeric" onChange={(e) => setPrice(key, e.target.value)} value={prices[key]} />
      </span>
    </label>
  )

  const switchRow = ({ id, checked, onChange, title, hint }: { id: string; checked: boolean; onChange: (v: boolean) => void; title: string; hint: string }) => (
    <div key={id}>
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3" htmlFor={id}>
      <input checked={checked} className="mt-1 size-5 shrink-0" id={id} onChange={(e) => onChange(e.target.checked)} role="switch" type="checkbox" />
      <span>
        <span className="block text-sm font-semibold text-slate-900">{title}</span>
        <span className="block text-xs text-slate-600">{hint}</span>
      </span>
    </label>
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {header}
      {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{notice}</p>}
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800" role="alert">{error}</p>}

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-bold text-slate-900">{tx('Harga laporan lengkap', 'Full report prices')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-slate-800">{tx('Laporan 1x pemeriksaan', 'Report, 1 check-up')}</legend>
            {money(tx('Harga normal', 'Normal price'), 'singleNormal')}
            {money(tx('Harga promo', 'Promo price'), 'singlePromo')}
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold text-slate-800">{tx('Paket 3x pemeriksaan', 'Package of 3 check-ups')}</legend>
            {money(tx('Harga normal', 'Normal price'), 'packageNormal')}
            {money(tx('Harga promo', 'Promo price'), 'packagePromo')}
          </fieldset>
        </div>
        <label className="block text-xs font-semibold text-slate-600 sm:max-w-xs">
          {tx('Promo berlaku sampai (termasuk hari itu)', 'Promo valid until (including that day)')}
          <input className={`${fieldClass} mt-1`} onChange={(e) => setDraft({ ...draft, pricing: { ...draft.pricing, promoUntil: e.target.value } })} type="date" value={draft.pricing.promoUntil} />
        </label>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-bold text-slate-900">{tx('Peringatan hasil berat', 'Alerts for serious results')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Kirim peringatan mulai level', 'Send an alert from level')}
            <select className={`${fieldClass} mt-1`} onChange={(e) => setDraft({ ...draft, alertLevel: Number(e.target.value) })} value={draft.alertLevel}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>Level {n} · {levelNameOf(n, lang)}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            {tx('Email penerima peringatan', 'E-mail that receives the alert')}
            <input className={`${fieldClass} mt-1`} inputMode="email" onChange={(e) => setDraft({ ...draft, alertEmail: e.target.value })} placeholder="contact@attentiveid.com" type="email" value={draft.alertEmail} />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">{tx('Langkah otomatis', 'Automatic steps')}</h2>
        {switchRow({
          checked: draft.autoAssign,
          hint: tx('Pilih psikolog otomatis saat pembayaran dikonfirmasi.', 'Choose a psychologist automatically when the payment is confirmed.'),
          id: 'auto-assign',
          onChange: (v) => setDraft({ ...draft, autoAssign: v }),
          title: tx('Tugaskan psikolog otomatis', 'Assign a psychologist automatically'),
        })}
        {switchRow({
          checked: draft.autoSend,
          hint: tx('Rilis laporan otomatis bila bayar terkonfirmasi, psikolog ditugaskan dan catatan final.', 'Release the report automatically when the payment is confirmed, a psychologist is assigned and the note is final.'),
          id: 'auto-send',
          onChange: (v) => setDraft({ ...draft, autoSend: v }),
          title: tx('Rilis laporan otomatis', 'Release the report automatically'),
        })}
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-navy-900 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy || !dirty}
          onClick={save}
          type="button"
        >
          {busy && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {tx('Simpan pengaturan', 'Save settings')}
        </button>
        {dirty && (
          <>
            <span className="text-xs text-amber-700">{tx('Belum disimpan', 'Not saved yet')}</span>
            <button
              className="min-h-11 cursor-pointer rounded-xl px-3 text-sm font-semibold text-slate-600 underline"
              onClick={() => {
                setDraft(saved)
                setPrices(priceTextOf(saved))
                setError(null)
              }}
              type="button"
            >
              {tx('Batalkan perubahan', 'Discard changes')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
