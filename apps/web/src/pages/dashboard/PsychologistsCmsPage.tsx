import React, { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  listAdminPsychologists,
  getAdminPsychologistById,
  saveAdminPsychologist,
  updatePsychologistStatus,
  uploadPsychologistPhoto,
  type AdminPsychologistItem,
} from '../../features/psychologists/psychologist-cms'
import {
  FeaturedOrderPanel,
  type DirectoryViewMode,
} from '../../components/dashboard/FeaturedOrderPanel'
import { useAuth } from '../../features/auth/auth-context'
import type { FullPsychologistMutation } from '@attentiveid/shared'
import {
  UploadCloud,
  Camera,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  User,
  X,
  Eye,
  Plus,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  CheckCheck,
  LayoutGrid,
  List
} from 'lucide-react'

const springConfig = { type: 'spring', stiffness: 400, damping: 30 } as const

const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-amber-50 border border-amber-200/60', text: 'text-amber-800' },
  active: { label: 'Active', bg: 'bg-emerald-50 border border-emerald-200/60', text: 'text-emerald-800' },
  inactive: { label: 'Inactive', bg: 'bg-slate-100 border border-slate-200/60', text: 'text-slate-700' },
  archived: { label: 'Archived', bg: 'bg-rose-50 border border-rose-200/60', text: 'text-rose-800' },
}

const supportAreaLabels: Record<string, string> = {
  adultClinical: 'Dewasa & Klinis',
  childAdolescent: 'Anak & Remaja',
  educational: 'Pendidikan & Edukasi',
  psychologyScientist: 'Ilmuwan Psikologi',
}

const tierLabels: Record<string, string> = {
  principal: 'Principal Psychologist',
  senior: 'Senior Psychologist',
  senior_mid: 'Senior-Mid Psychologist',
  mid: 'Mid Psychologist',
  consultant: 'Consultant / Scientist',
}

const branchLabels: Record<string, string> = {
  tbi: 'Jakarta (TBI Pusat)',
  bsd: 'Delrey BizTown BSD',
  malang: 'Malang (Grand Arumba)',
  online_only: 'Online Only',
  multiple: 'Multiple (TBI & BSD)',
}

type TabId = 'basic' | 'skills' | 'bio'

const TABS: { id: TabId; label: string; short: string; subtitle: string }[] = [
  { id: 'basic', label: '1. Identitas & SIP', short: 'Identitas & SIP', subtitle: 'Data pribadi, izin SIP, kontak booking, dan cabang' },
  { id: 'skills', label: '2. Layanan & Keahlian', short: 'Layanan & Tag', subtitle: 'Area klinis, tag spesialisasi, dan featured' },
  { id: 'bio', label: '3. Bio & Jadwal', short: 'Bio & Jadwal', subtitle: 'Biografi naratif bilingual dan jadwal praktik' },
]

interface FormState {
  id?: string
  slug: string
  status: 'draft' | 'active' | 'inactive' | 'archived'
  tier: 'principal' | 'senior' | 'senior_mid' | 'mid' | 'consultant'
  primaryBranch: 'tbi' | 'bsd' | 'malang' | 'online_only' | 'multiple'
  acceptingNewClients: boolean
  name: string
  nickname: string
  credential: string
  licenseNumber: string
  experienceYears: number
  bookingUrl: string
  premiumBookingUrl: string
  featured: boolean
  featuredOrder: string
  supportAreas: { supportArea: 'adultClinical' | 'childAdolescent' | 'educational' | 'psychologyScientist'; primary: boolean }[]
  specializations: { id: string; labelId: string; labelEn: string }[]
  shortBioId: string
  shortBioEn: string
  biographyId: string
  biographyEn: string
  conversationQuoteId: string
  conversationQuoteEn: string
  availabilityMessageId: string
  availabilityMessageEn: string
  mediaReference: string
  mediaWidth: number
  mediaHeight: number
  mediaAltId: string
  mediaAltEn: string
}

// Sensible defaults that start in a 100% schema-valid state
const defaultFormState: FormState = {
  slug: '',
  status: 'draft',
  tier: 'mid',
  primaryBranch: 'tbi',
  acceptingNewClients: true,
  name: '',
  nickname: '',
  credential: 'M.Psi., Psikolog',
  licenseNumber: '',
  experienceYears: 3,
  bookingUrl: 'https://attentive.id/book/',
  premiumBookingUrl: '',
  featured: false,
  featuredOrder: '',
  supportAreas: [{ supportArea: 'adultClinical', primary: true }],
  specializations: [{ id: 'spec-0', labelId: 'Konseling Dewasa', labelEn: 'Adult Counseling' }],
  shortBioId: 'Psikolog klinis yang berfokus pada pendampingan kesehatan mental dan resiliensi.',
  shortBioEn: 'Clinical psychologist focusing on mental health recovery and self-resilience.',
  biographyId: 'Praktisi psikologi yang berdedikasi mendampingi individu melalui pendekatan saintifik, empatik, dan berbasis bukti.',
  biographyEn: 'A dedicated psychology practitioner assisting individuals through scientific, empathetic, and evidence-based approaches.',
  conversationQuoteId: '',
  conversationQuoteEn: '',
  availabilityMessageId: 'Tersedia sesuai jadwal perjanjian.',
  availabilityMessageEn: 'Available by appointment schedule.',
  mediaReference: 'media/psychologists/default.webp',
  mediaWidth: 600,
  mediaHeight: 750,
  mediaAltId: 'Foto Profil',
  mediaAltEn: 'Profile photo',
}

export function PsychologistsCmsPage() {
  const { getAuthHeaders } = useAuth()
  const [psychologists, setPsychologists] = useState<AdminPsychologistItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [supportAreaFilter, setSupportAreaFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewMode, setViewMode] = useState<DirectoryViewMode>(() => {
    try {
      return window.localStorage.getItem('psychologist-cms-view') === 'grid' ? 'grid' : 'row'
    } catch {
      return 'row'
    }
  })
  const changeViewMode = (mode: DirectoryViewMode) => {
    setViewMode(mode)
    try {
      window.localStorage.setItem('psychologist-cms-view', mode)
    } catch {
      /* the choice just isn't remembered */
    }
  }

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeFormTab, setActiveFormTab] = useState<TabId>('basic')
  const [formState, setFormState] = useState<FormState>(defaultFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // Media Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showAdvancedMedia, setShowAdvancedMedia] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // The API returns at most 100 profiles per call, so keep asking until everyone is loaded.
      const loaded: AdminPsychologistItem[] = []
      let reportedTotal = 0
      for (;;) {
        const res = await listAdminPsychologists({
          status: statusFilter,
          supportArea: supportAreaFilter,
          search: searchQuery,
          limit: 100,
          offset: loaded.length,
          headers: getAuthHeaders(),
        })
        const batch = res.psychologists || []
        reportedTotal = res.total || 0
        loaded.push(...batch)
        if (batch.length === 0 || loaded.length >= reportedTotal) break
      }
      setPsychologists(loaded)
      setTotal(reportedTotal)
      setRefreshKey((key) => key + 1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data psikolog.')
    } finally {
      setIsLoading(false)
    }
  }, [getAuthHeaders, statusFilter, supportAreaFilter, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

  const handleNameChange = (val: string) => {
    setFormState((prev) => {
      const isCreate = !prev.id
      const autoSlug = generateSlug(val)
      const shouldAutoSlug = isCreate && (!prev.slug || prev.slug === generateSlug(prev.name))
      const autoNickname = isCreate && (!prev.nickname || prev.nickname === prev.name.split(' ')[0]) ? val.split(' ')[0] : prev.nickname

      return {
        ...prev,
        name: val,
        nickname: autoNickname,
        slug: shouldAutoSlug ? autoSlug : prev.slug,
        bookingUrl: isCreate && prev.bookingUrl.includes('/book/') ? `https://attentive.id/book/${autoSlug || 'jadwal'}` : prev.bookingUrl,
        mediaAltId: !prev.mediaAltId || prev.mediaAltId === 'Foto Psikolog' ? `Foto profil ${val}` : prev.mediaAltId,
        mediaAltEn: !prev.mediaAltEn || prev.mediaAltEn === 'Psychologist photo' ? `Profile photo of ${val}` : prev.mediaAltEn,
      }
    })
  }

  const getNextAvailableFeaturedOrder = useCallback(() => {
    const orders = psychologists
      .filter((p) => p.featured && p.featuredOrder !== null && p.featuredOrder !== undefined)
      .map((p) => Number(p.featuredOrder))
      .filter((n) => !isNaN(n))
    if (orders.length === 0) return 1
    return Math.max(...orders) + 1
  }, [psychologists])

  const getMissingRequiredFields = useCallback(() => {
    const missing: { tab: TabId; label: string; field: string }[] = []
    if (!formState.name.trim()) missing.push({ tab: 'basic', label: 'Nama Lengkap', field: 'name' })
    if (!formState.nickname.trim()) missing.push({ tab: 'basic', label: 'Nama Panggilan', field: 'nickname' })
    if (!formState.credential.trim()) missing.push({ tab: 'basic', label: 'Gelar / Kredensial', field: 'credential' })
    if (!formState.licenseNumber.trim()) missing.push({ tab: 'basic', label: 'Nomor SIP', field: 'licenseNumber' })
    if (!formState.bookingUrl.trim() || !formState.bookingUrl.trim().startsWith('https://')) {
      missing.push({ tab: 'basic', label: 'Tautan Booking (https://)', field: 'bookingUrl' })
    }
    if (formState.supportAreas.length === 0) {
      missing.push({ tab: 'skills', label: 'Minimal 1 Area Layanan', field: 'supportAreas' })
    }
    if (formState.specializations.length === 0 || !formState.specializations.some((s) => s.labelId.trim().length > 0)) {
      missing.push({ tab: 'skills', label: 'Minimal 1 Tag Spesialisasi', field: 'specializations' })
    }
    if (formState.featured && (formState.featuredOrder === '' || isNaN(Number(formState.featuredOrder)))) {
      missing.push({ tab: 'skills', label: 'Urutan Featured', field: 'featuredOrder' })
    }
    if (!formState.biographyId.trim()) {
      missing.push({ tab: 'bio', label: 'Biografi Indonesia', field: 'biographyId' })
    }
    if (!formState.availabilityMessageId.trim()) {
      missing.push({ tab: 'bio', label: 'Pesan Jadwal Indonesia', field: 'availabilityMessageId' })
    }
    return missing
  }, [formState])

  const handleQuickPrefill = () => {
    const sampleSlug = `dr-contoh-${Math.floor(Math.random() * 900 + 100)}`
    setFormState({
      ...defaultFormState,
      name: 'Dr. Sarah Amalia, M.Psi., Psikolog',
      nickname: 'Sarah',
      slug: sampleSlug,
      credential: 'M.Psi., Psikolog Klinis',
      licenseNumber: '503/SIP-088/2026',
      experienceYears: 4,
      bookingUrl: `https://attentive.id/book/${sampleSlug}`,
      supportAreas: [{ supportArea: 'adultClinical', primary: true }],
      specializations: [
        { id: 'spec-0', labelId: 'Kecemasan & Burnout', labelEn: 'Anxiety & Burnout' },
        { id: 'spec-1', labelId: 'Manajemen Stres Emosional', labelEn: 'Emotional Stress Management' }
      ],
      shortBioId: 'Psikolog klinis berfokus pada pemulihan kesehatan mental, kecemasan kerja, dan relasi emosional.',
      shortBioEn: 'Clinical psychologist focusing on mental health recovery, workplace anxiety, and emotional relationships.',
      biographyId: 'Berpengalaman mendampingi individu dalam mengelola kecemasan, kelelahan kerja (burnout), serta transisi hidup dengan pendekatan CBT dan Mindfulness.',
      biographyEn: 'Experienced in assisting individuals in managing anxiety, burnout, and life transitions with CBT and Mindfulness approaches.',
      availabilityMessageId: 'Tersedia Senin, Rabu, dan Jumat (Sesi Tatap Muka & Online).',
      availabilityMessageEn: 'Available Mondays, Wednesdays, and Fridays (In-person & Online).',
      mediaAltId: 'Foto profil Dr. Sarah Amalia, M.Psi., Psikolog',
      mediaAltEn: 'Profile photo of Dr. Sarah Amalia, M.Psi., Psychologist',
    })
  }

  const handleSyncAllIdToEn = () => {
    setFormState((prev) => ({
      ...prev,
      shortBioEn: prev.shortBioEn.trim() || prev.shortBioId.trim(),
      biographyEn: prev.biographyEn.trim() || prev.biographyId.trim(),
      availabilityMessageEn: prev.availabilityMessageEn.trim() || prev.availabilityMessageId.trim(),
      specializations: prev.specializations.map((sp) => ({
        ...sp,
        labelEn: sp.labelEn.trim() || sp.labelId.trim(),
      })),
      mediaAltEn: prev.mediaAltEn.trim() || prev.mediaAltId.trim(),
    }))
  }

  const handleOpenCreateModal = () => {
    setFormState(defaultFormState)
    setPreviewUrl(null)
    setIsUploading(false)
    setUploadError(null)
    setUploadSuccess(false)
    setActiveFormTab('basic')
    setFormError(null)
    setFormSuccess(null)
    setShowAdvancedMedia(false)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = async (item: AdminPsychologistItem) => {
    setIsLoading(true)
    setFormError(null)
    setFormSuccess(null)
    setIsUploading(false)
    setUploadError(null)
    setUploadSuccess(false)
    setShowAdvancedMedia(false)
    try {
      const full = await getAdminPsychologistById(item.id, { headers: getAuthHeaders() })
      const mediaRef = full.media?.reference || 'media/psychologists/default.webp'
      setFormState({
        id: full.id,
        slug: full.slug,
        status: full.status,
        tier: full.tier || 'mid',
        primaryBranch: full.primaryBranch || 'tbi',
        acceptingNewClients: full.acceptingNewClients !== undefined ? Boolean(full.acceptingNewClients) : true,
        name: full.name,
        nickname: full.nickname,
        credential: full.credential,
        licenseNumber: full.licenseNumber,
        experienceYears: full.experienceYears,
        bookingUrl: full.bookingUrl,
        premiumBookingUrl: full.premiumBookingUrl || '',
        featured: full.featured,
        featuredOrder: full.featuredOrder !== null ? String(full.featuredOrder) : '',
        supportAreas: full.supportAreas.map((sa: { supportArea: 'adultClinical' | 'childAdolescent' | 'educational' | 'psychologyScientist'; primary: boolean }) => ({ supportArea: sa.supportArea, primary: sa.primary })),
        specializations: full.specializations.map((sp: { id?: string; label: { id: string; en: string } }, index: number) => ({
          id: sp.id || `spec-${index}`,
          labelId: sp.label.id,
          labelEn: sp.label.en,
        })),
        shortBioId: full.shortBio?.id || '',
        shortBioEn: full.shortBio?.en || '',
        biographyId: full.biography.id,
        biographyEn: full.biography.en,
        conversationQuoteId: full.conversationQuote?.id || '',
        conversationQuoteEn: full.conversationQuote?.en || '',
        availabilityMessageId: full.availabilityMessage.id,
        availabilityMessageEn: full.availabilityMessage.en,
        mediaReference: mediaRef,
        mediaWidth: full.media?.width || 600,
        mediaHeight: full.media?.height || 750,
        mediaAltId: full.media?.alt?.id || full.name,
        mediaAltEn: full.media?.alt?.en || full.name,
      })
      setPreviewUrl(mediaRef ? (mediaRef.startsWith('/') ? mediaRef : `/${mediaRef}`) : null)
      setActiveFormTab('basic')
      setIsModalOpen(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memuat detail profil psikolog.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar (WebP, PNG, JPG) yang diperbolehkan.')
      return
    }

    const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_PHOTO_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setUploadError(`Ukuran file foto (${sizeMB} MB) melebihi batas maksimal 5 MB. Silakan kompres atau pilih foto yang lebih kecil.`)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    // Detect image dimensions
    const img = new Image()
    img.onload = async () => {
      const width = img.naturalWidth || 600
      const height = img.naturalHeight || 750

      const safeSlug = formState.slug.trim() || generateSlug(formState.name) || generateSlug(formState.nickname) || 'psychologist'
      const altId = formState.mediaAltId || `Foto profil ${formState.name || formState.nickname || 'Psikolog'}`
      const altEn = formState.mediaAltEn || `Profile photo of ${formState.name || formState.nickname || 'Psychologist'}`

      try {
        const res = await uploadPsychologistPhoto(
          file,
          {
            slug: safeSlug,
            name: formState.name || formState.nickname,
            altId,
            altEn,
            width,
            height,
          },
          { headers: getAuthHeaders() }
        )

        setFormState((prev) => ({
          ...prev,
          mediaReference: res.media.reference,
          mediaWidth: res.media.width,
          mediaHeight: res.media.height,
          mediaAltId: res.media.alt.id,
          mediaAltEn: res.media.alt.en,
        }))
        setUploadSuccess(true)
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah foto profil.')
      } finally {
        setIsUploading(false)
      }
    }

    img.onerror = () => {
      setIsUploading(false)
      setUploadError('Gagal membaca data gambar.')
    }

    img.src = objectUrl
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoUpload(e.dataTransfer.files[0])
    }
  }

  const handleQuickStatusChange = async (id: string, newStatus: 'draft' | 'active' | 'inactive' | 'archived') => {
    try {
      await updatePsychologistStatus(id, newStatus, { headers: getAuthHeaders() })
      loadData()
    } catch (err: unknown) {
      alert(`Gagal mengubah status: ${err instanceof Error ? err.message : 'Terjadi kesalahan'}`)
    }
  }

  // Section completion checks for visual feedback
  const isTabComplete = (tabId: TabId): boolean => {
    switch (tabId) {
      case 'basic':
        return Boolean(
          formState.name.trim() &&
          formState.nickname.trim() &&
          formState.slug.trim() &&
          formState.credential.trim() &&
          formState.licenseNumber.trim() &&
          formState.bookingUrl.trim().startsWith('https://')
        )
      case 'skills':
        return (
          formState.supportAreas.length > 0 &&
          formState.specializations.some((sp) => sp.labelId.trim().length > 0) &&
          (!formState.featured || (formState.featured && formState.featuredOrder !== '' && !isNaN(Number(formState.featuredOrder))))
        )
      case 'bio':
        return Boolean(formState.biographyId.trim() && formState.availabilityMessageId.trim())
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    // Pre-flight check with helpful user guidance
    const missing = getMissingRequiredFields()
    if (missing.length > 0) {
      setFormError(`Mohon lengkapi data wajib berikut: ${missing.map((m) => m.label).join(', ')}`)
      setActiveFormTab(missing[0].tab)
      return
    }

    setIsSubmitting(true)

    const safeSlug = formState.slug.trim() || generateSlug(formState.name) || generateSlug(formState.nickname) || 'psychologist'
    const safeNickname = formState.nickname.trim() || formState.name.trim().split(' ')[0] || 'Psikolog'
    const safeBioEn = formState.biographyEn.trim() || formState.biographyId.trim()
    const safeAvailEn = formState.availabilityMessageEn.trim() || formState.availabilityMessageId.trim()
    const safeShortBioEn = formState.shortBioEn.trim() || formState.shortBioId.trim()

    // Clean specializations: filter out empty items and auto-fallback English
    const validSpecs = formState.specializations
      .filter((sp) => sp.labelId.trim().length > 0 || sp.labelEn.trim().length > 0)
      .map((sp) => ({
        label: {
          id: sp.labelId.trim() || sp.labelEn.trim(),
          en: sp.labelEn.trim() || sp.labelId.trim(),
        }
      }))
    const finalSpecs = validSpecs.length > 0 ? validSpecs : [{ label: { id: 'Konseling Umum', en: 'General Counseling' } }]

    // Construct FullPsychologistMutation payload
    const payload: FullPsychologistMutation = {
      slug: safeSlug,
      status: formState.status,
      tier: formState.tier,
      primaryBranch: formState.primaryBranch,
      acceptingNewClients: formState.acceptingNewClients,
      name: formState.name.trim(),
      nickname: safeNickname,
      credential: formState.credential.trim(),
      licenseNumber: formState.licenseNumber.trim(),
      experienceYears: Number(formState.experienceYears),
      bookingUrl: formState.bookingUrl.trim().startsWith('https://') ? formState.bookingUrl.trim() : `https://${formState.bookingUrl.trim()}`,
      premiumBookingUrl: formState.premiumBookingUrl.trim() ? formState.premiumBookingUrl.trim() : null,
      featured: formState.featured,
      featuredOrder: formState.featured && formState.featuredOrder !== '' ? Number(formState.featuredOrder) : null,
      supportAreas: formState.supportAreas,
      specializations: finalSpecs,
      ...(formState.shortBioId.trim() || safeShortBioEn ? {
        shortBio: { id: formState.shortBioId.trim() || safeShortBioEn, en: safeShortBioEn }
      } : {}),
      biography: { id: formState.biographyId.trim(), en: safeBioEn },
      ...(formState.conversationQuoteId.trim() || formState.conversationQuoteEn.trim()
        ? {
            conversationQuote: {
              id: formState.conversationQuoteId.trim() || formState.conversationQuoteEn.trim(),
              en: formState.conversationQuoteEn.trim() || formState.conversationQuoteId.trim(),
            },
          }
        : {}),
      availabilityMessage: { id: formState.availabilityMessageId.trim(), en: safeAvailEn },
      media: {
        reference: formState.mediaReference.trim() || 'media/psychologists/default.webp',
        width: Number(formState.mediaWidth) || 600,
        height: Number(formState.mediaHeight) || 750,
        alt: {
          id: formState.mediaAltId.trim() || `Foto profil ${formState.name.trim()}`,
          en: formState.mediaAltEn.trim() || `Profile photo of ${formState.name.trim()}`
        }
      }
    }

    try {
      await saveAdminPsychologist(formState.id, payload, { headers: getAuthHeaders() })
      setFormSuccess('Profil psikolog berhasil disimpan!')
      setTimeout(() => {
        setIsModalOpen(false)
        loadData()
      }, 700)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan profil psikolog.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSupportArea = (areaKey: 'adultClinical' | 'childAdolescent' | 'educational' | 'psychologyScientist') => {
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

  const setPrimarySupportArea = (areaKey: 'adultClinical' | 'childAdolescent' | 'educational' | 'psychologyScientist') => {
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

  const currentTabIndex = TABS.findIndex((t) => t.id === activeFormTab)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Psychologist Directory CMS
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kelola direktori profil psikolog, spesialisasi, status ketersediaan, dan media foto.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={springConfig}
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-sky-600/20 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap cursor-pointer ${
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
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Tampilan daftar" className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => changeViewMode('row')}
                aria-pressed={viewMode === 'row'}
                aria-label="Tampilan baris"
                className={`rounded-lg p-1.5 cursor-pointer ${viewMode === 'row' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <List className="size-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => changeViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                aria-label="Tampilan kartu"
                className={`rounded-lg p-1.5 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <LayoutGrid className="size-4" aria-hidden="true" />
              </button>
            </div>

            <select
              value={supportAreaFilter}
              onChange={(e) => setSupportAreaFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Semua Area Layanan</option>
              <option value="adultClinical">Dewasa & Klinis</option>
              <option value="childAdolescent">Anak & Remaja</option>
              <option value="educational">Pendidikan</option>
              <option value="psychologyScientist">Ilmuwan Psikologi</option>
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

      <FeaturedOrderPanel viewMode={viewMode} refreshKey={refreshKey} onSaved={loadData} />

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 text-rose-800 text-sm border-b border-rose-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
            Memuat direktori psikolog...
          </div>
        ) : psychologists.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Tidak ada data psikolog yang cocok dengan kriteria filter.
          </div>
        ) : viewMode === 'grid' ? (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {psychologists.map((psych) => {
              const badge = statusBadges[psych.status] || statusBadges.draft
              const photoSrc = psych.media?.reference ? (psych.media.reference.startsWith('/') ? psych.media.reference : `/${psych.media.reference}`) : '/media/psychologists/default.webp'
              return (
                <li key={psych.id} className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-center">
                  <img
                    src={photoSrc}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/media/psychologists/default.webp'
                    }}
                    className="size-16 rounded-full border border-slate-200 bg-slate-100 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900">{psych.name}</div>
                    <div className="truncate text-[10px] text-slate-500">{psych.credential}</div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                    {psych.featured && (
                      <span className="inline-flex items-center rounded-md border border-amber-200/60 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        ★ #{psych.featuredOrder ?? 0}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(psych)}
                    className="w-full rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 cursor-pointer"
                  >
                    Edit
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Praktisi</th>
                  <th className="py-3 px-4">Area & Tier</th>
                  <th className="py-3 px-4">Cabang</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {psychologists.map((psych) => {
                  const badge = statusBadges[psych.status] || statusBadges.draft
                  const primaryArea = psych.supportAreas?.find((sa) => sa.primary) || psych.supportAreas?.[0]
                  const photoSrc = psych.media?.reference ? (psych.media.reference.startsWith('/') ? psych.media.reference : `/${psych.media.reference}`) : '/media/psychologists/default.webp'

                  return (
                    <tr key={psych.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={photoSrc}
                            alt={psych.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/media/psychologists/default.webp'
                            }}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {psych.name}
                              <span className="text-[11px] font-normal text-slate-500">
                                ({psych.nickname})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {psych.credential} • {psych.experienceYears} thn exp
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {primaryArea ? supportAreaLabels[primaryArea.supportArea] : '-'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {tierLabels[psych.tier || 'mid']}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700">
                          {branchLabels[psych.primaryBranch || 'tbi']}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                          {!psych.acceptingNewClients && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              Penuh
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {psych.featured ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                            ★ #{psych.featuredOrder ?? 0}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={psych.status}
                            onChange={(e) => handleQuickStatusChange(psych.id, e.target.value as 'draft' | 'active' | 'inactive' | 'archived')}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(psych)}
                            className="px-2.5 py-1 text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 font-semibold rounded-lg transition-colors cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={springConfig}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10"
            >
              {/* Modal Top Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {formState.id ? 'Edit Profil Psikolog' : 'Tambah Psikolog Baru'}
                      </h2>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${statusBadges[formState.status]?.bg} ${statusBadges[formState.status]?.text}`}>
                        {statusBadges[formState.status]?.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formState.name ? `${formState.name} (${formState.slug || 'no-slug'})` : 'Isi data profil praktisi dan unggah foto profil resmi.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!formState.id && (
                    <button
                      type="button"
                      onClick={handleQuickPrefill}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/90 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Isi otomatis dengan data contoh agar lebih cepat"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Isi Contoh Cepat</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Tab Header with Completion Indicators */}
              <div className="px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {TABS.map((tab) => {
                    const complete = isTabComplete(tab.id)
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFormTab(tab.id)}
                        className={`py-3 px-4 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                          activeFormTab === tab.id
                            ? 'border-teal-600 text-teal-700 font-bold'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {complete ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Live Required Fields Validation Checklist Banner */}
              {(() => {
                const missing = getMissingRequiredFields()
                return (
                  <div className="px-6 pt-3 shrink-0">
                    {missing.length === 0 ? (
                      <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Semua data wajib telah lengkap diisi. Profil siap disimpan ke sistem!</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          100% Siap
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-amber-900 font-semibold shrink-0">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Data wajib belum terisi ({missing.length}):</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {missing.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveFormTab(item.tab)}
                              className="px-2 py-0.5 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-md font-semibold text-[11px] cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <span>{item.label}</span>
                              <span className="text-amber-500">→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
                {formError && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{formError}</span>
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="font-medium">{formSuccess}</span>
                  </div>
                )}

                {/* 2-Column Split View: Left Preview / Right Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Live Card Preview & Quick Photo (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          Live Card Preview
                        </span>
                        <span className="text-[10px] text-slate-400">Rasio 4:5</span>
                      </div>

                      {/* Card Preview Box */}
                      <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-200 border border-slate-200/80 shadow-xs group">
                        <img
                          src={previewUrl || (formState.mediaReference.startsWith('/') ? formState.mediaReference : `/${formState.mediaReference}`)}
                          alt={formState.name || 'Preview'}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/media/psychologists/default.webp'
                          }}
                          className="w-full h-full object-cover object-top"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md shadow-xs ${statusBadges[formState.status]?.bg} ${statusBadges[formState.status]?.text}`}>
                            {statusBadges[formState.status]?.label}
                          </span>
                          {formState.featured && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-950 rounded-md shadow-xs">
                              ★ #{formState.featuredOrder || '0'}
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay with Upload Trigger */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white cursor-pointer p-4 text-center"
                        >
                          <Camera className="w-8 h-8" />
                          <span className="text-xs font-semibold">Klik untuk Ganti Foto</span>
                          <span className="text-[10px] text-slate-300">WebP, PNG, JPG (Maks 5 MB)</span>
                        </div>

                        {/* Bottom Gradient Overlay */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 pt-6 pointer-events-none text-white">
                          <div className="text-xs font-bold leading-tight line-clamp-1">
                            {formState.name || 'Nama Lengkap'}
                          </div>
                          <div className="text-[10px] text-slate-300 line-clamp-1">
                            {formState.credential || 'Credential Praktisi'}
                          </div>
                        </div>
                      </div>

                      {/* Photo Upload Actions & Info */}
                      <div className="space-y-2 pt-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/webp,image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handlePhotoUpload(e.target.files[0])
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200/90 flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                              Mengunggah Foto...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 text-teal-600" />
                              Unggah / Ganti Foto
                            </>
                          )}
                        </button>

                        {/* Drag and Drop Zone */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragOver(true)
                          }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={handleFileDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-3 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            isDragOver
                              ? 'border-teal-500 bg-teal-50/50'
                              : 'border-slate-200 hover:border-teal-400 bg-white hover:bg-slate-50/60'
                          }`}
                        >
                          <UploadCloud className="w-5 h-5 text-teal-600" />
                          <div className="text-[11px] font-semibold text-slate-700 text-center">
                            Tarik foto ke sini atau klik
                          </div>
                          <div className="text-[10px] text-slate-400 text-center">
                            WebP, JPG, PNG • Maksimal 5 MB
                          </div>
                        </div>

                        {/* Status feedback */}
                        {uploadSuccess && (
                          <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg p-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            Foto berhasil diunggah & tersimpan
                          </div>
                        )}
                        {uploadError && (
                          <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg p-2 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {uploadError}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
                          <span>Dimensi:</span>
                          <span className="font-mono font-medium text-slate-700">
                            {formState.mediaWidth} × {formState.mediaHeight} px
                          </span>
                        </div>

                        {/* Advanced Collapsible Section for alt text & manual path */}
                        <div className="pt-2 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setShowAdvancedMedia(!showAdvancedMedia)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-between w-full cursor-pointer py-1"
                          >
                            <span>Pengaturan Alt Text & Path Manual</span>
                            {showAdvancedMedia ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {showAdvancedMedia && (
                            <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 space-y-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Alt Text Gambar (ID)
                                </label>
                                <input
                                  type="text"
                                  value={formState.mediaAltId}
                                  onChange={(e) => setFormState({ ...formState, mediaAltId: e.target.value })}
                                  placeholder="e.g. Foto profil Dr. Haykal"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Alt Text Gambar (EN)
                                </label>
                                <input
                                  type="text"
                                  value={formState.mediaAltEn}
                                  onChange={(e) => setFormState({ ...formState, mediaAltEn: e.target.value })}
                                  placeholder="e.g. Profile photo of Dr. Haykal"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                  Storage Reference Key
                                </label>
                                <input
                                  type="text"
                                  value={formState.mediaReference}
                                  onChange={(e) => setFormState({ ...formState, mediaReference: e.target.value })}
                                  placeholder="media/psychologists/photo.webp"
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tab Panels (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Tab 1: Basic & Identitas */}
                    {activeFormTab === 'basic' && (
                      <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70">
                        <div className="border-b border-slate-200/60 pb-2 mb-2 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Informasi Identitas, Izin Praktik & Kontak Booking
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Nama lengkap, kredensial profesi, nomor SIP, cabang, dan tautan reservasi.
                            </p>
                          </div>
                          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                            Langkah 1 dari 3
                          </span>
                        </div>

                        {/* Row 1: Nama Lengkap & Panggilan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Nama Lengkap & Gelar
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <input
                              type="text"
                              value={formState.name}
                              onChange={(e) => handleNameChange(e.target.value)}
                              placeholder="e.g. Dr. Budi Santoso, M.Psi., Psikolog"
                              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                                !formState.name.trim() ? 'border-amber-300' : 'border-slate-200'
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Nama Panggilan / Nickname
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <input
                              type="text"
                              value={formState.nickname}
                              onChange={(e) => setFormState({ ...formState, nickname: e.target.value })}
                              placeholder="e.g. Budi"
                              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                                !formState.nickname.trim() ? 'border-amber-300' : 'border-slate-200'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Row 2: URL Slug & Credential */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                URL Slug Direktori
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <input
                              type="text"
                              value={formState.slug}
                              onChange={(e) => setFormState({ ...formState, slug: generateSlug(e.target.value) })}
                              placeholder="e.g. budi-santoso"
                              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono ${
                                !formState.slug.trim() ? 'border-amber-300' : 'border-slate-200'
                              }`}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Otomatis terisi dari nama, format huruf kecil dan tanda strip (-).</p>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Gelar / Kredensial Praktisi
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <input
                              type="text"
                              value={formState.credential}
                              onChange={(e) => setFormState({ ...formState, credential: e.target.value })}
                              placeholder="e.g. M.Psi., Psikolog"
                              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                                !formState.credential.trim() ? 'border-amber-300' : 'border-slate-200'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Row 3: Nomor SIP & Pengalaman */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Nomor Izin Praktik (SIP/SIK)
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <input
                              type="text"
                              value={formState.licenseNumber}
                              onChange={(e) => setFormState({ ...formState, licenseNumber: e.target.value })}
                              placeholder="e.g. 503/SIP-049/2023"
                              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                                !formState.licenseNumber.trim() ? 'border-amber-300' : 'border-slate-200'
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Pengalaman Praktik (Tahun)
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <input
                              type="number"
                              min={0}
                              max={80}
                              value={formState.experienceYears}
                              onChange={(e) => setFormState({ ...formState, experienceYears: Number(e.target.value) })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>
                        </div>

                        {/* Row 4: Cabang & Tier */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Cabang Praktik Utama
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <select
                              value={formState.primaryBranch}
                              onChange={(e) => setFormState({ ...formState, primaryBranch: e.target.value as 'tbi' | 'bsd' | 'malang' | 'online_only' | 'multiple' })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            >
                              <option value="tbi">Jakarta Selatan (TBI Pusat)</option>
                              <option value="bsd">Delrey BizTown BSD</option>
                              <option value="malang">Malang (Grand Arumba)</option>
                              <option value="online_only">Online Only</option>
                              <option value="multiple">Multiple (TBI & BSD)</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Tiering Praktisi Klinis
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <select
                              value={formState.tier}
                              onChange={(e) => setFormState({ ...formState, tier: e.target.value as 'principal' | 'senior' | 'senior_mid' | 'mid' | 'consultant' })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            >
                              <option value="principal">Principal Psychologist</option>
                              <option value="senior">Senior Psychologist</option>
                              <option value="senior_mid">Senior-Mid Psychologist</option>
                              <option value="mid">Mid Psychologist</option>
                              <option value="consultant">Consultant / Scientist</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 5: Booking URLs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Tautan Booking Konsultasi
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB (https://)
                              </span>
                            </div>
                            <input
                              type="url"
                              value={formState.bookingUrl}
                              onChange={(e) => setFormState({ ...formState, bookingUrl: e.target.value })}
                              placeholder="https://attentive.id/book/budi"
                              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                                !formState.bookingUrl.trim().startsWith('https://') ? 'border-amber-300' : 'border-slate-200'
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Tautan Booking VIP / Premium
                              </label>
                              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                Opsional
                              </span>
                            </div>
                            <input
                              type="url"
                              value={formState.premiumBookingUrl}
                              onChange={(e) => setFormState({ ...formState, premiumBookingUrl: e.target.value })}
                              placeholder="https://attentive.id/book/budi-vip"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>
                        </div>

                        {/* Row 6: Status & Menerima Klien Baru */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Status Visibilitas Direktori
                            </label>
                            <select
                              value={formState.status}
                              onChange={(e) => setFormState({ ...formState, status: e.target.value as 'draft' | 'active' | 'inactive' | 'archived' })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            >
                              <option value="draft">Draft (Belum Tampil di Direktori Publik)</option>
                              <option value="active">Active (Tampil Terbuka di Direktori Publik)</option>
                              <option value="inactive">Inactive (Tampil dengan Status Tidak Tersedia)</option>
                              <option value="archived">Archived (Diarsipkan / Tidak Aktif)</option>
                            </select>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-800">Menerima Klien Baru</div>
                              <div className="text-[10px] text-slate-500">Klien dapat memesan sesi baru</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formState.acceptingNewClients}
                              onChange={(e) => setFormState({ ...formState, acceptingNewClients: e.target.checked })}
                              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Layanan & Keahlian */}
                    {activeFormTab === 'skills' && (
                      <div className="space-y-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70">
                        <div className="border-b border-slate-200/60 pb-2 mb-2 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Bidang Layanan Klinis & Spesialisasi
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Pilih minimal 1 area layanan klinis utama dan tambahkan tag keahlian.
                            </p>
                          </div>
                          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                            Langkah 2 dari 3
                          </span>
                        </div>

                        {/* Area Layanan */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-slate-700">
                              Area Layanan Praktik
                            </label>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              WAJIB (Min. 1)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { key: 'adultClinical', label: 'Dewasa & Klinis' },
                              { key: 'childAdolescent', label: 'Anak & Remaja' },
                              { key: 'educational', label: 'Pendidikan & Edukasi' },
                              { key: 'psychologyScientist', label: 'Ilmuwan Psikologi' },
                            ].map((area) => {
                              const item = formState.supportAreas.find((sa) => sa.supportArea === area.key)
                              const isSelected = !!item
                              const isPrimary = item?.primary || false

                              return (
                                <div
                                  key={area.key}
                                  className={`p-3 rounded-2xl border transition-colors ${
                                    isSelected
                                      ? 'bg-teal-50/80 border-teal-300'
                                      : 'bg-white border-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-800">{area.label}</span>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleSupportArea(area.key as 'adultClinical' | 'childAdolescent' | 'educational' | 'psychologyScientist')}
                                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                                    />
                                  </div>

                                  {isSelected && (
                                    <button
                                      type="button"
                                      onClick={() => setPrimarySupportArea(area.key as 'adultClinical' | 'childAdolescent' | 'educational' | 'psychologyScientist')}
                                      className={`w-full text-[10px] font-semibold py-1 rounded-md transition-colors cursor-pointer ${
                                        isPrimary
                                          ? 'bg-teal-600 text-white shadow-2xs'
                                          : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                                      }`}
                                    >
                                      {isPrimary ? '★ Utama (Primary Area)' : 'Jadikan Area Utama'}
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Tag Spesialisasi */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-slate-700">
                                  Daftar Tag Spesialisasi & Keahlian
                                </label>
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                  WAJIB (Min. 1)
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400">Kata kunci pencarian direktori. Teks English otomatis disamakan bila kosong.</p>
                            </div>
                            <button
                              type="button"
                              onClick={addSpecializationItem}
                              className="text-xs text-teal-700 hover:text-teal-800 font-bold px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-lg cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Tambah Tag
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {formState.specializations.map((spec, idx) => (
                              <div key={spec.id || idx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={spec.labelId}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setFormState((prev) => ({
                                      ...prev,
                                      specializations: prev.specializations.map((s, i) => i === idx ? {
                                        ...s,
                                        labelId: val,
                                        labelEn: s.labelEn ? s.labelEn : val
                                      } : s)
                                    }))
                                  }}
                                  placeholder="ID: Kecemasan, Trauma, Burnout..."
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                                <input
                                  type="text"
                                  value={spec.labelEn}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setFormState((prev) => ({
                                      ...prev,
                                      specializations: prev.specializations.map((s, i) => i === idx ? { ...s, labelEn: val } : s)
                                    }))
                                  }}
                                  placeholder="EN: Anxiety, Trauma, Burnout..."
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />
                                {formState.specializations.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSpecializationItem(idx)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                                    title="Hapus tag"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Featured Practitioner */}
                        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-900">Featured Practitioner</div>
                              <div className="text-[11px] text-slate-500">Tampilkan kartu profil ini pada carousel Featured di Landing Page utama.</div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formState.featured}
                              onChange={(e) => {
                                const checked = e.target.checked
                                setFormState((prev) => ({
                                  ...prev,
                                  featured: checked,
                                  featuredOrder: checked ? (prev.featuredOrder || String(getNextAvailableFeaturedOrder())) : ''
                                }))
                              }}
                              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                          </div>

                          {formState.featured && (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-slate-700">
                                  Nomor Urutan Tampil Featured (0, 1, 2...)
                                </label>
                                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                  WAJIB (Unik)
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={formState.featuredOrder}
                                  onChange={(e) => setFormState({ ...formState, featuredOrder: e.target.value })}
                                  placeholder="e.g. 1"
                                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                                />

                                <button
                                  type="button"
                                  onClick={() => setFormState((prev) => ({ ...prev, featuredOrder: String(getNextAvailableFeaturedOrder()) }))}
                                  className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/90 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Gunakan Nomor Berikutnya (#{getNextAvailableFeaturedOrder()})</span>
                                </button>
                              </div>

                              <p className="text-[10px] text-slate-400">
                                Jika nomor ini sudah dipakai praktisi lain, profil ini mengambil nomor tersebut dan praktisi lain otomatis bergeser ke bawah. Untuk memindahkan banyak profil sekaligus, pakai panel "Urutan Featured" di halaman direktori.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Bio & Jadwal */}
                    {activeFormTab === 'bio' && (
                      <div className="space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-200/70">
                        <div className="border-b border-slate-200/60 pb-2 mb-2 flex items-center justify-between">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Narasi Profil & Jadwal Praktik (Bilingual)
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              Isi biografi klinis dan pesan ketersediaan jadwal konsultasi.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSyncAllIdToEn}
                              className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="Salin seluruh teks Bahasa Indonesia ke English bila belum ada terjemahan"
                            >
                              <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                              <span>Salin Semua ID → EN</span>
                            </button>
                            <span className="text-[11px] text-teal-700 font-bold bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg">
                              Langkah 3 dari 3
                            </span>
                          </div>
                        </div>

                        {/* Short Bio */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-slate-700">
                              Short Bio (Bahasa Indonesia) - Untuk Kartu & Ringkasan
                            </label>
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              Opsional
                            </span>
                          </div>
                          <textarea
                            rows={2}
                            value={formState.shortBioId}
                            onChange={(e) => setFormState({ ...formState, shortBioId: e.target.value })}
                            placeholder="Ringkasan 1 paragraf untuk dropdown dan kartu seleksi..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-slate-700">
                              Short Bio (English)
                            </label>
                            <button
                              type="button"
                              onClick={() => setFormState((prev) => ({ ...prev, shortBioEn: prev.shortBioId }))}
                              className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" /> Salin dari ID
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={formState.shortBioEn}
                            onChange={(e) => setFormState({ ...formState, shortBioEn: e.target.value })}
                            placeholder="1-paragraph summary for dropdowns and selection cards..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          />
                        </div>

                        {/* Full Bio */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-slate-700">
                              Biografi Lengkap (Bahasa Indonesia)
                            </label>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              WAJIB
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            value={formState.biographyId}
                            onChange={(e) => setFormState({ ...formState, biographyId: e.target.value })}
                            placeholder="Deskripsi pendekatan terapi, filosofi, latar belakang akademis..."
                            className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                              !formState.biographyId.trim() ? 'border-amber-300' : 'border-slate-200'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-slate-700">
                              Biografi Lengkap (English)
                            </label>
                            <button
                              type="button"
                              onClick={() => setFormState((prev) => ({ ...prev, biographyEn: prev.biographyId }))}
                              className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                            >
                              <Copy className="w-3 h-3" /> Salin dari ID
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={formState.biographyEn}
                            onChange={(e) => setFormState({ ...formState, biographyEn: e.target.value })}
                            placeholder="Approach, philosophy, and academic background (otomatis disamakan bila kosong)..."
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          />
                        </div>

                        {/* Profile page quote */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
                          <div>
                            <div className="text-xs font-semibold text-slate-700">Kutipan di Halaman Profil</div>
                            <p className="text-[11px] text-slate-500">
                              Kalimat besar di atas biografi pada halaman profil. Kosongkan untuk memakai kalimat standar Attentive.
                            </p>
                          </div>
                          <div>
                            <label htmlFor="conversation-quote-id" className="mb-1 block text-xs font-semibold text-slate-700">
                              Kutipan (Bahasa Indonesia)
                            </label>
                            <textarea
                              id="conversation-quote-id"
                              rows={2}
                              maxLength={240}
                              value={formState.conversationQuoteId}
                              onChange={(e) => setFormState({ ...formState, conversationQuoteId: e.target.value })}
                              placeholder="Mulai dari bagian yang paling sulit kamu jelaskan."
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <label htmlFor="conversation-quote-en" className="text-xs font-semibold text-slate-700">
                                Quote (English)
                              </label>
                              <button
                                type="button"
                                onClick={() => setFormState((prev) => ({ ...prev, conversationQuoteEn: prev.conversationQuoteId }))}
                                className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                              >
                                <Copy className="w-3 h-3" /> Salin dari ID
                              </button>
                            </div>
                            <textarea
                              id="conversation-quote-en"
                              rows={2}
                              maxLength={240}
                              value={formState.conversationQuoteEn}
                              onChange={(e) => setFormState({ ...formState, conversationQuoteEn: e.target.value })}
                              placeholder="You can start with the part that feels hardest to explain."
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>
                        </div>

                        {/* Availability Messages */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Pesan Ketersediaan Jadwal (ID)
                              </label>
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                WAJIB
                              </span>
                            </div>
                            <input
                              type="text"
                              value={formState.availabilityMessageId}
                              onChange={(e) => setFormState({ ...formState, availabilityMessageId: e.target.value })}
                              placeholder="e.g. Tersedia Selasa, Kamis, dan Sabtu"
                              className={`w-full bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 ${
                                !formState.availabilityMessageId.trim() ? 'border-amber-300' : 'border-slate-200'
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Pesan Ketersediaan (EN)
                              </label>
                              <button
                                type="button"
                                onClick={() => setFormState((prev) => ({ ...prev, availabilityMessageEn: prev.availabilityMessageId }))}
                                className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                              >
                                <Copy className="w-3 h-3" /> Salin
                              </button>
                            </div>
                            <input
                              type="text"
                              value={formState.availabilityMessageEn}
                              onChange={(e) => setFormState({ ...formState, availabilityMessageEn: e.target.value })}
                              placeholder="e.g. Available Tuesday, Thursday, and Saturday"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Navigation Bar */}
                    <div className="flex items-center justify-between pt-2">
                      {currentTabIndex > 0 ? (
                        <button
                          type="button"
                          onClick={() => setActiveFormTab(TABS[currentTabIndex - 1].id)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Sebelumnya: {TABS[currentTabIndex - 1].short}</span>
                        </button>
                      ) : <div />}

                      {currentTabIndex < TABS.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setActiveFormTab(TABS[currentTabIndex + 1].id)}
                          className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-200/80 font-bold"
                        >
                          <span>Lanjut: {TABS[currentTabIndex + 1].short}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Modal Footer / Actions */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between mt-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>

                  <div className="flex items-center gap-3">
                    {(() => {
                      const missing = getMissingRequiredFields()
                      if (missing.length > 0) {
                        return (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            {missing.length} data wajib belum terisi
                          </span>
                        )
                      }
                      return (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Lengkap & Siap Simpan
                        </span>
                      )
                    })()}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={springConfig}
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Profil Psikolog'
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
