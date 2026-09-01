import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface JourneyStep {
  description: string
  points: string[]
  title: string
}
const journeyImages = [
  { height: 424, src: '/images/services/service-checkup.png', width: 423 },
  { height: 217, src: '/images/services/service-online.png', width: 328 },
  { height: 271, src: '/images/services/service-offline.png', width: 256 },
] as const

export function CareJourney() {
  const { t } = useTranslation()
  const steps = t('homepage.journey.steps', { returnObjects: true }) as JourneyStep[]

  return (
    <section className="px-5 py-24 lg:px-8 lg:py-32" id="process">
      <div className="mx-auto max-w-7xl">
        <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">{t('homepage.journey.title')}</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-secondary/65">{t('homepage.journey.description')}</p>
        <ol className="mt-16 grid gap-6 lg:grid-cols-3">
          {steps.map((step, stepIndex) => {
            const image = journeyImages[stepIndex]
            return (
              <li className="flex min-h-[34rem] flex-col rounded-[2rem] border border-secondary/10 bg-white/55 p-6 sm:p-8" key={step.title}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">0{stepIndex + 1}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary/40">{t('homepage.journey.step')}</span>
                </div>
                <div className="mt-7 grid h-48 place-items-center overflow-hidden rounded-2xl bg-[#eee5d8]">
                  <img
                    alt=""
                    className="max-h-40 max-w-[85%] object-contain"
                    decoding="async"
                    height={image?.height}
                    loading="lazy"
                    src={image?.src}
                    width={image?.width}
                  />
                </div>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.02em] text-secondary">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-secondary/60">{step.description}</p>
                <ul className="mt-6 grid gap-3">
                  {step.points.map((point) => (
                    <li className="flex gap-3 text-sm text-secondary/70" key={point}>
                      <Check aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={16} />
                      {point}
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

