import { animate, motion, useInView } from 'framer-motion'
import { ArrowRight, CalendarCheck2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'
import { useIntakeModal } from '@/components/intake'

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
  const parsed = parseMetricValue(value)

  useEffect(() => {
    if (!isInView || !parsed) return

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
          const formatted = sep
            ? rounded.toLocaleString('id-ID').replace(/,/g, sep)
            : rounded.toString()
          setDisplayValue(`${prefix}${formatted}${suffix}`)
        }
      },
      onComplete: () => {
        setDisplayValue(value)
      },
    })

    return () => controls.stop()
  }, [isInView, value, parsed])

  return (
    <span ref={ref} className="tabular-nums" aria-label={value}>
      {displayValue}
    </span>
  )
}

export function HomepageHero() {
  const { t } = useTranslation()
  const { openIntake } = useIntakeModal()
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
            <motion.button
              type="button"
              onClick={() => openIntake()}
              className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-secondary px-6 py-4 text-sm font-semibold text-white shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer sm:w-auto"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <CalendarCheck2 aria-hidden="true" size={18} className="text-primary" />
              {copy.primaryAction}
            </motion.button>

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
