import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { PrayerAdminDto, PrayerInput, PrayerPublicDto, UserDto } from '@attentiveid/shared';
import { DEFAULT_SITE_SETTINGS } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import type { PrayersRepository } from '../repositories/prayers.repository';
import { createPrayersRoutes } from './prayers.routes';

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

interface Stored extends PrayerAdminDto {
    createdMs: number;
}

const createFixture = (options: { moderation?: 'auto' | 'manual'; max?: number } = {}) => {
    const rows: Stored[] = [];
    let clock = 1_000_000;
    const repository: PrayersRepository = {
        create: async (input: PrayerInput, o) => {
            const id = `p-${rows.length + 1}`;
            rows.push({ id, prayer: input.prayer, hidden: o.hidden, createdAt: new Date(clock).toISOString(), createdMs: clock });
            return { id };
        },
        findRecentSameText: async (prayer, sinceMs) => {
            const found = rows.find((row) => row.prayer.toLowerCase() === prayer.toLowerCase() && clock - row.createdMs <= sinceMs);
            return found ? { id: found.id } : null;
        },
        random: async (): Promise<PrayerPublicDto | null> => {
            const visible = rows.filter((row) => !row.hidden);
            const row = visible[0];
            return row ? { text: row.prayer } : null;
        },
        listAdmin: async () => rows.map(({ createdMs: _ignored, ...row }) => row),
        setHidden: async (id, hidden) => {
            const row = rows.find((entry) => entry.id === id);
            if (!row) return false;
            row.hidden = hidden;
            return true;
        },
        remove: async (id) => {
            const index = rows.findIndex((entry) => entry.id === id);
            if (index < 0) return false;
            rows.splice(index, 1);
            return true;
        }
    };
    const app = new Elysia().use(
        createPrayersRoutes({
            tokenService,
            userRepository: { findById: async (id: string) => usersById.get(id) ?? null },
            prayersRepository: repository,
            adminToolsRepository: { getSiteSettings: async () => ({ ...DEFAULT_SITE_SETTINGS, gift: { ...DEFAULT_SITE_SETTINGS.gift, moderation: options.moderation ?? 'auto' } }) },
            rateLimit: { max: options.max ?? 3, windowMs: 60_000 },
            now: () => clock
        })
    );
    return { app, rows, advance: (ms: number) => { clock += ms; } };
};

type TestApp = { handle: (request: Request) => Promise<Response> };
const send = (app: TestApp, path: string, method: string, body?: unknown, headers: Record<string, string> = {}) =>
    app.handle(new Request(`http://localhost${path}`, {
        method,
        headers: { ...(body === undefined ? {} : { 'content-type': 'application/json' }), ...headers },
        body: body === undefined ? undefined : JSON.stringify(body)
    }));
const post = (app: TestApp, body: unknown, headers: Record<string, string> = {}) => send(app, '/api/public/prayers', 'POST', body, headers);
const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

const valid = { prayer: 'Semoga harimu tenang dan penuh cahaya.' };

describe('POST /api/public/prayers', () => {
    it('stores a valid prayer and serves it from the random endpoint, with nothing about the sender', async () => {
        const { app, rows } = createFixture();
        // a name and a city sent along are ignored, not stored
        const response = await post(app, { ...valid, name: 'Sari', city: 'Malang' });
        expect(response.status).toBe(201);
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({ prayer: valid.prayer, hidden: false });
        expect(Object.keys(rows[0])).not.toContain('name');
        expect(Object.keys(rows[0])).not.toContain('city');
        const random = await send(app, '/api/public/prayers/random', 'GET');
        expect(random.headers.get('cache-control')).toBe('no-store');
        expect((await random.json()).data).toEqual({ text: valid.prayer });
    });

    it('rejects bad prayers', async () => {
        const { app, rows } = createFixture();
        expect((await post(app, { prayer: 'pendek' })).status).toBe(400);
        const spam = await post(app, { prayer: 'Beli murah di https://spam.example sekarang juga' });
        expect(spam.status).toBe(400);
        expect((await spam.json()).errors.prayer).toBeTruthy();
        expect(rows).toHaveLength(0);
    });

    it('silently drops honeypot sign-ups and saves the same prayer sent twice once', async () => {
        const { app, rows } = createFixture();
        expect((await post(app, { ...valid, website: 'http://bot.example' })).status).toBe(201);
        expect(rows).toHaveLength(0);
        expect((await post(app, valid)).status).toBe(201);
        expect((await post(app, valid)).status).toBe(201);
        expect(rows).toHaveLength(1);
    });

    it('rate limits per client address', async () => {
        const { app, advance } = createFixture({ max: 2 });
        const headers = { 'x-forwarded-for': 'spoofed, 203.0.113.9' };
        expect((await post(app, { ...valid, prayer: 'Semoga hari ini baik untuk satu orang.' }, headers)).status).toBe(201);
        expect((await post(app, { ...valid, prayer: 'Semoga hari ini baik untuk dua orang.' }, headers)).status).toBe(201);
        expect((await post(app, { ...valid, prayer: 'Semoga hari ini baik untuk tiga orang.' }, headers)).status).toBe(429);
        advance(61_000);
        expect((await post(app, { ...valid, prayer: 'Semoga hari ini baik untuk empat orang.' }, headers)).status).toBe(201);
    });

    it('keeps a new prayer hidden until approval when moderation is manual', async () => {
        const { app, rows } = createFixture({ moderation: 'manual' });
        const response = await post(app, valid);
        expect((await response.json()).data.pendingApproval).toBe(true);
        expect(rows[0].hidden).toBe(true);
        expect((await (await send(app, '/api/public/prayers/random', 'GET')).json()).data).toBeNull();
    });
});

describe('prayer moderation (admin)', () => {
    it('is for admins only', async () => {
        const { app } = createFixture();
        expect((await send(app, '/api/admin/prayers', 'GET')).status).toBe(401);
        expect((await send(app, '/api/admin/prayers', 'GET', undefined, bearer(psychologistToken))).status).toBe(403);
        expect((await send(app, '/api/admin/prayers', 'GET', undefined, bearer(adminToken))).status).toBe(200);
    });

    it('hides, shows and deletes a prayer', async () => {
        const { app, rows } = createFixture();
        await post(app, valid);
        const id = rows[0].id;
        const hide = await send(app, `/api/admin/prayers/${id}/hidden`, 'PUT', { hidden: true }, bearer(adminToken));
        expect(hide.status).toBe(200);
        expect((await (await send(app, '/api/public/prayers/random', 'GET')).json()).data).toBeNull();
        expect((await send(app, `/api/admin/prayers/${id}/hidden`, 'PUT', { hidden: false }, bearer(adminToken))).status).toBe(200);
        expect((await (await send(app, '/api/public/prayers/random', 'GET')).json()).data).not.toBeNull();
        expect((await send(app, `/api/admin/prayers/${id}`, 'DELETE', undefined, bearer(adminToken))).status).toBe(200);
        expect(rows).toHaveLength(0);
        expect((await send(app, `/api/admin/prayers/${id}`, 'DELETE', undefined, bearer(adminToken))).status).toBe(404);
    });
});
