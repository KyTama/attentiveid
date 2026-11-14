import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { formatSciBriefMonth, type SciBriefPublicDto } from '@attentiveid/shared'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { listSciBriefs } from '@/features/sci-brief/service'

export function SciBriefPage() {
  const { i18n, t } = useTranslation()
  const locale = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'
  const [briefs, setBriefs] = useState<SciBriefPublicDto[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    document.title = `${t('sciBrief.title')} — Attentive.id`
    let active = true
    listSciBriefs().then((result) => {
      if (!active) return
      if (result === null) setFailed(true)
      else setBriefs(result)
    })
    return () => {
      active = false
    }
  }, [t])

  const isLoading = briefs === null && !failed

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {t('sciBrief.badge')}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-secondary sm:text-4xl">{t('sciBrief.title')}</h1>
            <p className="mt-3 text-base leading-relaxed text-secondary/75">{t('sciBrief.subtitle')}</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div className="h-56 animate-pulse rounded-2xl border border-secondary/15 bg-white" key={item} />
              ))}
            </div>
          ) : failed ? (
            <p className="rounded-2xl border border-secondary/15 bg-white p-8 text-center text-secondary/75" role="alert">
              {t('sciBrief.loadError')}
            </p>
          ) : briefs && briefs.length === 0 ? (
            <p className="rounded-2xl border border-secondary/15 bg-white p-8 text-center text-secondary/75">
              {t('sciBrief.empty')}
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {briefs?.map((brief) => (
                <motion.li
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-secondary/15 bg-white shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                  key={brief.id}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="space-y-3 p-6">
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {formatSciBriefMonth(brief.periodMonth, locale)}
                    </span>
                    <h2 className="text-lg font-bold leading-snug text-secondary transition-colors group-hover:text-primary">
                      {brief.title[locale] || brief.title.id}
                    </h2>
                    <p className="line-clamp-4 text-sm leading-relaxed text-secondary/75">
                      {brief.summary[locale] || brief.summary.id}
                    </p>
                  </div>
                  <div className="border-t border-secondary/10 p-6 pt-4">
                    <Link
                      className="inline-flex w-full items-center justify-between rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-secondary shadow-xs outline-none transition-colors hover:bg-[#ffcf4d] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      to={`/sci-brief/${brief.slug}`}
                    >
                      {t('sciBrief.readBrief')}
                      <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
