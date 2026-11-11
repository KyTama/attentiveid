import { animate, AnimatePresence, motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Gift,
  MapPin,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'
import { useCampaignDock } from './use-campaign-dock'

export interface TrustMetric {
  label: string
  value: string
}

export function renderDualColorHeading(text: string) {
  if (!text) return null

  // 1. Explicit markdown bold syntax: **highlighted gold text**
  if (text.includes('**')) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={index} className="text-[#C27803]">
                {part.slice(2, -2)}
              </span>
            )
          }
          return (
            <span key={index} className="text-secondary">
              {part}
            </span>
          )
        })}
      </>
    )
  }

  // 2. Default Indonesian pattern: split anchor & action
  if (text.includes('Biro Psikologi Klinis & Konseling')) {
    const remainder = text.replace('Biro Psikologi Klinis & Konseling', '').trim()
    return (
      <>
        <span className="text-secondary">Biro Psikologi Klinis & Konseling</span>{' '}
        <span className="text-[#C27803] block sm:inline">{remainder}</span>
      </>
    )
  }

  // 3. Default English pattern: split anchor & action
  if (text.includes('Licensed Clinical Psychology Bureau')) {
    const remainder = text
      .replace('Licensed Clinical Psychology Bureau &', '')
      .replace('Licensed Clinical Psychology Bureau', '')
      .trim()
    return (
      <>
        <span className="text-secondary">Licensed Clinical Psychology Bureau &</span>{' '}
        <span className="text-[#C27803] block sm:inline">{remainder}</span>
      </>
    )
  }

  // 4. Default ampersand split fallback
  if (text.includes('&')) {
    const [first, ...rest] = text.split('&')
    return (
      <>
        <span className="text-secondary">{first?.trim()} &</span>{' '}
        <span className="text-[#C27803] block sm:inline">{rest.join('&').trim()}</span>
      </>
    )
  }

  // 5. Fallback: single color
  return <span className="text-secondary">{text}</span>
}

function parseMetricValue(raw: string) {
  const match = raw.match(/^([^\d]*)([\d.,]+)([^\d]*)$/)
  if (!match) return null

  const [, prefix, numStr, suffix] = match
  const isDecimal =
    (numStr.includes(',') && numStr.split(',')[1].length === 1) ||
    (numStr.includes('.') && numStr.split('.')[1].length === 1)

  if (isDecimal) {
    const sep = numStr.includes(',') ? ',' : '.'
    const target = parseFloat(numStr.replace(',', '.'))
    return { prefix, target, suffix, isDecimal: true, sep }
  }

  const cleanNum = numStr.replace(/\./g, '').replace(/,/g, '')
  const target = parseInt(cleanNum, 10)
  const sep = numStr.includes('.') ? '.' : numStr.includes(',') ? ',' : ''
  return { prefix, target, suffix, isDecimal: false, sep }
}

function AnimatedMetricValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px 0px' })
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (!isInView) return

    const parsed = parseMetricValue(value)
    if (!parsed) return

    const { prefix, target, suffix, isDecimal, sep } = parsed
    const controls = animate(0, target, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1], // Emil Kowalski quintic ease-out
      onUpdate: (latest) => {
        if (isDecimal) {
          const formatted = latest.toFixed(1).replace('.', sep)
          setDisplayValue(`${prefix}${formatted}${suffix}`)
        } else {
          const rounded = Math.round(latest)
          const formatted =
            sep === ','
              ? rounded.toLocaleString('en-US')
              : sep === '.'
              ? rounded.toLocaleString('id-ID')
              : rounded.toString()
          setDisplayValue(`${prefix}${formatted}${suffix}`)
        }
      },
      onComplete: () => {
        setDisplayValue(value)
      },
    })

    return () => controls.stop()
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums" aria-label={value}>
      {displayValue}
    </span>
  )
}

export function HomepageHero() {
  const { i18n, t } = useTranslation()
  const isId = i18n.resolvedLanguage === 'id' || i18n.language === 'id'
  const { isDismissed, restoreDock } = useCampaignDock()
  const [activeSlide, setActiveSlide] = useState(0)

  const managed = useLandingSection('hero')
  const metrics = managed
    ? [...managed.section.items]
        .sort((left, right) => left.position - right.position)
        .map((item) => ({ label: item.title[managed.locale], value: item.description[managed.locale] }))
    : (t('homepage.hero.metrics', { returnObjects: true }) as TrustMetric[])

  const totalSlides = 2

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % totalSlides)
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides)

  // As-is Slide 1 data (from CMS / Database if available, or static fallback)
  const slide1 = {
    headline: managed?.section.headline[managed.locale] ?? t('homepage.hero.title'),
    description: managed?.section.description[managed.locale] ?? t('homepage.hero.description'),
    primaryAction: managed?.section.primaryCta[managed.locale] ?? t('homepage.hero.primaryAction'),
    primaryActionUrl: (managed?.section as any)?.primaryCtaUrl || 'https://booking.attentiveid.com/',
    secondaryAction: managed?.section.secondaryCta[managed.locale] ?? t('homepage.hero.secondaryAction'),
    secondaryActionUrl: (managed?.section as any)?.secondaryCtaUrl || '/psychologists',
    imageSrc: managed?.section.media?.reference
      ? managed.section.media.reference.startsWith('/')
        ? managed.section.media.reference
        : `/${managed.section.media.reference}`
      : '/media/landing/hero-slide-1.jpg',
  }

  // Slide 2 data (from CMS slideItems[1] if customized, otherwise default i18n)
  const customSlide2 = (managed?.section as any)?.slideItems?.[1]
  const slide2 = {
    tag: customSlide2?.tag?.[managed?.locale || 'id'] ?? t('homepage.hero.slides.petFriendly.tag'),
    headline:
      customSlide2?.headline?.[managed?.locale || 'id'] ??
      `${t('homepage.hero.slides.petFriendly.headlineDark')} **${t('homepage.hero.slides.petFriendly.headlineAccent')}** ${t('homepage.hero.slides.petFriendly.headlineSub')}`,
    description:
      customSlide2?.description?.[managed?.locale || 'id'] ??
      t('homepage.hero.slides.petFriendly.description'),
    location:
      customSlide2?.location?.[managed?.locale || 'id'] ??
      t('homepage.hero.slides.petFriendly.location'),
    primaryAction:
      customSlide2?.primaryCta?.[managed?.locale || 'id'] ??
      t('homepage.hero.slides.petFriendly.primaryCta'),
    primaryActionUrl:
      customSlide2?.primaryCtaUrl ||
      'https://wa.me/6281234567890?text=Halo%20Attentive,%20saya%20ingin%20konsultasi%20ramah%20anabul',
    secondaryAction:
      customSlide2?.secondaryCta?.[managed?.locale || 'id'] ??
      t('homepage.hero.slides.petFriendly.secondaryCta'),
    secondaryActionUrl: customSlide2?.secondaryCtaUrl || '#locations',
    imageSrc: customSlide2?.media?.reference
      ? customSlide2.media.reference.startsWith('/')
        ? customSlide2.media.reference
        : `/${customSlide2.media.reference}`
      : '/images/pet-friendly/pet-friendly-1.jpg',
  }

  // Program & Layanan Unggulan (Command Strip campaigns)
  const customCampaigns = (managed?.section as any)?.campaigns
  const campaignEyebrow = customCampaigns?.eyebrow?.[managed?.locale || 'id'] ?? t('homepage.campaigns.eyebrow')
  const campaignDescription = customCampaigns?.description?.[managed?.locale || 'id'] ?? t('homepage.campaigns.description')

  const card1Data = customCampaigns?.cards?.[0]
  const card1 = {
    badge: card1Data?.badge?.[managed?.locale || 'id'] ?? t('homepage.campaigns.freeSession.badge'),
    title: card1Data?.title?.[managed?.locale || 'id'] ?? t('homepage.campaigns.freeSession.title'),
    description: card1Data?.description?.[managed?.locale || 'id'] ?? t('homepage.campaigns.freeSession.description'),
    cta: card1Data?.cta?.[managed?.locale || 'id'] ?? t('homepage.campaigns.freeSession.cta'),
    url: card1Data?.url || 'https://free-session.attentiveid.com',
  }

  const card2Data = customCampaigns?.cards?.[1]
  const card2 = {
    badge: card2Data?.badge?.[managed?.locale || 'id'] ?? t('homepage.campaigns.booking.badge'),
    title: card2Data?.title?.[managed?.locale || 'id'] ?? t('homepage.campaigns.booking.title'),
    description: card2Data?.description?.[managed?.locale || 'id'] ?? t('homepage.campaigns.booking.description'),
    cta: card2Data?.cta?.[managed?.locale || 'id'] ?? t('homepage.campaigns.booking.cta'),
    url: card2Data?.url || 'https://booking.attentiveid.com/',
  }

  const card3Data = customCampaigns?.cards?.[2]
  const card3 = {
    badge: card3Data?.badge?.[managed?.locale || 'id'] ?? t('homepage.campaigns.testCentre.badge'),
    title: card3Data?.title?.[managed?.locale || 'id'] ?? t('homepage.campaigns.testCentre.title'),
    description: card3Data?.description?.[managed?.locale || 'id'] ?? t('homepage.campaigns.testCentre.description'),
    cta: card3Data?.cta?.[managed?.locale || 'id'] ?? t('homepage.campaigns.testCentre.cta'),
    url: card3Data?.url || 'https://assessment.attentiveid.com/',
  }

  return (
    <section className="relative border-b border-secondary/10 bg-[#FAF7F2]" id="home">
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6 sm:pt-8 sm:pb-12 lg:px-8">
        {/* Top Kicker Bar */}
        <div className="flex items-center justify-between border-b border-secondary/10 pb-3 text-xs tracking-wider">
          <div className="flex items-center gap-2 font-bold uppercase text-secondary/70">
            <span className="inline-block h-px w-4 bg-secondary/50" />
            <span>{t('homepage.hero.kicker')}</span>
          </div>
          <span className="hidden font-medium text-secondary/60 sm:inline">
            {t('homepage.hero.kickerSub')}
          </span>
        </div>

        {/* Main Editorial Hero Highlight Card */}
        <div className="relative mt-4 overflow-hidden rounded-[2rem] border border-secondary/15 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
          <AnimatePresence mode="wait">
            {activeSlide === 0 ? (
              <motion.div
                key="slide-as-is"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={INTERACTIVE_SPRING}
                className="grid min-h-[440px] grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
              >
                {/* Left Column: As-Is Headline & CTAs */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-[#FAF7F2] px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-secondary shadow-2xs">
                      <ShieldCheck size={13} className="text-[#C27803]" />
                      {isId ? 'Biro Psikologi Klinis · Berizin SIP Resmi' : 'Licensed Clinical Psychology Bureau'}
                    </span>
                  </div>

                  <h1
                    className="mt-6 text-balance font-sans text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[44px] lg:leading-[1.15]"
                    data-route-heading
                    tabIndex={-1}
                  >
                    {renderDualColorHeading(slide1.headline)}
                  </h1>

                  <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-secondary/80 sm:text-base sm:leading-7">
                    {slide1.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-secondary/70">
                    <MapPin size={15} className="text-[#C27803]" />
                    <span>{isId ? 'Jakarta · BSD · Malang · Video Konseling Online' : 'Jakarta · BSD · Malang · Online Video Counseling'}</span>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    {slide1.primaryActionUrl.startsWith('http') ? (
                      <motion.a
                        href={slide1.primaryActionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-xs font-bold text-white shadow-xs outline-none hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm cursor-pointer"
                        transition={INTERACTIVE_SPRING}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CalendarCheck2 size={16} className="text-primary" />
                        <span>{slide1.primaryAction}</span>
                        <ArrowUpRight size={16} />
                      </motion.a>
                    ) : (
                      <motion.div transition={INTERACTIVE_SPRING} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to={slide1.primaryActionUrl}
                          className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-xs font-bold text-white shadow-xs outline-none hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm cursor-pointer"
                        >
                          <CalendarCheck2 size={16} className="text-primary" />
                          <span>{slide1.primaryAction}</span>
                          <ArrowRight size={16} />
                        </Link>
                      </motion.div>
                    )}

                    <motion.div transition={INTERACTIVE_SPRING} whileHover={{ x: 2 }}>
                      {slide1.secondaryActionUrl.startsWith('http') || slide1.secondaryActionUrl.startsWith('#') ? (
                        <a
                          href={slide1.secondaryActionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary outline-none hover:text-[#C27803] focus-visible:ring-2 focus-visible:ring-primary sm:text-sm cursor-pointer"
                        >
                          <span>{slide1.secondaryAction}</span>
                          <ArrowRight size={15} />
                        </a>
                      ) : (
                        <Link
                          to={slide1.secondaryActionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary outline-none hover:text-[#C27803] focus-visible:ring-2 focus-visible:ring-primary sm:text-sm cursor-pointer"
                        >
                          <span>{slide1.secondaryAction}</span>
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Right Column: Architectural Arch Image with Floating Badges */}
                <div className="relative min-h-[320px] w-full sm:min-h-[400px] lg:min-h-[440px]">
                  {/* Outer arch window container */}
                  <div className="relative h-full w-full overflow-hidden rounded-tl-[80px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-[28px] border border-secondary/15 bg-[#E8E2D5] shadow-md sm:rounded-tl-[120px]">
                    <img
                      src={slide1.imageSrc}
                      alt="Konsultasi Psikologi Attentive"
                      className="h-full w-full object-cover object-center"
                      loading="eager"
                      width="1600"
                      height="900"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                  </div>

                  {/* Floating Badge Top-Right: SIP RESMI */}
                  <div className="absolute -top-3 -right-3 z-20 flex size-18 flex-col items-center justify-center rounded-full border-2 border-white bg-[#E5A824] text-secondary shadow-lg sm:size-20">
                    <span className="text-[10px] font-bold tracking-tight uppercase sm:text-xs">SIP</span>
                    <span className="text-xs font-extrabold tracking-tight uppercase sm:text-sm">RESMI</span>
                    <span className="text-xs font-bold sm:text-sm">+</span>
                  </div>

                  {/* Floating Glass Card Bottom-Left */}
                  <div className="absolute bottom-4 left-4 z-20 max-w-[260px] rounded-2xl border border-secondary/15 bg-white/95 p-4 shadow-lg backdrop-blur-md sm:max-w-[290px]">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-secondary/60">
                      {isId ? 'COME AS YOU ARE' : 'COME AS YOU ARE'}
                    </span>
                    <p className="mt-0.5 text-xs font-bold text-secondary sm:text-sm">
                      {isId ? 'Ruang aman untuk didengar.' : 'A safe space to be heard.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="slide-pet-friendly"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={INTERACTIVE_SPRING}
                className="grid min-h-[440px] grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12"
              >
                {/* Left Column: Typography & CTAs for Pet Friendly */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-secondary/15 bg-[#FAF7F2] px-3.5 py-1 text-[11px] font-bold tracking-wider uppercase text-secondary shadow-2xs">
                      <PawPrint size={13} className="text-[#C27803]" />
                      {slide2.tag}
                    </span>
                  </div>

                  <h2
                    className="mt-6 text-balance font-sans text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[44px] lg:leading-[1.15]"
                  >
                    {renderDualColorHeading(slide2.headline)}
                  </h2>

                  <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-secondary/80 sm:text-base sm:leading-7">
                    {slide2.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-secondary/70">
                    <PawPrint size={15} className="text-[#C27803]" />
                    <span>{slide2.location}</span>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    {slide2.primaryActionUrl.startsWith('http') ? (
                      <motion.a
                        href={slide2.primaryActionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-xs font-bold text-white shadow-xs outline-none hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm cursor-pointer"
                        transition={INTERACTIVE_SPRING}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <PawPrint size={16} className="text-primary" />
                        <span>{slide2.primaryAction}</span>
                        <ArrowUpRight size={16} />
                      </motion.a>
                    ) : (
                      <motion.div transition={INTERACTIVE_SPRING} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to={slide2.primaryActionUrl}
                          className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-xs font-bold text-white shadow-xs outline-none hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm cursor-pointer"
                        >
                          <PawPrint size={16} className="text-primary" />
                          <span>{slide2.primaryAction}</span>
                          <ArrowRight size={16} />
                        </Link>
                      </motion.div>
                    )}

                    <motion.div transition={INTERACTIVE_SPRING} whileHover={{ x: 2 }}>
                      {slide2.secondaryActionUrl.startsWith('http') || slide2.secondaryActionUrl.startsWith('#') ? (
                        <a
                          href={slide2.secondaryActionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary outline-none hover:text-[#C27803] focus-visible:ring-2 focus-visible:ring-primary sm:text-sm cursor-pointer"
                        >
                          <span>{slide2.secondaryAction}</span>
                          <ArrowRight size={15} />
                        </a>
                      ) : (
                        <Link
                          to={slide2.secondaryActionUrl}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary outline-none hover:text-[#C27803] focus-visible:ring-2 focus-visible:ring-primary sm:text-sm cursor-pointer"
                        >
                          <span>{slide2.secondaryAction}</span>
                          <ArrowRight size={15} />
                        </Link>
                      )}
                    </motion.div>
                  </div>
                </div>

                {/* Right Column: Pet-Friendly Asymmetric Collage with Floating Badges */}
                <div className="relative min-h-[320px] w-full sm:min-h-[400px] lg:min-h-[440px]">
                  <div className="relative h-full w-full overflow-hidden rounded-tl-[80px] rounded-tr-[28px] rounded-br-[28px] rounded-bl-[28px] border border-secondary/15 bg-[#E8E2D5] shadow-md sm:rounded-tl-[120px]">
                    {/* Primary Feature Photo */}
                    <img
                      src="/images/pet-friendly/pet-friendly-1.jpg"
                      alt="Attentive Pet Friendly Counseling"
                      className="h-full w-full object-cover object-center"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />

                    {/* Inset Photo Overlay 1 (Corner thumbnail) */}
                    <div className="absolute top-4 left-4 z-10 hidden size-24 overflow-hidden rounded-xl border-2 border-white shadow-md sm:block lg:size-28">
                      <img
                        src="/images/pet-friendly/pet-friendly-2.jpg"
                        alt="Anabul di ruang konseling"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Inset Photo Overlay 2 */}
                    <div className="absolute top-20 right-4 z-10 hidden size-20 overflow-hidden rounded-xl border-2 border-white shadow-md sm:block">
                      <img
                        src="/images/pet-friendly/pet-friendly-3.jpg"
                        alt="Kenyamanan konseling bersama anabul"
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Floating Badge Top-Right: PAW FRIENDLY */}
                  <div className="absolute -top-3 -right-3 z-20 flex size-18 flex-col items-center justify-center rounded-full border-2 border-white bg-[#E5A824] text-secondary shadow-lg sm:size-20">
                    <span className="text-[10px] font-bold tracking-tight uppercase sm:text-xs">PAW</span>
                    <span className="text-xs font-extrabold tracking-tight uppercase sm:text-sm">FRIENDLY</span>
                    <span className="text-xs sm:text-sm">🐾</span>
                  </div>

                  {/* Floating Glass Card Bottom-Left */}
                  <div className="absolute bottom-4 left-4 z-20 max-w-[260px] rounded-2xl border border-secondary/15 bg-white/95 p-4 shadow-lg backdrop-blur-md sm:max-w-[290px]">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-secondary/60">
                      {t('homepage.hero.slides.petFriendly.cardEyebrow')}
                    </span>
                    <p className="mt-0.5 text-xs font-bold text-secondary sm:text-sm">
                      {t('homepage.hero.slides.petFriendly.cardTitle')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Slide Controller (Pagination & Navigation) */}
          <div className="mt-8 flex items-center justify-between border-t border-secondary/10 pt-5">
            {/* Left: Numeric index & segmented progress pills */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-secondary">
                {String(activeSlide + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(totalSlides).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={`hero-pill-${index}`}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlide === index ? 'w-8 bg-[#C27803]' : 'w-4 bg-secondary/20 hover:bg-secondary/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Manual Arrow Controls */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="grid size-10 place-items-center rounded-full border border-secondary/20 bg-white text-secondary shadow-2xs hover:border-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                transition={INTERACTIVE_SPRING}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={18} strokeWidth={2.2} />
              </motion.button>
              <motion.button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="grid size-10 place-items-center rounded-full border border-secondary/20 bg-white text-secondary shadow-2xs hover:border-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                transition={INTERACTIVE_SPRING}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight size={18} strokeWidth={2.2} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Minimalist Trust Ticker Ribbon */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 border-y border-secondary/10 py-5 text-center text-xs font-bold tracking-wide text-secondary/75 sm:gap-8 sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#C27803]">✻</span>
            <span>{t('homepage.hero.tickerPillars.0')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#C27803]">✻</span>
            <span>{t('homepage.hero.tickerPillars.1')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#C27803]">✻</span>
            <span>{t('homepage.hero.tickerPillars.2')}</span>
          </div>
        </div>

        {/* Sub-Hero Command Strip (Featured Campaigns: Program & Layanan Unggulan) - NAIK KE SINI */}
        <div className="mt-8 rounded-2xl border border-secondary/10 bg-[#FAF7F2] p-6 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary/20 text-[#8C6013]">
                <Sparkles size={14} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                {campaignEyebrow}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-secondary/70">
                {campaignDescription}
              </span>
              {isDismissed && (
                <motion.button
                  type="button"
                  onClick={restoreDock}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-secondary/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-secondary shadow-2xs hover:bg-secondary hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  transition={INTERACTIVE_SPRING}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles size={11} className="text-primary" />
                  <span>{isId ? 'Tampilkan bar bawah' : 'Show quick bar'}</span>
                </motion.button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Card 1: First Free Session */}
            <motion.a
              href={card1.url}
              target={card1.url.startsWith('http') ? '_blank' : undefined}
              rel={card1.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={`${card1.title} - ${card1.cta}`}
              className="group relative flex flex-col justify-between rounded-xl border border-primary/50 bg-gradient-to-b from-white to-[#FDF8EE] p-5 sm:p-6 shadow-xs transition-all hover:border-primary hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-md bg-[#FAF0D7] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#8C6013]">
                  {card1.badge}
                </span>
                <div className="grid size-9 place-items-center rounded-lg bg-[#FAF0D7] text-[#8C6013]">
                  <Gift size={18} strokeWidth={2.2} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-secondary group-hover:text-[#8C6013] transition-colors sm:text-lg">
                  {card1.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary/80">
                  {card1.description}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[#E9B949]/20 pt-3 text-xs sm:text-sm font-semibold text-[#8C6013]">
                <span>{card1.cta}</span>
                <ArrowUpRight
                  size={16}
                  strokeWidth={2.5}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </motion.a>

            {/* Card 2: Booking / Reserve */}
            <motion.a
              href={card2.url}
              target={card2.url.startsWith('http') ? '_blank' : undefined}
              rel={card2.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={`${card2.title} - ${card2.cta}`}
              className="group relative flex flex-col justify-between rounded-xl border border-secondary/15 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-secondary/35 hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
                  {card2.badge}
                </span>
                <div className="grid size-9 place-items-center rounded-lg bg-secondary/10 text-secondary">
                  <CalendarCheck2 size={18} strokeWidth={2.2} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-secondary group-hover:text-primary transition-colors sm:text-lg">
                  {card2.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary/80">
                  {card2.description}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-secondary/10 pt-3 text-xs sm:text-sm font-semibold text-secondary group-hover:text-primary">
                <span>{card2.cta}</span>
                <ArrowUpRight
                  size={16}
                  strokeWidth={2.5}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </motion.a>

            {/* Card 3: Digital Test Centre */}
            <motion.a
              href={card3.url}
              target={card3.url.startsWith('http') ? '_blank' : undefined}
              rel={card3.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              aria-label={`${card3.title} - ${card3.cta}`}
              className="group relative flex flex-col justify-between rounded-xl border border-secondary/15 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-secondary/35 hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-md bg-[#EBF3FB] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1E568A]">
                  {card3.badge}
                </span>
                <div className="grid size-9 place-items-center rounded-lg bg-[#EBF3FB] text-[#1E568A]">
                  <ClipboardCheck size={18} strokeWidth={2.2} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-secondary group-hover:text-[#1E568A] transition-colors sm:text-lg">
                  {card3.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary/80">
                  {card3.description}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-secondary/10 pt-3 text-xs sm:text-sm font-semibold text-[#1E568A]">
                <span>{card3.cta}</span>
                <ArrowUpRight
                  size={16}
                  strokeWidth={2.5}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </div>
            </motion.a>
          </div>
        </div>

        {/* 4 Trust Counter Metrics (DI BAWAHNYA Program & Layanan Unggulan) */}
        <dl className="mt-6 grid grid-cols-2 rounded-2xl bg-white/70 py-8 text-center sm:grid-cols-4 sm:py-10 shadow-2xs border border-secondary/10">
          {metrics.map((metric, metricIndex) => (
            <div
              className="flex min-w-0 flex-col items-center border-r border-secondary/10 px-4 py-3 last:border-r-0 sm:px-5 lg:px-8"
              key={metric.label}
            >
              <dt className="order-2 mt-3 text-xs font-bold uppercase tracking-wider text-secondary">
                {metric.label}
              </dt>
              <dd className="flex flex-col items-center text-3xl font-extrabold tracking-[-0.03em] text-secondary sm:text-4xl">
                <img
                  alt=""
                  className="mb-3 size-8 object-contain"
                  height="32"
                  loading="lazy"
                  src={`/images/figma/trust-${metricIndex + 1}.svg`}
                  width="32"
                />
                <AnimatedMetricValue value={metric.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
