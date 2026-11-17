import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Info,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  BOOKING_ASSESSMENT_FEE,
  BOOKING_BRANCH_LABELS,
  BOOKING_WHATSAPP_NUMBERS,
  type BookingPhysicalBranch,
  type PublicServiceDetail,
  type PublicServiceMedia,
  type ServiceModality,
  type SuperadminPreviewServiceDetail,
} from '@attentiveid/shared'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useOptionalAuth } from '@/features/auth/auth-context'
import { fetchSuperadminPreviewDetail } from '@/features/services-admin/api'
import { ServiceTopbar } from '@/features/services/components/ServiceTopbar'
import {
  fetchPublicServiceDetail,
  formatIdr,
  formatServicePriceDisplay,
} from '@/features/services/service'

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const auth = useOptionalAuth()
  const isSuperadmin = auth?.user?.role === 'superadmin'
  const internalPreviewMode = isSuperadmin && searchParams.get('preview') === 'internal'

  const { i18n } = useTranslation()
  const locale: 'id' | 'en' = i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'id'
  const isEn = locale === 'en'

  const [detailState, setDetailState] = useState<{
    key: string
    service: PublicServiceDetail | SuperadminPreviewServiceDetail | null
    notFound: boolean
    error: string | null
  } | null>(null)

  const requestKey = `${slug ?? ''}:${locale}:${internalPreviewMode ? 'internal' : 'public'}`
  const loading = Boolean(slug) && (detailState === null || detailState.key !== requestKey)
  const service = detailState?.key === requestKey ? detailState.service : null
  const notFound = !slug || (detailState?.key === requestKey ? detailState.notFound : false)
  const error = detailState?.key === requestKey ? detailState.error : null

  const [selectedVariantSlug, setSelectedVariantSlug] = useState<string>('')
  const [selectedPsychSlug, setSelectedPsychSlug] = useState<string>('')
  const [selectedMode, setSelectedMode] = useState<ServiceModality>('online')
  const [selectedBranch, setSelectedBranch] = useState<BookingPhysicalBranch>('tbi')
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)
  const [lightboxMedia, setLightboxMedia] = useState<PublicServiceMedia | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    const loader = internalPreviewMode
      ? fetchSuperadminPreviewDetail(slug, locale).catch(() => null)
      : fetchPublicServiceDetail(slug, locale)

    loader
      .then((res) => {
        if (cancelled) return
        if (!res) {
          setDetailState({ key: requestKey, service: null, notFound: true, error: null })
        } else {
          setDetailState({ key: requestKey, service: res, notFound: false, error: null })
          const firstVar = res.variants[0]
          setSelectedVariantSlug(firstVar?.slug ?? '')
          if (firstVar?.modalities.length) {
            setSelectedMode(firstVar.modalities.includes('online') ? 'online' : firstVar.modalities[0]!)
          } else if (res.modalities.length) {
            setSelectedMode(res.modalities.includes('online') ? 'online' : res.modalities[0]!)
          }
          if (firstVar?.branch) {
            setSelectedBranch(firstVar.branch)
          }
          document.title = `${res.name} | Attentive.id`
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setDetailState({
            key: requestKey,
            service: null,
            notFound: false,
            error: err instanceof Error ? err.message : 'Failed to load service detail',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug, locale, internalPreviewMode, requestKey])

  const handleToggleInternalPreview = () => {
    const next = new URLSearchParams(searchParams)
    if (internalPreviewMode) {
      next.delete('preview')
    } else {
      next.set('preview', 'internal')
    }
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (!lightboxMedia) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxMedia(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxMedia])

  const selectedVariant = useMemo(() => {
    if (!service || service.variants.length === 0) return null
    return service.variants.find((v) => v.slug === selectedVariantSlug) ?? service.variants[0] ?? null
  }, [service, selectedVariantSlug])

  const selectedPsych = useMemo(() => {
    if (!service || !selectedPsychSlug) return null
    return service.eligiblePsychologists.find((p) => p.slug === selectedPsychSlug) ?? null
  }, [service, selectedPsychSlug])

  const activeModalities = useMemo<ServiceModality[]>(() => {
    if (selectedVariant && selectedVariant.modalities.length > 0) return selectedVariant.modalities
    if (service && service.modalities.length > 0) return service.modalities
    return ['online', 'offline']
  }, [selectedVariant, service])

  const effectiveMode: ServiceModality = activeModalities.includes(selectedMode)
    ? selectedMode
    : activeModalities[0] ?? 'online'

  const effectiveBranch: BookingPhysicalBranch = selectedVariant?.branch ?? selectedBranch

  const handleSelectVariant = (variantSlug: string) => {
    setSelectedVariantSlug(variantSlug)
    const nextVar = service?.variants.find((v) => v.slug === variantSlug)
    if (nextVar) {
      if (nextVar.modalities.length > 0 && !nextVar.modalities.includes(selectedMode)) {
        setSelectedMode(nextVar.modalities[0]!)
      }
      if (nextVar.branch) {
        setSelectedBranch(nextVar.branch)
      }
    }
  }

  const displayedPricing = useMemo(() => {
    if (!service) return null
    if (service.pricingModel === 'psychologist_rate' && selectedPsych) {
      const rate = effectiveMode === 'offline' ? selectedPsych.offlineRate : selectedPsych.onlineRate
      if (rate !== null) {
        return {
          primary: formatIdr(rate),
          strikeThrough: null,
          hasPromo: false,
          isFree: false,
          isOnRequest: false,
        }
      }
    }
    if (selectedVariant) {
      return formatServicePriceDisplay(
        selectedVariant.pricing,
        service.pricingModel,
        locale,
        selectedVariant.priceOnRequest,
      )
    }
    return formatServicePriceDisplay(service.priceRange, service.pricingModel, locale)
  }, [service, selectedVariant, selectedPsych, effectiveMode, locale])

  const bookingHref = useMemo(() => {
    if (!service) return '/booking'
    if (service.bookingPreset.requiresInitialCounseling && service.bookingPreset.bookingPath) {
      return service.bookingPreset.bookingPath
    }
    const params = new URLSearchParams()
    params.set('service', service.slug)
    if (selectedVariant) params.set('variant', selectedVariant.slug)
    if (selectedPsych) params.set('psychologist', selectedPsych.slug)
    params.set('mode', effectiveMode)
    if (effectiveMode === 'offline') params.set('location', effectiveBranch)
    return `/booking?${params.toString()}`
  }, [service, selectedVariant, selectedPsych, effectiveMode, effectiveBranch])

  const safeWhatsAppUrl = useMemo(() => {
    if (!service) return `https://wa.me/${BOOKING_WHATSAPP_NUMBERS.pusat}`
    const targetNumber =
      effectiveBranch === 'malang' || selectedPsych?.primaryBranch === 'malang'
        ? BOOKING_WHATSAPP_NUMBERS.malang
        : BOOKING_WHATSAPP_NUMBERS.pusat
    const variantPart = selectedVariant ? ` (${selectedVariant.name})` : ''
    const text = isEn
      ? `Hello Attentive Admin, I would like more information about ${service.name}${variantPart}. Thank you.`
      : `Halo Admin Attentive, saya ingin bertanya mengenai layanan ${service.name}${variantPart}. Terima kasih.`
    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(text)}`
  }, [service, selectedVariant, selectedPsych, effectiveBranch, isEn])

  const visibleDeliverables = useMemo(() => {
    if (!service) return []
    if (!selectedVariant) return service.deliverables
    return service.deliverables.filter(
      (d) => d.variantSlugs.length === 0 || d.variantSlugs.includes(selectedVariant.slug),
    )
  }, [service, selectedVariant])

  return (
    <div className="min-h-screen bg-[#fbf8f2] text-[#142b51] flex flex-col">
      <ServiceTopbar
        locale={locale}
        onLocaleChange={(next) => void i18n.changeLanguage(next)}
        activeRoute="detail"
        showInternalToggle={isSuperadmin}
        internalPreviewMode={internalPreviewMode}
        onToggleInternalPreview={handleToggleInternalPreview}
      />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-7 sm:px-6">
        {loading && (
          <div className="space-y-4" aria-busy="true">
            <div className="h-6 w-64 animate-pulse rounded bg-[#ebe6d9]" />
            <div className="h-96 animate-pulse rounded-2xl border border-[#ebe6d9] bg-white" />
          </div>
        )}

        {!loading && (notFound || error) && (
          <div className="rounded-2xl border border-[#dedede] bg-white p-8 text-center">
            <h1 className="text-xl font-extrabold text-[#142b51]">
              {notFound
                ? isEn
                  ? 'Service not found'
                  : 'Layanan tidak ditemukan'
                : isEn
                  ? 'Unable to load service'
                  : 'Gagal memuat detail layanan'}
            </h1>
            {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
            <Link
              to="/services"
              className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#142b51] px-4 py-2 text-xs font-bold text-[#f5edd4]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEn ? 'Back to All Services' : 'Kembali ke Semua Layanan'}</span>
            </Link>
          </div>
        )}

        {!loading && service && (
          <>
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
              <span>{service.categoryName}</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-bold text-[#142b51]">{service.name}</span>
            </nav>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px]">
              {/* Left Column: Detailed Service Documentation */}
              <div className="space-y-6">
                <section className="overflow-hidden rounded-2xl border border-[#dedede] bg-white shadow-[0_6px_18px_rgba(20,43,81,0.06)]">
                  {service.cardMedia && (
                    <div className="aspect-[16/9] max-h-80 w-full overflow-hidden bg-[#f5edd4]/40">
                      <img
                        src={service.cardMedia.url}
                        alt={service.cardMedia.alt}
                        width={service.cardMedia.width}
                        height={service.cardMedia.height}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f5edd4] px-3 py-1 text-xs font-bold text-[#8c6a22]">
                        {service.subgroupName || service.categoryName}
                      </span>
                      {(service.priceRange.promoBadge || service.badge) && (
                        <span className="rounded-full bg-[#d6a74d] px-3 py-1 text-xs font-extrabold text-[#142b51]">
                          {service.priceRange.promoBadge || service.badge}
                        </span>
                      )}
                      {service.hasMalangBranch && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#e4f2ea] px-3 py-1 text-xs font-bold text-[#2c7a57]">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {isEn ? 'Malang Branch Available' : 'Tersedia di Cabang Malang'}
                        </span>
                      )}
                    </div>

                    <h1
                      data-route-heading
                      tabIndex={-1}
                      className="mt-3 text-2xl font-extrabold text-[#142b51] outline-none sm:text-3xl"
                    >
                      {service.name}
                    </h1>
                    {service.fullName && (
                      <p className="mt-1 text-sm font-semibold text-[#4b5b78]">{service.fullName}</p>
                    )}

                    {(service.shortSummary || service.benefit) && (
                      <p className="mt-3 text-sm leading-relaxed text-[#4b5b78] sm:text-base">
                        {service.shortSummary || service.benefit}
                      </p>
                    )}

                    {(service.durationInfo || service.locationInfo) && (
                      <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#ebe6d9] pt-4 text-xs sm:grid-cols-2">
                        {service.durationInfo && (
                          <div>
                            <span className="font-bold uppercase tracking-wider text-[#7a869c]">
                              {isEn ? 'Duration' : 'Durasi'}
                            </span>
                            <p className="mt-0.5 font-semibold text-[#142b51]">{service.durationInfo}</p>
                          </div>
                        )}
                        {service.locationInfo && (
                          <div>
                            <span className="font-bold uppercase tracking-wider text-[#7a869c]">
                              {isEn ? 'Format / Location' : 'Format / Lokasi'}
                            </span>
                            <p className="mt-0.5 font-semibold text-[#142b51]">{service.locationInfo}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>

                {/* Interactive Cognitive Demo Banner */}
                {(service.demo || service.slug === 'profil-kognitif-lengkap') && (
                  <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#d6a74d]/60 bg-gradient-to-r from-[#fffaf0] to-[#fdf5e2] p-5 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#142b51] text-[#d6a74d]">
                        <Brain className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-[#142b51]">
                          {isEn ? 'Try the tasks first, free' : 'Coba dulu tugasnya, gratis'}
                        </p>
                        <p className="mt-0.5 text-xs text-[#4b5b78]">
                          {isEn
                            ? '4 short ~30s cognitive tasks plus the AAA-50 questionnaire and sample reports.'
                            : '4 tugas singkat ~30 detik, Kuesioner AAA-50 bisa langsung diisi, dan lihat contoh laporannya.'}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/services/${service.slug}/demo`}
                      className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#d6a74d] px-4 py-2 text-xs font-extrabold text-[#142b51] hover:bg-[#e1b55d]"
                    >
                      <span>{isEn ? 'Try Demo' : 'Coba Demo'}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </section>
                )}

                {/* Superadmin Internal Financial Meta Card */}
                {internalPreviewMode && 'internalMeta' in service && (
                  <section className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 text-xs text-amber-950">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 font-extrabold uppercase tracking-wider">
                        <ShieldCheck className="h-4 w-4 text-amber-700" />
                        Mode Demo Internal (Superadmin Only)
                      </span>
                      <span className="font-bold uppercase">
                        {(service as SuperadminPreviewServiceDetail).internalMeta.status} ·{' '}
                        {(service as SuperadminPreviewServiceDetail).internalMeta.visibility} ·{' '}
                        {(service as SuperadminPreviewServiceDetail).internalMeta.completenessPct}% Lengkap
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 tabular-nums">
                      <div className="rounded-xl bg-white/80 p-3">
                        <div className="text-[10px] font-bold uppercase text-amber-800">Fee Penyedia</div>
                        <div className="mt-0.5 text-sm font-extrabold">
                          {(service as SuperadminPreviewServiceDetail).internalMeta.lowestFeeAmount !== null
                            ? formatIdr((service as SuperadminPreviewServiceDetail).internalMeta.lowestFeeAmount!)
                            : '—'}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/80 p-3">
                        <div className="text-[10px] font-bold uppercase text-amber-800">Biaya Langsung</div>
                        <div className="mt-0.5 text-sm font-extrabold">
                          {(service as SuperadminPreviewServiceDetail).internalMeta.directCostAmount !== null
                            ? formatIdr((service as SuperadminPreviewServiceDetail).internalMeta.directCostAmount!)
                            : '—'}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/80 p-3">
                        <div className="text-[10px] font-bold uppercase text-amber-800">Margin Terendah</div>
                        <div className="mt-0.5 text-sm font-extrabold">
                          {(service as SuperadminPreviewServiceDetail).internalMeta.lowestMarginPct !== null
                            ? `${(service as SuperadminPreviewServiceDetail).internalMeta.lowestMarginPct!.toFixed(1)}%`
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Clinical / Service Overview */}
                {(service.introduction || service.targetAudience || service.whatIsMeasured) && (
                  <section className="rounded-2xl border border-[#dedede] bg-white p-6 space-y-4">
                    {service.introduction && (
                      <div>
                        <h2 className="text-base font-extrabold text-[#142b51]">
                          {isEn ? 'Overview' : 'Pengantar Layanan'}
                        </h2>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#4b5b78]">{service.introduction}</p>
                      </div>
                    )}
                    {service.targetAudience && (
                      <div>
                        <h3 className="text-sm font-bold text-[#142b51]">
                          {isEn ? 'Who is this for?' : 'Untuk Siapa'}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#4b5b78]">{service.targetAudience}</p>
                      </div>
                    )}
                    {service.whatIsMeasured && (
                      <div>
                        <h3 className="text-sm font-bold text-[#142b51]">
                          {isEn ? 'What is addressed / measured' : 'Apa yang Dibahas / Diukur'}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#4b5b78]">{service.whatIsMeasured}</p>
                      </div>
                    )}
                  </section>
                )}

                {/* Assessment Details */}
                {service.assessmentDetails && (
                  <section className="rounded-2xl border border-[#dedede] bg-white p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#8c6a22]" aria-hidden="true" />
                      <h2 className="text-base font-extrabold text-[#142b51]">
                        {isEn ? 'Assessment Specifications' : 'Rincian Asesmen'}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                      {service.assessmentDetails.purpose && (
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#7a869c]">
                            {isEn ? 'Purpose' : 'Tujuan'}
                          </div>
                          <p className="mt-1 text-[#4b5b78]">{service.assessmentDetails.purpose}</p>
                        </div>
                      )}
                      {service.assessmentDetails.aspects && (
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#7a869c]">
                            {isEn ? 'Aspects Measured' : 'Aspek yang Diukur'}
                          </div>
                          <p className="mt-1 text-[#4b5b78]">{service.assessmentDetails.aspects}</p>
                        </div>
                      )}
                      {service.assessmentDetails.ageRange && (
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#7a869c]">
                            {isEn ? 'Age Range' : 'Rentang Usia'}
                          </div>
                          <p className="mt-1 text-[#4b5b78]">{service.assessmentDetails.ageRange}</p>
                        </div>
                      )}
                      {service.assessmentDetails.method && (
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#7a869c]">
                            {isEn ? 'Method' : 'Metode'}
                          </div>
                          <p className="mt-1 text-[#4b5b78]">{service.assessmentDetails.method}</p>
                        </div>
                      )}
                      {service.assessmentDetails.turnaround && (
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#7a869c]">
                            {isEn ? 'Report Turnaround' : 'Waktu Penyelesaian'}
                          </div>
                          <p className="mt-1 text-[#4b5b78]">{service.assessmentDetails.turnaround}</p>
                        </div>
                      )}
                      {service.assessmentDetails.preparation && (
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#7a869c]">
                            {isEn ? 'Preparation' : 'Persiapan'}
                          </div>
                          <p className="mt-1 text-[#4b5b78]">{service.assessmentDetails.preparation}</p>
                        </div>
                      )}
                    </div>

                    {service.assessmentDetails.dimensions.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#7a869c]">
                          {isEn ? 'Dimensions Covered' : 'Dimensi yang Dinilai'}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {service.assessmentDetails.dimensions.map((dim) => (
                            <span
                              key={dim}
                              className="rounded-lg bg-[#f7f3e8] px-2.5 py-1 text-xs font-semibold text-[#142b51]"
                            >
                              {dim}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* Deliverables & Process */}
                {(visibleDeliverables.length > 0 || service.processSteps.length > 0 || service.terms.length > 0) && (
                  <section className="rounded-2xl border border-[#dedede] bg-white p-6 space-y-5">
                    {visibleDeliverables.length > 0 && (
                      <div>
                        <h2 className="text-base font-extrabold text-[#142b51]">
                          {isEn ? 'What You Receive' : 'Hasil yang Anda Terima'}
                        </h2>
                        <ul className="mt-2.5 space-y-2">
                          {visibleDeliverables.map((deliv) => (
                            <li key={deliv.id} className="flex items-start gap-2.5 text-sm text-[#4b5b78]">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2c7a57]" aria-hidden="true" />
                              <span>{deliv.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {service.processSteps.length > 0 && (
                      <div className="border-t border-[#ebe6d9] pt-4">
                        <h2 className="text-base font-extrabold text-[#142b51]">
                          {isEn ? 'How It Works' : 'Tahapan Layanan'}
                        </h2>
                        <ol className="mt-2.5 list-decimal space-y-1.5 pl-5 text-sm text-[#4b5b78]">
                          {service.processSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {service.terms.length > 0 && (
                      <div className="border-t border-[#ebe6d9] pt-4">
                        <h3 className="text-sm font-bold text-[#142b51]">
                          {isEn ? 'Terms & Notes' : 'Ketentuan'}
                        </h3>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-[#4b5b78]">
                          {service.terms.map((term, idx) => (
                            <li key={idx}>{term}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {/* Sample Report Previews + Lightbox */}
                {service.reportPreviews.length > 0 && (
                  <section className="rounded-2xl border border-[#dedede] bg-white p-6">
                    <h2 className="text-base font-extrabold text-[#142b51]">
                      {isEn ? 'Sample Report Preview' : 'Contoh Tampilan Laporan'}
                    </h2>
                    <p className="mt-1 text-xs text-[#4b5b78]">
                      {isEn
                        ? 'Click any preview image to inspect in full size (anonymized sample data).'
                        : 'Klik gambar untuk melihat ukuran penuh (menggunakan data contoh yang disamarkan).'}
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {service.reportPreviews.map((media, idx) => (
                        <button
                          key={`${media.url}-${idx}`}
                          type="button"
                          onClick={() => setLightboxMedia(media)}
                          className="group cursor-pointer overflow-hidden rounded-xl border border-[#ebe6d9] bg-[#fbf8f2] text-left transition-colors hover:border-[#d6a74d]"
                        >
                          <img
                            src={media.url}
                            alt={media.alt}
                            width={media.width}
                            height={media.height}
                            loading="lazy"
                            className="aspect-[4/3] w-full object-cover object-top"
                          />
                          <div className="p-3 text-xs font-semibold text-[#142b51] group-hover:underline">
                            {media.alt}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* Scientific Basis & Academic References */}
                {(service.resultsExplanation || service.scientificBasis || service.references.length > 0) && (
                  <section className="rounded-2xl border border-[#dedede] bg-white p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#8c6a22]" aria-hidden="true" />
                      <h2 className="text-base font-extrabold text-[#142b51]">
                        {isEn ? 'Scientific Basis & References' : 'Landasan Ilmiah & Rujukan'}
                      </h2>
                    </div>

                    {service.resultsExplanation && (
                      <p className="text-sm leading-relaxed text-[#4b5b78]">{service.resultsExplanation}</p>
                    )}
                    {service.scientificBasis && (
                      <p className="text-sm leading-relaxed text-[#4b5b78]">{service.scientificBasis}</p>
                    )}
                    {service.references.length > 0 && (
                      <ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed text-[#4b5b78]">
                        {service.references.map((ref) => (
                          <li key={ref.id}>
                            <span>{ref.citationText}</span>
                            {ref.doiUrl && (
                              <a
                                href={ref.doiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1.5 inline-flex items-center gap-0.5 font-bold text-[#2e4f8a] hover:underline"
                              >
                                <span>DOI</span>
                                <ExternalLink className="h-3 w-3" aria-hidden="true" />
                              </a>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                )}

                {/* FAQ Accordion */}
                {service.faqs.length > 0 && (
                  <section className="rounded-2xl border border-[#dedede] bg-white p-6">
                    <h2 className="mb-3 text-base font-extrabold text-[#142b51]">
                      {isEn ? 'Frequently Asked Questions' : 'Pertanyaan Umum'}
                    </h2>
                    <div className="divide-y divide-[#ebe6d9]">
                      {service.faqs.map((faq) => {
                        const isOpen = openFaqId === faq.id
                        return (
                          <div key={faq.id} className="py-3">
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                              className="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-sm font-bold text-[#142b51]"
                            >
                              <span>{faq.question}</span>
                              <ChevronDown
                                className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                              />
                            </button>
                            {isOpen && (
                              <p className="mt-2 text-sm leading-relaxed text-[#4b5b78]">{faq.answer}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Sticky Package & Psychologist Selector */}
              <aside className="lg:sticky lg:top-22">
                <div className="rounded-2xl border border-[#dedede] bg-white p-5 shadow-[0_12px_32px_rgba(20,43,81,0.1)] space-y-5">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[#7a869c]">
                      {isEn ? 'Estimated Rate' : 'Estimasi Tarif'}
                    </div>
                    {displayedPricing && (
                      <div className="mt-1 flex flex-wrap items-baseline gap-2 tabular-nums">
                        <span className="text-2xl font-extrabold text-[#142b51]">
                          {displayedPricing.primary}
                        </span>
                        {displayedPricing.strikeThrough && (
                          <span className="text-sm text-[#7a869c] line-through">
                            {displayedPricing.strikeThrough}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedVariant?.unitLabel && (
                      <p className="mt-0.5 text-xs text-[#4b5b78]">{selectedVariant.unitLabel}</p>
                    )}
                    {selectedVariant?.pricing.promoNote && (
                      <div className="mt-2 rounded-xl border border-[#ead8ae] bg-[#fffaf0] p-2.5 text-xs font-medium text-[#8c6a22]">
                        {selectedVariant.pricing.promoNote}
                      </div>
                    )}
                  </div>

                  {/* Variant Picker */}
                  {service.variants.length > 0 && (
                    <div>
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4b5b78]">
                        {isEn ? 'Choose Package / Variant' : 'Pilih Paket / Varian'}
                      </div>
                      <div className="space-y-2">
                        {service.variants.map((variant) => {
                          const active = selectedVariant?.slug === variant.slug
                          const vPrice = formatServicePriceDisplay(
                            variant.pricing,
                            service.pricingModel,
                            locale,
                            variant.priceOnRequest,
                          )
                          return (
                            <button
                              key={variant.id}
                              type="button"
                              onClick={() => handleSelectVariant(variant.slug)}
                              className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                                active
                                  ? 'border-[#d6a74d] bg-[#fffcf4] ring-1 ring-[#d6a74d]'
                                  : 'border-[#dedede] bg-[#fbf8f2] hover:border-[#d6a74d]/70'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-[#142b51]">{variant.name}</span>
                                <span className="shrink-0 text-xs font-extrabold tabular-nums text-[#142b51]">
                                  {vPrice.primary}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-[#4b5b78]">
                                {variant.branch === 'malang' && (
                                  <span className="rounded bg-[#e4f2ea] px-1.5 py-0.5 font-bold text-[#2c7a57]">
                                    Cabang Malang
                                  </span>
                                )}
                                {variant.durationLabel && <span>{variant.durationLabel}</span>}
                                {variant.ageRangeLabel && <span>· {variant.ageRangeLabel}</span>}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Modality & Branch Selector (when bookable) */}
                  {service.bookingPreset.bookable && !service.bookingPreset.requiresInitialCounseling && (
                    <div className="space-y-3 border-t border-[#ebe6d9] pt-4">
                      <div>
                        <div className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[#4b5b78]">
                          {isEn ? 'Session Format' : 'Format Sesi'}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(['online', 'offline'] as const).map((mod) => {
                            const allowed = activeModalities.includes(mod)
                            const active = effectiveMode === mod
                            return (
                              <button
                                key={mod}
                                type="button"
                                disabled={!allowed}
                                onClick={() => setSelectedMode(mod)}
                                className={`min-h-9 rounded-lg border px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                                  !allowed
                                    ? 'cursor-not-allowed border-[#ebe6d9] bg-[#f7f3e8] text-[#7a869c]/60'
                                    : active
                                      ? 'cursor-pointer border-[#142b51] bg-[#142b51] text-white'
                                      : 'cursor-pointer border-[#dedede] bg-white text-[#142b51] hover:border-[#142b51]/40'
                                }`}
                              >
                                {mod}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {effectiveMode === 'offline' && (
                        <div>
                          <label
                            htmlFor="detail-branch-select"
                            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4b5b78]"
                          >
                            {isEn ? 'Clinic Branch' : 'Cabang Klinik'}
                          </label>
                          <select
                            id="detail-branch-select"
                            value={effectiveBranch}
                            disabled={Boolean(selectedVariant?.branch)}
                            onChange={(e) => setSelectedBranch(e.target.value as BookingPhysicalBranch)}
                            className="w-full rounded-lg border border-[#dedede] bg-white px-3 py-2 text-xs font-semibold text-[#142b51] disabled:bg-[#f7f3e8]"
                          >
                            {(['tbi', 'bsd', 'malang'] as const).map((branch) => (
                              <option key={branch} value={branch}>
                                {BOOKING_BRANCH_LABELS[locale][branch]}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Psychologist Picker (when service has linked active practitioners) */}
                  {service.eligiblePsychologists.length > 0 && (
                    <div className="border-t border-[#ebe6d9] pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#4b5b78]">
                          {isEn ? 'Practitioner (Optional)' : 'Pilih Psikolog / Pakar (Opsional)'}
                        </span>
                        {selectedPsychSlug && (
                          <button
                            type="button"
                            onClick={() => setSelectedPsychSlug('')}
                            className="cursor-pointer text-[11px] font-bold text-[#8c6a22] hover:underline"
                          >
                            {isEn ? 'Reset' : 'Otomatis'}
                          </button>
                        )}
                      </div>

                      <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                        {service.eligiblePsychologists.map((psych) => {
                          const active = selectedPsychSlug === psych.slug
                          const psychRate =
                            service.pricingModel === 'psychologist_rate'
                              ? effectiveMode === 'offline'
                                ? psych.offlineRate
                                : psych.onlineRate
                              : null
                          return (
                            <button
                              key={psych.id}
                              type="button"
                              onClick={() => setSelectedPsychSlug(active ? '' : psych.slug)}
                              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${
                                active
                                  ? 'border-[#d6a74d] bg-[#fffcf4] ring-1 ring-[#d6a74d]'
                                  : 'border-[#ebe6d9] bg-[#fbf8f2] hover:border-[#d6a74d]/70'
                              }`}
                            >
                              {psych.media ? (
                                <img
                                  src={psych.media.url}
                                  alt={psych.media.alt}
                                  width={40}
                                  height={40}
                                  loading="lazy"
                                  className="size-10 shrink-0 rounded-full object-cover"
                                />
                              ) : (
                                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ebe6d9] text-[#4b5b78]">
                                  <User className="h-4 w-4" aria-hidden="true" />
                                </span>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-xs font-bold text-[#142b51]">{psych.name}</div>
                                <div className="truncate text-[11px] text-[#4b5b78]">{psych.credential}</div>
                                {psych.note && (
                                  <div className="mt-0.5 line-clamp-2 text-[10.5px] text-[#8c6a22]">
                                    {psych.note}
                                  </div>
                                )}
                              </div>
                              {psychRate !== null && (
                                <span className="shrink-0 text-[11px] font-extrabold tabular-nums text-[#142b51]">
                                  {formatIdr(psychRate)}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* New Client Fee Notice ONLY for appliesNewClientFee === true (konseling-dewasa) */}
                  {service.appliesNewClientFee && (
                    <div className="flex items-start gap-2 rounded-xl border border-[#ead8ae] bg-[#fffaf0] p-3 text-xs text-[#6f5518]">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#8c6a22]" aria-hidden="true" />
                      <span>
                        {isEn
                          ? `New clients have a one-time initial registration & assessment fee of ${formatIdr(BOOKING_ASSESSMENT_FEE)}.`
                          : `Klien baru dikenakan biaya pendaftaran & asesmen awal sebesar ${formatIdr(BOOKING_ASSESSMENT_FEE)} pada sesi pertama.`}
                      </span>
                    </div>
                  )}

                  {/* Smart Primary CTA */}
                  <div className="space-y-2.5 pt-1">
                    {service.pricingModel === 'free_external' && service.bookingPreset.externalUrl ? (
                      <a
                        href={service.bookingPreset.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#d6a74d] px-4 py-3 text-sm font-extrabold text-[#142b51] shadow-xs hover:bg-[#e1b55d]"
                      >
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        <span>{isEn ? 'Start Free Test' : 'Mulai Tes Gratis'}</span>
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : selectedVariant?.priceOnRequest || service.pricingModel === 'price_on_request' ? (
                      <>
                        {service.bookingPreset.requiresInitialCounseling && (
                          <Link
                            to={bookingHref}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#d6a74d] px-4 py-3 text-sm font-extrabold text-[#142b51] shadow-xs hover:bg-[#e1b55d]"
                          >
                            <span>
                              {isEn ? 'Book Initial Counseling Session' : 'Booking Sesi Konseling Awal'}
                            </span>
                          </Link>
                        )}
                        <a
                          href={safeWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2c7a57] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#246648]"
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          <span>{isEn ? 'Confirm via WhatsApp Admin' : 'Konfirmasi ke Admin WhatsApp'}</span>
                        </a>
                      </>
                    ) : (
                      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} transition={INTERACTIVE_SPRING}>
                        <Link
                          to={bookingHref}
                          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#d6a74d] px-4 py-3 text-sm font-extrabold text-[#142b51] shadow-xs hover:bg-[#e1b55d]"
                        >
                          <span>{isEn ? 'Continue to Booking' : 'Lanjut ke Booking'}</span>
                        </Link>
                      </motion.div>
                    )}

                    <a
                      href={safeWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#dedede] bg-[#fbf8f2] px-4 py-2 text-xs font-bold text-[#142b51] hover:bg-[#f5edd4]"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-[#2c7a57]" aria-hidden="true" />
                      <span>{isEn ? 'Ask Admin on WhatsApp' : 'Tanya Admin via WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>

      {/* Report Preview Lightbox */}
      <AnimatePresence>
        {lightboxMedia && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={lightboxMedia.alt}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              onClick={() => setLightboxMedia(null)}
              className="fixed inset-0 bg-[#0d1f3d]/80 backdrop-blur-xs"
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={INTERACTIVE_SPRING}
              className="relative z-10 max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#ebe6d9] px-4 py-3">
                <span className="text-sm font-bold text-[#142b51]">{lightboxMedia.alt}</span>
                <button
                  type="button"
                  onClick={() => setLightboxMedia(null)}
                  aria-label={isEn ? 'Close preview' : 'Tutup pratinjau'}
                  className="grid size-9 cursor-pointer place-items-center rounded-lg text-[#142b51] hover:bg-[#f7f3e8]"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="max-h-[78vh] overflow-auto bg-[#fbf8f2] p-4">
                <img
                  src={lightboxMedia.url}
                  alt={lightboxMedia.alt}
                  width={lightboxMedia.width}
                  height={lightboxMedia.height}
                  className="mx-auto h-auto max-w-full rounded-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
