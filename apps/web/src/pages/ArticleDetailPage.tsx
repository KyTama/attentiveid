import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { i18n } = useTranslation()
  const currentLang = (i18n.language || 'id').startsWith('en') ? 'en' : 'id'

  const [articleData, setArticleData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 flex justify-center">
        <div className="max-w-3xl w-full space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        </div>
      </div>
    )
  }

  if (isNotFound || !articleData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-16 px-4 flex items-center justify-center">
        <div className="text-center max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">404 - Article Not Found</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Artikel yang Anda cari tidak ditemukan atau telah diarsipkan.</p>
          <Link to="/articles" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg transition-colors">
            Kembali ke Daftar Artikel
          </Link>
        </div>
      </div>
    )
  }

  const title = articleData.title[currentLang] || articleData.title.id
  const summary = articleData.summary[currentLang] || articleData.summary.id
  const body = articleData.body[currentLang] || articleData.body.id

  return (
    <article className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link to="/articles" className="inline-flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline mb-4">
            ← Kembali ke Artikel
          </Link>
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Dipublikasikan pada {new Date(articleData.publishedAt).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {title}
          </h1>
        </div>

        {/* Article Summary Box */}
        <div className="p-4 sm:p-6 bg-teal-50/70 dark:bg-teal-950/40 rounded-xl border border-teal-200/60 dark:border-teal-800/60 text-slate-800 dark:text-slate-200 text-sm italic font-medium leading-relaxed">
          {summary}
        </div>

        {/* Article Body Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed space-y-4 whitespace-pre-wrap text-base">
          {body}
        </div>

        {/* Bottom Reservation CTA Box */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Butuh Teman Cerita dan Bimbingan Profesional?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Konsultasikan kebutuhan kesehatan mental Anda bersama tim psikolog Attentive.id.</p>
          </div>
          <Link
            to="/psychologists"
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl transition-colors shrink-0 text-center"
          >
            Lihat Direktori Psikolog →
          </Link>
        </div>
      </div>
    </article>
  )
}
