import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarCheck2,
  Camera,
  Check,
  ClipboardCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Gift,
  ImageIcon,
  Layers,
  Link as LinkIcon,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useAuth } from '../../features/auth/auth-context'
import { uploadLandingImage } from '../../features/content/service'
import {
  buildMergedHeroSlideItems,
  getDefaultHeroSlideItems,
  HERO_SLIDE_LAYOUT_LABELS,
  resolveHeroSlides,
} from '../../features/content/hero-slides'
import { renderDualColorHeading } from '../../components/landing/HomepageHero'
import { HeroSlideVisual } from '../../components/landing/HeroSlideVisual'

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
    defaultImage: '/media/landing/hero-slide-1.jpg',
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
          reference: 'media/landing/hero-slide-1.jpg',
          width: 3072,
          height: 4096,
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
  const [heroSubSection, setHeroSubSection] = useState<'slides' | 'campaigns' | 'metrics'>('slides')
  const [heroPreviewSlide, setHeroPreviewSlide] = useState<number>(0)

  // Upload state
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

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

  const getMergedHeroSlideItems = () => {
    return buildMergedHeroSlideItems(activeSection?.key === 'hero' ? (activeSection as any) : null)
  }

  const getHeroSlideItem = (index: number) => {
    return getMergedHeroSlideItems()[index] || getMergedHeroSlideItems()[0]
  }

  const updateHeroSlideField = (
    slideIndex: number,
    field: 'tag' | 'tabLabel' | 'headline' | 'description' | 'location' | 'note' | 'primaryCta' | 'secondaryCta',
    lang: 'id' | 'en',
    value: string
  ) => {
    const slideItems = getMergedHeroSlideItems()
    slideItems[slideIndex] = {
      ...slideItems[slideIndex],
      [field]: {
        ...((slideItems[slideIndex] as any)[field] || { id: '', en: '' }),
        [lang]: value,
      },
    }

    const newSections = [...content.sections]
    const updatedHero: any = {
      ...activeSection,
      slideItems,
    }

    // Keep base section properties synced when Slide 1 is edited
    if (slideIndex === 0) {
      if (field === 'headline') updatedHero.headline = slideItems[0].headline
      if (field === 'description') updatedHero.description = slideItems[0].description
      if (field === 'primaryCta') updatedHero.primaryCta = slideItems[0].primaryCta
      if (field === 'secondaryCta') updatedHero.secondaryCta = slideItems[0].secondaryCta
    }

    newSections[activeSectionIndex] = updatedHero
    setContent({ ...content, sections: newSections })
  }

  const updateHeroSlideUrl = (
    slideIndex: number,
    field: 'primaryCtaUrl' | 'secondaryCtaUrl',
    value: string
  ) => {
    const slideItems = getMergedHeroSlideItems()
    slideItems[slideIndex] = {
      ...slideItems[slideIndex],
      [field]: value,
    }

    const newSections = [...content.sections]
    const updatedHero: any = {
      ...activeSection,
      slideItems,
    }

    if (slideIndex === 0) {
      if (field === 'primaryCtaUrl') updatedHero.primaryCtaUrl = value
      if (field === 'secondaryCtaUrl') updatedHero.secondaryCtaUrl = value
    }

    newSections[activeSectionIndex] = updatedHero
    setContent({ ...content, sections: newSections })
  }

  const updateHeroSlideVisible = (slideIndex: number, nextVisible: boolean) => {
    const slideItems = getMergedHeroSlideItems()
    const visibleCount = slideItems.filter((item) => item.visible !== false).length
    if (!nextVisible && visibleCount <= 1 && slideItems[slideIndex]?.visible !== false) {
      setMessage({ type: 'error', text: 'Minimal harus ada 1 slide hero yang aktif.' })
      return
    }
    slideItems[slideIndex] = {
      ...slideItems[slideIndex],
      visible: nextVisible,
    }
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      slideItems,
    } as any
    setContent({ ...content, sections: newSections })
  }

  const resetHeroSlidesToDefault = () => {
    const defaults = getDefaultHeroSlideItems()
    const newSections = [...content.sections]
    const updatedHero: any = {
      ...activeSection,
      headline: defaults[0].headline,
      description: defaults[0].description,
      primaryCta: defaults[0].primaryCta,
      primaryCtaUrl: defaults[0].primaryCtaUrl,
      secondaryCta: defaults[0].secondaryCta,
      secondaryCtaUrl: defaults[0].secondaryCtaUrl,
      slideItems: defaults,
    }
    delete updatedHero.media
    newSections[activeSectionIndex] = updatedHero
    setContent({ ...content, sections: newSections })
    setMessage({ type: 'success', text: '5 Slide Hero berhasil dikembalikan ke preset attentive_hero_v3!' })
  }

  const getDefaultHeroCampaigns = () => ({
    visible: true,
    showFloatingDock: true,
    eyebrow: { id: 'Program & Layanan Unggulan', en: 'Featured Campaigns & Portals' },
    description: {
      id: 'Jelajahi inisiatif khusus dan portal layanan kami — mulai dari sesi konsultasi gratis hingga reservasi jadwal psikolog langsung.',
      en: 'Explore our dedicated initiatives and specialized portals — from a free first session to direct psychologist scheduling.',
    },
    cards: [
      {
        id: 'card-free-session',
        visible: true,
        theme: 'gold',
        icon: 'gift',
        badge: { id: 'Promo Khusus', en: 'Limited Offer' },
        title: { id: 'First Free Session Consultation', en: 'First Free Session Consultation' },
        description: {
          id: 'Klaim sesi privat 1-on-1 tanpa biaya untuk langkah awalmu.',
          en: 'Claim a private 1-on-1 session at no cost to begin your journey.',
        },
        cta: { id: 'Klaim Sesi Gratis', en: 'Claim Free Session' },
        url: 'https://free-session.attentiveid.com',
      },
      {
        id: 'card-booking',
        visible: true,
        theme: 'navy',
        icon: 'calendar',
        badge: { id: 'Jadwal Langsung', en: 'Direct Booking' },
        title: { id: 'Booking / Reservasi Psikolog', en: 'Booking / Reserve Psychologist' },
        description: {
          id: 'Pilih psikolog dan tentukan jadwal sesi online atau klinik.',
          en: 'Select your psychologist and choose an online or in-person slot.',
        },
        cta: { id: 'Reservasi Jadwal', en: 'Book a Session' },
        url: 'https://booking.attentiveid.com/',
      },
    ],
  })

  const getHeroCampaigns = () => {
    const existing = (activeSection as any)?.campaigns
    if (existing) {
      return {
        visible: existing.visible !== false,
        showFloatingDock: existing.showFloatingDock !== false,
        eyebrow: existing.eyebrow || { id: 'Program & Layanan Unggulan', en: 'Featured Campaigns & Portals' },
        description: existing.description || {
          id: 'Jelajahi inisiatif khusus dan portal layanan kami — mulai dari sesi konsultasi gratis hingga reservasi jadwal psikolog langsung.',
          en: 'Explore our dedicated initiatives and specialized portals — from a free first session to direct psychologist scheduling.',
        },
        cards: Array.isArray(existing.cards)
          ? existing.cards.filter((c: any) => !String(c?.url || '').includes('assessment.attentiveid.com'))
          : [],
      }
    }
    return getDefaultHeroCampaigns()
  }

  const updateHeroCampaignToggle = (field: 'visible' | 'showFloatingDock', value: boolean) => {
    const currentCampaigns = getHeroCampaigns()
    const updated = {
      ...currentCampaigns,
      [field]: value,
    }
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      campaigns: updated,
    }
    setContent({ ...content, sections: newSections })
  }

  const updateHeroCampaignHeader = (field: 'eyebrow' | 'description', lang: 'id' | 'en', value: string) => {
    const currentCampaigns = getHeroCampaigns()
    const updated = {
      ...currentCampaigns,
      [field]: {
        ...(currentCampaigns[field] || {}),
        [lang]: value,
      },
    }
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      campaigns: updated,
    }
    setContent({ ...content, sections: newSections })
  }

  const updateHeroCampaignCard = (
    cardIdx: number,
    field: 'badge' | 'title' | 'description' | 'cta' | 'url',
    langOrVal: 'id' | 'en' | string,
    value?: string
  ) => {
    const currentCampaigns = getHeroCampaigns()
    const cards = [...(currentCampaigns.cards || [])]
    const card = { ...(cards[cardIdx] || {}) }

    if (field === 'url') {
      card.url = langOrVal as string
    } else {
      card[field] = {
        ...(card[field] || {}),
        [langOrVal as 'id' | 'en']: value || '',
      }
    }

    cards[cardIdx] = card
    const updated = {
      ...currentCampaigns,
      cards,
    }
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      campaigns: updated,
    }
    setContent({ ...content, sections: newSections })
  }

  const updateHeroCampaignCardMeta = (
    cardIdx: number,
    field: 'visible' | 'theme' | 'icon',
    value: boolean | string
  ) => {
    const currentCampaigns = getHeroCampaigns()
    const cards = [...(currentCampaigns.cards || [])]
    cards[cardIdx] = {
      ...(cards[cardIdx] || {}),
      [field]: value,
    }
    const updated = {
      ...currentCampaigns,
      cards,
    }
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      campaigns: updated,
    }
    setContent({ ...content, sections: newSections })
  }

  const addHeroCampaignCard = () => {
    const currentCampaigns = getHeroCampaigns()
    const cards = [...(currentCampaigns.cards || [])]
    if (cards.length >= 6) return
    const nextNum = cards.length + 1
    const defaultThemes = ['gold', 'navy', 'blue', 'emerald']
    const defaultIcons = ['gift', 'calendar', 'clipboard', 'sparkles']
    cards.push({
      id: `campaign-card-${Date.now()}`,
      visible: true,
      theme: defaultThemes[(nextNum - 1) % defaultThemes.length],
      icon: defaultIcons[(nextNum - 1) % defaultIcons.length],
      badge: { id: `Program #${nextNum}`, en: `Initiative #${nextNum}` },
      title: { id: `Judul Portal / Campaign #${nextNum}`, en: `Portal / Campaign Title #${nextNum}` },
      description: {
        id: 'Deskripsi singkat program atau portal layanan baru.',
        en: 'Short description for this featured campaign or care portal.',
      },
      cta: { id: 'Pelajari Selengkapnya', en: 'Learn More' },
      url: 'https://booking.attentiveid.com/',
    })
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      campaigns: {
        ...currentCampaigns,
        visible: true,
        cards,
      },
    }
    setContent({ ...content, sections: newSections })
  }

  const deleteHeroCampaignCard = (cardIdx: number) => {
    const currentCampaigns = getHeroCampaigns()
    const cards = (currentCampaigns.cards || []).filter((_: any, idx: number) => idx !== cardIdx)
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      campaigns: {
        ...currentCampaigns,
        cards,
      },
    }
    setContent({ ...content, sections: newSections })
  }

  const moveHeroCampaignCard = (cardIdx: number, direction: 'up' | 'down') => {
    const currentCampaigns = getHeroCampaigns()
    const cards = [...(currentCampaigns.cards || [])]
    const targetIdx = direction === 'up' ? cardIdx - 1 : cardIdx + 1
    if (targetIdx < 0 || targetIdx >= cards.length) return
    const temp = cards[cardIdx]
    cards[cardIdx] = cards[targetIdx]
    cards[targetIdx] = temp
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      campaigns: {
        ...currentCampaigns,
        cards,
      },
    }
    setContent({ ...content, sections: newSections })
  }

  const resetHeroCampaignsToDefault = () => {
    const newSections = [...content.sections]
    newSections[activeSectionIndex] = {
      ...activeSection,
      campaigns: getDefaultHeroCampaigns(),
    }
    setContent({ ...content, sections: newSections })
    setMessage({
      type: 'success',
      text: '3 Kartu Featured Campaigns & Portals resmi berhasil dipulihkan!',
    })
  }

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
    : (sectionImageMeta?.defaultImage || '/media/landing/hero-slide-1.jpg')

  const handleSlidePhotoUpload = async (slideIndex: number, file: File) => {
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
            altId: `Foto Slide ${slideIndex + 1}`,
            altEn: `Hero Slide ${slideIndex + 1}`,
            width,
            height,
          },
          { headers: getAuthHeaders() }
        )

        const slideItems = getMergedHeroSlideItems()

        slideItems[slideIndex] = {
          ...slideItems[slideIndex],
          media: res.media,
        }

        const newSections = [...content.sections]
        const updatedHero: any = {
          ...activeSection,
          slideItems,
        }

        if (slideIndex === 0) {
          updatedHero.media = res.media
          updatedHero.slides = [res.media]
        }

        newSections[activeSectionIndex] = updatedHero
        setContent({ ...content, sections: newSections })
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

  const handleResetSlidePhoto = (slideIndex: number) => {
    const slideItems = getMergedHeroSlideItems()
    const updatedSlide = { ...slideItems[slideIndex] }
    delete updatedSlide.media
    slideItems[slideIndex] = updatedSlide

    const newSections = [...content.sections]
    const updatedHero: any = {
      ...activeSection,
      slideItems,
    }

    if (slideIndex === 0) {
      delete updatedHero.media
    }

    newSections[activeSectionIndex] = updatedHero
    setContent({ ...content, sections: newSections })
    setUploadSuccess(`Foto Slide #${slideIndex + 1} dikembalikan ke default bawaan.`)
  }

  const heroCampaigns = getHeroCampaigns()
  const heroSlides = getMergedHeroSlideItems()
  const visibleHeroSlideCount = heroSlides.filter((s) => s.visible !== false).length
  const safeHeroSlideIndex = Math.min(heroPreviewSlide, Math.max(heroSlides.length - 1, 0))
  const activeHeroSlideItem = getHeroSlideItem(safeHeroSlideIndex)
  const simulatorSlides = resolveHeroSlides(
    activeSection?.key === 'hero' ? (activeSection as any) : null,
    languageView === 'en' ? 'en' : 'id'
  )
  const activeSimSlide = simulatorSlides[safeHeroSlideIndex] || simulatorSlides[0]

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
              <div key={sec.key} className="space-y-1">
                <button
                  type="button"
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

                {/* Hero Sub-Sections Navigation in Sidebar */}
                {sec.key === 'hero' && activeSectionIndex === idx && (
                  <div className="ml-5 pl-2.5 border-l-2 border-amber-300 space-y-1 py-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setHeroSubSection('slides')
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                        heroSubSection === 'slides'
                          ? 'bg-amber-100 text-amber-950 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="size-3 text-amber-600 shrink-0" />
                      <span className="truncate">1. Highlight Card ({visibleHeroSlideCount}/{heroSlides.length} Slide)</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setHeroSubSection('campaigns')
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                        heroSubSection === 'campaigns'
                          ? 'bg-amber-100 text-amber-950 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Gift className="size-3 text-amber-600 shrink-0" />
                      <span className="truncate">
                        2. Program Unggulan (
                        {heroCampaigns.visible === false
                          ? 'Hidden'
                          : `${heroCampaigns.cards.filter((c: any) => c.visible !== false).length}/${heroCampaigns.cards.length} Kartu`}
                        )
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setHeroSubSection('metrics')
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                        heroSubSection === 'metrics'
                          ? 'bg-amber-100 text-amber-950 font-bold shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Layers className="size-3 text-amber-600 shrink-0" />
                      <span className="truncate">3. Trust Metrics (4 Item)</span>
                    </button>
                  </div>
                )}
              </div>
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

          {/* --- HERO ONLY: Live Hero Highlight Card Simulator & Showcase --- */}
          {activeSection?.key === 'hero' && (
            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl border border-slate-700 text-white space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30 shrink-0">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold tracking-tight text-white">Hero Highlight Card (Live Simulator)</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full">
                          Editorial Format · {visibleHeroSlideCount}/{heroSlides.length} Slides
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Format carousel editorial v3 (01 Our practice .. 05 Meet Ella) dengan visual arsitektural, tab progress 7s, &amp; mode bilingual.
                      </p>
                    </div>
                  </div>

                  {/* Slide Toggle Controls (5 Slides) */}
                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                    {simulatorSlides.map((simSlide, sIdx) => (
                      <button
                        key={simSlide.id}
                        type="button"
                        onClick={() => setHeroPreviewSlide(sIdx)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          safeHeroSlideIndex === sIdx
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : simSlide.visible
                            ? 'bg-white/10 text-slate-200 hover:bg-white/20'
                            : 'bg-white/5 text-slate-400 line-through hover:bg-white/15'
                        }`}
                      >
                        <span>0{sIdx + 1}</span>
                        <span className="hidden xl:inline">{simSlide.tabLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Embedded Editorial Card Simulator */}
                <div className="rounded-2xl border border-secondary/20 bg-[#FAF8F3] p-4 text-slate-900 sm:p-5">
                  <div
                    className={`relative overflow-hidden rounded-2xl border bg-[#F5EFE5] shadow-sm transition-all ${
                      heroSubSection === 'slides'
                        ? 'border-amber-400/90 ring-2 ring-amber-400/50'
                        : 'border-secondary/15'
                    }`}
                  >
                    {!activeSimSlide.visible && (
                      <div className="bg-slate-900/90 text-amber-300 text-[10px] font-bold px-3 py-1.5 flex items-center justify-between">
                        <span>SLIDE INI SEDANG DISEMBUNYIKAN DI HALAMAN PUBLIK</span>
                        <span>(Hanya tampil di simulator)</span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 items-stretch lg:grid-cols-[46%_54%]">
                      <div className="p-5 sm:p-6 flex flex-col justify-center">
                        <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] uppercase text-[#C08A2C]">
                          <span className="size-1.5 rounded-full bg-[#E2AE52]" />
                          {activeSimSlide.tag}
                        </span>

                        <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl lg:leading-[1.1]">
                          {renderDualColorHeading(activeSimSlide.headline)}
                        </h2>

                        <p className="mt-2.5 text-xs leading-relaxed text-[#4A566B] line-clamp-3">
                          {activeSimSlide.description}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-bold shadow-xs ${
                              activeSimSlide.primaryCtaUrl.trim()
                                ? 'bg-[#14284B] text-white'
                                : 'bg-[#14284B]/60 text-white/80'
                            }`}
                          >
                            <span>{activeSimSlide.primaryCta}</span>
                            {!activeSimSlide.primaryCtaUrl.trim() && (
                              <span className="rounded bg-white/15 px-1 text-[9px] text-amber-300">Soon</span>
                            )}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              activeSimSlide.secondaryCtaUrl.trim() ? 'text-[#1D3560]' : 'text-slate-400'
                            }`}
                          >
                            {activeSimSlide.secondaryCta} →
                          </span>
                        </div>
                      </div>

                      <HeroSlideVisual
                        slide={activeSimSlide}
                        isId={languageView !== 'en'}
                        isActive
                        compact
                      />
                    </div>
                  </div>

                  {/* Simulator 5-Tab Progress Strip */}
                  <div className="mt-3 grid grid-cols-5 gap-2.5 pt-1">
                    {simulatorSlides.map((simSlide, sIdx) => (
                      <button
                        key={simSlide.id}
                        type="button"
                        onClick={() => setHeroPreviewSlide(sIdx)}
                        className="text-left cursor-pointer"
                      >
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold truncate">
                          <span className={safeHeroSlideIndex === sIdx ? 'text-[#C08A2C]' : 'text-slate-400'}>
                            0{sIdx + 1}
                          </span>
                          <span className={safeHeroSlideIndex === sIdx ? 'text-[#14284B]' : 'text-slate-500'}>
                            {simSlide.tabLabel}
                          </span>
                        </div>
                        <div className="h-[2.5px] rounded-full bg-[#E1DDD5] overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              safeHeroSlideIndex === sIdx
                                ? 'w-1/2 bg-[#C08A2C]'
                                : sIdx < safeHeroSlideIndex
                                ? 'w-full bg-[#D6C7A8]'
                                : 'w-0'
                            }`}
                          />
                        </div>
                      </button>
                    ))}
                  </div>

                {/* Minimalist Trust Ticker Ribbon in simulator */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-y border-secondary/10 py-2.5 text-center text-[10px] font-bold tracking-wide text-secondary/70">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#C27803]">✻</span>
                    <span>Thoughtful psychological support</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#C27803]">✻</span>
                    <span>Space to feel understood</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#C27803]">✻</span>
                    <span>Care at your own pace</span>
                  </div>
                </div>

                {/* Sub-Hero Command Strip (Program & Layanan Unggulan) in Simulator */}
                <div
                  className={`mt-4 rounded-xl border p-4 transition-all ${
                    heroSubSection === 'campaigns'
                      ? 'border-amber-400/90 bg-amber-50/30 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-secondary/10 bg-white/70'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-secondary/10">
                    <div className="flex items-center gap-1.5">
                      <span className="grid size-5 place-items-center rounded-full bg-amber-100 text-[#8C6013]">
                        <Sparkles size={11} />
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                        {(languageView === 'en' ? heroCampaigns.eyebrow?.en : heroCampaigns.eyebrow?.id) ||
                          heroCampaigns.eyebrow?.id ||
                          'Featured Campaigns & Portals'}
                      </span>
                    </div>
                    <span className="text-[10px] text-secondary/60">
                      {heroCampaigns.visible === false
                        ? 'Section Disembunyikan'
                        : `${heroCampaigns.cards.filter((c: any) => c.visible !== false).length} Aktif / ${heroCampaigns.cards.length} Total`}
                    </span>
                  </div>
                  {heroCampaigns.visible === false ||
                  heroCampaigns.cards.filter((c: any) => c.visible !== false).length === 0 ? (
                    <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 p-3 text-center text-[11px] font-medium text-slate-500">
                      Featured Campaigns &amp; Portals saat ini disembunyikan dari halaman publik (0 kartu aktif atau toggle nonaktif).
                    </div>
                  ) : (
                    <div
                      className={`mt-3 grid grid-cols-1 gap-2.5 ${
                        heroCampaigns.cards.filter((c: any) => c.visible !== false).length === 1
                          ? 'sm:grid-cols-1'
                          : heroCampaigns.cards.filter((c: any) => c.visible !== false).length === 2
                          ? 'sm:grid-cols-2'
                          : 'sm:grid-cols-3'
                      }`}
                    >
                      {heroCampaigns.cards
                        .filter((c: any) => c.visible !== false)
                        .map((c: any, cIdx: number) => {
                          const theme = c.theme || (cIdx === 0 ? 'gold' : cIdx === 1 ? 'navy' : 'blue')
                          return (
                            <div
                              key={c.id || cIdx}
                              className={`p-3 rounded-lg border shadow-2xs transition-all ${
                                theme === 'gold'
                                  ? 'bg-gradient-to-b from-white to-[#FDF8EE] border-amber-300/60'
                                  : 'bg-white border-secondary/15'
                              }`}
                            >
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  theme === 'gold'
                                    ? 'bg-amber-100 text-[#8C6013]'
                                    : theme === 'navy'
                                    ? 'bg-secondary/10 text-secondary'
                                    : theme === 'emerald'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-[#EBF3FB] text-[#1E568A]'
                                }`}
                              >
                                {(languageView === 'en' ? c.badge?.en : c.badge?.id) || c.badge?.id}
                              </span>
                              <h4 className="mt-1 text-xs font-bold text-secondary">
                                {(languageView === 'en' ? c.title?.en : c.title?.id) || c.title?.id}
                              </h4>
                              <p className="mt-0.5 text-[10px] text-secondary/70 line-clamp-2">
                                {(languageView === 'en' ? c.description?.en : c.description?.id) || c.description?.id}
                              </p>
                              <span
                                className={`mt-2 block text-[10px] font-bold ${
                                  theme === 'gold'
                                    ? 'text-[#8C6013]'
                                    : theme === 'navy'
                                    ? 'text-secondary'
                                    : theme === 'emerald'
                                    ? 'text-emerald-700'
                                    : 'text-[#1E568A]'
                                }`}
                              >
                                {(languageView === 'en' ? c.cta?.en : c.cta?.id) || c.cta?.id}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>

                {/* 4 Trust Counter Metrics in Simulator */}
                <div
                  className={`mt-4 grid grid-cols-2 sm:grid-cols-4 rounded-xl p-3 text-center border shadow-2xs transition-all ${
                    heroSubSection === 'metrics'
                      ? 'border-amber-400/90 bg-amber-50/30 ring-2 ring-amber-400/50 shadow-md'
                      : 'border-secondary/10 bg-white/90'
                  }`}
                >
                  {(activeSection.items || []).map((item, idx) => (
                    <div key={idx} className="p-2 border-r border-secondary/10 last:border-r-0">
                      <div className="text-base sm:text-lg font-extrabold text-secondary">
                        {(languageView === 'en' ? item.description?.en : item.description?.id) || item.description?.id || '—'}
                      </div>
                      <div className="text-[9px] font-bold uppercase text-secondary/70 tracking-wider">
                        {(languageView === 'en' ? item.title?.en : item.title?.id) || item.title?.id || 'Metrik'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION EDITOR:
              BRANCH 1: HERO (Dedicated 3-Sub-Section Editor)
              BRANCH 2: OTHER SECTIONS (Standard Section Form)
             ======================================================== */}
          {activeSection?.key === 'hero' ? (
            <div className="space-y-5">
              {/* --- Hero Sub-Section Pill Navigation --- */}
              <div className="p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 flex flex-wrap items-center gap-1.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setHeroSubSection('slides')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    heroSubSection === 'slides'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>🌟</span>
                  <span>
                    1. Highlight Card ({visibleHeroSlideCount}/{heroSlides.length} Slide)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHeroSubSection('campaigns')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    heroSubSection === 'campaigns'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>⚡</span>
                  <span>
                    2. Program &amp; Layanan Unggulan (
                    {heroCampaigns.visible === false
                      ? 'Hidden'
                      : `${heroCampaigns.cards.filter((c: any) => c.visible !== false).length}/${heroCampaigns.cards.length} Card`}
                    )
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHeroSubSection('metrics')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    heroSubSection === 'metrics'
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>📊</span>
                  <span>3. Trust Metrics Counter Bar (4 Item)</span>
                </button>
              </div>

              {/* ====================================================
                  SUB-SECTION 1: HERO HIGHLIGHT CARD (5 SLIDES)
                 ==================================================== */}
              {heroSubSection === 'slides' && (
                <div className="space-y-4">
                  {/* Slide Selector Tabs */}
                  <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-xs">
                            🌟
                          </span>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Pilih Slide Hero untuk Diedit ({visibleHeroSlideCount}/{heroSlides.length} Aktif)
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Setiap slide bisa diedit teks, tombol CTA, foto utama, maupun disembunyikan dari beranda.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={resetHeroSlidesToDefault}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white border border-amber-200 hover:bg-amber-50 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                        title="Kembalikan seluruh 5 slide hero ke preset default attentive_hero_v3"
                      >
                        <RotateCcw className="size-3.5 text-[#C27803]" />
                        <span>Reset 5 Slide Default</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {heroSlides.map((slideItem, slideIdx) => {
                        const isActiveSlide = safeHeroSlideIndex === slideIdx
                        const isVisibleSlide = slideItem.visible !== false
                        const shortLabel =
                          slideItem.tabLabel?.[languageView === 'en' ? 'en' : 'id'] ||
                          slideItem.tag?.[languageView === 'en' ? 'en' : 'id'] ||
                          `Slide ${slideIdx + 1}`

                        return (
                          <button
                            key={slideItem.id || `hero-slide-tab-${slideIdx}`}
                            type="button"
                            onClick={() => setHeroPreviewSlide(slideIdx)}
                            className={`px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer border ${
                              isActiveSlide
                                ? 'bg-[#132B3A] text-white border-[#132B3A] shadow-xs ring-2 ring-amber-400'
                                : isVisibleSlide
                                  ? 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                                  : 'bg-slate-100/80 text-slate-400 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider">
                              <span>{String(slideIdx + 1).padStart(2, '0')}</span>
                              <span
                                className={`inline-block size-1.5 rounded-full ${
                                  isVisibleSlide ? 'bg-emerald-400' : 'bg-slate-400'
                                }`}
                                title={isVisibleSlide ? 'Tampil di Beranda' : 'Disembunyikan'}
                              />
                            </div>
                            <div className="text-[11px] font-semibold truncate mt-0.5">
                              {shortLabel}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Unified Slide Editor Form */}
                  <div className="space-y-4">
                    {/* Visibility & Layout Header */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-extrabold text-[#9A5D02]">
                          SLIDE {String(safeHeroSlideIndex + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {HERO_SLIDE_LAYOUT_LABELS[activeHeroSlideItem.layout || 'practice']}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Tab: {activeHeroSlideItem.tabLabel?.id || activeHeroSlideItem.tag?.id}
                          </div>
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={activeHeroSlideItem.visible !== false}
                          onChange={(e) => updateHeroSlideVisible(safeHeroSlideIndex, e.target.checked)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span>
                          {activeHeroSlideItem.visible !== false ? 'Tampilkan di Beranda' : 'Disembunyikan'}
                        </span>
                      </label>
                    </div>

                    {/* Photo Manager Card */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Camera className="size-4 text-teal-600" />
                          <span>Foto Utama Slide {safeHeroSlideIndex + 1}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {HERO_SLIDE_LAYOUT_LABELS[activeHeroSlideItem.layout || 'practice']}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-4">
                          <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shadow-2xs">
                            <img
                              src={activeSimSlide?.imageSrc || '/media/landing/hero-slide-1.jpg'}
                              alt={`Slide ${safeHeroSlideIndex + 1} Preview`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-8 space-y-2">
                          <input
                            id={`hero-slide-${safeHeroSlideIndex}-input`}
                            type="file"
                            accept="image/webp,image/png,image/jpeg"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleSlidePhotoUpload(safeHeroSlideIndex, e.target.files[0])
                              }
                            }}
                          />

                          <div className="flex flex-wrap items-center gap-2">
                            <label
                              htmlFor={`hero-slide-${safeHeroSlideIndex}-input`}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border shadow-2xs transition-colors ${
                                uploadingTarget === `hero-slide-${safeHeroSlideIndex}`
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 pointer-events-none'
                                  : 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600'
                              }`}
                            >
                              {uploadingTarget === `hero-slide-${safeHeroSlideIndex}` ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin" />
                                  <span>Mengunggah Foto...</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="size-3.5" />
                                  <span>Unggah Foto Pengganti</span>
                                </>
                              )}
                            </label>

                            {(activeHeroSlideItem.media || (safeHeroSlideIndex === 0 && activeSection.media)) && (
                              <button
                                type="button"
                                onClick={() => handleResetSlidePhoto(safeHeroSlideIndex)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                                title="Kembalikan ke foto bawaan preset v3"
                              >
                                <RotateCcw className="size-3.5 text-slate-400" />
                                <span>Reset ke Foto Bawaan</span>
                              </button>
                            )}
                          </div>

                          <p className="text-[10px] text-slate-400">
                            Format: WebP, PNG, JPG (Maks 5 MB) • Rasio disarankan 4:3 atau 16:10
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Copy Inputs for Active Slide */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                      {/* Tab Label */}
                      <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                        {(languageView === 'both' || languageView === 'id') && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">Label Tab Progress Bawah (ID)</label>
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                            </div>
                            <input
                              type="text"
                              value={activeHeroSlideItem.tabLabel?.id || ''}
                              onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'tabLabel', 'id', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                        {(languageView === 'both' || languageView === 'en') && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">Bottom Tab Label (EN)</label>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                            </div>
                            <input
                              type="text"
                              value={activeHeroSlideItem.tabLabel?.en || ''}
                              onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'tabLabel', 'en', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Tag / Eyebrow */}
                      <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                        {(languageView === 'both' || languageView === 'id') && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">Eyebrow / Tag Slide (ID)</label>
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                            </div>
                            <input
                              type="text"
                              value={activeHeroSlideItem.tag?.id || ''}
                              onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'tag', 'id', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                        {(languageView === 'both' || languageView === 'en') && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">Eyebrow / Tag Slide (EN)</label>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                            </div>
                            <input
                              type="text"
                              value={activeHeroSlideItem.tag?.en || ''}
                              onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'tag', 'en', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Headline */}
                      <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                        {(languageView === 'both' || languageView === 'id') && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Headline Slide {safeHeroSlideIndex + 1} (ID)
                              </label>
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                            </div>
                            <input
                              type="text"
                              value={activeHeroSlideItem.headline?.id || ''}
                              onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'headline', 'id', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                        {(languageView === 'both' || languageView === 'en') && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Headline Slide {safeHeroSlideIndex + 1} (EN)
                              </label>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                            </div>
                            <input
                              type="text"
                              value={activeHeroSlideItem.headline?.en || ''}
                              onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'headline', 'en', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Tip 2 Warna Trademark */}
                      <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                        <Sparkles className="size-4 text-[#C27803] shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-[#C27803]">Tip Gaya Tipografi 2 Warna (Trademark):</span>
                          <p className="text-slate-700 leading-relaxed">
                            Gunakan tanda <code className="font-bold bg-amber-100 text-amber-900 px-1 py-0.5 rounded border border-amber-300/60">**kata emas**</code> pada kata yang ingin berwarna emas Attentive (<span className="font-bold text-[#C27803]">#C27803</span>). Kata lainnya berwarna Navy Blue (<span className="font-bold text-[#132B3A]">#132B3A</span>).
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                        {(languageView === 'both' || languageView === 'id') && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Deskripsi Slide {safeHeroSlideIndex + 1} (ID)
                              </label>
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">ID</span>
                            </div>
                            <textarea
                              rows={3}
                              value={activeHeroSlideItem.description?.id || ''}
                              onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'description', 'id', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                        {(languageView === 'both' || languageView === 'en') && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-semibold text-slate-700">
                                Deskripsi Slide {safeHeroSlideIndex + 1} (EN)
                              </label>
                              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">EN</span>
                            </div>
                            <textarea
                              rows={3}
                              value={activeHeroSlideItem.description?.en || ''}
                              onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'description', 'en', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Optional Location (Slide 01) or Allergy Note (Slide 02) */}
                      {(activeHeroSlideItem.layout === 'practice' || activeHeroSlideItem.location) && (
                        <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                          {(languageView === 'both' || languageView === 'id') && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Info Lokasi / Jam Layanan (ID)
                              </label>
                              <input
                                type="text"
                                value={activeHeroSlideItem.location?.id || ''}
                                onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'location', 'id', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          )}
                          {(languageView === 'both' || languageView === 'en') && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Location / Hours Note (EN)
                              </label>
                              <input
                                type="text"
                                value={activeHeroSlideItem.location?.en || ''}
                                onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'location', 'en', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {(activeHeroSlideItem.layout === 'pet-garden' || activeHeroSlideItem.note) && (
                        <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                          {(languageView === 'both' || languageView === 'id') && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Catatan Kenyamanan / Alergi (ID)
                              </label>
                              <input
                                type="text"
                                value={activeHeroSlideItem.note?.id || ''}
                                onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'note', 'id', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          )}
                          {(languageView === 'both' || languageView === 'en') && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Pet Policy / Comfort Note (EN)
                              </label>
                              <input
                                type="text"
                                value={activeHeroSlideItem.note?.en || ''}
                                onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'note', 'en', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* CTA Buttons & Target URLs */}
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Tombol CTA &amp; Target URL Slide {safeHeroSlideIndex + 1}
                          </h5>
                          <span className="text-[11px] text-slate-500">
                            Kosongkan URL untuk menampilkan tombol sebagai &ldquo;Soon / Segera&rdquo; (tidak bisa diklik).
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Primary Button */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-800">
                              Tombol Utama (Primary CTA)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Label (ID)"
                                value={activeHeroSlideItem.primaryCta?.id || ''}
                                onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'primaryCta', 'id', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                              <input
                                type="text"
                                placeholder="Label (EN)"
                                value={activeHeroSlideItem.primaryCta?.en || ''}
                                onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'primaryCta', 'en', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Target Link / URL
                              </label>
                              <div className="relative">
                                <LinkIcon className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Kosongkan untuk badge Soon, atau /path / https://..."
                                  value={activeHeroSlideItem.primaryCtaUrl ?? ''}
                                  onChange={(e) => updateHeroSlideUrl(safeHeroSlideIndex, 'primaryCtaUrl', e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Secondary Button */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <label className="block text-xs font-bold text-slate-800">
                              Tombol Sekunder (Secondary CTA)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Label (ID)"
                                value={activeHeroSlideItem.secondaryCta?.id || ''}
                                onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'secondaryCta', 'id', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                              <input
                                type="text"
                                placeholder="Label (EN)"
                                value={activeHeroSlideItem.secondaryCta?.en || ''}
                                onChange={(e) => updateHeroSlideField(safeHeroSlideIndex, 'secondaryCta', 'en', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Target Link / URL
                              </label>
                              <div className="relative">
                                <LinkIcon className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="#locations, /articles, atau https://..."
                                  value={activeHeroSlideItem.secondaryCtaUrl ?? ''}
                                  onChange={(e) => updateHeroSlideUrl(safeHeroSlideIndex, 'secondaryCtaUrl', e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================
                  SUB-SECTION 2: PROGRAM & LAYANAN UNGGULAN
                 ==================================================== */}
              {heroSubSection === 'campaigns' && (
                <div className="space-y-4">
                  {/* Info Banner & Global Controls */}
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4 text-[#8C6013]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Editor Featured Campaigns &amp; Portals
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Kelola kartu portal cepat di bawah Hero: ubah teks &amp; link, atur urutan, ganti warna tema/ikon, sembunyikan kartu tertentu, atau hapus kartu.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={addHeroCampaignCard}
                          disabled={heroCampaigns.cards.length >= 6}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Plus className="size-3.5" />
                          <span>Tambah Kartu ({heroCampaigns.cards.length}/6)</span>
                        </button>
                        <button
                          type="button"
                          onClick={resetHeroCampaignsToDefault}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>

                    {/* Section-Level Visibility Toggles */}
                    <div className="pt-3 border-t border-amber-200/70 flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={heroCampaigns.visible !== false}
                          onChange={(e) => updateHeroCampaignToggle('visible', e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Tampilkan Strip Featured Campaigns &amp; Portals di Beranda</span>
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={heroCampaigns.showFloatingDock !== false}
                          onChange={(e) => updateHeroCampaignToggle('showFloatingDock', e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Tampilkan Floating Quick Bar di Bawah Layar</span>
                      </label>
                    </div>
                  </div>

                  {/* Header & Sub-headline */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
                    <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Judul &amp; Penjelasan Strip Layanan
                    </h5>

                    <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                      {(languageView === 'both' || languageView === 'id') && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Eyebrow / Sub-Judul (ID)
                          </label>
                          <input
                            type="text"
                            value={heroCampaigns.eyebrow?.id || ''}
                            onChange={(e) => updateHeroCampaignHeader('eyebrow', 'id', e.target.value)}
                            placeholder="Cth: Program & Layanan Unggulan"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      )}
                      {(languageView === 'both' || languageView === 'en') && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Eyebrow / Sub-Judul (EN)
                          </label>
                          <input
                            type="text"
                            value={heroCampaigns.eyebrow?.en || ''}
                            onChange={(e) => updateHeroCampaignHeader('eyebrow', 'en', e.target.value)}
                            placeholder="E.g: Featured Campaigns & Portals"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                      {(languageView === 'both' || languageView === 'id') && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Deskripsi Pengantar (ID)
                          </label>
                          <textarea
                            rows={2}
                            value={heroCampaigns.description?.id || ''}
                            onChange={(e) => updateHeroCampaignHeader('description', 'id', e.target.value)}
                            placeholder="Deskripsi singkat layanan unggulan..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      )}
                      {(languageView === 'both' || languageView === 'en') && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Deskripsi Pengantar (EN)
                          </label>
                          <textarea
                            rows={2}
                            value={heroCampaigns.description?.en || ''}
                            onChange={(e) => updateHeroCampaignHeader('description', 'en', e.target.value)}
                            placeholder="Brief description of featured programs..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campaign Cards List */}
                  {heroCampaigns.cards.length === 0 ? (
                    <div className="p-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                      <p className="text-xs font-semibold text-slate-600">
                        Semua kartu Featured Campaigns &amp; Portals telah dihapus. Strip ini otomatis disembunyikan di halaman utama.
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={addHeroCampaignCard}
                          className="px-3.5 py-2 rounded-lg text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus className="size-3.5" />
                          <span>Tambah Kartu Baru</span>
                        </button>
                        <button
                          type="button"
                          onClick={resetHeroCampaignsToDefault}
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                        >
                          Kembalikan Kartu Default
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {heroCampaigns.cards.map((card: any, cIdx: number) => {
                        const isCardVisible = card.visible !== false
                        const cardTheme = card.theme || (cIdx === 0 ? 'gold' : cIdx === 1 ? 'navy' : 'blue')
                        const cardIcon = card.icon || (cIdx === 0 ? 'gift' : cIdx === 1 ? 'calendar' : 'clipboard')

                        const renderIconPreview = () => {
                          if (cardIcon === 'gift') return <Gift className="size-4 text-amber-600" />
                          if (cardIcon === 'calendar') return <CalendarCheck2 className="size-4 text-teal-600" />
                          if (cardIcon === 'clipboard') return <ClipboardCheck className="size-4 text-blue-600" />
                          if (cardIcon === 'shield') return <ShieldCheck className="size-4 text-emerald-600" />
                          if (cardIcon === 'message') return <MessageCircle className="size-4 text-teal-600" />
                          return <Sparkles className="size-4 text-amber-600" />
                        }

                        return (
                          <div
                            key={card.id || cIdx}
                            className={`p-4 rounded-xl border shadow-2xs space-y-3 transition-all ${
                              isCardVisible
                                ? 'bg-white border-slate-200'
                                : 'bg-slate-50/80 border-slate-200/80 opacity-75'
                            }`}
                          >
                            {/* Card Header & Action Toolbar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                {renderIconPreview()}
                                <span className="text-xs font-bold text-slate-900">
                                  Kartu #{cIdx + 1}: {card.title?.id || card.title?.en || `Program ${cIdx + 1}`}
                                </span>
                                {!isCardVisible && (
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                    Disembunyikan
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {/* Theme Select */}
                                <select
                                  aria-label={`Tema Kartu ${cIdx + 1}`}
                                  value={cardTheme}
                                  onChange={(e) => updateHeroCampaignCardMeta(cIdx, 'theme', e.target.value)}
                                  className="px-2 py-1 text-[11px] font-semibold bg-slate-100 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  title="Warna Tema Kartu"
                                >
                                  <option value="gold">Tema: Gold Highlight</option>
                                  <option value="navy">Tema: Navy Formal</option>
                                  <option value="blue">Tema: Blue Clinical</option>
                                  <option value="emerald">Tema: Emerald Calm</option>
                                </select>

                                {/* Icon Select */}
                                <select
                                  aria-label={`Ikon Kartu ${cIdx + 1}`}
                                  value={cardIcon}
                                  onChange={(e) => updateHeroCampaignCardMeta(cIdx, 'icon', e.target.value)}
                                  className="px-2 py-1 text-[11px] font-semibold bg-slate-100 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  title="Ikon Kartu"
                                >
                                  <option value="gift">Ikon: Gift / Promo</option>
                                  <option value="calendar">Ikon: Calendar / Booking</option>
                                  <option value="clipboard">Ikon: Clipboard / Test</option>
                                  <option value="sparkles">Ikon: Sparkles / Unggulan</option>
                                  <option value="shield">Ikon: Shield / Aman</option>
                                  <option value="message">Ikon: Message / Konsultasi</option>
                                </select>

                                {/* Reorder Up / Down */}
                                <button
                                  type="button"
                                  onClick={() => moveHeroCampaignCard(cIdx, 'up')}
                                  disabled={cIdx === 0}
                                  className="p-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                                  title="Geser ke atas"
                                >
                                  <ArrowUp className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveHeroCampaignCard(cIdx, 'down')}
                                  disabled={cIdx === heroCampaigns.cards.length - 1}
                                  className="p-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                                  title="Geser ke bawah"
                                >
                                  <ArrowDown className="size-3.5" />
                                </button>

                                {/* Hide / Show Toggle */}
                                <button
                                  type="button"
                                  onClick={() => updateHeroCampaignCardMeta(cIdx, 'visible', !isCardVisible)}
                                  className={`px-2 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                                    isCardVisible
                                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                  }`}
                                  title={isCardVisible ? 'Sembunyikan kartu ini' : 'Tampilkan kembali kartu ini'}
                                >
                                  {isCardVisible ? (
                                    <>
                                      <Eye className="size-3.5" />
                                      <span>Tampil</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="size-3.5" />
                                      <span>Hidden</span>
                                    </>
                                  )}
                                </button>

                                {/* Delete Card */}
                                <button
                                  type="button"
                                  onClick={() => deleteHeroCampaignCard(cIdx)}
                                  className="px-2 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Hapus kartu ini"
                                >
                                  <Trash2 className="size-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            </div>

                            {/* Badge & Title */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                  Badge / Kategori Tag (ID / EN)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Badge ID"
                                    value={card.badge?.id || ''}
                                    onChange={(e) => updateHeroCampaignCard(cIdx, 'badge', 'id', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Badge EN"
                                    value={card.badge?.en || ''}
                                    onChange={(e) => updateHeroCampaignCard(cIdx, 'badge', 'en', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                  Judul Kartu (ID / EN)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Judul ID"
                                    value={card.title?.id || ''}
                                    onChange={(e) => updateHeroCampaignCard(cIdx, 'title', 'id', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Judul EN"
                                    value={card.title?.en || ''}
                                    onChange={(e) => updateHeroCampaignCard(cIdx, 'title', 'en', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                  Deskripsi Kartu (ID)
                                </label>
                                <textarea
                                  rows={2}
                                  value={card.description?.id || ''}
                                  onChange={(e) => updateHeroCampaignCard(cIdx, 'description', 'id', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                  Deskripsi Kartu (EN)
                                </label>
                                <textarea
                                  rows={2}
                                  value={card.description?.en || ''}
                                  onChange={(e) => updateHeroCampaignCard(cIdx, 'description', 'en', e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                />
                              </div>
                            </div>

                            {/* CTA Text & Target URL */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100 items-center">
                              <div className="sm:col-span-6">
                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                  Label Tombol CTA (ID / EN)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="CTA ID"
                                    value={card.cta?.id || ''}
                                    onChange={(e) => updateHeroCampaignCard(cIdx, 'cta', 'id', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="CTA EN"
                                    value={card.cta?.en || ''}
                                    onChange={(e) => updateHeroCampaignCard(cIdx, 'cta', 'en', e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-6">
                                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                  Target Link URL Kartu
                                </label>
                                <div className="relative">
                                  <ExternalLink className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="https://..."
                                    value={card.url || ''}
                                    onChange={(e) => updateHeroCampaignCard(cIdx, 'url', e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ====================================================
                  SUB-SECTION 3: TRUST METRICS COUNTER BAR
                 ==================================================== */}
              {heroSubSection === 'metrics' && (
                <div className="space-y-4">
                  {/* Toolbar & Sync Controls */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="size-4 text-teal-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Trust Metrics Counter Bar (4 Item)
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Atur 4 kartu counter bukti kredibilitas: Label (Judul) dan Nilai/Angka besar (Deskripsi).
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const baseUrl = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')
                              const headers = getAuthHeaders()
                              const res = await fetch(`${baseUrl}/api/admin/overview/stats`, { headers })
                              if (res.ok) {
                                const json = await res.json()
                                const activeCount = json?.data?.psychologists?.active ?? 18
                                const newSections = [...content.sections]
                                const heroSec = newSections[activeSectionIndex]
                                if (Array.isArray(heroSec.items)) {
                                  heroSec.items = heroSec.items.map((item, idx) => {
                                    if (idx === 1 || item.id === 'psychologist-count' || item.title.id.toLowerCase().includes('psikolog')) {
                                      return {
                                        ...item,
                                        description: { id: String(activeCount), en: String(activeCount) },
                                      }
                                    }
                                    return item
                                  })
                                }
                                setContent({ ...content, sections: newSections })
                                setMessage({ type: 'success', text: `Berhasil sinkronkan jumlah psikolog aktif dari database: ${activeCount} psikolog!` })
                              }
                            } catch (err) {
                              console.error(err)
                              setMessage({ type: 'error', text: 'Gagal menghubungi server untuk sinkronisasi jumlah psikolog.' })
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs font-semibold text-teal-800 hover:bg-teal-50 transition-colors shadow-2xs cursor-pointer"
                        >
                          <span>🔄 Sync DB Psikolog</span>
                        </button>

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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
                        >
                          <span>⚡ Reset Metrik Resmi</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Milestone Presets */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-xs">
                      <span className="font-semibold text-slate-600 mr-1 text-[11px]">Preset Cepat Sesi:</span>
                      {['3.000+', '3.500+', '4.000+', '5.000+'].map((milestone) => (
                        <button
                          key={milestone}
                          type="button"
                          onClick={() => {
                            const newSections = [...content.sections]
                            const heroSec = newSections[activeSectionIndex]
                            if (Array.isArray(heroSec.items)) {
                              heroSec.items = heroSec.items.map((item, idx) => {
                                if (idx === 0 || item.id === 'sessions-delivered' || item.title.id.toLowerCase().includes('sesi')) {
                                  return {
                                    ...item,
                                    description: { id: milestone, en: milestone.replace('.', ',') },
                                  }
                                }
                                return item
                              })
                            }
                            setContent({ ...content, sections: newSections })
                            setMessage({ type: 'success', text: `Sesi terlaksana diubah menjadi: ${milestone}` })
                          }}
                          className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:border-teal-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer text-[11px]"
                        >
                          {milestone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4 Metric Item Cards */}
                  <div className="space-y-3">
                    {(activeSection.items || []).map((item: LandingItem, itemIdx: number) => (
                      <div
                        key={item.id || itemIdx}
                        className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3"
                      >
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          <span className="flex size-6 items-center justify-center rounded-md bg-slate-900 text-white text-xs font-bold">
                            {itemIdx + 1}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
                          {/* Label Metrik */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                              Label Metrik (ID / EN)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Cth: Sesi terlaksana"
                                value={item.title?.id || ''}
                                onChange={(e) => updateRepeaterItem(itemIdx, 'title', 'id', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                              <input
                                type="text"
                                placeholder="Cth: Sessions delivered"
                                value={item.title?.en || ''}
                                onChange={(e) => updateRepeaterItem(itemIdx, 'title', 'en', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                          </div>

                          {/* Nilai / Angka */}
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                              Nilai / Angka Besar (ID / EN)
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Cth: 3.000+"
                                value={item.description?.id || ''}
                                onChange={(e) => updateRepeaterItem(itemIdx, 'description', 'id', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                              <input
                                type="text"
                                placeholder="Cth: 3,000+"
                                value={item.description?.en || ''}
                                onChange={(e) => updateRepeaterItem(itemIdx, 'description', 'en', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ====================================================
                BRANCH 2: OTHER 8 SECTIONS (Standard Section Form)
               ==================================================== */
            <div className="space-y-6">
              {/* Picture Upload Card */}
              {(sectionImageMeta || activeSection?.media) && (
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

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
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

                        <div
                          onClick={() => sectionFileInputRef.current?.click()}
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white cursor-pointer p-3 text-center"
                        >
                          <Camera className="w-6 h-6 text-white" />
                          <span className="text-xs font-semibold">Klik untuk Ganti Gambar</span>
                          <span className="text-[10px] text-slate-300">WebP, PNG, JPG (Maks 5 MB)</span>
                        </div>
                      </div>
                    </div>

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

                      {/* Alt text inputs for section image */}
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
              )}

              {/* Section Copy (Headline & Description) */}
              <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Judul &amp; Deskripsi Section</h3>
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Fields (CTA, Price, Contact) */}
              {(activeSection?.primaryCta || activeSection?.secondaryCta || activeSection?.contact || activeSection?.price) && (
                <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Tombol &amp; Informasi Khusus</h3>

                  {activeSection?.primaryCta && (
                    <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Primary CTA Button (ID)</label>
                        <input
                          type="text"
                          value={activeSection.primaryCta.id || ''}
                          onChange={(e) => updateSectionCustomField('primaryCta', 'id', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Primary CTA Button (EN)</label>
                        <input
                          type="text"
                          value={activeSection.primaryCta.en || ''}
                          onChange={(e) => updateSectionCustomField('primaryCta', 'en', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  {activeSection?.secondaryCta && (
                    <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary CTA Button (ID)</label>
                        <input
                          type="text"
                          value={activeSection.secondaryCta.id || ''}
                          onChange={(e) => updateSectionCustomField('secondaryCta', 'id', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Secondary CTA Button (EN)</label>
                        <input
                          type="text"
                          value={activeSection.secondaryCta.en || ''}
                          onChange={(e) => updateSectionCustomField('secondaryCta', 'en', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  {activeSection?.price && (
                    <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Label Biaya (ID)</label>
                        <input
                          type="text"
                          value={activeSection.price.id || ''}
                          onChange={(e) => updateSectionCustomField('price', 'id', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Label Biaya (EN)</label>
                        <input
                          type="text"
                          value={activeSection.price.en || ''}
                          onChange={(e) => updateSectionCustomField('price', 'en', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  {activeSection?.contact && (
                    <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Informasi Kontak &amp; Hotline (ID)</label>
                        <input
                          type="text"
                          value={activeSection.contact.id || ''}
                          onChange={(e) => updateSectionCustomField('contact', 'id', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Contact &amp; Hotline Info (EN)</label>
                        <input
                          type="text"
                          value={activeSection.contact.en || ''}
                          onChange={(e) => updateSectionCustomField('contact', 'en', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Repeater Items Section */}
              {Array.isArray(activeSection?.items) && (
                <div className="space-y-4 p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                      Item Repeater List ({activeSection.items.length} item)
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {activeSection.items.map((item: LandingItem, itemIdx: number) => {
                      const itemTargetKey = `${activeSection.key}-item-${itemIdx}`
                      const defaultItemImg = ITEM_DEFAULT_IMAGES[activeSection.key]?.[itemIdx]
                      const currentItemImg = item.media?.reference
                        ? (item.media.reference.startsWith('/') ? item.media.reference : `/${item.media.reference}`)
                        : defaultItemImg

                      return (
                        <div key={item.id || itemIdx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                            <span>Item #{itemIdx + 1}</span>
                          </div>

                          <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2'}>
                            <input
                              type="text"
                              placeholder="Title (ID)"
                              value={item.title?.id || ''}
                              onChange={(e) => updateRepeaterItem(itemIdx, 'title', 'id', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <input
                              type="text"
                              placeholder="Title (EN)"
                              value={item.title?.en || ''}
                              onChange={(e) => updateRepeaterItem(itemIdx, 'title', 'en', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>

                          <div className={languageView === 'both' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2'}>
                            <textarea
                              rows={2}
                              placeholder="Description (ID)"
                              value={item.description?.id || ''}
                              onChange={(e) => updateRepeaterItem(itemIdx, 'description', 'id', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <textarea
                              rows={2}
                              placeholder="Description (EN)"
                              value={item.description?.en || ''}
                              onChange={(e) => updateRepeaterItem(itemIdx, 'description', 'en', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>

                          {(defaultItemImg || item.media) && (
                            <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
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

                              <div className="size-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0">
                                <img
                                  src={currentItemImg}
                                  alt={item.title?.id || `Item ${itemIdx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    if (defaultItemImg) (e.target as HTMLImageElement).src = defaultItemImg
                                  }}
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => itemFileInputRefs.current[itemIdx]?.click()}
                                  disabled={uploadingTarget === itemTargetKey}
                                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                >
                                  {uploadingTarget === itemTargetKey ? 'Mengunggah...' : 'Ganti Gambar Item'}
                                </button>
                                {item.media && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetItemImage(itemIdx)}
                                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                  >
                                    Reset
                                  </button>
                                )}
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
          )}
        </div>
      </div>
    </div>
  )
}