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
      className="group flex min-h-full flex-col overflow-hidden rounded-xl border border-secondary/10 bg-white"
      transition={INTERACTIVE_SPRING}
      whileHover={{ y: -6 }}
    >
      <div className="relative aspect-[1.65/1] overflow-hidden bg-[#e9ece9]">
        <img
          alt={psychologist.name}
          className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
          decoding="async"
          height="750"
          loading="lazy"
          src={psychologist.imageUrl}
          width="600"
        />
        <p className="sr-only">
          {t(`routes.psychologists.cards.supportArea.${psychologist.supportArea}`)}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-balance text-lg font-bold tracking-[-0.02em] text-secondary">{psychologist.name}</h2>
        <p className="mt-2 text-sm text-secondary/80">{psychologist.credential}</p>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-secondary/80">
          <Clock3 aria-hidden="true" className="text-primary" size={17} />
          {t('routes.psychologists.cards.experience', { count: psychologist.experienceYears })}
        </p>

        <div className="mt-4 flex flex-wrap gap-2" aria-label={t('routes.psychologists.cards.supportAreasLabel')}>
          {psychologist.specializations.slice(0, 4).map((specialization) => (
            <span className="rounded-full border border-secondary/10 bg-[#f7f3ec] px-2 py-1 text-xs leading-5 text-secondary/80" key={specialization}>
              {specialization}
            </span>
          ))}
        </div>

        <motion.div className="mt-auto pt-4" transition={INTERACTIVE_SPRING} whileHover={{ x: 4 }}>
          <Link
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
