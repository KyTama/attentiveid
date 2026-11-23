import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto } from '@attentiveid/shared';
import { MHCU_ANSWER_RANGE, MHCU_ITEMS, mhcuCode } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import type { AssessmentListItem, AssessmentRow, AssessmentsRepository, AssessmentStatus } from '../repositories/assessments.repository';
import { createAssessmentsRoutes } from './assessments.routes';
import type { MailMessage, Mailer } from '../services/mailer';

const makeUser = (id: string, role: UserDto['role']): UserDto => ({
    id,
    email: `${id}@attentive.id`,
    name: id,
    role,
    status: 'active',
    psychologistId: id === 'psych-1' ? '00000000-0000-4000-8000-0000000000aa' : null,
    lastLoginAt: null,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
});

const admin = makeUser('admin-1', 'admin');
const psychologist = makeUser('psych-1', 'psychologist');
const usersById = new Map([[admin.id, admin], [psychologist.id, psychologist]]);
const tokenService = createTokenService({
    secret: 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security',
    store: {
        saveRefreshToken: async () => {},
        findRefreshToken: async () => null,
        revokeRefreshToken: async () => {},
        revokeAllForUser: async () => {}
    }
});
const adminToken = tokenService.issueAccessToken(admin).accessToken;
const psychologistToken = tokenService.issueAccessToken(psychologist).accessToken;

const answersWith = (overrides: Record<string, number> = {}) => {
    const answers: Record<string, number> = {};
    for (const item of MHCU_ITEMS) answers[mhcuCode(item.part, item.n)] = MHCU_ANSWER_RANGE[item.part].min;
    return { ...answers, ...overrides };
};

const body = (overrides: Record<string, unknown> = {}) => ({
    lang: 'id',
    consent: 'research',
    consent_version: 'MHCU-IC-ID/EN-2026.11',
    ack: [],
    guardian: false,
    name: 'Rina Pratiwi',
    sex: 'Perempuan (Female)',
    age: 29,
    phone: '081234567890',
    email: 'rina@example.com',
    answers: answersWith(),
    raw: {},
    invite: '',
    website: '',
    duration_sec: 600,
    ...overrides
});

const PSY_ID = '00000000-0000-4000-8000-0000000000aa';
const OTHER_PSY_ID = '00000000-0000-4000-8000-0000000000bb';
const idOf = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const createFixture = (options: { max?: number; failCreate?: boolean; mail?: 'ok' | 'fail' | 'off'; unassigned?: boolean } = {}) => {
    const rows: AssessmentRow[] = [];
    const sent: MailMessage[] = [];
    const emailed: string[] = [];
    const alerted: string[] = [];
    let synced = 0;
    const repository: AssessmentsRepository = {
        create: async (input, createOptions) => {
            if (options.failCreate) throw new Error('Failed query: insert ... params: Rina Pratiwi, 081234567890');
            if (createOptions?.dedupeMs) {
                const found = rows.find((row) => row.email.toLowerCase() === input.email.toLowerCase() && JSON.stringify(row.answers) === JSON.stringify(input.answers));
                if (found) return { id: found.id, code: found.code, duplicate: true, participantId: null, waveNo: null };
            }
            const row = {
                id: idOf(rows.length + 1),
                code: `AT-MHCU-2026-${100 + rows.length}`,
                codeYear: 2026,
                codeSeq: 100 + rows.length,
                reviewerId: null,
                reviewerNote: null,
                reviewedAt: null,
                releasedAt: null,
                createdAt: '2026-11-21T03:00:00Z',
                sheetSyncedAt: null,
                sheetError: null,
                status: 'new',
                participantId: 'pp-1',
                waveNo: rows.length + 1,
                psychologistId: options.unassigned ? null : PSY_ID,
                noteTemplate: null,
                noteCustom: null,
                noteFinal: false,
                paymentStatus: 'UNPAID',
                ...input
            } as AssessmentRow;
            rows.push(row);
            return { id: row.id, code: row.code, duplicate: false, participantId: null, waveNo: 1 };
        },
        list: async (_instrument, listOptions) =>
            rows.filter((row) => (!listOptions?.status || row.status === listOptions.status) && (!listOptions?.psychologistId || row.psychologistId === listOptions.psychologistId)) as unknown as AssessmentListItem[],
        get: async (id) => rows.find((row) => row.id === id) ?? null,
        review: async (id, input) => {
            const row = rows.find((entry) => entry.id === id);
            if (!row) return null;
            row.status = input.status;
            row.reviewerNote = input.note;
            row.reviewerId = input.reviewerId;
            return row;
        },
        listHistory: async () => rows.map((row) => ({ ...row, participantNo: 1 })),
        listPsychologists: async () => [{ id: PSY_ID, name: 'dr. Aly' }],
        getPsychologistName: async (id) => (id === PSY_ID ? 'dr. Aly' : id === OTHER_PSY_ID ? 'dr. Budi' : null),
        assign: async (id, psychologistId) => {
            const row = rows.find((entry) => entry.id === id);
            if (!row) return null;
            row.psychologistId = psychologistId;
            return row;
        },
        saveNote: async (id, input) => {
            const row = rows.find((entry) => entry.id === id);
            if (!row) return null;
            Object.assign(row, { noteTemplate: input.template, noteCustom: input.custom, noteFinal: input.final });
            return row;
        },
        setPayment: async (id, input) => {
            const row = rows.find((entry) => entry.id === id);
            if (!row) return null;
            Object.assign(row, { paymentStatus: input.status, paymentPackage: input.package, paymentAmount: input.amount, paymentRef: input.ref });
            return row;
        },
        markReportReleased: async (id) => {
            const row = rows.find((entry) => entry.id === id);
            if (!row) return null;
            row.status = 'released';
            return row;
        },
        markSheetSynced: async () => {},
        getByCode: async (code) => rows.find((row) => row.code === code) ?? null,
        markResultEmailSent: async (id) => { emailed.push(id); },
        markAdminAlertSent: async (id) => { alerted.push(id); },
        savePayment: async () => {},
        getProof: async () => null,
        listUnsynced: async () => []
    };
    const app = new Elysia().use(
        createAssessmentsRoutes({
            tokenService,
            userRepository: { findById: async (id: string) => usersById.get(id) ?? null },
            assessmentsRepository: repository,
            mailer: ((): Mailer => ({
                isConfigured: options.mail !== 'off',
                send: async (message) => {
                    if (options.mail === 'fail') throw new Error('smtp down: ' + message.to);
                    sent.push(message);
                }
            }))(),
            alertEmail: 'alerts@attentive.id',
            paymentSecret: 'payment-secret-payment-secret-1234',
            siteOrigin: 'https://attentiveid.com',
            sheetSync: { isConfigured: true, syncPending: async () => { synced += 1; return { configured: true, synced: 0, error: null }; } },
            rateLimit: { max: options.max ?? 6, windowMs: 60_000 }
        })
    );
    return { app, rows, sent, emailed, alerted, syncCalls: () => synced };
};

type TestApp = { handle: (request: Request) => Promise<Response> };
const send = (app: TestApp, path: string, method: string, payload?: unknown, headers: Record<string, string> = {}) =>
    app.handle(new Request(`http://localhost${path}`, {
        method,
        headers: { ...(payload === undefined ? {} : { 'content-type': 'application/json' }), ...headers },
        body: payload === undefined ? undefined : JSON.stringify(payload)
    }));
const submit = (app: TestApp, payload: unknown, headers: Record<string, string> = {}) => send(app, '/api/public/assessments/mhcu', 'POST', payload, headers);
const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

describe('POST /api/public/assessments/mhcu', () => {
    it('scores and stores a valid submission, returns only the code (never the scores) and starts the sheet copy', async () => {
        const { app, rows, syncCalls } = createFixture();
        const response = await submit(app, body());
        expect(response.status).toBe(201);
        const json = await response.json();
        expect(json).toMatchObject({ ok: true, code: 'AT-MHCU-2026-100', email: 'rina@example.com' });
        expect(JSON.stringify(json)).not.toContain('scores');
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({ instrument: 'mhcu', track: 'mandiri', researchConsent: true, level: expect.any(Number) });
        expect(syncCalls()).toBe(1);
    });

    it('treats the same answers sent again as one submission (a double click)', async () => {
        const { app, rows } = createFixture();
        const first = await (await submit(app, body())).json();
        const second = await (await submit(app, body())).json();
        expect(second.code).toBe(first.code);
        expect(rows).toHaveLength(1);
    });

    it('stores nothing for a bot that fills the hidden field, and still answers as if it worked', async () => {
        const { app, rows } = createFixture();
        const response = await submit(app, body({ website: 'http://spam.example' }));
        expect(response.status).toBe(201);
        expect(rows).toHaveLength(0);
    });

    it('rejects bad data with a clear error', async () => {
        const { app, rows } = createFixture();
        const response = await submit(app, body({ email: 'not-an-email' }));
        expect(response.status).toBe(400);
        expect((await response.json()).ok).toBe(false);
        const answers = answersWith({ [mhcuCode('cc', 1)]: 9 });
        expect((await submit(app, body({ answers, email: 'b@example.com' }))).status).toBe(400);
        expect(rows).toHaveLength(0);
    });

    it('does not let an invite token or client claims change how the person is recorded', async () => {
        const { app, rows } = createFixture();
        await submit(app, body({ invite: 'abcdef123456', track: 'asesmen', level: 1, status: 'released' }));
        expect(rows[0]).toMatchObject({ track: 'mandiri', status: 'new' });
    });

    it('limits how many tries one address can make', async () => {
        const { app } = createFixture({ max: 2 });
        const headers = { 'x-forwarded-for': '203.0.113.7' };
        await submit(app, body({ email: 'a@example.com' }), headers);
        await submit(app, body({ email: 'b@example.com' }), headers);
        expect((await submit(app, body({ email: 'c@example.com' }), headers)).status).toBe(429);
    });
});

describe('safety nets on the public form', () => {
    it('limits one e-mail to a few submissions a day, whatever the address', async () => {
        const { app } = createFixture({ max: 50 });
        for (let i = 0; i < 4; i += 1) {
            const answers = answersWith({ [mhcuCode('cc', 1)]: i });
            expect((await submit(app, body({ answers }), { 'x-forwarded-for': `203.0.113.${i}` })).status).toBe(201);
        }
        const fifth = await submit(app, body({ answers: answersWith({ [mhcuCode('cc', 2)]: 3 }) }), { 'x-forwarded-for': '203.0.113.99' });
        expect(fifth.status).toBe(429);
    });

    it('refuses a body that is far bigger than the form can send', async () => {
        const { app, rows } = createFixture();
        const response = await submit(app, body(), { 'content-length': String(10 * 1024 * 1024) });
        expect(response.status).toBe(413);
        expect(rows).toHaveLength(0);
    });

    it('answers a database failure with a generic message that holds none of the personal data', async () => {
        const { app } = createFixture({ failCreate: true });
        const response = await submit(app, body());
        expect(response.status).toBe(503);
        const text = await response.text();
        expect(text).not.toContain('Rina');
        expect(text).not.toContain('081234567890');
        expect(text).not.toContain('Failed query');
        expect(JSON.parse(text).ok).toBe(false);
    });

    it('is never cached, on success or failure', async () => {
        const { app } = createFixture();
        const ok = await submit(app, body());
        expect(ok.headers.get('cache-control')).toBe('no-store');
        const bad = await submit(app, body({ email: 'nope' }));
        expect(bad.headers.get('cache-control')).toBe('no-store');
    });

    it('stores which consent boxes the person ticked', async () => {
        const { app, rows } = createFixture();
        await submit(app, body({ ack: ['read', 'screen', 'limits', 'age', 'voluntary'] }));
        expect(rows[0].consentAck).toEqual(['read', 'screen', 'limits', 'age', 'voluntary']);
    });
});

describe('staff endpoints', () => {
    it('are closed to visitors and open to staff', async () => {
        const { app } = createFixture();
        await submit(app, body());
        expect((await send(app, '/api/admin/assessment-lists/mhcu', 'GET')).status).toBe(401);
        expect((await send(app, `/api/admin/assessments/${idOf(1)}`, 'GET')).status).toBe(401);
        expect((await send(app, `/api/admin/assessments/${idOf(1)}/review`, 'PUT', { status: 'reviewed' })).status).toBe(401);
        const list = await send(app, '/api/admin/assessment-lists/mhcu', 'GET', undefined, bearer(psychologistToken));
        expect(list.status).toBe(200);
        expect((await list.json()).data).toHaveLength(1);
        const one = await send(app, `/api/admin/assessments/${idOf(1)}`, 'GET', undefined, bearer(psychologistToken));
        expect(one.headers.get('cache-control')).toBe('no-store');
        expect((await one.json()).data.scores).toBeDefined();
    });

    it('lets a psychologist review and release, records who did it, and rejects an unknown status', async () => {
        const { app, rows } = createFixture();
        await submit(app, body());
        const bad = await send(app, `/api/admin/assessments/${idOf(1)}/review`, 'PUT', { status: 'deleted' }, bearer(psychologistToken));
        expect(bad.status).toBe(400);
        const ok = await send(app, `/api/admin/assessments/${idOf(1)}/review`, 'PUT', { status: 'reviewed' as AssessmentStatus, note: '  Perlu tindak lanjut  ' }, bearer(psychologistToken));
        expect(ok.status).toBe(200);
        expect(rows[0]).toMatchObject({ status: 'reviewed', reviewerNote: 'Perlu tindak lanjut', reviewerId: 'psych-1' });
        // Releasing the full report goes through its own step (final note + confirmed payment), never through review.
        expect((await send(app, `/api/admin/assessments/${idOf(1)}/review`, 'PUT', { status: 'released' }, bearer(psychologistToken))).status).toBe(409);
        expect((await send(app, `/api/admin/assessments/${idOf(99)}/review`, 'PUT', { status: 'reviewed' }, bearer(psychologistToken))).status).toBe(404);
    });

    it('never serves the staff list or a record from a cache, and treats a made-up id as not found', async () => {
        const { app } = createFixture();
        await submit(app, body());
        const list = await send(app, '/api/admin/assessment-lists/mhcu', 'GET', undefined, bearer(psychologistToken));
        expect(list.headers.get('cache-control')).toBe('no-store');
        const odd = await send(app, "/api/admin/assessments/x'%20or%201=1", 'GET', undefined, bearer(psychologistToken));
        expect(odd.status).toBe(404);
    });

    it('does not let a released result be moved back, and does not accept new as a status to set', async () => {
        const { app, rows } = createFixture();
        await submit(app, body());
        const url = `/api/admin/assessments/${idOf(1)}/review`;
        expect((await send(app, url, 'PUT', { status: 'new' }, bearer(psychologistToken))).status).toBe(400);
        rows[0].status = 'released';
        expect((await send(app, url, 'PUT', { status: 'reviewed' }, bearer(psychologistToken))).status).toBe(409);
        expect(rows[0].status).toBe('released');
    });

    it('keeps the manual sheet copy for admins only', async () => {
        const { app } = createFixture();
        expect((await send(app, '/api/admin/assessments/sync', 'POST', {}, bearer(psychologistToken))).status).toBe(403);
        expect((await send(app, '/api/admin/assessments/sync', 'POST', {}, bearer(adminToken))).status).toBe(200);
    });
});

describe('MHCU staff workflow: assignment, notes, payment, reports', () => {
    const adminHeaders = bearer(adminToken);
    const psyHeaders = bearer(psychologistToken);

    it('shows a psychologist only the check-ups assigned to them', async () => {
        const unassigned = createFixture({ unassigned: true });
        await submit(unassigned.app, body());
        // not assigned yet: the psychologist sees nothing
        expect((await (await send(unassigned.app, '/api/admin/assessment-lists/mhcu', 'GET', undefined, psyHeaders)).json()).data).toHaveLength(0);
        const fixture = createFixture({ unassigned: true });
        await submit(fixture.app, body());
        fixture.rows[0].psychologistId = OTHER_PSY_ID;
        expect((await (await send(fixture.app, '/api/admin/assessment-lists/mhcu', 'GET', undefined, psyHeaders)).json()).data).toHaveLength(0);
        expect((await send(fixture.app, `/api/admin/assessments/${idOf(1)}`, 'GET', undefined, psyHeaders)).status).toBe(404);
        expect((await send(fixture.app, `/api/admin/assessments/${idOf(1)}/report/psychologist`, 'GET', undefined, psyHeaders)).status).toBe(404);
        expect((await send(fixture.app, `/api/admin/assessments/${idOf(1)}`, 'GET', undefined, adminHeaders)).status).toBe(200);
    });

    it('lets only admins assign a psychologist, and rejects an unknown one', async () => {
        const { app, rows } = createFixture({ unassigned: true });
        await submit(app, body());
        const url = `/api/admin/assessments/${idOf(1)}/psychologist`;
        expect((await send(app, url, 'PUT', { psychologistId: PSY_ID }, psyHeaders)).status).toBe(403);
        expect((await send(app, url, 'PUT', { psychologistId: idOf(77) }, adminHeaders)).status).toBe(400);
        expect((await send(app, url, 'PUT', { psychologistId: 'nope' }, adminHeaders)).status).toBe(400);
        expect((await send(app, url, 'PUT', { psychologistId: PSY_ID }, adminHeaders)).status).toBe(200);
        expect(rows[0].psychologistId).toBe(PSY_ID);
        expect((await send(app, url, 'PUT', { psychologistId: null }, adminHeaders)).status).toBe(200);
        expect(rows[0].psychologistId).toBeNull();
    });

    it('saves the note, limits the special note to 500 characters, and keeps other psychologists out', async () => {
        const { app, rows } = createFixture();
        await submit(app, body());
        const url = `/api/admin/assessments/${idOf(1)}/note`;
        expect((await send(app, url, 'PUT', { template: 'Teks', custom: 'x'.repeat(501), final: false }, psyHeaders)).status).toBe(400);
        expect((await send(app, url, 'PUT', { template: 'Teks', custom: 'Catatan', final: 'yes' }, psyHeaders)).status).toBe(400);
        expect((await send(app, url, 'PUT', { template: ' Teks ', custom: ' Catatan ', final: true }, psyHeaders)).status).toBe(200);
        expect(rows[0]).toMatchObject({ noteTemplate: 'Teks', noteCustom: 'Catatan', noteFinal: true });
        rows[0].psychologistId = OTHER_PSY_ID;
        expect((await send(app, url, 'PUT', { template: 'a', custom: null, final: false }, psyHeaders)).status).toBe(404);
    });

    it('sets the payment status for admins only and validates it', async () => {
        const { app, rows } = createFixture();
        await submit(app, body());
        const url = `/api/admin/assessments/${idOf(1)}/payment`;
        expect((await send(app, url, 'PUT', { status: 'PAID' }, psyHeaders)).status).toBe(403);
        expect((await send(app, url, 'PUT', { status: 'MAYBE' }, adminHeaders)).status).toBe(400);
        expect((await send(app, url, 'PUT', { status: 'PAID', amount: -5 }, adminHeaders)).status).toBe(400);
        expect((await send(app, url, 'PUT', { status: 'PAID', package: 'single', amount: 227000, ref: 'BCA 22/11' }, adminHeaders)).status).toBe(200);
        expect(rows[0]).toMatchObject({ paymentStatus: 'PAID', paymentAmount: 227000 });
    });

    it('previews both reports for staff as no-store pages', async () => {
        const { app } = createFixture();
        await submit(app, body());
        const client = await send(app, `/api/admin/assessments/${idOf(1)}/report/client`, 'GET', undefined, psyHeaders);
        expect(client.status).toBe(200);
        expect(client.headers.get('cache-control')).toBe('no-store');
        expect(await client.text()).toContain('Rina Pratiwi');
        const internal = await send(app, `/api/admin/assessments/${idOf(1)}/report/psychologist`, 'GET', undefined, psyHeaders);
        expect(internal.status).toBe(200);
        expect(await internal.text()).toContain('AT-MHCU-2026-100');
        expect((await send(app, `/api/admin/assessments/${idOf(1)}/report/other`, 'GET', undefined, psyHeaders)).status).toBe(404);
        expect((await send(app, `/api/admin/assessments/${idOf(1)}/report/client`, 'GET')).status).toBe(401);
    });

    it('releases the report only with a final note and confirmed payment, then e-mails the signed link that opens the client report', async () => {
        const { app, rows, sent } = createFixture();
        await submit(app, body());
        sent.length = 0;
        const release = `/api/admin/assessments/${idOf(1)}/release-report`;
        expect((await send(app, release, 'POST', {}, psyHeaders)).status).toBe(403);
        expect((await send(app, release, 'POST', {}, adminHeaders)).status).toBe(409); // note not final
        await send(app, `/api/admin/assessments/${idOf(1)}/note`, 'PUT', { template: null, custom: null, final: true }, adminHeaders);
        expect((await send(app, release, 'POST', {}, adminHeaders)).status).toBe(409); // not paid
        await send(app, `/api/admin/assessments/${idOf(1)}/payment`, 'PUT', { status: 'PAID' }, adminHeaders);
        const done = await send(app, release, 'POST', {}, adminHeaders);
        expect(done.status).toBe(200);
        expect((await done.json()).data).toEqual({ released: true, emailed: true });
        expect(rows[0].status).toBe('released');
        expect(sent).toHaveLength(1);
        const link = /https:\/\/attentiveid\.com(\/api\/public\/assessments\/report\?[^\s"<]+)/.exec(sent[0].text ?? '');
        expect(link).not.toBeNull();
        const open = await send(app, link![1], 'GET');
        expect(open.status).toBe(200);
        expect(open.headers.get('cache-control')).toBe('no-store');
        expect(open.headers.get('x-robots-tag')).toContain('noindex');
        expect(await open.text()).toContain('Rina Pratiwi');
    });

    it('does not open the public report for a wrong token, an unreleased result or a made-up code', async () => {
        const { app, rows } = createFixture();
        await submit(app, body());
        const bad = await send(app, '/api/public/assessments/report?id=AT-MHCU-2026-100&t=aaaaaaaaaaaaaaaaaaaaaaaa', 'GET');
        expect(bad.status).toBe(404);
        expect((await send(app, '/api/public/assessments/report?id=x&t=y', 'GET')).status).toBe(404);
        expect(rows[0].status).toBe('new');
    });
});

const gscBody = (overrides: Record<string, unknown> = {}) => ({
    id: 'GSC-261121-AB12',
    ts: '2026-11-21T03:00:00Z',
    lang: 'id',
    profile: { name: 'Rina Pratiwi', age: 29, sex: 'Perempuan', edu: 'D4/S1', email: 'rina@example.com', wa: '6281234567890' },
    minutes: 14,
    brief: { core: 'Karier', n: 8 },
    goals: ['Naik jabatan', 'Lebih sehat', 'Tabungan', 'Waktu keluarga', 'Belajar', 'Hobi'],
    code: 'H4sIAAAAAAAAA-3QQQqAIBAF0KuMa2cqQXQBr9AiXDJkKFIrNb7C_',
    ...overrides
});
const submitGsc = (app: TestApp, payload: unknown, headers: Record<string, string> = {}) => send(app, '/api/public/assessments/gsc', 'POST', payload, headers);

describe('Goal System Compass', () => {
    it('stores a session for staff and answers with the code only', async () => {
        const { app, rows } = createFixture();
        const response = await submitGsc(app, gscBody());
        expect(response.status).toBe(201);
        const json = await response.json();
        expect(json).toMatchObject({ ok: true, code: expect.stringContaining('AT-') });
        expect(JSON.stringify(json)).not.toContain('H4sI');
        expect(rows[0]).toMatchObject({ instrument: 'gsc', track: 'mandiri', status: 'new', level: null, researchConsent: false });
        expect((rows[0].answers as { code: string }).code).toContain('H4sI');
    });

    it('treats the same session sent again as one, ignores the honeypot and refuses bad data', async () => {
        const { app, rows } = createFixture();
        await submitGsc(app, gscBody());
        await submitGsc(app, gscBody());
        expect(rows).toHaveLength(1);
        expect((await submitGsc(app, gscBody({ website: 'x', id: 'GSC-other' }))).status).toBe(201);
        expect(rows).toHaveLength(1);
        expect((await submitGsc(app, gscBody({ code: 'not valid!' }))).status).toBe(400);
        expect((await submitGsc(app, gscBody(), { 'content-length': String(5 * 1024 * 1024) })).status).toBe(413);
    });

    it('lists both assessments for staff by name and knows only those two', async () => {
        const { app } = createFixture();
        await submitGsc(app, gscBody());
        expect((await send(app, '/api/admin/assessment-lists/gsc', 'GET')).status).toBe(401);
        expect((await send(app, '/api/admin/assessment-lists/gsc', 'GET', undefined, bearer(psychologistToken))).status).toBe(200);
        expect((await send(app, '/api/admin/assessment-lists/other', 'GET', undefined, bearer(psychologistToken))).status).toBe(404);
    });
});


describe('result e-mail after a submission', () => {
    const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

    it('sends the four index scores and the report link to the participant, once', async () => {
        const { app, sent, emailed } = createFixture();
        await submit(app, body());
        await submit(app, body()); // the same click again: no second e-mail
        await settle();
        const toPerson = sent.filter((mail) => mail.to === 'rina@example.com');
        expect(toPerson).toHaveLength(1);
        expect(sent).toHaveLength(2); // the person's result and one copy for the admin inbox
        expect(toPerson[0].html).toContain('Distress Index');
        expect(toPerson[0].html).toContain('https://attentiveid.com/assessments/payment?id=AT-MHCU-2026-100&amp;t=');
        expect(emailed).toHaveLength(1);
    });

    it('still saves the answers when the mail server is down, and sends nothing when e-mail is not set up', async () => {
        const down = createFixture({ mail: 'fail' });
        expect((await submit(down.app, body())).status).toBe(201);
        await settle();
        expect(down.rows).toHaveLength(1);
        expect(down.emailed).toHaveLength(0);
        const off = createFixture({ mail: 'off' });
        expect((await submit(off.app, body())).status).toBe(201);
        await settle();
        expect(off.sent).toHaveLength(0);
    });

    it('does not e-mail a Goal System Compass session', async () => {
        const { app, sent } = createFixture();
        await submitGsc(app, gscBody());
        await settle();
        expect(sent).toHaveLength(0);
    });
});


describe('alert for a Level 4-5 result', () => {
    const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

    it('e-mails staff the contact details and the response time, once, and copies lower levels with a calmer subject', async () => {
        const high = createFixture();
        await submit(high.app, body({ answers: answersWith({ [mhcuCode('cc', 11)]: 3 }), email: 'high@example.com' }));
        await submit(high.app, body({ answers: answersWith({ [mhcuCode('cc', 11)]: 3 }), email: 'high@example.com' })); // same click again
        await settle();
        const alerts = high.sent.filter((mail) => mail.to === 'alerts@attentive.id');
        expect(alerts).toHaveLength(1);
        expect(alerts[0].subject).toContain('[MHCU] Level 5');
        expect(alerts[0].text).toContain('081234567890');
        expect(alerts[0].text).toContain('high@example.com');
        expect(alerts[0].text).toContain('/dashboard/assessments');
        expect(high.alerted).toHaveLength(1);
        const low = createFixture();
        await submit(low.app, body());
        await settle();
        const copies = low.sent.filter((mail) => mail.to === 'alerts@attentive.id');
        expect(copies).toHaveLength(1);
        expect(copies[0].subject).toContain('[MHCU] Hasil baru');
        expect(copies[0].subject).not.toContain('hubungi');
        expect(copies[0].text).toContain('/dashboard/assessments/mhcu/');
    });

    it('never puts the alert and its contact details in the e-mail the person receives', async () => {
        const { app, sent } = createFixture();
        await submit(app, body({ answers: answersWith({ [mhcuCode('cc', 11)]: 3 }) }));
        await settle();
        const toPerson = sent.find((mail) => mail.to === 'rina@example.com');
        expect(toPerson).toBeDefined();
        expect(toPerson?.html).not.toContain('Tindak lanjut:');
    });
});
