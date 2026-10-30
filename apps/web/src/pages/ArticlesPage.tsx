import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Search } from 'lucide-react'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import {
  HAYKAL_SCHOLAR_ARTICLES,
  formatJournalCitation,
  isHaykalAuthor,
  type ScholarArticle,
  type ScholarJournalMeta
} from '@/data/scholar-articles'

export interface ArticleItem {
  id?: string
  articleId?: string
  slug: string
  title: { id: string; en: string }
  summary: { id: string; en: string }
  publishedAt: string
  authors?: string[]
  journal?: ScholarJournalMeta
  doi?: string
  doiUrl?: string
  citationsCount?: number
  scholarUrl?: string
  author?: {
    id: string
    name: string
    slug: string
  }
  authorName?: string
}

function formatPublicationDate(dateStr?: string, locale = 'id'): string {
  if (!dateStr) return ''
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } else if (parts.length === 2) {
    const [year, month] = parts.map(Number)
    const date = new Date(year, month - 1, 1)
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
      year: 'numeric',
      month: 'short'
    })
  }
  return dateStr
}

function mapScholarArticleToItem(art: ScholarArticle): ArticleItem {
  const isJessica = art.authors?.some((a) => a.toLowerCase().includes('jessica'))
  return {
    id: art.id,
    slug: art.slug,
    title: { id: art.title, en: art.title },
    summary: {
      id: art.abstract || (isJessica ? 'Publikasi ilmiah oleh Jessica Raphaela.' : 'Publikasi ilmiah oleh Dr. Haykal Hafizul Arifin.'),
      en: art.abstract || (isJessica ? 'Scientific publication by Jessica Raphaela.' : 'Scientific publication by Dr. Haykal Hafizul Arifin.')
    },
    publishedAt: art.publicationDate,
    authors: art.authors,
    journal: art.journal,
    doi: art.doi,
    doiUrl: art.doiUrl,
    citationsCount: art.citationsCount,
    scholarUrl: art.scholarUrl,
    author: isJessica
      ? {
          id: 'jessica',
          name: 'Jessica Raphaela, M.Psi., Psikolog',
          slug: 'jessica'
        }
      : {
          id: 'haykal',
          name: 'Dr. Haykal Hafizul Arifin, S.Psi., M.Sc.',
          slug: 'haykal'
        },
    authorName: isJessica ? 'Jessica Raphaela, M.Psi., Psikolog' : 'Dr. Haykal Hafizul Arifin, S.Psi., M.Sc.'
  }
}

export function ArticlesPage() {
  const { i18n, t } = useTranslation()
  const currentLang = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'

  const [articles, setArticles] = useState<ArticleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadArticles() {
      setIsLoading(true)
      const scholarItems = HAYKAL_SCHOLAR_ARTICLES.map(mapScholarArticleToItem)

      try {
        const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const res = await fetch(`${baseUrl}/api/content/articles?locale=${currentLang}&limit=50`)
        if (res.ok) {
          const data = await res.json()
          if (mounted && data.status === 'success' && Array.isArray(data.articles) && data.articles.length > 0) {
            const apiSlugs = new Set(data.articles.map((a: any) => a.slug))
            const combined = [...data.articles, ...scholarItems.filter((s) => !apiSlugs.has(s.slug))]
            setArticles(combined)
            return
          }
        }
      } catch {
        // Fallback to static scholar items
      }

      if (mounted) {
        setArticles(scholarItems)
        setIsLoading(false)
      }
    }

    loadArticles().finally(() => {
      if (mounted) setIsLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [currentLang])

  const filteredArticles = articles.filter((article) => {
    const titleText = article.title[currentLang] || article.title.id
    const summaryText = article.summary[currentLang] || article.summary.id
    const authorsText = [
      article.authors?.join(' '),
      article.author?.name,
      article.authorName
    ].filter(Boolean).join(' ')
    const journalText = article.journal?.name || ''
    const query = searchQuery.toLowerCase()

    return (
      titleText.toLowerCase().includes(query) ||
      summaryText.toLowerCase().includes(query) ||
      authorsText.toLowerCase().includes(query) ||
      journalText.toLowerCase().includes(query) ||
      article.publishedAt.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-3">
              {t('articles.badge', 'Direktori Publikasi & Riset')}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary tracking-tight">
              {t('articles.headerTitle', currentLang === 'en' ? 'Scientific Articles' : 'Artikel Ilmiah')}
            </h1>
            <p className="mt-3 text-base text-secondary/75 leading-relaxed">
              {t(
                'articles.headerSubtitle',
                currentLang === 'en'
                  ? 'Scientific insights, empirical publications, and evidence-based perspectives from Attentive.id psychologist researchers.'
                  : 'Koleksi publikasi ilmiah, riset empiris, dan wawasan psikologi berbasis bukti karya peneliti Attentive.id.'
              )}
            </p>

            {/* Search Box */}
            <div className="mt-6 relative max-w-lg mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('articles.searchPlaceholder', 'Cari judul, penulis, jurnal, atau kata kunci...')}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-secondary/20 rounded-xl text-sm text-secondary placeholder-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              <Search className="w-5 h-5 absolute left-3 top-3 text-secondary/40" />
            </div>
          </div>

          {/* Loading Skeleton or Article Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-secondary/15 animate-pulse space-y-4 shadow-sm"
                >
                  <div className="h-4 bg-[#eee8df] rounded w-1/3" />
                  <div className="h-6 bg-[#eee8df] rounded w-5/6" />
                  <div className="h-16 bg-[#eee8df] rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-secondary/15 p-8 shadow-sm">
              <p className="text-secondary/70 font-medium">
                {t('articles.noArticlesFound', 'Tidak ada artikel yang sesuai dengan pencarian Anda.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => {
                const titleText = article.title[currentLang] || article.title.id
                const summaryText = article.summary[currentLang] || article.summary.id

                return (
                  <motion.article
                    key={article.id || article.articleId || article.slug}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="bg-white rounded-2xl border border-secondary/15 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-6 space-y-3.5">
                      {/* Top meta tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-secondary/60 font-medium">
                            {formatPublicationDate(article.publishedAt, currentLang)}
                          </span>
                          {article.journal?.name && (
                            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[11px] font-semibold truncate max-w-[170px]" title={article.journal.name}>
                              {article.journal.name}
                            </span>
                          )}
                        </div>
                        {article.citationsCount ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                            ★ {article.citationsCount} Sitasi
                          </span>
                        ) : null}
                      </div>

                      {/* Title */}
                      <h2 className="text-base sm:text-lg font-bold text-secondary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        <Link to={`/articles/${article.slug}`}>
                          {titleText}
                        </Link>
                      </h2>

                      {/* Authors line with Haykal highlighted */}
                      {article.authors && article.authors.length > 0 ? (
                        <p className="text-xs text-secondary/70 line-clamp-1 leading-relaxed">
                          <span className="font-semibold text-secondary/90">Penulis: </span>
                          {article.authors.map((author, idx) => {
                            const isHaykal = isHaykalAuthor(author)
                            return (
                              <span key={idx}>
                                {idx > 0 && ', '}
                                {isHaykal ? (
                                  <strong className="text-primary font-semibold underline decoration-primary/40 underline-offset-2">
                                    {author}
                                  </strong>
                                ) : (
                                  author
                                )}
                              </span>
                            )
                          })}
                        </p>
                      ) : null}

                      {/* Journal metadata */}
                      {article.journal && formatJournalCitation(article as any) ? (
                        <p className="text-[11px] text-secondary/60 italic font-medium line-clamp-1">
                          {formatJournalCitation(article as any)}
                        </p>
                      ) : null}

                      {/* Description / Abstract */}
                      <p className="text-xs text-secondary/75 line-clamp-3 leading-relaxed">
                        {summaryText}
                      </p>
                    </div>

                    {/* Card Actions / Footer */}
                    <div className="p-6 pt-0 border-t border-secondary/10 mt-4 flex flex-wrap items-center justify-between gap-2">
                      {article.doiUrl ? (
                        <a
                          href={article.doiUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 transition-colors"
                        >
                          <ExternalLink size={12} />
                          DOI Paper
                        </a>
                      ) : (
                        <span className="text-[11px] text-secondary/50 font-medium">Publikasi Riset</span>
                      )}

                      <Link
                        to={`/articles/${article.slug}`}
                        className="inline-flex items-center text-xs font-semibold text-primary hover:underline gap-1"
                      >
                        {t('articles.readMore', 'Lihat Detail')} →
                      </Link>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
