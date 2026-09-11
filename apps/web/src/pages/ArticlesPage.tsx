import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'

export interface ArticleItem {
  id?: string
  articleId?: string
  slug: string
  title: { id: string; en: string }
  summary: { id: string; en: string }
  publishedAt: string
  author?: {
    id: string
    name: string
    slug: string
  }
  authorName?: string
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
      try {
        const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const res = await fetch(`${baseUrl}/api/content/articles?locale=${currentLang}`)
        if (res.ok) {
          const data = await res.json()
          if (mounted && data.status === 'success') {
            setArticles(data.articles || [])
          }
        }
      } catch {
        // Fallback to sample article for static preview if API isn't up
        if (mounted) {
          setArticles([
            {
              id: 'art-001',
              slug: 'memahami-kecemasan-dan-cara-mengatasinya',
              title: {
                id: 'Memahami Kecemasan dan Strategi Mengatasinya dalam Kehidupan Sehari-hari',
                en: 'Understanding Anxiety and Everyday Coping Strategies',
              },
              summary: {
                id: 'Kecemasan adalah respons alami tubuh terhadap stres. Pelajari cara mengenali pemicunya dan teknik regulasi emosi yang efektif.',
                en: 'Anxiety is a natural body response to stress. Learn how to recognize triggers and effective emotional regulation techniques.',
              },
              publishedAt: '2026-09-01T12:00:00Z',
              authorName: 'Dr. Syazka, M.Psi., Psikolog',
            },
          ])
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadArticles()
    return () => {
      mounted = false
    }
  }, [currentLang])

  const filteredArticles = articles.filter((article) => {
    const titleText = article.title[currentLang] || article.title.id
    const summaryText = article.summary[currentLang] || article.summary.id
    const query = searchQuery.toLowerCase()
    return titleText.toLowerCase().includes(query) || summaryText.toLowerCase().includes(query)
  })

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('articles.headerTitle', 'Artikel & Edukasi Psikologi')}
          </h1>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            {t('articles.headerSubtitle', 'Wawasan ilmiah dan panduan praktis dari para psikolog profesional Attentive.id.')}
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-md mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('articles.searchPlaceholder', 'Cari topik atau judul artikel...')}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-3 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Loading Skeleton or Article Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse space-y-4"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              {t('articles.noArticlesFound', 'Tidak ada artikel yang sesuai dengan pencarian Anda.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const authorName = article.author?.name || article.authorName || 'Attentive Editorial Team'
              return (
                <motion.article
                  key={article.id || article.articleId || article.slug}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{new Date(article.publishedAt).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded font-medium">Edukasi</span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                      <Link to={`/articles/${article.slug}`}>
                        {article.title[currentLang] || article.title.id}
                      </Link>
                    </h2>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {article.summary[currentLang] || article.summary.id}
                    </p>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-700/50 mt-4 flex items-center justify-between">
                    {article.author?.slug ? (
                      <Link
                        to={`/psychologists/${article.author.slug}`}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 truncate max-w-[180px] hover:underline"
                      >
                        {authorName}
                      </Link>
                    ) : (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                        {authorName}
                      </span>
                    )}

                    <Link
                      to={`/articles/${article.slug}`}
                      className="inline-flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      {t('articles.readMore', 'Baca Selengkapnya')} →
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
