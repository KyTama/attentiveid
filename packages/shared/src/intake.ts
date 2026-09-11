/**
 * Consultation Intake & Clinical Triage Domain
 * 
 * Domain models, crisis detection safeguards, and multi-psychologist matching engine
 * for Biro Psikologi Attentive.
 */

export const INTAKE_CONCERN_IDS = [
  'anxiety_mood',
  'relationship_family',
  'career_burnout',
  'child_adolescent',
  'trauma_grief',
  'self_growth',
  'general_assessment',
] as const

export type IntakeConcernId = typeof INTAKE_CONCERN_IDS[number]

export const INTAKE_SESSION_FORMATS = ['online', 'offline', 'flexible'] as const
export type IntakeSessionFormat = typeof INTAKE_SESSION_FORMATS[number]

export const INTAKE_GENDER_PREFERENCES = ['female', 'male', 'any'] as const
export type IntakeGenderPreference = typeof INTAKE_GENDER_PREFERENCES[number]

export const INTAKE_CLIENT_CATEGORIES = ['individual', 'couple', 'child_teen', 'family'] as const
export type IntakeClientCategory = typeof INTAKE_CLIENT_CATEGORIES[number]

export interface IntakeConcernOption {
  id: IntakeConcernId
  title: { id: string; en: string }
  description: { id: string; en: string }
  keywords: string[]
  recommendedCategory?: 'adultClinical' | 'childAdolescent' | 'educational'
}

export const INTAKE_CONCERNS: IntakeConcernOption[] = [
  {
    id: 'anxiety_mood',
    title: {
      id: 'Kecemasan, Overthinking & Mood',
      en: 'Anxiety, Overthinking & Mood',
    },
    description: {
      id: 'Kekhawatiran berlebih, serangan panik, stres emosional, atau perubahan suasana hati.',
      en: 'Excessive worry, panic attacks, emotional stress, or fluctuating mood.',
    },
    keywords: ['kecemasan', 'anxiety', 'mood', 'depresi', 'overthinking', 'panik', 'stres', 'bipolar', 'ocd'],
    recommendedCategory: 'adultClinical',
  },
  {
    id: 'relationship_family',
    title: {
      id: 'Pasangan, Pernikahan & Relasi',
      en: 'Couples, Marriage & Relationships',
    },
    description: {
      id: 'Konflik komunikasi, kepercayaan, persiapan pranikah, atau dinamika keluarga.',
      en: 'Communication breakdowns, trust issues, premarital readiness, or family dynamics.',
    },
    keywords: ['relasi', 'hubungan', 'pasangan', 'pernikahan', 'keluarga', 'komunikasi', 'interpersonal', 'pranikah'],
    recommendedCategory: 'adultClinical',
  },
  {
    id: 'career_burnout',
    title: {
      id: 'Stres Kerja, Burnout & Karier',
      en: 'Work Stress, Burnout & Career',
    },
    description: {
      id: 'Kehilangan motivasi kerja, burnout, tekanan performa, atau arah karier.',
      en: 'Loss of motivation, burnout, workplace pressure, or career uncertainty.',
    },
    keywords: ['burnout', 'kerja', 'karier', 'pekerjaan', 'beban', 'quarter-life', 'akademik'],
    recommendedCategory: 'adultClinical',
  },
  {
    id: 'child_adolescent',
    title: {
      id: 'Anak, Remaja & Pola Asuh',
      en: 'Child, Adolescent & Parenting',
    },
    description: {
      id: 'Tantangan emosi anak, perkembangan perilaku, relasi sekolah, atau konseling parenting.',
      en: 'Childhood emotional challenges, behavioral development, school adjustment, or parenting guidance.',
    },
    keywords: ['anak', 'remaja', 'parenting', 'pengasuhan', 'sekolah', 'tumbuh kembang', 'perilaku anak', 'adhd'],
    recommendedCategory: 'childAdolescent',
  },
  {
    id: 'trauma_grief',
    title: {
      id: 'Trauma Masa Lalu & Duka',
      en: 'Past Trauma, Grief & Loss',
    },
    description: {
      id: 'Pengalaman masa lalu yang membekas, kedukaan mendalam, atau peristiwa kehilangan.',
      en: 'Lingering painful memories, deep grief, heartbreak, or significant loss.',
    },
    keywords: ['trauma', 'duka', 'kehilangan', 'grief', 'ptsd', 'kekerasan', 'inner child', 'luka batin'],
    recommendedCategory: 'adultClinical',
  },
  {
    id: 'self_growth',
    title: {
      id: 'Pengembangan Diri & Regulasi Emosi',
      en: 'Personal Growth & Emotional Regulation',
    },
    description: {
      id: 'Membangun batas sehat, kepercayaan diri, mengenal potensi diri, dan ketahanan mental.',
      en: 'Building healthy boundaries, self-confidence, self-discovery, and mental resilience.',
    },
    keywords: ['pengembangan diri', 'kepercayaan diri', 'regulasi emosi', 'self-esteem', 'eksplorasi diri', 'resiliensi'],
    recommendedCategory: 'adultClinical',
  },
  {
    id: 'general_assessment',
    title: {
      id: 'Belum Yakin / Bantuan Asesmen',
      en: 'Not Sure Yet / General Assessment',
    },
    description: {
      id: 'Hanya tahu ada hal yang mengganjal. Biarkan psikolog dan admin membantu memetakan.',
      en: 'I only know something feels off. Let our psychologists and admin help map it out.',
    },
    keywords: ['asesmen', 'umum', 'konsultasi', 'evaluasi', 'tes'],
  },
]

export interface PsychologistCandidate {
  id: string
  name: string
  nickname: string
  title?: string
  category: 'adultClinical' | 'childAdolescent' | 'educational'
  gender?: 'female' | 'male'
  specializations: string[]
  experience?: string | number
  image?: string
  sipp?: string
}

export interface PsychologistMatchResult {
  psychologist: PsychologistCandidate
  score: number
  matchReasons: { id: string; en: string }[]
}

export interface IntakeSubmissionData {
  concernId: IntakeConcernId
  format: IntakeSessionFormat
  genderPreference: IntakeGenderPreference
  clientCategory: IntakeClientCategory
  name: string
  whatsapp: string
  preferredDate: string
  problemDescription: string
  selectedPsychologistId?: string | null
  selectedPsychologistName?: string | null
  isCrisis?: boolean
  consent: boolean
}

/**
 * Known crisis detection keywords for acute triage safeguards
 */
export const CRISIS_DETECTION_KEYWORDS = [
  'bunuh diri',
  'suicide',
  'mengakhiri hidup',
  'melukai diri',
  'self-harm',
  'self harm',
  'menyakiti diri',
  'ingin mati',
  'darurat jiwa',
]

export const EMERGENCY_CRISIS_HOTLINES = [
  {
    name: 'Hotline Kesehatan Jiwa Kemenkes (Sejiwa)',
    number: '119 ext 8',
    description: 'Layanan konseling darurat psikologis 24 jam bebas pulsa',
    actionUrl: 'tel:119',
  },
  {
    name: 'Into The Light Indonesia',
    number: 'intothelightid.org',
    description: 'Panduan pencegahan bunuh diri dan pertolongan pertama kesehatan mental',
    actionUrl: 'https://www.intothelightid.org/tentang-bunuh-diri/layanan-konseling-pencegahan-bunuh-diri/',
  },
  {
    name: 'Yayasan Pulih (Trauma & Krisis)',
    number: '+62 811-8436-633',
    description: 'Layanan pemulihan trauma dan krisis kesehatan mental',
    actionUrl: 'https://wa.me/628118436633',
  },
]

/**
 * Detect crisis indicators in text input
 */
export function detectCrisisKeywords(text: string): { isCrisisDetected: boolean; matchedKeywords: string[] } {
  if (!text || typeof text !== 'string') {
    return { isCrisisDetected: false, matchedKeywords: [] }
  }
  const lower = text.toLowerCase()
  const matches = CRISIS_DETECTION_KEYWORDS.filter((keyword) => lower.includes(keyword))
  return {
    isCrisisDetected: matches.length > 0,
    matchedKeywords: matches,
  }
}

/**
 * Multi-Psychologist Matching Algorithm
 * Returns top curated options (default: 3) based on concern alignment, category, and gender preferences.
 */
export function matchPsychologists(
  criteria: {
    concernId: IntakeConcernId
    genderPreference?: IntakeGenderPreference
    clientCategory?: IntakeClientCategory
  },
  candidates: PsychologistCandidate[],
  options?: { maxResults?: number }
): PsychologistMatchResult[] {
  const maxResults = options?.maxResults ?? 3
  const concern = INTAKE_CONCERNS.find((c) => c.id === criteria.concernId) || INTAKE_CONCERNS[0]
  const genderPref = criteria.genderPreference || 'any'

  const scored: PsychologistMatchResult[] = candidates.map((psychologist) => {
    let score = 20 // baseline score
    const matchReasons: { id: string; en: string }[] = []

    // 1. Inferred or explicit gender filter
    const isMale = psychologist.id === 'ilham' || psychologist.gender === 'male'
    const psychologistGender = isMale ? 'male' : 'female'
    if (genderPref !== 'any') {
      if (genderPref === psychologistGender) {
        score += 25
      } else {
        score -= 40 // Deprioritize if opposite gender requested
      }
    }

    // 2. Category alignment
    if (concern.recommendedCategory && psychologist.category === concern.recommendedCategory) {
      score += 30
      matchReasons.push({
        id: `Bidang ${psychologist.category === 'childAdolescent' ? 'Anak & Remaja' : 'Klinis Dewasa'}`,
        en: `Focus in ${psychologist.category === 'childAdolescent' ? 'Child & Adolescent' : 'Adult Clinical'}`,
      })
    }

    // 3. Client Category alignment
    if (criteria.clientCategory === 'child_teen' && psychologist.category === 'childAdolescent') {
      score += 25
    }

    // 4. Keyword and Specialization matching
    const specsLower = psychologist.specializations.map((s) => s.toLowerCase())
    let matchingSpecializationsCount = 0

    for (const keyword of concern.keywords) {
      for (const spec of specsLower) {
        if (spec.includes(keyword) || keyword.includes(spec)) {
          matchingSpecializationsCount++
          score += 15
        }
      }
    }

    if (matchingSpecializationsCount > 0) {
      // Pick top matching specialization as reason
      const sampleSpec = psychologist.specializations.find((s) =>
        concern.keywords.some((kw) => s.toLowerCase().includes(kw))
      )
      if (sampleSpec) {
        matchReasons.push({
          id: `Spesialisasi ${sampleSpec}`,
          en: `Specialization in ${sampleSpec}`,
        })
      }
    }

    // Default fallback reason if list is empty
    if (matchReasons.length === 0) {
      matchReasons.push({
        id: `Berpengalaman dalam pendampingan psikologis`,
        en: `Experienced in clinical psychological support`,
      })
    }

    return {
      psychologist,
      score,
      matchReasons: matchReasons.slice(0, 2),
    }
  })

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, maxResults)
}

/**
 * WhatsApp Message Generator for Bureau Intake
 */
export function generateIntakeWhatsAppMessage(data: IntakeSubmissionData, lang: 'id' | 'en' = 'id'): string {
  const concern = INTAKE_CONCERNS.find((c) => c.id === data.concernId)
  const concernLabel = concern ? concern.title[lang] : data.concernId

  const formatLabels: Record<IntakeSessionFormat, { id: string; en: string }> = {
    online: { id: 'Online (Video Call)', en: 'Online (Video Call)' },
    offline: { id: 'Tatap Muka (Jakarta / BSD)', en: 'In-person (Jakarta / BSD)' },
    flexible: { id: 'Fleksibel (Lebih Cepat)', en: 'Flexible (Whichever is sooner)' },
  }

  const categoryLabels: Record<IntakeClientCategory, { id: string; en: string }> = {
    individual: { id: 'Dewasa / Individu', en: 'Individual Adult' },
    couple: { id: 'Pasangan / Pranikah', en: 'Couple / Premarital' },
    child_teen: { id: 'Anak / Remaja', en: 'Child / Teen' },
    family: { id: 'Keluarga', en: 'Family' },
  }

  const chosenPsychologist = data.selectedPsychologistName || (lang === 'id' ? 'Rekomendasi Terbaik Admin' : 'Admin Recommendation')

  if (lang === 'en') {
    return [
      'Hello Admin Attentive, I would like to request a psychological consultation session.',
      '',
      '— CONSULTATION REQUEST —',
      `Main Concern: ${concernLabel}`,
      `Session Format: ${formatLabels[data.format].en}`,
      `Preferred Date: ${data.preferredDate || 'Flexible / As soon as possible'}`,
      `Preferred Psychologist: ${chosenPsychologist}`,
      '',
      '— CLIENT DETAILS —',
      `Name: ${data.name.trim()}`,
      `WhatsApp: ${data.whatsapp.trim()}`,
      `Category: ${categoryLabels[data.clientCategory].en}`,
      '',
      '— CONTEXT & CONCERNS —',
      `${data.problemDescription.trim() || 'Will explain directly during consultation setup.'}`,
      '',
      'I understand that consultation details are kept confidential under the clinical psychological code of ethics. No payment has been made yet. Please confirm the schedule, psychologist availability, and fee.',
    ].join('\n')
  }

  return [
    'Halo admin Attentive, saya ingin mengajukan sesi konsultasi psikologi.',
    '',
    '— PERMINTAAN KONSULTASI —',
    `Fokus Utama: ${concernLabel}`,
    `Format Sesi: ${formatLabels[data.format].id}`,
    `Tanggal Pilihan: ${data.preferredDate || 'Fleksibel / Secepatnya'}`,
    `Preferensi Psikolog: ${chosenPsychologist}`,
    '',
    '— DATA KLIEN —',
    `Nama: ${data.name.trim()}`,
    `WhatsApp: ${data.whatsapp.trim()}`,
    `Kategori: ${categoryLabels[data.clientCategory].id}`,
    '',
    '— CERITA KELUHAN & TUJUAN —',
    `${data.problemDescription.trim() || 'Akan dijelaskan lebih lanjut saat koordinasi jadwal.'}`,
    '',
    'Saya memahami bahwa informasi ini dijaga kerahasiaannya sesuai kode etik psikologi. Belum ada pembayaran. Mohon informasi ketersediaan jadwal dan biaya sesi.',
  ].join('\n')
}

/**
 * Generate full WhatsApp wa.me URL
 */
export function generateIntakeWhatsAppUrl(
  data: IntakeSubmissionData,
  lang: 'id' | 'en' = 'id',
  whatsappNumber = '6285156410912'
): string {
  const message = generateIntakeWhatsAppMessage(data, lang)
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}
