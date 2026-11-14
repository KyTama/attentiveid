/** First-party booking attribution, kept in sessionStorage across navigation. */

export const ATTRIBUTION_STORAGE_KEY = 'attentive_utm'

export interface Attribution {
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  campaignId: string
  adsetId: string
  adId: string
}

const PARAM_MAP: [keyof Attribution, string][] = [
  ['utmSource', 'utm_source'],
  ['utmMedium', 'utm_medium'],
  ['utmCampaign', 'utm_campaign'],
  ['utmContent', 'utm_content'],
  ['utmTerm', 'utm_term'],
  ['campaignId', 'campaign_id'],
  ['adsetId', 'adset_id'],
  ['adId', 'ad_id'],
]

export const EMPTY_ATTRIBUTION: Attribution = {
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmContent: '',
  utmTerm: '',
  campaignId: '',
  adsetId: '',
  adId: '',
}

const hasAny = (a: Attribution) => Object.values(a).some((v) => v !== '')

export function parseAttribution(search: string): Attribution {
  const params = new URLSearchParams(search)
  const out = { ...EMPTY_ATTRIBUTION }
  for (const [key, param] of PARAM_MAP) {
    out[key] = (params.get(param) ?? '').trim()
  }
  return out
}

/**
 * Tagged visits replace the prior snapshot wholly (avoiding cross-campaign mixing);
 * untagged visits preserve any earlier in-session attribution snapshot.
 */
export function resolveAttribution(previous: Attribution | null, visit: Attribution): Attribution {
  if (hasAny(visit)) return visit
  return previous ?? { ...EMPTY_ATTRIBUTION }
}

function readStoredAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Attribution>
    const out = { ...EMPTY_ATTRIBUTION }
    for (const [key] of PARAM_MAP) {
      out[key] = typeof parsed[key] === 'string' ? parsed[key]! : ''
    }
    return out
  } catch {
    return null
  }
}

export function captureAttribution(search?: string): Attribution {
  if (typeof window === 'undefined') return { ...EMPTY_ATTRIBUTION }
  const query = search ?? window.location.search
  const result = resolveAttribution(readStoredAttribution(), parseAttribution(query))
  if (hasAny(result)) {
    try {
      window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(result))
    } catch {
      // sessionStorage quota or private browsing restriction — safe to ignore
    }
  }
  return result
}
