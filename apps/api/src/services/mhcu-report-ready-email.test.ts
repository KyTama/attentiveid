import { describe, expect, test } from 'bun:test'
import { buildReportReadyEmail, buildReportReleasedStaffEmail } from './mhcu-report-ready-email'

const base = {
    name: 'Boim',
    code: 'AT-MHCU-2026-120',
    lang: 'id' as const,
    scores: { mhi: 61.4, level: 3 },
    level: 3,
    links: { id: 'https://attentiveid.com/api/public/assessments/report?id=AT-MHCU-2026-120&t=abc&lang=id', en: 'https://attentiveid.com/api/public/assessments/report?id=AT-MHCU-2026-120&t=abc&lang=en' },
    submittedAt: new Date('2026-11-14T05:00:00Z'),
    releasedAt: new Date('2026-11-24T05:00:00Z'),
    siteOrigin: 'https://attentiveid.com'
}

describe('report ready e-mail', () => {
    test('has the summary, details, what is inside, the report button and the WhatsApp button', () => {
        const mail = buildReportReadyEmail(base)
        expect(mail.subject).toBe('Laporan lengkap Anda sudah siap · AT-MHCU-2026-120')
        expect(mail.html).toContain('Level 3 dari 5: Perlu Perhatian')
        expect(mail.html).toContain('61,4')
        expect(mail.html).toContain('AT-MHCU-2026-120')
        expect(mail.html).toContain('14 November 2026')
        expect(mail.html).toContain('24 November 2026')
        expect(mail.html).toContain('YANG ADA DI LAPORAN ANDA')
        expect(mail.html).toContain('href="https://attentiveid.com/api/public/assessments/report?id=AT-MHCU-2026-120&amp;t=abc&amp;lang=id"')
        expect(mail.html).toContain('href="https://attentiveid.com/api/public/assessments/report?id=AT-MHCU-2026-120&amp;t=abc&amp;lang=en"')
        expect(mail.html).toContain('Buka laporan lengkap (Bahasa Indonesia)')
        expect(mail.html).toContain('Open the full report (English)')
        expect(mail.html).toContain('https://wa.me/6285156410912')
        expect(mail.text).toContain('Buka laporan lengkap (Bahasa Indonesia): https://attentiveid.com/api/public/assessments/report?id=AT-MHCU-2026-120&t=abc&lang=id')
        expect(mail.text).toContain('Open the full report (English): https://attentiveid.com/api/public/assessments/report?id=AT-MHCU-2026-120&t=abc&lang=en')
    })

    test('shows the emergency line only from level 4', () => {
        expect(buildReportReadyEmail(base).html).not.toContain('119')
        const high = buildReportReadyEmail({ ...base, level: 4, scores: { mhi: 38 } })
        expect(high.html).toContain('119')
        expect(high.text).toContain('119')
    })

    test('keeps the three indices and clinical details out of the body', () => {
        const mail = buildReportReadyEmail({ ...base, scores: { mhi: 61.4, di: 12.3, wi: 44.4, bhi: 70.1, reasons: ['x-secret-flag'] } })
        expect(mail.html).not.toContain('12,3')
        expect(mail.html).not.toContain('44,4')
        expect(mail.html).not.toContain('x-secret-flag')
    })

    test('English version and escaping of the name', () => {
        const mail = buildReportReadyEmail({ ...base, lang: 'en', name: '<b>Eve</b>' })
        expect(mail.subject).toBe('Your full report is ready · AT-MHCU-2026-120')
        expect(mail.html).toContain('Level 3 of 5: Needs Attention')
        expect(mail.html.indexOf('Open the full report (English)')).toBeLessThan(mail.html.indexOf('Buka laporan lengkap (Bahasa Indonesia)'))
        expect(mail.html).not.toContain('<b>Eve</b>')
        expect(mail.html).toContain('&lt;b&gt;Eve&lt;/b&gt;')
    })

    test('a missing score still builds a valid e-mail', () => {
        const mail = buildReportReadyEmail({ ...base, scores: null, level: null })
        expect(mail.html).toContain('Level 1 dari 5: Baik')
        expect(mail.html).toContain('–')
    })
})

describe('report released e-mail to staff', () => {
    test('has both language links, the dashboard link and the staff-only footer', () => {
        const mail = buildReportReleasedStaffEmail({
            name: 'Boim',
            code: 'AT-MHCU-2026-120',
            level: 3,
            scores: { mhi: 61.4 },
            links: base.links,
            submissionId: '00000000-0000-4000-8000-000000000001',
            psychologistName: 'Dr. Haykal Hafizul Arifin, S.Psi., M.Si.',
            siteOrigin: 'https://attentiveid.com'
        })
        expect(mail.subject).toBe('[MHCU] Laporan dirilis · AT-MHCU-2026-120 · Boim')
        expect(mail.html).toContain('lang=id')
        expect(mail.html).toContain('lang=en')
        expect(mail.html).toContain('/dashboard/assessments/mhcu/00000000-0000-4000-8000-000000000001')
        expect(mail.html).toContain('Dr. Haykal Hafizul Arifin, S.Psi., M.Si.')
        expect(mail.text).toContain('Jangan diteruskan')
    })
})
