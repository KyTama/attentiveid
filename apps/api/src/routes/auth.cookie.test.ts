import { describe, expect, it } from 'bun:test';
import { createAuthRoutes } from './auth';

const make = (revoke: () => Promise<boolean>) => createAuthRoutes({
    userRepository: { findById: async () => ({ id: 'u', email: 'a@b.c', name: 'A', role: 'admin', status: 'active' }) } as never,
    tokenService: {
        verifyRefreshToken: async () => ({ userId: 'u' }),
        revokeRefreshToken: revoke,
        issueRefreshToken: async () => ({ refreshToken: 'rt_new', expiresAt: new Date(Date.now() + 1000).toISOString() }),
        issueAccessToken: () => ({ accessToken: 'a', expiresAt: new Date().toISOString() })
    } as never,
    verifyPassword: async () => false
});

const call = (app: ReturnType<typeof make>, path: string) =>
    app.handle(new Request(`http://localhost/api/auth/${path}`, { method: 'POST', headers: { cookie: 'attentive_refresh=rt_old' } }));

describe('refresh cookie', () => {
    it('is deleted on logout with the same path it was set with', async () => {
        const header = (await call(make(async () => true), 'logout')).headers.get('set-cookie') ?? '';
        expect(header).toContain('attentive_refresh=');
        expect(header).toContain('Path=/api/auth');
        expect(header).toContain('Max-Age=0');
    });

    it('is not renewed twice from one token, and the loser leaves the cookie alone', async () => {
        const response = await call(make(async () => false), 'refresh');
        expect(response.status).toBe(401);
        expect(response.headers.get('set-cookie')).toBeNull();
    });
});
