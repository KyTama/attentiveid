import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto, UserRole } from '@attentiveid/shared';
import { createTokenService } from './token-service';
import { authenticateBearerToken, createRoleGuardPlugin } from './role-guard';

const testJwtSecret = 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security';

const adminUser: UserDto = {
    id: 'user-admin-001',
    email: 'admin@attentive.id',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    psychologistId: null,
    lastLoginAt: '2026-09-10T10:00:00Z',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z',
};

const psychologistUser: UserDto = {
    id: 'user-psych-001',
    email: 'psychologist@attentive.id',
    name: 'Dr. Syazka',
    role: 'psychologist',
    status: 'active',
    psychologistId: 'syazka',
    lastLoginAt: '2026-09-10T11:00:00Z',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-10T11:00:00Z',
};

const inactiveUser: UserDto = {
    id: 'user-inactive-001',
    email: 'inactive@attentive.id',
    name: 'Inactive User',
    role: 'admin',
    status: 'inactive',
    psychologistId: null,
    lastLoginAt: null,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
};

const usersDb = new Map<string, UserDto>([
    [adminUser.id, adminUser],
    [psychologistUser.id, psychologistUser],
    [inactiveUser.id, inactiveUser],
]);

const tokenService = createTokenService({ jwtSecret: testJwtSecret });
const userRepository = {
    findById: async (id: string) => usersDb.get(id) ?? null,
};

describe('authenticateBearerToken', () => {
    it('returns 401 when authorization header is missing or malformed', async () => {
        const missingRes = await authenticateBearerToken(undefined, { tokenService, userRepository });
        expect(missingRes.user).toBeNull();
        expect(missingRes.error?.status).toBe(401);

        const invalidSchemeRes = await authenticateBearerToken('Basic xyz', { tokenService, userRepository });
        expect(invalidSchemeRes.user).toBeNull();
        expect(invalidSchemeRes.error?.status).toBe(401);

        const emptyTokenRes = await authenticateBearerToken('Bearer ', { tokenService, userRepository });
        expect(emptyTokenRes.user).toBeNull();
        expect(emptyTokenRes.error?.status).toBe(401);
    });

    it('returns 401 when token verification fails', async () => {
        const invalidRes = await authenticateBearerToken('Bearer invalid.jwt.token', { tokenService, userRepository });
        expect(invalidRes.user).toBeNull();
        expect(invalidRes.error?.status).toBe(401);
    });

    it('returns 401 when user is missing or inactive in DB', async () => {
        // Token for non-existent user
        const fakeUser: UserDto = { ...adminUser, id: 'user-ghost-999' };
        const { accessToken: ghostToken } = tokenService.issueAccessToken(fakeUser);
        const ghostRes = await authenticateBearerToken(`Bearer ${ghostToken}`, { tokenService, userRepository });
        expect(ghostRes.user).toBeNull();
        expect(ghostRes.error?.status).toBe(401);

        // Token for inactive user
        const { accessToken: inactiveToken } = tokenService.issueAccessToken(inactiveUser);
        const inactiveRes = await authenticateBearerToken(`Bearer ${inactiveToken}`, { tokenService, userRepository });
        expect(inactiveRes.user).toBeNull();
        expect(inactiveRes.error?.status).toBe(401);
    });

    it('returns user DTO when token is valid and user is active', async () => {
        const { accessToken } = tokenService.issueAccessToken(adminUser);
        const res = await authenticateBearerToken(`Bearer ${accessToken}`, { tokenService, userRepository });
        expect(res.error).toBeNull();
        expect(res.user).toEqual(adminUser);
    });
});

describe('createRoleGuardPlugin in Elysia app', () => {
    const app = new Elysia()
        .use(createRoleGuardPlugin({ tokenService, userRepository }))
        .get('/api/protected/me', ({ currentUser }) => ({ status: 'success', user: currentUser }), {
            requireAuth: true,
        })
        .get('/api/admin/dashboard', () => ({ status: 'success', scope: 'admin' }), {
            requireRole: 'admin',
        })
        .get('/api/psychologist/schedule', () => ({ status: 'success', scope: 'psychologist' }), {
            requireRole: ['admin', 'psychologist'],
        })
        .get('/api/users/:userId/profile', () => ({ status: 'success', scope: 'profile' }), {
            requireSelfOrRole: { paramName: 'userId', roles: ['admin'] },
        });

    it('denies unauthenticated requests to protected endpoints with 401', async () => {
        const res = await app.handle(new Request('http://localhost/api/protected/me'));
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.status).toBe('unauthorized');
    });

    it('allows valid authenticated users on requireAuth endpoints', async () => {
        const { accessToken } = tokenService.issueAccessToken(psychologistUser);
        const res = await app.handle(
            new Request('http://localhost/api/protected/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
        );
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.status).toBe('success');
        expect(json.user.id).toBe(psychologistUser.id);
    });

    it('returns 403 Forbidden when a psychologist attempts to access admin-only endpoint', async () => {
        const { accessToken } = tokenService.issueAccessToken(psychologistUser);
        const res = await app.handle(
            new Request('http://localhost/api/admin/dashboard', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
        );
        expect(res.status).toBe(403);
        const json = await res.json();
        expect(json.status).toBe('forbidden');
    });

    it('allows admin role to access admin-only endpoint', async () => {
        const { accessToken } = tokenService.issueAccessToken(adminUser);
        const res = await app.handle(
            new Request('http://localhost/api/admin/dashboard', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
        );
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.status).toBe('success');
        expect(json.scope).toBe('admin');
    });

    it('allows both admin and psychologist roles on multi-role endpoint', async () => {
        const { accessToken: psychToken } = tokenService.issueAccessToken(psychologistUser);
        const psychRes = await app.handle(
            new Request('http://localhost/api/psychologist/schedule', {
                headers: { Authorization: `Bearer ${psychToken}` },
            })
        );
        expect(psychRes.status).toBe(200);

        const { accessToken: adminToken } = tokenService.issueAccessToken(adminUser);
        const adminRes = await app.handle(
            new Request('http://localhost/api/psychologist/schedule', {
                headers: { Authorization: `Bearer ${adminToken}` },
            })
        );
        expect(adminRes.status).toBe(200);
    });

    it('allows self-access or admin access via requireSelfOrRole', async () => {
        // Psychologist user accessing their own profile (matching userId param) -> 200
        const { accessToken: psychToken } = tokenService.issueAccessToken(psychologistUser);
        const selfRes = await app.handle(
            new Request(`http://localhost/api/users/${psychologistUser.id}/profile`, {
                headers: { Authorization: `Bearer ${psychToken}` },
            })
        );
        expect(selfRes.status).toBe(200);

        // Psychologist user accessing admin's profile -> 403
        const otherRes = await app.handle(
            new Request(`http://localhost/api/users/${adminUser.id}/profile`, {
                headers: { Authorization: `Bearer ${psychToken}` },
            })
        );
        expect(otherRes.status).toBe(403);

        // Admin accessing psychologist's profile -> 200
        const { accessToken: adminToken } = tokenService.issueAccessToken(adminUser);
        const adminRes = await app.handle(
            new Request(`http://localhost/api/users/${psychologistUser.id}/profile`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            })
        );
        expect(adminRes.status).toBe(200);
    });
});
