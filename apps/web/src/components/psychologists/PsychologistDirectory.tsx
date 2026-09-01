import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { createWhatsAppLink, defaultContactMessage } from '@/data/contact'
import {
  createPsychologistListSearchParams,
  listPsychologists,
  parsePsychologistListQuery,
  type PsychologistListQuery,
  type PsychologistListState,
} from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import { PsychologistDirectoryCard } from './PsychologistDirectoryCard'
import { PsychologistDirectoryFilters } from './PsychologistDirectoryFilters'
import { PsychologistDirectoryReassurance } from './PsychologistDirectoryReassurance'

function DirectoryLoadingState() {
  const { t } = useTranslation()

  return (
    <div aria-label={t('routes.common.loading')} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="status">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="overflow-hidden rounded-[2rem] border border-secondary/10 bg-white" key={index}>
          <div className="aspect-[4/5] bg-[#e9ece9]" />
          <div className="space-y-4 p-7">
            <div className="h-7 w-3/4 rounded-full bg-[#eee8df]" />
            <div className="h-4 w-1/2 rounded-full bg-[#eee8df]" />
            <div className="h-20 rounded-2xl bg-[#f5f1ea]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PsychologistDirectory() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [requestVersion, setRequestVersion] = useState(0)
  const query = useMemo(() => parsePsychologistListQuery(searchParams), [searchParams])
  const supportArea = query.supportArea ?? 'all'
  const experienceLevel = query.experienceLevel ?? 'all'
  const search = query.search ?? ''
  const [searchDraft, setSearchDraft] = useState({ urlValue: search, value: search })
  const searchInputValue = searchDraft.urlValue === search ? searchDraft.value : search
  const requestKey = `${search}\u0000${supportArea}\u0000${experienceLevel}\u0000${requestVersion}`
  const [requestState, setRequestState] = useState<{
    key: string
    result: PsychologistListState
  }>({ key: '', result: { status: 'loading' } })
  const state = requestState.key === requestKey
    ? requestState.result
    : { status: 'loading' } as PsychologistListState
  const hasActiveQuery = Boolean(search || supportArea !== 'all' || experienceLevel !== 'all')
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  useEffect(() => {
    let isActive = true

    listPsychologists({ search, supportArea, experienceLevel })
      .then((result) => {
        if (isActive) setRequestState({ key: requestKey, result })
      })
      .catch(() => {
        if (isActive) setRequestState({ key: requestKey, result: { status: 'error' } })
      })

    return () => {
      isActive = false
    }
  }, [experienceLevel, requestKey, search, supportArea])

  useEffect(() => {
    const normalizedDraft = searchDraft.value.trim()
    if (searchDraft.urlValue !== search || normalizedDraft === search) return

    const timeout = window.setTimeout(() => {
      const nextSearchParams = new URLSearchParams(searchParams)
      if (normalizedDraft) nextSearchParams.set('q', normalizedDraft)
      else nextSearchParams.delete('q')
      setSearchParams(nextSearchParams, { replace: true })
    }, 250)

    return () => window.clearTimeout(timeout)
  }, [search, searchDraft, searchParams, setSearchParams])

  const updateQuery = (patch: Partial<PsychologistListQuery>, replace = false) => {
    setSearchParams(createPsychologistListSearchParams({ ...query, ...patch }), { replace })
  }

  const updateSearch = (value: string) => {
    setSearchDraft({ urlValue: search, value })
  }

  const clearFilters = () => {
    setSearchDraft({ urlValue: '', value: '' })
    setSearchParams(new URLSearchParams())
  }
  const resultCount = state.status === 'success'
    ? state.psychologists.length
    : state.status === 'empty'
      ? 0
      : null

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden px-5 py-20 text-center lg:px-8 lg:py-28">
          <div aria-hidden="true" className="absolute -right-28 top-4 size-[28rem] rounded-full border border-primary/15" />
          <div aria-hidden="true" className="absolute -right-10 top-24 size-[18rem] rounded-full border border-primary/15" />
          <div className="relative mx-auto max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('routes.psychologists.eyebrow')}</p>
            <h1
              className="mt-5 text-balance text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-secondary outline-none"
              data-route-heading
              tabIndex={-1}
            >
              {t('routes.psychologists.title')}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-secondary/60 sm:text-lg">{t('routes.psychologists.description')}</p>
            <motion.a
              className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              href="#finder"
              transition={INTERACTIVE_SPRING}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              {t('routes.psychologists.introAction')}
            </motion.a>
            <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-3 border-t border-secondary/10 pt-6 text-sm text-secondary/55 sm:flex-row sm:gap-8">
              <p className="flex items-center gap-2"><CheckCircle2 aria-hidden="true" className="text-primary" size={17} />{t('routes.psychologists.introFacts.formats')}</p>
              <p className="flex items-center gap-2"><CheckCircle2 aria-hidden="true" className="text-primary" size={17} />{t('routes.psychologists.introFacts.lifeStages')}</p>
            </div>
          </div>
        </section>

        <PsychologistDirectoryFilters
          experienceLevel={experienceLevel}
          hasActiveQuery={hasActiveQuery}
          onClear={clearFilters}
          onExperienceChange={(value) => updateQuery({ experienceLevel: value })}
          onSearchChange={updateSearch}
          onSupportAreaChange={(value) => updateQuery({ supportArea: value })}
          resultCount={resultCount}
          search={searchInputValue}
          supportArea={supportArea}
        />

        <section aria-busy={state.status === 'loading'} aria-live="polite" className="px-5 py-20 lg:px-8 lg:py-28" id="directory-results">
          <div className="mx-auto max-w-7xl">
            {state.status === 'loading' && <DirectoryLoadingState />}

            {state.status === 'success' && (
              <ul className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                {state.psychologists.map((psychologist) => (
                  <PsychologistDirectoryCard key={psychologist.slug} psychologist={psychologist} />
                ))}
              </ul>
            )}

            {state.status === 'empty' && (
              <div className="mx-auto max-w-2xl rounded-[2rem] border border-secondary/10 bg-white p-8 text-center sm:p-12">
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-secondary">{t('routes.psychologists.states.emptyTitle')}</h2>
                <p className="mt-4 text-base leading-7 text-secondary/60">{t('routes.psychologists.states.emptyDescription')}</p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <motion.button
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={clearFilters}
                    transition={INTERACTIVE_SPRING}
                    type="button"
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw aria-hidden="true" size={18} />
                    {t('routes.psychologists.states.reset')}
                  </motion.button>
                  <motion.a
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-secondary/15 px-6 py-4 font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    href={whatsappUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    transition={INTERACTIVE_SPRING}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle aria-hidden="true" size={18} />
                    {t('routes.psychologists.states.askAdmin')}
                  </motion.a>
                </div>
              </div>
            )}

            {state.status === 'error' && (
              <div className="mx-auto max-w-2xl rounded-[2rem] border border-secondary/10 bg-white p-8 text-center sm:p-12">
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-secondary">{t('routes.psychologists.states.errorTitle')}</h2>
                <p className="mt-4 text-base leading-7 text-secondary/60">{t('routes.psychologists.states.errorDescription')}</p>
                <motion.button
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => setRequestVersion((current) => current + 1)}
                  transition={INTERACTIVE_SPRING}
                  type="button"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw aria-hidden="true" size={18} />
                  {t('routes.psychologists.states.retry')}
                </motion.button>
              </div>
            )}
          </div>
        </section>

        <PsychologistDirectoryReassurance />
      </main>
      <SiteFooter />
    </div>
  )
}
