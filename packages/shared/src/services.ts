import { Type, type Static } from '@sinclair/typebox'
import {
  detectCrisisKeywords,
  EMERGENCY_CRISIS_HOTLINES,
  type IntakeClientCategory,
} from './intake'
import type { BookingConcernId } from './booking'

export type CrisisHotline = typeof EMERGENCY_CRISIS_HOTLINES[number]

export const SERVICE_TYPES = ['layanan', 'addon'] as const
export type ServiceType = typeof SERVICE_TYPES[number]

export const SERVICE_LIFECYCLE_STATUSES = ['draft', 'published', 'inactive', 'archived'] as const
export type ServiceLifecycleStatus = typeof SERVICE_LIFECYCLE_STATUSES[number]

export const SERVICE_VISIBILITIES = ['public', 'internal'] as const
export type ServiceVisibility = typeof SERVICE_VISIBILITIES[number]

export const SERVICE_PRICING_MODELS = [
  'fixed_variant',
  'psychologist_rate',
  'price_on_request',
  'free_external',
] as const
export type ServicePricingModel = typeof SERVICE_PRICING_MODELS[number]

export const SERVICE_MODALITIES = ['online', 'offline'] as const
export type ServiceModality = typeof SERVICE_MODALITIES[number]

export const SERVICE_PROGRAM_TYPES = ['harga', 'persen', 'nominal', 'gratis'] as const
export type ServiceProgramType = typeof SERVICE_PROGRAM_TYPES[number]

export const SERVICE_PROGRAM_STATUSES = ['draft', 'active', 'ended'] as const
export type ServiceProgramStatus = typeof SERVICE_PROGRAM_STATUSES[number]

export const SERVICE_BRANCHES = ['tbi', 'bsd', 'malang'] as const
export type ServiceBranch = typeof SERVICE_BRANCHES[number]

export const NullableStringSchema = Type.Union([Type.String(), Type.Null()])
export const NullableNumberSchema = Type.Union([Type.Number(), Type.Null()])

export const PublicServiceMediaSchema = Type.Object(
  {
    url: Type.String(),
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    alt: Type.String(),
    caption: Type.Optional(NullableStringSchema),
    description: Type.Optional(NullableStringSchema),
  },
  { additionalProperties: false },
)
export type PublicServiceMedia = Static<typeof PublicServiceMediaSchema>

export const PublicServiceCategorySchema = Type.Object(
  {
    id: Type.String(),
    slug: Type.String(),
    position: Type.Integer(),
    isFree: Type.Boolean(),
    name: Type.String(),
  },
  { additionalProperties: false },
)
export type PublicServiceCategory = Static<typeof PublicServiceCategorySchema>

export const PublicServiceSubgroupSchema = Type.Object(
  {
    id: Type.String(),
    categoryId: NullableStringSchema,
    slug: Type.String(),
    position: Type.Integer(),
    name: Type.String(),
    note: NullableStringSchema,
  },
  { additionalProperties: false },
)
export type PublicServiceSubgroup = Static<typeof PublicServiceSubgroupSchema>

export const PublicServiceProgramSchema = Type.Object(
  {
    id: Type.String(),
    slug: Type.String(),
    name: Type.String(),
    badge: NullableStringSchema,
    programType: Type.Union(SERVICE_PROGRAM_TYPES.map((value) => Type.Literal(value))),
    startsOn: Type.String(),
    endsOn: Type.String(),
  },
  { additionalProperties: false },
)
export type PublicServiceProgram = Static<typeof PublicServiceProgramSchema>

export const PublicServiceVariantPricingSchema = Type.Object(
  {
    minAmount: NullableNumberSchema,
    maxAmount: NullableNumberSchema,
    isRange: Type.Boolean(),
    variesByProvider: Type.Boolean(),
    promoAmount: NullableNumberSchema,
    promoBadge: NullableStringSchema,
    promoNote: NullableStringSchema,
    programSlug: NullableStringSchema,
  },
  { additionalProperties: false },
)
export type PublicServiceVariantPricing = Static<typeof PublicServiceVariantPricingSchema>

export const PublicServiceVariantSchema = Type.Object(
  {
    id: Type.String(),
    slug: Type.String(),
    position: Type.Integer(),
    name: Type.String(),
    description: NullableStringSchema,
    unitLabel: NullableStringSchema,
    ageRangeLabel: NullableStringSchema,
    durationLabel: NullableStringSchema,
    modalities: Type.Array(Type.Union(SERVICE_MODALITIES.map((value) => Type.Literal(value)))),
    branch: Type.Union([
      Type.Literal('tbi'),
      Type.Literal('bsd'),
      Type.Literal('malang'),
      Type.Null(),
    ]),
    priceOnRequest: Type.Boolean(),
    pricing: PublicServiceVariantPricingSchema,
  },
  { additionalProperties: false },
)
export type PublicServiceVariant = Static<typeof PublicServiceVariantSchema>

export const PublicServicePsychologistOptionSchema = Type.Object(
  {
    id: Type.String(),
    slug: Type.String(),
    name: Type.String(),
    nickname: Type.String(),
    credential: Type.String(),
    tier: Type.String(),
    primaryBranch: Type.String(),
    experienceYears: Type.Integer(),
    onlineRate: NullableNumberSchema,
    offlineRate: NullableNumberSchema,
    availableOnline: Type.Boolean(),
    availableTbi: Type.Boolean(),
    availableBsd: Type.Boolean(),
    availableMalang: Type.Boolean(),
    note: NullableStringSchema,
    media: Type.Union([PublicServiceMediaSchema, Type.Null()]),
  },
  { additionalProperties: false },
)
export type PublicServicePsychologistOption = Static<typeof PublicServicePsychologistOptionSchema>

export const PublicServiceDeliverableSchema = Type.Object(
  {
    id: Type.String(),
    position: Type.Integer(),
    variantSlugs: Type.Array(Type.String()),
    text: Type.String(),
  },
  { additionalProperties: false },
)
export type PublicServiceDeliverable = Static<typeof PublicServiceDeliverableSchema>

export const PublicServiceFaqSchema = Type.Object(
  {
    id: Type.String(),
    position: Type.Integer(),
    question: Type.String(),
    answer: Type.String(),
  },
  { additionalProperties: false },
)
export type PublicServiceFaq = Static<typeof PublicServiceFaqSchema>

export const PublicServiceReferenceSchema = Type.Object(
  {
    id: Type.String(),
    code: Type.String(),
    citationText: Type.String(),
    doiUrl: NullableStringSchema,
  },
  { additionalProperties: false },
)
export type PublicServiceReference = Static<typeof PublicServiceReferenceSchema>

export const PublicServiceBookingPresetSchema = Type.Object(
  {
    bookable: Type.Boolean(),
    bookingPath: NullableStringSchema,
    externalUrl: NullableStringSchema,
    defaultConcernId: NullableStringSchema,
    defaultClientCategory: NullableStringSchema,
    requiresInitialCounseling: Type.Boolean(),
  },
  { additionalProperties: false },
)
export type PublicServiceBookingPreset = Static<typeof PublicServiceBookingPresetSchema>

export const PublicServiceAssessmentDetailsSchema = Type.Object(
  {
    purpose: NullableStringSchema,
    aspects: NullableStringSchema,
    ageRange: NullableStringSchema,
    method: NullableStringSchema,
    preparation: NullableStringSchema,
    outputFormat: NullableStringSchema,
    dimensions: Type.Array(Type.String()),
    reportType: NullableStringSchema,
    interpretation: NullableStringSchema,
    recommendations: NullableStringSchema,
    turnaround: NullableStringSchema,
  },
  { additionalProperties: false },
)
export type PublicServiceAssessmentDetails = Static<typeof PublicServiceAssessmentDetailsSchema>

export const ServiceDemoConfigSchema = Type.Object(
  {
    tasks: Type.Array(
      Type.Union([
        Type.Literal('cpt'),
        Type.Literal('sst'),
        Type.Literal('nb'),
        Type.Literal('gng'),
      ]),
    ),
    aaa: Type.Boolean(),
    reportKey: NullableStringSchema,
  },
  { additionalProperties: false },
)
export type ServiceDemoConfig = Static<typeof ServiceDemoConfigSchema>

export const PublicServiceSummarySchema = Type.Object(
  {
    id: Type.String(),
    slug: Type.String(),
    categoryId: Type.String(),
    categorySlug: Type.String(),
    categoryName: Type.String(),
    subgroupId: NullableStringSchema,
    subgroupSlug: NullableStringSchema,
    subgroupName: NullableStringSchema,
    serviceType: Type.Union(SERVICE_TYPES.map((value) => Type.Literal(value))),
    pricingModel: Type.Union(SERVICE_PRICING_MODELS.map((value) => Type.Literal(value))),
    appliesNewClientFee: Type.Boolean(),
    isAssessment: Type.Boolean(),
    isFeaturedSpotlight: Type.Boolean(),
    position: Type.Number(),
    name: Type.String(),
    badge: NullableStringSchema,
    shortSummary: NullableStringSchema,
    benefit: NullableStringSchema,
    audiences: Type.Array(Type.String()),
    modalities: Type.Array(Type.Union(SERVICE_MODALITIES.map((value) => Type.Literal(value)))),
    hasMalangBranch: Type.Boolean(),
    priceRange: PublicServiceVariantPricingSchema,
    cardMedia: Type.Union([PublicServiceMediaSchema, Type.Null()]),
    variants: Type.Array(PublicServiceVariantSchema),
    bookingPreset: PublicServiceBookingPresetSchema,
    demo: Type.Optional(Type.Union([ServiceDemoConfigSchema, Type.Null()])),
  },
  { additionalProperties: false },
)
export type PublicServiceSummary = Static<typeof PublicServiceSummarySchema>

export const PublicServiceDetailSchema = Type.Object(
  {
    id: Type.String(),
    slug: Type.String(),
    categoryId: Type.String(),
    categorySlug: Type.String(),
    categoryName: Type.String(),
    subgroupId: NullableStringSchema,
    subgroupSlug: NullableStringSchema,
    subgroupName: NullableStringSchema,
    serviceType: Type.Union(SERVICE_TYPES.map((value) => Type.Literal(value))),
    pricingModel: Type.Union(SERVICE_PRICING_MODELS.map((value) => Type.Literal(value))),
    appliesNewClientFee: Type.Boolean(),
    isAssessment: Type.Boolean(),
    isFeaturedSpotlight: Type.Boolean(),
    position: Type.Number(),
    name: Type.String(),
    fullName: NullableStringSchema,
    badge: NullableStringSchema,
    shortSummary: NullableStringSchema,
    benefit: NullableStringSchema,
    introduction: NullableStringSchema,
    targetAudience: NullableStringSchema,
    whatIsMeasured: NullableStringSchema,
    durationInfo: NullableStringSchema,
    locationInfo: NullableStringSchema,
    processSteps: Type.Array(Type.String()),
    terms: Type.Array(Type.String()),
    resultsExplanation: NullableStringSchema,
    scientificBasis: NullableStringSchema,
    citationSummary: NullableStringSchema,
    audiences: Type.Array(Type.String()),
    modalities: Type.Array(Type.Union(SERVICE_MODALITIES.map((value) => Type.Literal(value)))),
    hasMalangBranch: Type.Boolean(),
    priceRange: PublicServiceVariantPricingSchema,
    cardMedia: Type.Union([PublicServiceMediaSchema, Type.Null()]),
    reportPreviews: Type.Array(PublicServiceMediaSchema),
    variants: Type.Array(PublicServiceVariantSchema),
    eligiblePsychologists: Type.Array(PublicServicePsychologistOptionSchema),
    deliverables: Type.Array(PublicServiceDeliverableSchema),
    faqs: Type.Array(PublicServiceFaqSchema),
    references: Type.Array(PublicServiceReferenceSchema),
    assessmentDetails: Type.Union([PublicServiceAssessmentDetailsSchema, Type.Null()]),
    bookingPreset: PublicServiceBookingPresetSchema,
    demo: Type.Optional(Type.Union([ServiceDemoConfigSchema, Type.Null()])),
  },
  { additionalProperties: false },
)
export type PublicServiceDetail = Static<typeof PublicServiceDetailSchema>

export const PublicServiceCatalogResponseSchema = Type.Object(
  {
    locale: Type.Union([Type.Literal('id'), Type.Literal('en')]),
    categories: Type.Array(PublicServiceCategorySchema),
    subgroups: Type.Array(PublicServiceSubgroupSchema),
    activePrograms: Type.Array(PublicServiceProgramSchema),
    services: Type.Array(PublicServiceSummarySchema),
  },
  { additionalProperties: false },
)
export type PublicServiceCatalogResponse = Static<typeof PublicServiceCatalogResponseSchema>

// ============================================================================
// Deterministic Rule-Based Service Assistant (In-Memory Only, Zero Persistence)
// ============================================================================

export interface ServiceAssistantAudience {
  id: string
  label: { id: string; en: string }
}

export interface ServiceAssistantArea {
  id: string
  label: { id: string; en: string }
}

export interface ServiceAssistantNeed {
  id: string
  areaId: string
  audiences: readonly string[]
  label: { id: string; en: string }
  serviceSlugs: readonly string[]
  keywords: { id: readonly string[]; en: readonly string[] }
}

export const SERVICE_ASSISTANT_FLOW = {
  audiences: [
    { id: 'a-dewasa', label: { id: 'Diri saya sendiri (dewasa)', en: 'Myself (adult)' } },
    { id: 'a-remaja', label: { id: 'Remaja', en: 'A teenager' } },
    { id: 'a-anak', label: { id: 'Anak', en: 'A child' } },
    { id: 'a-pasangan', label: { id: 'Saya dan pasangan', en: 'My partner and me' } },
    { id: 'a-keluarga', label: { id: 'Keluarga', en: 'My family' } },
    { id: 'a-akademik', label: { id: 'Mahasiswa atau peneliti', en: 'A student or researcher' } },
    { id: 'a-instansi', label: { id: 'Kantor atau instansi', en: 'A company or organisation' } },
  ] satisfies readonly ServiceAssistantAudience[],
  areas: [
    { id: 'ar-emosi', label: { id: 'Emosi dan kesehatan mental', en: 'Emotions and mental health' } },
    { id: 'ar-fokus', label: { id: 'Fokus, memori, dan kecerdasan', en: 'Focus, memory, and intelligence' } },
    { id: 'ar-diri', label: { id: 'Mengenal diri dan kepribadian', en: 'Self-understanding and personality' } },
    { id: 'ar-karier', label: { id: 'Jurusan dan karier', en: 'Study and career' } },
    { id: 'ar-hubungan', label: { id: 'Hubungan dan keluarga', en: 'Relationships and family' } },
    { id: 'ar-anak', label: { id: 'Perilaku dan emosi anak', en: "Children's behaviour and emotions" } },
    { id: 'ar-sekolah', label: { id: 'Belajar dan sekolah', en: 'Learning and school' } },
    { id: 'ar-riset', label: { id: 'Skripsi, tesis, dan riset', en: 'Theses and research' } },
    { id: 'ar-kuliah', label: { id: 'Tekanan selama kuliah', en: 'Pressure during studies' } },
    { id: 'ar-instansi', label: { id: 'Karyawan dan rekrutmen', en: 'Employees and recruitment' } },
  ] satisfies readonly ServiceAssistantArea[],
  needs: [
    {
      id: 'n-cerita',
      areaId: 'ar-emosi',
      audiences: ['a-dewasa'],
      label: {
        id: 'Ingin bercerita dan berkonsultasi tentang masalah pribadi',
        en: 'I want to talk through a personal problem',
      },
      serviceSlugs: ['konseling-dewasa'],
      keywords: {
        id: ['cerita', 'curhat', 'konseling', 'masalah pribadi', 'psikolog', 'galau'],
        en: ['talk', 'counseling', 'counselling', 'personal problem', 'psychologist'],
      },
    },
    {
      id: 'n-cemas',
      areaId: 'ar-emosi',
      audiences: ['a-dewasa'],
      label: {
        id: 'Sering cemas, stres, atau overthinking',
        en: 'Often anxious, stressed, or overthinking',
      },
      serviceSlugs: ['konseling-dewasa', 'rmhcu'],
      keywords: {
        id: ['cemas', 'kecemasan', 'stres', 'stress', 'overthinking', 'panik', 'khawatir', 'gelisah'],
        en: ['anxious', 'anxiety', 'stress', 'stressed', 'overthinking', 'panic', 'worry'],
      },
    },
    {
      id: 'n-sedih',
      areaId: 'ar-emosi',
      audiences: ['a-dewasa'],
      label: {
        id: 'Sedih berkepanjangan atau kehilangan semangat',
        en: 'Lasting sadness or loss of motivation',
      },
      serviceSlugs: ['konseling-dewasa', 'rmhcu'],
      keywords: {
        id: ['sedih', 'murung', 'hampa', 'tidak semangat', 'depresi', 'kehilangan', 'duka', 'putus asa'],
        en: ['sad', 'sadness', 'empty', 'unmotivated', 'depressed', 'grief', 'loss'],
      },
    },
    {
      id: 'n-burnout',
      areaId: 'ar-emosi',
      audiences: ['a-dewasa'],
      label: {
        id: 'Lelah atau jenuh karena pekerjaan',
        en: 'Worn out or burnt out by work',
      },
      serviceSlugs: ['konseling-dewasa', 'rmhcu', 'gsc'],
      keywords: {
        id: ['burnout', 'jenuh', 'lelah kerja', 'capek kerja', 'tekanan kerja', 'emosi', 'kantor'],
        en: ['burnout', 'burnt out', 'exhausted', 'work stress', 'work pressure'],
      },
    },
    {
      id: 'n-skrining',
      areaId: 'ar-emosi',
      audiences: ['a-dewasa', 'a-remaja'],
      label: {
        id: 'Ingin mengecek kondisi kesehatan mental',
        en: 'I want to check my mental health',
      },
      serviceSlugs: ['rmhcu'],
      keywords: {
        id: ['kesehatan mental', 'skrining', 'screening', 'check up', 'checkup', 'mhcu', 'cek mental'],
        en: ['mental health', 'screening', 'check-up', 'check up', 'checkup', 'mhcu'],
      },
    },
    {
      id: 'n-terapi',
      areaId: 'ar-emosi',
      audiences: ['a-dewasa'],
      label: {
        id: 'Mencari terapi seperti Brainspotting atau Art Therapy',
        en: 'Looking for therapy such as Brainspotting or Art Therapy',
      },
      serviceSlugs: ['brainspotting', 'art-therapy'],
      keywords: {
        id: ['terapi', 'brainspotting', 'art therapy', 'seni', 'trauma'],
        en: ['therapy', 'brainspotting', 'art therapy', 'art', 'trauma'],
      },
    },
    {
      id: 'n-adhd',
      areaId: 'ar-fokus',
      audiences: ['a-dewasa'],
      label: {
        id: 'Sulit fokus, sering menunda, atau mudah lupa',
        en: 'Trouble focusing, procrastinating, or forgetful',
      },
      serviceSlugs: ['profil-kognitif-lengkap', 'adhd-dewasa'],
      keywords: {
        id: ['fokus', 'konsentrasi', 'menunda', 'prokrastinasi', 'lupa', 'pelupa', 'perhatian', 'impulsif'],
        en: ['focus', 'concentration', 'procrastinate', 'procrastination', 'forgetful', 'attention', 'impulsive'],
      },
    },
    {
      id: 'n-adhd-cek',
      areaId: 'ar-fokus',
      audiences: ['a-dewasa'],
      label: {
        id: 'Ingin memastikan kemungkinan ADHD',
        en: 'I want to check for possible ADHD',
      },
      serviceSlugs: ['adhd-dewasa', 'profil-kognitif-lengkap'],
      keywords: {
        id: ['adhd', 'add', 'hiperaktif', 'asesmen adhd'],
        en: ['adhd', 'add', 'hyperactive', 'adhd assessment'],
      },
    },
    {
      id: 'n-iq',
      areaId: 'ar-fokus',
      audiences: ['a-anak', 'a-remaja', 'a-dewasa'],
      label: {
        id: 'Mengetahui kemampuan kecerdasan (IQ)',
        en: 'Find out intellectual ability (IQ)',
      },
      serviceSlugs: ['tes-iq'],
      keywords: {
        id: ['iq', 'kecerdasan', 'inteligensi', 'intelegensi', 'wechsler'],
        en: ['iq', 'intelligence', 'intellectual', 'wechsler'],
      },
    },
    {
      id: 'n-big10',
      areaId: 'ar-diri',
      audiences: ['a-dewasa', 'a-remaja'],
      label: {
        id: 'Mengenal tipe kepribadian lewat tes gratis',
        en: 'Find my personality type with a free test',
      },
      serviceSlugs: ['big10'],
      keywords: {
        id: ['big10', 'big 10', 'big five', 'tipe kepribadian', 'tes gratis', 'gratis'],
        en: ['big10', 'big five', 'personality type', 'free test', 'free'],
      },
    },
    {
      id: 'n-kepribadian',
      areaId: 'ar-diri',
      audiences: ['a-dewasa', 'a-remaja'],
      label: {
        id: 'Memahami kepribadian secara lebih mendalam bersama psikolog',
        en: 'Understand my personality in depth with a psychologist',
      },
      serviceSlugs: ['proyektif', 'big10', 'mmpi', 'mcmi'],
      keywords: {
        id: ['kepribadian', 'karakter', 'personality', 'mengenal diri', 'proyektif'],
        en: ['personality', 'character', 'self-understanding', 'projective'],
      },
    },
    {
      id: 'n-klinis',
      areaId: 'ar-diri',
      audiences: ['a-dewasa'],
      label: {
        id: 'Gambaran klinis untuk terapi atau rujukan',
        en: 'A clinical picture for therapy or referral',
      },
      serviceSlugs: ['mmpi', 'mcmi'],
      keywords: {
        id: ['klinis', 'rujukan', 'mmpi', 'mcmi', 'forensik', 'seleksi jabatan'],
        en: ['clinical', 'referral', 'mmpi', 'mcmi', 'forensic'],
      },
    },
    {
      id: 'n-tujuan',
      areaId: 'ar-diri',
      audiences: ['a-dewasa'],
      label: {
        id: 'Memetakan tujuan dan prioritas',
        en: 'Map my goals and priorities',
      },
      serviceSlugs: ['gsc'],
      keywords: {
        id: ['tujuan', 'goal', 'target', 'prioritas', 'rencana', 'jalan di tempat', 'arah hidup'],
        en: ['goal', 'goals', 'target', 'priorities', 'plan', 'stuck'],
      },
    },
    {
      id: 'n-jurusan',
      areaId: 'ar-karier',
      audiences: ['a-remaja', 'a-dewasa', 'a-akademik'],
      label: {
        id: 'Memilih jurusan kuliah',
        en: 'Choosing a university major',
      },
      serviceSlugs: ['arah-studi-karier', 'acm-y48'],
      keywords: {
        id: ['jurusan', 'kuliah', 'penjurusan', 'gap year', 'sma', 'universitas'],
        en: ['major', 'university', 'college', 'gap year', 'study choice'],
      },
    },
    {
      id: 'n-minat',
      areaId: 'ar-karier',
      audiences: ['a-remaja', 'a-dewasa'],
      label: {
        id: 'Mengenali minat dan arah karier',
        en: 'Understand my interests and career direction',
      },
      serviceSlugs: ['acm-y48', 'arah-studi-karier'],
      keywords: {
        id: ['minat', 'bakat', 'minat bakat', 'arah karier', 'cita-cita', 'karier', 'karir'],
        en: ['interest', 'interests', 'aptitude', 'career direction', 'career'],
      },
    },
    {
      id: 'n-pasangan',
      areaId: 'ar-hubungan',
      audiences: ['a-dewasa', 'a-pasangan'],
      label: {
        id: 'Konflik atau komunikasi dengan pasangan',
        en: 'Conflict or communication with a partner',
      },
      serviceSlugs: ['konseling-couple'],
      keywords: {
        id: ['pasangan', 'suami', 'istri', 'pacar', 'pernikahan', 'couple', 'hubungan', 'komunikasi', 'bertengkar'],
        en: ['partner', 'husband', 'wife', 'boyfriend', 'girlfriend', 'marriage', 'couple', 'relationship'],
      },
    },
    {
      id: 'n-pranikah',
      areaId: 'ar-hubungan',
      audiences: ['a-dewasa', 'a-pasangan'],
      label: {
        id: 'Persiapan menikah',
        en: 'Preparing for marriage',
      },
      serviceSlugs: ['prepare-enrich', 'konseling-couple'],
      keywords: {
        id: ['pranikah', 'menikah', 'nikah', 'prepare enrich', 'calon suami', 'calon istri', 'tunangan'],
        en: ['premarital', 'marriage preparation', 'engaged', 'prepare enrich', 'wedding'],
      },
    },
    {
      id: 'n-keluarga',
      areaId: 'ar-hubungan',
      audiences: ['a-dewasa', 'a-keluarga'],
      label: {
        id: 'Masalah atau konflik dalam keluarga',
        en: 'Problems or conflict within the family',
      },
      serviceSlugs: ['konseling-family'],
      keywords: {
        id: ['keluarga', 'family', 'orang tua', 'mertua', 'saudara', 'konflik keluarga'],
        en: ['family', 'parents', 'in-laws', 'siblings', 'family conflict'],
      },
    },
    {
      id: 'n-ortu-anak',
      areaId: 'ar-hubungan',
      audiences: ['a-keluarga'],
      label: {
        id: 'Hubungan orang tua dan anak',
        en: 'Parent and child relationship',
      },
      serviceSlugs: ['konseling-family', 'konseling-pendidikan', 'konseling-anak'],
      keywords: {
        id: ['orang tua dan anak', 'pola asuh', 'parenting', 'pengasuhan'],
        en: ['parent and child', 'parenting'],
      },
    },
    {
      id: 'n-remaja',
      areaId: 'ar-emosi',
      audiences: ['a-remaja'],
      label: {
        id: 'Emosi, pertemanan, atau masalah di sekolah',
        en: 'Emotions, friendships, or problems at school',
      },
      serviceSlugs: ['konseling-pendidikan', 'konseling-anak'],
      keywords: {
        id: ['remaja', 'teman', 'pertemanan', 'bully', 'perundungan', 'sekolah', 'emosi'],
        en: ['teen', 'teenager', 'friends', 'bullying', 'school'],
      },
    },
    {
      id: 'n-belajar-remaja',
      areaId: 'ar-sekolah',
      audiences: ['a-remaja'],
      label: {
        id: 'Prestasi atau cara belajar di sekolah',
        en: 'School performance or study habits',
      },
      serviceSlugs: ['konseling-pendidikan', 'tes-iq'],
      keywords: {
        id: ['prestasi', 'nilai', 'cara belajar', 'malas belajar', 'rapor'],
        en: ['grades', 'school performance', 'study habits'],
      },
    },
    {
      id: 'n-anak',
      areaId: 'ar-anak',
      audiences: ['a-anak'],
      label: {
        id: 'Perilaku atau emosi anak',
        en: "A child's behaviour or emotions",
      },
      serviceSlugs: ['konseling-anak', 'konseling-pendidikan'],
      keywords: {
        id: ['anak', 'perilaku anak', 'tantrum', 'emosi anak', 'parenting', 'pola asuh', 'rewel', 'agresif'],
        en: ['child', 'behaviour', 'behavior', 'tantrum', 'parenting'],
      },
    },
    {
      id: 'n-belajar',
      areaId: 'ar-sekolah',
      audiences: ['a-anak'],
      label: {
        id: 'Anak mengalami kesulitan belajar',
        en: 'A child has learning difficulties',
      },
      serviceSlugs: ['kesulitan-belajar', 'konseling-pendidikan'],
      keywords: {
        id: ['kesulitan belajar', 'belajar', 'membaca', 'menulis', 'berhitung', 'disleksia', 'lambat belajar'],
        en: ['learning difficulty', 'learning', 'reading', 'writing', 'maths', 'dyslexia'],
      },
    },
    {
      id: 'n-sekolah',
      areaId: 'ar-sekolah',
      audiences: ['a-anak'],
      label: {
        id: 'Kesiapan anak masuk SD',
        en: 'Readiness to start primary school',
      },
      serviceSlugs: ['kesiapan-sekolah'],
      keywords: {
        id: ['kesiapan sekolah', 'masuk sd', 'masuk sekolah', 'tk', 'sekolah dasar'],
        en: ['school readiness', 'primary school', 'kindergarten'],
      },
    },
    {
      id: 'n-akademik',
      areaId: 'ar-riset',
      audiences: ['a-akademik'],
      label: {
        id: 'Konsultasi statistik, analisis data, atau desain riset',
        en: 'Statistics, data analysis, or research design',
      },
      serviceSlugs: ['konsultasi-statistik'],
      keywords: {
        id: ['skripsi', 'tesis', 'thesis', 'disertasi', 'statistik', 'analisis data', 'penelitian', 'riset', 'spss', 'jurnal'],
        en: ['thesis', 'dissertation', 'statistics', 'data analysis', 'research', 'spss', 'publication'],
      },
    },
    {
      id: 'n-alat-ukur',
      areaId: 'ar-riset',
      audiences: ['a-akademik', 'a-instansi'],
      label: {
        id: 'Validasi alat ukur (expert judgment)',
        en: 'Validating a measurement tool (expert judgment)',
      },
      serviceSlugs: ['expert-judgment', 'konsultasi-statistik'],
      keywords: {
        id: ['expert judgment', 'validitas', 'alat ukur', 'kuesioner', 'aiken', 'cvi'],
        en: ['expert judgment', 'validity', 'questionnaire', 'measurement tool'],
      },
    },
    {
      id: 'n-kuliah',
      areaId: 'ar-kuliah',
      audiences: ['a-akademik'],
      label: {
        id: 'Stres, cemas, atau buntu saat kuliah dan menulis',
        en: 'Stress, anxiety, or feeling stuck while studying and writing',
      },
      serviceSlugs: ['konseling-dewasa', 'konsultasi-statistik'],
      keywords: {
        id: ['buntu', 'stres kuliah', 'writer block', 'menulis', 'bimbingan'],
        en: ['stuck', 'study stress', "writer's block", 'writing'],
      },
    },
    {
      id: 'n-karyawan',
      areaId: 'ar-instansi',
      audiences: ['a-instansi'],
      label: {
        id: 'Kesehatan mental karyawan atau peserta trainee',
        en: 'Mental health of employees or trainees',
      },
      serviceSlugs: ['mhcu-company', 'rmhcu'],
      keywords: {
        id: ['karyawan', 'kantor', 'perusahaan', 'instansi', 'trainee', 'well-being', 'wellbeing', 'kesejahteraan'],
        en: ['employees', 'office', 'company', 'organisation', 'trainee', 'well-being', 'wellbeing'],
      },
    },
    {
      id: 'n-rekrutmen',
      areaId: 'ar-instansi',
      audiences: ['a-instansi'],
      label: {
        id: 'Asesmen untuk rekrutmen atau onboarding',
        en: 'Assessment for recruitment or onboarding',
      },
      serviceSlugs: ['mhcu-company', 'mmpi'],
      keywords: {
        id: ['rekrutmen', 'seleksi', 'onboarding', 'calon karyawan', 'jabatan'],
        en: ['recruitment', 'selection', 'onboarding', 'hiring'],
      },
    },
  ] satisfies readonly ServiceAssistantNeed[],
} as const

export interface ServiceAssistantCriteria {
  needId?: string
  modality?: ServiceModality | 'all'
  malangOnly?: boolean
}

export interface ServiceAssistantQueryResult {
  crisisDetected: boolean
  hotlines: readonly CrisisHotline[]
  matches: PublicServiceSummary[]
  matchedNeedIds: string[]
}

const SERVICE_CONCERN_MAP: Record<string, { concernId: BookingConcernId; clientCategory: IntakeClientCategory }> = {
  'konseling-dewasa': { concernId: 'anxiety', clientCategory: 'individual' },
  'konseling-anak': { concernId: 'childDevelopment', clientCategory: 'child_teen' },
  'konseling-pendidikan': { concernId: 'academic', clientCategory: 'child_teen' },
  'konseling-couple': { concernId: 'romantic', clientCategory: 'couple' },
  'konseling-family': { concernId: 'family', clientCategory: 'family' },
  brainspotting: { concernId: 'trauma', clientCategory: 'individual' },
  'art-therapy': { concernId: 'emotionRegulation', clientCategory: 'individual' },
  'prepare-enrich': { concernId: 'romantic', clientCategory: 'couple' },
  'profil-kognitif-lengkap': { concernId: 'attention', clientCategory: 'individual' },
  'arah-studi-karier': { concernId: 'career', clientCategory: 'individual' },
  'tes-iq': { concernId: 'academic', clientCategory: 'individual' },
  'acm-y48': { concernId: 'career', clientCategory: 'individual' },
  rmhcu: { concernId: 'anxiety', clientCategory: 'individual' },
  gsc: { concernId: 'selfUnderstanding', clientCategory: 'individual' },
  proyektif: { concernId: 'selfUnderstanding', clientCategory: 'individual' },
  mmpi: { concernId: 'selfUnderstanding', clientCategory: 'individual' },
  mcmi: { concernId: 'selfUnderstanding', clientCategory: 'individual' },
  'mhcu-company': { concernId: 'career', clientCategory: 'individual' },
  'kesiapan-sekolah': { concernId: 'childDevelopment', clientCategory: 'child_teen' },
  'kesulitan-belajar': { concernId: 'academic', clientCategory: 'child_teen' },
  'konsultasi-statistik': { concernId: 'academic', clientCategory: 'individual' },
  'expert-judgment': { concernId: 'academic', clientCategory: 'individual' },
  'adhd-dewasa': { concernId: 'attention', clientCategory: 'individual' },
}

export function getServiceBookingDefaults(slug: string): {
  concernId: BookingConcernId
  clientCategory: IntakeClientCategory
} {
  return SERVICE_CONCERN_MAP[slug] ?? { concernId: 'other', clientCategory: 'individual' }
}

const matchesModalityFilter = (
  service: PublicServiceSummary,
  modality?: ServiceModality | 'all',
  malangOnly?: boolean,
): boolean => {
  if (malangOnly && !service.hasMalangBranch) return false
  if (modality && modality !== 'all' && !service.modalities.includes(modality)) return false
  return true
}

export function matchServicesForNeed(
  services: readonly PublicServiceSummary[],
  criteria: ServiceAssistantCriteria,
): PublicServiceSummary[] {
  const clientServices = services.filter((service) => service.serviceType === 'layanan')
  const need = criteria.needId
    ? SERVICE_ASSISTANT_FLOW.needs.find((candidate) => candidate.id === criteria.needId)
    : undefined

  if (!need) {
    return clientServices.filter((service) =>
      matchesModalityFilter(service, criteria.modality, criteria.malangOnly),
    )
  }

  const bySlug = new Map(clientServices.map((service) => [service.slug, service]))
  const ordered: PublicServiceSummary[] = []

  for (const slug of need.serviceSlugs) {
    const match = bySlug.get(slug)
    if (match && matchesModalityFilter(match, criteria.modality, criteria.malangOnly)) {
      ordered.push(match)
    }
  }

  if (ordered.length > 0) return ordered

  // If modality/branch filter excluded all strict slugs, return unfiltered matches for the need.
  for (const slug of need.serviceSlugs) {
    const match = bySlug.get(slug)
    if (match) ordered.push(match)
  }
  return ordered
}

const EXTRA_CRISIS_PHRASES = [
  'bunuh diri',
  'ingin mati',
  'pengen mati',
  'mau mati',
  'mengakhiri hidup',
  'menyakiti diri',
  'melukai diri',
  'self harm',
  'suicide',
  'kill myself',
  'end my life',
  'want to die',
  'hurt myself',
] as const

export function scoreServiceAssistantQuery(
  rawQuery: string,
  services: readonly PublicServiceSummary[],
  locale: 'id' | 'en' = 'id',
  criteria?: Omit<ServiceAssistantCriteria, 'needId'>,
): ServiceAssistantQueryResult {
  const normalized = rawQuery.trim().toLowerCase()
  if (!normalized) {
    return {
      crisisDetected: false,
      hotlines: [],
      matches: [],
      matchedNeedIds: [],
    }
  }

  const sharedCrisis = detectCrisisKeywords(normalized)
  const extraCrisis = EXTRA_CRISIS_PHRASES.some((phrase) => normalized.includes(phrase))
  if (sharedCrisis.isCrisisDetected || extraCrisis) {
    return {
      crisisDetected: true,
      hotlines: EMERGENCY_CRISIS_HOTLINES,
      matches: [],
      matchedNeedIds: [],
    }
  }

  const clientServices = services.filter(
    (service) =>
      service.serviceType === 'layanan'
      && matchesModalityFilter(service, criteria?.modality, criteria?.malangOnly),
  )

  const scoreBySlug = new Map<string, number>()
  const matchedNeedIds: string[] = []

  for (const need of SERVICE_ASSISTANT_FLOW.needs) {
    const keywords = [...need.keywords.id, ...need.keywords.en]
    let needHits = 0
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        needHits += kw.includes(' ') ? 3 : 2
      }
    }
    if (needHits > 0) {
      matchedNeedIds.push(need.id)
      need.serviceSlugs.forEach((slug, index) => {
        const rankBonus = Math.max(1, 3 - index)
        scoreBySlug.set(slug, (scoreBySlug.get(slug) ?? 0) + needHits * rankBonus)
      })
    }
  }

  const tokens = normalized.split(/\s+/).filter((token) => token.length >= 2)
  for (const service of clientServices) {
    const haystack = [
      service.slug,
      service.name,
      service.shortSummary ?? '',
      service.benefit ?? '',
      service.categoryName,
      service.subgroupName ?? '',
    ]
      .join(' ')
      .toLowerCase()

    let textScore = 0
    if (haystack.includes(normalized)) textScore += 4
    for (const token of tokens) {
      if (haystack.includes(token)) textScore += 1
    }
    if (textScore > 0) {
      scoreBySlug.set(service.slug, (scoreBySlug.get(service.slug) ?? 0) + textScore)
    }
  }

  const matches = clientServices
    .filter((service) => (scoreBySlug.get(service.slug) ?? 0) > 0)
    .sort((a, b) => {
      const scoreDiff = (scoreBySlug.get(b.slug) ?? 0) - (scoreBySlug.get(a.slug) ?? 0)
      if (scoreDiff !== 0) return scoreDiff
      return a.position - b.position
    })
    .slice(0, 6)

  void locale
  return {
    crisisDetected: false,
    hotlines: [],
    matches,
    matchedNeedIds,
  }
}
