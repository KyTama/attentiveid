import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import { createMhcuInviteRoutes } from './mhcu-invites.routes';
import { inviteCode, INVITE_TOKEN, type CancelResult, type InviteRecord, type MhcuInvitesRepository, type NewInvite, type PublicInvite } from '../repositories/mhcu-invites.repository';
import type { AuditEntry } from '../repositories/assessments.repository';

const makeUser = (id: string, role: UserDto['role']): UserDto => ({
    id, email: `${id}@attentive.id`, name: id, role, status: 'active', psychologistId: null, lastLoginAt: null, createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z'
});
const admin = makeUser('admin-1', 'admin');
const psychologist = makeUser('psych-1', 'psychologist');
const usersById = new Map([[admin.id, admin], [psychologist.id, psychologist]]);
const tokenService = createTokenService({
    secret: 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security',
    store: { saveRefreshToken: async () => {}, findRefreshToken: async () => null, revokeRefreshToken: async () => {}, revokeAllForUser: async () => {} }
});
const adminHeaders = { authorization: `Bearer ${tokenService.issueAccessToken(admin).accessToken}` };
const psyHeaders = { authorization: `Bearer ${tokenService.issueAccessToken(psychologist).accessToken}` };

const PSY = '00000000-0000-4000-8000-0000000000aa';
const INACTIVE = '00000000-0000-4000-8000-0000000000cc';

const createFixture = (options: { now?: () => number } = {}) => {
    const store: InviteRecord[] = [];
    const audits: AuditEntry[] = [];
    let n = 0;
    const repository: MhcuInvitesRepository = {
        create: async (input: NewInvite) => {
            n += 1;
            const record: InviteRecord = {
                id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
                code: inviteCode(n),
                token: (0x1000000000000000 + n * 7919).toString(16).padStart(16, '0').slice(-16),
                track: input.track,
                psychologistId: input.psychologistId,
                psychologistName: 'dr. Aly',
                clientName: input.clientName ?? null,
                clientEmail: input.clientEmail ?? null,
                phone: input.phone ?? null,
                note: input.note ?? null,
                lang: input.lang ?? null,
                status: 'OPEN',
                createdBy: input.createdBy,
                createdAt: `2026-11-23T0${n}:00:00Z`,
                usedAt: null,
                usedSubmissionId: null
            };
            store.unshift(record);
            return record;
        },
        list: async () => [...store],
        get: async (id) => store.find((r) => r.id === id) ?? null,
        cancel: async (id): Promise<CancelResult> => {
            const found = store.find((r) => r.id === id);
            if (!found) return 'notFound';
            if (found.status !== 'OPEN') return 'notOpen';
            found.status = 'CANCELLED';
            return 'cancelled';
        },
        lookup: async (token): Promise<PublicInvite> => {
            const found = INVITE_TOKEN.test(token) ? store.find((r) => r.token === token) : undefined;
            if (!found || found.status !== 'OPEN') return { valid: false };
            return { valid: true, track: found.track, clientName: found.clientName, lang: found.lang };
        },
        isActivePsychologist: async (id) => id === PSY
    };
    const app = new Elysia().use(
        createMhcuInviteRoutes({
            tokenService,
            userRepository: { findById: async (id: string) => usersById.get(id) ?? null },
            invitesRepository: repository,
            assessmentsRepository: { audit: async (entry) => { audits.push(entry); } },
            siteOrigin: 'https://attentiveid.com',
            now: options.now
        })
    );
    return { app, store, audits };
};

type TestApp = { handle: (request: Request) => Promise<Response> };
const send = (app: TestApp, path: string, method: string, payload?: unknown, headers: Record<string, string> = {}) =>
    app.handle(new Request(`http://localhost${path}`, {
        method,
        headers: { ...(payload === undefined ? {} : { 'content-type': 'application/json' }), ...headers },
        body: payload === undefined ? undefined : JSON.stringify(payload)
    }));

const create = (app: TestApp, payload: unknown, headers = adminHeaders) => send(app, '/api/admin/assessments/mhcu/invites', 'POST', payload, headers);

describe('POST /api/admin/assessments/mhcu/invites', () => {
    it('creates an invitation and answers {invite, url, invites} with the form link', async () => {
        const { app } = createFixture();
        const response = await create(app, { track: 'asesmen', psychologistId: PSY, clientName: 'Rina', clientEmail: 'rina@example.com', note: 'dari WA', lang: 'en' });
        expect(response.status).toBe(201);
        expect(response.headers.get('cache-control')).toBe('no-store');
        const json = (await response.json()) as { invite: InviteRecord & { url: string }; url: string; invites: InviteRecord[] };
        expect(json.invite).toMatchObject({ code: 'INV0001', track: 'asesmen', psychologistId: PSY, clientName: 'Rina', status: 'OPEN' });
        expect(json.invite.token).toMatch(/^[0-9a-f]{16}$/);
        expect(json.url).toBe(`https://attentiveid.com/assessments/mhcu?invite=${json.invite.token}&lang=en`);
        expect(json.invites).toHaveLength(1);
    });

    it('the link has no &lang when no language was given', async () => {
        const { app } = createFixture();
        const json = (await (await create(app, { track: 'free', psychologistId: PSY })).json()) as { url: string };
        expect(json.url).toMatch(/\/assessments\/mhcu\?invite=[0-9a-f]{16}$/);
    });

    it('is for admins only', async () => {
        const { app, store } = createFixture();
        expect((await create(app, { track: 'free', psychologistId: PSY }, psyHeaders)).status).toBe(403);
        expect((await send(app, '/api/admin/assessments/mhcu/invites', 'POST', { track: 'free', psychologistId: PSY })).status).toBe(401);
        expect(store).toHaveLength(0);
    });

    it('validates track, psychologist, e-mail, language and text lengths', async () => {
        const { app, store } = createFixture();
        const bad: unknown[] = [
            { track: 'mandiri', psychologistId: PSY },
            { track: 'paket', psychologistId: PSY },
            { psychologistId: PSY },
            { track: 'free' },
            { track: 'free', psychologistId: 'not-a-uuid' },
            { track: 'free', psychologistId: PSY, clientEmail: 'nope' },
            { track: 'free', psychologistId: PSY, lang: 'fr' },
            { track: 'free', psychologistId: PSY, clientName: 'x'.repeat(121) },
            { track: 'free', psychologistId: PSY, note: 'x'.repeat(501) },
            { track: 'free', psychologistId: PSY, clientName: 'a\u0000b' },
            { track: 'free', psychologistId: PSY, phone: 12345 }
        ];
        for (const payload of bad) expect((await create(app, payload)).status).toBe(400);
        expect(store).toHaveLength(0);
    });

    it('refuses a psychologist that does not exist or is not active', async () => {
        const { app, store } = createFixture();
        const response = await create(app, { track: 'free', psychologistId: INACTIVE });
        expect(response.status).toBe(400);
        expect(store).toHaveLength(0);
    });

    it('writes an audit row with the code and track only: no name, e-mail or note', async () => {
        const { app, audits } = createFixture();
        await create(app, { track: 'asesmen', psychologistId: PSY, clientName: 'Rina Pratiwi', clientEmail: 'rina@example.com', phone: '0812', note: 'rahasia' });
        expect(audits).toEqual([{ actor: 'admin-1', action: 'invite', detail: 'INV0001 asesmen' }]);
        expect(JSON.stringify(audits)).not.toMatch(/Rina|rina@|0812|rahasia/);
    });
});

describe('GET and DELETE invitations', () => {
    it('lists invitations newest first, with a link for each, for admins only', async () => {
        const { app } = createFixture();
        await create(app, { track: 'asesmen', psychologistId: PSY });
        await create(app, { track: 'free', psychologistId: PSY });
        const list = (await (await send(app, '/api/admin/assessments/mhcu/invites', 'GET', undefined, adminHeaders)).json()) as Array<{ code: string; url: string }>;
        expect(list.map((i) => i.code)).toEqual(['INV0002', 'INV0001']);
        expect(list[0]?.url).toContain('/assessments/mhcu?invite=');
        expect((await send(app, '/api/admin/assessments/mhcu/invites', 'GET', undefined, psyHeaders)).status).toBe(403);
        expect((await send(app, '/api/admin/assessments/mhcu/invites', 'GET')).status).toBe(401);
    });

    it('cancels an OPEN invitation, returns the list and audits it; 409 when it is not OPEN; 404 when unknown', async () => {
        const { app, store, audits } = createFixture();
        await create(app, { track: 'free', psychologistId: PSY });
        const id = store[0]!.id;
        const cancelled = await send(app, `/api/admin/assessments/mhcu/invites/${id}`, 'DELETE', undefined, adminHeaders);
        expect(cancelled.status).toBe(200);
        const list = (await cancelled.json()) as Array<{ status: string }>;
        expect(list[0]?.status).toBe('CANCELLED');
        expect(audits.at(-1)).toEqual({ actor: 'admin-1', action: 'invite_cancel', detail: 'INV0001 free' });
        expect((await send(app, `/api/admin/assessments/mhcu/invites/${id}`, 'DELETE', undefined, adminHeaders)).status).toBe(409);
        store[0]!.status = 'USED';
        expect((await send(app, `/api/admin/assessments/mhcu/invites/${id}`, 'DELETE', undefined, adminHeaders)).status).toBe(409);
        expect((await send(app, '/api/admin/assessments/mhcu/invites/00000000-0000-4000-8000-00000000dead', 'DELETE', undefined, adminHeaders)).status).toBe(404);
        expect((await send(app, '/api/admin/assessments/mhcu/invites/not-a-uuid', 'DELETE', undefined, adminHeaders)).status).toBe(404);
        expect((await send(app, `/api/admin/assessments/mhcu/invites/${id}`, 'DELETE', undefined, psyHeaders)).status).toBe(403);
    });
});

describe('GET /api/public/assessments/invite', () => {
    const lookup = (app: TestApp, token: string, headers: Record<string, string> = {}) => send(app, `/api/public/assessments/invite?token=${encodeURIComponent(token)}`, 'GET', undefined, headers);

    it('tells validity, track, name and language, and nothing else', async () => {
        const { app, store } = createFixture();
        await create(app, { track: 'asesmen', psychologistId: PSY, clientName: 'Rina', clientEmail: 'rina@example.com', phone: '0812', note: 'rahasia', lang: 'id' });
        const response = await lookup(app, store[0]!.token);
        expect(response.status).toBe(200);
        expect(response.headers.get('cache-control')).toBe('no-store');
        const json = await response.json();
        expect(json).toEqual({ valid: true, track: 'asesmen', clientName: 'Rina', lang: 'id' });
        expect(JSON.stringify(json)).not.toMatch(/psychologist|rina@|0812|rahasia|dr\. Aly|token/);
    });

    it('answers {valid:false} for unknown, malformed, used and cancelled tokens, never an error that tells them apart', async () => {
        const { app, store } = createFixture();
        await create(app, { track: 'free', psychologistId: PSY });
        await create(app, { track: 'free', psychologistId: PSY });
        store[0]!.status = 'USED';
        store[1]!.status = 'CANCELLED';
        for (const token of [store[0]!.token, store[1]!.token, '0000000000000000', 'zzz', '', 'x'.repeat(500)]) {
            const response = await lookup(app, token);
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ valid: false });
        }
        expect(await (await send(app, '/api/public/assessments/invite', 'GET')).json()).toEqual({ valid: false });
    });

    it('is rate-limited per address', async () => {
        let clock = 1_000_000;
        const { app } = createFixture({ now: () => clock });
        const headers = { 'x-forwarded-for': '203.0.113.9' };
        for (let i = 0; i < 30; i += 1) expect((await lookup(app, '0000000000000000', headers)).status).toBe(200);
        const blocked = await lookup(app, '0000000000000000', headers);
        expect(blocked.status).toBe(429);
        expect(await blocked.json()).toEqual({ valid: false });
        expect((await lookup(app, '0000000000000000', { 'x-forwarded-for': '203.0.113.10' })).status).toBe(200);
        clock += 11 * 60 * 1000;
        expect((await lookup(app, '0000000000000000', headers)).status).toBe(200);
    });
});
