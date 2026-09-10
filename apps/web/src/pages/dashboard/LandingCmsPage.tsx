import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'

const defaultLandingData: any = {
  sections: [
    {
      key: 'hero',
      visible: true,
      headline: { id: 'Layanan Psikologi Profesional untuk Kesejahteraan Mental Anda', en: 'Professional Psychological Bureau for Your Mental Wellbeing' },
      description: { id: 'Dampingi setiap langkah perawatan emosional Anda bersama psikolog klinis terpercaya.', en: 'Accompanying every step of your emotional care with trusted clinical psychologists.' },
      primaryCta: { id: 'Jadwalkan Konsultasi', en: 'Book Consultation' },
      secondaryCta: { id: 'Lihat Layanan', en: 'Explore Services' },
      items: [
        { id: 'item-1', position: 0, title: { id: 'Kerahasiaan Terjamin', en: 'Guaranteed Confidentiality' }, description: { id: 'Privasi data dan sesi Anda 100% terjaga.', en: 'Your session and data privacy are 100% protected.' } },
        { id: 'item-2', position: 1, title: { id: 'Psikolog Berizin', en: 'Licensed Psychologists' }, description: { id: 'Ditangani langsung oleh praktisi berlisensi resmi.', en: 'Handled directly by officially licensed practitioners.' } },
        { id: 'item-3', position: 2, title: { id: 'Pendekatan Empatis', en: 'Empathetic Approach' }, description: { id: 'Ruang aman tanpa penghakiman.', en: 'A safe, non-judgmental space.' } },
      ],
    },
    {
      key: 'supportExplorer',
      visible: true,
      headline: { id: 'Area Layanan & Dukungan Psikologi', en: 'Psychology Support & Care Areas' },
      description: { id: 'Pilih area dukungan yang paling sesuai dengan kebutuhan Anda saat ini.', en: 'Choose the support area best aligned with your current needs.' },
      items: [
        { id: 'sup-1', position: 0, title: { id: 'Psikologi Dewasa', en: 'Adult Psychology' }, description: { id: 'Konseling kecemasan, depresi, stres kerja, dan kecerdasan emosional.', en: 'Counseling for anxiety, depression, work stress, and emotional regulation.' } },
        { id: 'sup-2', position: 1, title: { id: 'Anak & Remaja', en: 'Child & Adolescent' }, description: { id: 'Pendampingan tumbuh kembang, perilaku, dan tantangan akademik.', en: 'Guidance for developmental, behavioral, and academic challenges.' } },
        { id: 'sup-3', position: 2, title: { id: 'Pendidikan & Karir', en: 'Educational & Career' }, description: { id: 'Asesmen minat bakat, kesiapan karir, dan potensi diri.', en: 'Aptitude assessment, career readiness, and self-potential evaluation.' } },
      ],
    },
    {
      key: 'carePromise',
      visible: true,
      headline: { id: 'Komitmen Layanan Attentive.id', en: 'Attentive.id Care Promise' },
      description: { id: 'Standar etika dan kenyamanan terbaik untuk proses pemulihan Anda.', en: 'The highest ethical standards and comfort for your healing journey.' },
      items: [
        { id: 'cp-1', position: 0, title: { id: 'Etika Profesional', en: 'Professional Ethics' }, description: { id: 'Mematuhi kode etik psikologi Indonesia.', en: 'Adhering strictly to Indonesian psychological ethics.' } },
        { id: 'cp-2', position: 1, title: { id: 'Fleksibilitas Sesi', en: 'Session Flexibility' }, description: { id: 'Pilihan sesi tatap muka atau tatap maya.', en: 'Choice of in-person or online video consultation.' } },
        { id: 'cp-3', position: 2, title: { id: 'Proses Terstruktur', en: 'Structured Process' }, description: { id: 'Rencana pendampingan yang terukur.', en: 'Measurable and goal-oriented guidance plans.' } },
      ],
    },
    {
      key: 'featuredPsychologists',
      visible: true,
      headline: { id: 'Tim Psikolog Profesional Kami', en: 'Our Professional Psychologist Team' },
      description: { id: 'Kenali praktisi kesehatan mental yang siap mendampingi Anda.', en: 'Meet our dedicated mental health practitioners ready to support you.' },
    },
    {
      key: 'careJourney',
      visible: true,
      headline: { id: 'Tahapan Langkah Konsultasi', en: 'Your Care Journey Steps' },
      description: { id: 'Proses sederhana untuk memulai perjalanan kesehatan mental Anda.', en: 'Simple steps to begin your mental health journey.' },
      items: [
        { id: 'cj-1', position: 0, title: { id: '1. Pilih Psikolog', en: '1. Select Psychologist' }, description: { id: 'Temukan profil psikolog yang sesuai.', en: 'Find a matching psychologist profile.' } },
        { id: 'cj-2', position: 1, title: { id: '2. Atur Jadwal', en: '2. Schedule Time' }, description: { id: 'Pilih waktu dan moda konsultasi.', en: 'Choose your preferred slot and mode.' } },
        { id: 'cj-3', position: 2, title: { id: '3. Mulai Sesi', en: '3. Begin Session' }, description: { id: 'Jalani sesi dengan aman dan nyaman.', en: 'Conduct your session safely and comfortably.' } },
      ],
    },
    {
      key: 'clientStories',
      visible: true,
      headline: { id: 'Cerita Klien Kami', en: 'Client Stories & Testimonials' },
      description: { id: 'Pengalaman nyata Klien yang tumbuh bersama Attentive.id.', en: 'Real experiences from clients growing with Attentive.id.' },
      items: [
        { id: 'cs-1', position: 0, title: { id: 'Pengalaman Merasa Didengar', en: 'Feeling Truly Heard' }, description: { id: 'Sesi konsultasi yang sangat hangat dan membantu.', en: 'A very warm and genuinely helpful consultation session.' } },
        { id: 'cs-2', position: 1, title: { id: 'Regulasi Emosi Lebih Baik', en: 'Better Emotional Control' }, description: { id: 'Mendapat alat praktis untuk mengelola kecemasan.', en: 'Gained practical tools for managing everyday anxiety.' } },
        { id: 'cs-3', position: 2, title: { id: 'Penanganan Profesional', en: 'Professional Care' }, description: { id: 'Sangat direkomendasikan untuk siapa pun yang butuh teman cerita.', en: 'Highly recommended for anyone needing professional guidance.' } },
      ],
    },
    {
      key: 'consultationReassurance',
      visible: true,
      headline: { id: 'Informasi Biaya & Konsultasi', en: 'Consultation Pricing & Details' },
      description: { id: 'Biaya transparan tanpa biaya tersembunyi.', en: 'Transparent fees with no hidden costs.' },
      sessionLabel: { id: 'Sesi Konsultasi Individu (60 Menit)', en: 'Individual Counseling Session (60 Mins)' },
      price: { id: 'Rp 250.000', en: 'IDR 250,000' },
      priceUnit: { id: '/sesi', en: '/session' },
      primaryCta: { id: 'Reservasi Sesi Sekarang', en: 'Book Session Now' },
    },
    {
      key: 'frequentlyAskedQuestions',
      visible: true,
      headline: { id: 'Pertanyaan Umum (FAQ)', en: 'Frequently Asked Questions' },
      description: { id: 'Jawaban atas pertanyaan yang sering diajukan calon klien.', en: 'Answers to common questions from prospective clients.' },
      items: [
        { id: 'faq-1', position: 0, title: { id: 'Bagaimana cara mendaftar konsultasi?', en: 'How do I register for a session?' }, description: { id: 'Pilih psikolog dari direktori dan klik tombol reservasi.', en: 'Choose a psychologist from the directory and click book.' } },
        { id: 'faq-2', position: 1, title: { id: 'Apakah rahasia sesi terjaga?', en: 'Is my session confidential?' }, description: { id: 'Ya, seluruh data dan percakapan dilindungi kode etika psikologi.', en: 'Yes, all data and discussions are protected under psychological ethics.' } },
        { id: 'faq-3', position: 2, title: { id: 'Apakah bisa sesi online?', en: 'Are online sessions available?' }, description: { id: 'Bisa, sesi online tersedia via Google Meet / Zoom aman.', en: 'Yes, secure online sessions are available via video call.' } },
      ],
    },
    {
      key: 'closingInvitation',
      visible: true,
      headline: { id: 'Siap Memulai Langkah Pertama Anda?', en: 'Ready to Take Your First Step?' },
      description: { id: 'Jangan ragu menghubungi tim kami untuk pertanyaan lebih lanjut.', en: 'Do not hesitate to reach out to our team for further inquiries.' },
      primaryCta: { id: 'Konsultasi Sekarang', en: 'Consult Now' },
      contact: { id: 'WhatsApp: +62 812-3456-7890 | Email: halo@attentive.id', en: 'WhatsApp: +62 812-3456-7890 | Email: halo@attentive.id' },
    },
  ],
}

export function LandingCmsPage() {
  const { getAuthHeaders } = useAuth()
  const [content, setContent] = useState<any>(defaultLandingData)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    async function loadLandingDraft() {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
        const res = await fetch(`${baseUrl}/api/admin/landing`, {
          headers: getAuthHeaders(),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'success' && data.content) {
            setContent(data.content)
          }
        }
      } catch {
        // Retain default data on network fallback
      }
    }
    loadLandingDraft()
  }, [])

  const handleSaveDraft = async () => {
    setMessage(null)
    setIsSaving(true)
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const res = await fetch(`${baseUrl}/api/admin/landing/draft`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })
      const data = await res.json()
      if (res.ok && data.status === 'success') {
        setMessage({ type: 'success', text: 'Draft landing page berhasil disimpan!' })
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal menyimpan draft.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal terhubung ke server.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menerbitkan draft ini ke website publik live?')) {
      return
    }
    setMessage(null)
    setIsPublishing(true)
    try {
      const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      const res = await fetch(`${baseUrl}/api/admin/landing/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      const data = await res.json()
      if (res.ok && data.status === 'success') {
        setMessage({ type: 'success', text: 'Content landing page LIVE berhasil diperbarui!' })
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal menerbitkan konten.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal terhubung ke server.' })
    } finally {
      setIsPublishing(false)
    }
  }

  const activeSection = content.sections[activeSectionIndex]

  const updateSectionCopy = (field: 'headline' | 'description', lang: 'id' | 'en', value: string) => {
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      [field]: {
        ...activeSection[field],
        [lang]: value,
      },
    }
    setContent({ ...content, sections: newSections })
  }

  const updateRepeaterItem = (itemIndex: number, field: 'title' | 'description', lang: 'id' | 'en', value: string) => {
    const newItems = [...activeSection.items]
    newItems[itemIndex] = {
      ...newItems[itemIndex],
      [field]: {
        ...newItems[itemIndex][field],
        [lang]: value,
      },
    }
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = { ...activeSection, items: newItems }
    setContent({ ...content, sections: newSections })
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Sticky Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm sticky top-16 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Landing Content Editor</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Edit teks bilingual 9 section landing page dan atur urutan repeater.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/preview/landing"
            target="_blank"
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 transition-colors"
          >
            Preview Draft ↗
          </Link>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-3 py-2 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
          >
            {isPublishing ? 'Menerbitkan...' : 'Terbitkan ke Publik'}
          </motion.button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Grid: Section Nav + Section Editor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Section List Navigation */}
        <div className="space-y-1 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-xs font-bold uppercase text-slate-400 px-3 py-1 tracking-wider">Sections</h2>
          {content.sections.map((sec: any, idx: number) => (
            <button
              key={sec.key}
              onClick={() => setActiveSectionIndex(idx)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors flex items-center justify-between ${
                activeSectionIndex === idx
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{idx + 1}. {sec.key}</span>
              <span className={`w-2 h-2 rounded-full ${sec.visible ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </button>
          ))}
        </div>

        {/* Active Section Form */}
        <div className="md:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Editing Section</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">{activeSection?.key}</h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={activeSection?.visible}
                onChange={(e) => {
                  const newSections = [...content.sections]
                  newSections[activeSectionIndex] = { ...activeSection, visible: e.target.checked }
                  setContent({ ...content, sections: newSections })
                }}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Tampilkan Section di Website</span>
            </label>
          </div>

          {/* Section Copy (Headline & Description) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Judul & Deskripsi Section</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Headline (Indonesian)</label>
                <input
                  type="text"
                  value={activeSection?.headline?.id || ''}
                  onChange={(e) => updateSectionCopy('headline', 'id', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Headline (English)</label>
                <input
                  type="text"
                  value={activeSection?.headline?.en || ''}
                  onChange={(e) => updateSectionCopy('headline', 'en', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description (Indonesian)</label>
                <textarea
                  rows={3}
                  value={activeSection?.description?.id || ''}
                  onChange={(e) => updateSectionCopy('description', 'id', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description (English)</label>
                <textarea
                  rows={3}
                  value={activeSection?.description?.en || ''}
                  onChange={(e) => updateSectionCopy('description', 'en', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Repeater Items Section if section contains items */}
          {Array.isArray(activeSection?.items) && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Item Repeater List ({activeSection.items.length} item)</h3>

              <div className="space-y-4">
                {activeSection.items.map((item: any, itemIdx: number) => (
                  <div key={item.id || itemIdx} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Item #{itemIdx + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Title (ID)"
                        value={item.title?.id || ''}
                        onChange={(e) => updateRepeaterItem(itemIdx, 'title', 'id', e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Title (EN)"
                        value={item.title?.en || ''}
                        onChange={(e) => updateRepeaterItem(itemIdx, 'title', 'en', e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <textarea
                        rows={2}
                        placeholder="Description (ID)"
                        value={item.description?.id || ''}
                        onChange={(e) => updateRepeaterItem(itemIdx, 'description', 'id', e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                      <textarea
                        rows={2}
                        placeholder="Description (EN)"
                        value={item.description?.en || ''}
                        onChange={(e) => updateRepeaterItem(itemIdx, 'description', 'en', e.target.value)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
