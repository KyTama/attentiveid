import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Clock3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  listPsychologists,
  type PsychologistListState,
} from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export function FeaturedPsychologists() {
  const { t } = useTranslation()
  const [state, setState] = useState<PsychologistListState>({ status: 'loading' })
  const [selectedSlug, setSelectedSlug] = useState('')

  useEffect(() => {
    let active = true
    listPsychologists()
      .then((result) => {
        if (!active) return
        setState(result)
      })
      .catch(() => {
        if (active) setState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [])

  const roster = state.status === 'success' ? state.psychologists : []
  const selected = roster.find((psychologist) => psychologist.slug === selectedSlug) ?? roster[0]

  return (
    <section className="bg-white px-5 py-24 lg:px-8 lg:py-32" id="psychologists">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-[-0.03em] text-secondary sm:text-4xl">{t('homepage.featured.title')}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-secondary/80">{t('homepage.featured.description')}</p>
          </div>
          <Link className="inline-flex min-h-11 items-center gap-2 font-semibold text-secondary underline decoration-primary underline-offset-8" to="/psychologists">
            {t('homepage.featured.viewAll')} <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>

        <div className="mt-12">
          {state.status === 'loading' && (
            <div aria-label={t('routes.common.loading')} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="aspect-[4/5] max-w-sm animate-pulse rounded-t-[5rem] bg-[#eee8df]" />
              <div className="min-h-[30rem] animate-pulse rounded-xl bg-[#eee8df]" />
            </div>
          )}
          {state.status === 'error' && <p className="rounded-2xl bg-[#eee8df] p-8">{t('routes.common.error')}</p>}
          {state.status === 'empty' && <p className="rounded-2xl bg-[#eee8df] p-8">{t('routes.psychologists.empty')}</p>}
          {selected && (
            <div>
              <div aria-live="polite" className="grid items-stretch gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[5rem] bg-[#eee8df] lg:mx-0">
                  <img alt={selected.name} className="absolute inset-0 h-full w-full object-cover object-top" decoding="async" height="750" loading="lazy" src={selected.imageUrl} width="600" />
                </div>
                <div className="flex flex-col justify-center border-y border-secondary/10 py-8 sm:p-10 lg:px-12">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#946a22]">{t(`routes.psychologists.cards.supportArea.${selected.supportArea}`)}</p>
                  <h3 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-secondary sm:text-4xl">{selected.name}</h3>
                  <p className="mt-3 text-base text-secondary/75">{selected.credential}</p>
                  <div className="mt-7 grid gap-3 text-sm text-secondary/75 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <Clock3 aria-hidden="true" className="mt-0.5 shrink-0 text-[#946a22]" size={18} />
                      {t('routes.psychologists.cards.experience', { count: selected.experienceYears })}
                    </div>
                    <div className="flex items-start gap-2">
                      <BadgeCheck aria-hidden="true" className="mt-0.5 shrink-0 text-[#946a22]" size={18} />
                      <span><span className="font-semibold text-secondary">{t('routes.profile.licenseLabel')}:</span> {selected.licenseNumber ?? t('homepage.featured.licenseUnavailable')}</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary/70">{t('homepage.featured.specializationsLabel')}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.specializations.slice(0, 6).map((specialization) => (
                        <span className="rounded-md border border-primary/30 bg-[#fcf8f1] px-3 py-2 text-xs leading-5 text-secondary/80" key={specialization}>{specialization}</span>
                      ))}
                    </div>
                  </div>
                  <motion.div className="mt-9" transition={INTERACTIVE_SPRING} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                    <Link className="inline-flex min-h-12 items-center gap-2 rounded-md bg-secondary px-6 py-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" to={`/psychologists/${selected.slug}`}>
                      {t('homepage.featured.viewProfile', { name: selected.nickname })}<ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  </motion.div>
                </div>
              </div>

              <Carousel className="mt-8 px-10 sm:px-12" opts={{ align: 'start', containScroll: 'trimSnaps' }}>
                <CarouselContent>
                  {roster.map((psychologist) => {
                    const isSelected = psychologist.slug === selected.slug
                    return (
                      <CarouselItem className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6" key={psychologist.slug}>
                        <motion.button
                          aria-label={t('homepage.featured.select', { name: psychologist.name })}
                          aria-pressed={isSelected}
                          className={isSelected
                            ? 'w-full rounded-xl bg-secondary p-2 text-left text-white outline-none ring-2 ring-primary ring-offset-2'
                            : 'w-full rounded-xl bg-[#f8f3eb] p-2 text-left text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'}
                          onClick={() => setSelectedSlug(psychologist.slug)}
                          transition={INTERACTIVE_SPRING}
                          type="button"
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <img alt="" className="aspect-[4/3] w-full rounded-lg object-cover object-top" height="150" loading="lazy" src={psychologist.imageUrl} width="200" />
                          <span className="mt-3 block truncate text-xs font-bold">{psychologist.nickname}</span>
                          <span className={isSelected ? 'mt-1 block truncate text-[0.65rem] text-white/75' : 'mt-1 block truncate text-[0.65rem] text-secondary/65'}>
                            {t(`routes.psychologists.cards.supportArea.${psychologist.supportArea}`)}
                          </span>
                        </motion.button>
                      </CarouselItem>
                    )
                  })}
                </CarouselContent>
                <CarouselPrevious aria-label={t('homepage.featured.previous')} className="left-0 size-9 border-secondary/15 bg-white text-secondary" />
                <CarouselNext aria-label={t('homepage.featured.next')} className="right-0 size-9 border-secondary/15 bg-white text-secondary" />
              </Carousel>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
