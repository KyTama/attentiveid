import { describe, expect, test } from 'bun:test';
import type { UserDto } from '@attentiveid/shared';
import {
    createTokenService,
    requireJwtSecret,
    type RefreshTokenRecord,
    type RefreshTokenStore
} from './token-service';

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

const mockUser: UserDto = {
    id: 'user-uuid-101',
    email: 'admin@attentive.id',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    psychologistId: null,
    lastLoginAt: null,
    createdAt: '2026-09-11T00:00:00Z',
    updatedAt: '2026-09-11T00:00:00Z'
};

const validSecret = 'attentive_test_secret_key_32bytes_minimum_length_required!';

describe('token service & JWT security', () => {
    test('enforces minimum 32-byte secret length and rejects weak secrets', () => {
        expect(requireJwtSecret(validSecret)).toBe(validSecret);
        expect(() => requireJwtSecret('short-secret')).toThrow('JWT_SECRET is invalid.');
        expect(() => requireJwtSecret('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toThrow('JWT_SECRET is invalid.');
    });

    test('issues and verifies valid JWT access tokens with user claims', () => {
        const store = new MemoryRefreshTokenStore();
        const service = createTokenService({ secret: validSecret, store });

        const { accessToken, expiresAt } = service.issueAccessToken(mockUser, 900);
        expect(accessToken.split('.').length).toBe(3);
        expect(Date.parse(expiresAt)).toBeGreaterThan(Date.now());

        const payload = service.verifyAccessToken(accessToken);
        expect(payload.sub).toBe(mockUser.id);
        expect(payload.email).toBe(mockUser.email);
        expect(payload.name).toBe(mockUser.name);
        expect(payload.role).toBe(mockUser.role);
    });

    test('rejects tampered JWT signature or malformed structure', () => {
        const store = new MemoryRefreshTokenStore();
        const service = createTokenService({ secret: validSecret, store });
        const { accessToken } = service.issueAccessToken(mockUser, 900);

        const parts = accessToken.split('.');
        const tamperedToken = `${parts[0]}.${parts[1]}.tamperedSignature123`;

        expect(() => service.verifyAccessToken(tamperedToken)).toThrow('Invalid access token.');
        expect(() => service.verifyAccessToken('invalid.token')).toThrow('Invalid access token.');
    });

    test('rejects expired JWT access tokens', () => {
        let currentTime = new Date('2026-09-11T00:00:00Z');
        const store = new MemoryRefreshTokenStore();
        const service = createTokenService({
            secret: validSecret,
            store,
            now: () => currentTime
        });

        const { accessToken } = service.issueAccessToken(mockUser, 300);

        // Advance clock by 301 seconds
        currentTime = new Date('2026-09-11T00:05:01Z');
        expect(() => service.verifyAccessToken(accessToken)).toThrow('Access token expired.');
    });

    test('issues, verifies, and revokes refresh tokens', async () => {
        const store = new MemoryRefreshTokenStore();
        const service = createTokenService({ secret: validSecret, store });

        const { refreshToken } = await service.issueRefreshToken(mockUser.id, 3600);
        expect(refreshToken.startsWith('rt_')).toBe(true);

        const record = await service.verifyRefreshToken(refreshToken);
        expect(record.userId).toBe(mockUser.id);

        await service.revokeRefreshToken(refreshToken);
        await expect(service.verifyRefreshToken(refreshToken)).rejects.toThrow('Refresh token invalid or expired.');
    });
});
