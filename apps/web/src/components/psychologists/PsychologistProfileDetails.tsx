import { motion } from 'framer-motion'
import { MessageCircle, Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { PsychologistProfile } from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useIntakeModal } from '@/components/intake'

interface FirstStepItem {
  description: string
  title: string
}

interface PsychologistProfileDetailsProps {
  psychologist: PsychologistProfile
}

export function PsychologistProfileDetails({ psychologist }: PsychologistProfileDetailsProps) {
  const { t } = useTranslation()
  const { openIntake } = useIntakeModal()
  const firstSteps = t('routes.profile.firstSteps', { returnObjects: true }) as FirstStepItem[]

  const biographyParagraphs = psychologist.biography
    ? psychologist.biography
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
    : []

  return (
    <>
      <section id="profile-story" className="scroll-mt-12 bg-white px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <figure className="mb-14 text-center">
            <Quote aria-hidden="true" className="mx-auto text-primary" size={36} />
            <blockquote className="mt-4 font-serif text-2xl font-semibold italic leading-relaxed text-secondary sm:text-3xl sm:leading-relaxed">
              “{t('routes.profile.conversationQuote')}”
            </blockquote>
            <div className="mx-auto mt-6 h-0.5 w-16 rounded-full bg-primary/30" />
          </figure>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#845c1b]">
              {t('routes.profile.personalLetterLabel', { name: psychologist.nickname })}
            </p>
            <h2 className="mt-2 text-balance text-2xl font-bold tracking-tight text-secondary sm:text-3xl">{t('routes.profile.noteTitle', { name: psychologist.nickname })}</h2>
            {biographyParagraphs.length > 0 ? (
              <div className="mt-6 space-y-6">
                {biographyParagraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-base sm:text-lg leading-relaxed sm:leading-8 font-[450] text-secondary">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <p className="text-base sm:text-lg leading-relaxed sm:leading-8 font-[450] text-secondary">{t('routes.profile.conversationDescription')}</p>
                <p className="text-base sm:text-lg leading-relaxed sm:leading-8 font-[450] text-secondary">{t('routes.profile.supportAreasDescription', { name: psychologist.nickname })}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-[#faf3e7] px-5 py-16 lg:px-8 lg:py-24">
        <img alt="" className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/3 object-contain object-right opacity-40" height="758" loading="lazy" src="/images/figma/profile-rings.webp" width="327" />
        <div className="relative mx-auto max-w-6xl">
          <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight text-secondary sm:text-4xl">{t('routes.profile.firstStepTitle')}</h2>
          <ol className="mt-8 max-w-3xl">
            {firstSteps.map((step, stepIndex) => (
              <li className="grid grid-cols-[auto_1fr] gap-6 border-b border-primary/20 py-6 sm:gap-10" key={step.title}>
                <span className="text-4xl font-light tabular-nums text-[#946a22]">0{stepIndex + 1}</span>
                <div>
                  <h3 className="text-base font-bold text-secondary">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed font-[450] text-secondary">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="bg-secondary px-5 py-16 text-white lg:px-8 lg:py-20" id="profile-booking">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">{t('routes.profile.bookingTitle')}</h2>
            <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed font-[450] text-white">{t('routes.profile.bookingDescription', { name: psychologist.nickname })}</p>
            <div className="mt-7 flex flex-wrap gap-4">
              <motion.a className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-primary px-7 py-4 font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary" href={psychologist.bookingUrl} rel="noopener noreferrer" target="_blank" transition={INTERACTIVE_SPRING} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <MessageCircle aria-hidden="true" size={19} />{t('routes.profile.bookingAction')}
              </motion.a>
              <button
                type="button"
                onClick={() => openIntake({ psychologistId: psychologist.id })}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/40 px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer hover:bg-white/10"
              >
                {t('intakeDialog.title')}
              </button>
            </div>
          </div>
          <aside className="border-t border-white/20 pt-8 md:border-l md:border-t-0 md:pl-10">
            <MessageCircle aria-hidden="true" className="text-primary" size={28} />
            <h3 className="mt-5 text-xl font-bold">{t('routes.psychologists.help.eyebrow')}</h3>
            <p className="mt-4 text-sm leading-7 text-white/80">{t('routes.psychologists.help.description')}</p>
            <Link className="mt-6 inline-flex min-h-11 items-center rounded-md border border-primary/50 px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/psychologists">{t('routes.profile.viewDirectory')}</Link>
          </aside>
        </div>
      </section>
    </>
  )
}
