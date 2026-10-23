import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  MessageCircle,
  Twitter,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Award
} from 'lucide-react'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { INTERACTIVE_SPRING } from '@/lib/motion'
import {
  HAYKAL_SCHOLAR_ARTICLES,
  formatJournalCitation,
  formatApaCitation,
  isHaykalAuthor,
  type ScholarJournalMeta,
  type ScholarArticle
} from '@/data/scholar-articles'

export interface ArticleDetailData {
  articleId?: string
  id?: string
  slug: string
  title: { id: string; en: string }
  summary: { id: string; en: string }
  body: { id: string; en: string }
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
    title?: string
    photoUrl?: string
    specializations?: string[]
  }
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

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { i18n, t } = useTranslation()
  const currentLang = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'

  const [articleData, setArticleData] = useState<ArticleDetailData | null>(null)
  const [scholarArticle, setScholarArticle] = useState<ScholarArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedApa, setCopiedApa] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadArticle() {
      if (!slug) return
      setIsLoading(true)
      setIsNotFound(false)

      const scholarMatch = HAYKAL_SCHOLAR_ARTICLES.find(
        (a) => a.slug === slug || a.id === slug
      )

      try {
        const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const res = await fetch(`${baseUrl}/api/content/articles/${slug}`)
        if (res.ok) {
          const data = await res.json()
          if (mounted && data.status === 'success' && data.article) {
            setArticleData(data.article)
            if (scholarMatch) setScholarArticle(scholarMatch)
            return
          }
        }
      } catch {
        // Fallback to scholarMatch
      }

      if (mounted) {
        if (scholarMatch) {
          setScholarArticle(scholarMatch)
          setArticleData({
            id: scholarMatch.id,
            articleId: scholarMatch.id,
            slug: scholarMatch.slug,
            title: { id: scholarMatch.title, en: scholarMatch.title },
            summary: {
              id: scholarMatch.abstract || 'Publikasi ilmiah oleh Dr. Haykal Hafizul Arifin.',
              en: scholarMatch.abstract || 'Scientific publication by Dr. Haykal Hafizul Arifin.'
            },
            body: {
              id: scholarMatch.abstract || 'Abstrak belum tersedia untuk publikasi ini.',
              en: scholarMatch.abstract || 'Abstract not available for this publication.'
            },
            publishedAt: scholarMatch.publicationDate,
            authors: scholarMatch.authors,
            journal: scholarMatch.journal,
            doi: scholarMatch.doi,
            doiUrl: scholarMatch.doiUrl,
            citationsCount: scholarMatch.citationsCount,
            scholarUrl: scholarMatch.scholarUrl,
            author: {
              id: 'haykal',
              name: 'Dr. Haykal Hafizul Arifin, S.Psi., M.Sc.',
              slug: 'haykal',
              title: 'Ilmuwan Psikologi & Peneliti Sosial',
              specializations: ['Psikologi Sosial', 'Social Cognition', 'Psikometri & Validasi Skala']
            }
          })
        } else {
          setIsNotFound(true)
        }
      }
    }

    loadArticle().finally(() => {
      if (mounted) setIsLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
        <SiteHeader />
        <main className="py-16 px-4 flex justify-center">
          <div className="max-w-3xl w-full space-y-6 animate-pulse">
            <div className="h-8 bg-[#eee8df] rounded-full w-3/4" />
            <div className="h-4 bg-[#eee8df] rounded-full w-1/4" />
            <div className="h-40 bg-[#eee8df] rounded-2xl w-full" />
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (isNotFound || !articleData) {
    return (
      <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary flex flex-col justify-between">
        <SiteHeader />
        <main className="py-20 px-4 flex items-center justify-center">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-secondary/15 shadow-sm">
            <h1 className="text-2xl font-bold text-secondary mb-2">404 - Article Not Found</h1>
            <p className="text-sm text-secondary/70 mb-6">Artikel yang Anda cari tidak ditemukan atau telah diarsipkan.</p>
            <Link to="/articles" className="inline-flex items-center justify-center px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-semibold text-sm rounded-full transition-colors">
              Kembali ke Daftar Artikel
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const title = articleData.title[currentLang] || articleData.title.id
  const summary = articleData.summary[currentLang] || articleData.summary.id
  const body = articleData.body[currentLang] || articleData.body.id

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200))
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleCopyLink = async () => {
    if (!currentUrl) return
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore clipboard error
    }
  }

  const handleCopyApa = async () => {
    if (!scholarArticle) return
    try {
      const citation = formatApaCitation(scholarArticle)
      await navigator.clipboard.writeText(citation)
      setCopiedApa(true)
      setTimeout(() => setCopiedApa(false), 2000)
    } catch {
      // ignore
    }
  }


  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <article className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <Link to="/articles" className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary/70 hover:text-secondary mb-4 transition-colors">
              <ArrowLeft size={14} />
              <span>{t('articles.backToArticles', 'Kembali ke Semua Artikel Ilmiah')}</span>
            </Link>

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                {t('articles.categoryBadge', 'Artikel Ilmiah')}
              </span>
              {articleData.journal?.name && (
                <span className="rounded-full bg-secondary/10 text-secondary px-3 py-1 text-xs font-medium">
                  {articleData.journal.name}
                </span>
              )}
              {articleData.citationsCount ? (
                <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 px-3 py-1 text-xs font-medium flex items-center gap-1">
                  <Award size={13} className="text-amber-600" />
                  <span>{articleData.citationsCount} Sitasi Ilmiah</span>
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-secondary leading-tight sm:leading-snug mb-4">
              {title}
            </h1>

            {/* Authors Display with Dr. Haykal link */}
            {articleData.authors && articleData.authors.length > 0 ? (
              <div className="text-sm text-secondary/80 mb-3 leading-relaxed">
                <span className="font-semibold text-secondary">Penulis: </span>
                {articleData.authors.map((author, idx) => {
                  const isHaykal = isHaykalAuthor(author)
                  return (
                    <span key={idx}>
                      {idx > 0 && ', '}
                      {isHaykal ? (
                        <Link
                          to="/psychologists/haykal"
                          className="font-bold text-primary hover:underline underline-offset-2"
                        >
                          {author}
                        </Link>
                      ) : (
                        <span>{author}</span>
                      )}
                    </span>
                  )
                })}
              </div>
            ) : null}

            {/* Journal Meta */}
            {articleData.journal && formatJournalCitation(articleData as any) ? (
              <p className="text-xs text-secondary/70 italic font-medium mb-3">
                {formatJournalCitation(articleData as any)}
                {articleData.journal.publisher ? ` — Penerbit: ${articleData.journal.publisher}` : ''}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary/60 pb-6 border-b border-secondary/15">
              <span>{formatPublicationDate(articleData.publishedAt, currentLang)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} />
                <span>{readingTimeMinutes} {t('articles.minRead', 'menit baca')}</span>
              </span>
            </div>

            {/* Action Bar (DOI, Google Scholar, Social Share) */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {articleData.doiUrl && (
                  <a
                    href={articleData.doiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <BookOpen size={13} />
                    <span>Lihat Paper (DOI)</span>
                    <ExternalLink size={12} className="opacity-80" />
                  </a>
                )}
                {articleData.scholarUrl && (
                  <a
                    href={articleData.scholarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-white px-3 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors"
                  >
                    <span>Google Scholar</span>
                    <ExternalLink size={12} className="text-secondary/60" />
                  </a>
                )}
                {scholarArticle && (
                  <motion.button
                    type="button"
                    onClick={handleCopyApa}
                    className="inline-flex items-center gap-1.5 rounded-full border border-secondary/20 bg-white px-3 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={INTERACTIVE_SPRING}
                  >
                    {copiedApa ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Sitasi APA Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Salin Sitasi APA</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-secondary/15 bg-white px-3 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={INTERACTIVE_SPRING}
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </motion.a>
                <motion.a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-secondary/15 bg-white px-3 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={INTERACTIVE_SPRING}
                  aria-label="Share on Twitter"
                >
                  <Twitter size={14} className="text-blue-500" />
                  <span>X (Twitter)</span>
                </motion.a>
                <motion.button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 rounded-full border border-secondary/15 bg-white px-3 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={INTERACTIVE_SPRING}
                  aria-label="Copy Link"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">{t('articles.copied', 'Tersalin!')}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>{t('articles.copyLink', 'Salin Link')}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Abstract / Summary Card */}
          <div className="p-6 bg-[#eee5d8] rounded-2xl border border-secondary/15 space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-primary">
              {t('articles.abstractHeading', 'Abstrak Publikasi')}
            </span>
            <p className="text-secondary text-sm sm:text-base leading-relaxed">
              {summary}
            </p>
          </div>

          {/* Author Bio Card */}
          {articleData.author && (
            <div className="rounded-2xl border border-secondary/15 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-10">
              <div className="size-14 rounded-full bg-[#eee8df] flex items-center justify-center text-secondary font-bold text-xl shrink-0 overflow-hidden border border-secondary/20">
                {articleData.author.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
                  {t('articles.authorBadge', 'Peneliti & Ilmuwan Psikologi')}
                </span>
                <h3 className="text-lg font-bold text-secondary">{articleData.author.name}</h3>
                <p className="text-xs text-secondary/70 mt-1">
                  {articleData.author.title || t('articles.authorBioDescription', 'Psikolog & peneliti Attentive.id yang berfokus pada riset empiris dan kesejahteraan psikososial.')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Link
                  to={`/psychologists/${articleData.author.slug}`}
                  className="w-full sm:w-auto px-4 py-2 rounded-full border border-secondary/20 text-xs font-semibold text-secondary hover:bg-secondary/5 text-center transition-colors"
                >
                  {t('articles.viewProfile', 'Lihat Profil Lengkap')}
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Reservation CTA Box */}
          <div className="rounded-2xl bg-[#eee5d8] border border-secondary/15 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
            <div>
              <h3 className="font-bold text-secondary text-base sm:text-lg">
                {t('articles.ctaTitle', 'Tertarik Berdiskusi atau Butuh Bimbingan Profesional?')}
              </h3>
              <p className="text-xs sm:text-sm text-secondary/75 mt-1 max-w-xl">
                {t('articles.ctaSubtitle', 'Konsultasikan kebutuhan psikologi, assessment, atau kolaborasi riset bersama tim Attentive.id secara nyaman dan terpercaya.')}
              </p>
            </div>
            <Link
              to="/psychologists"
              className="inline-flex items-center justify-center px-5 py-3 bg-secondary hover:bg-secondary/90 text-white font-semibold text-sm rounded-full transition-colors shrink-0 text-center"
            >
              {t('articles.ctaButton', 'Temukan Psikologmu →')}
            </Link>
          </div>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
