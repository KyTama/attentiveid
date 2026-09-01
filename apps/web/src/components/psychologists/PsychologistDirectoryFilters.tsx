import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  psychologistExperienceOptions,
  psychologistSupportAreaOptions,
  type PsychologistExperienceLevel,
  type PsychologistSupportArea,
} from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'

interface PsychologistDirectoryFiltersProps {
  experienceLevel: PsychologistExperienceLevel | 'all'
  hasActiveQuery: boolean
  onClear: () => void
  onExperienceChange: (value: PsychologistExperienceLevel | 'all') => void
  onSearchChange: (value: string) => void
  onSupportAreaChange: (value: PsychologistSupportArea | 'all') => void
  resultCount: number | null
  search: string
  supportArea: PsychologistSupportArea | 'all'
}

export function PsychologistDirectoryFilters({
  experienceLevel,
  hasActiveQuery,
  onClear,
  onExperienceChange,
  onSearchChange,
  onSupportAreaChange,
  resultCount,
  search,
  supportArea,
}: PsychologistDirectoryFiltersProps) {
  const { t } = useTranslation()

  return (
    <section className="border-y border-secondary/10 bg-[#f3ede3] px-5 py-16 lg:px-8 lg:py-20" id="finder">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('routes.psychologists.finder.eyebrow')}</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <h2 className="max-w-xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">
              {t('routes.psychologists.finder.title')}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-secondary/60 sm:text-base">
              {t('routes.psychologists.finder.description')}
            </p>
          </div>
          <div className="rounded-3xl border border-secondary/10 bg-white/70 p-5 sm:p-7">
            <p className="text-sm font-semibold text-secondary">{t('routes.psychologists.finder.reassuranceTitle')}</p>
            <p className="mt-2 text-sm leading-6 text-secondary/55">{t('routes.psychologists.finder.reassuranceDescription')}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-9">
          <fieldset>
            <legend className="text-sm font-semibold text-secondary">{t('routes.psychologists.filters.supportLegend')}</legend>
            <div className="mt-4 flex flex-wrap gap-2" role="list">
              {psychologistSupportAreaOptions.map((option) => {
                const active = option === supportArea
                return (
                  <motion.button
                    aria-pressed={active}
                    className={active
                      ? 'rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                      : 'rounded-full border border-secondary/15 bg-white/70 px-4 py-3 text-sm font-medium text-secondary/70 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'}
                    key={option}
                    onClick={() => onSupportAreaChange(option)}
                    transition={INTERACTIVE_SPRING}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t(`routes.psychologists.filters.support.${option}`)}
                  </motion.button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-secondary">{t('routes.psychologists.filters.experienceLegend')}</legend>
            <div className="mt-4 flex flex-wrap gap-2" role="list">
              {psychologistExperienceOptions.map((option) => {
                const active = option === experienceLevel
                return (
                  <motion.button
                    aria-pressed={active}
                    className={active
                      ? 'rounded-full bg-secondary px-4 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
                      : 'rounded-full border border-secondary/15 bg-white/70 px-4 py-3 text-sm font-medium text-secondary/70 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'}
                    key={option}
                    onClick={() => onExperienceChange(option)}
                    transition={INTERACTIVE_SPRING}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {t(`routes.psychologists.filters.experience.${option}`)}
                  </motion.button>
                )
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 border-t border-secondary/10 pt-8 md:grid-cols-[1fr_auto] md:items-end">
            <label className="block">
              <span className="text-sm font-semibold text-secondary">{t('routes.psychologists.filters.searchLabel')}</span>
              <span className="mt-3 flex items-center gap-3 rounded-2xl border border-secondary/15 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-primary">
                <Search aria-hidden="true" className="shrink-0 text-secondary/40" size={19} />
                <input
                  className="min-w-0 flex-1 bg-transparent text-base text-secondary outline-none placeholder:text-secondary/35"
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={t('routes.psychologists.filters.searchPlaceholder')}
                  type="search"
                  value={search}
                />
              </span>
            </label>
            <div className="flex min-h-12 items-center justify-between gap-4 md:justify-end">
              {resultCount !== null && (
                <p aria-live="polite" className="text-sm font-semibold text-secondary/55">
                  {t('routes.psychologists.filters.resultCount', { count: resultCount })}
                </p>
              )}
              {hasActiveQuery && (
                <motion.button
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-secondary underline decoration-primary underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={onClear}
                  transition={INTERACTIVE_SPRING}
                  type="button"
                  whileHover={{ y: -2 }}
                >
                  <X aria-hidden="true" size={16} />
                  {t('routes.psychologists.filters.clear')}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
