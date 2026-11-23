import { afterEach, describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import type { AssessmentRow, AssessmentsRepository } from '../repositories/assessments.repository';
import type { MhcuOpsRepository, MhcuOverviewStats } from '../repositories/mhcu-ops.repository';
import { PAYMENT_OPTIONS, PROMO_UNTIL, priceFor, setPromoUntil } from '../services/assessment-payment';
import type { MailMessage } from '../services/mailer';
import { releaseBlocker, runAutomation } from '../services/mhcu-release';
import { applyPricing, defaultSettings, mergeSettings, validateSettings } from '../services/mhcu-settings';
import { createMemorySettingsStore } from '../services/mhcu-settings-store';
import { createMhcuOpsRoutes } from './mhcu-ops.routes';

const PSY = '00000000-0000-4000-8000-0000000000aa';
const OTHER = '00000000-0000-4000-8000-0000000000bb';
const idOf = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const makeUser = (id: string, role: UserDto['role'], psychologistId: string | null = null): UserDto => ({
    id, email: `${id}@attentive.id`, name: id, role, status: 'active', psychologistId,
    lastLoginAt: null, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z'
});
const admin = makeUser('admin-1', 'admin');
const psychologist = makeUser('psych-1', 'psychologist', PSY);
const users = new Map([[admin.id, admin], [psychologist.id, psychologist]]);
const tokenService = createTokenService({
    secret: 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security',
    store: { saveRefreshToken: async () => {}, findRefreshToken: async () => null, revokeRefreshToken: async () => {}, revokeAllForUser: async () => {} }
});
const bearer = (user: UserDto) => ({ authorization: `Bearer ${tokenService.issueAccessToken(user).accessToken}` });

const row = (n: number, extra: Partial<AssessmentRow> = {}): AssessmentRow & { participantNo: number } => ({
    id: idOf(n), code: `AT-MHCU-2026-${100 + n}`, instrument: 'mhcu', lang: 'id', name: 'TEST Rina', email: 'rina@example.com', phone: '0812',
    level: 2, scores: { mhi: 60 + n, di: 30, wi: 55, bhi: 50 }, participantId: 'pp-1', waveNo: n, psychologistId: PSY, status: 'new',
    createdAt: `2026-11-${String(10 + n).padStart(2, '0')}T03:00:00Z`, noteFinal: false, paymentStatus: 'UNPAID', participantNo: 7,
    ...extra
} as unknown as AssessmentRow & { participantNo: number });

const stats: MhcuOverviewStats = {
    sessions: 3, participants: 2, returning: 1, levels: [1, 1, 1, 0, 0], meanMhi: 61.5, meanChange: 4.2,
    months: [{ m: '2026-11', n: 3, mhi: 61.5 }], unpaid: 2, awaitingConfirmation: 1, notesToFinish: 3, readyNotReleased: 0, notAssigned: 1
};

const fixture = (rows: Array<AssessmentRow & { participantNo: number }> = [row(1), row(2), row(3)]) => {
    const sent: MailMessage[] = [];
    const marked: string[] = [];
    const scopes: unknown[] = [];
    const audits: string[] = [];
    const repository = {
        get: async (id: string) => rows.find((r) => r.id === id) ?? null,
        listHistory: async () => rows,
        markResultEmailSent: async (id: string) => { marked.push(id); }
    } as unknown as AssessmentsRepository;
    const ops: MhcuOpsRepository = {
        loadSettings: async () => null,
        saveSettings: async () => {},
        overview: async (scope) => { scopes.push(scope); return stats; },
        pickPsychologist: async () => PSY,
        psychologistEmail: async () => null
    };
    const settings = createMemorySettingsStore('contact@attentiveid.com');
    const app = new Elysia().use(createMhcuOpsRoutes({
        tokenService,
        userRepository: { findById: async (id: string) => users.get(id) ?? null },
        assessmentsRepository: repository,
        ops,
        settings,
        mailer: { isConfigured: true, send: async (m: MailMessage) => { sent.push(m); } },
        paymentSecret: 'payment-secret-payment-secret-1234',
        siteOrigin: 'https://attentiveid.com',
        audit: async (entry) => { audits.push(entry.action); }
    }));
    return { app, sent, marked, scopes, audits };
};

type TestApp = { handle: (request: Request) => Promise<Response> };
const send = (app: TestApp, path: string, method: string, payload?: unknown, headers: Record<string, string> = {}) =>
    app.handle(new Request(`http://localhost${path}`, {
        method,
        headers: { ...(payload === undefined ? {} : { 'content-type': 'application/json' }), ...headers },
        body: payload === undefined ? undefined : JSON.stringify(payload)
    }));

const resetPricing = () => {
    applyPricing(defaultSettings());
    setPromoUntil('2027-04-30');
};

describe('overview numbers', () => {
    it('is for staff only and counts only the assigned clients for a psychologist', async () => {
        const { app, scopes } = fixture();
        expect((await send(app, '/api/admin/assessments/mhcu/overview', 'GET')).status).toBe(401);
        const asAdmin = await send(app, '/api/admin/assessments/mhcu/overview', 'GET', undefined, bearer(admin));
        expect(asAdmin.status).toBe(200);
        expect((await asAdmin.json()).data).toMatchObject({ sessions: 3, returning: 1, meanChange: 4.2, awaitingConfirmation: 1 });
        expect(asAdmin.headers.get('cache-control')).toBe('no-store');
        await send(app, '/api/admin/assessments/mhcu/overview', 'GET', undefined, bearer(psychologist));
        expect(scopes).toEqual([{}, { psychologistId: PSY }]);
    });
});

describe('history over time', () => {
    it('numbers the check-ups T1..Tn with the change since the one before', async () => {
        const { app } = fixture();
        const response = await send(app, `/api/admin/assessments/${idOf(3)}/history`, 'GET', undefined, bearer(admin));
        expect(response.status).toBe(200);
        const { data } = await response.json();
        expect(data).toMatchObject({ participantNo: 7, nSessions: 3, current: idOf(3) });
        expect(data.waves.map((w: any) => w.waveNo)).toEqual([1, 2, 3]);
        expect(data.waves[0].deltaMhi).toBeNull();
        expect(data.waves[1].deltaMhi).toBe(1);
        expect(data.waves[2]).toMatchObject({ mhi: 63, level: 2, code: 'AT-MHCU-2026-103', date: '2026-11-13' });
    });

    it('is closed to other psychologists and answers not found for a made-up id', async () => {
        const rows = [row(1, { psychologistId: OTHER })];
        const { app } = fixture(rows);
        expect((await send(app, `/api/admin/assessments/${idOf(1)}/history`, 'GET', undefined, bearer(psychologist))).status).toBe(404);
        expect((await send(app, '/api/admin/assessments/nope/history', 'GET', undefined, bearer(admin))).status).toBe(404);
        expect((await send(app, `/api/admin/assessments/${idOf(1)}/history`, 'GET')).status).toBe(401);
    });
});

describe('resend the result e-mail', () => {
    it('sends it again to the participant (admin only) and notes it', async () => {
        const { app, sent, marked, audits } = fixture();
        expect((await send(app, `/api/admin/assessments/${idOf(1)}/resend-result`, 'POST', {}, bearer(psychologist))).status).toBe(403);
        const response = await send(app, `/api/admin/assessments/${idOf(1)}/resend-result`, 'POST', {}, bearer(admin));
        expect(response.status).toBe(200);
        expect(sent).toHaveLength(1);
        expect(sent[0].to).toBe('rina@example.com');
        expect(sent[0].subject).toContain('AT-MHCU-2026-101');
        expect(marked).toEqual([idOf(1)]);
        expect(audits).toEqual(['resend_result']);
    });
});

describe('settings', () => {
    afterEach(resetPricing);

    it('is for admins only and starts from the built-in prices', async () => {
        const { app } = fixture();
        expect((await send(app, '/api/admin/assessments/mhcu/settings', 'GET', undefined, bearer(psychologist))).status).toBe(403);
        const response = await send(app, '/api/admin/assessments/mhcu/settings', 'GET', undefined, bearer(admin));
        expect((await response.json()).data).toMatchObject({ pricing: { single: { normal: 297000, promo: 227000 }, promoUntil: '2027-04-30' }, alertLevel: 4, autoAssign: true, autoSend: false });
    });

    it('saves new prices and the new promo date, and the e-mails and payment page use them at once', async () => {
        const { app, audits } = fixture();
        const next = { ...defaultSettings(), pricing: { single: { normal: 300000, promo: 250000 }, package3: { normal: 900000, promo: 700000 }, promoUntil: '2027-06-30' }, alertLevel: 3, autoSend: true };
        const response = await send(app, '/api/admin/assessments/mhcu/settings', 'PUT', next, bearer(admin));
        expect(response.status).toBe(200);
        expect(PAYMENT_OPTIONS.single.amount).toBe(250000);
        expect(PROMO_UNTIL).toBe('2027-06-30');
        expect(priceFor('single', new Date('2027-06-01T00:00:00Z'))).toBe(250000);
        expect(priceFor('single', new Date('2027-07-15T00:00:00Z'))).toBe(300000);
        expect(audits).toEqual(['settings']);
        expect((await (await send(app, '/api/admin/assessments/mhcu/settings', 'GET', undefined, bearer(admin))).json()).data.alertLevel).toBe(3);
    });

    it('refuses bad values with a clear message and changes nothing', async () => {
        const { app } = fixture();
        const good = defaultSettings();
        const bad = (patch: Record<string, unknown>) => send(app, '/api/admin/assessments/mhcu/settings', 'PUT', { ...good, ...patch }, bearer(admin));
        expect((await bad({ pricing: { ...good.pricing, single: { normal: 100, promo: 200 } } })).status).toBe(400);
        expect((await bad({ pricing: { ...good.pricing, promoUntil: '30-04-2027' } })).status).toBe(400);
        expect((await bad({ pricing: { ...good.pricing, package3: { normal: -1, promo: 0 } } })).status).toBe(400);
        expect((await bad({ alertLevel: 9 })).status).toBe(400);
        expect((await bad({ alertEmail: 'not an email' })).status).toBe(400);
        expect((await bad({ autoSend: 'yes' })).status).toBe(400);
        expect(PAYMENT_OPTIONS.single.amount).toBe(227000);
    });
});

describe('settings helpers', () => {
    it('fills a damaged or old stored value from the defaults', () => {
        expect(mergeSettings(null)).toEqual(defaultSettings());
        expect(mergeSettings({ alertLevel: 5 }).alertLevel).toBe(5);
        expect(mergeSettings({ alertLevel: 99 })).toEqual(defaultSettings());
        expect(mergeSettings('garbage')).toEqual(defaultSettings());
    });

    it('accepts the defaults as they are', () => {
        expect(validateSettings(defaultSettings()).ok).toBe(true);
    });
});

describe('release rule and automation', () => {
    const settings = (patch: Record<string, unknown> = {}) => ({ ...defaultSettings(), ...patch });
    const automationFixture = (initial: Partial<AssessmentRow>, config: ReturnType<typeof settings>) => {
        const store = { ...row(1), ...initial } as AssessmentRow;
        const sent: MailMessage[] = [];
        const repository = {
            get: async () => store,
            assign: async (_id: string, psychologistId: string | null) => { store.psychologistId = psychologistId; return store; },
            markReportReleased: async () => { store.status = 'released'; return store; }
        } as unknown as AssessmentsRepository;
        const ops = { pickPsychologist: async () => PSY } as unknown as MhcuOpsRepository;
        const deps = { repository, ops, mailer: { isConfigured: true, send: async (m: MailMessage) => { sent.push(m); } }, secret: 'payment-secret-payment-secret-1234', getSettings: async () => config };
        return { store, sent, run: () => runAutomation(deps, store.id) };
    };

    it('says why a check-up cannot be released yet', () => {
        expect(releaseBlocker({ noteFinal: false, paymentStatus: 'PAID', psychologistId: PSY })).toContain('final');
        expect(releaseBlocker({ noteFinal: true, paymentStatus: 'UNPAID', psychologistId: PSY })).toContain('Pembayaran');
        expect(releaseBlocker({ noteFinal: true, paymentStatus: 'PAID', psychologistId: null }, { needPsychologist: true })).toContain('Psikolog');
        expect(releaseBlocker({ noteFinal: true, paymentStatus: 'FREE', psychologistId: null })).toBeNull();
    });

    it('assigns a psychologist when a payment is confirmed and nobody is assigned (auto-assign on)', async () => {
        const a = automationFixture({ psychologistId: null, paymentStatus: 'PAID' }, settings());
        await a.run();
        expect(a.store.psychologistId).toBe(PSY);
        expect(a.store.status).toBe('new');
    });

    it('does nothing for an unpaid result or when auto-assign is off', async () => {
        const unpaid = automationFixture({ psychologistId: null, paymentStatus: 'UNPAID' }, settings());
        await unpaid.run();
        expect(unpaid.store.psychologistId).toBeNull();
        const off = automationFixture({ psychologistId: null, paymentStatus: 'PAID' }, settings({ autoAssign: false }));
        await off.run();
        expect(off.store.psychologistId).toBeNull();
    });

    it('releases and e-mails the report by itself only when auto-send is on and everything is ready', async () => {
        const on = automationFixture({ paymentStatus: 'PAID', noteFinal: true }, settings({ autoSend: true }));
        await on.run();
        expect(on.store.status).toBe('released');
        expect(on.sent).toHaveLength(1);
        const draft = automationFixture({ paymentStatus: 'PAID', noteFinal: false }, settings({ autoSend: true }));
        await draft.run();
        expect(draft.store.status).toBe('new');
        const manual = automationFixture({ paymentStatus: 'PAID', noteFinal: true }, settings({ autoSend: false }));
        await manual.run();
        expect(manual.store.status).toBe('new');
    });

    it('never throws, so a failure cannot undo what staff just saved', async () => {
        const deps = { repository: { get: async () => { throw new Error('db down'); } } as unknown as AssessmentsRepository, getSettings: async () => settings(), onError: () => {} };
        await expect(runAutomation(deps, idOf(1))).resolves.toBeUndefined();
    });
});
