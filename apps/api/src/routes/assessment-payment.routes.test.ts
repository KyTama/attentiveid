import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import type { AssessmentRow, AssessmentsRepository } from '../repositories/assessments.repository';
import { paymentToken } from '../services/assessment-payment';
import type { MailMessage } from '../services/mailer';
import { createAssessmentPaymentRoutes } from './assessment-payment.routes';

const SECRET = 'payment-secret-payment-secret-1234';
const psychologist: UserDto = {
    id: 'psych-1', email: 'p@attentive.id', name: 'Psych', role: 'psychologist', status: 'active', psychologistId: null,
    lastLoginAt: null, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z'
};
const tokenService = createTokenService({
    secret: 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security',
    store: { saveRefreshToken: async () => {}, findRefreshToken: async () => null, revokeRefreshToken: async () => {}, revokeAllForUser: async () => {} }
});
const staffToken = tokenService.issueAccessToken(psychologist).accessToken;

const ID = '00000000-0000-4000-8000-000000000001';
const CODE = 'AT-MHCU-2026-100';
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64)]);

const fixture = (options: { failSave?: boolean } = {}) => {
    const row = { id: ID, code: CODE, instrument: 'mhcu', name: 'Rina Pratiwi', lang: 'id', email: 'rina@example.com', phone: '081234567890', level: 3, paymentSubmittedAt: null } as unknown as AssessmentRow;
    const sent: MailMessage[] = [];
    const saved: { id: string; paymentFor: string; mimeType: string; size: number }[] = [];
    const repository = {
        getByCode: async (code: string) => (code === CODE ? row : null),
        savePayment: async (id: string, input: { paymentFor: string; mimeType: string; data: Buffer }) => {
            if (options.failSave) throw new Error('boom: Rina Pratiwi');
            saved.push({ id, paymentFor: input.paymentFor, mimeType: input.mimeType, size: input.data.length });
        },
        getProof: async (id: string) => (saved.some((entry) => entry.id === id) ? { mimeType: 'image/png', data: png } : null)
    } as unknown as AssessmentsRepository;
    const app = new Elysia().use(createAssessmentPaymentRoutes({
        tokenService,
        userRepository: { findById: async (id: string) => (id === psychologist.id ? psychologist : null) },
        assessmentsRepository: repository,
        paymentSecret: SECRET,
        mailer: { isConfigured: true, send: async (message: MailMessage) => { sent.push(message); } },
        alertEmail: 'alerts@attentive.id',
        siteOrigin: 'https://attentiveid.com'
    }));
    return { app, saved, sent };
};

const token = paymentToken(SECRET, CODE);
type TestApp = { handle: (request: Request) => Promise<Response> };
const info = (app: TestApp, id: string, t: string) => app.handle(new Request(`http://localhost/api/public/assessments/payment-info?id=${id}&t=${t}`));
const upload = (app: TestApp, fields: Record<string, string>, file?: { data: Buffer; name: string; type: string }) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) form.set(key, value);
    if (file) form.set('proof', new File([file.data], file.name, { type: file.type }));
    return app.handle(new Request('http://localhost/api/public/assessments/payment', { method: 'POST', body: form }));
};

describe('payment page data', () => {
    it('answers only for the signed link and returns the bank account and the two options', async () => {
        const { app } = fixture();
        const ok = await info(app, CODE, token);
        expect(ok.status).toBe(200);
        const json = await ok.json();
        expect(json.data).toMatchObject({ code: CODE, name: 'Rina Pratiwi', account: { number: '4500499562', holder: 'Atensi Kini Group PT' }, whatsapp: '6285156410912' });
        expect(json.data.options.map((option: { key: string }) => option.key)).toEqual(['single', 'package3']);
        expect(ok.headers.get('cache-control')).toBe('no-store');
        expect((await info(app, CODE, 'x'.repeat(24))).status).toBe(404);
        expect((await info(app, 'AT-MHCU-2026-101', paymentToken(SECRET, 'AT-MHCU-2026-101'))).status).toBe(404);
    });
});

describe('proof of transfer upload', () => {
    it('saves a screenshot for the signed link', async () => {
        const { app, saved } = fixture();
        const response = await upload(app, { id: CODE, t: token, paymentFor: 'single' }, { data: png, name: 'bukti.png', type: 'image/png' });
        expect(response.status).toBe(200);
        expect(saved).toEqual([{ id: ID, paymentFor: 'single', mimeType: 'image/png', size: png.length }]);
    });

    it('refuses a wrong link, a missing or fake file, a bad choice and a file that is too big', async () => {
        const { app, saved } = fixture();
        const good = { id: CODE, t: token, paymentFor: 'single' };
        expect((await upload(app, { ...good, t: 'x'.repeat(24) }, { data: png, name: 'a.png', type: 'image/png' })).status).toBe(404);
        expect((await upload(app, { ...good, paymentFor: 'free' }, { data: png, name: 'a.png', type: 'image/png' })).status).toBe(400);
        const fake = await upload(app, good, { data: Buffer.from('<html><script>alert(1)</script></html>'.padEnd(64, ' ')), name: 'bukti.png', type: 'image/png' });
        expect(fake.status).toBe(400);
        const big = await upload(app, good, { data: Buffer.concat([png, Buffer.alloc(5 * 1024 * 1024)]), name: 'big.png', type: 'image/png' });
        expect(big.status).toBe(400);
        expect(saved).toHaveLength(0);
    });

    it('limits how many times one result can send a proof, and hides database details on failure', async () => {
        const { app } = fixture();
        const send = () => upload(app, { id: CODE, t: token, paymentFor: 'package3' }, { data: png, name: 'a.png', type: 'image/png' });
        for (let i = 0; i < 5; i += 1) expect((await send()).status).toBe(200);
        expect((await send()).status).toBe(429);
        const failing = fixture({ failSave: true });
        const response = await upload(failing.app, { id: CODE, t: token, paymentFor: 'single' }, { data: png, name: 'a.png', type: 'image/png' });
        expect(response.status).toBe(503);
        expect(await response.text()).not.toContain('Rina');
    });
});

describe('staff view of the proof', () => {
    it('is closed to visitors and open to staff, served without sniffing', async () => {
        const { app } = fixture();
        await upload(app, { id: CODE, t: token, paymentFor: 'single' }, { data: png, name: 'a.png', type: 'image/png' });
        const url = `http://localhost/api/admin/assessments/${ID}/proof`;
        expect((await app.handle(new Request(url))).status).toBe(401);
        const response = await app.handle(new Request(url, { headers: { authorization: `Bearer ${staffToken}` } }));
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('image/png');
        expect(response.headers.get('x-content-type-options')).toBe('nosniff');
        expect((await app.handle(new Request('http://localhost/api/admin/assessments/not-a-uuid/proof', { headers: { authorization: `Bearer ${staffToken}` } }))).status).toBe(404);
    });
});

describe('e-mails after the proof of transfer', () => {
    const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

    it('tells the participant it is being checked (not yet confirmed) and tells the admin inbox to check it', async () => {
        const { app, sent } = fixture();
        const response = await upload(app, { id: CODE, t: token, paymentFor: 'package3' }, { data: png, name: 'bukti.png', type: 'image/png' });
        expect(response.status).toBe(200);
        await settle();
        const toPerson = sent.find((mail) => mail.to === 'rina@example.com');
        expect(toPerson).toBeDefined();
        expect(toPerson?.subject).toContain('Bukti transfer Anda sudah kami terima');
        expect(toPerson?.text).toContain('sedang memeriksa pembayaran');
        expect(toPerson?.text).toContain('Paket 3x pemeriksaan');
        expect(toPerson?.text).not.toContain('terkonfirmasi.');
        const toStaff = sent.find((mail) => mail.to === 'alerts@attentive.id');
        expect(toStaff).toBeDefined();
        expect(toStaff?.subject).toContain('Bukti transfer masuk');
        expect(toStaff?.text).toContain('081234567890');
        expect(toStaff?.text).toContain(`/dashboard/assessments/mhcu/${ID}`);
        expect(toPerson?.text).not.toContain('081234567890');
    });

    it('sends nothing when the upload is refused, and a mail failure does not fail the upload', async () => {
        const refused = fixture();
        await upload(refused.app, { id: CODE, t: 'bad-token-bad-token-ab', paymentFor: 'single' }, { data: png, name: 'bukti.png', type: 'image/png' });
        await settle();
        expect(refused.sent).toHaveLength(0);
    });
});
