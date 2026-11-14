import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { formatSciBriefMonth } from '@attentiveid/shared'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { LockedPages } from '@/components/sci-brief/LockedPages'
import { getSciBrief, sciBriefPreviewUrl, type SciBriefLookup } from '@/features/sci-brief/service'

const PdfPreview = lazy(() => import('@/components/sci-brief/PdfPreview').then((module) => ({ default: module.PdfPreview })))

export function SciBriefDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { i18n, t } = useTranslation()
  const locale = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'
  const [lookup, setLookup] = useState<{ slug: string; result: SciBriefLookup } | null>(null)

  useEffect(() => {
    let active = true
    getSciBrief(slug).then((result) => {
      if (active) setLookup({ slug, result })
    })
    return () => {
      active = false
    }
  }, [slug])

  const result = lookup?.slug === slug ? lookup.result : null
  const brief = result?.status === 'found' ? result.brief : null
  const title = brief ? brief.title[locale] || brief.title.id : ''

  useEffect(() => {
    if (title) document.title = `${title} — Sci-Brief — Attentive.id`
  }, [title])

  const previewUrl = brief ? sciBriefPreviewUrl(brief) : null
  const hiddenPages = brief && brief.totalPages !== null ? Math.max(0, brief.totalPages - brief.previewPages) : 0

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary"
            to="/sci-brief"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            {t('sciBrief.back')}
          </Link>

          {result === null ? (
            <div className="mt-8 space-y-4" aria-busy="true">
              <div className="h-6 w-1/3 animate-pulse rounded bg-[#eee8df]" />
              <div className="h-10 w-4/5 animate-pulse rounded bg-[#eee8df]" />
              <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-[#eee8df]" />
            </div>
          ) : result.status !== 'found' ? (
            <div className="mt-8 rounded-2xl border border-secondary/15 bg-white p-8 text-center" role={result.status === 'error' ? 'alert' : undefined}>
              <h1 className="text-2xl font-bold text-secondary">
                {result.status === 'notFound' ? t('sciBrief.notFoundTitle') : t('sciBrief.loadError')}
              </h1>
              {result.status === 'notFound' && <p className="mt-2 text-secondary/75">{t('sciBrief.notFoundBody')}</p>}
            </div>
          ) : (
            <article className="mt-6">
              <header>
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {formatSciBriefMonth(result.brief.periodMonth, locale)}
                  {result.brief.totalPages ? ` · ${t('sciBrief.pages', { count: result.brief.totalPages })}` : ''}
                </span>
                <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-secondary sm:text-4xl">{title}</h1>
                <p className="mt-3 text-base leading-relaxed text-secondary/75">
                  {result.brief.summary[locale] || result.brief.summary.id}
                </p>
              </header>

              <div className="mt-8">
                {previewUrl ? (
                  <>
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-secondary/50">
                      {t('sciBrief.previewNotice', { count: result.brief.previewPages })}
                    </p>
                    <Suspense fallback={<div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-[#eee8df]" />}>
                      <PdfPreview url={previewUrl} />
                    </Suspense>
                    {hiddenPages > 0 && (
                      <LockedPages hiddenPages={hiddenPages} locale={locale} periodMonth={result.brief.periodMonth} title={title} />
                    )}
                  </>
                ) : (
                  <p className="rounded-2xl border border-secondary/15 bg-white p-8 text-center text-secondary/75">
                    {t('sciBrief.noDocument')}
                  </p>
                )}
              </div>
            </article>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
