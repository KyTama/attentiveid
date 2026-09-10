import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  listAdminPsychologists,
  getAdminPsychologistById,
  saveAdminPsychologist,
  updatePsychologistStatus
} from '../../features/psychologists/psychologist-cms'
import type { FullPsychologistMutation } from '@attentiveid/shared'

const springConfig = { type: 'spring', stiffness: 400, damping: 30 } as const

const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
  active: { label: 'Active', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300' },
  inactive: { label: 'Inactive', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
  archived: { label: 'Archived', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300' },
}

const supportAreaLabels: Record<string, string> = {
  adultClinical: 'Dewasa & Klinis',
  childAdolescent: 'Anak & Remaja',
  educational: 'Pendidikan & Edukasi',
}

interface FormState {
  id?: string
  slug: string
  status: 'draft' | 'active' | 'inactive' | 'archived'
  name: string
  nickname: string
  credential: string
  licenseNumber: string
  experienceYears: number
  bookingUrl: string
  premiumBookingUrl: string
  featured: boolean
  featuredOrder: string
  supportAreas: { supportArea: 'adultClinical' | 'childAdolescent' | 'educational'; primary: boolean }[]
  specializations: { id: string; labelId: string; labelEn: string }[]
  biographyId: string
  biographyEn: string
  availabilityMessageId: string
  availabilityMessageEn: string
  mediaReference: string
  mediaWidth: number
  mediaHeight: number
  mediaAltId: string
  mediaAltEn: string
}

const defaultFormState: FormState = {
  slug: '',
  status: 'draft',
  name: '',
  nickname: '',
  credential: '',
  licenseNumber: '',
  experienceYears: 3,
  bookingUrl: 'https://attentive.id/book/',
  premiumBookingUrl: '',
  featured: false,
  featuredOrder: '',
  supportAreas: [{ supportArea: 'adultClinical', primary: true }],
  specializations: [{ id: 'spec-0', labelId: '', labelEn: '' }],
  biographyId: '',
  biographyEn: '',
  availabilityMessageId: '',
  availabilityMessageEn: '',
  mediaReference: 'media/psychologists/default.webp',
  mediaWidth: 600,
  mediaHeight: 600,
  mediaAltId: 'Foto Psikolog',
  mediaAltEn: 'Psychologist photo',
}

export function PsychologistsCmsPage() {
  const [psychologists, setPsychologists] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [supportAreaFilter, setSupportAreaFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'status' | 'booking' | 'skills' | 'bio' | 'media'>('basic')
  const [formState, setFormState] = useState<FormState>(defaultFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await listAdminPsychologists({
        status: statusFilter,
        supportArea: supportAreaFilter,
        search: searchQuery,
      })
      setPsychologists(res.psychologists || [])
      setTotal(res.total || 0)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data psikolog.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [statusFilter, supportAreaFilter, searchQuery])

  const handleOpenCreateModal = () => {
    setFormState(defaultFormState)
    setActiveFormTab('basic')
    setFormError(null)
    setFormSuccess(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (item: any) => {
    setIsLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const full = await getAdminPsychologistById(item.id)
      setFormState({
        id: full.id,
        slug: full.slug,
        status: full.status,
        name: full.name,
        nickname: full.nickname,
        credential: full.credential,
        licenseNumber: full.licenseNumber,
        experienceYears: full.experienceYears,
        bookingUrl: full.bookingUrl,
        premiumBookingUrl: full.premiumBookingUrl || '',
        featured: full.featured,
        featuredOrder: full.featuredOrder !== null ? String(full.featuredOrder) : '',
        supportAreas: full.supportAreas.map((sa: any) => ({ supportArea: sa.supportArea, primary: sa.primary })),
        specializations: full.specializations.map((sp: any, index: number) => ({
          id: sp.id || `spec-${index}`,
          labelId: sp.label.id,
          labelEn: sp.label.en,
        })),
        biographyId: full.biography.id,
        biographyEn: full.biography.en,
        availabilityMessageId: full.availabilityMessage.id,
        availabilityMessageEn: full.availabilityMessage.en,
        mediaReference: full.media?.reference || 'media/psychologists/default.webp',
        mediaWidth: full.media?.width || 600,
        mediaHeight: full.media?.height || 600,
        mediaAltId: full.media?.alt?.id || full.name,
        mediaAltEn: full.media?.alt?.en || full.name,
      })
      setActiveFormTab('basic')
      setIsModalOpen(true)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat detail profil psikolog.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickStatusChange = async (id: string, newStatus: 'draft' | 'active' | 'inactive' | 'archived') => {
    try {
      await updatePsychologistStatus(id, newStatus)
      loadData()
    } catch (err: any) {
      alert(`Gagal mengubah status: ${err?.message || 'Terjadi kesalahan'}`)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)
    setIsSubmitting(true)

    // Construct FullPsychologistMutation payload
    const payload: FullPsychologistMutation = {
      slug: formState.slug.trim(),
      status: formState.status,
      name: formState.name.trim(),
      nickname: formState.nickname.trim(),
      credential: formState.credential.trim(),
      licenseNumber: formState.licenseNumber.trim(),
      experienceYears: Number(formState.experienceYears),
      bookingUrl: formState.bookingUrl.trim(),
      premiumBookingUrl: formState.premiumBookingUrl.trim() ? formState.premiumBookingUrl.trim() : null,
      featured: formState.featured,
      featuredOrder: formState.featured && formState.featuredOrder !== '' ? Number(formState.featuredOrder) : null,
      supportAreas: formState.supportAreas,
      specializations: formState.specializations.map((sp) => ({
        label: { id: sp.labelId.trim(), en: sp.labelEn.trim() }
      })),
      biography: { id: formState.biographyId.trim(), en: formState.biographyEn.trim() },
      availabilityMessage: { id: formState.availabilityMessageId.trim(), en: formState.availabilityMessageEn.trim() },
      media: {
        reference: formState.mediaReference.trim(),
        width: Number(formState.mediaWidth),
        height: Number(formState.mediaHeight),
        alt: { id: formState.mediaAltId.trim(), en: formState.mediaAltEn.trim() }
      }
    }

    try {
      await saveAdminPsychologist(formState.id, payload)
      setFormSuccess('Profil psikolog berhasil disimpan!')
      setTimeout(() => {
        setIsModalOpen(false)
        loadData()
      }, 700)
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan profil psikolog.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSupportArea = (areaKey: 'adultClinical' | 'childAdolescent' | 'educational') => {
    const exists = formState.supportAreas.some((sa) => sa.supportArea === areaKey)
    if (exists) {
      if (formState.supportAreas.length <= 1) return // Keep at least one
      setFormState((prev) => ({
        ...prev,
        supportAreas: prev.supportAreas.filter((sa) => sa.supportArea !== areaKey)
      }))
    } else {
      setFormState((prev) => ({
        ...prev,
        supportAreas: [...prev.supportAreas, { supportArea: areaKey, primary: prev.supportAreas.length === 0 }]
      }))
    }
  }

  const setPrimarySupportArea = (areaKey: 'adultClinical' | 'childAdolescent' | 'educational') => {
    setFormState((prev) => ({
      ...prev,
      supportAreas: prev.supportAreas.map((sa) => ({
        ...sa,
        primary: sa.supportArea === areaKey
      }))
    }))
  }

  const addSpecializationItem = () => {
    setFormState((prev) => ({
      ...prev,
      specializations: [
        ...prev.specializations,
        { id: `spec-${prev.specializations.length}`, labelId: '', labelEn: '' }
      ]
    }))
  }

  const removeSpecializationItem = (index: number) => {
    if (formState.specializations.length <= 1) return
    setFormState((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Psychologist Directory CMS
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kelola direktori profil psikolog, spesialisasi, status ketersediaan, dan media.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={springConfig}
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-sky-600/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Psikolog Baru
        </motion.button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['all', 'draft', 'active', 'inactive', 'archived'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                {tab === 'all' ? `Semua (${total})` : tab}
              </button>
            ))}
          </div>

          {/* Search & Support Area Filters */}
          <div className="flex items-center gap-3">
            <select
              value={supportAreaFilter}
              onChange={(e) => setSupportAreaFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Semua Area Layanan</option>
              <option value="adultClinical">Dewasa & Klinis</option>
              <option value="childAdolescent">Anak & Remaja</option>
              <option value="educational">Pendidikan</option>
            </select>

            <div className="relative flex-1 sm:w-64">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau spesialisasi..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm border-b border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm animate-pulse">
            Memuat direktori psikolog...
          </div>
        ) : psychologists.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            Tidak ada profil psikolog yang ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-4">Psikolog</th>
                  <th className="py-3.5 px-4">Credential & SIP</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Area Layanan</th>
                  <th className="py-3.5 px-4">Pengalaman</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                {psychologists.map((item) => {
                  const badge = statusBadges[item.status] || statusBadges.draft
                  const primaryArea = item.supportAreas?.find((sa: any) => sa.primary)?.supportArea || item.supportAreas?.[0]?.supportArea
                  const photoUrl = item.media?.reference ? (item.media.reference.startsWith('media/') ? `/${item.media.reference}` : item.media.reference) : null

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm">
                            {photoUrl ? (
                              <img src={photoUrl} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              item.nickname?.slice(0, 2)?.toUpperCase() || 'PS'
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">/{item.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{item.credential}</div>
                        <div className="text-xs text-slate-500">SIP: {item.licenseNumber || '-'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                        {primaryArea ? supportAreaLabels[primaryArea] || primaryArea : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                        {item.experienceYears} Tahun
                      </td>

                      <td className="py-3.5 px-4">
                        {item.featured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-xs font-semibold">
                            ★ #{item.featuredOrder}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Quick status dropdown */}
                          <select
                            value={item.status}
                            onChange={(e) => handleQuickStatusChange(item.id, e.target.value as any)}
                            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                          </select>

                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={springConfig}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {formState.id ? 'Edit Profil Psikolog' : 'Tambah Psikolog Baru'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formState.id ? `ID: ${formState.id}` : 'Isi informasi profil psikolog dengan lengkap.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                >
                  ✕
                </button>
              </div>

              {/* Form Tab Header */}
              <div className="px-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto bg-white dark:bg-slate-800">
                {[
                  { id: 'basic', label: '1. Identitas & SIP' },
                  { id: 'status', label: '2. Status & Featured' },
                  { id: 'booking', label: '3. Tautan Booking' },
                  { id: 'skills', label: '4. Layanan & Spesialisasi' },
                  { id: 'bio', label: '5. Bio & Jadwal (Bilingual)' },
                  { id: 'media', label: '6. Foto Profil' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFormTab(tab.id as any)}
                    className={`py-3 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                      activeFormTab === tab.id
                        ? 'border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {formError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl border border-emerald-200 dark:border-emerald-800">
                    {formSuccess}
                  </div>
                )}

                {/* Tab 1: Basic */}
                {activeFormTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nama Lengkap & Gelar *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          placeholder="e.g. Syazka Adira, M.Psi., Psikolog"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nama Panggilan / Nickname *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.nickname}
                          onChange={(e) => setFormState({ ...formState, nickname: e.target.value })}
                          placeholder="e.g. Syazka"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          URL Slug * (hanya huruf kecil, angka, strip)
                        </label>
                        <input
                          type="text"
                          required
                          pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                          value={formState.slug}
                          onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                          placeholder="e.g. syazka-adira"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Credential Label *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.credential}
                          onChange={(e) => setFormState({ ...formState, credential: e.target.value })}
                          placeholder="e.g. M.Psi., Psikolog"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Nomor Izin Praktik (SIP/SIK) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.licenseNumber}
                          onChange={(e) => setFormState({ ...formState, licenseNumber: e.target.value })}
                          placeholder="e.g. 503/SIP-049/2023"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Pengalaman Praktik (Tahun) *
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={80}
                          required
                          value={formState.experienceYears}
                          onChange={(e) => setFormState({ ...formState, experienceYears: Number(e.target.value) })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Status */}
                {activeFormTab === 'status' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Status Lifesiklus Direktori *
                      </label>
                      <select
                        value={formState.status}
                        onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <option value="draft">Draft (Belum Tampil di Publik)</option>
                        <option value="active">Active (Tampil di Direktori Publik)</option>
                        <option value="inactive">Inactive (Tampil Status Tidak Tersedia)</option>
                        <option value="archived">Archived (Diarsipkan)</option>
                      </select>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Featured Psychologist</div>
                          <div className="text-xs text-slate-500">Tampilkan psikolog ini di section Featured Landing Page.</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formState.featured}
                          onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                        />
                      </div>

                      {formState.featured && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Urutan Posisi Featured Order (Angka Positif 0, 1, 2...) *
                          </label>
                          <input
                            type="number"
                            min={0}
                            required={formState.featured}
                            value={formState.featuredOrder}
                            onChange={(e) => setFormState({ ...formState, featuredOrder: e.target.value })}
                            placeholder="e.g. 0"
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 3: Booking */}
                {activeFormTab === 'booking' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tautan Sesi Konsultasi (Booking URL) * (harus https://)
                      </label>
                      <input
                        type="url"
                        required
                        pattern="^https://.*"
                        value={formState.bookingUrl}
                        onChange={(e) => setFormState({ ...formState, bookingUrl: e.target.value })}
                        placeholder="https://attentive.id/book/syazka"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Tautan Sesi Premium / Khusus (Opsional)
                      </label>
                      <input
                        type="url"
                        value={formState.premiumBookingUrl}
                        onChange={(e) => setFormState({ ...formState, premiumBookingUrl: e.target.value })}
                        placeholder="https://attentive.id/book/syazka-premium"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 4: Skills */}
                {activeFormTab === 'skills' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Area Layanan Utama & Sekunder *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { key: 'adultClinical', label: 'Dewasa & Klinis' },
                          { key: 'childAdolescent', label: 'Anak & Remaja' },
                          { key: 'educational', label: 'Pendidikan' },
                        ].map((area) => {
                          const item = formState.supportAreas.find((sa) => sa.supportArea === area.key)
                          const isSelected = !!item
                          const isPrimary = item?.primary || false

                          return (
                            <div
                              key={area.key}
                              className={`p-3 rounded-2xl border transition-colors ${
                                isSelected
                                  ? 'bg-sky-50/60 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{area.label}</span>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSupportArea(area.key as any)}
                                  className="w-4 h-4 rounded text-sky-600"
                                />
                              </div>

                              {isSelected && (
                                <button
                                  type="button"
                                  onClick={() => setPrimarySupportArea(area.key as any)}
                                  className={`w-full text-[10px] font-semibold py-1 rounded-md transition-colors ${
                                    isPrimary
                                      ? 'bg-sky-600 text-white'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                                  }`}
                                >
                                  {isPrimary ? '★ Utama (Primary)' : 'Jadikan Utama'}
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Daftar Tag Spesialisasi (Bilingual ID/EN) *
                        </label>
                        <button
                          type="button"
                          onClick={addSpecializationItem}
                          className="text-xs text-sky-600 hover:text-sky-700 font-semibold"
                        >
                          + Tambah Tag
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formState.specializations.map((spec, idx) => (
                          <div key={spec.id || idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              required
                              value={spec.labelId}
                              onChange={(e) => {
                                const val = e.target.value
                                setFormState((prev) => ({
                                  ...prev,
                                  specializations: prev.specializations.map((s, i) => i === idx ? { ...s, labelId: val } : s)
                                }))
                              }}
                              placeholder="ID: Kecemasan, Trauma..."
                              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs"
                            />
                            <input
                              type="text"
                              required
                              value={spec.labelEn}
                              onChange={(e) => {
                                const val = e.target.value
                                setFormState((prev) => ({
                                  ...prev,
                                  specializations: prev.specializations.map((s, i) => i === idx ? { ...s, labelEn: val } : s)
                                }))
                              }}
                              placeholder="EN: Anxiety, Trauma..."
                              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs"
                            />
                            {formState.specializations.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSpecializationItem(idx)}
                                className="p-1.5 text-rose-500 hover:text-rose-700"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Bio */}
                {activeFormTab === 'bio' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Biografi Profil (Bahasa Indonesia) *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formState.biographyId}
                        onChange={(e) => setFormState({ ...formState, biographyId: e.target.value })}
                        placeholder="Tuliskan latar belakang dan bidang kepakaran psikolog..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Biography Profile (English) *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formState.biographyEn}
                        onChange={(e) => setFormState({ ...formState, biographyEn: e.target.value })}
                        placeholder="Write the background and expertise of the psychologist..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Pesan Ketersediaan Jadwal (Bahasa Indonesia) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.availabilityMessageId}
                        onChange={(e) => setFormState({ ...formState, availabilityMessageId: e.target.value })}
                        placeholder="e.g. Sesi online dan tatap muka tersedia setiap Selasa & Kamis."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Availability Message (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.availabilityMessageEn}
                        onChange={(e) => setFormState({ ...formState, availabilityMessageEn: e.target.value })}
                        placeholder="e.g. Online and in-person sessions available Tuesdays & Thursdays."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 6: Media */}
                {activeFormTab === 'media' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Media Object Reference Key / Path *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.mediaReference}
                        onChange={(e) => setFormState({ ...formState, mediaReference: e.target.value })}
                        placeholder="media/psychologists/syazka.webp"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Lebar Gambar (Width px) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={formState.mediaWidth}
                          onChange={(e) => setFormState({ ...formState, mediaWidth: Number(e.target.value) })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tinggi Gambar (Height px) *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={formState.mediaHeight}
                          onChange={(e) => setFormState({ ...formState, mediaHeight: Number(e.target.value) })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Alt Text Gambar (ID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.mediaAltId}
                          onChange={(e) => setFormState({ ...formState, mediaAltId: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Alt Text Gambar (EN) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formState.mediaAltEn}
                          onChange={(e) => setFormState({ ...formState, mediaAltEn: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer / Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl"
                  >
                    Batal
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springConfig}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm"
                  >
                    {isSubmitting ? 'Simpan...' : 'Simpan Profil Psikolog'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
