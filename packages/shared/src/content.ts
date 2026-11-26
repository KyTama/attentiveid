import { Type, type Static } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'

export const CONTENT_LOCALES = ['id', 'en'] as const

export const LANDING_SECTION_ORDER = [
  'hero',
  'supportExplorer',
  'carePromise',
  'featuredPsychologists',
  'careJourney',
  'clientStories',
  'consultationReassurance',
  'frequentlyAskedQuestions',
  'closingInvitation',
] as const

export const LANDING_REPEATER_BOUNDS = {
  hero: { min: 3, max: 4 },
  supportExplorer: { min: 3, max: 6 },
  carePromise: { min: 3, max: 4 },
  careJourney: { min: 3, max: 5 },
  /** The maximum is a safety bound, not a product limit: the homepage shows `homepageCount` of them. */
  clientStories: { min: 3, max: 500 },
  frequentlyAskedQuestions: { min: 3, max: 10 },
} as const

export const PSYCHOLOGIST_LIFECYCLE_STATES = ['draft', 'active', 'inactive', 'archived'] as const
export const ARTICLE_LIFECYCLE_STATES = ['draft', 'published', 'unpublished', 'archived'] as const
export const ARTICLE_REVISION_STATES = ['draft', 'inReview', 'approved', 'rejected'] as const
export const MEDIA_LIFECYCLE_STATES = ['active', 'orphaned', 'deleted'] as const
export const PSYCHOLOGIST_SUPPORT_AREAS = ['adultClinical', 'childAdolescent', 'educational', 'psychologyScientist'] as const
export const PSYCHOLOGIST_TIERS = ['principal', 'senior', 'senior_mid', 'mid', 'consultant'] as const
export type PsychologistTier = typeof PSYCHOLOGIST_TIERS[number]
export const PRACTICE_BRANCHES = ['tbi', 'bsd', 'malang', 'online_only', 'multiple'] as const
export type PracticeBranch = typeof PRACTICE_BRANCHES[number]
export const USER_ROLES = ['superadmin', 'admin', 'psychologist'] as const
export const USER_STATUSES = ['active', 'inactive', 'suspended'] as const


const IdentifierSchema = Type.String({ minLength: 1, maxLength: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9._-]*$' })
const SlugSchema = Type.String({ minLength: 1, maxLength: 160, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' })
const NonEmptyTextSchema = Type.String({ minLength: 1, maxLength: 20_000 })
const TimestampSchema = Type.String({ minLength: 1, maxLength: 64 })
const NullableIdentifierSchema = Type.Union([IdentifierSchema, Type.Null()])
const NullableTimestampSchema = Type.Union([TimestampSchema, Type.Null()])

export const LocalizedTextSchema = Type.Object({
  id: NonEmptyTextSchema,
  en: NonEmptyTextSchema,
}, { additionalProperties: false })

export const LandingMediaSchema = Type.Object({
  reference: Type.String({ minLength: 1, maxLength: 2_048 }),
  width: Type.Optional(Type.Integer({ minimum: 1 })),
  height: Type.Optional(Type.Integer({ minimum: 1 })),
  alt: Type.Optional(LocalizedTextSchema),
}, { additionalProperties: false })

export const LandingItemSchema = Type.Object({
  id: IdentifierSchema,
  position: Type.Integer({ minimum: 0 }),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  media: Type.Optional(LandingMediaSchema),
}, { additionalProperties: false })

const sectionCopyProperties = {
  visible: Type.Boolean(),
  headline: LocalizedTextSchema,
  description: LocalizedTextSchema,
  media: Type.Optional(LandingMediaSchema),
}

export const HeroSlideLayoutSchema = Type.Union([
  Type.Literal('practice'),
  Type.Literal('pet-garden'),
  Type.Literal('big10'),
  Type.Literal('scientific-brief'),
  Type.Literal('wisdom-ella'),
])

/** Pictures a slide part may point to: files of this site only, never another address. */
const SiteMediaSchema = Type.Object({
  reference: Type.String({ minLength: 1, maxLength: 2_048, pattern: '^/?(media|images)/(?!.*\\.\\.)[A-Za-z0-9._/-]+$' }),
  width: Type.Optional(Type.Integer({ minimum: 1 })),
  height: Type.Optional(Type.Integer({ minimum: 1 })),
  alt: Type.Optional(LocalizedTextSchema),
}, { additionalProperties: false })

/** Own wording of a part. A blank language means "the built-in wording" and is kept blank. */
const HeroElementTextSchema = Type.Object({
  id: Type.String({ maxLength: 2_000 }),
  en: Type.String({ maxLength: 2_000 }),
}, { additionalProperties: false })

/** One changed part of a hero slide: hidden, reworded or with another picture. Keys are defined by the website per layout. */
export const HeroElementOverrideSchema = Type.Object({
  key: IdentifierSchema,
  hidden: Type.Optional(Type.Boolean()),
  text: Type.Optional(HeroElementTextSchema),
  media: Type.Optional(SiteMediaSchema),
}, { additionalProperties: false })

export const HeroSlideItemSchema = Type.Object({
  id: IdentifierSchema,
  visible: Type.Optional(Type.Boolean()),
  layout: Type.Optional(HeroSlideLayoutSchema),
  tabLabel: Type.Optional(LocalizedTextSchema),
  tag: LocalizedTextSchema,
  headline: LocalizedTextSchema,
  description: LocalizedTextSchema,
  location: Type.Optional(LocalizedTextSchema),
  note: Type.Optional(LocalizedTextSchema),
  steps: Type.Optional(Type.Array(LocalizedTextSchema, { minItems: 0, maxItems: 5 })),
  chips: Type.Optional(Type.Array(Type.String({ minLength: 1, maxLength: 80 }), { minItems: 0, maxItems: 6 })),
  primaryCta: LocalizedTextSchema,
  primaryCtaUrl: Type.Optional(Type.String({ maxLength: 2_048 })),
  secondaryCta: LocalizedTextSchema,
  secondaryCtaUrl: Type.Optional(Type.String({ maxLength: 2_048 })),
  media: Type.Optional(LandingMediaSchema),
  /** The photo shown on the English site; without it the English site shows `media` too. */
  mediaEn: Type.Optional(SiteMediaSchema),
  elements: Type.Optional(Type.Array(HeroElementOverrideSchema, { maxItems: 60 })),
}, { additionalProperties: false })

export const HeroCampaignThemeSchema = Type.Union([
  Type.Literal('gold'),
  Type.Literal('navy'),
  Type.Literal('blue'),
  Type.Literal('emerald'),
])

export const HeroCampaignIconSchema = Type.Union([
  Type.Literal('gift'),
  Type.Literal('calendar'),
  Type.Literal('clipboard'),
  Type.Literal('sparkles'),
  Type.Literal('shield'),
  Type.Literal('message'),
])

export const HeroCampaignItemSchema = Type.Object({
  id: IdentifierSchema,
  visible: Type.Optional(Type.Boolean()),
  theme: Type.Optional(HeroCampaignThemeSchema),
  icon: Type.Optional(HeroCampaignIconSchema),
  badge: LocalizedTextSchema,
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
  cta: LocalizedTextSchema,
  url: Type.Optional(Type.String({ maxLength: 2_048 })),
}, { additionalProperties: false })

export const HeroCampaignsSchema = Type.Object({
  visible: Type.Optional(Type.Boolean()),
  showFloatingDock: Type.Optional(Type.Boolean()),
  eyebrow: LocalizedTextSchema,
  description: LocalizedTextSchema,
  cards: Type.Array(HeroCampaignItemSchema, { minItems: 0, maxItems: 6 }),
}, { additionalProperties: false })

const HeroSectionSchema = Type.Object({
  key: Type.Literal('hero'),
  ...sectionCopyProperties,
  primaryCta: LocalizedTextSchema,
  primaryCtaUrl: Type.Optional(Type.String({ maxLength: 2_048 })),
  secondaryCta: LocalizedTextSchema,
  secondaryCtaUrl: Type.Optional(Type.String({ maxLength: 2_048 })),
  slides: Type.Optional(Type.Array(LandingMediaSchema, { minItems: 1, maxItems: 10 })),
  slideItems: Type.Optional(Type.Array(HeroSlideItemSchema, { minItems: 1, maxItems: 5 })),
  campaigns: Type.Optional(HeroCampaignsSchema),
  items: Type.Array(LandingItemSchema, {
    minItems: LANDING_REPEATER_BOUNDS.hero.min,
    maxItems: LANDING_REPEATER_BOUNDS.hero.max,
  }),
}, { additionalProperties: false })

const SupportExplorerSectionSchema = Type.Object({
  key: Type.Literal('supportExplorer'),
  ...sectionCopyProperties,
  items: Type.Array(LandingItemSchema, {
    minItems: LANDING_REPEATER_BOUNDS.supportExplorer.min,
    maxItems: LANDING_REPEATER_BOUNDS.supportExplorer.max,
  }),
}, { additionalProperties: false })

const CarePromiseSectionSchema = Type.Object({
  key: Type.Literal('carePromise'),
  ...sectionCopyProperties,
  items: Type.Array(LandingItemSchema, {
    minItems: LANDING_REPEATER_BOUNDS.carePromise.min,
    maxItems: LANDING_REPEATER_BOUNDS.carePromise.max,
  }),
}, { additionalProperties: false })

const FeaturedPsychologistsSectionSchema = Type.Object({
  key: Type.Literal('featuredPsychologists'),
  ...sectionCopyProperties,
}, { additionalProperties: false })

const CareJourneySectionSchema = Type.Object({
  key: Type.Literal('careJourney'),
  ...sectionCopyProperties,
  items: Type.Array(LandingItemSchema, {
    minItems: LANDING_REPEATER_BOUNDS.careJourney.min,
    maxItems: LANDING_REPEATER_BOUNDS.careJourney.max,
  }),
}, { additionalProperties: false })

export const TESTIMONIALS_HOMEPAGE_DEFAULT = 24
export const TESTIMONIALS_HOMEPAGE_MAX = 60

/** A short fingerprint of a testimonial's own words (FNV-1a), which stays the same through saves and reordering. */
export const testimonialKey = (item: { title: { id: string }; description: { id: string } }): string => {
  let hash = 0x811c9dc5
  for (const char of `${item.title.id.trim()}
${item.description.id.trim()}`) {
    hash = Math.imul(hash ^ char.codePointAt(0)!, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/** Which testimonials the homepage shows: the first `homepageCount` (in list order) that are not hidden. */
const TestimonialDisplaySchema = Type.Object({
  homepageCount: Type.Integer({ minimum: 3, maximum: TESTIMONIALS_HOMEPAGE_MAX }),
  /** `testimonialKey` of each hidden one. Not ids: the database gives items new ids on every save. */
  hiddenKeys: Type.Array(Type.String({ minLength: 1, maxLength: 16 }), { maxItems: 500 }),
}, { additionalProperties: false })

const ClientStoriesSectionSchema = Type.Object({
  key: Type.Literal('clientStories'),
  ...sectionCopyProperties,
  display: Type.Optional(TestimonialDisplaySchema),
  items: Type.Array(LandingItemSchema, {
    // No minimum here: visitors receive only the shown testimonials, which may be fewer than the editor asks to keep.
    minItems: 0,
    maxItems: LANDING_REPEATER_BOUNDS.clientStories.max,
  }),
}, { additionalProperties: false })

const ConsultationReassuranceSectionSchema = Type.Object({
  key: Type.Literal('consultationReassurance'),
  ...sectionCopyProperties,
  sessionLabel: LocalizedTextSchema,
  price: LocalizedTextSchema,
  priceUnit: LocalizedTextSchema,
  primaryCta: LocalizedTextSchema,
}, { additionalProperties: false })

const FrequentlyAskedQuestionsSectionSchema = Type.Object({
  key: Type.Literal('frequentlyAskedQuestions'),
  ...sectionCopyProperties,
  items: Type.Array(LandingItemSchema, {
    minItems: LANDING_REPEATER_BOUNDS.frequentlyAskedQuestions.min,
    maxItems: LANDING_REPEATER_BOUNDS.frequentlyAskedQuestions.max,
  }),
}, { additionalProperties: false })

const ClosingInvitationSectionSchema = Type.Object({
  key: Type.Literal('closingInvitation'),
  ...sectionCopyProperties,
  primaryCta: LocalizedTextSchema,
  contact: LocalizedTextSchema,
}, { additionalProperties: false })

export const LandingContentMutationSchema = Type.Object({
  sections: Type.Tuple([
    HeroSectionSchema,
    SupportExplorerSectionSchema,
    CarePromiseSectionSchema,
    FeaturedPsychologistsSectionSchema,
    CareJourneySectionSchema,
    ClientStoriesSectionSchema,
    ConsultationReassuranceSectionSchema,
    FrequentlyAskedQuestionsSectionSchema,
    ClosingInvitationSectionSchema,
  ]),
}, { additionalProperties: false })

export const LandingAggregateStateSchema = Type.Object({
  id: IdentifierSchema,
  activeDraftRevisionId: NullableIdentifierSchema,
  publishedRevisionId: NullableIdentifierSchema,
}, { additionalProperties: false })

export const LandingRevisionMetadataSchema = Type.Object({
  id: IdentifierSchema,
  sequence: Type.Integer({ minimum: 1 }),
  basedOnRevisionId: NullableIdentifierSchema,
  createdAt: TimestampSchema,
  publishedAt: NullableTimestampSchema,
  immutable: Type.Literal(true),
}, { additionalProperties: false })

export const LandingPreviewMetadataSchema = Type.Object({
  previewId: IdentifierSchema,
  landingRevisionId: IdentifierSchema,
  expiresAt: TimestampSchema,
  revokedAt: NullableTimestampSchema,
}, { additionalProperties: false })

export const PsychologistMutationSchema = Type.Object({
  slug: SlugSchema,
  name: Type.String({ minLength: 1, maxLength: 200 }),
  nickname: Type.String({ minLength: 1, maxLength: 100 }),
  credential: Type.String({ minLength: 1, maxLength: 200 }),
  tier: Type.Optional(Type.Union([
    Type.Literal('principal'),
    Type.Literal('senior'),
    Type.Literal('senior_mid'),
    Type.Literal('mid'),
    Type.Literal('consultant'),
  ])),
  primaryBranch: Type.Optional(Type.Union([
    Type.Literal('tbi'),
    Type.Literal('bsd'),
    Type.Literal('malang'),
    Type.Literal('online_only'),
    Type.Literal('multiple'),
  ])),
  acceptingNewClients: Type.Optional(Type.Boolean()),
  supportArea: Type.Union([
    Type.Literal('adultClinical'),
    Type.Literal('childAdolescent'),
    Type.Literal('educational'),
    Type.Literal('psychologyScientist'),
  ]),
  specializations: Type.Array(Type.String({ minLength: 1, maxLength: 200 }), {
    minItems: 1,
    maxItems: 20,
    uniqueItems: true,
  }),
  experienceYears: Type.Number({ minimum: 0, maximum: 80 }),
  licenseNumber: Type.String({ minLength: 1, maxLength: 100 }),
  bookingUrl: Type.String({ minLength: 1, maxLength: 2_048, pattern: '^https://' }),
  featured: Type.Boolean(),
  featuredOrder: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
}, { additionalProperties: false })

export const PsychologistRecordSchema = Type.Object({
  id: IdentifierSchema,
  status: Type.Union([
    Type.Literal('draft'),
    Type.Literal('active'),
    Type.Literal('inactive'),
    Type.Literal('archived'),
  ]),
  ...PsychologistMutationSchema.properties,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
}, { additionalProperties: false })

export const PsychologistPublicSummarySchema = Type.Object({
  id: IdentifierSchema,
  slug: SlugSchema,
  name: Type.String({ minLength: 1 }),
  nickname: Type.String({ minLength: 1 }),
  credential: Type.String({ minLength: 1 }),
  tier: Type.Optional(Type.Union([
    Type.Literal('principal'),
    Type.Literal('senior'),
    Type.Literal('senior_mid'),
    Type.Literal('mid'),
    Type.Literal('consultant'),
  ])),
  primaryBranch: Type.Optional(Type.Union([
    Type.Literal('tbi'),
    Type.Literal('bsd'),
    Type.Literal('malang'),
    Type.Literal('online_only'),
    Type.Literal('multiple'),
  ])),
  acceptingNewClients: Type.Optional(Type.Boolean()),
  supportArea: PsychologistMutationSchema.properties.supportArea,
  specializations: PsychologistMutationSchema.properties.specializations,
  experienceYears: PsychologistMutationSchema.properties.experienceYears,
  licenseNumber: Type.Optional(Type.String({ minLength: 1 })),
  bookingUrl: PsychologistMutationSchema.properties.bookingUrl,
  featured: Type.Boolean(),
  featuredOrder: PsychologistMutationSchema.properties.featuredOrder,
  shortBio: Type.Optional(Type.String({ minLength: 1 })),
  conversationQuote: Type.Optional(Type.String({ minLength: 1 })),
  media: Type.Optional(Type.Object({
    url: Type.String({ minLength: 1 }),
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    alt: LocalizedTextSchema,
  }, { additionalProperties: false })),
}, { additionalProperties: false })

export const PsychologistPublicLookupSchema = Type.Union([
  Type.Object({
    status: Type.Literal('found'),
    psychologist: PsychologistPublicSummarySchema,
  }, { additionalProperties: false }),
  Type.Object({
    status: Type.Literal('unavailable'),
    psychologist: Type.Object({
      slug: SlugSchema,
      name: Type.String({ minLength: 1 }),
      nickname: Type.String({ minLength: 1 }),
    }, { additionalProperties: false }),
  }, { additionalProperties: false }),
  Type.Object({
    status: Type.Literal('notFound'),
  }, { additionalProperties: false }),
])

export const ArticleDraftMutationSchema = Type.Object({
  slug: SlugSchema,
  title: LocalizedTextSchema,
  summary: LocalizedTextSchema,
  body: LocalizedTextSchema,
}, { additionalProperties: false })

export const ArticleStateSchema = Type.Object({
  id: IdentifierSchema,
  slug: SlugSchema,
  ownerPsychologistId: IdentifierSchema,
  status: Type.Union([
    Type.Literal('draft'),
    Type.Literal('published'),
    Type.Literal('unpublished'),
    Type.Literal('archived'),
  ]),
  draftRevisionId: NullableIdentifierSchema,
  publishedRevisionId: NullableIdentifierSchema,
}, { additionalProperties: false })

export const ArticleRevisionStateSchema = Type.Object({
  id: IdentifierSchema,
  articleId: IdentifierSchema,
  revisionNumber: Type.Integer({ minimum: 1 }),
  status: Type.Union([
    Type.Literal('draft'),
    Type.Literal('inReview'),
    Type.Literal('approved'),
    Type.Literal('rejected'),
  ]),
  ...ArticleDraftMutationSchema.properties,
  submittedAt: NullableTimestampSchema,
  approvedAt: NullableTimestampSchema,
}, { additionalProperties: false })

export const ArticlePublicLookupSchema = Type.Union([
  Type.Object({
    status: Type.Literal('found'),
    article: Type.Object({
      id: IdentifierSchema,
      slug: SlugSchema,
      title: LocalizedTextSchema,
      summary: LocalizedTextSchema,
      body: LocalizedTextSchema,
      publishedAt: TimestampSchema,
      author: Type.Optional(Type.Object({
        id: IdentifierSchema,
        name: Type.String({ minLength: 1 }),
        slug: SlugSchema,
      }, { additionalProperties: false })),
    }, { additionalProperties: false }),
  }, { additionalProperties: false }),
  Type.Object({ status: Type.Literal('notFound') }, { additionalProperties: false }),
])

export const MediaMutationSchema = Type.Object({
  reference: Type.String({ minLength: 1, maxLength: 2_048 }),
  width: Type.Integer({ minimum: 1, maximum: 100_000 }),
  height: Type.Integer({ minimum: 1, maximum: 100_000 }),
  alt: LocalizedTextSchema,
}, { additionalProperties: false })

export const MediaAttachmentMutationSchema = Type.Object({
  mediaId: IdentifierSchema,
  role: Type.String({ minLength: 1, maxLength: 64, pattern: '^[a-z][a-zA-Z0-9]*$' }),
  position: Type.Integer({ minimum: 0 }),
}, { additionalProperties: false })

export const MediaRecordSchema = Type.Object({
  id: IdentifierSchema,
  reference: Type.String({ minLength: 1, maxLength: 2_048 }),
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  alt: LocalizedTextSchema,
  ownerType: Type.String({ minLength: 1, maxLength: 64 }),
  ownerId: IdentifierSchema,
  lifecycle: Type.Union([
    Type.Literal('active'),
    Type.Literal('orphaned'),
    Type.Literal('deleted'),
  ]),
  orphanedAt: NullableTimestampSchema,
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
}, { additionalProperties: false })

export interface MediaReferencePolicy {
  publicHosts: readonly string[]
}

export type LocalizedText = Static<typeof LocalizedTextSchema>
export type LandingMedia = Static<typeof LandingMediaSchema>
export type LandingContentMutation = Static<typeof LandingContentMutationSchema>
export type PsychologistMutation = Static<typeof PsychologistMutationSchema>
export type PsychologistPublicLookup = Static<typeof PsychologistPublicLookupSchema>
export type ArticleDraftMutation = Static<typeof ArticleDraftMutationSchema>
export type ArticlePublicLookup = Static<typeof ArticlePublicLookupSchema>
export type MediaMutation = Static<typeof MediaMutationSchema>

const hasSafeItemOrdering = (items: readonly Static<typeof LandingItemSchema>[]) => {
  const itemIds = new Set(items.map((item) => item.id))
  const positions = new Set(items.map((item) => item.position))

  return itemIds.size === items.length
    && positions.size === items.length
    && items.every((item, index) => item.position === index)
}

export const validateLandingContentMutation = (value: unknown): value is LandingContentMutation => {
  if (!Value.Check(LandingContentMutationSchema, value)) {
    return false
  }

  return value.sections.every((section) => (
    'items' in section ? hasSafeItemOrdering(section.items) : true
  ))
}

export const getLandingContentMutationErrors = (value: unknown): string[] => {
  const errors: string[] = []
  const seen = new Set<string>()
  const pushError = (msg: string) => {
    if (!seen.has(msg)) {
      seen.add(msg)
      errors.push(msg)
    }
  }

  if (!Value.Check(LandingContentMutationSchema, value)) {
    for (const err of Value.Errors(LandingContentMutationSchema, value)) {
      const field = err.path.replace(/^\//, '').replace(/\//g, '.')
      pushError(`${field ? `Field '${field}': ` : ''}${err.message}`)
      if (errors.length >= 10) break
    }
  }

  const obj = value as { sections?: Array<{ key?: string; items?: Static<typeof LandingItemSchema>[] }> } | null
  if (obj && Array.isArray(obj.sections)) {
    for (const section of obj.sections) {
      if (section && Array.isArray(section.items) && !hasSafeItemOrdering(section.items)) {
        pushError(`Section '${section.key || 'unknown'}': urutan item atau ID item tidak valid.`)
      }
    }
  }

  return errors
}

function normalizeLocalizedPair(value: unknown, required: true): LocalizedText
function normalizeLocalizedPair(value: unknown, required: false): LocalizedText | undefined
function normalizeLocalizedPair(value: unknown, required: boolean): LocalizedText | undefined {
  const obj = (value && typeof value === 'object') ? value as { id?: unknown; en?: unknown } : {}
  const id = typeof obj.id === 'string' ? obj.id.trim() : ''
  const en = typeof obj.en === 'string' ? obj.en.trim() : ''

  if (id === '' && en === '') {
    return required ? { id: '', en: '' } : undefined
  }
  return {
    id: id || en,
    en: en || id,
  }
}

const sanitizeCmsIdentifier = (rawId: unknown, fallbackPrefix: string, index: number, usedIds: Set<string>): string => {
  const safePrefix = fallbackPrefix.replace(/[^A-Za-z0-9._-]/g, '-').replace(/^[^A-Za-z0-9]+/, '') || 'item'
  const candidateBase = typeof rawId === 'string'
    ? rawId.trim().replace(/[^A-Za-z0-9._-]/g, '-').replace(/^[^A-Za-z0-9]+/, '').slice(0, 100)
    : ''
  const base = candidateBase || `${safePrefix}-${index + 1}`

  let candidate = base.slice(0, 128)
  let suffix = 2
  while (usedIds.has(candidate)) {
    const suffixTag = `-${suffix}`
    candidate = `${base.slice(0, 128 - suffixTag.length)}${suffixTag}`
    suffix += 1
  }
  usedIds.add(candidate)
  return candidate
}

const normalizeLandingMediaValue = (rawMedia: unknown): LandingMedia | undefined => {
  if (!rawMedia || typeof rawMedia !== 'object') return undefined
  const media = rawMedia as Record<string, unknown>
  const reference = typeof media.reference === 'string' ? media.reference.trim() : ''
  if (!reference) return undefined

  const width = typeof media.width === 'number' && Number.isInteger(media.width) && media.width >= 1
    ? media.width
    : undefined
  const height = typeof media.height === 'number' && Number.isInteger(media.height) && media.height >= 1
    ? media.height
    : undefined
  const alt = normalizeLocalizedPair(media.alt, false)

  return {
    reference,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(alt !== undefined ? { alt } : {}),
  }
}

const normalizeRepeaterItems = (rawItems: unknown, sectionKey: string): Static<typeof LandingItemSchema>[] => {
  if (!Array.isArray(rawItems)) return []
  const usedIds = new Set<string>()
  return rawItems.map((rawItem, index) => {
    const item = (rawItem && typeof rawItem === 'object') ? rawItem as Record<string, unknown> : {}
    const media = normalizeLandingMediaValue(item.media)
    return {
      id: sanitizeCmsIdentifier(item.id, `${sectionKey}-item`, index, usedIds),
      position: index,
      title: normalizeLocalizedPair(item.title, true),
      description: normalizeLocalizedPair(item.description, true),
      ...(media !== undefined ? { media } : {}),
    }
  })
}

const normalizeHeroSlideItems = (slideList: unknown): HeroSlideItem[] | undefined => {
  if (!Array.isArray(slideList)) return undefined
  const usedIds = new Set<string>()
  return slideList.map((inputSlide, index) => {
    const slide = (inputSlide && typeof inputSlide === 'object') ? inputSlide as Record<string, unknown> : {}
    const tabLabel = normalizeLocalizedPair(slide.tabLabel, false)
    const location = normalizeLocalizedPair(slide.location, false)
    const note = normalizeLocalizedPair(slide.note, false)
    const media = normalizeLandingMediaValue(slide.media)
    const mediaEn = normalizeLandingMediaValue(slide.mediaEn)
    const elements = Array.isArray(slide.elements)
      ? slide.elements.flatMap((raw) => {
        const element = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
        if (typeof element.key !== 'string' || !element.key) return []
        const raw2 = (element.text && typeof element.text === 'object' ? element.text : {}) as Record<string, unknown>
        const words = { id: typeof raw2.id === 'string' ? raw2.id.trim() : '', en: typeof raw2.en === 'string' ? raw2.en.trim() : '' }
        // Not normalizeLocalizedPair: that copies one language into the other.
        const text = words.id || words.en ? words : undefined
        const picture = normalizeLandingMediaValue(element.media)
        const hidden = element.hidden === true
        if (!hidden && text === undefined && picture === undefined) return []
        return [{ key: element.key, ...(hidden ? { hidden } : {}), ...(text !== undefined ? { text } : {}), ...(picture !== undefined ? { media: picture } : {}) }]
      })
      : undefined
    const steps = Array.isArray(slide.steps)
      ? slide.steps
        .map((step) => normalizeLocalizedPair(step, false))
        .filter((step): step is LocalizedText => step !== undefined)
      : undefined
    const chips = Array.isArray(slide.chips)
      ? slide.chips
        .map((chip) => (typeof chip === 'string' ? chip.trim() : ''))
        .filter((chip) => chip.length > 0)
      : undefined

    return {
      id: sanitizeCmsIdentifier(slide.id, 'hero-slide', index, usedIds),
      ...(typeof slide.visible === 'boolean' ? { visible: slide.visible } : {}),
      ...(typeof slide.layout === 'string' ? { layout: slide.layout as HeroSlideLayout } : {}),
      ...(tabLabel !== undefined ? { tabLabel } : {}),
      tag: normalizeLocalizedPair(slide.tag, true),
      headline: normalizeLocalizedPair(slide.headline, true),
      description: normalizeLocalizedPair(slide.description, true),
      ...(location !== undefined ? { location } : {}),
      ...(note !== undefined ? { note } : {}),
      ...(steps !== undefined ? { steps } : {}),
      ...(chips !== undefined ? { chips } : {}),
      primaryCta: normalizeLocalizedPair(slide.primaryCta, true),
      ...(typeof slide.primaryCtaUrl === 'string' ? { primaryCtaUrl: slide.primaryCtaUrl.trim() } : {}),
      secondaryCta: normalizeLocalizedPair(slide.secondaryCta, true),
      ...(typeof slide.secondaryCtaUrl === 'string' ? { secondaryCtaUrl: slide.secondaryCtaUrl.trim() } : {}),
      ...(media !== undefined ? { media } : {}),
      ...(mediaEn !== undefined ? { mediaEn } : {}),
      ...(elements && elements.length > 0 ? { elements } : {}),
    }
  })
}

const normalizeHeroCampaignsValue = (rawCampaigns: unknown): HeroCampaigns | undefined => {
  if (!rawCampaigns || typeof rawCampaigns !== 'object') return undefined
  const campaigns = rawCampaigns as Record<string, unknown>
  const usedIds = new Set<string>()
  const cards: HeroCampaignItem[] = Array.isArray(campaigns.cards)
    ? campaigns.cards.map((rawCard, index) => {
      const card = (rawCard && typeof rawCard === 'object') ? rawCard as Record<string, unknown> : {}
      return {
        id: sanitizeCmsIdentifier(card.id, 'campaign-card', index, usedIds),
        ...(typeof card.visible === 'boolean' ? { visible: card.visible } : {}),
        ...(typeof card.theme === 'string' ? { theme: card.theme as HeroCampaignTheme } : {}),
        ...(typeof card.icon === 'string' ? { icon: card.icon as HeroCampaignIcon } : {}),
        badge: normalizeLocalizedPair(card.badge, true),
        title: normalizeLocalizedPair(card.title, true),
        description: normalizeLocalizedPair(card.description, true),
        cta: normalizeLocalizedPair(card.cta, true),
        ...(typeof card.url === 'string' ? { url: card.url.trim() } : {}),
      }
    })
    : []

  return {
    ...(typeof campaigns.visible === 'boolean' ? { visible: campaigns.visible } : {}),
    ...(typeof campaigns.showFloatingDock === 'boolean' ? { showFloatingDock: campaigns.showFloatingDock } : {}),
    eyebrow: normalizeLocalizedPair(campaigns.eyebrow, true),
    description: normalizeLocalizedPair(campaigns.description, true),
    cards,
  }
}

export const generateSafeCmsId = (prefix = 'item'): string => {
  const safePrefix = prefix.replace(/[^A-Za-z0-9._-]/g, '-').replace(/^[^A-Za-z0-9]+/, '') || 'item'
  const randomSuffix = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID().slice(0, 8)
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  return `${safePrefix}-${randomSuffix}`.slice(0, 128)
}

/**
 * Normalizes a landing CMS editor payload before saving or publishing:
 * re-indexes repeater positions, repairs duplicate/invalid identifiers,
 * fills single-language localized fallbacks, and strips extra properties.
 */
export const normalizeLandingContentMutation = <T extends { sections?: unknown }>(raw: T): T => {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.sections)) {
    return raw
  }

  const inputSections = raw.sections.filter((section): section is Record<string, unknown> => (
    Boolean(section && typeof section === 'object')
  ))

  const byKey = new Map<string, Record<string, unknown>>()
  for (const section of inputSections) {
    if (typeof section.key === 'string' && !byKey.has(section.key)) {
      byKey.set(section.key, section)
    }
  }

  const orderedSections = LANDING_SECTION_ORDER.every((key) => byKey.has(key))
    ? LANDING_SECTION_ORDER.map((key) => byKey.get(key)!)
    : inputSections

  const normalizedSections = orderedSections.map((section) => {
    const key = typeof section.key === 'string' ? section.key : ''
    const media = normalizeLandingMediaValue(section.media)
    const baseSection = {
      key,
      visible: typeof section.visible === 'boolean' ? section.visible : true,
      headline: normalizeLocalizedPair(section.headline, true),
      description: normalizeLocalizedPair(section.description, true),
      ...(media !== undefined ? { media } : {}),
    }

    if (key === 'hero') {
      const slides = Array.isArray(section.slides)
        ? section.slides
          .map((slide) => normalizeLandingMediaValue(slide))
          .filter((slide): slide is LandingMedia => slide !== undefined)
        : undefined
      const slideItems = normalizeHeroSlideItems(section.slideItems)
      const campaigns = normalizeHeroCampaignsValue(section.campaigns)
      return {
        ...baseSection,
        primaryCta: normalizeLocalizedPair(section.primaryCta, true),
        ...(typeof section.primaryCtaUrl === 'string' ? { primaryCtaUrl: section.primaryCtaUrl.trim() } : {}),
        secondaryCta: normalizeLocalizedPair(section.secondaryCta, true),
        ...(typeof section.secondaryCtaUrl === 'string' ? { secondaryCtaUrl: section.secondaryCtaUrl.trim() } : {}),
        ...(slides && slides.length > 0 ? { slides } : {}),
        ...(slideItems && slideItems.length > 0 ? { slideItems } : {}),
        ...(campaigns !== undefined ? { campaigns } : {}),
        items: normalizeRepeaterItems(section.items, key),
      }
    }

    if (key === 'clientStories') {
      const items = normalizeRepeaterItems(section.items, key)
      const raw = (section.display && typeof section.display === 'object' ? section.display : null) as Record<string, unknown> | null
      const count = Number(raw?.homepageCount)
      const keys = new Set(items.map(testimonialKey))
      return {
        ...baseSection,
        ...(raw ? {
          display: {
            homepageCount: Number.isInteger(count) ? Math.min(Math.max(count, 3), TESTIMONIALS_HOMEPAGE_MAX) : TESTIMONIALS_HOMEPAGE_DEFAULT,
            hiddenKeys: Array.isArray(raw.hiddenKeys) ? raw.hiddenKeys.filter((key): key is string => typeof key === 'string' && keys.has(key)) : [],
          },
        } : {}),
        items,
      }
    }

    if (
      key === 'supportExplorer'
      || key === 'carePromise'
      || key === 'careJourney'
      || key === 'frequentlyAskedQuestions'
    ) {
      return {
        ...baseSection,
        items: normalizeRepeaterItems(section.items, key),
      }
    }

    if (key === 'consultationReassurance') {
      return {
        ...baseSection,
        sessionLabel: normalizeLocalizedPair(section.sessionLabel, true),
        price: normalizeLocalizedPair(section.price, true),
        priceUnit: normalizeLocalizedPair(section.priceUnit, true),
        primaryCta: normalizeLocalizedPair(section.primaryCta, true),
      }
    }

    if (key === 'closingInvitation') {
      return {
        ...baseSection,
        primaryCta: normalizeLocalizedPair(section.primaryCta, true),
        contact: normalizeLocalizedPair(section.contact, true),
      }
    }

    return baseSection
  })

  return {
    sections: normalizedSections,
  } as T
}

export const validatePsychologistMutation = (value: unknown): value is PsychologistMutation => {
  if (!Value.Check(PsychologistMutationSchema, value)) {
    return false
  }

  return value.featured ? value.featuredOrder !== null : value.featuredOrder === null
}

export const FullPsychologistMutationSchema = Type.Object({
  slug: SlugSchema,
  status: Type.Union([
    Type.Literal('draft'),
    Type.Literal('active'),
    Type.Literal('inactive'),
    Type.Literal('archived'),
  ]),
  tier: Type.Optional(Type.Union([
    Type.Literal('principal'),
    Type.Literal('senior'),
    Type.Literal('senior_mid'),
    Type.Literal('mid'),
    Type.Literal('consultant'),
  ])),
  primaryBranch: Type.Optional(Type.Union([
    Type.Literal('tbi'),
    Type.Literal('bsd'),
    Type.Literal('malang'),
    Type.Literal('online_only'),
    Type.Literal('multiple'),
  ])),
  acceptingNewClients: Type.Optional(Type.Boolean()),
  name: Type.String({ minLength: 1, maxLength: 200 }),
  nickname: Type.String({ minLength: 1, maxLength: 100 }),
  credential: Type.String({ minLength: 1, maxLength: 200 }),
  licenseNumber: Type.String({ minLength: 1, maxLength: 100 }),
  experienceYears: Type.Number({ minimum: 0, maximum: 80 }),
  bookingUrl: Type.String({ minLength: 1, maxLength: 2_048, pattern: '^https://' }),
  premiumBookingUrl: Type.Optional(Type.Union([Type.String({ minLength: 1, maxLength: 2_048 }), Type.Null()])),
  consultationDuration: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  onlineRate: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
  offlineRate: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
  availableOnline: Type.Optional(Type.Boolean()),
  availableTbi: Type.Optional(Type.Boolean()),
  availableBsd: Type.Optional(Type.Boolean()),
  availableMalang: Type.Optional(Type.Boolean()),
  scheduleMon: Type.Optional(Type.Union([Type.String({ maxLength: 200 }), Type.Null()])),
  scheduleTue: Type.Optional(Type.Union([Type.String({ maxLength: 200 }), Type.Null()])),
  scheduleWed: Type.Optional(Type.Union([Type.String({ maxLength: 200 }), Type.Null()])),
  scheduleThu: Type.Optional(Type.Union([Type.String({ maxLength: 200 }), Type.Null()])),
  scheduleFri: Type.Optional(Type.Union([Type.String({ maxLength: 200 }), Type.Null()])),
  scheduleSat: Type.Optional(Type.Union([Type.String({ maxLength: 200 }), Type.Null()])),
  scheduleSun: Type.Optional(Type.Union([Type.String({ maxLength: 200 }), Type.Null()])),
  featured: Type.Boolean(),
  featuredOrder: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
  supportAreas: Type.Array(Type.Object({
    supportArea: Type.Union([
      Type.Literal('adultClinical'),
      Type.Literal('childAdolescent'),
      Type.Literal('educational'),
      Type.Literal('psychologyScientist'),
    ]),
    primary: Type.Boolean(),
  })),
  specializations: Type.Array(Type.Object({
    label: LocalizedTextSchema,
  })),
  biography: LocalizedTextSchema,
  shortBio: Type.Optional(LocalizedTextSchema),
  conversationQuote: Type.Optional(LocalizedTextSchema),
  availabilityMessage: LocalizedTextSchema,
  media: Type.Optional(Type.Object({
    reference: Type.String({ minLength: 1, maxLength: 2_048 }),
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    alt: LocalizedTextSchema,
  })),
}, { additionalProperties: false })

export type FullPsychologistMutation = Static<typeof FullPsychologistMutationSchema>

export const validateFullPsychologistMutation = (value: unknown): value is FullPsychologistMutation => {
  if (!Value.Check(FullPsychologistMutationSchema, value)) {
    return false
  }
  if (value.featured && (value.featuredOrder === undefined || value.featuredOrder === null)) {
    return false
  }
  if (!value.featured && value.featuredOrder !== null && value.featuredOrder !== undefined) {
    return false
  }
  if (value.availableOnline && (value.onlineRate === null || value.onlineRate === undefined)) {
    return false
  }
  if ((value.availableTbi || value.availableBsd || value.availableMalang) && (value.offlineRate === null || value.offlineRate === undefined)) {
    return false
  }
  return true
}

export const getFullPsychologistMutationErrors = (value: unknown): string[] => {
  const errors: string[] = []
  if (!Value.Check(FullPsychologistMutationSchema, value)) {
    for (const err of Value.Errors(FullPsychologistMutationSchema, value)) {
      const field = err.path.replace(/^\//, '').replace(/\//g, '.')
      errors.push(`${field ? `Field '${field}': ` : ''}${err.message}`)
    }
  }
  const obj = value as any
  if (obj && typeof obj === 'object') {
    if (obj.featured && (obj.featuredOrder === undefined || obj.featuredOrder === null)) {
      errors.push("Field 'featuredOrder' wajib diisi jika featured diaktifkan.")
    }
    if (!obj.featured && obj.featuredOrder !== null && obj.featuredOrder !== undefined) {
      errors.push("Field 'featuredOrder' harus null jika featured tidak diaktifkan.")
    }
    if (obj.availableOnline === true && (obj.onlineRate === null || obj.onlineRate === undefined)) {
      errors.push("Field 'onlineRate' wajib diisi jika mode online diaktifkan.")
    }
    if ((obj.availableTbi === true || obj.availableBsd === true || obj.availableMalang === true) && (obj.offlineRate === null || obj.offlineRate === undefined)) {
      errors.push("Field 'offlineRate' wajib diisi jika cabang offline diaktifkan.")
    }
  }
  return errors
}

export const validateArticleDraftMutation = (value: unknown): value is ArticleDraftMutation => (
  Value.Check(ArticleDraftMutationSchema, value)
)

export const validatePsychologistPublicLookup = (value: unknown): value is PsychologistPublicLookup => (
  Value.Check(PsychologistPublicLookupSchema, value)
)

export const validateArticlePublicLookup = (value: unknown): value is ArticlePublicLookup => (
  Value.Check(ArticlePublicLookupSchema, value)
)

const isPrivateIpv4Address = (hostname: string) => {
  const octets = hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false
  }

  const [first, second] = octets
  return first === 0
    || first === 10
    || first === 127
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168)
    || (first === 198 && (second === 18 || second === 19))
    || first >= 224
}

const isPrivateHostname = (hostname: string) => {
  const normalizedHostname = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (normalizedHostname === 'localhost'
    || normalizedHostname.endsWith('.localhost')
    || normalizedHostname.endsWith('.local')
    || normalizedHostname.endsWith('.internal')
    || normalizedHostname.endsWith('.home.arpa')) {
    return true
  }

  if (isPrivateIpv4Address(normalizedHostname)) {
    return true
  }

  if (normalizedHostname.includes(':')) {
    const mappedIpv4Address = normalizedHostname.slice(normalizedHostname.lastIndexOf(':') + 1)
    return normalizedHostname === '::'
      || normalizedHostname === '::1'
      || normalizedHostname.startsWith('fc')
      || normalizedHostname.startsWith('fd')
      || /^fe[89ab]/.test(normalizedHostname)
      || (normalizedHostname.includes('ffff:') && isPrivateIpv4Address(mappedIpv4Address))
  }

  return false
}

const isSafeObjectKey = (reference: string) => {
  if (!reference.startsWith('media/') || reference.includes('\\') || reference.includes('%')) {
    return false
  }

  const segments = reference.split('/')
  return segments.length >= 3
    && segments.every((segment) => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment))
    && segments.every((segment) => segment !== '.' && segment !== '..')
}

export const validateMediaReference = (reference: string, policy: MediaReferencePolicy) => {
  if (reference !== reference.trim() || reference.startsWith('//')) {
    return false
  }

  if (isSafeObjectKey(reference)) {
    return true
  }

  let mediaUrl: URL
  try {
    mediaUrl = new URL(reference)
  } catch {
    return false
  }

  const hostname = mediaUrl.hostname.toLowerCase()
  const allowedHosts = new Set(policy.publicHosts.map((host) => host.toLowerCase().replace(/\.$/, '')))
  let decodedPathname: string
  try {
    decodedPathname = decodeURIComponent(mediaUrl.pathname)
  } catch {
    return false
  }

  return mediaUrl.protocol === 'https:'
    && mediaUrl.username === ''
    && mediaUrl.password === ''
    && (mediaUrl.port === '' || mediaUrl.port === '443')
    && mediaUrl.search === ''
    && mediaUrl.hash === ''
    && hostname !== ''
    && !hostname.endsWith('.')
    && !isPrivateHostname(hostname)
    && allowedHosts.has(hostname)
    && decodedPathname !== '/'
    && !decodedPathname.includes('\\')
    && !decodedPathname.split('/').some((segment) => segment === '.' || segment === '..')
}

export const validateMediaMutation = (
  value: unknown,
  policy: MediaReferencePolicy,
): value is MediaMutation => (
  Value.Check(MediaMutationSchema, value)
  && validateMediaReference(value.reference, policy)
)

export const UserRoleSchema = Type.Union([Type.Literal('superadmin'), Type.Literal('admin'), Type.Literal('psychologist')])
export const UserStatusSchema = Type.Union([Type.Literal('active'), Type.Literal('inactive'), Type.Literal('suspended')])

export const EmailSchema = Type.String({ minLength: 3, maxLength: 254, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' })

export const UserDtoSchema = Type.Object({
  id: IdentifierSchema,
  email: EmailSchema,
  name: Type.String({ minLength: 1, maxLength: 120 }),
  role: UserRoleSchema,
  status: UserStatusSchema,
  psychologistId: NullableIdentifierSchema,
  lastLoginAt: NullableTimestampSchema,
  /** Minutes of inactivity before sign-out (default 15). Optional so older records and fixtures stay valid. */
  idleTimeoutMinutes: Type.Optional(Type.Integer({ minimum: 5, maximum: 120 })),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
}, { additionalProperties: false })

export const IDLE_TIMEOUT_DEFAULT_MINUTES = 15
export const IDLE_TIMEOUT_MIN_MINUTES = 5
export const IDLE_TIMEOUT_MAX_MINUTES = 120

export const CreateUserMutationSchema = Type.Object({
  email: EmailSchema,
  name: Type.String({ minLength: 1, maxLength: 120 }),
  password: Type.String({ minLength: 8, maxLength: 128 }),
  role: UserRoleSchema,
  psychologistId: Type.Optional(NullableIdentifierSchema),
}, { additionalProperties: false })

export const LoginCredentialsSchema = Type.Object({
  email: EmailSchema,
  password: Type.String({ minLength: 1, maxLength: 128 }),
}, { additionalProperties: false })

export type UserRole = typeof USER_ROLES[number]
export type UserStatus = typeof USER_STATUSES[number]
export type UserDto = Static<typeof UserDtoSchema>
export type CreateUserMutation = Static<typeof CreateUserMutationSchema>
export type LoginCredentials = Static<typeof LoginCredentialsSchema>

export type HeroSlideLayout = Static<typeof HeroSlideLayoutSchema>
export type HeroSlideItem = Static<typeof HeroSlideItemSchema>
export type HeroCampaignTheme = Static<typeof HeroCampaignThemeSchema>
export type HeroCampaignIcon = Static<typeof HeroCampaignIconSchema>
export type HeroCampaignItem = Static<typeof HeroCampaignItemSchema>
export type HeroCampaigns = Static<typeof HeroCampaignsSchema>

export const validateCreateUserMutation = (value: unknown): value is CreateUserMutation => (
  Value.Check(CreateUserMutationSchema, value)
)

export const validateLoginCredentials = (value: unknown): value is LoginCredentials => (
  Value.Check(LoginCredentialsSchema, value)
)

/** Parts that disappear with a hidden block: their words and pictures must not travel to visitors either. */
const HERO_PARTS_OF_BLOCK: Record<string, readonly string[]> = {
  sticker: ['stickerText'],
  caption: ['captionTitle', 'captionText'],
  kittensBox: ['kittens'],
  tabbyBox: ['tabby'],
  circle: ['circlePhoto'],
  normCard: ['normLabel', 'normImage'],
  typeCard: ['typeLabel', 'typeImage'],
  matchCard: ['matchTitle', 'matchText', 'matchHint', 'avatars', 'avatar1', 'avatar2', 'avatar3', 'avatar4'],
  avatars: ['avatar1', 'avatar2', 'avatar3', 'avatar4'],
  pill: ['pillText'],
  leftSheet: ['leftImage'],
  rightSheet: ['rightImage'],
  badge: ['badgeText'],
  stat: ['statNumber', 'statText', 'statSource'],
  quote: ['quoteText', 'quoteAuthor'],
  focus: ['focusTitle', 'focusList'],
  facts: ['fact1Title', 'fact1Text', 'fact2Title', 'fact2Text', 'fact3Title', 'fact3Text'],
}

/** A slide as visitors receive it: what staff hid is left out. (Tag, description and buttons are required fields and stay.) */
export const stripHiddenHeroSlide = (slide: HeroSlideItem): HeroSlideItem => {
  const hidden = new Set((slide.elements ?? []).filter((element) => element.hidden).map((element) => element.key))
  if (hidden.size === 0) return slide
  const gone = new Set([...hidden].flatMap((key) => HERO_PARTS_OF_BLOCK[key] ?? []))
  const result: HeroSlideItem = {
    ...slide,
    elements: slide.elements!
      .filter((element) => !gone.has(element.key))
      .map((element) => (element.hidden ? { key: element.key, hidden: true } : element)),
  }
  for (const field of ['location', 'note', 'steps', 'chips'] as const) if (hidden.has(field)) delete result[field]
  if (hidden.has('photo')) {
    delete result.media
    delete result.mediaEn
  }
  return result
}

export const stripHiddenHeroParts = <T extends { content: LandingContentMutation } | null>(landing: T): T => {
  if (!landing) return landing
  const sections = landing.content.sections.map((section) =>
    section.key === 'hero' && section.slideItems ? { ...section, slideItems: section.slideItems.map(stripHiddenHeroSlide) } : section)
  return { ...landing, content: { ...landing.content, sections } as LandingContentMutation }
}

/** The testimonials the homepage shows, in order. */
export const homepageTestimonials = <T extends { position: number; title: { id: string }; description: { id: string } }>(
  section: { items: readonly T[]; display?: { homepageCount: number; hiddenKeys: readonly string[] } },
): T[] => {
  const hidden = new Set(section.display?.hiddenKeys ?? [])
  return [...section.items]
    .sort((left, right) => left.position - right.position)
    .filter((item) => !hidden.has(testimonialKey(item)))
    .slice(0, section.display?.homepageCount ?? TESTIMONIALS_HOMEPAGE_DEFAULT)
}

/**
 * Visitors receive only the testimonials that are shown, however few that is. A hidden one is never sent: the client may
 * have withdrawn it. The hidden markers are not sent either.
 */
export const trimPublicTestimonials = <T extends { content: LandingContentMutation } | null>(landing: T): T => {
  if (!landing) return landing
  const sections = landing.content.sections.map((section) => {
    if (section.key !== 'clientStories') return section
    const shown = homepageTestimonials(section)
    const { display: _display, ...rest } = section
    return { ...rest, items: shown.map((item, position) => ({ ...item, position })) }
  })
  return { ...landing, content: { ...landing.content, sections } as LandingContentMutation }
}

