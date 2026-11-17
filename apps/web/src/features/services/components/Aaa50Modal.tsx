import { AlertCircle, ArrowLeft, ArrowRight, Check, Copy, ExternalLink, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  AAA50_DATASET,
  buildAaa50Flow,
  buildAaa50WhatsAppUrl,
  countAaa50Answered,
  formatAaa50Message,
  getAaa50Options,
  getAaa50RequiredTotal,
  getCognitiveReportImageUrl,
  isAaa50Answered,
  toggleAaa50MultiOption,
  type Aaa50Answers,
} from '@attentiveid/shared'

export interface Aaa50ModalProps {
  open: boolean
  locale: 'id' | 'en'
  whatsappNumber?: string
  answers: Aaa50Answers
  onChangeAnswers: (next: Aaa50Answers) => void
  onClearAnswers: () => void
  onClose: () => void
  onOpenReportZoom?: (url: string, caption: string) => void
}

export function Aaa50Modal({
  open,
  locale,
  whatsappNumber = '6285156410912',
  answers,
  onChangeAnswers,
  onClearAnswers,
  onClose,
  onOpenReportZoom,
}: Aaa50ModalProps) {
  const isEn = locale === 'en'
  const flow = useMemo(() => buildAaa50Flow(), [])
  const [stepIndex, setStepIndex] = useState<number>(-1)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const currentStep = stepIndex >= 0 ? flow[stepIndex] : null
  const totalItems = AAA50_DATASET.items.length
  const answeredCount = countAaa50Answered(answers)
  const requiredTotal = getAaa50RequiredTotal()

  let progressPct = 0
  let counterLabel = ''
  if (currentStep?.kind === 'intro') {
    const completedItemsBefore = AAA50_DATASET.items.filter((item) => {
      const idx = AAA50_DATASET.sections.findIndex((sec) => sec.id === item.sec)
      return idx < currentStep.sectionIndex
    }).length
    progressPct = Math.round((completedItemsBefore / totalItems) * 100)
  } else if (currentStep?.kind === 'item') {
    progressPct = Math.round(((currentStep.item.n - 1) / totalItems) * 100)
    counterLabel = `${currentStep.item.n} ${isEn ? 'of' : 'dari'} ${totalItems}`
  } else if (currentStep?.kind === 'done') {
    progressPct = 100
  }

  const handleSelectOption = (item: (typeof AAA50_DATASET.items)[number], optionValue: string | number) => {
    if (item.type === 'multi') {
      const next = toggleAaa50MultiOption(answers[item.n], item, optionValue)
      onChangeAnswers({ ...answers, [item.n]: next })
      return
    }
    onChangeAnswers({ ...answers, [item.n]: optionValue })
    setStepIndex((prev) => Math.min(flow.length - 1, prev + 1))
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatAaa50Message(answers, locale))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  }

  const handleClearAll = () => {
    onClearAnswers()
    setStepIndex(-1)
  }

  const sampleAaaReport = getCognitiveReportImageUrl('aaa50', locale)
  const sampleCaption = isEn ? 'AAA-50 Sample Report Section' : 'Contoh Bagian Laporan AAA-50'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? 'AAA-50 Questionnaire' : 'Kuesioner AAA-50'}
      className="fixed inset-0 z-50 flex flex-col bg-[#fbf8f2] text-[#142b51]"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#dedede] bg-[#142b51] px-4 py-3 text-[#f5edd4] sm:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#d6a74d] px-3 py-0.5 text-xs font-extrabold text-[#142b51]">
            AAA-50
          </span>
          {counterLabel && (
            <span className="text-xs font-bold tabular-nums text-[#f5edd4]/85">{counterLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {answeredCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-lg border border-[#f5edd4]/25 px-2.5 py-1 text-[11px] font-bold text-[#f5edd4]/90 hover:bg-[#f5edd4]/10"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? 'Clear answers' : 'Hapus jawaban'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg border border-[#f5edd4]/25 px-3 py-1.5 text-xs font-bold text-[#f5edd4] hover:bg-[#f5edd4]/10"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isEn ? 'Close' : 'Tutup'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPct}
        aria-label={isEn ? 'Questionnaire progress' : 'Progres kuesioner'}
        className="h-1.5 w-full bg-[#ebe6d9]"
      >
        <div
          className="h-full bg-[#d6a74d] transition-[width] duration-200"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {stepIndex < 0 && (
            <div className="rounded-2xl border border-[#dedede] bg-white p-6 shadow-[0_8px_24px_rgba(20,43,81,0.08)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#8c6a22]">
                {isEn
                  ? 'Everyday cognition profile · about 12 minutes'
                  : 'Profil kognisi sehari-hari · sekitar 12 menit'}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#142b51]">
                {isEn ? 'AAA-50 Self-Report Questionnaire' : 'Kuesioner AAA-50'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4b5b78]">
                {isEn
                  ? 'This questionnaire asks how your attention, organisation, and self-control operate in daily life, including since childhood.'
                  : 'Kuesioner ini menanyakan bagaimana perhatian, keteraturan, dan kontrol diri Anda berjalan dalam kehidupan sehari-hari, termasuk sejak masa kecil.'}
              </p>
              <ul className="mt-4 space-y-2 rounded-xl border border-[#ebe6d9] bg-[#fbf8f2] p-4 text-xs leading-relaxed text-[#4b5b78]">
                <li>
                  •{' '}
                  {isEn
                    ? '50 questions across 6 sections, presented one question per screen.'
                    : '50 pertanyaan dalam enam bagian, satu pertanyaan per layar.'}
                </li>
                <li>
                  •{' '}
                  {isEn
                    ? 'No automated scoring or clinical norms are computed in your browser.'
                    : 'Tidak ada scoring otomatis di perangkat ini. Laporan disusun langsung oleh psikolog.'}
                </li>
                <li>
                  •{' '}
                  {isEn
                    ? 'Strict privacy: answers stay ONLY in active page memory and clear immediately when you leave or close this tab.'
                    : 'Privasi ketat: jawaban hanya ada di memori halaman aktif dan langsung hilang saat halaman ditutup atau dihapus.'}
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStepIndex(0)}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#d6a74d] px-6 py-2.5 text-sm font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
                >
                  <span>
                    {answeredCount > 0
                      ? isEn
                        ? `Continue (${answeredCount}/${requiredTotal})`
                        : `Lanjutkan (${answeredCount}/${requiredTotal})`
                      : isEn
                        ? 'Start questionnaire'
                        : 'Mulai kuesioner'}
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {currentStep?.kind === 'intro' && (
            <div className="rounded-2xl border border-[#dedede] bg-white p-6 text-center shadow-[0_8px_24px_rgba(20,43,81,0.08)] sm:p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142b51] text-lg font-extrabold text-[#d6a74d]">
                {currentStep.section.id}
              </div>
              <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-[#8c6a22]">
                {isEn
                  ? `Part ${currentStep.sectionIndex + 1} of 6 · ${currentStep.itemCount} questions`
                  : `Bagian ${currentStep.sectionIndex + 1} dari 6 · ${currentStep.itemCount} pertanyaan`}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#142b51]">
                {isEn ? currentStep.section.title[1] : currentStep.section.title[0]}
              </h2>
              <p className="mt-3 text-sm text-[#4b5b78]">
                {isEn ? currentStep.section.hint[1] : currentStep.section.hint[0]}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setStepIndex((prev) => Math.max(-1, prev - 1))}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-[#dedede] px-4 py-2 text-xs font-bold text-[#142b51] hover:bg-[#fbf8f2]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isEn ? 'Previous' : 'Sebelumnya'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStepIndex((prev) => prev + 1)}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-[#d6a74d] px-5 py-2 text-xs font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
                >
                  <span>{isEn ? 'Start this part' : 'Mulai bagian ini'}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {currentStep?.kind === 'item' && (
            <div className="rounded-2xl border border-[#dedede] bg-white p-6 shadow-[0_8px_24px_rgba(20,43,81,0.08)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#8c6a22]">
                AAA-50 · {isEn ? 'Part' : 'Bagian'} {currentStep.section.id} ·{' '}
                {isEn ? currentStep.section.title[1] : currentStep.section.title[0]}
              </p>

              {currentStep.item.type === 'text' ? (
                <div className="mt-3">
                  <label htmlFor="aaa50-text-answer" className="block text-lg font-bold text-[#142b51]">
                    {isEn ? currentStep.item.en : currentStep.item.id}
                  </label>
                  <textarea
                    id="aaa50-text-answer"
                    maxLength={600}
                    rows={4}
                    value={typeof answers[currentStep.item.n] === 'string' ? (answers[currentStep.item.n] as string) : ''}
                    onChange={(e) =>
                      onChangeAnswers({ ...answers, [currentStep.item.n]: e.target.value })
                    }
                    className="mt-3 w-full rounded-xl border border-[#dedede] bg-[#fbf8f2] p-3 text-sm text-[#142b51] focus:border-[#142b51] focus:outline-none"
                    placeholder={
                      isEn ? 'Optional concise note...' : 'Boleh singkat atau kosongkan...'
                    }
                  />
                  <p className="mt-1.5 text-xs text-[#4b5b78]">
                    {isEn
                      ? 'Keep it short, or leave it empty. If you do not remember, write "don\'t remember".'
                      : 'Boleh singkat dan boleh dikosongkan. Bila tidak ingat, tulis "tidak ingat".'}
                  </p>
                </div>
              ) : (
                <fieldset className="mt-3">
                  <legend className="text-lg font-bold leading-snug text-[#142b51]">
                    {isEn ? currentStep.item.en : currentStep.item.id}
                  </legend>
                  {currentStep.item.type === 'multi' && (
                    <p className="mt-1 text-xs text-[#4b5b78]">
                      {isEn ? 'You may choose more than one.' : 'Boleh pilih lebih dari satu.'}
                    </p>
                  )}
                  <div className="mt-4 space-y-2">
                    {getAaa50Options(currentStep.item).map((opt, idx) => {
                      const val = answers[currentStep.item.n]
                      const selected = Array.isArray(val) ? val.includes(opt[0]) : val === opt[0]
                      return (
                        <button
                          key={opt[0]}
                          type="button"
                          role={currentStep.item.type === 'multi' ? 'checkbox' : 'radio'}
                          aria-checked={selected}
                          onClick={() => handleSelectOption(currentStep.item, opt[0])}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                            selected
                              ? 'border-[#142b51] bg-[#142b51] font-bold text-[#f5edd4]'
                              : 'border-[#dedede] bg-[#fbf8f2] font-medium text-[#142b51] hover:border-[#8c6a22]'
                          }`}
                        >
                          <kbd
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold ${
                              selected
                                ? 'bg-[#d6a74d] text-[#142b51]'
                                : 'border border-[#dedede] bg-white text-[#4b5b78]'
                            }`}
                          >
                            {idx + 1}
                          </kbd>
                          <span className="flex-1">{isEn ? opt[2] : opt[1]}</span>
                          {selected && <Check className="h-4 w-4 shrink-0 text-[#d6a74d]" />}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStepIndex((prev) => Math.max(-1, prev - 1))}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-[#dedede] px-4 py-2 text-xs font-bold text-[#142b51] hover:bg-[#fbf8f2]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isEn ? 'Previous' : 'Sebelumnya'}</span>
                </button>
                <button
                  type="button"
                  disabled={!isAaa50Answered(currentStep.item, answers[currentStep.item.n])}
                  onClick={() => setStepIndex((prev) => Math.min(flow.length - 1, prev + 1))}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-[#d6a74d] px-5 py-2 text-xs font-extrabold text-[#142b51] hover:bg-[#e1b55d] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <span>{isEn ? 'Next' : 'Lanjut'}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {currentStep?.kind === 'done' && (
            <div className="rounded-2xl border border-[#dedede] bg-white p-6 shadow-[0_8px_24px_rgba(20,43,81,0.08)] sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#2c7a57]">
                {isEn ? 'Questionnaire complete' : 'Kuesioner selesai'}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#142b51]">
                {isEn ? 'Thank you, your answers are ready' : 'Terima kasih, jawaban Anda lengkap'}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5b78]">
                {isEn
                  ? 'The AAA-50 clinical report is prepared by a psychologist after service payment. Send your answers to our admin via WhatsApp or copy them below.'
                  : 'Laporan AAA-50 disusun dan dibahas psikolog setelah pembayaran layanan. Kirim jawaban Anda ke admin lewat WhatsApp atau salin jawaban di bawah.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <a
                  href={buildAaa50WhatsAppUrl(whatsappNumber, answers, locale)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d6a74d] px-5 py-2.5 text-sm font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
                >
                  <span>
                    {isEn ? 'Send answers to admin via WhatsApp' : 'Kirim jawaban ke admin via WhatsApp'}
                  </span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-[#dedede] px-4 py-2.5 text-xs font-bold text-[#142b51] hover:bg-[#fbf8f2]"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{copied ? (isEn ? 'Copied!' : 'Tersalin!') : isEn ? 'Copy answers' : 'Salin jawaban'}</span>
                </button>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#ebe6d9] bg-[#fbf8f2] p-3 text-xs text-[#4b5b78]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8c6a22]" />
                <span>
                  {isEn
                    ? 'Nothing is sent until you tap WhatsApp, and answers are automatically erased from memory when you leave.'
                    : 'Jawaban tidak dikirim otomatis dan akan terhapus dari memori perangkat saat Anda meninggalkan halaman atau menghapus jawaban.'}
                </span>
              </div>

              <div className="mt-5 rounded-xl border border-[#ebe6d9] p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8c6a22]">
                  {sampleCaption}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenReportZoom?.(sampleAaaReport, sampleCaption)}
                  className="mt-2 block w-full cursor-pointer overflow-hidden rounded-lg border border-[#dedede]"
                >
                  <img
                    src={sampleAaaReport}
                    alt={sampleCaption}
                    width={1200}
                    height={850}
                    className="max-h-48 w-full object-cover object-top"
                  />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-[#dedede] px-4 py-2 text-xs font-bold text-[#142b51]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isEn ? 'Review answers' : 'Periksa jawaban'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {isEn ? 'Delete answers from this device' : 'Hapus jawaban dari perangkat ini'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
