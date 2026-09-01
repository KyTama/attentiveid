import { motion } from 'framer-motion'
import { ArrowUpRight, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { PsychologistSummary } from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface PsychologistDirectoryCardProps {
  psychologist: PsychologistSummary
}

export function PsychologistDirectoryCard({ psychologist }: PsychologistDirectoryCardProps) {
  const { t } = useTranslation()

  return (
    <motion.li
      className="group flex min-h-full flex-col overflow-hidden rounded-[2rem] border border-secondary/10 bg-white"
      transition={INTERACTIVE_SPRING}
      whileHover={{ y: -6 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#e9ece9]">
        <img
          alt={psychologist.name}
          className="absolute inset-0 h-full w-full object-cover object-top"
          decoding="async"
          height="750"
          loading="lazy"
          src={psychologist.imageUrl}
          width="600"
        />
        <p className="absolute left-4 top-4 rounded-full bg-[#fbf8f2]/95 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-secondary shadow-sm backdrop-blur">
          {t(`routes.psychologists.cards.supportArea.${psychologist.supportArea}`)}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-secondary">{psychologist.name}</h2>
        <p className="mt-2 text-sm text-secondary/50">{psychologist.credential}</p>
        <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-secondary/65">
          <Clock3 aria-hidden="true" className="text-primary" size={17} />
          {t('routes.psychologists.cards.experience', { count: psychologist.experienceYears })}
        </p>

        <div className="mt-6 flex flex-wrap gap-2" aria-label={t('routes.psychologists.cards.supportAreasLabel')}>
          {psychologist.specializations.slice(0, 4).map((specialization) => (
            <span className="rounded-full border border-secondary/10 bg-[#f7f3ec] px-3 py-2 text-xs leading-5 text-secondary/60" key={specialization}>
              {specialization}
            </span>
          ))}
        </div>

        <motion.div className="mt-auto pt-8" transition={INTERACTIVE_SPRING} whileHover={{ x: 4 }}>
          <Link
            className="inline-flex items-center gap-2 font-semibold text-secondary underline decoration-primary underline-offset-8 outline-none focus-visible:ring-2 focus-visible:ring-primary"
            to={`/psychologists/${psychologist.slug}`}
          >
            {t('routes.psychologists.viewProfile', { name: psychologist.nickname })}
            <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </motion.div>
      </div>
    </motion.li>
  )
}
