import { describe, expect, test } from 'bun:test'
import { findBrowser, renderPdf } from './pdf-render'

describe('PDF engine', () => {
    test('CHROMIUM_PATH wins when the file exists, otherwise the usual places are searched', () => {
        expect(findBrowser({ CHROMIUM_PATH: process.execPath })).toBe(process.execPath)
        expect(findBrowser({ CHROMIUM_PATH: '/nowhere/chromium' })).not.toBe('/nowhere/chromium')
    })

    // Runs only where a Chromium, Chrome or Edge is installed (a developer machine); the production image installs Chromium.
    const hasBrowser = findBrowser() !== null
    test.skipIf(!hasBrowser)('prints an HTML page to a real A4 PDF', async () => {
        const html = '<!doctype html><meta charset="utf-8"><style>@page{size:595.28pt 841.89pt;margin:0}body{margin:0}.page{height:800pt;overflow:hidden;page-break-after:always}.page:last-child{page-break-after:auto}</style><div class="page"><h1>Halo</h1></div><div class="page"><p>Halaman dua</p></div>'
        const pdf = await renderPdf(html)
        const text = Buffer.from(pdf).toString('latin1')
        expect(text.startsWith('%PDF')).toBe(true)
        expect((text.match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(2)
        expect(text).toMatch(/\/MediaBox\s*\[0 0 594\.9\d* 841\.9\d*\]/)
    }, 60_000)
})
