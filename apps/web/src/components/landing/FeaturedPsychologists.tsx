import { motion } from 'framer-motion'
import { ArrowRight, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  listPsychologists,
  type PsychologistListState,
  type PsychologistSummary,
} from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export function FeaturedPsychologists() {
  const { t } = useTranslation()
  const [state, setState] = useState<PsychologistListState>({ status: 'loading' })
  const [selectedSlug, setSelectedSlug] = useState<string>('')

  useEffect(() => {
    let active = true
    listPsychologists()
      .then((result) => {
        if (!active) return
        setState(result)
        if (result.status === 'success') setSelectedSlug(result.psychologists[0]?.slug ?? '')
      })
      .catch(() => {
        if (active) setState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [])

  const featured = state.status === 'success' ? state.psychologists.slice(0, 4) : []
  const selected = featured.find((psychologist) => psychologist.slug === selectedSlug) ?? featured[0]

  return (
    <section className="bg-white px-5 py-24 lg:px-8 lg:py-32" id="psychologists">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary sm:text-5xl">{t('homepage.featured.title')}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-secondary/65">{t('homepage.featured.description')}</p>
          </div>
          <Link className="inline-flex min-h-11 items-center gap-2 font-semibold text-secondary underline decoration-primary underline-offset-8" to="/psychologists">
            {t('homepage.featured.viewAll')} <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>

        <div className="mt-12 min-h-[34rem]">
          {state.status === 'loading' && <div className="h-[34rem] animate-pulse rounded-[2rem] bg-[#eee8df]" aria-label={t('routes.common.loading')} />}
          {state.status === 'error' && <p className="rounded-2xl bg-[#eee8df] p-8">{t('routes.common.error')}</p>}
          {state.status === 'empty' && <p className="rounded-2xl bg-[#eee8df] p-8">{t('routes.psychologists.empty')}</p>}
          {selected && (
            <div className="grid overflow-hidden rounded-[2rem] bg-[#f3ede3] lg:grid-cols-[0.92fr_1.08fr]">
              <div className="relative min-h-[30rem] bg-[#e5e7e4]">
                <img
                  alt={selected.name}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  decoding="async"
                  height="750"
                  loading="lazy"
                  src={selected.imageUrl}
                  width="600"
                />
              </div>
              <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-14">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">{t('homepage.featured.available')}</p>
                  <h3 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-secondary">{selected.name}</h3>
                  <p className="mt-3 text-secondary/60">{selected.credential}</p>
                  <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-secondary/70">
                    <Clock3 aria-hidden="true" className="text-primary" size={18} />
                    {selected.experienceLabel} {t('homepage.featured.experience')}
                  </div>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {selected.specializations.slice(0, 5).map((specialization) => (
                      <span className="rounded-full border border-secondary/15 bg-white/65 px-3 py-2 text-xs text-secondary/70" key={specialization}>
                        {specialization}
                      </span>
                    ))}
                  </div>
                  <motion.div className="mt-9" transition={INTERACTIVE_SPRING} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                    <Link className="inline-flex rounded-full bg-secondary px-6 py-4 font-semibold text-white" to={`/psychologists/${selected.slug}`}>
                      {t('homepage.featured.viewProfile', { name: selected.nickname })}
                    </Link>
                  </motion.div>
                </div>

                <div className="mt-10 grid grid-cols-4 gap-3 border-t border-secondary/10 pt-7">
                  {featured.map((psychologist: PsychologistSummary) => (
                    <motion.button
                      aria-label={t('homepage.featured.select', { name: psychologist.name })}
                      aria-pressed={psychologist.slug === selected.slug}
                      className={psychologist.slug === selected.slug
                        ? 'overflow-hidden rounded-xl ring-2 ring-primary ring-offset-2'
                        : 'overflow-hidden rounded-xl opacity-55 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'}
                      key={psychologist.slug}
                      onClick={() => setSelectedSlug(psychologist.slug)}
                      transition={INTERACTIVE_SPRING}
                      type="button"
                      whileHover={{ y: -3, opacity: 1 }}
                    >
                      <img alt="" className="aspect-square w-full object-cover object-top" height="140" loading="lazy" src={psychologist.imageUrl} width="140" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
