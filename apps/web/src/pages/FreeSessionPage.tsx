import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  FREE_SESSION_BOOKING_URL,
  FREE_SESSION_GENDER_OPTIONS,
  FREE_SESSION_KELUHAN_OPTIONS,
  FREE_SESSION_MAX_DETAIL_LENGTH,
  buildFreeSessionWhatsAppUrl,
  validateFreeSessionSubmission,
  type FreeSessionField,
} from '@attentiveid/shared'
import {
  FREE_SESSION_WHATSAPP_NUMBER,
  submitFreeSession,
  type FreeSessionFieldErrors,
  type FreeSessionFormValues,
} from '@/features/free-session/service'
import { cn } from '@/lib/utils'

const emptyValues: FreeSessionFormValues = {
  eligible: '',
  name: '',
  age: '',
  gender: '',
  phone: '',
  email: '',
  keluhan: '',
  keluhanDetail: '',
  agreed: false,
  website: '',
}

const fieldClass =
  'block w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-sm'

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: FreeSessionField
  label: string
  optional?: boolean
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-secondary">
        {label}{' '}
        {optional ? (
          <span className="font-normal text-muted-foreground">(opsional)</span>
        ) : (
          <span aria-hidden="true" className="text-destructive">*</span>
        )}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function FreeSessionPage() {
  const [values, setValues] = useState<FreeSessionFormValues>(emptyValues)
  const [errors, setErrors] = useState<FreeSessionFieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  const update = <K extends keyof FreeSessionFormValues>(key: K, value: FreeSessionFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }))

  const describe = (id: FreeSessionField) => (errors[id] ? `${id}-error` : undefined)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setFormError(null)

    const checked = validateFreeSessionSubmission(values)
    if (!checked.ok) {
      setErrors(checked.errors)
      return
    }
    setErrors({})
    setSubmitting(true)

    const result = await submitFreeSession(values)
    setSubmitting(false)

    if (result.status === 'success') {
      setWhatsappUrl(
        buildFreeSessionWhatsAppUrl(FREE_SESSION_WHATSAPP_NUMBER, {
          name: checked.value.name,
          keluhan: checked.value.keluhan,
          keluhanDetail: checked.value.keluhanDetail,
        }),
      )
      return
    }
    if (result.status === 'invalid') {
      setErrors(result.errors)
      return
    }
    setFormError(
      result.status === 'rateLimited'
        ? result.message
        : 'Formulir belum terkirim. Periksa koneksi kamu lalu coba lagi.',
    )
  }

  function sendAnother() {
    setValues(emptyValues)
    setErrors({})
    setFormError(null)
    setWhatsappUrl(null)
  }

  return (
    <main className="min-h-screen bg-dominant lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative overflow-hidden bg-secondary px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
        <div className="relative z-10 flex h-full flex-col gap-10">
          <Link to="/" className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <img src="/images/attentive-logo-01.webp" alt="" width={48} height={48} className="size-12 rounded-full bg-white object-contain p-1" />
            <span className="text-2xl font-bold tracking-tight">attentive.</span>
          </Link>

          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Sesi Gratis 60 Menit</p>
            <h1
              className="text-3xl font-bold leading-tight outline-none md:text-4xl"
              data-route-heading
              tabIndex={-1}
            >
              Ruang yang aman untuk memulai cerita kamu.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-white/80">
              Khusus pengguna baru Attentive. Ceritakan kebutuhanmu dan kami akan merekomendasikan psikolog yang
              paling sesuai berdasarkan keluhan atau masalah yang kamu sampaikan.
            </p>
          </div>

          <p className="mt-auto text-xs leading-relaxed text-white/70">
            <strong className="font-semibold text-white">Biro Psikologi Attentive</strong>
            <br />
            Informasi yang kamu berikan dijaga kerahasiaannya dan hanya digunakan untuk proses layanan Attentive.
          </p>
        </div>
      </aside>

      <section className="flex items-start justify-center px-4 py-10 sm:px-8 lg:py-16">
        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-border sm:p-10">
          {whatsappUrl ? (
            <div className="space-y-5" role="status">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Terima kasih</p>
              <h2 className="text-2xl font-bold text-secondary">Formulir kamu terkirim.</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Klik tombol di bawah untuk melanjutkan ke WhatsApp Attentive — pesan konfirmasi sudah kami siapkan
                otomatis.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              >
                Lanjut ke WhatsApp
              </a>
              <button
                type="button"
                onClick={sendAnother}
                className="w-full rounded-full border border-border px-6 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-muted-background"
              >
                Kirim lagi
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Pendaftaran sesi gratis">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Selamat datang</p>
                <h2 className="text-2xl font-bold text-secondary">Yuk, mulai daftar sesi gratis.</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Isi beberapa informasi singkat agar kami bisa mencocokkan kebutuhanmu dengan psikolog yang sesuai.
                </p>
              </div>

              {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(event) => update('website', event.target.value)}
                />
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-secondary">
                  Apakah kamu pernah menggunakan layanan Attentive sebelumnya?{' '}
                  <span aria-hidden="true" className="text-destructive">*</span>
                </legend>
                {(
                  [
                    ['baru', 'Belum, ini pertama kali', 'Lanjutkan ke form pendaftaran sesi gratis.'],
                    ['lama', 'Sudah pernah', 'Kamu bisa melanjutkan lewat booking reguler.'],
                  ] as const
                ).map(([value, title, subtitle]) => (
                  <label
                    key={value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
                      values.eligible === value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted-background',
                    )}
                  >
                    <input
                      type="radio"
                      name="eligible"
                      value={value}
                      checked={values.eligible === value}
                      onChange={() => update('eligible', value)}
                      className="mt-1 accent-primary"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-secondary">{title}</span>
                      <span className="block text-xs text-muted-foreground">{subtitle}</span>
                    </span>
                  </label>
                ))}
                {errors.eligible ? (
                  <p role="alert" className="text-sm font-medium text-destructive">{errors.eligible}</p>
                ) : null}
              </fieldset>

              {values.eligible === 'lama' ? (
                <div className="space-y-3 rounded-xl bg-muted-background p-5" role="status">
                  <p className="text-sm font-bold text-secondary">Program ini khusus pengguna baru Attentive.</p>
                  <p className="text-sm text-muted-foreground">
                    Kamu tetap bisa menggunakan layanan Attentive melalui booking reguler. Terima kasih sudah tertarik
                    untuk bergabung kembali.
                  </p>
                  <a
                    href={FREE_SESSION_BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-white"
                  >
                    Booking reguler ↗
                  </a>
                </div>
              ) : null}

              {values.eligible === 'baru' ? (
                <div className="space-y-5">
                  <Field id="name" label="Nama lengkap" error={errors.name}>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      maxLength={80}
                      autoComplete="name"
                      placeholder="Nama lengkap"
                      value={values.name}
                      onChange={(event) => update('name', event.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={describe('name')}
                      className={fieldClass}
                    />
                  </Field>

                  <Field id="age" label="Umur" error={errors.age}>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      inputMode="numeric"
                      min={15}
                      max={99}
                      placeholder="Contoh: 24"
                      value={values.age}
                      onChange={(event) => update('age', event.target.value)}
                      aria-invalid={Boolean(errors.age)}
                      aria-describedby={describe('age')}
                      className={fieldClass}
                    />
                  </Field>

                  <Field id="phone" label="Nomor WhatsApp aktif" error={errors.phone}>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={18}
                      autoComplete="tel"
                      placeholder="Contoh: 0812xxxxxxxx"
                      value={values.phone}
                      onChange={(event) => update('phone', event.target.value.replace(/[^\d+\s-]/g, ''))}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={describe('phone')}
                      className={fieldClass}
                    />
                  </Field>

                  <Field id="email" label="Alamat email" optional error={errors.email}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      maxLength={120}
                      autoComplete="email"
                      placeholder="contoh: nama@email.com"
                      value={values.email}
                      onChange={(event) => update('email', event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={describe('email')}
                      className={fieldClass}
                    />
                  </Field>

                  <Field id="gender" label="Jenis kelamin" optional error={errors.gender}>
                    <select
                      id="gender"
                      name="gender"
                      value={values.gender}
                      onChange={(event) => update('gender', event.target.value)}
                      aria-invalid={Boolean(errors.gender)}
                      aria-describedby={describe('gender')}
                      className={fieldClass}
                    >
                      <option value="">Tidak ingin menjawab</option>
                      {FREE_SESSION_GENDER_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    id="keluhan"
                    label="Keluhan umum"
                    hint="Berdasarkan pilihan ini, kami akan merekomendasikan psikolog yang paling sesuai."
                    error={errors.keluhan}
                  >
                    <select
                      id="keluhan"
                      name="keluhan"
                      value={values.keluhan}
                      onChange={(event) => update('keluhan', event.target.value)}
                      aria-invalid={Boolean(errors.keluhan)}
                      aria-describedby={describe('keluhan')}
                      className={fieldClass}
                    >
                      <option value="" disabled>Pilih keluhan…</option>
                      {FREE_SESSION_KELUHAN_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field id="keluhanDetail" label="Ceritakan lebih lanjut" optional error={errors.keluhanDetail}>
                    <textarea
                      id="keluhanDetail"
                      name="keluhanDetail"
                      rows={4}
                      maxLength={FREE_SESSION_MAX_DETAIL_LENGTH}
                      placeholder="Kalau nyaman, ceritakan singkat apa yang kamu rasakan..."
                      value={values.keluhanDetail}
                      onChange={(event) => update('keluhanDetail', event.target.value)}
                      aria-invalid={Boolean(errors.keluhanDetail)}
                      aria-describedby={describe('keluhanDetail')}
                      className={fieldClass}
                    />
                    <p className="text-right text-xs text-muted-foreground" aria-live="polite">
                      {values.keluhanDetail.length} / {FREE_SESSION_MAX_DETAIL_LENGTH}
                    </p>
                  </Field>

                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-start gap-3 text-sm text-secondary">
                      <input
                        id="agreed"
                        type="checkbox"
                        checked={values.agreed}
                        onChange={(event) => update('agreed', event.target.checked)}
                        aria-invalid={Boolean(errors.agreed)}
                        aria-describedby={describe('agreed')}
                        className="mt-1 size-4 accent-primary"
                      />
                      <span>
                        Saya setuju dihubungi oleh tim Attentive terkait proses sesi gratis ini.{' '}
                        <span aria-hidden="true" className="text-destructive">*</span>
                      </span>
                    </label>
                    {errors.agreed ? (
                      <p id="agreed-error" role="alert" className="text-sm font-medium text-destructive">
                        {errors.agreed}
                      </p>
                    ) : null}
                  </div>

                  {formError ? (
                    <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                      {formError}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Mengirim…' : 'Daftar sesi gratis'}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    Setelah mengirim form, kamu akan diarahkan ke WhatsApp Attentive untuk konfirmasi.
                  </p>
                </div>
              ) : null}
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
