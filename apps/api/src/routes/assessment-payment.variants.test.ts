import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { createTokenService } from '../security/token-service';
import type { AssessmentRow, AssessmentsRepository } from '../repositories/assessments.repository';
import { paymentToken } from '../services/assessment-payment';
import { createAssessmentPaymentRoutes } from './assessment-payment.routes';

/** The report-access page (team demo uA / uK / uL) picks its variant from the payment-info answer. */
const SECRET = 'payment-secret-payment-secret-1234';
const tokenService = createTokenService({
    secret: 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security',
    store: { saveRefreshToken: async () => {}, findRefreshToken: async () => null, revokeRefreshToken: async () => {}, revokeAllForUser: async () => {} }
});
const PSY = '00000000-0000-4000-8000-0000000000aa';
const CODE = 'AT-MHCU-2026-100';

const infoFor = async (overrides: Record<string, unknown>, credits = 0) => {
    const row = {
        id: '00000000-0000-4000-8000-000000000001', code: CODE, instrument: 'mhcu', name: 'Rina Pratiwi', lang: 'id', email: 'rina@example.com', phone: '0812',
        level: 2, scores: { mhi: 61.5, levelName: { id: 'Perlu Dipantau', en: 'Needs Monitoring' } }, track: 'mandiri', status: 'new', paymentStatus: 'UNPAID',
        paymentPackage: null, paymentSubmittedAt: null, participantId: 'pp-1', waveNo: 1, psychologistId: null, priceDue: 227000, ...overrides
    } as unknown as AssessmentRow;
    const repository = {
        getByCode: async (code: string) => (code === CODE ? row : null),
        getParticipant: async () => ({ participantNo: 1, creditsRemaining: credits, creditsTotal: 3, psychologistId: PSY, trackOrigin: 'mandiri' }),
        getPsychologistName: async (id: string) => (id === PSY ? 'dr. Aly' : null)
    } as unknown as AssessmentsRepository;
    const app = new Elysia().use(createAssessmentPaymentRoutes({
        tokenService,
        userRepository: { findById: async () => null },
        assessmentsRepository: repository,
        paymentSecret: SECRET
    }));
    const response = await app.handle(new Request(`http://localhost/api/public/assessments/payment-info?id=${CODE}&t=${paymentToken(SECRET, CODE)}`));
    return (await response.json()) as { data: Record<string, unknown> };
};

describe('payment-info for the report-access page variants', () => {
    it('mandiri, unpaid: locked, with the price due and no psychologist yet', async () => {
        const { data } = await infoFor({});
        expect(data).toMatchObject({ state: 'locked', track: 'mandiri', paymentStatus: 'UNPAID', psychologist: null, priceDue: 227000, creditsRemaining: 0, waveNo: 1 });
    });

    it('lanjutan, unpaid: locked, the psychologist and the price the psychologist set (null = "as agreed")', async () => {
        const set = await infoFor({ track: 'lanjutan', psychologistId: PSY, waveNo: 5, priceDue: 200000 });
        expect(set.data).toMatchObject({ state: 'locked', track: 'lanjutan', psychologist: 'dr. Aly', priceDue: 200000, waveNo: 5 });
        const notSet = await infoFor({ track: 'lanjutan', psychologistId: PSY, priceDue: null });
        expect(notSet.data.priceDue).toBeNull();
    });

    it('asesmen, free and paket: pending (covered, waiting for the signed report), with the credits left for paket', async () => {
        expect((await infoFor({ track: 'asesmen', paymentStatus: 'INCLUDED', psychologistId: PSY })).data).toMatchObject({ state: 'pending', track: 'asesmen', paymentStatus: 'INCLUDED' });
        expect((await infoFor({ track: 'free', paymentStatus: 'FREE', psychologistId: PSY })).data).toMatchObject({ state: 'pending', track: 'free' });
        expect((await infoFor({ track: 'paket', paymentStatus: 'PAID', paymentPackage: '3x', psychologistId: PSY }, 1)).data).toMatchObject({ state: 'pending', track: 'paket', creditsRemaining: 1, package: '3x' });
    });

    it('a paid mandiri check-up is pending, a released one is ready', async () => {
        expect((await infoFor({ paymentStatus: 'PAID', paymentPackage: '1x' })).data.state).toBe('pending');
        expect((await infoFor({ paymentStatus: 'PAID', status: 'released' })).data.state).toBe('ready');
    });

    it('still carries the code, name, scores summary and bank data of the page', async () => {
        const { data } = await infoFor({});
        expect(data).toMatchObject({ code: CODE, name: 'Rina Pratiwi', mhi: 61.5, level: 2, account: { bank: 'BCA' }, whatsapp: '6285156410912' });
    });
});
