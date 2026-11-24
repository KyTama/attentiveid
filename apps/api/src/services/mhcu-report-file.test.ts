import { describe, expect, test } from 'bun:test'
import { loadReportAssets, makeStandaloneReport } from './mhcu-report-file'

describe('standalone report file', () => {
    test('writes the logo and the font into the page', () => {
        const html = '<style>@font-face{src:url(/fonts/montserrat-latin-variable.woff2) format("woff2")}</style><img src="/images/reports/attentive-logo.png"><img src="/images/reports/attentive-logo.png">'
        const out = makeStandaloneReport(html, { logoDataUri: 'data:image/png;base64,AAA', fontDataUri: 'data:font/woff2;base64,BBB' })
        expect(out).not.toContain('src="/images/reports/')
        expect(out).not.toContain('url(/fonts/')
        expect(out.match(/data:image\/png;base64,AAA/g)).toHaveLength(2)
        expect(out).toContain('url(data:font/woff2;base64,BBB)')
    })

    test('a file that could not be fetched stays a normal link', async () => {
        const assets = await loadReportAssets('https://nowhere.example', async () => new Response('nope', { status: 404 }))
        expect(assets).toEqual({ logoDataUri: null, fontDataUri: null })
        expect(makeStandaloneReport('<img src="/images/reports/attentive-logo.png">', assets)).toContain('src="/images/reports/attentive-logo.png"')
    })
})
