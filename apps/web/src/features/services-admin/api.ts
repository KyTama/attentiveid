import type {
  ServiceBranch,
  ServiceDataIssueStatus,
  ServiceLifecycleStatus,
  ServiceModality,
  ServicePricingModel,
  ServiceProgramStatus,
  ServiceProgramType,
  ServicesAdminOverviewResponse,
  ServiceType,
  ServiceVisibility,
  SuperadminPreviewCatalogResponse,
  SuperadminPreviewServiceDetail,
} from '@attentiveid/shared'
import { getActiveAuthHeaders } from '@/features/auth/auth-context'

export interface AdminServiceUpsertInput {
  id?: string
  slug: string
  categorySlug: string
  subgroupSlug?: string | null
  serviceType: ServiceType
  pricingModel: ServicePricingModel
  status: ServiceLifecycleStatus
  visibility: ServiceVisibility
  appliesNewClientFee: boolean
  isAssessment: boolean
  isFeaturedSpotlight: boolean
  position?: number
  externalUrl?: string | null
  nameId: string
  nameEn?: string
  fullNameId?: string | null
  fullNameEn?: string | null
  badgeId?: string | null
  badgeEn?: string | null
  shortSummaryId?: string | null
  shortSummaryEn?: string | null
  benefitId?: string | null
  benefitEn?: string | null
  introductionId?: string | null
  introductionEn?: string | null
  targetAudienceId?: string | null
  targetAudienceEn?: string | null
  whatIsMeasuredId?: string | null
  whatIsMeasuredEn?: string | null
  durationInfoId?: string | null
  durationInfoEn?: string | null
  locationInfoId?: string | null
  locationInfoEn?: string | null
  resultsExplanationId?: string | null
  resultsExplanationEn?: string | null
  scientificBasisId?: string | null
  scientificBasisEn?: string | null
  linkedPsychologistSlugs?: string[]
  variants?: {
    id?: string
    slug: string
    status: ServiceLifecycleStatus
    visibility: ServiceVisibility
    nameId: string
    nameEn?: string
    unitLabelId?: string | null
    durationLabelId?: string | null
    modalities: ServiceModality[]
    branch?: ServiceBranch | null
    priceOnRequest?: boolean
    publicPriceAmount?: number | null
    publicPriceMax?: number | null
  }[]
}

const getApiBaseUrl = () =>
  import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

async function authedJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...getActiveAuthHeaders(),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(body || `Request failed (${response.status})`)
  }
  return (await response.json()) as T
}

export const fetchServicesAdminOverview = (): Promise<ServicesAdminOverviewResponse> =>
  authedJson<ServicesAdminOverviewResponse>('/api/admin/services/overview', { cache: 'no-store' })

export const fetchSuperadminPreviewCatalog = (
  locale: 'id' | 'en',
): Promise<SuperadminPreviewCatalogResponse> =>
  authedJson<SuperadminPreviewCatalogResponse>(
    `/api/admin/services/preview-catalog?locale=${locale}`,
    { cache: 'no-store' },
  )

export const fetchSuperadminPreviewDetail = (
  slug: string,
  locale: 'id' | 'en',
): Promise<SuperadminPreviewServiceDetail> =>
  authedJson<SuperadminPreviewServiceDetail>(
    `/api/admin/services/preview-catalog/${encodeURIComponent(slug)}?locale=${locale}`,
    { cache: 'no-store' },
  )

export const saveAdminService = (input: AdminServiceUpsertInput) =>
  input.id
    ? authedJson<{ status: 'success'; data: { id: string; slug: string } }>(
        `/api/admin/services/${encodeURIComponent(input.id)}`,
        { method: 'PATCH', body: JSON.stringify(input) },
      )
    : authedJson<{ status: 'success'; data: { id: string; slug: string } }>('/api/admin/services', {
        method: 'POST',
        body: JSON.stringify(input),
      })

export const duplicateAdminService = (serviceId: string) =>
  authedJson<{ status: 'success'; data: { id: string; slug: string } }>(
    `/api/admin/services/${encodeURIComponent(serviceId)}/duplicate`,
    { method: 'POST' },
  )

export const saveAdminInternalCost = (
  serviceId: string,
  payload: {
    variantId?: string | null
    psychologistId?: string | null
    recordKind: 'harga' | 'fee' | 'biaya' | 'promo'
    recordStatus: 'berlaku' | 'usulan' | 'historis'
    amount: number | null
    amountMax?: number | null
    unitLabel?: string | null
    label?: string | null
    note?: string | null
    promoteToBerlaku?: boolean
  },
) =>
  authedJson<{ status: 'success'; data: { id: string } }>(
    `/api/admin/services/${encodeURIComponent(serviceId)}/costs`,
    { method: 'PUT', body: JSON.stringify(payload) },
  )

export const saveAdminProgram = (payload: {
  id?: string
  slug: string
  programType: ServiceProgramType
  status: ServiceProgramStatus
  startsOn: string
  endsOn: string
  nameId: string
  nameEn?: string
  badgeId?: string | null
  badgeEn?: string | null
  prices: { variantId: string; promoAmount: number; noteId?: string | null }[]
}) =>
  authedJson<{ status: 'success'; data: { id: string } }>('/api/admin/services/programs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateAdminProgramStatus = (programId: string, status: ServiceProgramStatus) =>
  authedJson<{ status: 'success' }>(
    `/api/admin/services/programs/${encodeURIComponent(programId)}/status`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
  )

export const updateAdminPsychologistMatrix = (
  psychologistId: string,
  payload: {
    onlineRate: number | null
    offlineRate: number | null
    availableOnline: boolean
    availableTbi: boolean
    availableBsd: boolean
    availableMalang: boolean
    acceptingNewClients: boolean
    linkedServiceSlugs: string[]
  },
) =>
  authedJson<{ status: 'success' }>(
    `/api/admin/services/psychologists/${encodeURIComponent(psychologistId)}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  )

export const updateAdminDataIssue = (
  issueId: string,
  status: ServiceDataIssueStatus,
  resolution?: string | null,
) =>
  authedJson<{ status: 'success' }>(
    `/api/admin/services/issues/${encodeURIComponent(issueId)}`,
    { method: 'PATCH', body: JSON.stringify({ status, resolution: resolution ?? null }) },
  )

export const downloadAdminServicesCsv = async (): Promise<void> => {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/services/export.csv`, {
    credentials: 'include',
    headers: getActiveAuthHeaders(),
  })
  if (!response.ok) {
    throw new Error(`CSV export failed (${response.status})`)
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'attentive-services-ledger.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
