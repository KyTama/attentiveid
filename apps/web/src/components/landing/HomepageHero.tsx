import { animate, motion, useInView, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  ClipboardCheck,
  Gift,
  MapPin,
  MessageCircle,
  PawPrint,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'
import { resolveHeroSlides, type ResolvedHeroSlide } from '@/features/content/hero-slides'
import { useSciBriefHeroChips } from '@/features/sci-brief/use-hero-chips'
import { HeroSlideVisual } from './HeroSlideVisual'
import { useCampaignDock } from './use-campaign-dock'

export interface TrustMetric {
  label: string
  value: string
}

const SLIDE_AUTOPLAY_MS = 7000
const SLIDE_EASE = [0.2, 0.7, 0.2, 1] as const

export function renderDualColorHeading(text: string) {
  if (!text) return null

  if (text.includes('**')) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return (
      <>
        {parts.map((part, index) => {
          if (!part) return null
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <span key={index} className="text-[#C08A2C]">
                {part.slice(2, -2)}
              </span>
            )
          }
          const hasLeadingSpace = /^\s/.test(part)
          const hasTrailingSpace = /\s$/.test(part)
          const trimmed = part.trim()
          if (!trimmed) return part
          return (
            <Fragment key={index}>
              {hasLeadingSpace ? ' ' : null}
              <span className="text-[#14284B]">{trimmed}</span>
              {hasTrailingSpace ? ' ' : null}
            </Fragment>
          )
        })}
      </>
    )
  }

  if (text.includes('Biro Psikologi Klinis & Konseling')) {
    const remainder = text.replace('Biro Psikologi Klinis & Konseling', '').trim()
    return (
      <>
        <span className="text-[#14284B]">Biro Psikologi Klinis &amp; Konseling</span>{' '}
        <span className="text-[#C08A2C]">{remainder}</span>
      </>
    )
  }

  if (text.includes('Licensed Clinical Psychology Bureau')) {
    const remainder = text
      .replace('Licensed Clinical Psychology Bureau &', '')
      .replace('Licensed Clinical Psychology Bureau', '')
      .trim()
    return (
      <>
        <span className="text-[#14284B]">Licensed Clinical Psychology Bureau &amp;</span>{' '}
        <span className="text-[#C08A2C]">{remainder}</span>
      </>
    )
  }

  if (text.includes('&')) {
    const [first, ...rest] = text.split('&')
    return (
      <>
        <span className="text-[#14284B]">{first?.trim()} &amp;</span>{' '}
        <span className="text-[#C08A2C]">{rest.join('&').trim()}</span>
      </>
    )
  }

  return <span className="text-[#14284B]">{text}</span>
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
      ease: [0.16, 1, 0.3, 1],
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

function HeroActionButton({
  label,
  url,
  variant,
  isId,
}: {
  label: string
  url: string
  variant: 'primary' | 'secondary'
  isId: boolean
}) {
  const trimmedUrl = url.trim()
  const isPrimary = variant === 'primary'

  if (!trimmedUrl) {
    return (
      <button
        type="button"
        disabled
        title={isId ? 'Tautan akan segera tersedia' : 'Link coming soon'}
        className={
          isPrimary
            ? 'inline-flex items-center gap-2.5 rounded-[10px] bg-[#14284B]/80 px-5 py-3.5 text-sm font-bold text-white/85 shadow-[0_8px_20px_-8px_rgba(20,40,75,0.4)] cursor-not-allowed'
            : 'inline-flex items-center gap-2 text-sm font-semibold text-[#1D3560]/60 cursor-not-allowed'
        }
      >
        <span>{label}</span>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-[#E2AE52]">
          {isId ? 'Segera' : 'Soon'}
        </span>
      </button>
    )
  }

  const className = isPrimary
    ? 'inline-flex items-center gap-2.5 rounded-[10px] bg-[#14284B] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(20,40,75,0.5)] outline-none hover:bg-[#1D3560] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer'
    : 'inline-flex items-center gap-2 border-b-[1.5px] border-transparent pb-0.5 text-sm font-semibold text-[#1D3560] outline-none hover:border-[#E2AE52] focus-visible:ring-2 focus-visible:ring-primary cursor-pointer'

  const icon =
    trimmedUrl.startsWith('http') || isPrimary ? (
      <ArrowUpRight size={15} strokeWidth={2.2} />
    ) : (
      <ArrowRight size={15} strokeWidth={2.2} />
    )

  if (trimmedUrl.startsWith('http')) {
    return (
      <motion.a
        href={trimmedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        transition={INTERACTIVE_SPRING}
        whileHover={isPrimary ? { y: -2 } : { x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{label}</span>
        {icon}
      </motion.a>
    )
  }

  if (trimmedUrl.startsWith('#')) {
    return (
      <motion.a
        href={trimmedUrl}
        className={className}
        transition={INTERACTIVE_SPRING}
        whileHover={isPrimary ? { y: -2 } : { x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span>{label}</span>
        {icon}
      </motion.a>
    )
  }

  return (
    <motion.div
      transition={INTERACTIVE_SPRING}
      whileHover={isPrimary ? { y: -2 } : { x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={trimmedUrl} className={className}>
        <span>{label}</span>
        {icon}
      </Link>
    </motion.div>
  )
}

function SlideMiddleDetails({ slide, isId }: { slide: ResolvedHeroSlide; isId: boolean }) {
  const portalChips = useSciBriefHeroChips(slide.layout === 'scientific-brief', isId)
  const chips = portalChips ?? slide.chips
  if (slide.layout === 'practice' && slide.location) {
    return (
      <div className="mt-4 flex items-center gap-2 text-[13.5px] text-[#7B8496]">
        <MapPin size={15} className="shrink-0 text-[#C08A2C]" />
        <span>{slide.location}</span>
      </div>
    )
  }

  if (slide.layout === 'pet-garden' && slide.note) {
    return (
      <div className="mt-4 flex w-fit max-w-[470px] items-center gap-2.5 rounded-xl border border-[#E8E1D5] bg-white px-3.5 py-2.5 text-[13.5px] text-[#7B8496]">
        <PawPrint size={16} className="shrink-0 text-[#C08A2C]" />
        <span>{slide.note}</span>
      </div>
    )
  }

  if (slide.layout === 'big10' && slide.steps && slide.steps.length > 0) {
    return (
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 overflow-hidden rounded-[14px] border border-[#E8E1D5] bg-white">
        {slide.steps.map((step, idx) => (
          <div
            key={`${slide.id}-step-${idx}`}
            className="border-t sm:border-t-0 sm:border-l border-[#E8E1D5] first:border-t-0 first:border-l-0 px-3.5 py-3 text-[12.5px] leading-[1.35] font-semibold text-[#14284B]"
          >
            <small className="mb-1 block text-[11.5px] font-bold text-[#C08A2C]">
              {String(idx + 1).padStart(2, '0')}
            </small>
            <span>{step}</span>
          </div>
        ))}
      </div>
    )
  }

  if (slide.layout === 'scientific-brief' && chips && chips.length > 0) {
    return (
      <div className="mt-5 flex flex-wrap gap-2">
        {chips.map((chip, idx) => {
          const isFeaturedChip = idx === 1 || chips.length === 1
          return (
            <span
              key={chip}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                isFeaturedChip
                  ? 'border border-[#14284B] bg-[#14284B] text-white'
                  : 'border border-[#DCD3C3] bg-white text-[#35435C]'
              }`}
            >
              {chip}
            </span>
          )
        })}
      </div>
    )
  }

  if (slide.layout === 'wisdom-ella') {
    const facts = isId
      ? [
          { title: '15+ thn', sub: 'berpraktik sejak 2010' },
          { title: 'UN · IOM', sub: 'dukungan psikososial Asia-Pasifik' },
          { title: 'Trauma-informed', sub: 'Brainspotting · DBT Art therapy' },
        ]
      : [
          { title: '15+ yrs', sub: 'practicing since 2010' },
          { title: 'UN · IOM', sub: 'psychosocial support across Asia-Pacific' },
          { title: 'Trauma-informed', sub: 'Brainspotting · DBT Art therapy' },
        ]

    return (
      <div className="mt-5 flex flex-wrap sm:flex-nowrap gap-4 sm:gap-0 border-t border-[#E0D8CA] pt-4">
        {facts.map((fact) => (
          <div
            key={fact.title}
            className="sm:pr-5 sm:mr-5 sm:border-r sm:border-[#E0D8CA] last:border-0 last:mr-0 last:pr-0"
          >
            <b className="block text-[19px] sm:text-[21px] font-bold tracking-[-0.02em] text-[#14284B]">
              {fact.title}
            </b>
            <span className="mt-0.5 block text-xs leading-[1.35] text-[#7B8496]">{fact.sub}</span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export function HomepageHero() {
  const { i18n, t } = useTranslation()
  const isId = i18n.resolvedLanguage === 'id' || i18n.language === 'id'
  const localeKey = isId ? 'id' : 'en'
  const shouldReduceMotion = useReducedMotion()
  const { isDismissed, restoreDock } = useCampaignDock()
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const pointerStartX = useRef<number | null>(null)

  const managed = useLandingSection('hero')
  const metrics = managed
    ? [...managed.section.items]
        .sort((left, right) => left.position - right.position)
        .map((item) => ({ label: item.title[managed.locale], value: item.description[managed.locale] }))
    : (t('homepage.hero.metrics', { returnObjects: true }) as TrustMetric[])

  const slidesToRender = useMemo(() => {
    const allSlides = resolveHeroSlides(
      managed?.section as Extract<NonNullable<typeof managed>['section'], { key: 'hero' }> | undefined,
      managed?.locale || localeKey
    )
    const visibleSlides = allSlides.filter((slide) => slide.visible)
    return visibleSlides.length > 0 ? visibleSlides : [allSlides[0]]
  }, [managed?.section, managed?.locale, localeKey])

  const safeActiveIndex = Math.min(activeSlide, slidesToRender.length - 1)
  const currentSlide = slidesToRender[safeActiveIndex]

  const goToSlide = useCallback(
    (nextIndex: number, announce = true) => {
      if (slidesToRender.length <= 1) return
      const wrapped = ((nextIndex % slidesToRender.length) + slidesToRender.length) % slidesToRender.length
      setActiveSlide(wrapped)
      if (announce) {
        const targetSlide = slidesToRender[wrapped]
        setAnnouncement(
          isId
            ? `Slide ${wrapped + 1} dari ${slidesToRender.length}: ${targetSlide.tabLabel}`
            : `Slide ${wrapped + 1} of ${slidesToRender.length}: ${targetSlide.tabLabel}`
        )
      }
    },
    [slidesToRender, isId]
  )

  const nextSlide = useCallback(() => goToSlide(safeActiveIndex + 1), [goToSlide, safeActiveIndex])
  const prevSlide = useCallback(() => goToSlide(safeActiveIndex - 1), [goToSlide, safeActiveIndex])

  useEffect(() => {
    if (shouldReduceMotion || isPaused || slidesToRender.length <= 1) return
    const timer = window.setTimeout(() => {
      goToSlide(safeActiveIndex + 1, false)
    }, SLIDE_AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [safeActiveIndex, isPaused, shouldReduceMotion, slidesToRender.length, goToSlide])

  // Featured Campaigns & Portals
  const customCampaigns = (managed?.section as any)?.campaigns
  const campaignEyebrow = customCampaigns?.eyebrow?.[localeKey] || t('homepage.campaigns.eyebrow')
  const campaignDescription = customCampaigns?.description?.[localeKey] || t('homepage.campaigns.description')

  type CampaignCardItem = {
    id: string
    visible: boolean
    theme: 'gold' | 'navy' | 'blue' | 'emerald'
    icon: 'gift' | 'calendar' | 'clipboard' | 'sparkles' | 'shield' | 'message'
    badge: string
    title: string
    description: string
    cta: string
    url: string
  }

  const defaultCampaignCards: CampaignCardItem[] = [
    {
      id: 'card-free-session',
      visible: true,
      theme: 'gold',
      icon: 'gift',
      badge: t('homepage.campaigns.freeSession.badge'),
      title: t('homepage.campaigns.freeSession.title'),
      description: t('homepage.campaigns.freeSession.description'),
      cta: t('homepage.campaigns.freeSession.cta'),
      url: 'https://free-session.attentiveid.com',
    },
    {
      id: 'card-booking',
      visible: true,
      theme: 'navy',
      icon: 'calendar',
      badge: t('homepage.campaigns.booking.badge'),
      title: t('homepage.campaigns.booking.title'),
      description: t('homepage.campaigns.booking.description'),
      cta: t('homepage.campaigns.booking.cta'),
      url: 'https://booking.attentiveid.com/',
    },
  ]

  const defaultThemes = ['gold', 'navy', 'blue', 'emerald'] as const
  const defaultIcons = ['gift', 'calendar', 'clipboard', 'sparkles'] as const

  const resolvedCampaignCards: CampaignCardItem[] = Array.isArray(customCampaigns?.cards)
    ? customCampaigns.cards.map((card: any, idx: number) => {
        const fallback = defaultCampaignCards[idx]
        const resolvedUrl = card.url || fallback?.url || '#'
        return {
          id: card.id || `campaign-card-${idx}`,
          visible: card.visible !== false && !resolvedUrl.includes('assessment.attentiveid.com'),
          theme: (card.theme || defaultThemes[idx % defaultThemes.length]) as 'gold' | 'navy' | 'blue' | 'emerald',
          icon: (card.icon || defaultIcons[idx % defaultIcons.length]) as
            | 'gift'
            | 'calendar'
            | 'clipboard'
            | 'sparkles'
            | 'shield'
            | 'message',
          badge: card.badge?.[localeKey] || card.badge?.id || fallback?.badge || '',
          title: card.title?.[localeKey] || card.title?.id || fallback?.title || '',
          description: card.description?.[localeKey] || card.description?.id || fallback?.description || '',
          cta: card.cta?.[localeKey] || card.cta?.id || fallback?.cta || '',
          url: resolvedUrl,
        }
      })
    : defaultCampaignCards

  const visibleCampaignCards = resolvedCampaignCards.filter((card) => card.visible)
  const isCampaignsStripVisible = customCampaigns?.visible !== false && visibleCampaignCards.length > 0
  const isFloatingDockEnabled = customCampaigns?.showFloatingDock !== false

  const campaignGridColsClass =
    visibleCampaignCards.length === 1
      ? 'grid-cols-1'
      : visibleCampaignCards.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : visibleCampaignCards.length === 4
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
      : 'grid-cols-1 md:grid-cols-3'

  const tabGridStyle =
    slidesToRender.length > 0
      ? { gridTemplateColumns: `repeat(${slidesToRender.length}, minmax(0, 1fr))` }
      : undefined

  return (
    <section className="relative border-b border-[#E8E1D5] bg-[#FAF8F3]" id="home">
      <div className="mx-auto max-w-[1440px] px-4 pt-5 pb-8 sm:px-8 lg:px-[60px] lg:pt-7 lg:pb-12">
        {/* Top Eyebar */}
        <div className="flex items-center justify-between pb-5 text-xs">
          <div className="flex items-center gap-3 font-bold tracking-[0.22em] uppercase text-[#C08A2C]">
            <span className="inline-block h-[1.5px] w-[22px] bg-[#C08A2C]" aria-hidden="true" />
            <span>{t('homepage.hero.kicker')}</span>
          </div>
          <span className="hidden text-[13px] font-medium text-[#7B8496] sm:inline">
            {t('homepage.hero.kickerSub')}
          </span>
        </div>

        {/* Hero Carousel Region */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={t('homepage.hero.kicker')}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setIsPaused(false)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              nextSlide()
            } else if (event.key === 'ArrowLeft') {
              event.preventDefault()
              prevSlide()
            }
          }}
          onPointerDown={(event) => {
            pointerStartX.current = event.clientX
          }}
          onPointerUp={(event) => {
            if (pointerStartX.current === null) return
            const deltaX = event.clientX - pointerStartX.current
            if (Math.abs(deltaX) > 50) {
              if (deltaX < 0) nextSlide()
              else prevSlide()
            }
            pointerStartX.current = null
          }}
        >
          {/* Main Split Stage */}
          <div className="touch-pan-y select-none overflow-hidden rounded-[24px] bg-[#F5EFE5] shadow-[0_1px_0_#e8e1d5,0_30px_60px_-40px_rgba(20,40,75,0.25)] lg:h-[640px]">
            <motion.div
              key={currentSlide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${safeActiveIndex + 1} of ${slidesToRender.length}`}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: SLIDE_EASE }}
              className="grid h-full grid-cols-1 lg:h-[640px] lg:grid-cols-[45%_55%]"
            >
              {/* Left Column: Editorial Copy */}
              <div className="flex min-h-[440px] sm:min-h-[410px] lg:min-h-0 lg:h-full flex-col justify-center px-6 py-7 sm:px-10 sm:py-9 lg:py-10 lg:pr-8 lg:pl-14">
                <div className="mb-4 lg:mb-5 inline-flex items-center gap-2.5 text-[11.5px] font-bold tracking-[0.17em] uppercase text-[#C08A2C]">
                  <span
                    className="inline-block size-2 shrink-0 rounded-full bg-[#E2AE52] shadow-[0_0_0_5px_rgba(226,174,82,0.2)]"
                    aria-hidden="true"
                  />
                  <span>{currentSlide.tag}</span>
                </div>

                <h1
                  className={`text-balance font-sans font-bold tracking-[-0.035em] text-[#14284B] ${
                    currentSlide.layout === 'practice'
                      ? 'text-[34px] leading-[1.08] sm:text-[42px] lg:text-[44px] xl:text-[48px] lg:leading-[1.05]'
                      : 'text-[34px] leading-[1.06] sm:text-[44px] lg:text-[48px] xl:text-[52px] lg:leading-[1.04]'
                  }`}
                  data-route-heading
                  tabIndex={-1}
                >
                  {renderDualColorHeading(currentSlide.headline)}
                </h1>

                <p className="mt-5 max-w-[480px] text-[15px] leading-[1.65] text-[#4A566B] sm:text-[16.5px]">
                  {currentSlide.description}
                </p>

                <SlideMiddleDetails slide={currentSlide} isId={isId} />

                <div className="mt-7 flex flex-wrap items-center gap-5 sm:gap-6">
                  <HeroActionButton
                    label={currentSlide.primaryCta}
                    url={currentSlide.primaryCtaUrl}
                    variant="primary"
                    isId={isId}
                  />
                  <HeroActionButton
                    label={currentSlide.secondaryCta}
                    url={currentSlide.secondaryCtaUrl}
                    variant="secondary"
                    isId={isId}
                  />
                </div>
              </div>

              {/* Right Column: Arch Visual Composition (first on mobile) */}
              <div className="order-first lg:order-last">
                <HeroSlideVisual slide={currentSlide} isId={isId} isActive />
              </div>
            </motion.div>
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>

          {/* Bottom Tab Navigation & Prev/Next Arrows */}
          {slidesToRender.length > 1 && (
            <div className="flex flex-col gap-4 py-6 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
              <div
                className="grid flex-1 gap-3 sm:gap-4"
                style={tabGridStyle}
                role="tablist"
                aria-label={isId ? 'Pilih slide hero' : 'Select hero slide'}
              >
                {slidesToRender.map((slide, idx) => {
                  const isActiveTab = idx === safeActiveIndex
                  const isCompletedTab = idx < safeActiveIndex
                  const displayIndex = String(idx + 1).padStart(2, '0')
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={isActiveTab}
                      aria-current={isActiveTab ? 'true' : undefined}
                      aria-label={`${displayIndex} ${slide.tabLabel}`}
                      onClick={() => goToSlide(idx)}
                      className={`group text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${
                        isActiveTab ? 'text-[#14284B]' : 'text-[#7B8496] hover:text-[#14284B]'
                      }`}
                    >
                      <div className="mb-2.5 flex items-baseline gap-2 text-[13px] font-semibold">
                        <b className={`text-xs ${isActiveTab ? 'text-[#C08A2C]' : 'text-[#B3B8C2]'}`}>
                          {displayIndex}
                        </b>
                        <span className="hidden truncate lg:inline">{slide.tabLabel}</span>
                      </div>
                      <div className="h-[3px] overflow-hidden rounded-[3px] bg-[#E1DDD5]">
                        {isActiveTab ? (
                          <motion.div
                            key={`${slide.id}-${safeActiveIndex}-${isPaused ? 'paused' : 'run'}`}
                            initial={{ width: shouldReduceMotion || isPaused ? '45%' : '0%' }}
                            animate={{ width: shouldReduceMotion || isPaused ? '45%' : '100%' }}
                            transition={{
                              duration: shouldReduceMotion || isPaused ? 0 : SLIDE_AUTOPLAY_MS / 1000,
                              ease: 'linear',
                            }}
                            className="h-full bg-[#C08A2C]"
                          />
                        ) : (
                          <div
                            className={`h-full transition-colors ${
                              isCompletedTab ? 'w-full bg-[#D6C7A8]' : 'w-0 bg-transparent'
                            }`}
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Circular Arrows */}
              <div className="hidden lg:flex items-center gap-2.5 shrink-0">
                <motion.button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="grid size-[42px] place-items-center rounded-full border border-[#D9D5CC] bg-white text-[#14284B] shadow-2xs hover:border-[#14284B] hover:bg-[#14284B] hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  transition={INTERACTIVE_SPRING}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={16} strokeWidth={2.2} />
                </motion.button>
                <motion.button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="grid size-[42px] place-items-center rounded-full border border-[#D9D5CC] bg-white text-[#14284B] shadow-2xs hover:border-[#14284B] hover:bg-[#14284B] hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  transition={INTERACTIVE_SPRING}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight size={16} strokeWidth={2.2} />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-Bleed Ticker Ribbon */}
      <div className="border-y border-[#E8E1D5] bg-white py-5">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-center gap-3 px-4 text-center text-[13.5px] font-semibold text-[#35435C] sm:flex-row sm:gap-0">
          {(t('homepage.hero.tickerPillars', { returnObjects: true }) as string[]).map((pillar, idx) => (
            <div
              key={pillar}
              className={`flex items-center gap-2.5 sm:px-8 ${
                idx > 0 ? 'sm:border-l sm:border-[#E8E1D5]' : ''
              }`}
            >
              <span className="text-[#E2AE52]" aria-hidden="true">
                ✳
              </span>
              <span>{pillar}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-[60px]">
        {/* Sub-Hero Command Strip (Featured Campaigns & Portals) */}
        {isCampaignsStripVisible && (
          <div className="rounded-2xl border border-secondary/10 bg-[#FAF7F2] p-6 sm:p-8">
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
                {isDismissed && isFloatingDockEnabled && (
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

            <div className={`mt-5 grid gap-4 ${campaignGridColsClass}`}>
              {visibleCampaignCards.map((card) => {
                const themeStyles =
                  card.theme === 'gold'
                    ? {
                        card: 'border-primary/50 bg-gradient-to-b from-white to-[#FDF8EE] hover:border-primary',
                        badge: 'bg-[#FAF0D7] text-[#8C6013]',
                        iconBox: 'bg-[#FAF0D7] text-[#8C6013]',
                        titleHover: 'group-hover:text-[#8C6013]',
                        footer: 'border-[#E9B949]/20 text-[#8C6013]',
                      }
                    : card.theme === 'blue'
                    ? {
                        card: 'border-secondary/15 bg-white hover:border-secondary/35',
                        badge: 'bg-[#EBF3FB] text-[#1E568A]',
                        iconBox: 'bg-[#EBF3FB] text-[#1E568A]',
                        titleHover: 'group-hover:text-[#1E568A]',
                        footer: 'border-secondary/10 text-[#1E568A]',
                      }
                    : card.theme === 'emerald'
                    ? {
                        card: 'border-emerald-600/20 bg-white hover:border-emerald-600/40',
                        badge: 'bg-emerald-50 text-emerald-800',
                        iconBox: 'bg-emerald-50 text-emerald-800',
                        titleHover: 'group-hover:text-emerald-800',
                        footer: 'border-secondary/10 text-emerald-800',
                      }
                    : {
                        card: 'border-secondary/15 bg-white hover:border-secondary/35',
                        badge: 'bg-secondary/10 text-secondary',
                        iconBox: 'bg-secondary/10 text-secondary',
                        titleHover: 'group-hover:text-primary',
                        footer: 'border-secondary/10 text-secondary group-hover:text-primary',
                      }

                const IconComponent =
                  card.icon === 'gift'
                    ? Gift
                    : card.icon === 'calendar'
                    ? CalendarCheck2
                    : card.icon === 'clipboard'
                    ? ClipboardCheck
                    : card.icon === 'shield'
                    ? ShieldCheck
                    : card.icon === 'message'
                    ? MessageCircle
                    : Sparkles

                return (
                  <motion.a
                    key={card.id}
                    href={card.url}
                    target={card.url.startsWith('http') ? '_blank' : undefined}
                    rel={card.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={`${card.title} - ${card.cta}`}
                    className={`group relative flex flex-col justify-between rounded-xl border p-5 sm:p-6 shadow-xs transition-all hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer ${themeStyles.card}`}
                    transition={INTERACTIVE_SPRING}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${themeStyles.badge}`}
                      >
                        {card.badge}
                      </span>
                      <div className={`grid size-9 place-items-center rounded-lg ${themeStyles.iconBox}`}>
                        <IconComponent size={18} strokeWidth={2.2} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3
                        className={`text-base font-bold text-secondary transition-colors sm:text-lg ${themeStyles.titleHover}`}
                      >
                        {card.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary/80">
                        {card.description}
                      </p>
                    </div>
                    <div
                      className={`mt-5 flex items-center justify-between border-t pt-3 text-xs sm:text-sm font-semibold ${themeStyles.footer}`}
                    >
                      <span>{card.cta}</span>
                      <ArrowUpRight
                        size={16}
                        strokeWidth={2.5}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </motion.a>
                )
              })}
            </div>
          </div>
        )}

        {/* 4 Trust Counter Metrics */}
        <dl className="mt-6 grid grid-cols-2 rounded-2xl border border-secondary/10 bg-white/80 py-8 text-center shadow-2xs sm:grid-cols-4 sm:py-10">
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
