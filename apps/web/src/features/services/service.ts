import type {
  PublicServiceCatalogResponse,
  PublicServiceDetail,
  PublicServiceVariantPricing,
  ServicePricingModel,
} from '@attentiveid/shared'

const apiBaseUrl = () =>
  import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '')

export async function fetchPublicServicesCatalog(
  locale: 'id' | 'en',
): Promise<PublicServiceCatalogResponse> {
  const response = await fetch(`${apiBaseUrl()}/api/content/services?locale=${locale}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch services catalog (${response.status})`)
  }
  const body = (await response.json()) as {
    status?: string
    catalog?: PublicServiceCatalogResponse
  }
  if (!body.catalog) {
    throw new Error('Services catalog payload is missing')
  }
  return body.catalog
}

export async function fetchPublicServiceDetail(
  slug: string,
  locale: 'id' | 'en',
): Promise<PublicServiceDetail | null> {
  const response = await fetch(
    `${apiBaseUrl()}/api/content/services/${encodeURIComponent(slug)}?locale=${locale}`,
  )
  if (response.status === 404) {
    return null
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch service detail (${response.status})`)
  }
  const body = (await response.json()) as {
    status?: string
    service?: PublicServiceDetail
  }
  return body.service ?? null
}

export function formatIdr(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export interface FormattedPriceDisplay {
  primary: string
  strikeThrough: string | null
  hasPromo: boolean
  isFree: boolean
  isOnRequest: boolean
}

export function formatServicePriceDisplay(
  pricing: PublicServiceVariantPricing,
  pricingModel: ServicePricingModel,
  locale: 'id' | 'en',
  priceOnRequest = false,
): FormattedPriceDisplay {
  if (pricingModel === 'free_external' || pricing.minAmount === 0) {
    return {
      primary: locale === 'en' ? 'Free' : 'Gratis',
      strikeThrough: null,
      hasPromo: false,
      isFree: true,
      isOnRequest: false,
    }
  }

  if (priceOnRequest || pricingModel === 'price_on_request' || pricing.minAmount === null) {
    return {
      primary: locale === 'en' ? 'Confirm with Admin' : 'Konfirmasi Admin',
      strikeThrough: null,
      hasPromo: false,
      isFree: false,
      isOnRequest: true,
    }
  }

  const baseRange =
    pricing.isRange && pricing.maxAmount !== null && pricing.maxAmount > pricing.minAmount
      ? `${formatIdr(pricing.minAmount)} – ${formatIdr(pricing.maxAmount)}`
      : formatIdr(pricing.minAmount)

  if (pricing.promoAmount !== null && pricing.promoAmount < pricing.minAmount) {
    return {
      primary: formatIdr(pricing.promoAmount),
      strikeThrough: baseRange,
      hasPromo: true,
      isFree: false,
      isOnRequest: false,
    }
  }

  return {
    primary: pricing.variesByProvider
      ? `${locale === 'en' ? 'From' : 'Mulai'} ${baseRange}`
      : baseRange,
    strikeThrough: null,
    hasPromo: false,
    isFree: false,
    isOnRequest: false,
  }
}
