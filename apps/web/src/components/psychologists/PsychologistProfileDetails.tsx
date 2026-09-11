import { motion } from 'framer-motion'
import { BadgeCheck, Clock3, MessageCircle, Quote } from 'lucide-react'
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

  return (
    <>
      <section className="bg-white px-5 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 lg:gap-24">
          <div>
            <h2 className="text-balance text-3xl font-bold tracking-[-0.03em] text-secondary sm:text-4xl">{t('routes.profile.noteTitle', { name: psychologist.nickname })}</h2>
            <p className="mt-6 text-base leading-8 text-secondary/80">{t('routes.profile.conversationDescription')}</p>
            <p className="mt-5 text-base leading-8 text-secondary/80">{t('routes.profile.supportAreasDescription', { name: psychologist.nickname })}</p>
          </div>
          <figure className="self-center">
            <Quote aria-hidden="true" className="text-primary" size={40} />
            <blockquote className="mt-4 font-serif text-3xl font-semibold leading-relaxed text-secondary sm:text-4xl">{t('routes.profile.conversationQuote')}</blockquote>
          </figure>
        </div>
      </section>
      <section className="relative overflow-hidden bg-[#faf3e7] px-5 py-16 lg:px-8 lg:py-24">
        <img alt="" className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/3 object-contain object-right opacity-40" height="758" loading="lazy" src="/images/figma/profile-rings.webp" width="327" />
        <div className="relative mx-auto max-w-6xl">
          <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-[-0.03em] text-secondary sm:text-4xl">{t('routes.profile.firstStepTitle')}</h2>
          <ol className="mt-8 max-w-3xl">
            {firstSteps.map((step, stepIndex) => (
              <li className="grid grid-cols-[auto_1fr] gap-6 border-b border-primary/20 py-6 sm:gap-10" key={step.title}>
                <span className="text-4xl font-light tabular-nums text-[#946a22]">0{stepIndex + 1}</span>
                <div>
                  <h3 className="text-base font-bold text-secondary">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-secondary/80">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <dl className="mt-12 grid gap-7 border-t border-primary/20 pt-8 md:grid-cols-3">
            <div>
              <dt className="flex items-center gap-2 text-sm font-semibold"><Clock3 aria-hidden="true" className="text-[#946a22]" size={20} />{t('routes.profile.experienceLabel')}</dt>
              <dd className="mt-3 text-sm text-secondary/80">{t('routes.psychologists.cards.experience', { count: psychologist.experienceYears })}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm font-semibold"><BadgeCheck aria-hidden="true" className="text-[#946a22]" size={20} />{t('routes.profile.credentialLabel')}</dt>
              <dd className="mt-3 text-sm text-secondary/80">{psychologist.credential}</dd>
            </div>
            {psychologist.licenseNumber && (
              <div>
                <dt className="text-sm font-semibold">{t('routes.profile.licenseLabel')}</dt>
                <dd className="mt-3 break-words text-sm text-secondary/80">{psychologist.licenseNumber}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
      <section className="bg-secondary px-5 py-16 text-white lg:px-8 lg:py-20" id="profile-booking">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="max-w-xl text-balance text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{t('routes.profile.bookingTitle')}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80">{t('routes.profile.bookingDescription', { name: psychologist.nickname })}</p>
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
