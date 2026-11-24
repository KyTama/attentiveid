/**
 * The released report as ONE self-contained HTML file (for Google Drive): the logo and the Montserrat font are written into the file,
 * so it looks the same offline as on the site. It is the same markup as the page the participant opens, so "Save as PDF" in the file
 * prints exactly what the page prints.
 */

import { FONT_URL, LOGO_URL } from '../reports/mhcu/html'

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>

export interface ReportAssets {
    logoDataUri: string | null
    fontDataUri: string | null
}

let cache: { origin: string; assets: ReportAssets } | null = null

const dataUri = async (url: string, mime: string, fetchImpl: Fetcher): Promise<string | null> => {
    try {
        const response = await fetchImpl(url)
        if (!response.ok) return null
        return `data:${mime};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`
    } catch {
        return null
    }
}

/** Fetches the logo and the font from the public site once and keeps them. A missing file only means that file stays a normal link. */
export const loadReportAssets = async (siteOrigin: string, fetchImpl: Fetcher = fetch): Promise<ReportAssets> => {
    const origin = siteOrigin.replace(/\/$/, '')
    if (cache && cache.origin === origin && cache.assets.logoDataUri && cache.assets.fontDataUri) return cache.assets
    const assets = {
        logoDataUri: await dataUri(`${origin}${LOGO_URL}`, 'image/png', fetchImpl),
        fontDataUri: await dataUri(`${origin}${FONT_URL}`, 'font/woff2', fetchImpl),
    }
    cache = { origin, assets }
    return assets
}

/** Writes the logo and font into a report page. */
export const makeStandaloneReport = (html: string, assets: ReportAssets): string => {
    let out = html
    if (assets.logoDataUri) out = out.replaceAll(`src="${LOGO_URL}"`, `src="${assets.logoDataUri}"`)
    if (assets.fontDataUri) out = out.replaceAll(`url(${FONT_URL})`, `url(${assets.fontDataUri})`)
    return out
}
