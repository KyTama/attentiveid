import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FEEDBACK_FILE_TYPES,
  FEEDBACK_MAX_FILES,
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_NAME_MAX,
  FEEDBACK_PAGE_MAX,
  feedbackFilesProblem,
  validateFeedback,
  type FeedbackErrors,
  type FeedbackKind,
} from '@attentiveid/shared'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { sendFeedback } from '@/features/feedback/service'
import { useTx } from '@/features/i18n/use-tx'

const fieldClass =
  'mt-1.5 block w-full rounded-lg border border-secondary/20 bg-white px-4 py-3 text-base text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-sm'

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-rose-700">{error}</span>}
    </label>
  )
}

/** Anyone can report a bug or suggest something about the website. */
export function FeedbackPage() {
  const { tx, isEn } = useTx()
  const [params] = useSearchParams()
  const from = params.get('from') ?? ''
  const [kind, setKind] = useState<FeedbackKind>('bug')
  const [name, setName] = useState('')
  const [page, setPage] = useState(from.startsWith('/') && from !== '/feedback' ? from.slice(0, FEEDBACK_PAGE_MAX) : '')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<FeedbackErrors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'rateLimited'>('idle')

  const title = tx('Laporkan bug atau beri saran', 'Report a bug or suggest something')

  useEffect(() => {
    const previous = document.title
    document.title = `${title} — Attentive`
    return () => {
      document.title = previous
    }
  }, [title])

  const fileProblem = feedbackFilesProblem(files)
  const fileProblemText = {
    count: tx(`Maksimal ${FEEDBACK_MAX_FILES} berkas.`, `At most ${FEEDBACK_MAX_FILES} files.`),
    type: tx('Jenis berkas tidak didukung.', 'This file type is not supported.'),
    empty: tx('Ada berkas yang kosong.', 'A file is empty.'),
    size: tx('Satu berkas maksimal 5 MB.', 'Each file can be up to 5 MB.'),
    total: tx('Total semua berkas maksimal 7 MB.', 'All files together can be up to 7 MB.'),
  }

  // The shared rules answer in Indonesian; say the same in English when the page is in English.
  const shown = (field: keyof FeedbackErrors) => {
    if (!errors[field]) return undefined
    if (!isEn) return errors[field]
    return { kind: 'Choose a type.', name: 'Please write your name (2 to 80 characters).', message: 'Please write 10 to 2000 characters.', page: 'Too long.', files: 'These files could not be accepted. Check their type and size.' }[field]
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const values = { kind, name, message, page }
    const checked = validateFeedback(values)
    if (fileProblem) return
    if (!checked.ok) {
      setErrors(checked.errors)
      return
    }
    setErrors({})
    setState('sending')
    const result = await sendFeedback({ ...checked.value, website }, files)
    if (result.status === 'success') return setState('sent')
    if (result.status === 'invalid') setErrors(result.errors)
    setState(result.status === 'invalid' ? 'idle' : result.status)
  }

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-12">
        <h1 className="text-2xl font-bold sm:text-3xl" data-route-heading tabIndex={-1}>{title}</h1>

        {state === 'sent' ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900" role="status">
            <p className="font-semibold">{tx('Terima kasih, laporanmu sudah terkirim.', 'Thank you, your report has been sent.')}</p>
            <button
              className="mt-3 cursor-pointer text-sm font-semibold underline"
              onClick={() => {
                setMessage('')
                setFiles([])
                setState('idle')
              }}
              type="button"
            >
              {tx('Kirim laporan lain', 'Send another')}
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-secondary/75">
              {tx(
                'Ada yang rusak atau bisa dibuat lebih baik di website ini? Tulis di sini. Jangan menulis data kesehatan atau kata sandi. Untuk jadwal konsultasi, hubungi kami lewat WhatsApp.',
                'Is something broken, or could the website be better? Tell us here. Do not write health information or passwords. For appointments, contact us on WhatsApp.',
              )}
            </p>
            <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
              <fieldset>
                <legend className="text-sm font-semibold">{tx('Jenis', 'Type')}</legend>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {([['bug', tx('Ada bug / error', 'Bug or error')], ['suggestion', tx('Saran', 'Suggestion')]] as const).map(([value, label]) => (
                    <label
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                        kind === value ? 'border-secondary bg-secondary text-white' : 'border-secondary/20 bg-white'
                      }`}
                      key={value}
                    >
                      <input checked={kind === value} className="sr-only" name="kind" onChange={() => setKind(value)} type="radio" value={value} />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field error={shown('name')} label={tx('Nama', 'Name')}>
                <input autoComplete="name" className={fieldClass} maxLength={FEEDBACK_NAME_MAX} onChange={(e) => setName(e.target.value)} required value={name} />
              </Field>
              <Field error={shown('page')} label={tx('Halaman mana? (boleh dikosongkan)', 'Which page? (optional)')}>
                <input className={fieldClass} maxLength={FEEDBACK_PAGE_MAX} onChange={(e) => setPage(e.target.value)} placeholder="/psychologists" value={page} />
              </Field>
              <Field error={shown('message')} label={tx('Ceritakan', 'What happened, or your idea')}>
                <textarea className={`${fieldClass} min-h-36`} maxLength={FEEDBACK_MESSAGE_MAX} onChange={(e) => setMessage(e.target.value)} required value={message} />
              </Field>

              <Field
                error={(fileProblem && fileProblemText[fileProblem]) || shown('files')}
                label={tx('Lampiran (boleh dikosongkan)', 'Attachments (optional)')}
              >
                <input
                  accept={Object.keys(FEEDBACK_FILE_TYPES).map((extension) => `.${extension}`).join(',')}
                  className={`${fieldClass} file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white`}
                  multiple
                  onChange={(e) => {
                    setFiles(Array.from(e.target.files ?? []))
                    setErrors((current) => ({ ...current, files: undefined }))
                  }}
                  type="file"
                />
                <span className="mt-1 block text-xs font-normal text-secondary/70">
                  {tx(
                    'Maks 3 berkas, 5 MB per berkas, total 7 MB: gambar, PDF, video MP4/MOV, Word, Excel, PowerPoint, TXT. Jangan unggah data klien.',
                    'Up to 3 files, 5 MB each, 7 MB together: images, PDF, MP4/MOV video, Word, Excel, PowerPoint, TXT. Do not upload client data.',
                  )}
                </span>
              </Field>

              {/* Honeypot: real people never see or fill this. */}
              <input aria-hidden="true" autoComplete="off" className="hidden" name="website" onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} value={website} />

              {(state === 'failed' || state === 'rateLimited') && (
                <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
                  {state === 'rateLimited'
                    ? tx('Terlalu banyak kiriman. Coba lagi beberapa menit lagi.', 'Too many reports in a short time. Try again in a few minutes.')
                    : tx('Belum terkirim. Tulisanmu masih ada, coba lagi.', 'Not sent. Your text is still here, please try again.')}
                </p>
              )}

              <button
                className="w-full cursor-pointer rounded-full bg-primary px-5 py-3.5 font-bold text-secondary outline-none hover:bg-[#ffcf4d] focus-visible:ring-2 focus-visible:ring-secondary disabled:opacity-60"
                disabled={state === 'sending'}
                type="submit"
              >
                {state === 'sending' ? tx('Mengirim...', 'Sending...') : tx('Kirim', 'Send')}
              </button>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
