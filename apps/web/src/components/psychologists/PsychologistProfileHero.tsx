import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { PsychologistProfile } from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useIntakeModal } from '@/components/intake'

interface PsychologistProfileHeroProps {
  psychologist: PsychologistProfile
}

export function PsychologistProfileHero({ psychologist }: PsychologistProfileHeroProps) {
  const { t } = useTranslation()
  const { openIntake } = useIntakeModal()

  return (
    <section className="bg-white px-5 pb-12 pt-6 lg:px-8 lg:pb-16">
      <div className="mx-auto max-w-7xl">
        <Link className="inline-flex min-h-11 items-center gap-2 text-sm text-secondary/80 underline decoration-primary underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary" to="/psychologists">
          <ArrowLeft aria-hidden="true" size={16} />{t('routes.profile.back')}
        </Link>
        <div className="mt-6 grid items-start gap-8 md:grid-cols-[0.8fr_1.2fr] xl:grid-cols-[0.85fr_1.25fr_0.65fr]">
          <div className="mx-auto aspect-[3/4] w-full max-w-80 overflow-hidden rounded-[3rem_3rem_1rem_1rem] border-2 border-primary bg-[#f5efe5]">
            <img alt={psychologist.name} className="h-full w-full object-cover object-top" decoding="async" fetchPriority="high" height="800" src={psychologist.imageUrl} width="600" />
          </div>
          <div className="py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#946a22]">{t(`routes.psychologists.cards.supportArea.${psychologist.supportArea}`)}</p>
            <h1 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-[-0.03em] text-secondary outline-none sm:text-4xl" data-route-heading tabIndex={-1}>{psychologist.name}</h1>
            <p className="mt-3 text-base text-secondary">{psychologist.credential}</p>
            <p className="mt-7 text-sm italic text-secondary/80">{t('routes.psychologists.cards.experience', { count: psychologist.experienceYears })}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <motion.a className="inline-flex min-h-11 items-center justify-center rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={psychologist.bookingUrl} rel="noopener noreferrer" target="_blank" transition={INTERACTIVE_SPRING} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                {t('routes.profile.bookWhatsApp', { name: psychologist.nickname })}
              </motion.a>
              <button
                type="button"
                onClick={() => openIntake({ psychologistId: psychologist.id })}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/40 bg-[#fcf8f1] px-4 py-3 text-sm font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-sm"
              >
                {t('intakeDialog.title')}
              </button>
              <a className="inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/40 px-4 py-3 text-sm text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary" href="#profile-booking">
                {t('routes.profile.helpAction')}<ArrowRight aria-hidden="true" size={16} />
              </a>
            </div>
            <p className="mt-4 text-sm leading-6 text-secondary/75">{t('routes.profile.bookingHandoff')}</p>
          </div>
          <div className="md:col-span-2 xl:col-span-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-[#946a22]">{t('routes.profile.supportLabel')}</h2>
            <ul className="mt-4 flex flex-wrap gap-2 xl:flex-col">
              {psychologist.specializations.map((specialization) => (
                <li className="rounded-full border border-primary/30 bg-[#fcf8f1] px-4 py-2 text-xs leading-5 text-secondary" key={specialization}>{specialization}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
