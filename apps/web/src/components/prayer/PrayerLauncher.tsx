import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HeartHandshake, X } from 'lucide-react'
import { PRAYER_CITY_MAX, PRAYER_MAX, PRAYER_MIN, PRAYER_NAME_MAX, validatePrayerInput, type PrayerField } from '@attentiveid/shared'
import { useTx } from '@/features/i18n/use-tx'
import { submitPrayer, type PrayerFormValues } from '@/features/prayer/service'

const emptyValues: PrayerFormValues = { name: '', city: '', prayer: '', website: '' }

const fieldClass =
  'w-full rounded-xl border border-white/20 bg-white/8 px-3.5 py-2.5 text-[15px] text-white placeholder:text-white/45 outline-none transition-colors focus:border-[#d6a74d] focus:bg-white/12 focus-visible:ring-2 focus-visible:ring-[#d6a74d]/50'

/**
 * Lets a visitor write a prayer for others (name, city and the prayer). Shown on the Let There Be Light page as a button;
 * it opens by itself when the visitor comes from the gift and answered "Yes, take me there!" (?prayer=1).
 */
export function PrayerLauncher() {
  const { tx } = useTx()
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(() => params.get('prayer') === '1')
  const [values, setValues] = useState<PrayerFormValues>(emptyValues)
  const [errors, setErrors] = useState<Partial<Record<PrayerField, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState<{ pendingApproval: boolean } | null>(null)
  // Two fast clicks must send one prayer: state updates are not instant, a ref is.
  const lock = useRef(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // The ?prayer=1 flag has done its job once the form is open.
  useEffect(() => {
    if (params.get('prayer') !== '1') return
    const next = new URLSearchParams(params)
    next.delete('prayer')
    setParams(next, { replace: true })
  }, [params, setParams])

  useEffect(() => {
    if (!open) return
    firstFieldRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const update = <K extends keyof PrayerFormValues>(key: K, value: PrayerFormValues[K]) => setValues((current) => ({ ...current, [key]: value }))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || lock.current) return
    setFormError(null)
    const checked = validatePrayerInput(values)
    if (!checked.ok) {
      setErrors(checked.errors)
      return
    }
    setErrors({})
    lock.current = true
    setSubmitting(true)
    let result: Awaited<ReturnType<typeof submitPrayer>>
    try {
      result = await submitPrayer(values)
    } finally {
      lock.current = false
      setSubmitting(false)
    }
    if (result.status === 'success') {
      setDone({ pendingApproval: result.pendingApproval })
      setValues(emptyValues)
      return
    }
    if (result.status === 'invalid') {
      setErrors(result.errors)
      return
    }
    setFormError(result.status === 'rateLimited' ? result.message : tx('Doa belum terkirim. Periksa koneksi lalu coba lagi.', 'Your prayer was not sent. Check your connection and try again.'))
  }

  const close = () => {
    setOpen(false)
    setDone(null)
  }

  return (
    <>
      <button
        className="fixed right-4 top-4 z-60 flex cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <HeartHandshake aria-hidden="true" className="size-4 text-[#d6a74d]" />
        {tx('Kirim doa untuk orang lain', 'Send your prayer to others')}
      </button>

      {open ? (
        <div
          aria-labelledby="prayer-title"
          aria-modal="true"
          className="fixed inset-0 z-70 grid place-items-center overflow-y-auto bg-black/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
          role="dialog"
        >
          <div className="relative my-auto w-full max-w-md rounded-3xl border border-white/15 bg-[#101a33] p-6 text-white shadow-2xl sm:p-7">
            <button
              aria-label={tx('Tutup', 'Close')}
              className="absolute right-3 top-3 flex size-9 cursor-pointer items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d]"
              onClick={close}
              type="button"
            >
              <X aria-hidden="true" className="size-5" />
            </button>

            {done ? (
              <div className="space-y-4 py-4 text-center" role="status">
                <h2 className="text-xl font-bold" id="prayer-title">
                  {tx('Terima kasih ✨', 'Thank you ✨')}
                </h2>
                <p className="text-[15px] leading-relaxed text-white/80">
                  {done.pendingApproval
                    ? tx('Doamu sudah kami terima dan akan muncul di hadiah setelah ditinjau tim kami.', 'We received your prayer. It will appear in the gift once our team has reviewed it.')
                    : tx('Doamu sudah terkirim. Bisa jadi orang berikutnya yang membuka hadiah akan membacanya.', 'Your prayer is sent. The next person to open the gift may read it.')}
                </p>
                <button
                  className="cursor-pointer rounded-full bg-[#d6a74d] px-6 py-2.5 text-sm font-bold text-[#142b51] hover:bg-[#e0b55c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  onClick={close}
                  type="button"
                >
                  {tx('Selesai', 'Done')}
                </button>
              </div>
            ) : (
              <form className="space-y-4" noValidate onSubmit={handleSubmit}>
                <div className="pr-8">
                  <h2 className="text-xl font-bold" id="prayer-title">
                    {tx('Kirim doamu untuk orang lain', 'Send your prayer to others')}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/65">
                    {tx(
                      'Doamu bisa dibaca orang lain yang sedang lelah, di dalam hadiah di situs ini. Tulis dengan hangat. Jangan menulis tautan, email, atau nomor telepon.',
                      'Your prayer may be read by someone who is tired, inside the gift on this site. Write it warmly. Please do not write links, e-mails or phone numbers.',
                    )}
                  </p>
                </div>

                <label className="block text-sm font-medium text-white/85">
                  {tx('Namamu (boleh dikosongkan)', 'Your name (optional)')}
                  <input
                    autoComplete="given-name"
                    className={`${fieldClass} mt-1`}
                    maxLength={PRAYER_NAME_MAX}
                    onChange={(event) => update('name', event.target.value)}
                    ref={firstFieldRef}
                    value={values.name}
                  />
                  {errors.name ? <span className="mt-1 block text-xs text-rose-300" role="alert">{errors.name}</span> : null}
                </label>

                <label className="block text-sm font-medium text-white/85">
                  {tx('Kotamu (boleh dikosongkan)', 'Your city (optional)')}
                  <input
                    autoComplete="address-level2"
                    className={`${fieldClass} mt-1`}
                    maxLength={PRAYER_CITY_MAX}
                    onChange={(event) => update('city', event.target.value)}
                    value={values.city}
                  />
                  {errors.city ? <span className="mt-1 block text-xs text-rose-300" role="alert">{errors.city}</span> : null}
                </label>

                <label className="block text-sm font-medium text-white/85">
                  {tx('Doamu', 'Your prayer')}
                  <textarea
                    aria-describedby="prayer-count"
                    aria-invalid={errors.prayer ? true : undefined}
                    className={`${fieldClass} mt-1 min-h-32 resize-y`}
                    maxLength={PRAYER_MAX}
                    onChange={(event) => update('prayer', event.target.value)}
                    placeholder={tx('Semoga hari ini terasa lebih ringan untukmu…', 'May today feel a little lighter for you…')}
                    value={values.prayer}
                  />
                  <span className="mt-1 flex justify-between text-xs text-white/55" id="prayer-count">
                    <span>{errors.prayer ? <span className="text-rose-300" role="alert">{errors.prayer}</span> : tx(`Minimal ${PRAYER_MIN} karakter`, `At least ${PRAYER_MIN} characters`)}</span>
                    <span>{values.prayer.length}/{PRAYER_MAX}</span>
                  </span>
                </label>

                {/* Honeypot: people never see this, bots fill it. */}
                <div aria-hidden="true" className="absolute -left-2499.75 h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input autoComplete="off" onChange={(event) => update('website', event.target.value)} tabIndex={-1} value={values.website} />
                  </label>
                </div>

                {formError ? (
                  <p className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-200" role="alert">
                    {formError}
                  </p>
                ) : null}

                <button
                  className="w-full cursor-pointer rounded-full bg-[#d6a74d] px-6 py-3 text-sm font-bold text-[#142b51] transition-colors hover:bg-[#e0b55c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? tx('Mengirim…', 'Sending…') : tx('Kirim doa', 'Send prayer')}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
