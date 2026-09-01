import { motion } from 'framer-motion'
import { Check, MessageCircle, Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { PsychologistProfile } from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface FirstStepItem {
  description: string
  title: string
}

interface PsychologistProfileDetailsProps {
  psychologist: PsychologistProfile
}

export function PsychologistProfileDetails({ psychologist }: PsychologistProfileDetailsProps) {
  const { t } = useTranslation()
  const firstSteps = t('routes.profile.firstSteps', { returnObjects: true }) as FirstStepItem[]

  return (
    <>
      <section className="bg-white px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div>
            <h2 className="max-w-xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">
              {t('routes.profile.supportAreasTitle')}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-secondary/65">
              {t('routes.profile.supportAreasDescription', { name: psychologist.nickname })}
            </p>
          </div>

          <ul className="border-t border-secondary/15">
            {psychologist.specializations.map((specialization) => (
              <li
                className="flex items-start gap-4 border-b border-secondary/15 py-5 text-base font-medium leading-7 text-secondary sm:text-lg"
                key={specialization}
              >
                <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full bg-[#eee5d8] text-primary">
                  <Check aria-hidden="true" size={14} strokeWidth={2.5} />
                </span>
                {specialization}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="max-w-3xl">
            <Quote aria-hidden="true" className="text-primary" size={34} />
            <blockquote className="mt-8 text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] text-secondary sm:text-5xl">
              “{t('routes.profile.conversationQuote')}”
            </blockquote>
            <p className="mt-7 max-w-2xl text-base leading-7 text-secondary/65">
              {t('routes.profile.conversationDescription')}
            </p>
          </div>

          <div className="rounded-[2rem] bg-[#eee5d8] p-7 sm:p-10">
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-secondary">
              {t('routes.profile.firstStepTitle')}
            </h2>
            <ol className="mt-8 border-t border-secondary/15">
              {firstSteps.map((step, stepIndex) => (
                <li className="grid grid-cols-[auto_1fr] gap-5 border-b border-secondary/15 py-6" key={step.title}>
                  <span className="font-semibold tabular-nums text-primary">0{stepIndex + 1}</span>
                  <div>
                    <h3 className="font-semibold text-secondary">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-secondary/60">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-secondary px-5 py-24 text-white lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              {t('routes.profile.bookingTitle')}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65">
              {t('routes.profile.bookingDescription', { name: psychologist.nickname })}
            </p>
            {psychologist.licenseNumber && (
              <p className="mt-8 text-sm text-white/45">
                {t('routes.profile.licenseLabel')}: {psychologist.licenseNumber}
              </p>
            )}
          </div>

          <motion.a
            className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-7 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary"
            href={psychologist.bookingUrl}
            rel="noopener noreferrer"
            target="_blank"
            transition={INTERACTIVE_SPRING}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <MessageCircle aria-hidden="true" size={19} />
            {t('routes.profile.bookingAction')}
          </motion.a>
        </div>
      </section>
    </>
  )
}
