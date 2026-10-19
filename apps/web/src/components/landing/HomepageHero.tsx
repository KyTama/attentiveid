import { animate, motion, useInView } from 'framer-motion'
import { ArrowRight, ArrowUpRight, CalendarCheck2, ClipboardCheck, Gift, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'
import { useCampaignDock } from './use-campaign-dock'

interface TrustMetric {
  label: string
  value: string
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
          const formatted = sep === ','
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
  const isId = i18n.resolvedLanguage === 'id'
  const { isDismissed, restoreDock } = useCampaignDock()
  const managed = useLandingSection('hero')
  const metrics = managed
    ? [...managed.section.items]
      .sort((left, right) => left.position - right.position)
      .map((item) => ({ label: item.title[managed.locale], value: item.description[managed.locale] }))
    : t('homepage.hero.metrics', { returnObjects: true }) as TrustMetric[]
  const copy = {
    description: managed?.section.description[managed.locale] ?? t('homepage.hero.description'),
    primaryAction: managed?.section.primaryCta[managed.locale] ?? t('homepage.hero.primaryAction'),
    secondaryAction: managed?.section.secondaryCta[managed.locale] ?? t('homepage.hero.secondaryAction'),
    title: managed?.section.headline[managed.locale] ?? t('homepage.hero.title'),
  }

  return (
    <section className="relative border-b border-secondary/10" id="home">
      <div className="mx-auto grid min-h-[38rem] max-w-7xl items-stretch lg:grid-cols-[0.95fr_1.05fr]">
        <div className="min-w-0 flex flex-col justify-center px-5 py-16 sm:px-8 lg:px-8 lg:py-20">
          <h1
            className="max-w-3xl text-balance font-sans text-[clamp(2.5rem,4.3vw,3.75rem)] font-bold leading-[1.18] tracking-tight text-secondary outline-none"
            data-route-heading
            tabIndex={-1}
          >
            {copy.title}
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed sm:leading-8 font-[450] text-secondary sm:text-lg">
            {copy.description}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {/* Primary Action on Left: Plan your session */}
            <motion.a
              href="https://booking.attentiveid.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-secondary px-6 py-4 text-sm font-semibold text-white shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer sm:w-auto"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <CalendarCheck2 aria-hidden="true" size={18} className="text-primary" />
              {copy.primaryAction}
            </motion.a>

            {/* Secondary Action on Right: Find your Psychologist */}
            <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Link
                className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-secondary/20 bg-white/70 px-6 py-4 text-sm font-semibold text-secondary shadow-2xs outline-none hover:bg-white hover:border-secondary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto"
                to="/psychologists"
              >
                {copy.secondaryAction}
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            </motion.div>
          </div>
          <p className="mt-6 text-sm font-medium text-secondary/90">{t('homepage.hero.reassurance')}</p>

          {/* Reopen quick bar button directly in Hero */}
          {isDismissed && (
            <div className="mt-4">
              <motion.button
                type="button"
                onClick={restoreDock}
                className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-secondary shadow-2xs hover:bg-secondary hover:text-white transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary"
                transition={INTERACTIVE_SPRING}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles size={12} className="text-primary" />
                <span>{isId ? 'Tampilkan bar layanan di bawah' : 'Show quick bar'}</span>
              </motion.button>
            </div>
          )}
        </div>

        <div className="relative min-w-0 min-h-[22rem] overflow-hidden rounded-tl-[6rem] bg-[#ded8cd] sm:min-h-[30rem] lg:my-8 lg:min-h-0 lg:rounded-tl-[10rem]">
          <img
            alt={t('homepage.hero.imageAlt')}
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
            height="901"
            src="/images/figma/consultation-hero.webp"
            width="1600"
          />
        </div>
      </div>

      {/* Sub-Hero Command Strip (Option B) */}
      <div className="border-t border-secondary/10 bg-[#faf6ee] px-5 py-8 sm:px-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-primary/20 text-[#8C6013]">
                <Sparkles size={14} />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                {t('homepage.campaigns.eyebrow')}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-secondary/70">
                {t('homepage.campaigns.description')}
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
            {/* Card 1: First Free Session Consultation */}
            <motion.a
              href="https://attentive-free-session.page.gd/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('homepage.campaigns.freeSession.title')} - ${t('homepage.campaigns.freeSession.cta')}`}
              className="group relative flex flex-col justify-between rounded-xl border border-primary/50 bg-gradient-to-b from-white to-[#FDF8EE] p-5 sm:p-6 shadow-xs transition-all hover:border-primary hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-md bg-[#FAF0D7] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#8C6013]">
                  {t('homepage.campaigns.freeSession.badge')}
                </span>
                <div className="grid size-9 place-items-center rounded-lg bg-[#FAF0D7] text-[#8C6013]">
                  <Gift size={18} strokeWidth={2.2} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-secondary group-hover:text-[#8C6013] transition-colors sm:text-lg">
                  {t('homepage.campaigns.freeSession.title')}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary/80">
                  {t('homepage.campaigns.freeSession.description')}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-[#E9B949]/20 pt-3 text-xs sm:text-sm font-semibold text-[#8C6013]">
                <span>{t('homepage.campaigns.freeSession.cta')}</span>
                <ArrowUpRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.a>

            {/* Card 2: Booking / Reserve Psychologist */}
            <motion.a
              href="https://booking.attentiveid.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('homepage.campaigns.booking.title')} - ${t('homepage.campaigns.booking.cta')}`}
              className="group relative flex flex-col justify-between rounded-xl border border-secondary/15 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-secondary/35 hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-md bg-secondary/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-secondary">
                  {t('homepage.campaigns.booking.badge')}
                </span>
                <div className="grid size-9 place-items-center rounded-lg bg-secondary/10 text-secondary">
                  <CalendarCheck2 size={18} strokeWidth={2.2} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-secondary group-hover:text-primary transition-colors sm:text-lg">
                  {t('homepage.campaigns.booking.title')}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary/80">
                  {t('homepage.campaigns.booking.description')}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-secondary/10 pt-3 text-xs sm:text-sm font-semibold text-secondary group-hover:text-primary">
                <span>{t('homepage.campaigns.booking.cta')}</span>
                <ArrowUpRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.a>

            {/* Card 3: Digital Test Centre */}
            <motion.a
              href="https://attentive.portproject.my.id/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t('homepage.campaigns.testCentre.title')} - ${t('homepage.campaigns.testCentre.cta')}`}
              className="group relative flex flex-col justify-between rounded-xl border border-secondary/15 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-secondary/35 hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center rounded-md bg-[#EBF3FB] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1E568A]">
                  {t('homepage.campaigns.testCentre.badge')}
                </span>
                <div className="grid size-9 place-items-center rounded-lg bg-[#EBF3FB] text-[#1E568A]">
                  <ClipboardCheck size={18} strokeWidth={2.2} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-bold text-secondary group-hover:text-[#1E568A] transition-colors sm:text-lg">
                  {t('homepage.campaigns.testCentre.title')}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-secondary/80">
                  {t('homepage.campaigns.testCentre.description')}
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-secondary/10 pt-3 text-xs sm:text-sm font-semibold text-[#1E568A]">
                <span>{t('homepage.campaigns.testCentre.cta')}</span>
                <ArrowUpRight size={16} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.a>
          </div>
        </div>
      </div>

      <dl className="mx-auto grid max-w-7xl grid-cols-2 bg-white py-10 text-center sm:grid-cols-4">
        {metrics.map((metric, metricIndex) => (
          <div className="flex min-w-0 flex-col items-center border-r border-primary/30 px-4 py-6 last:border-r-0 sm:px-5 lg:px-8" key={metric.label}>
            <dt className="order-2 mt-3 text-xs font-bold uppercase tracking-wider text-secondary">{metric.label}</dt>
            <dd className="flex flex-col items-center text-4xl font-bold tracking-[-0.03em] text-secondary sm:text-5xl">
              <img alt="" className="mb-4 size-9 object-contain" height="36" loading="lazy" src={`/images/figma/trust-${metricIndex + 1}.svg`} width="36" />
              <AnimatedMetricValue value={metric.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
