import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { PsychologistProfileDetails } from '@/components/psychologists/PsychologistProfileDetails'
import { PsychologistProfileHero } from '@/components/psychologists/PsychologistProfileHero'
import { RelatedPsychologists } from '@/components/psychologists/RelatedPsychologists'
import { createWhatsAppLink, defaultContactMessage } from '@/data/contact'
import {
  getPsychologistBySlug,
  listRelatedPsychologists,
  type PsychologistProfileState,
} from '@/features/psychologists'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export function PsychologistProfilePage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams()
  const [requestVersion, setRequestVersion] = useState(0)
  const [request, setRequest] = useState<{
    slug: string
    state: PsychologistProfileState
  }>({ slug, state: { status: 'loading' } })
  const state: PsychologistProfileState = request.slug === slug
    ? request.state
    : { status: 'loading' }
  const whatsappUrl = createWhatsAppLink(defaultContactMessage)

  useEffect(() => {
    let isActive = true

    Promise.all([getPsychologistBySlug(slug), listRelatedPsychologists(slug)])
      .then(([lookup, related]) => {
        if (!isActive) return
        if (lookup.status === 'not-found') {
          setRequest({ slug, state: { status: 'not-found' } })
          return
        }
        setRequest({
          slug,
          state: { status: 'found', psychologist: lookup.psychologist, related },
        })
      })
      .catch(() => {
        if (isActive) setRequest({ slug, state: { status: 'error' } })
      })

    return () => {
      isActive = false
    }
  }, [requestVersion, slug])

  useEffect(() => {
    if (state.status === 'loading') return

    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[data-route-heading]')?.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [slug, state.status])

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main aria-busy={state.status === 'loading'} aria-live="polite">
        {state.status === 'loading' && (
          <section className="px-5 pb-24 pt-10 lg:px-8">
            <div className="mx-auto max-w-7xl animate-pulse">
              <h1 className="sr-only outline-none" data-route-heading tabIndex={-1}>{t('routes.common.loading')}</h1>
              <div className="h-5 w-48 rounded-full bg-[#e8e0d5]" />
              <div className="mt-8 grid min-h-[42rem] overflow-hidden rounded-[2.5rem] bg-[#e8e0d5] lg:grid-cols-2">
                <div className="bg-[#dfe3df]" />
                <div className="space-y-6 p-8 lg:p-16">
                  <div className="h-8 w-40 rounded-full bg-secondary/10" />
                  <div className="h-20 w-4/5 rounded-2xl bg-secondary/10" />
                  <div className="h-6 w-52 rounded-full bg-secondary/10" />
                </div>
              </div>
            </div>
          </section>
        )}

        {state.status === 'error' && (
          <section className="px-5 py-24 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-3xl rounded-[2rem] bg-[#eee5d8] p-8 sm:p-12">
              <h1 className="text-balance text-4xl font-semibold tracking-[-0.03em] text-secondary outline-none sm:text-5xl" data-route-heading tabIndex={-1}>
                {t('routes.profile.errorTitle')}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-secondary/65">{t('routes.profile.errorDescription')}</p>
              <motion.button
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={() => setRequestVersion((version) => version + 1)}
                transition={INTERACTIVE_SPRING}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw aria-hidden="true" size={18} />
                {t('routes.profile.retry')}
              </motion.button>
            </div>
          </section>
        )}

        {state.status === 'not-found' && (
          <section className="px-5 py-24 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-balance text-5xl font-semibold tracking-[-0.04em] text-secondary outline-none sm:text-7xl" data-route-heading tabIndex={-1}>
                {t('routes.profile.notFoundTitle')}
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-secondary/65">{t('routes.profile.notFoundDescription')}</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-4 font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" to="/psychologists">
                  <ArrowLeft aria-hidden="true" size={18} />
                  {t('routes.profile.notFoundAction')}
                </Link>
                <a className="inline-flex items-center justify-center gap-2 rounded-full border border-secondary/20 px-6 py-4 font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" href={whatsappUrl} rel="noopener noreferrer" target="_blank">
                  <MessageCircle aria-hidden="true" size={18} />
                  {t('routes.profile.helpAction')}
                </a>
              </div>
            </div>
          </section>
        )}

        {state.status === 'found' && (
          <article>
            <PsychologistProfileHero psychologist={state.psychologist} />
            <PsychologistProfileDetails psychologist={state.psychologist} />
            <RelatedPsychologists psychologists={state.related} />
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
