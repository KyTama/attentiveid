import { Type, type Static } from '@sinclair/typebox'
import {
  NullableNumberSchema,
  NullableStringSchema,
  PublicServiceCategorySchema,
  PublicServiceDetailSchema,
  PublicServiceProgramSchema,
  PublicServiceSubgroupSchema,
  PublicServiceSummarySchema,
  SERVICE_BRANCHES,
  SERVICE_LIFECYCLE_STATUSES,
  SERVICE_MODALITIES,
  SERVICE_PRICING_MODELS,
  SERVICE_PROGRAM_STATUSES,
  SERVICE_PROGRAM_TYPES,
  SERVICE_TYPES,
  SERVICE_VISIBILITIES,
} from './services'

export const INTERNAL_COST_KINDS = ['harga', 'fee', 'biaya', 'promo'] as const
export type InternalCostKind = typeof INTERNAL_COST_KINDS[number]

export const INTERNAL_PRICE_STATUSES = ['berlaku', 'usulan', 'historis'] as const
export type InternalPriceStatus = typeof INTERNAL_PRICE_STATUSES[number]

export const DATA_ISSUE_TYPES = ['Perlu Verifikasi', 'Perlu Dilengkapi'] as const
export type ServiceDataIssueType = typeof DATA_ISSUE_TYPES[number]

export const DATA_ISSUE_STATUSES = ['Terbuka', 'Selesai'] as const
export type ServiceDataIssueStatus = typeof DATA_ISSUE_STATUSES[number]

export const MarginCalculationSchema = Type.Object(
  {
    gross: Type.Number(),
    pct: Type.Number(),
  },
  { additionalProperties: false },
)
export type MarginCalculation = Static<typeof MarginCalculationSchema>

/** Computes gross margin (`price - fee - directCost`) matching prototype formula. */
export function computeServiceMargin(
  price: number | null | undefined,
  fee: number | null | undefined,
  directCost: number | null | undefined = 0,
): MarginCalculation | null {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null
  if (typeof fee !== 'number' || !Number.isFinite(fee)) return null
  const cost = directCost ?? 0
  if (typeof cost !== 'number' || !Number.isFinite(cost)) return null
  const gross = price - fee - cost
  const pct = (gross / price) * 100
  if (!Number.isFinite(gross) || !Number.isFinite(pct)) return null
  return { gross, pct }
}

export const InternalCostRecordSchema = Type.Object(
  {
    id: Type.String(),
    legacyId: NullableStringSchema,
    serviceId: Type.String(),
    variantId: NullableStringSchema,
    variantSlug: NullableStringSchema,
    variantName: NullableStringSchema,
    psychologistId: NullableStringSchema,
    psychologistSlug: NullableStringSchema,
    psychologistName: NullableStringSchema,
    recordKind: Type.Union(INTERNAL_COST_KINDS.map((k) => Type.Literal(k))),
    recordStatus: Type.Union(INTERNAL_PRICE_STATUSES.map((s) => Type.Literal(s))),
    amount: NullableNumberSchema,
    amountMax: NullableNumberSchema,
    unitLabel: NullableStringSchema,
    effectiveDate: NullableStringSchema,
    label: NullableStringSchema,
    note: NullableStringSchema,
    sourceMeta: NullableStringSchema,
    updatedAt: Type.String(),
  },
  { additionalProperties: false },
)
export type InternalCostRecord = Static<typeof InternalCostRecordSchema>

export interface InternalCompletenessCheck {
  label: string
  ok: boolean
}

export interface InternalVariantRow {
  id: string
  slug: string
  position: number
  status: typeof SERVICE_LIFECYCLE_STATUSES[number]
  visibility: typeof SERVICE_VISIBILITIES[number]
  nameId: string
  nameEn: string
  descriptionId: string | null
  descriptionEn: string | null
  unitLabelId: string | null
  unitLabelEn: string | null
  ageRangeLabelId: string | null
  ageRangeLabelEn: string | null
  durationLabelId: string | null
  durationLabelEn: string | null
  modalities: (typeof SERVICE_MODALITIES[number])[]
  branch: typeof SERVICE_BRANCHES[number] | null
  priceOnRequest: boolean
  publicPriceAmount: number | null
  publicPriceMax: number | null
  publicEffectiveDate: string | null
}

export interface InternalProductItem {
  id: string
  slug: string
  categoryId: string
  categorySlug: string
  categoryName: string
  subgroupId: string | null
  subgroupSlug: string | null
  subgroupName: string | null
  serviceType: typeof SERVICE_TYPES[number]
  pricingModel: typeof SERVICE_PRICING_MODELS[number]
  status: typeof SERVICE_LIFECYCLE_STATUSES[number]
  visibility: typeof SERVICE_VISIBILITIES[number]
  appliesNewClientFee: boolean
  isAssessment: boolean
  isFeaturedSpotlight: boolean
  position: number
  externalUrl: string | null
  defaultConcernId: string | null
  defaultClientCategory: string | null
  audiences: string[]
  nameId: string
  nameEn: string
  fullNameId: string | null
  fullNameEn: string | null
  badgeId: string | null
  badgeEn: string | null
  shortSummaryId: string | null
  shortSummaryEn: string | null
  benefitId: string | null
  benefitEn: string | null
  introductionId: string | null
  introductionEn: string | null
  targetAudienceId: string | null
  targetAudienceEn: string | null
  whatIsMeasuredId: string | null
  whatIsMeasuredEn: string | null
  durationInfoId: string | null
  durationInfoEn: string | null
  locationInfoId: string | null
  locationInfoEn: string | null
  resultsExplanationId: string | null
  resultsExplanationEn: string | null
  scientificBasisId: string | null
  scientificBasisEn: string | null
  processStepsId: string[]
  processStepsEn: string[]
  termsId: string[]
  termsEn: string[]
  cardImageUrl: string | null
  linkedPsychologistSlugs: string[]
  variants: InternalVariantRow[]
  completenessPct: number
  completenessChecks: InternalCompletenessCheck[]
  openIssuesCount: number
  lowestMarginPct: number | null
  lowestPriceAmount: number | null
}

export interface InternalLedgerRow {
  key: string
  serviceId: string
  serviceSlug: string
  serviceName: string
  categoryName: string
  serviceStatus: typeof SERVICE_LIFECYCLE_STATUSES[number]
  visibility: typeof SERVICE_VISIBILITIES[number]
  variantId: string
  variantSlug: string
  variantName: string
  variantStatus: typeof SERVICE_LIFECYCLE_STATUSES[number]
  unitLabel: string | null
  psychologistId: string | null
  psychologistSlug: string | null
  psychologistName: string
  berlakuPrice: number | null
  berlakuPriceMax: number | null
  priceSource: 'service_public_prices' | 'psychologist_profiles' | 'price_on_request' | 'free'
  feeAmount: number | null
  directCostAmount: number | null
  margin: MarginCalculation | null
  promoAmount: number | null
  promoProgramName: string | null
  promoMargin: MarginCalculation | null
  usulanAmounts: number[]
  historisCount: number
}

export interface InternalProgramPriceRow {
  variantId: string
  variantSlug: string
  serviceSlug: string
  serviceName: string
  variantName: string
  normalPrice: number | null
  promoAmount: number
  noteId: string | null
  noteEn: string | null
  feeAmount: number | null
  directCostAmount: number | null
  promoMargin: MarginCalculation | null
}

export interface InternalProgramRecord {
  id: string
  slug: string
  programType: typeof SERVICE_PROGRAM_TYPES[number]
  status: typeof SERVICE_PROGRAM_STATUSES[number]
  startsOn: string
  endsOn: string
  nameId: string
  nameEn: string
  badgeId: string | null
  badgeEn: string | null
  prices: InternalProgramPriceRow[]
}

export interface InternalDataIssueRecord {
  id: string
  code: string
  issueType: ServiceDataIssueType
  title: string
  detail: string
  status: ServiceDataIssueStatus
  resolution: string | null
  refs: { entity: string; id: string; label?: string | null }[]
  createdAt: string
  resolvedAt: string | null
}

export interface InternalPsychologistMatrixRow {
  id: string
  slug: string
  name: string
  nickname: string
  credential: string
  tier: string
  status: string
  primaryBranch: string
  experienceYears: number
  acceptingNewClients: boolean
  onlineRate: number | null
  offlineRate: number | null
  availableOnline: boolean
  availableTbi: boolean
  availableBsd: boolean
  availableMalang: boolean
  linkedServiceSlugs: string[]
}

export interface InternalOpsSettingsRecord {
  marginThreshold: number
  assumptions: {
    feePsikologPerJam: number
    gatewayPct: number
    iklanTesPct: number
    iklanExpertPct: number
    feeHaykal: number
  }
}

export interface InternalAuditLogItem {
  id: string
  actorEmail: string
  action: string
  entityType: string
  entitySlug: string | null
  summary: string
  createdAt: string
}

export interface ServicesAdminOverviewResponse {
  status: 'success'
  settings: InternalOpsSettingsRecord
  stats: {
    totalServices: number
    byStatus: Record<typeof SERVICE_LIFECYCLE_STATUSES[number], number>
    internalVisibilityCount: number
    lowMarginCount: number
    openIssuesCount: number
    avgCompletenessPct: number
  }
  categories: (Static<typeof PublicServiceCategorySchema> & { nameId: string; nameEn: string })[]
  subgroups: (Static<typeof PublicServiceSubgroupSchema> & { nameId: string; nameEn: string })[]
  services: InternalProductItem[]
  ledgerRows: InternalLedgerRow[]
  costRecords: InternalCostRecord[]
  programs: InternalProgramRecord[]
  issues: InternalDataIssueRecord[]
  psychologists: InternalPsychologistMatrixRow[]
  auditLogs: InternalAuditLogItem[]
}

export const InternalPreviewAnnotationSchema = Type.Object(
  {
    status: Type.Union(SERVICE_LIFECYCLE_STATUSES.map((s) => Type.Literal(s))),
    visibility: Type.Union(SERVICE_VISIBILITIES.map((v) => Type.Literal(v))),
    completenessPct: Type.Number(),
    openIssuesCount: Type.Integer(),
    lowestFeeAmount: NullableNumberSchema,
    directCostAmount: NullableNumberSchema,
    lowestMarginPct: NullableNumberSchema,
  },
  { additionalProperties: false },
)
export type InternalPreviewAnnotation = Static<typeof InternalPreviewAnnotationSchema>

export const SuperadminPreviewServiceSummarySchema = Type.Object(
  {
    ...PublicServiceSummarySchema.properties,
    internalMeta: InternalPreviewAnnotationSchema,
  },
  { additionalProperties: false },
)
export type SuperadminPreviewServiceSummary = Static<typeof SuperadminPreviewServiceSummarySchema>

export const SuperadminPreviewServiceDetailSchema = Type.Object(
  {
    ...PublicServiceDetailSchema.properties,
    internalMeta: InternalPreviewAnnotationSchema,
    costBreakdown: Type.Array(InternalCostRecordSchema),
  },
  { additionalProperties: false },
)
export type SuperadminPreviewServiceDetail = Static<typeof SuperadminPreviewServiceDetailSchema>

export const SuperadminPreviewCatalogResponseSchema = Type.Object(
  {
    locale: Type.Union([Type.Literal('id'), Type.Literal('en')]),
    marginThreshold: Type.Number(),
    categories: Type.Array(PublicServiceCategorySchema),
    subgroups: Type.Array(PublicServiceSubgroupSchema),
    activePrograms: Type.Array(PublicServiceProgramSchema),
    services: Type.Array(SuperadminPreviewServiceSummarySchema),
  },
  { additionalProperties: false },
)
export type SuperadminPreviewCatalogResponse = Static<typeof SuperadminPreviewCatalogResponseSchema>

const CSV_FORMULA_PREFIXES = new Set(['=', '+', '-', '@', '\t', '\r'])

/** Neutralizes spreadsheet formula injection (OWASP CSV injection prevention). */
export function sanitizeCsvCell(value: unknown): string {
  const raw = value == null ? '' : String(value)
  const trimmedStart = raw.replace(/^ +/, '')
  const safe =
    raw.length > 0 && (CSV_FORMULA_PREFIXES.has(raw[0]!) || CSV_FORMULA_PREFIXES.has(trimmedStart[0] ?? ''))
      ? `'${raw}`
      : raw
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

export function buildInternalLedgerCsv(rows: readonly InternalLedgerRow[]): string {
  const header = [
    'Produk',
    'Slug',
    'Kategori',
    'Status Produk',
    'Visibilitas',
    'Varian',
    'Penyedia',
    'Harga Berlaku',
    'Fee Penyedia',
    'Biaya Langsung',
    'Margin Kotor (Rp)',
    'Margin (%)',
    'Harga Promo',
    'Program',
    'Usulan',
    'Jumlah Historis',
  ]
  const lines = [header.map(sanitizeCsvCell).join(',')]
  for (const row of rows) {
    lines.push(
      [
        row.serviceName,
        row.serviceSlug,
        row.categoryName,
        row.serviceStatus,
        row.visibility,
        row.variantName,
        row.psychologistName,
        row.berlakuPrice ?? '',
        row.feeAmount ?? '',
        row.directCostAmount ?? '',
        row.margin ? Math.round(row.margin.gross) : '',
        row.margin ? row.margin.pct.toFixed(1) : '',
        row.promoAmount ?? '',
        row.promoProgramName ?? '',
        row.usulanAmounts.join(' / '),
        row.historisCount,
      ]
        .map(sanitizeCsvCell)
        .join(','),
    )
  }
  return `\uFEFF${lines.join('\r\n')}`
}
