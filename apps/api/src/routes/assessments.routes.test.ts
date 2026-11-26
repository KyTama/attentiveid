import { createHash } from 'node:crypto';
import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto } from '@attentiveid/shared';
import { MHCU_ANSWER_RANGE, MHCU_ITEMS, mhcuCode } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import { InviteUnavailableError, type AssessmentListItem, type AssessmentRow, type AssessmentsRepository, type AssessmentStatus, type AuditEntry, type NewAssessmentSubmission } from '../repositories/assessments.repository';
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
const superadmin = makeUser('super-1', 'superadmin');
const usersById = new Map([[admin.id, admin], [psychologist.id, psychologist], [superadmin.id, superadmin]]);
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

const createFixture = (options: { max?: number; failCreate?: boolean; mail?: 'ok' | 'fail' | 'off'; unassigned?: boolean; inviteUnavailable?: boolean; track?: string; creditsRemaining?: number; drive?: 'ok' | 'fail' | 'hang-first'; pdf?: 'off' | 'internal-fails'; draftTimeoutMs?: number } = {}) => {
    let hung = false;
    const printing = { now: 0, most: 0 };
    const sheetRows: Array<{ title: string; tab: string; headers: string[]; key: string; values: string[] }> = [];
    const driveSaved: Array<{ code: string; at: Date; files: Array<{ name: string; mimeType: string; data: Uint8Array | string }> }> = [];
    const printed: string[] = [];
    const rows: AssessmentRow[] = [];
    const inputs: NewAssessmentSubmission[] = [];
    const audits: AuditEntry[] = [];
    const sent: MailMessage[] = [];
    const emailed: string[] = [];
    const alerted: string[] = [];
    let synced = 0;
    const repository: AssessmentsRepository = {
        create: async (input, createOptions) => {
            if (options.failCreate) throw new Error('Failed query: insert ... params: Rina Pratiwi, 081234567890');
            inputs.push(input);
            if (options.inviteUnavailable && input.inviteToken) throw new InviteUnavailableError();
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
            if (options.track) Object.assign(row, { track: options.track });
            rows.push(row);
            return { id: row.id, code: row.code, duplicate: false, participantId: null, waveNo: 1, track: options.track, psychologistId: options.track ? PSY_ID : undefined, creditsRemaining: options.creditsRemaining };
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
            if (input.templateEn !== undefined) Object.assign(row, { noteTemplateEn: input.templateEn });
            if (input.customEn !== undefined) Object.assign(row, { noteCustomEn: input.customEn });
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
        listUnsynced: async () => [],
        setPrice: async (id, price) => {
            const row = rows.find((entry) => entry.id === id);
            if (!row) return { status: 'notFound' };
            if (row.track !== 'lanjutan') return { status: 'wrongTrack' };
            Object.assign(row, { priceDue: price });
            return { status: 'ok', row };
        },
        getParticipant: async () => null,
        audit: async (entry) => { audits.push(entry); },
        deleteSubmission: async (id) => {
            const index = rows.findIndex((row) => row.id === id);
            if (index < 0) return null;
            const [row] = rows.splice(index, 1);
            return { code: row.code, instrument: row.instrument };
        }
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
            pdfRenderer: options.pdf === 'off' ? null : async (html) => { if (options.pdf === 'internal-fails' && html.includes('MHCU (internal)')) throw new Error('browser crashed'); printing.now += 1; printing.most = Math.max(printing.most, printing.now); await new Promise((done) => setTimeout(done, 2)); printing.now -= 1; printed.push(html); return new TextEncoder().encode('%PDF-fake'); },
            draftTimeoutMs: options.draftTimeoutMs,
            driveReports: options.drive
                ? { isConfigured: true, saveReport: async (input) => { if (options.drive === 'fail') throw new Error('drive down'); if (options.drive === 'hang-first' && !hung) { hung = true; await new Promise(() => {}); } driveSaved.push(input); return { path: `Reports / MHCU / 2026 / 11 / ${input.code}`, folderId: 'folder-1', files: input.files.map((file) => file.name) }; }, upsertSheetRow: async (input) => { if (options.drive === 'fail') throw new Error('sheet down'); sheetRows.push(input); return { spreadsheetId: 'sheet-1', updated: false }; } }
                : undefined,
            paymentSecret: 'payment-secret-payment-secret-1234',
            siteOrigin: 'https://attentiveid.com',
            sheetSync: { isConfigured: true, syncPending: async () => { synced += 1; return { configured: true, synced: 0, error: null }; } },
            rateLimit: { max: options.max ?? 6, windowMs: 60_000 }
        })
    );
    return { app, printing, rows, sent, emailed, alerted, inputs, audits, driveSaved, printed, sheetRows, syncCalls: () => synced };
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

    it('does not let client claims change how the person is recorded', async () => {
        const { app, rows } = createFixture();
        await submit(app, body({ track: 'asesmen', level: 1, status: 'released', psychologist_id: 'x', payment_status: 'PAID' }));
        expect(rows[0]).toMatchObject({ track: 'mandiri', status: 'new', paymentStatus: 'UNPAID' });
    });

    it('refuses an invitation token that is not 16 hex characters, and saves nothing', async () => {
        const { app, rows } = createFixture();
        const response = await submit(app, body({ invite: 'abcdef123456' }));
        expect(response.status).toBe(400);
        expect(((await response.json()) as { error: string }).error).toContain('Tautan undangan');
        expect(rows).toHaveLength(0);
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

    it('shows a superadmin every check-up, also unassigned ones, like an admin', async () => {
        const fixture = createFixture({ unassigned: true });
        await submit(fixture.app, body());
        const superToken = tokenService.issueAccessToken(superadmin).accessToken;
        const list = await send(fixture.app, '/api/admin/assessment-lists/mhcu', 'GET', undefined, bearer(superToken));
        expect((await list.json()).data).toHaveLength(1);
        expect((await send(fixture.app, `/api/admin/assessments/${idOf(1)}`, 'GET', undefined, bearer(superToken))).status).toBe(200);
        expect((await send(fixture.app, `/api/admin/assessments/${idOf(1)}/report/psychologist`, 'GET', undefined, bearer(superToken))).status).toBe(200);
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
        const preview = await client.text();
        expect(preview).toContain('Rina Pratiwi');
        // the client report comes inside the report page, marked as a staff preview (no copy-link button)
        expect(preview).toContain('Laporan Hasil Pemeriksaan MHCU');
        expect(preview).toContain('Pratinjau untuk staf.');
        expect(preview).not.toContain('id="rp-copy"');
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
        expect((await done.json()).data).toEqual({ released: true, emailed: true, drivePath: null, drive: 'off', driveError: null });
        expect(rows[0].status).toBe('released');
        // the participant gets the report in both languages, and the staff inbox gets a copy with both links
        expect(sent.map((mail) => mail.to)).toEqual(['rina@example.com', 'alerts@attentive.id']);
        expect(sent[0].text).toContain('lang=id');
        expect(sent[0].text).toContain('lang=en');
        expect(sent[1].subject).toContain('[MHCU] Laporan dirilis');
        const english = /https:\/\/attentiveid\.com(\/api\/public\/assessments\/report\?[^\s"<]+lang=en)/.exec(sent[0].text ?? '');
        expect(english).not.toBeNull();
        const englishPage = await (await send(app, english![1], 'GET')).text();
        expect(englishPage).toContain('Mental Health Check-Up Report');
        const link = /https:\/\/attentiveid\.com(\/api\/public\/assessments\/report\?[^\s"<]+lang=id)/.exec(sent[0].text ?? '');
        expect(link).not.toBeNull();
        const open = await send(app, link![1], 'GET');
        expect(open.status).toBe(200);
        expect(open.headers.get('cache-control')).toBe('no-store');
        expect(open.headers.get('x-robots-tag')).toContain('noindex');
        const page = await open.text();
        // the page's own policy lets it show its styles, logo and font, and run only its one inline script (by hash)
        const policy = open.headers.get('content-security-policy') ?? '';
        expect(policy).toContain("style-src 'unsafe-inline'");
        expect(policy).toContain("img-src 'self'");
        expect(policy).toContain("font-src 'self'");
        expect(policy).toContain("frame-ancestors 'none'");
        const script = /<script>([\s\S]*?)<\/script>/.exec(page)![1];
        expect(policy).toContain(`'sha256-${createHash('sha256').update(script).digest('base64')}'`);
        expect(page).toContain('Rina Pratiwi');
        // the participant's page: title, print and copy buttons, then the A4 pages; no staff ribbon
        expect(page).toContain('Laporan Hasil Pemeriksaan MHCU');
        expect(page).toContain('id="rp-print"');
        expect(page).toContain('id="rp-copy"');
        expect(page).not.toContain('Pratinjau untuk staf.');
        expect(page).toContain('<div class="page">');
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


describe('what the thank-you page gets to offer the full report', () => {
    it('returns the signed report-page link and the current prices for a normal check-up', async () => {
        const { app } = createFixture();
        const json = await (await submit(app, body())).json();
        expect(json).toMatchObject({ ok: true, code: 'AT-MHCU-2026-100', track: 'mandiri', canBuy: true });
        expect(json.reportLink).toContain('https://attentiveid.com/assessments/payment?id=AT-MHCU-2026-100&t=');
        expect(json.pricing).toMatchObject({ single: { price: 227000, normal: 297000 }, package3: { price: 647000, normal: 885000 }, promoActive: true });
        expect(JSON.stringify(json)).not.toContain('scores');
    });

    it('still gives the link for a second click, and never puts the scores in the answer', async () => {
        const { app } = createFixture();
        await submit(app, body());
        const again = await (await submit(app, body())).json();
        expect(again.code).toBe('AT-MHCU-2026-100');
        expect(again.reportLink).toContain('t=');
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

    it('sends a Goal System Compass session only its own e-mails, never the Mental Health Check-Up result', async () => {
        const { app, sent } = createFixture();
        await submitGsc(app, gscBody());
        await settle();
        expect(sent).toHaveLength(2);
        expect(sent.every((mail) => !mail.subject.startsWith('[MHCU]') && !mail.text.includes('Mental Health Index'))).toBe(true);
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

describe('MHCU invitations on the public form', () => {
    const token = 'abcdef0123456789';
    const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

    it('passes a valid-looking token to the repository and never trusts the body for track, payment or psychologist', async () => {
        const { app, inputs } = createFixture();
        const response = await submit(app, body({ invite: token, track: 'free', psychologist_id: 'x', payment_status: 'PAID' }));
        expect(response.status).toBe(201);
        expect(inputs[0]?.inviteToken).toBe(token);
        expect(inputs[0]?.track).toBe('mandiri');
    });

    it('sends no token when the form has none', async () => {
        const { app, inputs } = createFixture();
        await submit(app, body());
        expect(inputs[0]?.inviteToken).toBeNull();
    });

    it('answers a used, cancelled or unknown invitation with a clear 400 and stores nothing', async () => {
        const { app, rows, sent } = createFixture({ inviteUnavailable: true });
        const response = await submit(app, body({ invite: token }));
        expect(response.status).toBe(400);
        const json = (await response.json()) as { ok: boolean; error: string };
        expect(json.ok).toBe(false);
        expect(json.error).toContain('Tautan undangan tidak valid atau sudah dipakai');
        expect(json.error).toContain('invitation link');
        expect(rows).toHaveLength(0);
        await settle();
        expect(sent).toHaveLength(0);
    });

    it('e-mails the asesmen variant (no prices, the psychologist, included) when the repository says asesmen', async () => {
        const { app, sent } = createFixture({ track: 'asesmen' });
        await submit(app, body({ invite: token, email: 'asesmen@example.com' }));
        await settle();
        const mail = sent.find((m) => m.to === 'asesmen@example.com');
        expect(mail?.text).toContain('Sudah termasuk dalam asesmen awal Anda.');
        expect(mail?.text).toContain('Psikolog pemeriksa: dr. Aly');
        expect(mail?.text).not.toContain('Rp 227.000');
    });

    it('e-mails the package variant with the credits left', async () => {
        const { app, sent } = createFixture({ track: 'paket', creditsRemaining: 1 });
        await submit(app, body({ email: 'paket@example.com' }));
        await settle();
        const mail = sent.find((m) => m.to === 'paket@example.com');
        expect(mail?.text).toContain('Termasuk dalam paket 3x Anda. Sisa kuota setelah pemeriksaan ini: 1.');
    });

    it('keeps the public-link e-mail with prices when there is no invitation', async () => {
        const { app, sent } = createFixture();
        await submit(app, body({ email: 'plain@example.com' }));
        await settle();
        const mail = sent.find((m) => m.to === 'plain@example.com');
        expect(mail?.text).toContain('Rp 227.000');
    });
});

describe('PUT price and package payments (admin)', () => {
    const adminHeaders = bearer(adminToken);
    const psyHeaders = bearer(psychologistToken);

    it('sets the price of a lanjutan check-up for admins only, refuses other tracks, and writes an audit row without personal data', async () => {
        const { app, rows, audits } = createFixture({ track: 'lanjutan' });
        await submit(app, body());
        const url = `/api/admin/assessments/${idOf(1)}/price`;
        expect((await send(app, url, 'PUT', { price: 200000 }, psyHeaders)).status).toBe(403);
        expect((await send(app, url, 'PUT', { price: 200000 })).status).toBe(401);
        expect((await send(app, url, 'PUT', { price: -1 }, adminHeaders)).status).toBe(400);
        expect((await send(app, url, 'PUT', { price: 'abc' }, adminHeaders)).status).toBe(400);
        expect((await send(app, url, 'PUT', { price: 1.5 }, adminHeaders)).status).toBe(400);
        expect((await send(app, `/api/admin/assessments/${idOf(99)}/price`, 'PUT', { price: 1000 }, adminHeaders)).status).toBe(404);
        const ok = await send(app, url, 'PUT', { price: '200000' }, adminHeaders);
        expect(ok.status).toBe(200);
        expect(rows[0]).toMatchObject({ priceDue: 200000 });
        expect(audits).toEqual([{ actor: 'admin-1', action: 'price', submissionId: idOf(1), detail: '200000' }]);
        const mandiri = createFixture();
        await submit(mandiri.app, body());
        expect((await send(mandiri.app, `/api/admin/assessments/${idOf(1)}/price`, 'PUT', { price: 1000 }, adminHeaders)).status).toBe(409);
        expect(mandiri.audits).toHaveLength(0);
    });

    it('accepts package 1x and 3x on the payment route and audits the change without names or scores', async () => {
        const { app, rows, audits } = createFixture();
        await submit(app, body());
        const url = `/api/admin/assessments/${idOf(1)}/payment`;
        expect((await send(app, url, 'PUT', { status: 'PAID', package: '3x', amount: 647000, ref: 'BCA' }, adminHeaders)).status).toBe(200);
        expect(rows[0]).toMatchObject({ paymentStatus: 'PAID', paymentPackage: '3x', paymentAmount: 647000 });
        expect(audits).toHaveLength(1);
        expect(audits[0]).toMatchObject({ actor: 'admin-1', action: 'payment', submissionId: idOf(1), detail: 'PAID 3x Rp647000' });
        expect(JSON.stringify(audits)).not.toContain('Rina');
        expect(JSON.stringify(audits)).not.toContain('rina@');
        expect((await send(app, url, 'PUT', { status: 'PAID', package: '1x' }, adminHeaders)).status).toBe(200);
    });
});

describe('Goal System Compass e-mails', () => {
    const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

    it('confirms to the person and tells the staff inbox', async () => {
        const { app, sent } = createFixture();
        expect((await submitGsc(app, gscBody())).status).toBe(201);
        await settle();
        expect(sent.map((mail) => mail.to).sort()).toEqual(['alerts@attentive.id', 'rina@example.com']);
        const person = sent.find((mail) => mail.to === 'rina@example.com')!;
        expect(person.subject).toContain('Goal System Compass');
        expect(person.text).toContain('Rina Pratiwi');
        const staff = sent.find((mail) => mail.to === 'alerts@attentive.id')!;
        expect(staff.subject).toContain('[GSC]');
        expect(staff.text).toContain('/dashboard/assessments/gsc');
        expect(staff.text).not.toContain('H4sI');
    });

    it('writes to the person in English when they filled in the form in English', async () => {
        const { app, sent } = createFixture();
        await submitGsc(app, gscBody({ lang: 'en' }));
        await settle();
        expect(sent.find((mail) => mail.to === 'rina@example.com')!.subject).toContain('We received');
    });

    it('sends once for a repeated submission and not at all for a bot', async () => {
        const { app, sent } = createFixture();
        await submitGsc(app, gscBody());
        await submitGsc(app, gscBody());
        await settle();
        expect(sent).toHaveLength(2);
        await submitGsc(app, gscBody({ website: 'x' }));
        await settle();
        expect(sent).toHaveLength(2);
    });

    it('still stores the session when e-mail is failing', async () => {
        const { app, rows } = createFixture({ mail: 'fail' });
        expect((await submitGsc(app, gscBody())).status).toBe(201);
        await settle();
        expect(rows.filter((row) => row.instrument === 'gsc')).toHaveLength(1);
    });
});

describe('DELETE /api/admin/assessments/:id (owner only)', () => {
    const ownerUser: UserDto = { ...makeUser('owner-1', 'superadmin'), email: 'nico.alex.ha@gmail.com' };
    usersById.set(ownerUser.id, ownerUser);
    const ownerToken = tokenService.issueAccessToken(ownerUser).accessToken;
    const superToken = tokenService.issueAccessToken(superadmin).accessToken;

    it('lets the owner delete a result, keeps an audit line without personal data, and returns 404 afterwards', async () => {
        const { app, rows, audits } = createFixture();
        await submit(app, body());
        const id = rows[0].id;
        const done = await send(app, `/api/admin/assessments/${id}`, 'DELETE', undefined, bearer(ownerToken));
        expect(done.status).toBe(200);
        expect((await done.json()).data).toEqual({ id, code: 'AT-MHCU-2026-100' });
        expect(rows).toHaveLength(0);
        expect(audits.at(-1)).toMatchObject({ action: 'delete', detail: 'AT-MHCU-2026-100', submissionId: id });
        expect(JSON.stringify(audits.at(-1))).not.toContain('Rina');
        expect((await send(app, `/api/admin/assessments/${id}`, 'DELETE', undefined, bearer(ownerToken))).status).toBe(404);
    });

    it('refuses everyone else (no login, psychologist, admin, another superadmin) and deletes nothing', async () => {
        const { app, rows } = createFixture();
        await submit(app, body());
        const id = rows[0].id;
        expect((await send(app, `/api/admin/assessments/${id}`, 'DELETE')).status).toBe(401);
        expect((await send(app, `/api/admin/assessments/${id}`, 'DELETE', undefined, bearer(psychologistToken))).status).toBe(403);
        expect((await send(app, `/api/admin/assessments/${id}`, 'DELETE', undefined, bearer(adminToken))).status).toBe(403);
        expect((await send(app, `/api/admin/assessments/${id}`, 'DELETE', undefined, bearer(superToken))).status).toBe(403);
        expect(rows).toHaveLength(1);
    });

    it('returns 404 for a bad id', async () => {
        const { app } = createFixture();
        expect((await send(app, '/api/admin/assessments/not-an-id', 'DELETE', undefined, bearer(ownerToken))).status).toBe(404);
    });
});

describe('released reports saved to Drive', () => {
    const release = async (options: { drive?: 'ok' | 'fail'; pdf?: 'off' | 'internal-fails' }) => {
        const fixture = createFixture(options);
        await submit(fixture.app, body());
        // the draft that is made right after the submission is finished first; this checks what the release itself does
        await new Promise((resolve) => setTimeout(resolve, 60));
        fixture.driveSaved.length = 0;
        fixture.printed.length = 0;
        fixture.sheetRows.length = 0;
        fixture.sent.length = 0;
        const id = fixture.rows[0].id;
        await send(fixture.app, `/api/admin/assessments/${id}/note`, 'PUT', { template: null, custom: null, final: true }, bearer(adminToken));
        await send(fixture.app, `/api/admin/assessments/${id}/payment`, 'PUT', { status: 'PAID' }, bearer(adminToken));
        const done = await send(fixture.app, `/api/admin/assessments/${id}/release-report`, 'POST', {}, bearer(adminToken));
        return { ...fixture, done };
    };

    const ALL_DRIVE_FILES = [
        'AT-MHCU-2026-100 - MHCU (ID).pdf',
        'AT-MHCU-2026-100 - MHCU (EN).pdf',
        'AT-MHCU-2026-100 - MHCU Psikolog (ID).pdf',
        'AT-MHCU-2026-100 - MHCU Psikolog (EN).pdf'
    ];
    /** The two Drive saves of one check-up: the client folder, then the internal tree. */
    const saves = (list: Array<{ folder?: string; files: Array<{ name: string }> }>) => list.map((save) => ({ folder: save.folder ?? 'MHCU', names: save.files.map((file) => file.name) }));
    const BOTH_TREES = [
        { folder: 'MHCU', names: ALL_DRIVE_FILES.slice(0, 2) },
        { folder: 'MHCU Internal', names: ALL_DRIVE_FILES.slice(2) }
    ];

    it('saves both languages as plain PDFs (the report pages only) and says where', async () => {
        const { done, driveSaved, audits, printed } = await release({ drive: 'ok' });
        expect(done.status).toBe(200);
        expect((await done.json()).data.drivePath).toBe('Reports / MHCU / 2026 / 11 / AT-MHCU-2026-100');
        expect(saves(driveSaved)).toEqual(BOTH_TREES);
        expect(driveSaved[0].files.every((file) => file.mimeType === 'application/pdf')).toBe(true);
        // what was printed is the report itself: its pages, in each language, with no page frame, title or buttons
        expect(printed).toHaveLength(4);
        // the last two are the internal (psychologist) reports, one per language
        expect(printed[2]).toContain('MHCU (internal)');
        expect(printed[2]).toContain('HANYA UNTUK PSIKOLOG');
        expect(printed[3]).toContain('FOR PSYCHOLOGISTS ONLY');
        expect(printed[0]).not.toContain('HANYA UNTUK PSIKOLOG');
        for (const html of printed.slice(0, 2)) {
            expect(html).toContain('<div class="page">');
            expect(html).not.toContain('rp-save');
            expect(html).not.toContain('rp-frame');
            expect(html).not.toContain('<script');
        }
        expect(printed[0]).toContain('Psikolog Pemeriksa');
        expect(printed[1]).toContain('Examining Psychologist');
        expect(audits.some((entry) => entry.action === 'send' && String(entry.detail).includes('saved to Drive'))).toBe(true);
    });

    it('release e-mails both PDFs to the participant and to staff, with or without Drive', async () => {
        for (const options of [{ drive: 'ok' as const }, {}, { drive: 'fail' as const }]) {
            const { sent } = await release(options);
            expect(sent.map((mail) => mail.to)).toEqual(['rina@example.com', 'alerts@attentive.id']);
            for (const mail of sent) {
                expect(mail.attachments?.map((file) => file.filename)).toEqual(['AT-MHCU-2026-100 - MHCU (ID).pdf', 'AT-MHCU-2026-100 - MHCU (EN).pdf']);
                expect(mail.attachments?.every((file) => file.contentType === 'application/pdf')).toBe(true);
            }
            expect(sent[0].text).toContain('terlampir');
        }
    });

    it('never attaches the internal report to an e-mail', async () => {
        const { sent } = await release({ drive: 'ok' });
        for (const mail of sent) expect(mail.attachments?.some((file) => /Psikolog/.test(file.filename))).toBe(false);
    });

    it('keeps the client copy on Drive when the internal report cannot be printed, and says the Drive save failed', async () => {
        const { done, driveSaved, sent } = await release({ drive: 'ok', pdf: 'internal-fails' });
        expect(done.status).toBe(200);
        const data = (await done.json()).data;
        expect(data).toMatchObject({ released: true, emailed: true, drive: 'failed' });
        expect(data.driveError).toContain('psychologist report could not be saved');
        expect(saves(driveSaved)).toEqual(BOTH_TREES.slice(0, 1));
        expect(sent[0].attachments).toHaveLength(2);
    });

    it('without a PDF engine the release still e-mails the links, just without attachments', async () => {
        const { sent, done } = await release({ drive: 'ok', pdf: 'off' });
        expect(done.status).toBe(200);
        expect((await done.json()).data).toMatchObject({ released: true, emailed: true, drive: 'failed' });
        expect(sent[0].attachments).toBeUndefined();
        expect(sent[0].text).not.toContain('terlampir');
    });

    it('a burst of submissions prints one report at a time', async () => {
        const { app, printing, driveSaved } = createFixture({ drive: 'ok', max: 20 });
        await Promise.all([0, 1, 2, 3, 4, 5].map((i) => submit(app, body({ email: `burst${i}@example.com` }), { 'x-forwarded-for': `203.0.113.${i}` })));
        for (let waited = 0; waited < 100 && driveSaved.length < 12; waited += 1) await new Promise((resolve) => setTimeout(resolve, 20));
        expect(driveSaved).toHaveLength(12);
        expect(printing.most).toBe(1);
    });

    it('a draft that hangs is given up on after the timeout, so later submissions are still copied', async () => {
        const { app, driveSaved } = createFixture({ drive: 'hang-first', draftTimeoutMs: 150, max: 20 });
        await submit(app, body({ email: 'stuck@example.com' }), { 'x-forwarded-for': '203.0.113.1' });
        await submit(app, body({ email: 'next@example.com' }), { 'x-forwarded-for': '203.0.113.2' });
        await new Promise((resolve) => setTimeout(resolve, 60));
        expect(driveSaved).toHaveLength(0); // still waiting behind the stuck one
        for (let waited = 0; waited < 100 && driveSaved.length < 2; waited += 1) await new Promise((resolve) => setTimeout(resolve, 20));
        expect(driveSaved.map((save) => `${save.code} ${save.folder ?? 'MHCU'}`)).toEqual(['AT-MHCU-2026-101 MHCU', 'AT-MHCU-2026-101 MHCU Internal']);
    });

    it('right after a submission the PDFs and the raw-answers row go to Drive, and nothing is sent to the person', async () => {
        const { app, driveSaved, sheetRows, sent, rows } = createFixture({ drive: 'ok' });
        await submit(app, body());
        await new Promise((resolve) => setTimeout(resolve, 60));
        expect(saves(driveSaved)).toEqual(BOTH_TREES);
        // the result e-mail and the staff alert carry no report
        expect(sent.length).toBeGreaterThan(0);
        expect(sent.every((mail) => mail.attachments === undefined)).toBe(true);
        // the sheet row: who answered, then every raw answer
        expect(sheetRows).toHaveLength(1);
        const [{ headers, values, key, title, tab }] = sheetRows;
        expect({ title, tab, key }).toEqual({ title: 'MHCU Raw Answers', tab: 'Answers', key: 'AT-MHCU-2026-100' });
        expect(values).toHaveLength(headers.length);
        const at = (column: string) => values[headers.indexOf(column)];
        expect([at('Code'), at('Name'), at('Email'), at('WhatsApp'), at('Age'), at('Language')]).toEqual(['AT-MHCU-2026-100', 'Rina Pratiwi', 'rina@example.com', '081234567890', '29', 'id']);
        expect(headers.slice(-58)).toEqual(MHCU_ITEMS.map((item) => mhcuCode(item.part, item.n)));
        const firstItem = MHCU_ITEMS[0];
        expect(at(mhcuCode(firstItem.part, firstItem.n))).toBe(String((rows[0].answers as Record<string, number>)[mhcuCode(firstItem.part, firstItem.n)]));
    });

    it('a Drive problem at submission never affects the submission', async () => {
        const { app, rows } = createFixture({ drive: 'fail' });
        const response = await submit(app, body());
        expect(response.status).toBe(201);
        await new Promise((resolve) => setTimeout(resolve, 60));
        expect(rows).toHaveLength(1);
    });

    it('a Drive failure never undoes the release', async () => {
        const { done, rows } = await release({ drive: 'fail' });
        expect(done.status).toBe(200);
        expect((await done.json()).data).toMatchObject({ released: true, drivePath: null, drive: 'failed', driveError: 'drive down' });
        expect(rows[0].status).toBe('released');
    });

    it('does nothing when Drive is not set up', async () => {
        const { done } = await release({});
        expect((await done.json()).data).toMatchObject({ drivePath: null, drive: 'off' });
    });

    it('save-to-drive: saves a released report again, refuses an unreleased one or when Drive is not set up', async () => {
        const ready = await release({ drive: 'ok' });
        const id = ready.rows[0].id;
        ready.driveSaved.length = 0;
        const again = await send(ready.app, `/api/admin/assessments/${id}/save-to-drive`, 'POST', undefined, bearer(adminToken));
        expect(again.status).toBe(200);
        expect((await again.json()).data.path).toBe('Reports / MHCU / 2026 / 11 / AT-MHCU-2026-100');
        expect(ready.driveSaved.map((save) => save.folder ?? 'MHCU')).toEqual(['MHCU', 'MHCU Internal']);

        // an unreleased check-up can be saved too (it is a draft report until the psychologist releases it)
        const fresh = createFixture({ drive: 'ok' });
        await submit(fresh.app, body());
        expect((await send(fresh.app, `/api/admin/assessments/${fresh.rows[0].id}/save-to-drive`, 'POST', undefined, bearer(adminToken))).status).toBe(200);

        const off = await release({});
        expect((await send(off.app, `/api/admin/assessments/${off.rows[0].id}/save-to-drive`, 'POST', undefined, bearer(adminToken))).status).toBe(503);
        expect((await send(ready.app, `/api/admin/assessments/${id}/save-to-drive`, 'POST', undefined, bearer(psychologistToken))).status).toBe(403);
    });
});

describe('the psychologist note in two languages', () => {
    const setup = async () => {
        const fixture = createFixture();
        await submit(fixture.app, body());
        const id = fixture.rows[0].id;
        const put = (payload: unknown) => send(fixture.app, `/api/admin/assessments/${id}/note`, 'PUT', payload, bearer(adminToken));
        const preview = async (lang: 'id' | 'en') => (await send(fixture.app, `/api/admin/assessments/${id}/report/client?lang=${lang}`, 'GET', undefined, bearer(adminToken))).text();
        return { ...fixture, put, preview };
    };

    it('stores the English fields and prints each language with its own text only', async () => {
        const { put, preview, rows } = await setup();
        expect((await put({ template: null, custom: 'Tidur lebih teratur.', templateEn: null, customEn: 'Sleep more regularly.', final: true })).status).toBe(200);
        expect(rows[0]).toMatchObject({ noteCustom: 'Tidur lebih teratur.', noteCustomEn: 'Sleep more regularly.' });
        const en = await preview('en');
        expect(en).toContain('Sleep more regularly.');
        expect(en).not.toContain('Tidur lebih teratur.');
        const id = await preview('id');
        expect(id).toContain('Tidur lebih teratur.');
        expect(id).not.toContain('Sleep more regularly.');
    });

    it('never prints the Indonesian note in the English report: it says where the note is', async () => {
        const { put, preview } = await setup();
        await put({ template: 'Teks rekomendasi saya.', custom: 'Tidur lebih teratur.', templateEn: null, customEn: null, final: true });
        const en = await preview('en');
        expect(en).not.toContain('Tidur lebih teratur.');
        expect(en).not.toContain('Teks rekomendasi saya.');
        expect(en).toContain('Your psychologist also wrote a personal note, which appears in the Indonesian version of this report.');
    });

    it('keeps the English text when an older page saves without the English fields, and clears it with null', async () => {
        const { put, rows } = await setup();
        await put({ template: null, custom: null, templateEn: 'My text.', customEn: 'Extra.', final: false });
        await put({ template: null, custom: 'Baru.', final: false });
        expect(rows[0]).toMatchObject({ noteTemplateEn: 'My text.', noteCustomEn: 'Extra.', noteCustom: 'Baru.' });
        await put({ template: null, custom: 'Baru.', templateEn: null, customEn: null, final: false });
        expect(rows[0]).toMatchObject({ noteTemplateEn: null, noteCustomEn: null });
    });

    it('limits the English fields like the Indonesian ones', async () => {
        const { put } = await setup();
        expect((await put({ template: null, custom: null, customEn: 'x'.repeat(501), final: false })).status).toBe(400);
        expect((await put({ template: null, custom: null, templateEn: 'x'.repeat(4001), final: false })).status).toBe(400);
        expect((await put({ template: null, custom: null, customEn: 7, final: false })).status).toBe(400);
        expect((await put({ template: null, custom: null, customEn: 'x'.repeat(500), final: false })).status).toBe(200);
    });
});

