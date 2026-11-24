import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import { createAccountSettingsRoutes } from './account-settings.routes';

const makeUser = (id: string, role: UserDto['role']): UserDto => ({
    id, email: `${id}@attentive.id`, name: id, role, status: 'active', psychologistId: null, lastLoginAt: null,
    createdAt: '2026-09-01T00:00:00Z', updatedAt: '2026-09-01T00:00:00Z'
});
const me = makeUser('psych-1', 'psychologist');
const other = makeUser('admin-1', 'admin');
const tokenService = createTokenService({
    secret: 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security',
    store: { saveRefreshToken: async () => {}, findRefreshToken: async () => null, revokeRefreshToken: async () => {}, revokeAllForUser: async () => {} }
});
const token = tokenService.issueAccessToken(me).accessToken;

const fixture = () => {
    const saved: Record<string, number> = {};
    const app = new Elysia().use(createAccountSettingsRoutes({
        tokenService,
        userRepository: { findById: async (id: string) => (id === me.id ? me : id === other.id ? other : null) },
        saveIdleTimeout: async (userId, minutes) => { saved[userId] = minutes; return true; }
    }));
    const put = (body: unknown, headers: Record<string, string> = {}) =>
        app.handle(new Request('http://localhost/api/auth/me/settings', { method: 'PUT', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }));
    return { saved, put };
};

describe('PUT /api/auth/me/settings', () => {
    it('needs a signed-in user', async () => {
        const { put, saved } = fixture();
        expect((await put({ idleTimeoutMinutes: 30 })).status).toBe(401);
        expect(saved).toEqual({});
    });

    it('saves the signed-in person\'s own value, never another account\'s', async () => {
        const { put, saved } = fixture();
        const response = await put({ idleTimeoutMinutes: 30, userId: 'admin-1', id: 'admin-1' }, { authorization: `Bearer ${token}` });
        expect(response.status).toBe(200);
        expect(saved).toEqual({ 'psych-1': 30 });
    });

    it('accepts only whole minutes from 5 to 120', async () => {
        const { put, saved } = fixture();
        for (const bad of [4, 121, 0, -5, 15.5, '15', null, undefined]) {
            expect((await put({ idleTimeoutMinutes: bad }, { authorization: `Bearer ${token}` })).status).toBe(400);
        }
        for (const good of [5, 15, 120]) {
            expect((await put({ idleTimeoutMinutes: good }, { authorization: `Bearer ${token}` })).status).toBe(200);
        }
        expect(saved['psych-1']).toBe(120);
    });
});

describe('POST /api/auth/me/password', () => {
    const build = (result: 'ok' | 'wrong' | 'notFound' = 'ok') => {
        const calls: Array<[string, string, string]> = [];
        const app = new Elysia().use(createAccountSettingsRoutes({
            tokenService,
            userRepository: { findById: async (id: string) => (id === me.id ? me : null) },
            changePassword: async (userId, current, next) => { calls.push([userId, current, next]); return result; }
        }));
        const post = (body: unknown, auth = true) =>
            app.handle(new Request('http://localhost/api/auth/me/password', {
                method: 'POST',
                headers: { 'content-type': 'application/json', ...(auth ? { authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify(body)
            }));
        return { calls, post };
    };

    it('needs a signed-in user', async () => {
        const { post, calls } = build();
        expect((await post({ currentPassword: 'old-pass-123', newPassword: 'new-pass-12345' }, false)).status).toBe(401);
        expect(calls).toEqual([]);
    });

    it('changes only the signed-in person\'s password', async () => {
        const { post, calls } = build();
        const response = await post({ currentPassword: 'old-pass-123', newPassword: 'new-pass-12345', userId: 'admin-1' });
        expect(response.status).toBe(200);
        expect(calls).toEqual([['psych-1', 'old-pass-123', 'new-pass-12345']]);
    });

    it('rejects a short, missing or unchanged new password without touching the account', async () => {
        const { post, calls } = build();
        expect((await post({ currentPassword: 'old-pass-123', newPassword: 'short' })).status).toBe(400);
        expect((await post({ newPassword: 'new-pass-12345' })).status).toBe(400);
        expect((await post({ currentPassword: 'same-pass-12345', newPassword: 'same-pass-12345' })).status).toBe(400);
        expect(calls).toEqual([]);
    });

    it('answers 403 for a wrong current password', async () => {
        const { post } = build('wrong');
        expect((await post({ currentPassword: 'old-pass-123', newPassword: 'new-pass-12345' })).status).toBe(403);
    });
});
