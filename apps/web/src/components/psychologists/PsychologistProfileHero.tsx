import { motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, BookOpen, Clock3, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react'
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

  const highlightSpecialty = psychologist.specializations.find((s) =>
    /brainspotting|art therapy|cbt|trauma|child/i.test(s)
  ) || psychologist.specializations[0]

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
            <h1 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-secondary outline-none sm:text-4xl" data-route-heading tabIndex={-1}>{psychologist.name}</h1>
            
            {/* Trust Badges Cluster */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-[#fcf8f1] px-3 py-1 text-xs font-semibold text-secondary">
                <GraduationCap aria-hidden="true" size={13} className="text-[#946a22]" />
                {psychologist.credential}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-[#fcf8f1] px-3 py-1 text-xs font-semibold text-secondary">
                <Clock3 aria-hidden="true" size={13} className="text-[#946a22]" />
                {t('routes.psychologists.cards.experience', { count: psychologist.experienceYears })}
              </span>
              {psychologist.licenseNumber && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-[#fcf8f1] px-3 py-1 text-xs font-semibold text-secondary"
                  title={psychologist.licenseNumber}
                >
                  <ShieldCheck aria-hidden="true" size={13} className="text-[#946a22]" />
                  <span>{t('routes.profile.verifiedLicense')}: <span className="font-normal">{psychologist.licenseNumber}</span></span>
                </span>
              )}
              {highlightSpecialty && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-[#fcf8f1] px-3 py-1 text-xs font-semibold text-secondary">
                  <Sparkles aria-hidden="true" size={13} className="text-[#946a22]" />
                  {highlightSpecialty}
                </span>
              )}
            </div>

            {psychologist.shortBio && (
              <p className="mt-5 text-sm sm:text-base leading-relaxed text-secondary/85">
                {psychologist.shortBio}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                onClick={() => openIntake({ psychologistId: psychologist.id })}
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer shadow-xs"
                transition={INTERACTIVE_SPRING}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('intakeDialog.title')}
              </motion.button>

              <motion.a
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-primary/40 bg-[#fcf8f1] px-4 py-3 text-sm font-semibold text-secondary outline-none shadow-xs transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                href="#profile-story"
                transition={INTERACTIVE_SPRING}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <BookOpen aria-hidden="true" size={16} className="text-[#946a22]" />
                {t('routes.profile.getStory', { name: psychologist.nickname })}
                <ArrowDown aria-hidden="true" size={14} className="opacity-70" />
              </motion.a>
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
