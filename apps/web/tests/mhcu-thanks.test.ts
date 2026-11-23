import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { JSDOM, VirtualConsole } from 'jsdom'
import { describe, expect, it } from 'vitest'

const HTML = readFileSync(resolve(process.cwd(), 'public/assessments-static/mhcu.html'), 'utf8')

interface Done {
  ok: boolean
  code: string
  email: string
  track?: string
  canBuy?: boolean
  reportLink?: string | null
  pricing?: unknown
}

const PRICING = { single: { price: 227000, normal: 297000 }, package3: { price: 647000, normal: 885000 }, promoUntil: '2027-04-30', promoActive: true }

/** Loads the real form page and shows its "thank you" screen for a given answer of the server. */
function thanks(done: Done, lang: 'id' | 'en' = 'id') {
  const dom = new JSDOM(HTML, { runScripts: 'dangerously', url: 'http://localhost/assessments/mhcu', pretendToBeVisual: true, virtualConsole: new VirtualConsole() })
  const w = dom.window as unknown as Window & { eval: (code: string) => unknown }
  w.eval(`S.lang=${JSON.stringify(lang)}; S.done=${JSON.stringify(done)}; show(8)`)
  const doc = dom.window.document
  const box = doc.querySelector('#fullrep') as HTMLElement
  return { dom, w, doc, box, visible: !box.classList.contains('hide'), text: box.textContent ?? '' }
}

const base: Done = { ok: true, code: 'AT-MHCU-2026-001', email: 'nadia@example.com' }

describe('thank-you screen offers the full report', () => {
  it('mandiri with a link and prices: the optional block with both prices, struck-through normal prices, the promo date and the button', () => {
    const r = thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/assessments/payment?id=AT-MHCU-2026-001&t=tok', pricing: PRICING })
    expect(r.visible).toBe(true)
    expect(r.text).toContain('Laporan lengkap (opsional)')
    expect(r.text).toContain('Laporan 1x')
    expect(r.text).toContain('Rp 227.000')
    expect(r.text).toContain('Rp 297.000')
    expect(r.text).toContain('Paket 3x')
    expect(r.text).toContain('Rp 647.000')
    expect(r.text).toContain('Rp 885.000')
    expect(r.text).toContain('Harga promo hingga 30 April 2027.')
    expect(r.box.querySelectorAll('s')).toHaveLength(2)
    const button = r.box.querySelector('a.btn') as HTMLAnchorElement
    expect(button.textContent).toBe('Dapatkan laporan lengkap')
    expect(button.getAttribute('href')).toBe('/assessments/payment?id=AT-MHCU-2026-001&t=tok')
  })

  it('without an active promo: no struck-through price and no promo sentence', () => {
    const r = thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/assessments/payment?id=X&t=y', pricing: { ...PRICING, promoActive: false, single: { price: 297000, normal: 297000 }, package3: { price: 885000, normal: 885000 } } })
    expect(r.visible).toBe(true)
    expect(r.box.querySelectorAll('s')).toHaveLength(0)
    expect(r.text).not.toContain('Harga promo hingga')
    expect(r.text).toContain('Rp 297.000')
  })

  it('in English: the button reads "Get your full analyzed report" and the dates and words are English', () => {
    const r = thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/assessments/payment?id=X&t=y', pricing: PRICING }, 'en')
    expect(r.text).toContain('Full report (optional)')
    expect(r.text).toContain('Single report')
    expect(r.text).toContain('Package of 3')
    expect(r.text).toContain('Introductory prices valid until 30 April 2027.')
    expect((r.box.querySelector('a.btn') as HTMLElement).textContent).toBe('Get your full analyzed report')
  })

  it.each([
    ['asesmen', 'Laporan lengkap sudah termasuk dalam asesmen awal Anda.'],
    ['free', 'Laporan lengkap ini gratis sebagai bagian dari free session Anda.'],
    ['paket', 'Pemeriksaan ini memakai kuota paket 3x Anda.'],
  ])('%s: only the track sentence and a link to the report access, no prices', (track, sentence) => {
    const r = thanks({ ...base, track, canBuy: false, reportLink: '/assessments/payment?id=X&t=y', pricing: null })
    expect(r.visible).toBe(true)
    expect(r.text).toContain(sentence)
    expect(r.text).not.toContain('Rp ')
    expect(r.box.querySelector('a.btn')).toBeNull()
    const link = r.box.querySelector('a.lnk') as HTMLAnchorElement
    expect(link.textContent).toBe('Lihat akses laporan')
    expect(link.getAttribute('href')).toBe('/assessments/payment?id=X&t=y')
  })

  it('the track sentences exist in English too', () => {
    const r = thanks({ ...base, track: 'free', canBuy: false, reportLink: '/a/b', pricing: null }, 'en')
    expect(r.text).toContain('This full report is free as part of your free session.')
    expect((r.box.querySelector('a.lnk') as HTMLElement).textContent).toBe('See report access')
  })

  it('shows nothing new for an old answer without the new fields', () => {
    const r = thanks(base)
    expect(r.visible).toBe(false)
    expect(r.text).toBe('')
  })

  it('shows nothing when there is no report link, or when it cannot be bought and the track has nothing to say', () => {
    expect(thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: null, pricing: PRICING }).visible).toBe(false)
    expect(thanks({ ...base, track: 'mandiri', canBuy: false, reportLink: '/assessments/payment?id=X&t=y', pricing: null }).visible).toBe(false)
    expect(thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/assessments/payment?id=X&t=y', pricing: null }).visible).toBe(false)
  })

  it('does not link to anything that is not this site or an https address', () => {
    for (const bad of ['javascript:alert(1)', 'http://evil.example/x', '//evil.example/x', 'data:text/html,hi']) {
      expect(thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: bad, pricing: PRICING }).visible).toBe(false)
    }
    expect(thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: 'https://attentiveid.com/assessments/payment?id=X&t=y', pricing: PRICING }).visible).toBe(true)
  })

  it('escapes the link so it cannot break out of the attribute', () => {
    const r = thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/x?a="onmouseover="alert(1)', pricing: PRICING })
    const button = r.box.querySelector('a.btn') as HTMLAnchorElement
    expect(button.hasAttribute('onmouseover')).toBe(false)
    expect(button.getAttribute('href')).toBe('/x?a="onmouseover="alert(1)')
  })

  it('keeps the rest of the screen: receipt, steps, the safety note, and no scores', () => {
    const r = thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/assessments/payment?id=X&t=y', pricing: PRICING })
    expect(r.doc.querySelector('#receipt')?.textContent).toContain('AT-MHCU-2026-001')
    expect(r.doc.querySelector('#receipt')?.textContent).toContain('nadia@example.com')
    expect(r.doc.querySelector('section[data-step="8"] .note.alert')?.textContent).toContain('119')
    const screen = r.doc.querySelector('section[data-step="8"]')?.textContent ?? ''
    expect(screen).not.toMatch(/MHI|Level \d|\d+,\d/)
  })

  it('the full-report block sits between the receipt and the next steps', () => {
    const r = thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/assessments/payment?id=X&t=y', pricing: PRICING })
    const kids = [...(r.doc.querySelector('section[data-step="8"] .card') as HTMLElement).children].map((el) => el.id || el.tagName)
    expect(kids.indexOf('fullrep')).toBe(kids.indexOf('receipt') + 1)
  })

  it('still keeps nothing on the device after sending', () => {
    const r = thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/assessments/payment?id=X&t=y', pricing: PRICING })
    // the real flow clears the draft when the send succeeds, then shows this screen
    r.w.eval("try { localStorage.removeItem('mhcu_draft') } catch (e) {}; store()")
    expect(r.w.localStorage.getItem('mhcu_draft')).toBeNull()
  })

  it('a new answer after an offer hides the block again (no leftovers)', () => {
    const r = thanks({ ...base, track: 'mandiri', canBuy: true, reportLink: '/assessments/payment?id=X&t=y', pricing: PRICING })
    r.w.eval(`S.done=${JSON.stringify(base)}; show(8)`)
    expect(r.box.classList.contains('hide')).toBe(true)
    expect(r.box.innerHTML).toBe('')
  })
})
