import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../features/auth/auth-context'

export interface ArticleCmsItem {
  id: string
  slug: string
  status: 'draft' | 'published' | 'unpublished' | 'archived'
  revisionStatus?: 'draft' | 'inReview' | 'approved' | 'rejected'
  revisionNumber?: number
  title: { id: string; en: string }
  summary: { id: string; en: string }
  body: { id: string; en: string }
  author?: {
    id: string
    name: string
    slug: string
  }
  publishedAt?: string | null
  updatedAt?: string
}

export function ArticlesCmsPage() {
  const { user, getAuthHeaders } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [articles, setArticles] = useState<ArticleCmsItem[]>([])
  const [psychologists, setPsychologists] = useState<Array<{ id: string; name: string }>>([])
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'inReview' | 'published'>('all')

  // Modal State for creating/editing article
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [slug, setSlug] = useState('')
  const [titleId, setTitleId] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [summaryId, setSummaryId] = useState('')
  const [summaryEn, setSummaryEn] = useState('')
  const [bodyId, setBodyId] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  const loadArticles = useCallback(async () => {
    setIsLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const res = await fetch(`${baseUrl}/api/admin/articles`, {
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'success') {
          setArticles(data.articles || [])
        }
      }
    } catch {
      // Sample fallback for preview
      setArticles([
        {
          id: 'art-001',
          slug: 'memahami-kecemasan-dan-cara-mengatasinya',
          status: 'published',
          revisionStatus: 'approved',
          title: {
            id: 'Memahami Kecemasan dan Strategi Mengatasinya dalam Kehidupan Sehari-hari',
            en: 'Understanding Anxiety and Everyday Coping Strategies',
          },
          summary: {
            id: 'Kecemasan adalah respons alami tubuh terhadap stres.',
            en: 'Anxiety is a natural body response to stress.',
          },
          body: {
            id: 'Kecemasan dapat dialami oleh siapa saja...',
            en: 'Anxiety can affect anyone...',
          },
          updatedAt: new Date().toISOString(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    loadArticles()
    async function loadPsychologists() {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const res = await fetch(`${baseUrl}/api/admin/psychologists`, {
          headers: getAuthHeaders(),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'success' && data.psychologists?.length > 0) {
            setPsychologists(data.psychologists)
            setSelectedAuthorId(data.psychologists[0].id)
          }
        }
      } catch {
        // Non-blocking
      }
    }
    loadPsychologists()
  }, [loadArticles, getAuthHeaders])

  const openCreateModal = () => {
    setSlug('')
    setTitleId('')
    setTitleEn('')
    setSummaryId('')
    setSummaryEn('')
    setBodyId('')
    setBodyEn('')
    if (psychologists.length > 0) {
      setSelectedAuthorId(psychologists[0].id)
    }
    setModalError(null)
    setIsModalOpen(true)
  }

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError(null)
    if (!slug.trim() || !titleId.trim() || !titleEn.trim()) {
      setModalError('Lengkapi judul dan slug artikel.')
      return
    }

    setIsSubmitting(true)
    const payload = {
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      title: { id: titleId.trim(), en: titleEn.trim() },
      summary: { id: summaryId.trim() || titleId.trim(), en: summaryEn.trim() || titleEn.trim() },
      body: { id: bodyId.trim() || titleId.trim(), en: bodyEn.trim() || titleEn.trim() },
      ownerPsychologistId: isAdmin && selectedAuthorId ? selectedAuthorId : undefined,
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const res = await fetch(`${baseUrl}/api/admin/articles`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsModalOpen(false)
        await loadArticles()
      } else {
        const data = await res.json()
        setModalError(data.message || 'Gagal menyimpan draft artikel.')
      }
    } catch {
      setModalError('Network error.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAction = async (articleId: string, action: 'submit' | 'approve' | 'reject') => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const res = await fetch(`${baseUrl}/api/admin/articles/${articleId}/${action}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        await loadArticles()
      }
    } catch {
      // Ignore network errors in test/demo
    }
  }

  const filteredArticles = articles.filter((art) => {
    if (activeTab === 'draft') return art.status === 'draft' || art.revisionStatus === 'draft'
    if (activeTab === 'inReview') return art.revisionStatus === 'inReview'
    if (activeTab === 'published') return art.status === 'published'
    return true
  })

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Title & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Manajemen Artikel Psikologi</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Tulis artikel edukasi, ajukan review, dan kelola alur publikasi.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>+ Tulis Artikel Baru</span>
        </motion.button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
        {(['all', 'draft', 'inReview', 'published'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
              activeTab === tab
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab === 'all' ? 'Semua' : tab === 'draft' ? 'Draft' : tab === 'inReview' ? 'In Review' : 'Dipublikasikan'}
          </button>
        ))}
      </div>

      {/* Articles Table */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center text-slate-500 animate-pulse">
          Memuat daftar artikel...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 text-center text-slate-500">
          Belum ada artikel dalam kategori ini.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Judul Artikel</th>
                  <th className="px-6 py-3 font-semibold">Slug</th>
                  <th className="px-6 py-3 font-semibold">Penulis</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      <div>{art.title.id}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-normal">{art.title.en}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      {art.slug}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {art.author?.name || 'Psikolog Attentive'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        art.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : art.revisionStatus === 'inReview'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {art.status === 'published' ? 'Published' : art.revisionStatus || art.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {art.status === 'published' && (
                        <a
                          href={`/articles/${art.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <span>Lihat</span>
                          <span>↗</span>
                        </a>
                      )}
                      {art.status !== 'published' && art.revisionStatus !== 'inReview' && (
                        <button
                          onClick={() => handleAction(art.id, 'submit')}
                          className="px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-md transition-colors"
                        >
                          Ajukan Review
                        </button>
                      )}
                      {isAdmin && art.revisionStatus === 'inReview' && (
                        <>
                          <button
                            onClick={() => handleAction(art.id, 'approve')}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                          >
                            Setujui & Terbitkan
                          </button>
                          <button
                            onClick={() => handleAction(art.id, 'reject')}
                            className="px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-md transition-colors"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog for Article Editor */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700 mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Draft Artikel Baru</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveDraft} className="space-y-4">
                {isAdmin && psychologists.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Penulis Psikolog
                    </label>
                    <select
                      value={selectedAuthorId}
                      onChange={(e) => setSelectedAuthorId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      {psychologists.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="memahami-kecemasan-dan-cara-mengatasinya"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Judul (Indonesian)
                    </label>
                    <input
                      type="text"
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      placeholder="Memahami Kecemasan..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Judul (English)
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="Understanding Anxiety..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Ringkasan / Summary (ID)
                    </label>
                    <textarea
                      rows={2}
                      value={summaryId}
                      onChange={(e) => setSummaryId(e.target.value)}
                      placeholder="Ringkasan singkat..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Summary (EN)
                    </label>
                    <textarea
                      rows={2}
                      value={summaryEn}
                      onChange={(e) => setSummaryEn(e.target.value)}
                      placeholder="Short summary..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Isi Artikel / Content Body (ID)
                  </label>
                  <textarea
                    rows={4}
                    value={bodyId}
                    onChange={(e) => setBodyId(e.target.value)}
                    placeholder="Tuliskan isi artikel psikologi..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Draft'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
