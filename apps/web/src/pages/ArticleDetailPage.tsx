import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, MessageCircle, Twitter, Copy, Check } from 'lucide-react'
import { SiteHeader } from '@/components/landing/SiteHeader'
import { SiteFooter } from '@/components/landing/SiteFooter'
import { INTERACTIVE_SPRING } from '@/lib/motion'

export interface ArticleDetailData {
  articleId?: string
  id?: string
  slug: string
  title: { id: string; en: string }
  summary: { id: string; en: string }
  body: { id: string; en: string }
  publishedAt: string
  author?: {
    id: string
    name: string
    slug: string
    title?: string
    photoUrl?: string
    specializations?: string[]
  }
}

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { i18n, t } = useTranslation()
  const currentLang = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'

  const [articleData, setArticleData] = useState<ArticleDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let mounted = true
    async function loadArticle() {
      if (!slug) return
      setIsLoading(true)
      setIsNotFound(false)
      try {
        const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const res = await fetch(`${baseUrl}/api/content/articles/${slug}`)
        if (res.status === 404) {
          if (mounted) setIsNotFound(true)
          return
        }
        if (res.ok) {
          const data = await res.json()
          if (mounted && data.status === 'success' && data.article) {
            setArticleData(data.article)
          }
        }
      } catch {
        // Sample fallback for preview
        if (mounted && slug === 'memahami-kecemasan-dan-cara-mengatasinya') {
          setArticleData({
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
            body: {
              id: 'Kecemasan (anxiety) dapat dialami oleh siapa saja. Ketika beban pikiran terasa mengganggu produktivitas dan relasi harian, mengenali tanda awal dan mengalirkan emosi secara sehat merupakan langkah awal yang sangat penting.\n\nDalam sesi konseling psikologi, kita belajar memahami akar kecemasan melalui pendekatan berbasis bukti seperti Cognitive Behavioral Therapy (CBT) dan Mindfulness.',
              en: 'Anxiety can affect anyone. When thoughts disrupt daily productivity and relationships, recognizing early signs and managing emotions healthily is a critical first step.\n\nIn psychological counseling, we learn to understand anxiety triggers through evidence-based approaches such as Cognitive Behavioral Therapy (CBT) and Mindfulness.',
            },
            publishedAt: '2026-09-01T12:00:00Z',
          })
        } else if (mounted) {
          setIsNotFound(true)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadArticle()
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

  const authorName = articleData.author?.name || 'Tim Redaksi Attentive'

  return (
    <div className="min-h-screen overflow-x-clip bg-[#fbf8f2] text-secondary">
      <SiteHeader />
      <article className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <Link to="/articles" className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary/70 hover:text-secondary mb-4 transition-colors">
              <ArrowLeft size={14} />
              {t('articles.backToArticles', 'Kembali ke Artikel')}
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-xs text-secondary/60 mb-3">
              <span className="rounded-full bg-[#eee8df] px-2.5 py-0.5 font-medium text-secondary">
                {t('articles.categoryEducation', 'Edukasi Psikologi')}
              </span>
              <span>•</span>
              <span>
                {new Date(articleData.publishedAt).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} />
                {readingTimeMinutes} {t('articles.minRead', 'menit baca')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-secondary leading-tight">
              {title}
            </h1>

            {/* Author Byline */}
            <div className="mt-4 flex items-center gap-2 text-sm text-secondary/80">
              <span>{t('articles.writtenBy', 'Ditulis oleh')}:</span>
              {articleData.author?.slug ? (
                <Link
                  to={`/psychologists/${articleData.author.slug}`}
                  className="font-semibold text-secondary hover:text-primary underline underline-offset-2 transition-colors"
                >
                  {articleData.author.name}
                </Link>
              ) : (
                <span className="font-semibold text-secondary">
                  {authorName}
                </span>
              )}
            </div>
          </div>

          {/* Social Share Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-secondary/10 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary/60">
              {t('articles.shareArticle', 'Bagikan')}
            </span>
            <div className="flex items-center gap-2">
              <motion.a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} — ${currentUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-secondary/15 bg-white px-3 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/5 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={INTERACTIVE_SPRING}
                aria-label="Share on WhatsApp"
              >
                <MessageCircle size={14} className="text-green-600" />
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

          {/* Article Summary Box */}
          <div className="p-5 sm:p-6 bg-[#eee5d8] rounded-2xl border border-secondary/10 text-secondary text-sm sm:text-base italic font-medium leading-relaxed">
            {summary}
          </div>

          {/* Article Body Content */}
          <div className="prose prose-stone max-w-none text-secondary leading-relaxed space-y-4 whitespace-pre-wrap text-base sm:text-lg">
            {body}
          </div>

          {/* Author Bio Card */}
          {articleData.author && (
            <div className="rounded-2xl border border-secondary/15 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-10">
              <div className="size-14 rounded-full bg-[#eee8df] flex items-center justify-center text-secondary font-bold text-xl shrink-0 overflow-hidden border border-secondary/20">
                {articleData.author.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
                  {t('articles.authorBadge', 'Penulis & Psikolog')}
                </span>
                <h3 className="text-lg font-bold text-secondary">{articleData.author.name}</h3>
                <p className="text-xs text-secondary/70 mt-1">
                  {t('articles.authorBioDescription', 'Psikolog Attentive.id yang berdedikasi membantu individu mencapai kesejahteraan mental dan emosional yang optimal.')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <Link
                  to={`/psychologists/${articleData.author.slug}`}
                  className="w-full sm:w-auto px-4 py-2 rounded-full border border-secondary/20 text-xs font-semibold text-secondary hover:bg-secondary/5 text-center transition-colors"
                >
                  {t('articles.viewProfile', 'Lihat Profil')}
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Reservation CTA Box */}
          <div className="rounded-2xl bg-[#eee5d8] border border-secondary/15 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
            <div>
              <h3 className="font-bold text-secondary text-base sm:text-lg">
                {t('articles.ctaTitle', 'Butuh Teman Cerita dan Bimbingan Profesional?')}
              </h3>
              <p className="text-xs sm:text-sm text-secondary/75 mt-1 max-w-xl">
                {t('articles.ctaSubtitle', 'Konsultasikan kebutuhan kesehatan mental Anda bersama tim psikolog Attentive.id secara nyaman, rahasia, dan terpercaya.')}
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
