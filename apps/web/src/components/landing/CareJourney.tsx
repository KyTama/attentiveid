import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface JourneyStep {
  description: string
  points: string[]
  title: string
}
const journeyImages = [
  { height: 174, src: '/images/figma/browse-psychologists.webp', width: 160 },
  { height: 187, src: '/images/figma/guided-matching.webp', width: 161 },
  { height: 259, src: '/images/figma/session-video.webp', width: 366 },
] as const

export function CareJourney() {
  const { t } = useTranslation()
  const steps = t('homepage.journey.steps', { returnObjects: true }) as JourneyStep[]

  return (
    <section className="px-5 py-20 lg:px-8 lg:py-28" id="process">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <h2 className="max-w-2xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">{t('homepage.journey.title')}</h2>
          <div className="border-t border-primary/70 pt-6">
            <p className="max-w-2xl text-base leading-7 text-secondary/80">{t('homepage.journey.description')}</p>
            <div aria-hidden="true" className="mt-8 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-3">
              <span className="size-3 rounded-full bg-primary" />
              <span className="h-px bg-primary/45" />
              <span className="size-3 rounded-full border-2 border-primary bg-white" />
              <span className="h-px bg-primary/45" />
              <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary">
                <Check size={17} strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </div>
        <ol className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step, stepIndex) => {
            const image = journeyImages[stepIndex]
            return (
              <li className="flex min-h-[34rem] flex-col rounded-xl border border-secondary/10 bg-white/55 p-6 sm:p-8" key={step.title}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#946a22]">0{stepIndex + 1}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary/80">{t('homepage.journey.step')}</span>
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
                <p className="mt-3 text-sm leading-6 text-secondary/80">{step.description}</p>
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
