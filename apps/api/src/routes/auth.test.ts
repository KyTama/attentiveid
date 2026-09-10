import { describe, expect, test } from 'bun:test';
import type { UserDto, UserRole, UserStatus } from '@attentiveid/shared';
import { createApp } from '../app';
import {
    createTokenService,
    hashRefreshToken,
    type RefreshTokenRecord,
    type RefreshTokenStore
} from '../security/token-service';

class MemoryRefreshTokenStore implements RefreshTokenStore {
    private recordsByHash = new Map<string, RefreshTokenRecord>();
    private sequence = 0;

    async insert(record: { userId: string; tokenHash: string; expiresAt: string }): Promise<void> {
        const id = `rt-uuid-${++this.sequence}`;
        const row: RefreshTokenRecord = {
            id,
            userId: record.userId,
            tokenHash: record.tokenHash,
            expiresAt: record.expiresAt,
            revokedAt: null,
            createdAt: new Date().toISOString()
        };
        this.recordsByHash.set(record.tokenHash, row);
    }

    async findByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
        const row = this.recordsByHash.get(tokenHash);
        return row ? structuredClone(row) : null;
    }

    async revokeByHash(tokenHash: string, revokedAt: string): Promise<void> {
        const row = this.recordsByHash.get(tokenHash);
        if (row && row.revokedAt === null) {
            row.revokedAt = revokedAt;
        }
    }

    async revokeAllForUser(userId: string, revokedAt: string): Promise<void> {
        for (const row of this.recordsByHash.values()) {
            if (row.userId === userId && row.revokedAt === null) {
                row.revokedAt = revokedAt;
            }
        }
    }
}

interface TestUserRecord {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: UserRole;
    status: UserStatus;
    psychologistId: string | null;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
}

const secret = 'attentive_test_secret_key_32bytes_minimum_length_required!';

const createTestApp = () => {
    const memoryStore = new MemoryRefreshTokenStore();
    const tokenService = createTokenService({ secret, store: memoryStore });

    const usersByEmail = new Map<string, TestUserRecord>([
        [
            'admin@attentive.id',
            {
                id: 'user-admin-uuid-1',
                email: 'admin@attentive.id',
                name: 'System Admin',
                passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$validpasswordhash',
                role: 'admin',
                status: 'active',
                psychologistId: null,
                lastLoginAt: null,
                createdAt: '2026-09-11T00:00:00Z',
                updatedAt: '2026-09-11T00:00:00Z'
            }
        ],
        [
            'inactive@attentive.id',
            {
                id: 'user-inactive-uuid-2',
                email: 'inactive@attentive.id',
                name: 'Inactive User',
                passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$validpasswordhash',
                role: 'psychologist',
                status: 'inactive',
                psychologistId: null,
                lastLoginAt: null,
                createdAt: '2026-09-11T00:00:00Z',
                updatedAt: '2026-09-11T00:00:00Z'
            }
        ]
    ]);

    const usersById = new Map<string, TestUserRecord>(
        [...usersByEmail.values()].map((user) => [user.id, user])
    );

    const userRepository = {
        async findByEmail(email: string) {
            const user = usersByEmail.get(email);
            return user ? structuredClone(user) : null;
        },
        async findById(id: string): Promise<UserDto | null> {
            const user = usersById.get(id);
            if (!user) return null;
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                psychologistId: user.psychologistId,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        },
        async updateLastLogin(userId: string) {
            const user = usersById.get(userId);
            if (user) {
                user.lastLoginAt = new Date().toISOString();
            }
        }
    };

    const verifyPassword = async (password: string) => password === 'ValidPassword123!';

    const app = createApp({
        frontendOrigin: 'http://localhost:5173',
        landingRepository: { getPublished: async () => null, getRevision: async () => null },
        psychologistsRepository: { list: async () => [], featured: async () => [], getBySlug: async () => ({ status: 'notFound' }) },
        userRepository,
        tokenService,
        verifyPassword
    });

    return { app, tokenService, memoryStore };
};

describe('auth API routes (/api/auth)', () => {
    test('POST /api/auth/login authenticates valid credentials, issues JWT and HttpOnly refresh cookie', async () => {
        const { app } = createTestApp();

        const response = await app.handle(new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'ADMIN@attentive.id',
                password: 'ValidPassword123!'
            })
        }));

        expect(response.status).toBe(200);
        const setCookie = response.headers.get('set-cookie');
        expect(setCookie).toContain('attentive_refresh=');
        expect(setCookie).toContain('HttpOnly');

        const data = await response.json() as { status: string; accessToken: string; user: UserDto };
        expect(data.status).toBe('success');
        expect(data.user.email).toBe('admin@attentive.id');
        expect(data.user.role).toBe('admin');
        expect(typeof data.accessToken).toBe('string');
    });

    test('POST /api/auth/login rejects invalid password or inactive user status with HTTP 401', async () => {
        const { app } = createTestApp();

        const wrongPasswordResponse = await app.handle(new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@attentive.id',
                password: 'WrongPassword!'
            })
        }));
        expect(wrongPasswordResponse.status).toBe(401);

        const inactiveResponse = await app.handle(new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'inactive@attentive.id',
                password: 'ValidPassword123!'
            })
        }));
        expect(inactiveResponse.status).toBe(401);
    });

    test('GET /api/auth/me returns current user profile when valid Bearer token is provided', async () => {
        const { app } = createTestApp();

        const loginResponse = await app.handle(new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@attentive.id', password: 'ValidPassword123!' })
        }));
        const loginData = await loginResponse.json() as { accessToken: string };

        const meResponse = await app.handle(new Request('http://localhost:3000/api/auth/me', {
            headers: { Authorization: `Bearer ${loginData.accessToken}` }
        }));
        expect(meResponse.status).toBe(200);

        const meData = await meResponse.json() as { status: string; user: UserDto };
        expect(meData.status).toBe('success');
        expect(meData.user.email).toBe('admin@attentive.id');

        const unauthorizedResponse = await app.handle(new Request('http://localhost:3000/api/auth/me', {
            headers: { Authorization: 'Bearer invalid.token.value' }
        }));
        expect(unauthorizedResponse.status).toBe(401);
    });

    test('POST /api/auth/refresh rotates refresh token and returns new access token', async () => {
        const { app } = createTestApp();

        const loginResponse = await app.handle(new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@attentive.id', password: 'ValidPassword123!' })
        }));

        const rawCookie = loginResponse.headers.get('set-cookie');
        const cookieMatch = /attentive_refresh=([^;]+)/.exec(rawCookie ?? '');
        expect(cookieMatch).not.toBeNull();
        const refreshCookieValue = cookieMatch![1];

        const refreshResponse = await app.handle(new Request('http://localhost:3000/api/auth/refresh', {
            method: 'POST',
            headers: { Cookie: `attentive_refresh=${refreshCookieValue}` }
        }));

        expect(refreshResponse.status).toBe(200);
        const newSetCookie = refreshResponse.headers.get('set-cookie');
        expect(newSetCookie).toContain('attentive_refresh=');

        const newCookieMatch = /attentive_refresh=([^;]+)/.exec(newSetCookie ?? '');
        expect(newCookieMatch![1]).not.toBe(refreshCookieValue);

        const refreshData = await refreshResponse.json() as { status: string; accessToken: string };
        expect(refreshData.status).toBe('success');
        expect(typeof refreshData.accessToken).toBe('string');
    });

    test('POST /api/auth/logout revokes refresh token and clears cookie', async () => {
        const { app, tokenService } = createTestApp();

        const loginResponse = await app.handle(new Request('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@attentive.id', password: 'ValidPassword123!' })
        }));

        const rawCookie = loginResponse.headers.get('set-cookie');
        const cookieMatch = /attentive_refresh=([^;]+)/.exec(rawCookie ?? '');
        const refreshCookieValue = cookieMatch![1];

        const logoutResponse = await app.handle(new Request('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: { Cookie: `attentive_refresh=${refreshCookieValue}` }
        }));

        expect(logoutResponse.status).toBe(200);
        await expect(tokenService.verifyRefreshToken(refreshCookieValue)).rejects.toThrow('Refresh token invalid or expired.');
    });
});
