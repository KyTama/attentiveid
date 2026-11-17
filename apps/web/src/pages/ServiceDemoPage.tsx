import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  Maximize2,
  Play,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import {
  COGNITIVE_REPORT_GALLERY,
  COGNITIVE_TASK_DEFINITIONS,
  COGNITIVE_TASK_KEYS,
  countAaa50Answered,
  getAaa50RequiredTotal,
  getCognitiveReportImageUrl,
  type Aaa50Answers,
  type CognitiveTaskKey,
  type CognitiveTaskSummary,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { Aaa50Modal } from '@/features/services/components/Aaa50Modal'
import { CognitiveTaskModal } from '@/features/services/components/CognitiveTaskModal'
import { ServiceTopbar } from '@/features/services/components/ServiceTopbar'

export function ServiceDemoPage() {
  const { slug } = useParams<{ slug?: string }>()
  const { i18n } = useTranslation()
  const locale: 'id' | 'en' = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'id'
  const isEn = locale === 'en'
  const reduceMotion = useReducedMotion()

  const serviceSlug = slug || 'profil-kognitif-lengkap'

  // Strict privacy: task summaries and AAA-50 answers reside strictly in active React memory
  const [activeTask, setActiveTask] = useState<CognitiveTaskKey | null>(null)
  const [taskResults, setTaskResults] = useState<Partial<Record<CognitiveTaskKey, CognitiveTaskSummary>>>({})
  const [aaaOpen, setAaaOpen] = useState(false)
  const [aaaAnswers, setAaaAnswers] = useState<Aaa50Answers>({})
  const [zoomMedia, setZoomMedia] = useState<{ url: string; caption: string } | null>(null)

  useEffect(() => {
    document.title = isEn
      ? 'Cognitive Tasks & AAA-50 Try-It Demo | Attentive.id'
      : 'Demo Tugas Kognitif & Kuesioner AAA-50 | Attentive.id'
  }, [isEn])

  // Clear ephemeral cognitive & questionnaire state when leaving page
  useEffect(() => {
    return () => {
      setAaaAnswers({})
      setTaskResults({})
    }
  }, [])

  const aaaAnsweredCount = countAaa50Answered(aaaAnswers)
  const aaaRequiredTotal = getAaa50RequiredTotal()

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#142b51] flex flex-col">
      <ServiceTopbar
        locale={locale}
        onLocaleChange={(next) => void i18n.changeLanguage(next)}
        activeRoute="demo"
      />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-7 sm:px-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-[#4b5b78]">
          <Link to="/" className="hover:text-[#142b51] hover:underline">
            {isEn ? 'Home' : 'Beranda'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link to="/services" className="hover:text-[#142b51] hover:underline">
            {isEn ? 'All Services' : 'Semua Layanan'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link to={`/services/${serviceSlug}`} className="hover:text-[#142b51] hover:underline">
            {isEn ? 'Full Cognitive Profile' : 'Profil Kognitif Lengkap'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-bold text-[#142b51]">{isEn ? 'Try Demo' : 'Coba Demo'}</span>
        </nav>

        {/* Header */}
        <header className="rounded-2xl border border-[#dedede] bg-white p-6 shadow-[0_6px_18px_rgba(20,43,81,0.06)] sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e4f2ea] px-3 py-1 text-xs font-extrabold text-[#2c7a57]">
            <Brain className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isEn ? 'Free interactive try-it' : 'Coba gratis'}</span>
          </div>
          <h1
            data-route-heading
            tabIndex={-1}
            className="mt-3 text-2xl font-extrabold text-[#142b51] outline-none sm:text-3xl"
          >
            {isEn
              ? 'Try the Attentive Cognitive Tasks & AAA-50'
              : 'Coba Tugas Kognitif Lengkap & Kuesioner AAA-50'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#4b5b78] sm:text-base">
            {isEn
              ? 'Experience 30-second practice versions of the four cognitive tasks used in our clinical assessment, preview sample reports, or complete the AAA-50 everyday self-report.'
              : 'Rasakan versi latihan singkat (~30 detik) dari keempat tugas kognitif yang dipakai saat asesmen, lihat contoh laporan hasilnya, atau coba isi kuesioner AAA-50.'}
          </p>

          <ul className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-[#4b5b78]">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf8f2] px-3 py-1.5 border border-[#ebe6d9]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2c7a57]" aria-hidden="true" />
              <span>
                {isEn
                  ? 'Zero analytics tracking & nothing stored on server'
                  : 'Tanpa tracking & tidak ada data yang disimpan di server'}
              </span>
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf8f2] px-3 py-1.5 border border-[#ebe6d9]">
              <span>
                {isEn
                  ? 'Desktop keyboard recommended; touch tap supported on mobile'
                  : 'Nyaman pakai keyboard laptop; di HP cukup ketuk layar'}
              </span>
            </li>
          </ul>
        </header>

        {/* 4 Cognitive Tasks Grid */}
        <section aria-labelledby="demo-tasks-heading" className="mt-7">
          <h2 id="demo-tasks-heading" className="text-lg font-extrabold text-[#142b51]">
            {isEn ? '1. Four Cognitive Tasks (~30s each)' : '1. Empat Tugas Kognitif (~30 detik per tugas)'}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {COGNITIVE_TASK_KEYS.map((key, idx) => {
              const def = COGNITIVE_TASK_DEFINITIONS[key]
              const res = taskResults[key]
              const reportUrl = getCognitiveReportImageUrl(def.reportKey, locale)
              const reportCap = isEn ? `${def.name[1]} sample report` : `Contoh laporan ${def.name[0]}`
              return (
                <motion.article
                  key={key}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...INTERACTIVE_SPRING, delay: idx * 0.04 }}
                  className="flex flex-col justify-between rounded-2xl border border-[#dedede] bg-white p-5 shadow-[0_6px_18px_rgba(20,43,81,0.06)]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#142b51] text-xs font-extrabold text-[#d6a74d]">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="text-base font-extrabold text-[#142b51]">
                            {isEn ? def.name[1] : def.name[0]}
                          </h3>
                          <p className="text-xs font-medium text-[#4b5b78]">
                            {isEn ? def.domain[1] : def.domain[0]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mini Visual Stimulus Tile */}
                    <div
                      aria-hidden="true"
                      className="mt-4 flex h-24 items-center justify-center rounded-xl bg-[#0d1f3d] text-[#f5edd4]"
                    >
                      {key === 'cpt' && <span className="text-4xl font-black tracking-widest">X</span>}
                      {key === 'nb' && (
                        <div className="flex items-center gap-3 text-xl font-extrabold">
                          <span className="text-[#f5edd4]/50">T</span>
                          <span className="text-[#f5edd4]/50">K</span>
                          <span className="rounded-lg bg-[#d6a74d]/20 px-2.5 py-0.5 text-[#d6a74d]">T</span>
                        </div>
                      )}
                      {key === 'gng' && (
                        <div className="flex items-center gap-4">
                          <span className="h-9 w-9 rounded-full bg-emerald-500" />
                          <span className="h-8 w-8 rounded-lg bg-rose-500" />
                        </div>
                      )}
                      {key === 'sst' && (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-red-500">
                          <ArrowRight className="h-6 w-6 text-[#f5edd4]" />
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-[#4b5b78]">
                      {isEn ? def.short[1] : def.short[0]}
                    </p>

                    {res && (
                      <p className="mt-2.5 rounded-lg bg-[#e4f2ea] px-3 py-1.5 text-xs font-bold tabular-nums text-[#2c7a57]">
                        {res.ok}/{res.tot} {isEn ? 'correct responses' : 'respons tepat'}
                        {res.rt !== null ? ` · ${res.rt} ms` : ''}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTask(key)}
                      className={`inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold ${
                        res
                          ? 'border border-[#142b51] bg-white text-[#142b51] hover:bg-[#fbf8f2]'
                          : 'bg-[#d6a74d] text-[#142b51] hover:bg-[#e1b55d]'
                      }`}
                    >
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>
                        {res
                          ? isEn
                            ? 'Try again'
                            : 'Coba lagi'
                          : isEn
                            ? 'Try 30s practice'
                            : 'Coba 30 detik'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomMedia({ url: reportUrl, caption: reportCap })}
                      className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-[#dedede] px-3 py-2 text-xs font-bold text-[#4b5b78] hover:border-[#142b51] hover:text-[#142b51]"
                    >
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isEn ? 'Sample report' : 'Contoh laporan'}</span>
                    </button>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        {/* AAA-50 Questionnaire Section */}
        <section
          aria-labelledby="aaa50-section-heading"
          className="mt-8 flex flex-col justify-between gap-5 rounded-2xl border border-[#d6a74d]/50 bg-[#fffdf7] p-6 shadow-xs sm:flex-row sm:items-center"
        >
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5edd4] px-3 py-0.5 text-[11px] font-extrabold text-[#8c6a22]">
              <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? 'Ready to complete directly' : 'Bisa langsung diisi'}</span>
            </span>
            <h2 id="aaa50-section-heading" className="mt-2 text-xl font-extrabold text-[#142b51]">
              {isEn ? '2. AAA-50 Self-Report Questionnaire' : '2. Kuesioner AAA-50'}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#4b5b78]">
              {isEn
                ? '50 questions covering attention, daily organisation, impulse control, childhood history, and real-life impact (~12 minutes). Psychological interpretation is completed after booking & payment.'
                : '50 pertanyaan tentang perhatian, keteraturan, kontrol diri, riwayat masa kecil, dan dampaknya sehari-hari (sekitar 12 menit). Laporan disusun psikolog setelah layanan dibayar melalui admin.'}
            </p>
            {aaaAnsweredCount > 0 && (
              <p className="mt-2 text-xs font-bold tabular-nums text-[#2c7a57]">
                {aaaAnsweredCount}/{aaaRequiredTotal}{' '}
                {isEn ? 'choice items answered in memory' : 'pertanyaan pilihan sudah dijawab (in-memory)'}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setAaaOpen(true)}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#d6a74d] px-5 py-2.5 text-sm font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
            >
              <span>
                {aaaAnsweredCount > 0
                  ? isEn
                    ? 'Continue questionnaire'
                    : 'Lanjutkan kuesioner'
                  : isEn
                    ? 'Fill questionnaire'
                    : 'Isi kuesioner'}
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Simulated Sample Report Gallery */}
        <section aria-labelledby="demo-report-heading" className="mt-8 rounded-2xl border border-[#dedede] bg-white p-6">
          <h2 id="demo-report-heading" className="text-lg font-extrabold text-[#142b51]">
            {isEn ? '3. Simulated Sample Report Gallery' : '3. Galeri Contoh Laporan (Data Simulasi)'}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#4b5b78]">
            {isEn
              ? 'Simulated participant data scored identically to our clinical pipeline. Tap any panel to inspect.'
              : 'Laporan peserta dengan data simulasi, dihitung dengan cara yang sama seperti tes sungguhan. Bukan hasil orang nyata. Ketuk gambar untuk memperbesar.'}
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COGNITIVE_REPORT_GALLERY.map((panel) => {
              const url = getCognitiveReportImageUrl(panel.key, locale)
              const caption = isEn ? panel.caption[1] : panel.caption[0]
              return (
                <button
                  key={panel.key}
                  type="button"
                  onClick={() => setZoomMedia({ url, caption })}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-[#ebe6d9] bg-[#fbf8f2] text-left transition-colors hover:border-[#d6a74d]"
                >
                  <div className="aspect-[16/11] w-full overflow-hidden">
                    <img
                      src={url}
                      alt={caption}
                      width={panel.width}
                      height={panel.height}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold text-[#142b51]">
                    <span className="truncate">{caption}</span>
                    <Maximize2 className="h-3.5 w-3.5 shrink-0 text-[#8c6a22]" aria-hidden="true" />
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-[#142b51] p-6 text-[#f5edd4] sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-extrabold text-[#f5edd4]">
              {isEn ? 'Ready for the full clinical assessment?' : 'Siap mengerjakan versi lengkapnya?'}
            </h2>
            <p className="mt-1 text-xs text-[#f5edd4]/80">
              {isEn
                ? 'Full test session takes ~50–60 minutes, followed by a dedicated review session with a psychologist.'
                : 'Sesi tes lengkap sekitar 50–60 menit, lalu hasilnya dibahas bersama psikolog klinis.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to={`/services/${serviceSlug}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#d6a74d] px-4 py-2 text-xs font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? 'View packages & pricing' : 'Lihat paket dan harga'}</span>
            </Link>
            <a
              href="https://wa.me/6285156410912"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#f5edd4]/30 px-4 py-2 text-xs font-bold text-[#f5edd4] hover:bg-[#f5edd4]/10"
            >
              <span>{isEn ? 'Ask Admin on WhatsApp' : 'Tanya admin via WhatsApp'}</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <CognitiveTaskModal
        taskKey={activeTask}
        locale={locale}
        onClose={() => setActiveTask(null)}
        onSelectTask={(nextKey) => setActiveTask(nextKey)}
        onComplete={(key, summary) =>
          setTaskResults((prev) => ({
            ...prev,
            [key]: summary,
          }))
        }
        onOpenReportZoom={(url, caption) => setZoomMedia({ url, caption })}
      />

      <Aaa50Modal
        open={aaaOpen}
        locale={locale}
        answers={aaaAnswers}
        onChangeAnswers={setAaaAnswers}
        onClearAnswers={() => setAaaAnswers({})}
        onClose={() => setAaaOpen(false)}
        onOpenReportZoom={(url, caption) => {
          setAaaOpen(false)
          setZoomMedia({ url, caption })
        }}
      />

      {/* Lightbox Zoom */}
      {zoomMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoomMedia.caption}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomMedia(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomMedia(null)}
              aria-label={isEn ? 'Close preview' : 'Tutup pratinjau'}
              className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#142b51] text-[#f5edd4] shadow-md"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={zoomMedia.url}
              alt={zoomMedia.caption}
              width={1200}
              height={850}
              className="max-h-[82vh] w-auto rounded-xl object-contain"
            />
            <p className="mt-2 px-1 text-xs font-bold text-[#142b51]">{zoomMedia.caption}</p>
          </div>
        </div>
      )}
    </div>
  )
}
