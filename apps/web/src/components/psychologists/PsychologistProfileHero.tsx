import { motion } from 'framer-motion'
import { ArrowLeft, BadgeCheck, Clock3, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { PsychologistProfile } from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface PsychologistProfileHeroProps {
  psychologist: PsychologistProfile
}

export function PsychologistProfileHero({ psychologist }: PsychologistProfileHeroProps) {
  const { t } = useTranslation()

  return (
    <section className="px-5 pb-20 pt-8 lg:px-8 lg:pb-28 lg:pt-12">
      <div className="mx-auto max-w-7xl">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-secondary/65 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          to="/psychologists"
        >
          <ArrowLeft aria-hidden="true" size={18} />
          {t('routes.profile.back')}
        </Link>

        <div className="mt-8 grid overflow-hidden rounded-[2.5rem] bg-secondary text-white lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[31rem] overflow-hidden bg-[#dfe3df] sm:min-h-[40rem] lg:min-h-[46rem]">
            <img
              alt={psychologist.name}
              className="absolute inset-0 h-full w-full object-cover object-top"
              decoding="async"
              fetchPriority="high"
              height="900"
              src={psychologist.imageUrl}
              width="720"
            />
          </div>

          <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14 xl:p-16">
            <div>
              <p className="inline-flex rounded-full border border-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                {t(`routes.psychologists.cards.supportArea.${psychologist.supportArea}`)}
              </p>
              <h1
                className="mt-7 max-w-3xl text-balance text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.94] tracking-[-0.04em] text-white outline-none"
                data-route-heading
                tabIndex={-1}
              >
                {psychologist.name}
              </h1>
              <p className="mt-5 text-lg text-white/60">{psychologist.credential}</p>

              <div className="mt-9 flex flex-wrap gap-2" aria-label={t('routes.profile.supportLabel')}>
                {psychologist.specializations.slice(0, 5).map((specialization) => (
                  <span
                    className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm leading-6 text-white/70"
                    key={specialization}
                  >
                    {specialization}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-14">
              <dl className="grid gap-px overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-2">
                <div className="bg-secondary p-5">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    <Clock3 aria-hidden="true" className="text-primary" size={17} />
                    {t('routes.profile.experienceLabel')}
                  </dt>
                  <dd className="mt-3 font-semibold text-white">
                    {t('routes.psychologists.cards.experience', { count: psychologist.experienceYears })}
                  </dd>
                </div>
                <div className="bg-secondary p-5">
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/45">
                    <BadgeCheck aria-hidden="true" className="text-primary" size={17} />
                    {t('routes.profile.credentialLabel')}
                  </dt>
                  <dd className="mt-3 font-semibold text-white">{psychologist.credential}</dd>
                </div>
              </dl>

              <motion.a
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary px-7 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary sm:w-auto"
                href={psychologist.bookingUrl}
                rel="noopener noreferrer"
                target="_blank"
                transition={INTERACTIVE_SPRING}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle aria-hidden="true" size={19} />
                {t('routes.profile.bookWhatsApp', { name: psychologist.nickname })}
              </motion.a>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/50">{t('routes.profile.bookingHandoff')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
