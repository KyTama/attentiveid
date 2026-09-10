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
  clientStories: { min: 3, max: 8 },
  frequentlyAskedQuestions: { min: 3, max: 10 },
} as const

export const PSYCHOLOGIST_LIFECYCLE_STATES = ['draft', 'active', 'inactive', 'archived'] as const
export const ARTICLE_LIFECYCLE_STATES = ['draft', 'published', 'unpublished', 'archived'] as const
export const ARTICLE_REVISION_STATES = ['draft', 'inReview', 'approved', 'rejected'] as const
export const MEDIA_LIFECYCLE_STATES = ['active', 'orphaned', 'deleted'] as const
export const PSYCHOLOGIST_SUPPORT_AREAS = ['adultClinical', 'childAdolescent', 'educational'] as const
export const USER_ROLES = ['admin', 'psychologist'] as const
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

export const LandingItemSchema = Type.Object({
  id: IdentifierSchema,
  position: Type.Integer({ minimum: 0 }),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema,
}, { additionalProperties: false })

const sectionCopyProperties = {
  visible: Type.Boolean(),
  headline: LocalizedTextSchema,
  description: LocalizedTextSchema,
}

const HeroSectionSchema = Type.Object({
  key: Type.Literal('hero'),
  ...sectionCopyProperties,
  primaryCta: LocalizedTextSchema,
  secondaryCta: LocalizedTextSchema,
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

const ClientStoriesSectionSchema = Type.Object({
  key: Type.Literal('clientStories'),
  ...sectionCopyProperties,
  items: Type.Array(LandingItemSchema, {
    minItems: LANDING_REPEATER_BOUNDS.clientStories.min,
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
  supportArea: Type.Union([
    Type.Literal('adultClinical'),
    Type.Literal('childAdolescent'),
    Type.Literal('educational'),
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
  supportArea: PsychologistMutationSchema.properties.supportArea,
  specializations: PsychologistMutationSchema.properties.specializations,
  experienceYears: PsychologistMutationSchema.properties.experienceYears,
  licenseNumber: Type.Optional(Type.String({ minLength: 1 })),
  bookingUrl: PsychologistMutationSchema.properties.bookingUrl,
  featured: Type.Boolean(),
  featuredOrder: PsychologistMutationSchema.properties.featuredOrder,
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
  name: Type.String({ minLength: 1, maxLength: 200 }),
  nickname: Type.String({ minLength: 1, maxLength: 100 }),
  credential: Type.String({ minLength: 1, maxLength: 200 }),
  licenseNumber: Type.String({ minLength: 1, maxLength: 100 }),
  experienceYears: Type.Number({ minimum: 0, maximum: 80 }),
  bookingUrl: Type.String({ minLength: 1, maxLength: 2_048, pattern: '^https://' }),
  premiumBookingUrl: Type.Optional(Type.Union([Type.String({ minLength: 1, maxLength: 2_048 }), Type.Null()])),
  featured: Type.Boolean(),
  featuredOrder: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
  supportAreas: Type.Array(Type.Object({
    supportArea: Type.Union([
      Type.Literal('adultClinical'),
      Type.Literal('childAdolescent'),
      Type.Literal('educational'),
    ]),
    primary: Type.Boolean(),
  })),
  specializations: Type.Array(Type.Object({
    label: LocalizedTextSchema,
  })),
  biography: LocalizedTextSchema,
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
  return true
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

export const UserRoleSchema = Type.Union([Type.Literal('admin'), Type.Literal('psychologist')])
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
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema,
}, { additionalProperties: false })

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

export const validateCreateUserMutation = (value: unknown): value is CreateUserMutation => (
  Value.Check(CreateUserMutationSchema, value)
)

export const validateLoginCredentials = (value: unknown): value is LoginCredentials => (
  Value.Check(LoginCredentialsSchema, value)
)

