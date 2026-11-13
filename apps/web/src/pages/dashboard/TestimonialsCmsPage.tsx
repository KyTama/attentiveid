import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Loader2,
  Quote,
} from 'lucide-react'
import { useAuth } from '../../features/auth/auth-context'
import {
  generateSafeCmsId,
  getLandingContentMutationErrors,
  LANDING_REPEATER_BOUNDS,
  normalizeLandingContentMutation,
  type LandingContentMutation,
} from '@attentiveid/shared'

interface TestimonialData {
  id: string
  position: number
  title: { id: string; en: string }
  description: { id: string; en: string }
}

const DEMOGRAPHIC_PRESETS = [
  { id: 'Klien - Konseling Online, 28 th', en: 'Client - Online Counseling, 28 y.o.' },
  { id: 'Klien - Tatap Muka Jakarta, 24 th', en: 'Client - In-Person Jakarta, 24 y.o.' },
  { id: 'Klien - Tatap Muka BSD, 31 th', en: 'Client - In-Person BSD, 31 y.o.' },
  { id: 'Klien - Tatap Muka Malang, 26 th', en: 'Client - In-Person Malang, 26 y.o.' },
  { id: 'Klien - Terapi Pasangan, 33 th', en: 'Client - Couples Therapy, 33 y.o.' },
]

export function TestimonialsCmsPage() {
  const { getAuthHeaders } = useAuth()

  const [landingContent, setLandingContent] = useState<LandingContentMutation | null>(null)
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([])
  const [headline, setHeadline] = useState({ id: 'Apa kata mereka yang telah berproses', en: 'Client Stories & Experiences' })
  const [description, setDescription] = useState({
    id: 'Setiap proses konseling adalah perjalanan personal yang dibangun atas rasa aman, kepercayaan, dan pendekatan profesional tanpa penghakiman.',
    en: 'Every counseling journey is built on emotional safety, deep trust, and professional evidence-based guidance without judgment.',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [modalForm, setModalForm] = useState<{
    nameId: string
    nameEn: string
    quoteId: string
    quoteEn: string
  }>({
    nameId: '',
    nameEn: '',
    quoteId: '',
    quoteEn: '',
  })

  // Load active landing content
  useEffect(() => {
    const fetchLanding = async () => {
      try {
        setIsLoading(true)
        const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const headers = getAuthHeaders()
        const res = await fetch(`${baseUrl}/api/admin/landing`, { headers })
        if (res.ok) {
          const json = await res.json()
          if (json.status === 'success' && json.content) {
            setLandingContent(json.content)
            const storiesSection = json.content.sections?.find((s: any) => s.key === 'clientStories')
            if (storiesSection) {
              if (storiesSection.headline) setHeadline(storiesSection.headline)
              if (storiesSection.description) setDescription(storiesSection.description)
              if (Array.isArray(storiesSection.items)) {
                setTestimonials(
                  storiesSection.items.map((item: any, idx: number) => ({
                    id: item.id || `story-${idx}`,
                    position: item.position ?? idx,
                    title: item.title || { id: '', en: '' },
                    description: item.description || { id: '', en: '' },
                  }))
                )
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load testimonials', err)
        setMessage({ type: 'error', text: 'Gagal memuat data testimoni dari server.' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanding()
  }, [getAuthHeaders])

  // Open modal for new item
  const handleAddNew = () => {
    if (testimonials.length >= LANDING_REPEATER_BOUNDS.clientStories.max) {
      setMessage({
        type: 'error',
        text: `Maksimal ${LANDING_REPEATER_BOUNDS.clientStories.max} testimoni diperbolehkan untuk menjaga performa carousel.`,
      })
      return
    }
    setEditingIndex(null)
    setModalForm({
      nameId: 'Klien - Konseling Online, 28 th',
      nameEn: 'Client - Online Counseling, 28 y.o.',
      quoteId: '',
      quoteEn: '',
    })
    setIsModalOpen(true)
  }

  // Open modal for edit item
  const handleEdit = (index: number) => {
    setEditingIndex(index)
    const item = testimonials[index]
    setModalForm({
      nameId: item.title.id,
      nameEn: item.title.en,
      quoteId: item.description.id,
      quoteEn: item.description.en || item.description.id,
    })
    setIsModalOpen(true)
  }

  // Save item from modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalForm.nameId.trim() || !modalForm.quoteId.trim()) {
      setMessage({ type: 'error', text: 'Nama / Inisial Klien dan Isi Ulasan wajib diisi.' })
      return
    }

    const updated = [...testimonials]
    const itemData: TestimonialData = {
      id: editingIndex !== null ? testimonials[editingIndex].id : generateSafeCmsId('story'),
      position: editingIndex !== null ? testimonials[editingIndex].position : testimonials.length,
      title: {
        id: modalForm.nameId.trim(),
        en: modalForm.nameEn.trim() || modalForm.nameId.trim(),
      },
      description: {
        id: modalForm.quoteId.trim(),
        en: modalForm.quoteEn.trim() || modalForm.quoteId.trim(),
      },
    }

    if (editingIndex !== null) {
      updated[editingIndex] = itemData
    } else {
      updated.push(itemData)
    }

    // Reassign sequential positions
    const reordered = updated.map((item, idx) => ({ ...item, position: idx }))
    setTestimonials(reordered)
    setHasUnsavedChanges(true)
    setIsModalOpen(false)
    setMessage({
      type: 'success',
      text: editingIndex !== null ? 'Testimoni berhasil diperbarui.' : 'Testimoni baru berhasil ditambahkan.',
    })
  }

  // Delete item
  const handleDelete = (index: number) => {
    if (testimonials.length <= 3) {
      setMessage({ type: 'error', text: 'Minimal harus ada 3 testimoni aktif untuk carousel homepage.' })
      return
    }
    const filtered = testimonials.filter((_, idx) => idx !== index)
    const reordered = filtered.map((item, idx) => ({ ...item, position: idx }))
    setTestimonials(reordered)
    setHasUnsavedChanges(true)
    setMessage({ type: 'success', text: 'Testimoni berhasil dihapus.' })
  }

  // Move up
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...testimonials]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    const reordered = updated.map((item, idx) => ({ ...item, position: idx }))
    setTestimonials(reordered)
    setHasUnsavedChanges(true)
  }

  // Move down
  const handleMoveDown = (index: number) => {
    if (index === testimonials.length - 1) return
    const updated = [...testimonials]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    const reordered = updated.map((item, idx) => ({ ...item, position: idx }))
    setTestimonials(reordered)
    setHasUnsavedChanges(true)
  }

  const buildUpdatedLandingContent = (): LandingContentMutation | null => {
    if (!landingContent) return null
    const updatedSections = landingContent.sections.map((section: any) => {
      if (section.key === 'clientStories') {
        return {
          ...section,
          headline,
          description,
          items: testimonials.map((item, idx) => ({
            id: item.id,
            position: idx,
            title: item.title,
            description: item.description,
          })),
        }
      }
      return section
    })
    return normalizeLandingContentMutation({
      ...landingContent,
      sections: updatedSections as LandingContentMutation['sections'],
    })
  }

  const handleSaveDraft = async () => {
    const payload = buildUpdatedLandingContent()
    if (!payload) {
      setMessage({ type: 'error', text: 'Data landing content belum siap.' })
      return
    }
    if (testimonials.length < LANDING_REPEATER_BOUNDS.clientStories.min) {
      setMessage({ type: 'error', text: `Minimal dibutuhkan ${LANDING_REPEATER_BOUNDS.clientStories.min} testimoni aktif.` })
      return
    }
    const validationErrors = getLandingContentMutationErrors(payload)
    if (validationErrors.length > 0) {
      setMessage({ type: 'error', text: `Validasi gagal: ${validationErrors[0]}` })
      return
    }

    try {
      setIsSaving(true)
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const res = await fetch(`${baseUrl}/api/admin/landing/draft`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.status === 'success') {
        setLandingContent(json.revision?.content ?? payload)
        setHasUnsavedChanges(false)
        setMessage({
          type: 'success',
          text: `Draft ${testimonials.length} testimoni berhasil disimpan!`,
        })
      } else {
        const detail = Array.isArray(json.errors) && json.errors.length > 0 ? json.errors[0] : json.message
        setMessage({
          type: 'error',
          text: `Gagal menyimpan draft testimoni: ${detail || res.statusText}`,
        })
      }
    } catch (err) {
      console.error('Save draft error', err)
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan saat menyimpan draft testimoni.' })
    } finally {
      setIsSaving(false)
    }
  }

  // Publish to Live Homepage
  const handlePublish = async () => {
    const payload = buildUpdatedLandingContent()
    if (!payload) {
      setMessage({ type: 'error', text: 'Data landing content belum siap.' })
      return
    }

    if (testimonials.length < LANDING_REPEATER_BOUNDS.clientStories.min) {
      setMessage({ type: 'error', text: `Minimal dibutuhkan ${LANDING_REPEATER_BOUNDS.clientStories.min} testimoni agar carousel dapat berjalan optimal.` })
      return
    }

    const validationErrors = getLandingContentMutationErrors(payload)
    if (validationErrors.length > 0) {
      setMessage({ type: 'error', text: `Validasi gagal sebelum terbit: ${validationErrors[0]}` })
      return
    }

    try {
      setIsSaving(true)
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const headers = getAuthHeaders()

      const res = await fetch(`${baseUrl}/api/admin/landing/publish`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const resJson = await res.json().catch(() => ({}))
      if (res.ok && resJson.status === 'success') {
        setLandingContent(resJson.content ?? payload)
        setHasUnsavedChanges(false)
        setMessage({
          type: 'success',
          text: `🎉 Sukses! ${testimonials.length} testimoni berhasil diterbitkan ke auto-moving carousel di homepage!`,
        })
      } else {
        const detail = Array.isArray(resJson.errors) && resJson.errors.length > 0 ? resJson.errors[0] : resJson.message
        setMessage({
          type: 'error',
          text: `Gagal menerbitkan testimoni: ${detail || res.statusText}`,
        })
      }
    } catch (err) {
      console.error('Publish error', err)
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan saat mempublikasikan testimoni.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              <MessageSquareQuote className="size-3.5" />
              <span>Modul Testimoni Klien</span>
            </span>
            {hasUnsavedChanges && (
              <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold animate-pulse">
                Ada Perubahan Belum Terbit
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Manajemen Testimoni Klien
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Kelola kutipan ulasan pengalaman klien. Data ini langsung terhubung dengan auto-moving carousel interaktif di homepage dengan verifikasi kode etik HIMPSI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Tambah Testimoni</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 disabled:opacity-50 text-teal-800 border border-teal-200 font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <span>Simpan Draft</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            <span>{isSaving ? 'Menerbitkan...' : 'Terbitkan ke Homepage'}</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`p-4 rounded-xl text-sm flex items-start justify-between gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="size-5 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="text-xs font-bold opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Preview Strip: Moving Carousel Preview */}
      <div className="p-6 bg-gradient-to-b from-[#fbf8f2] to-[#f4ece1] rounded-2xl border border-secondary/10 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-secondary">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-[#946a22]" />
            <span>Live Interactive Preview (Auto-moving Carousel Homepage)</span>
          </div>
          <span className="text-[11px] font-normal text-slate-500">
            Arahkan kursor untuk menjeda putaran
          </span>
        </div>

        {/* Mini Marquee Preview */}
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)] py-2">
          <div className="animate-marquee flex gap-4 py-2">
            {(testimonials.length > 0 ? [...testimonials, ...testimonials] : []).map((t, i) => (
              <div
                key={`${t.id}-preview-${i}`}
                className="w-72 shrink-0 bg-white rounded-xl p-4 border border-secondary/10 shadow-2xs select-none"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="size-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                    Terverifikasi
                  </span>
                </div>
                <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed italic">
                  “{t.description.id}”
                </p>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">{t.title.id}</span>
                  <span className="text-slate-400">HIMPSI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daftar Testimoni Aktif ({testimonials.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urutan kartu di bawah menentukan urutan tayang pada carousel homepage.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            Min. 3 testimoni
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-teal-600" />
            <p className="text-sm">Memuat data testimoni...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Quote className="size-10 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-800">Belum ada testimoni tersimpan</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Klik tombol di bawah untuk menambahkan testimoni pertama.</p>
            <button
              type="button"
              onClick={handleAddNew}
              className="px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-teal-900 cursor-pointer"
            >
              + Tambah Testimoni Baru
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {testimonials.map((item, index) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="flex items-center justify-center size-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
                    #{index + 1}
                  </span>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {item.title.id}
                      </h3>
                      {item.title.en && item.title.en !== item.title.id && (
                        <span className="text-[11px] text-slate-500 italic">
                          ({item.title.en})
                        </span>
                      )}
                      <div className="flex gap-0.5 text-amber-400 ml-1">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <blockquote className="text-xs text-slate-700 leading-relaxed bg-slate-50 border-l-2 border-primary/60 pl-3 py-1 my-1 rounded-r-md">
                      “{item.description.id}”
                    </blockquote>

                    {item.description.en && item.description.en !== item.description.id && (
                      <blockquote className="text-xs text-slate-500 leading-relaxed pl-3 italic">
                        “{item.description.en}”
                      </blockquote>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Geser ke atas"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowUp className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === testimonials.length - 1}
                    title="Geser ke bawah"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowDown className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    title="Edit testimoni"
                    className="p-1.5 rounded-lg border border-teal-200 text-teal-700 hover:bg-teal-50 cursor-pointer"
                  >
                    <Edit3 className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    title="Hapus testimoni"
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingIndex !== null ? 'Edit Testimoni Klien' : 'Tambah Testimoni Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto">
                {/* Preset Chips */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Pilihan Cepat Demografi / Format Klien:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMOGRAPHIC_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setModalForm({
                            ...modalForm,
                            nameId: preset.id,
                            nameEn: preset.en,
                          })
                        }}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-800 rounded-md text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
                      >
                        {preset.id}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name / Demographic (ID) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Label Klien / Format Sesi (Bahasa Indonesia) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Klien - Konseling Online, 28 th"
                    value={modalForm.nameId}
                    onChange={(e) => setModalForm({ ...modalForm, nameId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Name / Demographic (EN) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Label Klien / Format Sesi (English)
                  </label>
                  <input
                    type="text"
                    placeholder="Example: Client - Online Counseling, 28 y.o."
                    value={modalForm.nameEn}
                    onChange={(e) => setModalForm({ ...modalForm, nameEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Quote (ID) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Isi Ulasan Testimoni (Bahasa Indonesia) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tuliskan cerita dan pengalaman positif klien selama menjalani sesi konseling..."
                    value={modalForm.quoteId}
                    onChange={(e) => setModalForm({ ...modalForm, quoteId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  />
                </div>

                {/* Quote (EN) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Isi Ulasan Testimoni (English Translation)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="English translation of client's feedback and experience..."
                    value={modalForm.quoteEn}
                    onChange={(e) => setModalForm({ ...modalForm, quoteEn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    {editingIndex !== null ? 'Simpan Perubahan' : 'Tambahkan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
