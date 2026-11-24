import { describe, expect, it } from 'bun:test'
import { MHCU_ANSWER_RANGE, MHCU_ITEMS, mhcuCode, scoreMhcu } from '@attentiveid/shared'
import { buildMhcuResultEmail, formatSubmittedDate } from './mhcu-result-email'
import { detectProofType, paymentLink, paymentToken, priceFor, verifyPaymentToken } from './assessment-payment'

const answers = (overrides: Record<string, number> = {}) => {
    const a: Record<string, number> = {}
    for (const item of MHCU_ITEMS) a[mhcuCode(item.part, item.n)] = MHCU_ANSWER_RANGE[item.part].min
    return { ...a, ...overrides }
}
const link = 'https://attentiveid.com/assessments/payment?id=AT-MHCU-2026-120&t=abcdefghijklmnopqrstuvwx'
const when = new Date('2026-11-19T03:00:00Z')
const today = new Date('2026-12-01T00:00:00Z')

describe('MHCU result e-mail (team template: Pemeriksaan mandiri)', () => {
    it('shows the Mental Health Index and the status level, and nothing of the DI, WI, BHI or ATI scores', () => {
        const scores = { ...scoreMhcu(answers()), mhi: 78.3, level: 1 }
        const mail = buildMhcuResultEmail({ name: 'Andini Rahmawati', code: 'AT-MHCU-2026-120', lang: 'id', scores, level: 1, reportLink: link, submittedAt: when, today })
        expect(mail.subject).toContain('AT-MHCU-2026-120')
        expect(mail.html).toContain('RINGKASAN HASIL | AT-MHCU-2026-120')
        expect(mail.html).toContain('Hasil Mental Health Check-Up Anda')
        expect(mail.html).toContain('Yth. Andini Rahmawati, terima kasih telah mengikuti Mental Health Check-Up pada 19 November 2026.')
        expect(mail.html).toContain('MENTAL HEALTH INDEX')
        expect(mail.html).toContain('78,3')
        expect(mail.html).toContain('dari 100 (semakin tinggi semakin baik)')
        expect(mail.html).toContain('Level 1 dari 5: Baik')
        expect(mail.html).toContain('SKALA STATUS')
        expect(mail.html).toContain('POSISI MHI PADA RENTANG ACUAN')
        expect(mail.html).toContain('Apa yang diukur MHI?')
        expect(mail.html).not.toContain('Tingkat keluhan')
        expect(mail.html).not.toContain('Kesejahteraan')
        expect(mail.html).not.toContain('/ 100')
    })

    it('highlights the level on the scale and puts the marker at the MHI position', () => {
        const mail = buildMhcuResultEmail({ name: 'Maya', code: 'X', lang: 'id', scores: { mhi: 54.2, level: 4 }, level: 4, reportLink: link, submittedAt: when, today })
        expect(mail.html).toContain('bgcolor="#142B51" style="background:#142B51;padding:8px 2px;font-size:10.5px;line-height:1.3;color:#FFFFFF;font-weight:bold;border-right:2px solid #FFFFFF">4<br>Perlu Perhatian Serius')
        expect(mail.html).toContain('<td width="51%" style="font-size:1px">&nbsp;</td><td width="6%"')
        expect(mail.html).toContain('54,2<br>&#9660;')
    })

    it('tells levels 4 and 5 that a psychologist will contact them, and puts the 119 advice in the disclaimer for the others', () => {
        const high = buildMhcuResultEmail({ name: 'Maya', code: 'X', lang: 'id', scores: { mhi: 54.2, level: 4 }, level: 4, reportLink: link, today })
        expect(high.html).toContain('<b>Psikolog Attentive akan segera menghubungi Anda.</b>')
        const priority = buildMhcuResultEmail({ name: 'Maya', code: 'X', lang: 'id', scores: { mhi: 38.3, level: 5 }, level: 5, reportLink: link, today })
        expect(priority.html).toContain('Psikolog Attentive akan segera menghubungi Anda.')
        expect(priority.html).toContain('Level 5 dari 5: Prioritas')
        const low = buildMhcuResultEmail({ name: 'Maya', code: 'X', lang: 'id', scores: { mhi: 78.3, level: 1 }, level: 1, reportLink: link, today })
        expect(low.html).not.toContain('akan segera menghubungi')
        expect(low.html).toContain('segera hubungi layanan darurat medis 119')
    })

    it('offers the report with the team prices and the buy button', () => {
        const mail = buildMhcuResultEmail({ name: 'Maya', code: 'AT-MHCU-2026-121', lang: 'id', scores: { mhi: 54.2, level: 4 }, level: 4, reportLink: link, today })
        expect(mail.html).toContain('Laporan lengkap AT-MHCU-2026-121')
        for (const price of ['Rp 227.000', 'Rp 297.000', 'Rp 647.000', 'Rp 885.000']) expect(mail.html).toContain(price)
        expect(mail.html).toContain('Harga promo berlaku hingga 30 April 2027.')
        expect(mail.html).toContain('Beli laporan lengkap')
        expect(mail.html).toContain('Pembayaran dikonfirmasi oleh admin kami.')
        expect(mail.html).toContain(link.replace(/&/g, '&amp;'))
        expect(mail.text).toContain(link)
        expect(mail.html).toContain('Email ini bersifat rahasia dan hanya ditujukan kepada penerima.')
    })

    it('shows only the normal price after the introductory period', () => {
        const mail = buildMhcuResultEmail({ name: 'Maya', code: 'X', lang: 'id', scores: { mhi: 60, level: 2 }, level: 2, reportLink: link, today: new Date('2027-06-01T00:00:00Z') })
        expect(mail.html).toContain('Rp 297.000')
        expect(mail.html).not.toContain('Rp 227.000')
        expect(mail.html).not.toContain('Harga promo')
    })

    it('uses a hosted logo, because mail apps do not show embedded images', () => {
        const mail = buildMhcuResultEmail({ name: 'Maya', code: 'X', lang: 'id', scores: { mhi: 60, level: 2 }, level: 2, reportLink: link, siteOrigin: 'https://attentiveid.com/' })
        expect(mail.html).toContain('src="https://attentiveid.com/images/assessments/attentive-logo-light.png"')
        expect(mail.html).not.toContain('data:image')
    })

    it('comes in English, escapes the name and survives a missing score', () => {
        const mail = buildMhcuResultEmail({ name: '<b>Rina</b>', code: 'X', lang: 'en', scores: {}, level: null, reportLink: link, submittedAt: when, today })
        expect(mail.html).toContain('Buy the full report')
        expect(mail.html).toContain('Dear &lt;b&gt;Rina&lt;/b&gt;')
        expect(mail.html).not.toContain('<b>Rina</b>')
        expect(mail.html).toContain('on 19 November 2026')
        expect(mail.html).toContain('–')
    })

    it('never mentions the clinical reasons, whatever the score', () => {
        const worrying = scoreMhcu(answers({ [mhcuCode('cc', 11)]: 3 }))
        const mail = buildMhcuResultEmail({ name: 'Maya', code: 'X', lang: 'id', scores: worrying, level: worrying.level, reportLink: link, today })
        for (const word of ['CC11', 'CC12', 'Pikiran menyakiti', 'Gejala psikotik', 'pemicu', 'Pemicu']) expect(mail.html).not.toContain(word)
    })

    it('formats the date in Jakarta time', () => {
        expect(formatSubmittedDate(new Date('2026-11-19T18:30:00Z'), 'id')).toBe('20 November 2026')
        expect(formatSubmittedDate(new Date('2026-01-05T00:00:00Z'), 'en')).toBe('5 January 2026')
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
