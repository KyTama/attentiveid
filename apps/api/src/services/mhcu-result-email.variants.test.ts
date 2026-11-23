import { describe, expect, it } from 'bun:test';
import { buildMhcuResultEmail, type MhcuEmailInput } from './mhcu-result-email';

/** The e-mails for the invited tracks, the package and 'lanjutan' (team documents eA, eF, eP; 'lanjutan' from the report-access page uL). */
const base = (overrides: Partial<MhcuEmailInput> = {}): MhcuEmailInput => ({
    name: 'Putri Anggraini',
    code: 'AT-MHCU-2026-116',
    lang: 'id',
    scores: { mhi: 38.33, level: 5 },
    level: 5,
    reportLink: 'https://attentiveid.com/assessments/payment?id=AT-MHCU-2026-116&t=abc',
    submittedAt: new Date('2026-11-17T03:00:00Z'),
    siteOrigin: 'https://attentiveid.com',
    today: new Date('2026-11-23T03:00:00Z'),
    ...overrides
});

const PRICE = /Rp 227\.000|Rp 647\.000|Beli laporan lengkap|Buy the full report|CONTOH LAPORAN|SAMPLE REPORTS/;

describe('asesmen awal e-mail (eA)', () => {
    const mail = buildMhcuResultEmail(base({ track: 'asesmen', psychologistName: 'Valencia Yang, S.Psi, M.Psi, Psikolog' }));

    it('says the report is included, names the psychologist and when the report arrives', () => {
        for (const part of [mail.text, mail.html]) {
            expect(part).toContain('Sudah termasuk dalam asesmen awal Anda.');
            expect(part).toContain('Psikolog pemeriksa: ');
            expect(part).toContain('Valencia Yang');
            expect(part).toContain('Laporan dikirim ke email Anda setelah ditinjau dan ditandatangani psikolog.');
            expect(part).toContain('Lihat akses laporan');
        }
        expect(mail.text).toContain('Laporan lengkap AT-MHCU-2026-116');
        expect(mail.text).toContain('Hasil per indeks (DI, WI, BHI) beserta keterangan dan rekomendasi dari psikolog.');
    });

    it('has no prices, no buy button and no sample teasers', () => {
        expect(mail.html).not.toMatch(PRICE);
        expect(mail.text).not.toMatch(PRICE);
    });

    it('keeps the result part of the standard e-mail: MHI, level, scale, the priority notice at level 5', () => {
        expect(mail.text).toContain('MENTAL HEALTH INDEX: 38,3');
        expect(mail.text).toContain('Level 5 dari 5: Prioritas');
        expect(mail.text).toContain('Psikolog Attentive akan segera menghubungi Anda.');
        expect(mail.subject).toBe('Hasil Mental Health Check-Up (MHCU) Anda · AT-MHCU-2026-116');
    });

    it('links to the report-access page', () => {
        expect(mail.html).toContain('https://attentiveid.com/assessments/payment?id=AT-MHCU-2026-116&amp;t=abc');
    });
});

describe('free session e-mail (eF)', () => {
    const mail = buildMhcuResultEmail(base({ track: 'free', psychologistName: 'Gisella Tani Pratiwi, M.Psi., Psikolog', level: 3, scores: { mhi: 63.3, level: 3 } }));

    it('says the report is free, has no notice at level 3 and ends with the safety line', () => {
        expect(mail.text).toContain('Gratis sebagai bagian dari free session Anda.');
        expect(mail.text).not.toContain('Psikolog Attentive akan segera menghubungi Anda.');
        expect(mail.text).toContain('segera hubungi layanan darurat medis 119');
        expect(mail.text).not.toMatch(PRICE);
    });
});

describe('package e-mail (eP)', () => {
    it('says it is in the package of 3 with the credits left, and mentions progress from the second check-up on', () => {
        const mail = buildMhcuResultEmail(base({ track: 'paket', psychologistName: 'Syazka Kirani Narindra, M.Psi., Psikolog.', creditsRemaining: 0, waveNo: 3, level: 4, scores: { mhi: 64.7, level: 4 } }));
        expect(mail.text).toContain('Termasuk dalam paket 3x Anda. Sisa kuota setelah pemeriksaan ini: 0.');
        expect(mail.text).toContain('beserta keterangan dan rekomendasi dari psikolog, serta perkembangan hasil Anda dari waktu ke waktu.');
        expect(mail.html).toContain('Sisa kuota setelah pemeriksaan ini: 0.');
        expect(mail.text).not.toMatch(PRICE);
    });

    it('does not promise progress on a first check-up and shows the credits left', () => {
        const mail = buildMhcuResultEmail(base({ track: 'paket', creditsRemaining: 2, waveNo: 1 }));
        expect(mail.text).not.toContain('perkembangan hasil Anda');
        expect(mail.text).toContain('Sisa kuota setelah pemeriksaan ini: 2.');
    });
});

describe('lanjutan e-mail', () => {
    it('says the psychologist who accompanies the client prepares the report and the fee is as agreed; no prices', () => {
        const mail = buildMhcuResultEmail(base({ track: 'lanjutan', psychologistName: 'Syazka Kirani Narindra, M.Psi., Psikolog.', level: 2, scores: { mhi: 76, level: 2 } }));
        expect(mail.text).toContain('Laporan lengkap disusun oleh psikolog yang selama ini mendampingi Anda. Biayanya mengikuti kesepakatan dengan psikolog tersebut.');
        expect(mail.text).toContain('Psikolog pemeriksa: Syazka Kirani Narindra');
        expect(mail.text).not.toMatch(PRICE);
    });
});

describe('English variants and edge cases', () => {
    it('translates the variant lines', () => {
        const asesmen = buildMhcuResultEmail(base({ lang: 'en', track: 'asesmen', psychologistName: 'Valencia Yang' }));
        expect(asesmen.text).toContain('Included in your initial assessment.');
        expect(asesmen.text).toContain('Examining psychologist: Valencia Yang');
        expect(asesmen.text).toContain('The report is e-mailed to you after your psychologist has reviewed and signed it.');
        expect(asesmen.text).toContain('View report access');
        const paket = buildMhcuResultEmail(base({ lang: 'en', track: 'paket', creditsRemaining: 1, waveNo: 2 }));
        expect(paket.text).toContain('Included in your package of 3. Credits left after this check-up: 1.');
        expect(paket.text).toContain('plus your progress over time.');
    });

    it('leaves out the psychologist line when none is assigned and escapes names', () => {
        const mail = buildMhcuResultEmail(base({ track: 'free', psychologistName: null, name: '<b>Eve</b>' }));
        expect(mail.text).not.toContain('Psikolog pemeriksa');
        expect(mail.html).not.toContain('<b>Eve</b>');
        const named = buildMhcuResultEmail(base({ track: 'free', psychologistName: '<i>Dr</i>' }));
        expect(named.html).not.toContain('<i>Dr</i>');
        expect(named.html).toContain('&lt;i&gt;Dr&lt;/i&gt;');
    });

    it('mandiri (and no track) keeps the e-mail with prices, samples and the buy button, untouched', () => {
        for (const track of [undefined, 'mandiri'] as const) {
            const mail = buildMhcuResultEmail(base({ track }));
            expect(mail.text).toContain('Rp 227.000');
            expect(mail.text).toContain('Rp 647.000');
            expect(mail.text).toContain('Beli laporan lengkap');
            expect(mail.html).toContain('CONTOH LAPORAN');
            expect(mail.text).not.toContain('Psikolog pemeriksa');
        }
    });
});
