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
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [deletingArticle, setDeletingArticle] = useState<ArticleCmsItem | null>(null)

  const [slug, setSlug] = useState('')
  const [titleId, setTitleId] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [summaryId, setSummaryId] = useState('')
  const [summaryEn, setSummaryEn] = useState('')
  const [bodyId, setBodyId] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
      } else {
        const data = await res.json().catch(() => ({}))
        setFeedback({ type: 'error', text: data.message || 'Gagal memuat artikel dari server.' })
      }
    } catch {
      setFeedback({ type: 'error', text: 'Koneksi ke server gagal saat memuat daftar artikel.' })
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
            return
          }
        }
      } catch {
        // Fallback
      }

      // Default fallback psychologists for clean selection
      const fallbackPsychologists = [
        { id: 'haykal', name: 'Dr. Haykal Hafizul Arifin, S.Psi., M.Sc.' },
        { id: 'dr-syazka', name: 'Dr. Syazka, M.Psi.' },
      ]
      setPsychologists(fallbackPsychologists)
      setSelectedAuthorId(fallbackPsychologists[0].id)
    }
    loadPsychologists()
  }, [loadArticles, getAuthHeaders])

  const openCreateModal = () => {
    setEditingArticleId(null)
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

  const openEditModal = (art: ArticleCmsItem) => {
    setEditingArticleId(art.id)
    setSlug(art.slug)
    setTitleId(art.title.id)
    setTitleEn(art.title.en)
    setSummaryId(art.summary.id)
    setSummaryEn(art.summary.en)
    setBodyId(art.body.id)
    setBodyEn(art.body.en)
    if (art.author?.id) {
      setSelectedAuthorId(art.author.id)
    }
    setModalError(null)
    setIsModalOpen(true)
  }

  const handleSaveArticle = async (e: React.FormEvent, publishImmediately = false) => {
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
      ownerPsychologistId: !editingArticleId && isAdmin && selectedAuthorId ? selectedAuthorId : undefined,
      publishImmediately: publishImmediately && isAdmin ? true : undefined,
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const url = editingArticleId
        ? `${baseUrl}/api/admin/articles/${editingArticleId}`
        : `${baseUrl}/api/admin/articles`
      const method = editingArticleId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setIsModalOpen(false)
        if (publishImmediately && editingArticleId) {
          // If editing and requested direct publish
          await handleAction(editingArticleId, 'approve')
        } else {
          setFeedback({
            type: 'success',
            text: publishImmediately
              ? 'Artikel berhasil diterbitkan secara live!'
              : editingArticleId
              ? 'Draft artikel berhasil diperbarui!'
              : 'Draft artikel baru berhasil disimpan!',
          })
          await loadArticles()
        }
      } else {
        const data = await res.json().catch(() => ({}))
        setModalError(data.message || 'Gagal menyimpan draft artikel.')
      }
    } catch {
      setModalError('Terjadi kesalahan jaringan saat menyimpan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAction = async (articleId: string, action: 'submit' | 'approve' | 'reject' | 'unpublish' | 'delete') => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const method = action === 'delete' ? 'DELETE' : 'POST'
      const url = action === 'delete'
        ? `${baseUrl}/api/admin/articles/${articleId}`
        : `${baseUrl}/api/admin/articles/${articleId}/${action}`

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        const actionLabels: Record<string, string> = {
          submit: 'Artikel berhasil diajukan untuk review editorial!',
          approve: 'Artikel berhasil disetujui & dipublikasikan secara live!',
          reject: 'Artikel berhasil ditolak & dikembalikan ke status revisi.',
          unpublish: 'Publikasi artikel berhasil ditarik (unpublished).',
          delete: 'Artikel berhasil dihapus secara permanen.',
        }
        setFeedback({ type: 'success', text: actionLabels[action] || 'Aksi artikel berhasil diproses.' })
        await loadArticles()
      } else {
        const data = await res.json().catch(() => ({}))
        setFeedback({ type: 'error', text: data.message || `Gagal memproses aksi ${action}.` })
      }
    } catch {
      setFeedback({ type: 'error', text: 'Koneksi jaringan gagal saat mengeksekusi aksi artikel.' })
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
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Artikel Psikologi</h1>
          <p className="text-sm text-slate-600">Tulis artikel edukasi, ajukan review, dan kelola alur publikasi.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>+ Tulis Artikel Baru</span>
        </motion.button>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl text-sm border flex items-center justify-between shadow-xs ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold px-2 py-0.5 rounded hover:bg-black/5 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        {(['all', 'draft', 'inReview', 'published'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer capitalize ${
              activeTab === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab === 'all'
              ? 'Semua'
              : tab === 'draft'
              ? 'Draft'
              : tab === 'inReview'
              ? 'Menunggu Review'
              : 'Published'}
          </button>
        ))}
      </div>

      {/* Articles List / Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 animate-pulse text-sm">
          Memuat daftar artikel...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <div className="text-3xl">📄</div>
          <h3 className="text-base font-semibold text-slate-800">Belum Ada Artikel</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'all'
              ? 'Mulai publikasikan tulisan edukasi dan artikel psikologi untuk pembaca Attentive.id.'
              : `Tidak ada artikel pada kategori tab "${activeTab}".`}
          </p>
          <button
            onClick={openCreateModal}
            className="text-xs font-medium text-teal-600 hover:text-teal-700 underline cursor-pointer"
          >
            Tulis Artikel Sekarang
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Judul Artikel</th>
                  <th className="px-6 py-3 font-semibold">Slug</th>
                  <th className="px-6 py-3 font-semibold">Penulis</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-xs truncate">
                      <div>{art.title.id}</div>
                      <div className="text-xs text-slate-500 font-normal">{art.title.en}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {art.slug}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700 font-medium">
                      {art.author?.name || 'Psikolog Attentive'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        art.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : art.status === 'unpublished'
                          ? 'bg-amber-100 text-amber-900'
                          : art.revisionStatus === 'inReview'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {art.status === 'published'
                          ? 'Published'
                          : art.status === 'unpublished'
                          ? 'Unpublished'
                          : art.revisionStatus || art.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      {art.status === 'published' && (
                        <>
                          <a
                            href={`/articles/${art.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors inline-flex items-center gap-1"
                          >
                            <span>Lihat</span>
                            <span>↗</span>
                          </a>
                          {isAdmin && (
                            <button
                              onClick={() => handleAction(art.id, 'unpublish')}
                              className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors cursor-pointer"
                              title="Tarik artikel dari publikasi publik"
                            >
                              Tarik Publikasi
                            </button>
                          )}
                        </>
                      )}

                      {art.status === 'unpublished' && isAdmin && (
                        <button
                          onClick={() => handleAction(art.id, 'approve')}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                          title="Publikasikan kembali artikel ini"
                        >
                          Terbitkan Ulang
                        </button>
                      )}

                      {art.revisionStatus !== 'inReview' && (
                        <button
                          onClick={() => openEditModal(art)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          Edit Draft
                        </button>
                      )}

                      {art.status !== 'published' && art.status !== 'unpublished' && art.revisionStatus !== 'inReview' && (
                        <>
                          {isAdmin ? (
                            <button
                              onClick={async () => {
                                await handleAction(art.id, 'submit')
                                await handleAction(art.id, 'approve')
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors cursor-pointer"
                              title="Langsung publikasikan live tanpa antrian review"
                            >
                              Terbitkan Langsung
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(art.id, 'submit')}
                              className="px-2.5 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md transition-colors cursor-pointer"
                            >
                              Ajukan Review
                            </button>
                          )}
                        </>
                      )}

                      {isAdmin && art.revisionStatus === 'inReview' && (
                        <>
                          <button
                            onClick={() => handleAction(art.id, 'approve')}
                            className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
                          >
                            Setujui & Terbitkan
                          </button>
                          <button
                            onClick={() => handleAction(art.id, 'reject')}
                            className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => setDeletingArticle(art)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Artikel Permanen"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setDeletingArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="size-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hapus Artikel Secara Permanen?</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Artikel <strong>&ldquo;{deletingArticle.title.id}&rdquo;</strong> ({deletingArticle.slug}) dan seluruh riwayat revisinya akan dihapus permanen dari sistem.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingArticle(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = deletingArticle.id
                    setDeletingArticle(null)
                    await handleAction(id, 'delete')
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Dialog for Article Editor */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingArticleId ? 'Edit Draft Artikel' : 'Tulis Artikel Edukasi Baru'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isAdmin ? 'Admin dapat langsung menerbitkan artikel secara live atau menyimpannya sebagai draft.' : 'Tulis konten dalam Bahasa Indonesia & English untuk edukasi psikologi.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-semibold px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {modalError}
                </div>
              )}

              <form onSubmit={(e) => handleSaveArticle(e, false)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Slug URL (Unik)
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="contoh-artikel-psikologi"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {isAdmin && (
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                        Penulis (Psikolog)
                      </label>
                      <select
                        value={selectedAuthorId}
                        onChange={(e) => setSelectedAuthorId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      >
                        {psychologists.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Judul (Bahasa Indonesia)
                    </label>
                    <input
                      type="text"
                      value={titleId}
                      onChange={(e) => setTitleId(e.target.value)}
                      placeholder="Memahami Kecemasan..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Judul (English)
                    </label>
                    <input
                      type="text"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="Understanding Anxiety..."
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Ringkasan / Summary (ID)
                    </label>
                    <textarea
                      rows={2}
                      value={summaryId}
                      onChange={(e) => setSummaryId(e.target.value)}
                      placeholder="Ringkasan singkat..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                      Summary (EN)
                    </label>
                    <textarea
                      rows={2}
                      value={summaryEn}
                      onChange={(e) => setSummaryEn(e.target.value)}
                      placeholder="Short summary..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Isi Artikel / Content Body (ID)
                  </label>
                  <textarea
                    rows={4}
                    value={bodyId}
                    onChange={(e) => setBodyId(e.target.value)}
                    placeholder="Tuliskan isi artikel psikologi..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Content Body (EN)
                  </label>
                  <textarea
                    rows={4}
                    value={bodyEn}
                    onChange={(e) => setBodyEn(e.target.value)}
                    placeholder="Write article content in English..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'Menyimpan...' : editingArticleId ? 'Perbarui Draft' : 'Simpan Draft'}
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={(e) => handleSaveArticle(e, true)}
                        className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors disabled:opacity-50 font-semibold cursor-pointer"
                      >
                        {isSubmitting ? 'Menerbitkan...' : 'Simpan & Terbitkan Langsung'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
