import { describe, expect, it } from 'bun:test'
import { MHCU_ANSWER_RANGE, MHCU_ITEMS, mhcuCode, scoreMhcu } from '@attentiveid/shared'
import { buildMhcuResultEmail, mhcuEmailSections } from './mhcu-result-email'
import { detectProofType, paymentLink, paymentToken, priceFor, verifyPaymentToken } from './assessment-payment'

const answers = (overrides: Record<string, number> = {}) => {
    const a: Record<string, number> = {}
    for (const item of MHCU_ITEMS) a[mhcuCode(item.part, item.n)] = MHCU_ANSWER_RANGE[item.part].min
    return { ...a, ...overrides }
}

describe('MHCU result e-mail', () => {
    const scores = scoreMhcu(answers())
    const link = 'https://attentiveid.com/assessments/payment?id=AT-MHCU-2026-100&t=abc'

    it('shows the four sections with score and category, in Indonesian by default', () => {
        const sections = mhcuEmailSections(scores, 'id')
        expect(sections.map((section) => section.key)).toEqual(['di', 'wi', 'bhi', 'ati'])
        for (const section of sections) {
            expect(section.score).toMatch(/\/ 100|–/)
            expect(section.category.length).toBeGreaterThan(0)
        }
        const mail = buildMhcuResultEmail({ name: 'Rina', code: 'AT-MHCU-2026-100', lang: 'id', scores, reportLink: link, level: 1 })
        expect(mail.subject).toContain('AT-MHCU-2026-100')
        for (const word of ['Distress Index', 'Well-being Index', 'Behavioral Health Index', 'Attentive Personality Index']) {
            expect(mail.html).toContain(word)
            expect(mail.text).toContain(word)
        }
        expect(mail.html).toContain('Dapatkan Laporan Lengkap Anda di Sini!')
        expect(mail.html).toContain(link.replace(/&/g, '&amp;'))
        expect(mail.text).toContain(link)
    })

    it('uses the requested button text in English', () => {
        const mail = buildMhcuResultEmail({ name: 'Rina', code: 'AT-MHCU-2026-100', lang: 'en', scores, reportLink: link, level: 1 })
        expect(mail.html).toContain('Get Your Full Analyzed Report Here!')
        expect(mail.subject).toContain('result')
    })

    it('escapes the name, never shows the clinical level or red-flag reasons, and adds the safety note only for higher levels', () => {
        const worrying = scoreMhcu(answers({ [mhcuCode('cc', 11)]: 3 }))
        const mail = buildMhcuResultEmail({ name: '<b>Rina</b>', code: 'AT-MHCU-2026-100', lang: 'id', scores: worrying, reportLink: link, level: worrying.level })
        expect(mail.html).not.toContain('<b>Rina</b>')
        expect(mail.html).toContain('&lt;b&gt;Rina&lt;/b&gt;')
        expect(mail.html).toContain('119')
        expect(mail.html).not.toContain('CC11')
        expect(mail.html).not.toContain('Prioritas')
        const calm = buildMhcuResultEmail({ name: 'Rina', code: 'X', lang: 'id', scores, reportLink: link, level: 1 })
        expect(calm.html).not.toContain('119')
    })

    it('survives a result with missing scores', () => {
        const mail = buildMhcuResultEmail({ name: 'Rina', code: 'X', lang: 'id', scores: {}, reportLink: link, level: null })
        expect(mail.html).toContain('–')
    })
})

describe('payment link and proof rules', () => {
    it('signs the link so it only works for its own result code', () => {
        const token = paymentToken('secret-secret-secret-secret-1234', 'AT-MHCU-2026-100')
        expect(verifyPaymentToken('secret-secret-secret-secret-1234', 'AT-MHCU-2026-100', token)).toBe(true)
        expect(verifyPaymentToken('secret-secret-secret-secret-1234', 'AT-MHCU-2026-101', token)).toBe(false)
        expect(verifyPaymentToken('another-secret-another-secret-12', 'AT-MHCU-2026-100', token)).toBe(false)
        expect(verifyPaymentToken('secret-secret-secret-secret-1234', 'AT-MHCU-2026-100', 'short')).toBe(false)
        expect(verifyPaymentToken('secret-secret-secret-secret-1234', 'AT-MHCU-2026-100', undefined)).toBe(false)
        const url = paymentLink('https://attentiveid.com/', 'secret-secret-secret-secret-1234', 'AT-MHCU-2026-100', 'en')
        expect(url).toBe(`https://attentiveid.com/assessments/payment?id=AT-MHCU-2026-100&t=${token}&lang=en`)
    })

    it('uses the introductory price until 30 April 2027 and the normal price after', () => {
        expect(priceFor('single', new Date('2026-12-01T00:00:00Z'))).toBe(227_000)
        expect(priceFor('package3', new Date('2026-12-01T00:00:00Z'))).toBe(647_000)
        expect(priceFor('single', new Date('2027-05-02T00:00:00Z'))).toBe(297_000)
    })

    it('recognises proofs by their content, not their name', () => {
        const pad = Buffer.alloc(32)
        expect(detectProofType(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47]), pad]))).toBe('image/png')
        expect(detectProofType(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), pad]))).toBe('image/jpeg')
        expect(detectProofType(Buffer.concat([Buffer.from('%PDF-1.7'), pad]))).toBe('application/pdf')
        expect(detectProofType(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), pad]))).toBe('image/webp')
        expect(detectProofType(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull()
        expect(detectProofType(Buffer.from('GIF89a' + 'x'.repeat(30)))).toBeNull()
    })
})

describe('result e-mail on a phone', () => {
    it('lets the score cells wrap so the table fits a 320 px screen', () => {
        const mail = buildMhcuResultEmail({ name: 'Rina', code: 'X', lang: 'id', scores: scoreMhcu(answers()), reportLink: 'https://attentiveid.com/assessments/payment?id=X&t=y', level: 1 })
        expect(mail.html).not.toContain('white-space:nowrap')
    })
})

describe('result e-mail looks like a calm, trustworthy message', () => {
    const scores = scoreMhcu(answers())
    const link = 'https://attentiveid.com/assessments/payment?id=AT-MHCU-2026-100&t=abcdefghijklmnopqrstuvwx'
    const when = new Date('2026-11-22T03:49:00Z')

    it('does not show the long token link in the text, only behind the button', () => {
        const mail = buildMhcuResultEmail({ name: 'Rina', code: 'AT-MHCU-2026-100', lang: 'id', scores, reportLink: link, level: 1, submittedAt: when, email: 'rina@example.com' })
        const escaped = link.replace(/&/g, '&amp;')
        expect(mail.html.split(escaped).length - 1).toBe(1) // only the button's href
        expect(mail.html).not.toContain('abcdefghijklmnopqrstuvwx</')
        expect(mail.text).toContain(link) // plain-text readers still get the link
    })

    it('says when and why the person got it and that Attentive never asks for passwords', () => {
        const id = buildMhcuResultEmail({ name: 'Rina', code: 'X', lang: 'id', scores, reportLink: link, level: 1, submittedAt: when, email: 'rina@example.com' })
        expect(id.html).toContain('22 November 2026, 10.49 WIB')
        expect(id.html).toContain('rina@example.com')
        expect(id.html).toContain('tidak pernah meminta kata sandi')
        const en = buildMhcuResultEmail({ name: 'Rina', code: 'X', lang: 'en', scores, reportLink: link, level: 1, submittedAt: when, email: 'rina@example.com' })
        expect(en.html).toContain('22 November 2026, 10.49 WIB')
        expect(en.html).toContain('never asks for passwords')
    })

    it('puts the safety information before the offer, in a calm box (no red alarm styling)', () => {
        const worrying = scoreMhcu(answers({ [mhcuCode('cc', 11)]: 3 }))
        const mail = buildMhcuResultEmail({ name: 'Rina', code: 'X', lang: 'id', scores: worrying, reportLink: link, level: worrying.level })
        expect(mail.html.indexOf('119')).toBeGreaterThan(0)
        expect(mail.html.indexOf('119')).toBeLessThan(mail.html.indexOf('Langkah berikutnya'))
        expect(mail.html).not.toContain('#B42318')
        expect(mail.html).not.toContain('#FEF3F2')
    })

    it('states plainly that the full report is optional and paid', () => {
        const mail = buildMhcuResultEmail({ name: 'Rina', code: 'X', lang: 'id', scores, reportLink: link, level: 1 })
        expect(mail.html).toContain('berbayar')
        expect(mail.html).toContain('opsional')
    })
})
