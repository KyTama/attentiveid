import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { FreeSessionRecord, FreeSessionSubmission, UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import type { FreeSessionRepository } from '../repositories/free-session.repository';
import { createFreeSessionRoutes } from './free-session.routes';
import type { FreeSessionSheetSync } from '../services/free-session-sheet-sync';

const testJwtSecret = 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security';

const makeUser = (id: string, role: UserDto['role']): UserDto => ({
    id,
    email: `${id}@attentive.id`,
    name: id,
    role,
    status: 'active',
    psychologistId: null,
    lastLoginAt: null,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z'
});

const admin = makeUser('admin-1', 'admin');
const psychologist = makeUser('psych-1', 'psychologist');
const usersById = new Map([[admin.id, admin], [psychologist.id, psychologist]]);

const tokenService = createTokenService({
    secret: testJwtSecret,
    store: {
        saveRefreshToken: async () => {},
        findRefreshToken: async () => null,
        revokeRefreshToken: async () => {},
        revokeAllForUser: async () => {}
    }
});
const adminToken = tokenService.issueAccessToken(admin).accessToken;
const psychologistToken = tokenService.issueAccessToken(psychologist).accessToken;

const validBody = {
    eligible: 'baru',
    name: 'Nico Testerson',
    age: 24,
    gender: '',
    phone: '0812-3456-7890',
    email: '',
    keluhan: 'cemas',
    keluhanDetail: '',
    agreed: true,
    website: ''
};

const createFixture = (options: { max?: number; seed?: FreeSessionRecord[]; sheetSync?: FreeSessionSheetSync } = {}) => {
    const created: FreeSessionSubmission[] = [];
    const repository: FreeSessionRepository = {
        create: async (submission) => {
            created.push(submission);
            return { id: `id-${created.length}` };
        },
        listAll: async () => options.seed ?? [],
        listUnsynced: async () => [],
        markSynced: async () => {},
        markFailed: async () => {},
        sheetStatus: async () => ({ pending: 0, failed: 0 })
    };
    let clock = 1_000_000;
    const app = new Elysia().use(
        createFreeSessionRoutes({
            tokenService,
            userRepository: { findById: async (id: string) => usersById.get(id) ?? null },
            freeSessionRepository: repository,
            sheetSync: options.sheetSync,
            rateLimit: { max: options.max ?? 5, windowMs: 60_000 },
            now: () => clock
        })
    );
    return { app, created, advance: (ms: number) => { clock += ms; } };
};

type TestApp = { handle: (request: Request) => Promise<Response> };

const post = (app: TestApp, body: unknown, headers: Record<string, string> = {}) =>
    app.handle(new Request('http://localhost/api/public/free-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body)
    }));

describe('POST /api/public/free-session', () => {
    it('stores a valid submission with normalized values', async () => {
        const { app, created } = createFixture();
        const response = await post(app, validBody);
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ status: 'success', data: { id: 'id-1' } });
        expect(created).toEqual([{
            name: 'Nico Testerson',
            age: 24,
            gender: null,
            phone: '081234567890',
            email: null,
            keluhan: 'cemas',
            keluhanDetail: null
        }]);
    });

    it('returns field errors and stores nothing for invalid input', async () => {
        const { app, created } = createFixture();
        const response = await post(app, { ...validBody, eligible: 'lama', phone: '1', agreed: false });
        expect(response.status).toBe(400);
        const json: any = await response.json();
        expect(Object.keys(json.errors).sort()).toEqual(['agreed', 'eligible', 'phone']);
        expect(created).toHaveLength(0);
    });

    it('silently drops honeypot submissions', async () => {
        const { app, created } = createFixture();
        const response = await post(app, { ...validBody, website: 'http://spam.example' });
        expect(response.status).toBe(201);
        expect(created).toHaveLength(0);
    });

    it('rate limits per proxy-vouched client address', async () => {
        const { app, created, advance } = createFixture({ max: 2 });
        const headers = { 'x-forwarded-for': 'spoofed, 203.0.113.9' };
        expect((await post(app, validBody, headers)).status).toBe(201);
        expect((await post(app, validBody, headers)).status).toBe(201);
        expect((await post(app, validBody, headers)).status).toBe(429);
        // a spoofed leading entry must not dodge the limit
        expect((await post(app, validBody, { 'x-forwarded-for': 'other, 203.0.113.9' })).status).toBe(429);
        // a different real client is unaffected
        expect((await post(app, validBody, { 'x-forwarded-for': '198.51.100.1' })).status).toBe(201);
        advance(61_000);
        expect((await post(app, validBody, headers)).status).toBe(201);
        expect(created).toHaveLength(4);
    });
});

const record = (id: string, createdAt: string, name = 'Nico', phone = '0811'): FreeSessionRecord => ({
    id,
    createdAt,
    name,
    age: 24,
    gender: null,
    phone,
    email: null,
    keluhan: 'stres',
    keluhanDetail: null
});

describe('admin free session report', () => {
    const seed = [
        record('a', '2026-10-01T00:00:00.000Z'),
        record('b', '2026-10-02T00:00:00.000Z'),
        record('c', '2026-10-03T00:00:00.000Z', 'Sari', '0822')
    ];
    const get = (app: TestApp, path: string, token?: string) =>
        app.handle(new Request(`http://localhost${path}`, {
            headers: token ? { authorization: `Bearer ${token}` } : {}
        }));

    it('requires authentication', async () => {
        const { app } = createFixture({ seed });
        expect((await get(app, '/api/admin/free-session/submissions')).status).toBe(401);
        expect((await get(app, '/api/admin/free-session/export.csv')).status).toBe(401);
    });

    it('rejects non-admin roles', async () => {
        const { app } = createFixture({ seed });
        expect((await get(app, '/api/admin/free-session/submissions', psychologistToken)).status).toBe(403);
        expect((await get(app, '/api/admin/free-session/export.csv', psychologistToken)).status).toBe(403);
    });

    it('lists deduplicated submissions with counts for admins', async () => {
        const { app } = createFixture({ seed });
        const response = await get(app, '/api/admin/free-session/submissions', adminToken);
        expect(response.status).toBe(200);
        const json: any = await response.json();
        expect(json.data.total).toBe(3);
        expect(json.data.unique).toBe(2);
        expect(json.data.duplicates).toBe(1);
        expect(json.data.records.map((r: FreeSessionRecord) => r.id)).toEqual(['c', 'b']);
    });

    it('downloads the CSV report for admins', async () => {
        const { app } = createFixture({ seed });
        const response = await get(app, '/api/admin/free-session/export.csv', adminToken);
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('text/csv');
        expect(response.headers.get('content-disposition')).toMatch(/attachment; filename="sesi-gratis-report-.*\.csv"/);
        const text = await response.text();
        expect(text.startsWith('﻿"ID"')).toBe(true);
        expect(text).toContain('"Sari"');
    });
});

describe('Google Sheet sync', () => {
    const fakeSync = () => {
        const runs: string[] = [];
        const sync: FreeSessionSheetSync = {
            isConfigured: true,
            syncPending: async () => {
                runs.push('sync');
                return { configured: true, synced: 2, pending: 0, failed: 0, error: null };
            },
            status: async () => ({ configured: true, pending: 3, failed: 1, spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/abc/edit' })
        };
        return { sync, runs };
    };

    it('starts a sheet sync after a stored submission, and not for honeypot or invalid submissions', async () => {
        const { sync, runs } = fakeSync();
        const { app } = createFixture({ sheetSync: sync });
        expect((await post(app, validBody)).status).toBe(201);
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(runs).toHaveLength(1);
        await post(app, { ...validBody, website: 'http://spam' });
        await post(app, { ...validBody, name: '' });
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(runs).toHaveLength(1);
    });

    it('still saves the submission when the sheet sync fails', async () => {
        const failing: FreeSessionSheetSync = {
            isConfigured: true,
            syncPending: async () => {
                throw new Error('google down');
            },
            status: async () => ({ configured: true, pending: 1, failed: 1, spreadsheetUrl: null })
        };
        const { app, created } = createFixture({ sheetSync: failing });
        expect((await post(app, validBody)).status).toBe(201);
        expect(created).toHaveLength(1);
    });

    it('shows the sheet status and runs a manual sync for admins only', async () => {
        const { sync, runs } = fakeSync();
        const { app } = createFixture({ sheetSync: sync });
        const call = (path: string, method: string, token?: string) =>
            app.handle(new Request(`http://localhost${path}`, { method, headers: token ? { authorization: `Bearer ${token}` } : {} }));
        expect((await call('/api/admin/free-session/sheet-status', 'GET')).status).toBe(401);
        expect((await call('/api/admin/free-session/sheet-status', 'GET', psychologistToken)).status).toBe(403);
        const status = await (await call('/api/admin/free-session/sheet-status', 'GET', adminToken)).json();
        expect(status.data).toMatchObject({ configured: true, pending: 3, failed: 1 });
        const result = await (await call('/api/admin/free-session/sync-sheet', 'POST', adminToken)).json();
        expect(result.data).toMatchObject({ synced: 2 });
        expect(runs).toHaveLength(1);
    });

    it('reports not configured when there is no sync set up', async () => {
        const { app } = createFixture();
        const response = await app.handle(new Request('http://localhost/api/admin/free-session/sheet-status', { headers: { authorization: `Bearer ${adminToken}` } }));
        expect((await response.json()).data).toMatchObject({ configured: false });
    });
});
