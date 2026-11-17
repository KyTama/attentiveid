import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BOOKING_WHATSAPP_NUMBERS,
  matchServicesForNeed,
  scoreServiceAssistantQuery,
  SERVICE_ASSISTANT_FLOW,
  type PublicServiceSummary,
  type ServiceModality,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { formatServicePriceDisplay } from '../service'

export interface ServiceAssistantModalProps {
  open: boolean
  onClose: () => void
  services: readonly PublicServiceSummary[]
  locale: 'id' | 'en'
}

export function ServiceAssistantModal({
  open,
  onClose,
  services,
  locale,
}: ServiceAssistantModalProps) {
  const isEn = locale === 'en'
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Strictly in-memory React state: never persisted to localStorage/sessionStorage or analytics.
  const [query, setQuery] = useState('')
  const [audienceId, setAudienceId] = useState<string | null>(null)
  const [areaId, setAreaId] = useState<string | null>(null)
  const [needId, setNeedId] = useState<string | null>(null)
  const [modality, setModality] = useState<ServiceModality | 'all'>('all')
  const [malangOnly, setMalangOnly] = useState(false)

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const resetChooser = () => {
    setQuery('')
    setAudienceId(null)
    setAreaId(null)
    setNeedId(null)
    setModality('all')
    setMalangOnly(false)
  }

  const availableAreas = useMemo(() => {
    if (!audienceId) return []
    const areaIdsForAudience = new Set(
      SERVICE_ASSISTANT_FLOW.needs
        .filter((n) => (n.audiences as readonly string[]).includes(audienceId))
        .map((n) => n.areaId),
    )
    return SERVICE_ASSISTANT_FLOW.areas.filter((a) => areaIdsForAudience.has(a.id))
  }, [audienceId])

  const availableNeeds = useMemo(() => {
    if (!audienceId || !areaId) return []
    return SERVICE_ASSISTANT_FLOW.needs.filter(
      (n) => (n.audiences as readonly string[]).includes(audienceId) && n.areaId === areaId,
    )
  }, [audienceId, areaId])

  const queryResult = useMemo(
    () =>
      scoreServiceAssistantQuery(query, services, locale, {
        modality,
        malangOnly,
      }),
    [query, services, locale, modality, malangOnly],
  )

  const guidedMatches = useMemo(() => {
    if (!needId) return []
    return matchServicesForNeed(services, { needId, modality, malangOnly })
  }, [services, needId, modality, malangOnly])

  const selectedNeed = needId
    ? SERVICE_ASSISTANT_FLOW.needs.find((n) => n.id === needId)
    : undefined

  const recommendations = query.trim() ? queryResult.matches : guidedMatches

  // Safe non-sensitive WhatsApp link: uses only predefined need label, never free-text user narrative.
  const safeWhatsAppHref = useMemo(() => {
    const topicLabel = selectedNeed
      ? selectedNeed.label[locale]
      : isEn
        ? 'finding the right psychological service'
        : 'mencari layanan psikologi yang sesuai'
    const text = isEn
      ? `Hello Attentive Admin, I would like help choosing a service for: ${topicLabel}. Thank you.`
      : `Halo Admin Attentive, saya sedang mencari layanan untuk kebutuhan: ${topicLabel}. Mohon dibantu informasinya. Terima kasih.`
    const targetNumber = malangOnly
      ? BOOKING_WHATSAPP_NUMBERS.malang
      : BOOKING_WHATSAPP_NUMBERS.pusat
    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`
  }, [selectedNeed, locale, isEn, malangOnly])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-assistant-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0d1f3d]/65 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={INTERACTIVE_SPRING}
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#dedede] bg-[#fbf8f2] text-[#142b51] shadow-[0_24px_60px_rgba(13,31,61,0.32)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#ebe6d9] bg-[#142b51] px-5 py-4 text-[#f5edd4]">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-[#d6a74d] text-[#142b51]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="service-assistant-title" className="text-base font-bold leading-tight">
                    {isEn ? 'Help Me Choose a Service' : 'Bantu Pilih Layanan'}
                  </h2>
                  <p className="text-xs text-[#f5edd4]/75">
                    {isEn
                      ? 'Quick guide — processed locally in your browser without saving answers.'
                      : 'Panduan cepat — diproses di browser tanpa menyimpan jawaban Anda.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {(audienceId || query) && (
                  <button
                    type="button"
                    onClick={resetChooser}
                    className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#f5edd4]/85 hover:bg-[#f5edd4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isEn ? 'Reset' : 'Ulangi'}</span>
                  </button>
                )}
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={onClose}
                  aria-label={isEn ? 'Close dialog' : 'Tutup dialog'}
                  className="grid min-h-10 min-w-10 cursor-pointer place-items-center rounded-lg text-[#f5edd4]/85 hover:bg-[#f5edd4]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d6a74d]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Quick keyword matcher */}
              <div>
                <label
                  htmlFor="assistant-keyword-input"
                  className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4b5b78]"
                >
                  {isEn ? 'Describe your need briefly' : 'Cari atau ceritakan singkat kebutuhan Anda'}
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a869c]"
                    aria-hidden="true"
                  />
                  <input
                    id="assistant-keyword-input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      isEn
                        ? 'e.g. anxious, ADHD focus, thesis statistics, child tantrum...'
                        : 'Mis. cemas, sulit fokus ADHD, statistik skripsi, anak tantrum...'
                    }
                    className="w-full rounded-xl border border-[#dedede] bg-white py-2.5 pl-10 pr-4 text-sm text-[#142b51] placeholder:text-[#7a869c] focus:border-[#d6a74d] focus:outline-none focus:ring-2 focus:ring-[#d6a74d]/30"
                  />
                </div>
              </div>

              {/* Crisis Guard */}
              {queryResult.crisisDetected ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950"
                >
                  <div className="flex items-center gap-2 font-bold text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      {isEn ? 'Immediate Crisis Support' : 'Bantuan Darurat Segera'}
                    </span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-red-900">
                    {isEn
                      ? 'If you or someone else is in danger, or thinking about hurting yourself, please call emergency services right away. Attentive admin is not an emergency service.'
                      : 'Jika Anda atau orang lain sedang dalam bahaya, atau berpikir untuk menyakiti diri, segera hubungi layanan darurat berikut. Admin Attentive bukan layanan darurat.'}
                  </p>
                  <div className="mt-3 space-y-2">
                    {queryResult.hotlines.map((hotline) => (
                      <a
                        key={hotline.name}
                        href={hotline.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-red-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-red-900 hover:bg-red-100/60"
                      >
                        <span>{hotline.name}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 underline">
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          {hotline.number}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Modality & branch chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#4b5b78]">
                      {isEn ? 'Format:' : 'Format:'}
                    </span>
                    {(
                      [
                        ['all', isEn ? 'All' : 'Semua'],
                        ['online', 'Online'],
                        ['offline', 'Offline'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setModality(value)
                          if (value === 'online') setMalangOnly(false)
                        }}
                        className={`min-h-8 cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                          modality === value
                            ? 'border-[#142b51] bg-[#142b51] text-[#f5edd4]'
                            : 'border-[#dedede] bg-white text-[#4b5b78] hover:border-[#142b51]/40'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const next = !malangOnly
                        setMalangOnly(next)
                        if (next && modality === 'online') setModality('all')
                      }}
                      className={`min-h-8 cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                        malangOnly
                          ? 'border-[#d6a74d] bg-[#d6a74d] text-[#142b51]'
                          : 'border-[#dedede] bg-white text-[#4b5b78] hover:border-[#d6a74d]'
                      }`}
                    >
                      {isEn ? 'Malang Branch' : 'Cabang Malang'}
                    </button>
                  </div>

                  {/* Guided step chips when query is empty */}
                  {!query.trim() && (
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4b5b78]">
                          {isEn ? '1. Who is this service for?' : '1. Layanan ini untuk siapa?'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {SERVICE_ASSISTANT_FLOW.audiences.map((aud) => {
                            const active = audienceId === aud.id
                            return (
                              <button
                                key={aud.id}
                                type="button"
                                onClick={() => {
                                  setAudienceId(aud.id)
                                  setAreaId(null)
                                  setNeedId(null)
                                }}
                                className={`min-h-9 cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  active
                                    ? 'border-[#d6a74d] bg-[#fffaf0] text-[#142b51] ring-1 ring-[#d6a74d]'
                                    : 'border-[#dedede] bg-white text-[#142b51] hover:border-[#d6a74d]'
                                }`}
                              >
                                {aud.label[locale]}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {audienceId && availableAreas.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4b5b78]">
                            {isEn ? '2. What area would you like help with?' : '2. Bagian mana yang paling ingin dibantu?'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {availableAreas.map((area) => {
                              const active = areaId === area.id
                              return (
                                <button
                                  key={area.id}
                                  type="button"
                                  onClick={() => {
                                    setAreaId(area.id)
                                    setNeedId(null)
                                  }}
                                  className={`min-h-9 cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    active
                                      ? 'border-[#d6a74d] bg-[#fffaf0] text-[#142b51] ring-1 ring-[#d6a74d]'
                                      : 'border-[#dedede] bg-white text-[#142b51] hover:border-[#d6a74d]'
                                  }`}
                                >
                                  {area.label[locale]}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {areaId && availableNeeds.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4b5b78]">
                            {isEn ? '3. Which is closest to your need?' : '3. Mana yang paling mendekati kebutuhan Anda?'}
                          </p>
                          <div className="space-y-2">
                            {availableNeeds.map((need) => {
                              const active = needId === need.id
                              return (
                                <button
                                  key={need.id}
                                  type="button"
                                  onClick={() => setNeedId(need.id)}
                                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                                    active
                                      ? 'border-[#d6a74d] bg-[#fffaf0] text-[#142b51] ring-1 ring-[#d6a74d]'
                                      : 'border-[#dedede] bg-white text-[#142b51] hover:border-[#d6a74d]'
                                  }`}
                                >
                                  <span>{need.label[locale]}</span>
                                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#8c6a22]" aria-hidden="true" />
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {(query.trim() || needId) && (
                    <div className="space-y-2.5 border-t border-[#ebe6d9] pt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#4b5b78]">
                        {recommendations.length > 0
                          ? isEn
                            ? 'Recommended services'
                            : 'Rekomendasi layanan yang sesuai'
                          : isEn
                            ? 'No exact match found'
                            : 'Belum ditemukan kecocokan langsung'}
                      </p>

                      {recommendations.length > 0 ? (
                        <div className="space-y-2.5">
                          {recommendations.map((svc) => {
                            const priceDisplay = formatServicePriceDisplay(
                              svc.priceRange,
                              svc.pricingModel,
                              locale,
                            )
                            return (
                              <div
                                key={svc.id}
                                className="flex flex-col justify-between gap-3 rounded-xl border border-[#dedede] bg-white p-3.5 sm:flex-row sm:items-center"
                              >
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold text-[#142b51]">{svc.name}</span>
                                    <span className="rounded-full bg-[#f5edd4] px-2 py-0.5 text-[10px] font-bold text-[#8c6a22]">
                                      {svc.categoryName}
                                    </span>
                                  </div>
                                  {(svc.shortSummary || svc.benefit) && (
                                    <p className="mt-1 line-clamp-2 text-xs text-[#4b5b78]">
                                      {svc.shortSummary || svc.benefit}
                                    </p>
                                  )}
                                  <div className="mt-1.5 flex items-center gap-2 text-xs font-bold tabular-nums text-[#142b51]">
                                    <span>{priceDisplay.primary}</span>
                                    {priceDisplay.strikeThrough && (
                                      <span className="text-[#7a869c] line-through">
                                        {priceDisplay.strikeThrough}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  <Link
                                    to={`/services/${svc.slug}`}
                                    onClick={onClose}
                                    className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#142b51]/20 px-3 py-1.5 text-xs font-bold text-[#142b51] hover:bg-[#f7f3e8]"
                                  >
                                    {isEn ? 'Details' : 'Lihat Detail'}
                                  </Link>
                                  {svc.bookingPreset.bookable && svc.bookingPreset.bookingPath && (
                                    <Link
                                      to={svc.bookingPreset.bookingPath}
                                      onClick={onClose}
                                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[#d6a74d] px-3 py-1.5 text-xs font-bold text-[#142b51] hover:bg-[#e1b55d]"
                                    >
                                      {isEn ? 'Book' : 'Booking'}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-[#ebe6d9] bg-white p-4 text-xs text-[#4b5b78]">
                          <p>
                            {isEn
                              ? 'Try different keywords or chat with our admin to confirm the most suitable service.'
                              : 'Coba kata kunci lain atau tanyakan langsung ke admin untuk memastikan layanan yang paling sesuai.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col items-start justify-between gap-2 border-t border-[#ebe6d9] bg-[#f7f3e8] px-5 py-3.5 text-xs text-[#4b5b78] sm:flex-row sm:items-center">
              <span>
                {isEn
                  ? 'Guidance only — not a clinical diagnosis.'
                  : 'Saran ini hanya membantu memilih layanan, bukan diagnosis.'}
              </span>
              <a
                href={safeWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#2c7a57] px-3 py-1.5 font-bold text-white hover:bg-[#246648]"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isEn ? 'Ask Admin via WhatsApp' : 'Tanya Admin via WhatsApp'}</span>
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
