import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  Camera,
  Check,
  ImageIcon,
  Images,
  Loader2,
  MapPin,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useAuth } from '../../features/auth/auth-context'
import { uploadLandingImage } from '../../features/content/service'
import { HeroCarousel } from '../../components/landing/HeroCarousel'

interface LocalizedText {
  id: string
  en: string
}

interface LandingMedia {
  reference: string
  width?: number
  height?: number
  alt?: LocalizedText
}

interface LandingItem {
  id: string
  position: number
  title: LocalizedText
  description: LocalizedText
  media?: LandingMedia
}

interface LandingSection {
  key: string
  visible: boolean
  headline?: LocalizedText
  description?: LocalizedText
  media?: LandingMedia
  slides?: LandingMedia[]
  primaryCta?: LocalizedText
  secondaryCta?: LocalizedText
  sessionLabel?: LocalizedText
  price?: LocalizedText
  priceUnit?: LocalizedText
  contact?: LocalizedText
  items?: LandingItem[]
  [key: string]: unknown
}

interface LandingCmsData {
  sections: LandingSection[]
}

interface SectionImageInfo {
  defaultImage: string
  title: string
  aspectRatio: string
  description: string
  aspectClass: string
}

const SECTION_IMAGE_META: Record<string, SectionImageInfo> = {
  hero: {
    defaultImage: '/images/figma/consultation-hero.webp',
    title: 'Hero Consultation Picture',
    aspectRatio: '16:9 / 16:11 (1600 × 901 px)',
    description: 'Foto banner visual utama di sebelah kanan headline hero beranda.',
    aspectClass: 'aspect-[16/11]',
  },
  consultationReassurance: {
    defaultImage: '/images/figma/remote-counseling-session.webp',
    title: 'Consultation & Pricing Session Photo',
    aspectRatio: 'Portrait (919 × 1431 px)',
    description: 'Foto sesi konseling privat pada kartu rincian biaya.',
    aspectClass: 'aspect-[9/14]',
  },
  frequentlyAskedQuestions: {
    defaultImage: '/images/figma/faq-room.webp',
    title: 'FAQ Clinic Room Photo',
    aspectRatio: '4:3 (538 × 410 px)',
    description: 'Foto ruang klinik privat di samping daftar pertanyaan FAQ.',
    aspectClass: 'aspect-[4/3]',
  },
  closingInvitation: {
    defaultImage: '/images/figma/closing-landscape.webp',
    title: 'Closing Invitation Banner',
    aspectRatio: 'Landscape (680 × 614 px)',
    description: 'Ilustrasi / foto ajakan reservasi penutup di bagian bawah beranda.',
    aspectClass: 'aspect-[16/9]',
  },
}

const ITEM_DEFAULT_IMAGES: Record<string, string[]> = {
  careJourney: [
    '/images/journey/find-your-fit.webp',
    '/images/journey/choose-how-to-meet.webp',
    '/images/journey/connect-at-your-pace.webp',
  ],
  supportExplorer: [
    '/images/figma/support-1.webp',
    '/images/figma/support-2.webp',
    '/images/figma/support-3.webp',
    '/images/figma/support-4.webp',
    '/images/figma/support-5.webp',
    '/images/figma/support-6.webp',
  ],
}

const SECTION_DISPLAY_META: Record<string, { label: string; sublabel: string }> = {
  hero: { label: 'Hero & Visual Carousel', sublabel: 'Banner utama & slide showcase' },
  supportExplorer: { label: 'Area Layanan & Dukungan', sublabel: 'Kategori psikologi & fokus kasus' },
  carePromise: { label: 'Komitmen Layanan', sublabel: 'Etika HIMPSI & transparansi' },
  featuredPsychologists: { label: 'Psikolog Pilihan', sublabel: 'Sorotan praktisi berizin SIP' },
  careJourney: { label: 'Alur Konseling', sublabel: '3 langkah praktis reservasi' },
  clientStories: { label: 'Ulasan & Sorotan', sublabel: 'Testimoni & pengalaman klien' },
  consultationReassurance: { label: 'Konsultasi & Biaya', sublabel: 'Rincian tarif & fasilitas sesi' },
  frequentlyAskedQuestions: { label: 'Tanya Jawab (FAQ)', sublabel: 'Pertanyaan umum & info klinik' },
  closingInvitation: { label: 'Ajakan Penutup', sublabel: 'Call-to-action reservasi akhir' },
}

const defaultLandingData: LandingCmsData = {
  sections: [
    {
      key: 'hero',
      visible: true,
      headline: { id: 'Biro Psikologi Klinis & Konseling Profesional Berizin Resmi', en: 'Licensed Clinical Psychology Bureau & Professional Counseling' },
      description: { id: 'Konsultasi tatap muka langsung di Jakarta, BSD, dan Malang, atau sesi daring privat bersama psikolog berlisensi SIP resmi.', en: 'Private in-person consultations in Jakarta, BSD, and Malang, or online video counseling with licensed psychologists.' },
      primaryCta: { id: 'Jadwalkan Konsultasi', en: 'Book Consultation' },
      secondaryCta: { id: 'Lihat Layanan', en: 'Explore Services' },
      slides: [
        {
          reference: '/images/figma/consultation-hero.webp',
          width: 1600,
          height: 901,
          alt: { id: 'Konsultasi Psikologi Tatap Muka & Daring Attentive', en: 'Attentive In-Person & Online Psychological Consultation' },
        },
      ],
      items: [
        { id: 'item-1', position: 0, title: { id: 'Sesi terlaksana', en: 'Sessions delivered' }, description: { id: '3.000+', en: '3,000+' } },
        { id: 'item-2', position: 1, title: { id: 'Psikolog', en: 'Psychologists' }, description: { id: '18', en: '18' } },
        { id: 'item-3', position: 2, title: { id: 'Rating Google', en: 'Google rating' }, description: { id: '5,0', en: '5.0' } },
        { id: 'item-4', position: 3, title: { id: 'Ulasan Google', en: 'Google reviews' }, description: { id: '53', en: '53' } },
      ],
    },
    {
      key: 'supportExplorer',
      visible: true,
      headline: { id: 'Area Layanan & Dukungan Psikologi', en: 'Psychology Support & Care Areas' },
      description: { id: 'Pilih fokus dukungan yang paling relevan dengan kondisi emosional atau kebutuhan evaluasi Anda saat ini.', en: 'Select the focus area most relevant to your current emotional state or assessment needs.' },
      items: [
        { id: 'sup-1', position: 0, title: { id: 'Psikologi Dewasa', en: 'Adult Clinical' }, description: { id: 'Penanganan kecemasan, depresi, stres kerja, dan dinamika relasi.', en: 'Evidence-based support for anxiety, depression, burnout, and relationship distress.' } },
        { id: 'sup-2', position: 1, title: { id: 'Anak & Remaja', en: 'Child & Adolescent' }, description: { id: 'Evaluasi tumbuh kembang, regulasi emosi, dan kesiapan sekolah.', en: 'Developmental milestones, emotional regulation, and school readiness.' } },
        { id: 'sup-3', position: 2, title: { id: 'Pendidikan & Karir', en: 'Educational & Career' }, description: { id: 'Asesmen minat bakat terstandar dan eksplorasi arah karir.', en: 'Standardized aptitude testing and purposeful career pathway discovery.' } },
      ],
    },
    {
      key: 'carePromise',
      visible: true,
      headline: { id: 'Komitmen Layanan Attentive.id', en: 'Attentive.id Care Promise' },
      description: { id: 'Protokol klinis terukur demi rasa aman dan kejelasan progres konseling Anda.', en: 'Structured clinical protocols ensuring safety, clarity, and measurable progress.' },
      items: [
        { id: 'cp-1', position: 0, title: { id: 'Etika Profesional HIMPSI', en: 'Professional Ethics' }, description: { id: 'Standar praktik mematuhi penuh kode etik psikologi Indonesia.', en: 'Practices adhere strictly to Indonesian psychological ethics.' } },
        { id: 'cp-2', position: 1, title: { id: 'Fleksibilitas Tatap Muka & Daring', en: 'In-Person & Online Continuity' }, description: { id: 'Leluasa berganti antara sesi klinik dan daring tanpa berganti psikolog.', en: 'Switch seamlessly between clinic rooms and online sessions with the same therapist.' } },
        { id: 'cp-3', position: 2, title: { id: 'Tujuan Sesi Terencana', en: 'Goal-Oriented Planning' }, description: { id: 'Rencana pendampingan dirumuskan bersama klien secara transparan.', en: 'Personalized treatment goals formulated collaboratively with you.' } },
      ],
    },
    {
      key: 'featuredPsychologists',
      visible: true,
      headline: { id: 'Tim Psikolog Profesional Kami', en: 'Our Professional Psychologist Team' },
      description: { id: 'Kenali latar belakang pendidikan, spesialisasi kasus, dan nomor izin praktik para praktisi kami.', en: 'Explore clinical credentials, specialized focus areas, and license details of our therapists.' },
    },
    {
      key: 'careJourney',
      visible: true,
      headline: { id: 'Tahapan Langkah Konsultasi', en: 'Your Care Journey Steps' },
      description: { id: 'Tiga langkah terstruktur untuk memulai sesi pertama Anda.', en: 'Three clear steps to begin your first counseling session.' },
      items: [
        { id: 'cj-1', position: 0, title: { id: '1. Pilih Psikolog', en: '1. Choose Therapist' }, description: { id: 'Telusuri profil berdasarkan keahlian dan lokasi cabang.', en: 'Review profiles matching your concern and preferred branch.' } },
        { id: 'cj-2', position: 1, title: { id: '2. Tentukan Jadwal', en: '2. Schedule Slot' }, description: { id: 'Pilih tanggal, jam, serta format tatap muka atau daring.', en: 'Select your preferred time slot and session format.' } },
        { id: 'cj-3', position: 2, title: { id: '3. Jalani Sesi Privat', en: '3. Attend Session' }, description: { id: 'Sesi 60 menit terarah di ruang privat atau tautan video aman.', en: 'A focused 60-minute session held in private suites or via encrypted video.' } },
      ],
    },
    {
      key: 'clientStories',
      visible: true,
      headline: { id: 'Refleksi Klien Kami', en: 'Client Reflections & Outcomes' },
      description: { id: 'Cerita nyata dari klien yang telah menyelesaikan rangkaian sesi konseling bersama Attentive.', en: 'Direct accounts from individuals who completed structured counseling with our psychologists.' },
      items: [
        { id: 'cs-1', position: 0, title: { id: 'Kejelasan Menghadapi Kecemasan', en: 'Clarity Amid Anxiety' }, description: { id: 'Membantu saya memahami akar pola overthinking dan menemukan strategi coping yang realistis.', en: 'Helped me pinpoint anxiety triggers and develop practical, grounded coping routines.' } },
        { id: 'cs-2', position: 1, title: { id: 'Ruang Aman untuk Berproses', en: 'A Structured Sanctuary' }, description: { id: 'Sesi yang menghargai ritme emosi tanpa dipaksa cepat-cepat pulih sebelum siap.', en: 'A thoughtful pace that respected my readiness without rushing the process.' } },
        { id: 'cs-3', position: 2, title: { id: 'Dukungan Karir & Keputusan Sulit', en: 'Workplace Direction' }, description: { id: 'Sangat membantu dalam mengurai burnout kerja dan menata kembali batas kerja-pribadi.', en: 'Crucial support for untangling professional burnout and restoring healthy boundaries.' } },
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
      contact: { id: 'WhatsApp: +62 851-5641-0912 | Email: contact@attentiveid.com', en: 'WhatsApp: +62 851-5641-0912 | Email: contact@attentiveid.com' },
    },
  ],
}

export function LandingCmsPage() {
  const { getAuthHeaders } = useAuth()
  const [content, setContent] = useState<LandingCmsData>(defaultLandingData)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [languageView, setLanguageView] = useState<'both' | 'id' | 'en'>('both')
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Upload state
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [dragOverSection, setDragOverSection] = useState(false)

  const sectionFileInputRef = useRef<HTMLInputElement>(null)
  const itemFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

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
  }, [getAuthHeaders])

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
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
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

  const updateSectionCustomField = (field: string, lang: 'id' | 'en', value: string) => {
    const newSections = [...content.sections]
    const currentFieldVal = (activeSection[field] as LocalizedText | undefined) || { id: '', en: '' }
    newSections[activeSectionIndex] = {
      ...activeSection,
      [field]: {
        ...currentFieldVal,
        [lang]: value,
      },
    }
    setContent({ ...content, sections: newSections })
  }

  const updateRepeaterItem = (itemIndex: number, field: 'title' | 'description', lang: 'id' | 'en', value: string) => {
    const newItems = [...(activeSection.items || [])]
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

  // --- Photo Upload Handlers ---
  const handleSectionImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar (WebP, PNG, JPG) yang diperbolehkan.')
      return
    }
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setUploadError(`Ukuran file (${sizeMB} MB) melebihi batas maksimal 5 MB. Silakan kompres gambar terlebih dahulu.`)
      return
    }

    setUploadingTarget(activeSection.key)
    setUploadError(null)
    setUploadSuccess(null)

    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      const width = img.naturalWidth || 1200
      const height = img.naturalHeight || 800

      try {
        const res = await uploadLandingImage(
          file,
          {
            sectionKey: activeSection.key,
            slug: `${activeSection.key}-visual`,
            altId: activeSection.media?.alt?.id || `Gambar section ${activeSection.key} Attentive.id`,
            altEn: activeSection.media?.alt?.en || `Attentive.id ${activeSection.key} section illustration`,
            width,
            height,
          },
          { headers: getAuthHeaders() }
        )

        const newSections = [...content.sections]
        newSections[activeSectionIndex] = {
          ...activeSection,
          media: {
            reference: res.media.reference,
            width: res.media.width,
            height: res.media.height,
            alt: res.media.alt,
          },
        }
        setContent({ ...content, sections: newSections })
        setUploadSuccess(`Gambar section "${activeSection.key}" berhasil diunggah!`)
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah gambar section.')
      } finally {
        setUploadingTarget(null)
      }
    }

    img.onerror = () => {
      setUploadingTarget(null)
      setUploadError('Gagal memproses file gambar.')
    }

    img.src = objectUrl
  }

  const handleResetSectionImage = () => {
    const newSections = [...content.sections]
    const updated = { ...activeSection }
    delete updated.media
    newSections[activeSectionIndex] = updated
    setContent({ ...content, sections: newSections })
    setUploadSuccess(`Gambar section "${activeSection.key}" dikembalikan ke default bawaan.`)
    setUploadError(null)
  }

  const handleSectionMediaAltChange = (lang: 'id' | 'en', value: string) => {
    if (!activeSection.media) return
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      media: {
        ...activeSection.media,
        alt: {
          id: activeSection.media.alt?.id || '',
          en: activeSection.media.alt?.en || '',
          [lang]: value,
        },
      },
    }
    setContent({ ...content, sections: newSections })
  }

  const handleItemImageUpload = async (itemIdx: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar (WebP, PNG, JPG) yang diperbolehkan.')
      return
    }
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setUploadError(`Ukuran file (${sizeMB} MB) melebihi batas maksimal 5 MB.`)
      return
    }

    const targetKey = `${activeSection.key}-item-${itemIdx}`
    setUploadingTarget(targetKey)
    setUploadError(null)
    setUploadSuccess(null)

    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      const width = img.naturalWidth || 800
      const height = img.naturalHeight || 500

      try {
        const res = await uploadLandingImage(
          file,
          {
            sectionKey: activeSection.key,
            itemPosition: itemIdx,
            slug: `${activeSection.key}-step-${itemIdx + 1}`,
            altId: `Gambar item #${itemIdx + 1}`,
            altEn: `Illustration for item #${itemIdx + 1}`,
            width,
            height,
          },
          { headers: getAuthHeaders() }
        )

        const newItems = [...(activeSection.items || [])]
        newItems[itemIdx] = {
          ...newItems[itemIdx],
          media: {
            reference: res.media.reference,
            width: res.media.width,
            height: res.media.height,
            alt: res.media.alt,
          },
        }
        const newSections = [...content.sections]
        newSections[activeSectionIndex] = { ...activeSection, items: newItems }
        setContent({ ...content, sections: newSections })
        setUploadSuccess(`Gambar item #${itemIdx + 1} berhasil diunggah!`)
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah gambar item.')
      } finally {
        setUploadingTarget(null)
      }
    }

    img.onerror = () => {
      setUploadingTarget(null)
      setUploadError('Gagal memproses file gambar.')
    }

    img.src = objectUrl
  }

  const handleResetItemImage = (itemIdx: number) => {
    const newItems = [...(activeSection.items || [])]
    const updated = { ...newItems[itemIdx] }
    delete updated.media
    newItems[itemIdx] = updated
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = { ...activeSection, items: newItems }
    setContent({ ...content, sections: newSections })
    setUploadSuccess(`Gambar item #${itemIdx + 1} dikembalikan ke default bawaan.`)
  }

  const sectionImageMeta = SECTION_IMAGE_META[activeSection?.key]
  const currentSectionImageSrc = activeSection?.media?.reference
    ? (activeSection.media.reference.startsWith('/') ? activeSection.media.reference : `/${activeSection.media.reference}`)
    : sectionImageMeta?.defaultImage

  const heroSlides: LandingMedia[] = (activeSection?.key === 'hero' && activeSection.slides && activeSection.slides.length > 0)
    ? activeSection.slides
    : (activeSection?.key === 'hero'
        ? [
            activeSection.media || {
              reference: '/images/figma/consultation-hero.webp',
              width: 1600,
              height: 901,
              alt: {
                id: 'Konsultasi Psikologi Tatap Muka & Daring Attentive',
                en: 'Attentive In-Person & Online Psychological Consultation',
              },
            },
          ]
        : [])

  const updateHeroSlides = (newSlides: LandingMedia[]) => {
    const newSections = [...content.sections]
    const updatedHero: LandingSection = {
      ...activeSection,
      slides: newSlides,
      media: newSlides[0] ? { ...newSlides[0] } : activeSection.media,
    }
    newSections[activeSectionIndex] = updatedHero
    setContent({ ...content, sections: newSections })
  }

  const handleAddHeroSlide = () => {
    if (heroSlides.length >= 10) {
      setUploadError('Batas maksimal 10 foto carousel telah tercapai.')
      return
    }
    const nextIdx = heroSlides.length + 1
    const newSlide: LandingMedia = {
      reference: '/images/figma/faq-room.webp',
      width: 1600,
      height: 901,
      alt: {
        id: `Foto Layanan #${nextIdx}`,
        en: `Service Highlight #${nextIdx}`,
      },
    }
    updateHeroSlides([...heroSlides, newSlide])
    setUploadSuccess(`Slide #${nextIdx} berhasil ditambahkan ke carousel hero.`)
  }

  const handleRemoveHeroSlide = (indexToRemove: number) => {
    if (heroSlides.length <= 1) {
      setUploadError('Minimal 1 foto wajib ada pada carousel hero.')
      return
    }
    const newSlides = heroSlides.filter((_, idx) => idx !== indexToRemove)
    updateHeroSlides(newSlides)
    setUploadSuccess(`Slide #${indexToRemove + 1} berhasil dihapus dari carousel.`)
  }

  const handleMoveHeroSlide = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= heroSlides.length) return
    const newSlides = [...heroSlides]
    const temp = newSlides[fromIndex]
    newSlides[fromIndex] = newSlides[toIndex]
    newSlides[toIndex] = temp
    updateHeroSlides(newSlides)
  }

  const handleHeroSlideAltChange = (slideIndex: number, lang: 'id' | 'en', text: string) => {
    const newSlides = heroSlides.map((slide, idx) => {
      if (idx !== slideIndex) return slide
      return {
        ...slide,
        alt: {
          id: lang === 'id' ? text : (slide.alt?.id || ''),
          en: lang === 'en' ? text : (slide.alt?.en || ''),
        },
      }
    })
    updateHeroSlides(newSlides)
  }

  const handleHeroSlideUpload = async (slideIndex: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar (WebP, PNG, JPG) yang diperbolehkan.')
      return
    }
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setUploadError(`Ukuran file (${sizeMB} MB) melebihi batas maksimal 5 MB.`)
      return
    }

    setUploadingTarget(`hero-slide-${slideIndex}`)
    setUploadError(null)
    setUploadSuccess(null)

    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = async () => {
      const width = img.naturalWidth || 1600
      const height = img.naturalHeight || 901

      try {
        const res = await uploadLandingImage(
          file,
          {
            sectionKey: 'hero',
            slug: `hero-slide-${slideIndex + 1}`,
            altId: heroSlides[slideIndex]?.alt?.id || `Foto Slide ${slideIndex + 1}`,
            altEn: heroSlides[slideIndex]?.alt?.en || `Hero Slide ${slideIndex + 1}`,
            width,
            height,
          },
          { headers: getAuthHeaders() }
        )

        const newSlides = heroSlides.map((slide, idx) => {
          if (idx !== slideIndex) return slide
          return {
            reference: res.media.reference,
            width: res.media.width,
            height: res.media.height,
            alt: res.media.alt,
          }
        })
        updateHeroSlides(newSlides)
        setUploadSuccess(`Foto untuk Slide #${slideIndex + 1} berhasil diperbarui!`)
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Gagal mengunggah foto slide.')
      } finally {
        setUploadingTarget(null)
        URL.revokeObjectURL(objectUrl)
      }
    }
    img.onerror = () => {
      setUploadError('Gagal memproses file gambar.')
      setUploadingTarget(null)
      URL.revokeObjectURL(objectUrl)
    }
    img.src = objectUrl
  }

  return (
    <div className="space-y-6 max-w-6xl relative pb-12">
      {/* Top Header & Sticky Control Bar (Edge-to-edge relative to main container, zero overlap) */}
      <div className="-mt-4 -mx-4 sm:-mt-6 sm:-mx-6 lg:-mt-8 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-20 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 max-w-6xl">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Landing Content Editor
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-md">
                Live CMS
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-md hidden sm:inline-block">
                Carousel Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola teks bilingual 9 section, visual hero carousel, dan unggah foto resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Bilingual View Toggle */}
            <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLanguageView('both')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  languageView === 'both'
                    ? 'bg-white text-teal-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilkan Bahasa Indonesia dan English berdampingan"
              >
                Dual View
              </button>
              <button
                type="button"
                onClick={() => setLanguageView('id')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  languageView === 'id'
                    ? 'bg-white text-teal-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Fokus edit Bahasa Indonesia saja"
              >
                <span>🇮🇩</span>
                <span>ID</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguageView('en')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  languageView === 'en'
                    ? 'bg-white text-teal-800 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Fokus edit English saja"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <Link
              to="/preview/landing"
              target="_blank"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Preview Draft ↗
            </Link>
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Draft'}
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isPublishing ? 'Menerbitkan...' : 'Terbitkan ke Publik'}
            </motion.button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-medium border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Global Upload Banner Notifications */}
      {uploadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{uploadSuccess}</span>
          </div>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-600 hover:text-emerald-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold">Gagal:</span>
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-900 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Section Nav + Section Editor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Section List Navigation (Sticky on desktop) */}
        <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200 shrink-0 sticky top-20 self-start max-h-[calc(100vh-6.5rem)] overflow-y-auto shadow-2xs">
          <div className="px-3 py-1.5 flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Daftar Section</h2>
            <span className="text-[10px] text-slate-400 font-semibold">{content.sections.length} Bagian</span>
          </div>

          {content.sections.map((sec: LandingSection, idx: number) => {
            const hasCustomMedia = !!sec.media || (sec.items?.some((it) => !!it.media))
            const displayMeta = SECTION_DISPLAY_META[sec.key] || {
              label: sec.key,
              sublabel: `Section #${idx + 1}`,
            }

            return (
              <button
                key={sec.key}
                onClick={() => {
                  setActiveSectionIndex(idx)
                  setUploadError(null)
                  setUploadSuccess(null)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between group cursor-pointer ${
                  activeSectionIndex === idx
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`size-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                      activeSectionIndex === idx
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-slate-800 group-hover:text-teal-900">
                      {displayMeta.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {sec.key}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {hasCustomMedia && (
                    <span className="size-1.5 rounded-full bg-teal-500" title="Memiliki visual foto kustom" />
                  )}
                  <span
                    className={`w-2 h-2 rounded-full ${sec.visible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    title={sec.visible ? 'Aktif' : 'Disembunyikan'}
                  />
                </div>
              </button>
            )
          })}

          {/* Clinic Locations Info Badge */}
          <div className="mt-3 p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-xs">
            <div className="font-semibold text-teal-900 mb-1 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-teal-700 shrink-0" />
              <span>Lokasi Klinik (#locations)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Section lokasi fisik (TBI Jakarta, BSD Tangerang, Malang) disinkronkan dari data cabang resmi dan tampil terintegrasi pada homepage.
            </p>
          </div>
        </div>

        {/* Active Section Form */}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                Editing Section #{activeSectionIndex + 1}
              </span>
              <h2 className="text-lg font-bold text-slate-900 capitalize flex items-center gap-2 mt-0.5">
                <span>{SECTION_DISPLAY_META[activeSection?.key]?.label || activeSection?.key}</span>
                <span className="text-xs font-normal text-slate-400">({activeSection?.key})</span>
                {activeSection?.media && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                    Custom Photo Active
                  </span>
                )}
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
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

          {/* --- HERO ONLY: Live Hero Carousel Simulator & Showcase --- */}
          {activeSection?.key === 'hero' && (
            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl border border-slate-700 text-white space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold tracking-tight text-white">Hero Showcase Carousel (Live Simulator)</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                        {heroSlides.length === 1 ? '1 Foto Aktif (Single Photo)' : `${heroSlides.length} Foto Aktif (Carousel)`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {heroSlides.length === 1
                        ? 'Hanya 1 foto aktif: beranda menampilkan foto bersih tanpa kontrol atau navigasi carousel.'
                        : `${heroSlides.length} foto aktif: beranda otomatis memutar carousel interaktif dengan transisi Framer Motion spring physics.`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Embedded Interactive Carousel Simulator */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/15 bg-black/60 shadow-lg">
                <HeroCarousel
                  slides={heroSlides.map((s, idx) => ({
                    id: `preview-slide-${idx}-${s.reference}`,
                    imageSrc: s.reference.startsWith('/') ? s.reference : `/${s.reference}`,
                    alt: (languageView === 'en' ? s.alt?.en : s.alt?.id) || s.alt?.id || `Hero Slide ${idx + 1}`,
                    tag: idx === 0 ? 'Konseling Tatap Muka & Daring' : `Sorotan Layanan #${idx + 1}`,
                    caption: (languageView === 'en' ? s.alt?.en : s.alt?.id) || s.alt?.id || `Slide Foto #${idx + 1}`,
                    width: s.width ?? 1600,
                    height: s.height ?? 901,
                  }))}
                />
              </div>

              {/* Slide Chips below simulator */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] text-slate-300">
                {heroSlides.map((s, idx) => (
                  <div
                    key={`hero-sim-chip-${idx}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 shrink-0"
                  >
                    <span className="size-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="font-semibold text-white">Slide #{idx + 1}</span>
                    <span className="text-[10px] text-slate-400 max-w-[140px] truncate">
                      {(languageView === 'en' ? s.alt?.en : s.alt?.id) || s.alt?.id || s.reference}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- HERO ONLY: Dynamic Carousel Slides Manager --- */}
          {activeSection?.key === 'hero' ? (
            <div className="space-y-4 p-5 bg-slate-50/90 rounded-2xl border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                    <Images className="size-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Kelola Foto Carousel Hero
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-md">
                        {heroSlides.length} Foto Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Atur foto yang tampil di hero beranda. Minimal 1 foto, maksimal 10 foto.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddHeroSlide}
                  disabled={heroSlides.length >= 10}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto shrink-0"
                >
                  <Plus className="size-3.5" />
                  <span>Tambah Foto Slide</span>
                </button>
              </div>

              <div className="space-y-3">
                {heroSlides.map((slide, sIdx) => {
                  const isFirst = sIdx === 0
                  const isLast = sIdx === heroSlides.length - 1
                  const isUploading = uploadingTarget === `hero-slide-${sIdx}`
                  const slideInputId = `hero-slide-file-input-${sIdx}`

                  return (
                    <div
                      key={`hero-slide-card-${sIdx}`}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3 transition-all hover:border-slate-300"
                    >
                      {/* Slide Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center size-5 rounded-md bg-slate-900 text-white text-[11px] font-bold">
                            {sIdx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Slide #{sIdx + 1}
                          </span>
                          {isFirst && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                              Foto Utama
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveHeroSlide(sIdx, 'up')}
                            disabled={isFirst}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors cursor-pointer"
                            title="Pindah ke atas"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveHeroSlide(sIdx, 'down')}
                            disabled={isLast}
                            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors cursor-pointer"
                            title="Pindah ke bawah"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveHeroSlide(sIdx)}
                            disabled={heroSlides.length <= 1}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              heroSlides.length <= 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                            }`}
                            title={heroSlides.length <= 1 ? 'Minimal 1 foto wajib ada' : 'Hapus slide ini'}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Slide Content Grid: Preview on left, Upload & Alt text on right */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        {/* Visual Thumbnail */}
                        <div className="sm:col-span-4">
                          <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200 group">
                            <img
                              src={slide.reference.startsWith('/') ? slide.reference : `/${slide.reference}`}
                              alt={slide.alt?.id || `Hero Slide ${sIdx + 1}`}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/figma/consultation-hero.webp'
                              }}
                            />
                            <label
                              htmlFor={slideInputId}
                              className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white cursor-pointer p-2 text-center"
                            >
                              <Camera className="size-4" />
                              <span className="text-[10px] font-semibold">Ganti Foto</span>
                            </label>
                            <div className="absolute bottom-1.5 left-1.5 pointer-events-none">
                              <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-950/70 text-white rounded backdrop-blur-xs">
                                {slide.width && slide.height ? `${slide.width} × ${slide.height}` : '16:9'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Upload & Alt Text Inputs */}
                        <div className="sm:col-span-8 space-y-2">
                          <input
                            id={slideInputId}
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleHeroSlideUpload(sIdx, e.target.files[0])
                              }
                            }}
                          />

                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={slideInputId}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${
                                isUploading
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="size-3 animate-spin text-teal-600" />
                                  <span>Mengunggah...</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="size-3 text-teal-600" />
                                  <span>Unggah Foto Pengganti</span>
                                </>
                              )}
                            </label>
                            <span className="text-[10px] text-slate-400">
                              WebP, PNG, JPG (Maks 5 MB)
                            </span>
                          </div>

                          {/* Bilingual Alt Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                Alt Text (ID)
                              </label>
                              <input
                                type="text"
                                value={slide.alt?.id || ''}
                                onChange={(e) => handleHeroSlideAltChange(sIdx, 'id', e.target.value)}
                                placeholder="Deskripsi foto untuk pembaca layar (ID)"
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                Alt Text (EN)
                              </label>
                              <input
                                type="text"
                                value={slide.alt?.en || ''}
                                onChange={(e) => handleHeroSlideAltChange(sIdx, 'en', e.target.value)}
                                placeholder="Accessible description for screen readers (EN)"
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {heroSlides.length < 10 && (
                  <button
                    type="button"
                    onClick={handleAddHeroSlide}
                    className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-white hover:bg-teal-50/50 transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Tambah Foto Slide ke-{heroSlides.length + 1}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* --- OTHER SECTIONS: Section-Level Picture Upload Card --- */
            (sectionImageMeta || activeSection?.media) && (
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                      <ImageIcon className="size-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {sectionImageMeta?.title || 'Visual Gambar Section'}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {sectionImageMeta?.description || 'Unggah foto resmi untuk section ini.'} (Rasio target: {sectionImageMeta?.aspectRatio || 'Bebas'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSection.media ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                        <Check className="size-3" />
                        Visual Kustom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700 rounded-md">
                        Bawaan Sistem
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid: Preview Box + Upload Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Visual Preview */}
                  <div className="sm:col-span-5">
                    <div className={`relative ${sectionImageMeta?.aspectClass || 'aspect-video'} w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shadow-xs group`}>
                      <img
                        src={currentSectionImageSrc}
                        alt={activeSection.media?.alt?.id || activeSection.headline?.id || 'Preview Visual Section'}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          if (sectionImageMeta?.defaultImage) {
                            (e.target as HTMLImageElement).src = sectionImageMeta.defaultImage
                          }
                        }}
                      />

                      {/* Hover Overlay */}
                      <div
                        onClick={() => sectionFileInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white cursor-pointer p-3 text-center"
                      >
                        <Camera className="w-6 h-6 text-white" />
                        <span className="text-xs font-semibold">Klik untuk Ganti Gambar</span>
                        <span className="text-[10px] text-slate-300">WebP, PNG, JPG (Maks 5 MB)</span>
                      </div>

                      {/* Dimension Tag */}
                      <div className="absolute bottom-2 left-2 pointer-events-none">
                        <span className="px-2 py-0.5 text-[9px] font-semibold bg-slate-950/70 text-white rounded-md backdrop-blur-xs">
                          {activeSection.media?.width && activeSection.media?.height
                            ? `${activeSection.media.width} × ${activeSection.media.height} px`
                            : (sectionImageMeta?.aspectRatio || 'Default')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dropzone & Action Controls */}
                  <div className="sm:col-span-7 space-y-3">
                    <input
                      ref={sectionFileInputRef}
                      type="file"
                      accept="image/webp,image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleSectionImageUpload(e.target.files[0])
                        }
                      }}
                    />

                    {/* Drag-and-drop zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOverSection(true)
                      }}
                      onDragLeave={() => setDragOverSection(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragOverSection(false)
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleSectionImageUpload(e.dataTransfer.files[0])
                        }
                      }}
                      onClick={() => sectionFileInputRef.current?.click()}
                      className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                        dragOverSection
                          ? 'border-teal-500 bg-teal-50/60'
                          : 'border-slate-300 hover:border-teal-500 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <UploadCloud className="w-6 h-6 text-teal-600" />
                      <div className="text-xs font-semibold text-slate-700 text-center">
                        Tarik file gambar ke sini atau klik untuk memilih
                      </div>
                      <div className="text-[10px] text-slate-400 text-center">
                        Format WebP, PNG, JPG • Ukuran maksimal 5 MB
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => sectionFileInputRef.current?.click()}
                        disabled={uploadingTarget === activeSection.key}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {uploadingTarget === activeSection.key ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengunggah Gambar...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3.5 h-3.5" />
                            <span>Pilih & Unggah Gambar</span>
                          </>
                        )}
                      </button>

                      {activeSection.media && (
                        <button
                          type="button"
                          onClick={handleResetSectionImage}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Kembalikan ke gambar default bawaan sistem"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Kembalikan ke Default</span>
                        </button>
                      )}
                    </div>

                    {/* Alt Text Accessibility inputs for section image */}
                    {activeSection.media && (
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-200">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Alt Text Gambar (ID)</label>
                          <input
                            type="text"
                            value={activeSection.media.alt?.id || ''}
                            onChange={(e) => handleSectionMediaAltChange('id', e.target.value)}
                            placeholder="Deskripsi visual untuk aksesibilitas (ID)"
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Alt Text Image (EN)</label>
                          <input
                            type="text"
                            value={activeSection.media.alt?.en || ''}
                            onChange={(e) => handleSectionMediaAltChange('en', e.target.value)}
                            placeholder="Visual description for screen reader (EN)"
                            className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Section Copy (Headline & Description) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Judul & Deskripsi Section</h3>
              <span className="text-[10px] text-slate-500 font-medium">
                {languageView === 'both' ? 'Mode Dual View (ID + EN)' : languageView === 'id' ? 'Mode Bahasa Indonesia' : 'Mode English'}
              </span>
            </div>

            <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
              {(languageView === 'both' || languageView === 'id') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Headline (Indonesian)</label>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                  </div>
                  <input
                    type="text"
                    value={activeSection?.headline?.id || ''}
                    onChange={(e) => updateSectionCopy('headline', 'id', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
              {(languageView === 'both' || languageView === 'en') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Headline (English)</label>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                  </div>
                  <input
                    type="text"
                    value={activeSection?.headline?.en || ''}
                    onChange={(e) => updateSectionCopy('headline', 'en', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>

            <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
              {(languageView === 'both' || languageView === 'id') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Description (Indonesian)</label>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                  </div>
                  <textarea
                    rows={3}
                    value={activeSection?.description?.id || ''}
                    onChange={(e) => updateSectionCopy('description', 'id', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
              {(languageView === 'both' || languageView === 'en') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Description (English)</label>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                  </div>
                  <textarea
                    rows={3}
                    value={activeSection?.description?.en || ''}
                    onChange={(e) => updateSectionCopy('description', 'en', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section Specific Action & CTA Fields */}
          {(activeSection?.primaryCta || activeSection?.secondaryCta || activeSection?.contact || activeSection?.price) && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tombol & Informasi Khusus</h3>

              {activeSection?.primaryCta && (
                <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                  {(languageView === 'both' || languageView === 'id') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Primary CTA Button (ID)</label>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                      </div>
                      <input
                        type="text"
                        value={activeSection.primaryCta.id || ''}
                        onChange={(e) => updateSectionCustomField('primaryCta', 'id', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                  {(languageView === 'both' || languageView === 'en') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Primary CTA Button (EN)</label>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                      </div>
                      <input
                        type="text"
                        value={activeSection.primaryCta.en || ''}
                        onChange={(e) => updateSectionCustomField('primaryCta', 'en', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeSection?.secondaryCta && (
                <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                  {(languageView === 'both' || languageView === 'id') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Secondary CTA Button (ID)</label>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                      </div>
                      <input
                        type="text"
                        value={activeSection.secondaryCta.id || ''}
                        onChange={(e) => updateSectionCustomField('secondaryCta', 'id', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                  {(languageView === 'both' || languageView === 'en') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Secondary CTA Button (EN)</label>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                      </div>
                      <input
                        type="text"
                        value={activeSection.secondaryCta.en || ''}
                        onChange={(e) => updateSectionCustomField('secondaryCta', 'en', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeSection?.price && (
                <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                  {(languageView === 'both' || languageView === 'id') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Label Biaya (ID)</label>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                      </div>
                      <input
                        type="text"
                        value={activeSection.price.id || ''}
                        onChange={(e) => updateSectionCustomField('price', 'id', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                  {(languageView === 'both' || languageView === 'en') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Label Biaya (EN)</label>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                      </div>
                      <input
                        type="text"
                        value={activeSection.price.en || ''}
                        onChange={(e) => updateSectionCustomField('price', 'en', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeSection?.contact && (
                <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                  {(languageView === 'both' || languageView === 'id') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Informasi Kontak & Hotline (ID)</label>
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                      </div>
                      <input
                        type="text"
                        value={activeSection.contact.id || ''}
                        onChange={(e) => updateSectionCustomField('contact', 'id', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                  {(languageView === 'both' || languageView === 'en') && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Contact & Hotline Info (EN)</label>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                      </div>
                      <input
                        type="text"
                        value={activeSection.contact.en || ''}
                        onChange={(e) => updateSectionCustomField('contact', 'en', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Repeater Items Section if section contains items */}
          {Array.isArray(activeSection?.items) && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  {activeSection.key === 'hero' ? 'Trust Metrics Counter Bar (4 Item)' : `Item Repeater List (${activeSection.items.length} item)`}
                </h3>
                {ITEM_DEFAULT_IMAGES[activeSection.key] && (
                  <span className="text-[11px] text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md font-semibold">
                    Item Photo Upload Supported
                  </span>
                )}
              </div>

              {activeSection.key === 'hero' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <div>
                    <p className="font-bold">4 Kolom Trust Metrics Counter di Bawah Banner</p>
                    <p className="text-[11px] text-amber-700">
                      Bagian ini mengatur 4 kartu metrik counter: Judul = Label teks (cth: Sesi terlaksana), Deskripsi = Nilai/Angka besar (cth: 3.000+).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSections = [...content.sections]
                      newSections[activeSectionIndex] = {
                        ...activeSection,
                        items: [
                          { id: 'sessions-delivered', position: 0, title: { id: 'Sesi terlaksana', en: 'Sessions delivered' }, description: { id: '3.000+', en: '3,000+' } },
                          { id: 'psychologist-count', position: 1, title: { id: 'Psikolog', en: 'Psychologists' }, description: { id: '18', en: '18' } },
                          { id: 'google-rating', position: 2, title: { id: 'Rating Google', en: 'Google rating' }, description: { id: '5,0', en: '5.0' } },
                          { id: 'google-reviews', position: 3, title: { id: 'Ulasan Google', en: 'Google reviews' }, description: { id: '53', en: '53' } },
                        ],
                      }
                      setContent({ ...content, sections: newSections })
                      setMessage({ type: 'success', text: '4 Angka Trust Metrics resmi (3.000+, 18, 5,0, 53) berhasil dipulihkan!' })
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    <span>⚡ Reset ke 4 Metrik Resmi</span>
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {activeSection.items.map((item: LandingItem, itemIdx: number) => {
                  const itemTargetKey = `${activeSection.key}-item-${itemIdx}`
                  const defaultItemImg = ITEM_DEFAULT_IMAGES[activeSection.key]?.[itemIdx]
                  const currentItemImg = item.media?.reference
                    ? (item.media.reference.startsWith('/') ? item.media.reference : `/${item.media.reference}`)
                    : defaultItemImg

                  const isHero = activeSection.key === 'hero'
                  const titlePlaceholderId = isHero ? 'Label Metrik (ID, cth: Sesi terlaksana)' : 'Title (ID)'
                  const titlePlaceholderEn = isHero ? 'Label Metrik (EN, cth: Sessions delivered)' : 'Title (EN)'
                  const descPlaceholderId = isHero ? 'Nilai / Angka (ID, cth: 3.000+)' : 'Description (ID)'
                  const descPlaceholderEn = isHero ? 'Nilai / Angka (EN, cth: 3,000+)' : 'Description (EN)'

                  return (
                    <div key={item.id || itemIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Item #{itemIdx + 1}</span>
                        {item.media && (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                            Foto Kustom Terunggah
                          </span>
                        )}
                      </div>

                      <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2'}>
                        {(languageView === 'both' || languageView === 'id') && (
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={titlePlaceholderId}
                              value={item.title?.id || ''}
                              onChange={(e) => updateRepeaterItem(itemIdx, 'title', 'id', e.target.value)}
                              className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-200 pointer-events-none">ID</span>
                          </div>
                        )}
                        {(languageView === 'both' || languageView === 'en') && (
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={titlePlaceholderEn}
                              value={item.title?.en || ''}
                              onChange={(e) => updateRepeaterItem(itemIdx, 'title', 'en', e.target.value)}
                              className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-sky-700 bg-sky-50 px-1 py-0.2 rounded border border-sky-200 pointer-events-none">EN</span>
                          </div>
                        )}
                      </div>

                      <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2'}>
                        {(languageView === 'both' || languageView === 'id') && (
                          <div className="relative">
                            <textarea
                              rows={2}
                              placeholder={descPlaceholderId}
                              value={item.description?.id || ''}
                              onChange={(e) => updateRepeaterItem(itemIdx, 'description', 'id', e.target.value)}
                              className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                            <span className="absolute right-2 top-2 text-[9px] font-bold text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-200 pointer-events-none">ID</span>
                          </div>
                        )}
                        {(languageView === 'both' || languageView === 'en') && (
                          <div className="relative">
                            <textarea
                              rows={2}
                              placeholder={descPlaceholderEn}
                              value={item.description?.en || ''}
                              onChange={(e) => updateRepeaterItem(itemIdx, 'description', 'en', e.target.value)}
                              className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                            <span className="absolute right-2 top-2 text-[9px] font-bold text-sky-700 bg-sky-50 px-1 py-0.2 rounded border border-sky-200 pointer-events-none">EN</span>
                          </div>
                        )}
                      </div>

                      {/* Repeater Item Photo Uploader if section supports it */}
                      {(defaultItemImg || item.media) && (
                        <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
                          <input
                            ref={(el) => {
                              itemFileInputRefs.current[itemIdx] = el
                            }}
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleItemImageUpload(itemIdx, e.target.files[0])
                              }
                            }}
                          />

                          <div className="size-16 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                            <img
                              src={currentItemImg}
                              alt={item.title?.id || `Item ${itemIdx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (defaultItemImg) (e.target as HTMLImageElement).src = defaultItemImg
                              }}
                            />
                          </div>

                          <div className="flex-1 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => itemFileInputRefs.current[itemIdx]?.click()}
                              disabled={uploadingTarget === itemTargetKey}
                              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {uploadingTarget === itemTargetKey ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                                  <span>Mengunggah...</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Unggah Gambar Item</span>
                                </>
                              )}
                            </button>

                            {item.media && (
                              <button
                                type="button"
                                onClick={() => handleResetItemImage(itemIdx)}
                                className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Hapus gambar kustom item"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Reset Default</span>
                              </button>
                            )}

                            <span className="text-[10px] text-slate-400">
                              {item.media?.width && item.media?.height
                                ? `${item.media.width} × ${item.media.height} px`
                                : 'WebP, JPG, PNG'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
