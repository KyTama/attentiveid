import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BadgeCheck, Clock3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import {
  listPsychologists,
  type PsychologistListState,
} from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { useLandingSection } from '@/features/content/landing-content-context'
import { cn } from '@/lib/utils'

export function FeaturedPsychologists() {
  const { i18n, t } = useTranslation()
  const managed = useLandingSection('featuredPsychologists')
  const [state, setState] = useState<PsychologistListState>({ status: 'loading' })
  const [selectedSlug, setSelectedSlug] = useState('')
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    let active = true
    listPsychologists({ locale: i18n.resolvedLanguage === 'id' ? 'id' : 'en' })
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
  }, [i18n.resolvedLanguage])

  const roster = useMemo(() => (state.status === 'success' ? state.psychologists : []), [state])
  const selectedIndex = roster.findIndex((p) => p.slug === selectedSlug)
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0
  const selected = roster[activeIndex] ?? roster[0]

  useEffect(() => {
    if (!api || roster.length === 0) return

    const onSelect = () => {
      const snap = api.selectedScrollSnap()
      const candidate = roster[snap]
      if (candidate && candidate.slug !== selectedSlug) {
        setSelectedSlug(candidate.slug)
      }
    }

    api.on('select', onSelect)
    api.on('reInit', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api, roster, selectedSlug])

  const handleSelect = (slug: string, index: number) => {
    setSelectedSlug(slug)
    api?.scrollTo(index)
  }

  return (
    <section className="deferred-section bg-white px-5 py-20 lg:px-8 lg:py-28" id="psychologists">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <div aria-hidden="true" className="mb-3 flex items-center gap-3">
              <span className="h-px w-10 bg-primary/70" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#946a22]">
                {t('homepage.featured.eyebrow')}
              </span>
            </div>
            <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-secondary sm:text-4xl lg:text-5xl">
              {managed?.section.headline[managed.locale] ?? t('homepage.featured.title')}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed font-[450] text-secondary sm:text-lg">
              {managed?.section.description[managed.locale] ?? t('homepage.featured.description')}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <Link
              className="inline-flex min-h-11 items-center gap-2 font-semibold text-secondary underline decoration-primary underline-offset-8 transition-colors hover:text-primary"
              to="/psychologists"
            >
              {t('homepage.featured.viewAll')} <ArrowRight aria-hidden="true" size={18} />
            </Link>

            {/* Desktop Navigation Buttons */}
            {roster.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-secondary/15">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-full border-secondary/20 bg-white text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                  onClick={() => api?.scrollPrev()}
                  aria-label={t('homepage.featured.previous')}
                >
                  <ArrowLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-full border-secondary/20 bg-white text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                  onClick={() => api?.scrollNext()}
                  aria-label={t('homepage.featured.next')}
                >
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Highlight Carousel */}
        <div className="mt-12">
          {state.status === 'loading' && (
            <div aria-label={t('routes.common.loading')} className="grid gap-8 rounded-3xl border border-secondary/10 bg-[#faf6ef] p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
              <div className="aspect-[4/5] max-w-sm animate-pulse rounded-t-[4rem] rounded-b-2xl bg-[#eee8df]" />
              <div className="min-h-[28rem] animate-pulse rounded-xl bg-[#eee8df]" />
            </div>
          )}
          {state.status === 'error' && <p className="rounded-2xl bg-[#eee8df] p-8">{t('routes.common.error')}</p>}
          {state.status === 'empty' && <p className="rounded-2xl bg-[#eee8df] p-8">{t('routes.psychologists.empty')}</p>}

          {roster.length > 0 && selected && (
            <div>
              <Carousel
                className="w-full"
                opts={{ align: 'start', loop: true }}
                setApi={setApi}
              >
                <CarouselContent>
                  {roster.map((psychologist) => (
                    <CarouselItem className="basis-full" key={psychologist.slug}>
                      <div className="grid items-stretch gap-8 rounded-3xl border border-secondary/10 bg-[#faf6ef] p-6 sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:p-12 shadow-xs">
                        {/* Photo Column */}
                        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-[3.5rem] rounded-b-2xl bg-[#eee8df] shadow-sm lg:mx-0">
                          <img
                            alt={psychologist.name}
                            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 hover:scale-105"
                            decoding="async"
                            height="750"
                            loading="lazy"
                            src={psychologist.imageUrl}
                            width="600"
                          />
                          <div className="absolute top-4 left-4 rounded-full bg-white/95 px-3.5 py-1 text-xs font-bold text-secondary backdrop-blur-xs shadow-xs">
                            {t(`routes.psychologists.cards.supportArea.${psychologist.supportArea}`)}
                          </div>
                        </div>

                        {/* Details Column */}
                        <div className="flex flex-col justify-center">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#946a22]">
                            {t(`routes.psychologists.cards.supportArea.${psychologist.supportArea}`)}
                          </p>
                          <h3 className="mt-3 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
                            {psychologist.name}
                          </h3>
                          <p className="mt-2 text-base font-semibold text-secondary">{psychologist.credential}</p>
                          {psychologist.shortBio && (
                            <p className="mt-4 text-sm sm:text-base leading-relaxed font-[450] text-secondary line-clamp-3">
                              {psychologist.shortBio}
                            </p>
                          )}

                          {/* Trust Badges */}
                          <div className="mt-6 grid gap-3 text-sm font-medium text-secondary sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Clock3 aria-hidden="true" className="shrink-0 text-[#946a22]" size={18} />
                              <span className="font-semibold">{t('routes.psychologists.cards.experience', { count: psychologist.experienceYears })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BadgeCheck aria-hidden="true" className="shrink-0 text-[#946a22]" size={18} />
                              <span className="truncate">
                                <span className="font-bold text-secondary">{t('routes.profile.licenseLabel')}:</span>{' '}
                                {psychologist.licenseNumber ?? t('homepage.featured.licenseUnavailable')}
                              </span>
                            </div>
                          </div>

                          {/* Specializations */}
                          <div className="mt-6">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                              {t('homepage.featured.specializationsLabel')}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {psychologist.specializations.slice(0, 5).map((specialization) => (
                                <span
                                  className="rounded-full border border-primary/30 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-secondary shadow-2xs"
                                  key={specialization}
                                >
                                  {specialization}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action CTA */}
                          <div className="mt-8 flex flex-wrap items-center gap-4">
                            <motion.div transition={INTERACTIVE_SPRING} whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                              <Link
                                className="inline-flex min-h-12 items-center gap-2 rounded-md bg-secondary px-7 py-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                to={`/psychologists/${psychologist.slug}`}
                              >
                                {t('homepage.featured.viewProfile', { name: psychologist.nickname })}
                                <ArrowRight aria-hidden="true" size={17} />
                              </Link>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Navigation Header / Counter */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                  <span className="tabular-nums text-base text-secondary font-bold">
                    {String(activeIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="text-secondary/35">/</span>
                  <span className="tabular-nums text-secondary/60">
                    {String(roster.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:hidden">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-full border-secondary/20 bg-white text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                    onClick={() => api?.scrollPrev()}
                    aria-label={t('homepage.featured.previous')}
                  >
                    <ArrowLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-full border-secondary/20 bg-white text-secondary hover:bg-secondary hover:text-white transition-colors cursor-pointer"
                    onClick={() => api?.scrollNext()}
                    aria-label={t('homepage.featured.next')}
                  >
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Readjusted Psychologist Selector Pills */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {roster.map((psychologist, index) => {
                  const isSelected = psychologist.slug === selected.slug
                  return (
                    <button
                      key={psychologist.slug}
                      type="button"
                      onClick={() => handleSelect(psychologist.slug, index)}
                      aria-pressed={isSelected}
                      title={t('homepage.featured.select', { name: psychologist.name })}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isSelected
                          ? "bg-secondary text-white shadow-xs"
                          : "bg-[#f8f3eb] text-secondary/80 hover:bg-[#eee5d8] hover:text-secondary"
                      )}
                    >
                      <span className="font-bold">{psychologist.nickname}</span>
                      {' '}
                      <span className={isSelected ? "text-white/80 text-[0.7rem]" : "text-secondary/60 text-[0.7rem]"}>
                        {t(`routes.psychologists.cards.supportArea.${psychologist.supportArea}`)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
