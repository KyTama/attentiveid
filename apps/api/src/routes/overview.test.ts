import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import type { UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import { createOverviewRoutes } from './overview.routes';
import { createPsychologistSelfRoutes } from './psychologist-self.routes';
import { createUsersManagementRoutes } from './users-management.routes';

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
    psychologistId: 'psych-001',
    lastLoginAt: null,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
};

const usersDb = new Map<string, UserDto>([
    [adminUser.id, adminUser],
    [psychologistUser.id, psychologistUser],
]);

const mockTokenStore = {
    saveRefreshToken: async () => {},
    findRefreshToken: async () => null,
    revokeRefreshToken: async () => {},
    revokeAllForUser: async () => {},
};

const tokenService = createTokenService({
    secret: testJwtSecret,
    store: mockTokenStore,
});

const mockUserRepository = {
    findById: async (id: string) => usersDb.get(id) || null,
};

const adminToken = tokenService.issueAccessToken(adminUser).accessToken;
const psychologistToken = tokenService.issueAccessToken(psychologistUser).accessToken;

// Mock Drizzle DB
const mockDb: any = {
    select: (fields?: any) => ({
        from: (table: any) => ({
            limit: () => [
                {
                    total: 12,
                    active: 10,
                    featured: 4,
                    publishedRevId: 'rev-001',
                    activeDraft: 'rev-001',
                    updatedAt: '2026-09-10T12:00:00Z',
                    published: 5,
                    draft: 2,
                    review: 1,
                    admins: 2,
                    psychologists: 8,
                }
            ],
            where: () => {
                const results = [
                    {
                        id: 'psych-001',
                        slug: 'syazka-adira',
                        name: 'Syazka Adira',
                        nickname: 'Syazka',
                        status: 'active',
                        featured: true,
                        credential: 'M.Psi., Psikolog',
                        experienceYears: 6,
                        licenseNumber: '12345678',
                        bookingUrl: 'https://attentive.id/book/syazka',
                        locale: 'id',
                        biography: 'Psikolog Klinis Dewasa',
                    }
                ];
                return Object.assign(results, {
                    limit: () => results,
                });
            },
            leftJoin: () => ({
                orderBy: () => [
                    {
                        id: 'user-001',
                        email: 'admin@attentive.id',
                        name: 'Admin User',
                        role: 'admin',
                        status: 'active',
                    }
                ],
                where: () => [],
            }),
        }),
    }),
};

const app = new Elysia()
    .use(createOverviewRoutes({
        tokenService,
        userRepository: mockUserRepository,
        db: mockDb,
    }))
    .use(createPsychologistSelfRoutes({
        tokenService,
        userRepository: mockUserRepository,
        db: mockDb,
    }))
    .use(createUsersManagementRoutes({
        tokenService,
        userRepository: mockUserRepository,
        db: mockDb,
    }));

describe('Overview, Psychologist Self, & Users Management Routes', () => {
    it('GET /api/admin/overview/stats denies unauthenticated request with 401', async () => {
        const res = await app.handle(new Request('http://localhost/api/admin/overview/stats'));
        expect(res.status).toBe(401);
    });

    it('GET /api/admin/overview/stats allows authenticated admin and returns metrics', async () => {
        const res = await app.handle(
            new Request('http://localhost/api/admin/overview/stats', {
                headers: { Authorization: `Bearer ${adminToken}` },
            })
        );
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('success');
        expect(data.data.psychologists).toBeDefined();
        expect(data.data.landing).toBeDefined();
    });

    it('GET /api/admin/users denies psychologist role with 403 Forbidden', async () => {
        const res = await app.handle(
            new Request('http://localhost/api/admin/users', {
                headers: { Authorization: `Bearer ${psychologistToken}` },
            })
        );
        expect(res.status).toBe(403);
    });

    it('GET /api/admin/users allows admin role with 200', async () => {
        const res = await app.handle(
            new Request('http://localhost/api/admin/users', {
                headers: { Authorization: `Bearer ${adminToken}` },
            })
        );
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('success');
        expect(Array.isArray(data.data)).toBe(true);
    });

    it('GET /api/psychologist/my-profile allows authenticated psychologist with 200', async () => {
        const res = await app.handle(
            new Request('http://localhost/api/psychologist/my-profile', {
                headers: { Authorization: `Bearer ${psychologistToken}` },
            })
        );
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('success');
        expect(data.data.id).toBe('psych-001');
    });
});
