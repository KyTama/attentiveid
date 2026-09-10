import { createHash, createHmac, randomBytes as nodeRandomBytes, timingSafeEqual } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { UserDto, UserRole } from '@attentiveid/shared';
import * as schema from '../db/schema';

export interface JwtAccessTokenPayload {
    sub: string;
    email: string;
    name: string;
    role: UserRole;
    psychologistId: string | null;
    iat: number;
    exp: number;
    jti: string;
}

export interface RefreshTokenRecord {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: string;
    revokedAt: string | null;
    createdAt: string;
}

export interface RefreshTokenStore {
    insert(record: { userId: string; tokenHash: string; expiresAt: string }): Promise<void>;
    findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
    revokeByHash(tokenHash: string, revokedAt: string): Promise<void>;
    revokeAllForUser(userId: string, revokedAt: string): Promise<void>;
}

export interface TokenServiceOptions {
    secret: string;
    store: RefreshTokenStore;
    now?: () => Date;
    randomBytes?: (length: number) => Uint8Array;
    constantTimeCompare?: (left: Uint8Array, right: Uint8Array) => boolean;
}

const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export const requireJwtSecret = (value: string | undefined): string => {
    if (value === undefined || value === '') {
        const envSecret = process.env.JWT_SECRET;
        if (envSecret && envSecret.length >= 32) {
            return envSecret;
        }
        if (process.env.NODE_ENV !== 'production') {
            return 'attentive_test_secret_key_32bytes_minimum_length_required!';
        }
        throw new Error('JWT_SECRET is required.');
    }
    const bytes = Buffer.from(value, 'utf8');
    const uniqueCharacters = new Set(value).size;
    if (bytes.length < 32 || uniqueCharacters < 12 || /^(.+)\1+$/.test(value)) {
        throw new Error('JWT_SECRET is invalid.');
    }
    return value;
};

const encodeBase64Url = (value: Uint8Array | string) => Buffer.from(value).toString('base64url');
const decodeBase64Url = (value: string) => Buffer.from(value, 'base64url');
const encodeHex = (value: Uint8Array) => Buffer.from(value).toString('hex');
export const hashRefreshToken = (token: string) => createHash('sha256').update(token).digest('hex');

const signHmac = (secret: string, input: string) => createHmac('sha256', secret).update(input).digest();

const isJwtPayload = (value: unknown): value is JwtAccessTokenPayload => {
    if (!value || typeof value !== 'object') return false;
    const payload = value as Partial<JwtAccessTokenPayload>;
    return typeof payload.sub === 'string'
        && identifierPattern.test(payload.sub)
        && typeof payload.email === 'string'
        && payload.email.includes('@')
        && typeof payload.name === 'string'
        && payload.name.length > 0
        && (payload.role === 'admin' || payload.role === 'psychologist')
        && (payload.psychologistId === null || (typeof payload.psychologistId === 'string' && identifierPattern.test(payload.psychologistId)))
        && typeof payload.iat === 'number'
        && Number.isFinite(payload.iat)
        && typeof payload.exp === 'number'
        && Number.isFinite(payload.exp)
        && typeof payload.jti === 'string'
        && identifierPattern.test(payload.jti);
};

export const createTokenService = (options: TokenServiceOptions) => {
    const secret = requireJwtSecret(options.secret);
    const now = options.now ?? (() => new Date());
    const randomBytes = options.randomBytes ?? ((length: number) => nodeRandomBytes(length));
    const constantTimeCompare = options.constantTimeCompare ?? ((left: Uint8Array, right: Uint8Array) => (
        left.byteLength === right.byteLength && timingSafeEqual(left, right)
    ));

    const decodeAndVerifyJwt = (token: string): JwtAccessTokenPayload => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
                throw new Error('Invalid JWT structure.');
            }
            const header: unknown = JSON.parse(decodeBase64Url(parts[0]).toString('utf8'));
            if (!header || typeof header !== 'object' || (header as Record<string, unknown>).alg !== 'HS256') {
                throw new Error('Invalid JWT header.');
            }
            const signedInput = `${parts[0]}.${parts[1]}`;
            const suppliedSignature = decodeBase64Url(parts[2]);
            const expectedSignature = signHmac(secret, signedInput);

            if (suppliedSignature.byteLength !== expectedSignature.byteLength
                || !constantTimeCompare(suppliedSignature, expectedSignature)) {
                throw new Error('Invalid JWT signature.');
            }

            const payload: unknown = JSON.parse(decodeBase64Url(parts[1]).toString('utf8'));
            if (!isJwtPayload(payload)) {
                throw new Error('Invalid JWT payload.');
            }

            return payload;
        } catch {
            throw new Error('Invalid access token.');
        }
    };

    return {
        issueAccessToken(user: UserDto, ttlSeconds = 900): { accessToken: string; expiresAt: string } {
            const issuedAtSec = Math.floor(now().getTime() / 1000);
            const expiresAtSec = issuedAtSec + Math.max(60, Math.min(86400, ttlSeconds));
            const expiresAtIso = new Date(expiresAtSec * 1000).toISOString();

            const header = { alg: 'HS256', typ: 'JWT' };
            const payload: JwtAccessTokenPayload = {
                sub: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                psychologistId: user.psychologistId,
                iat: issuedAtSec,
                exp: expiresAtSec,
                jti: encodeHex(randomBytes(16))
            };

            const encodedHeader = encodeBase64Url(JSON.stringify(header));
            const encodedPayload = encodeBase64Url(JSON.stringify(payload));
            const signedInput = `${encodedHeader}.${encodedPayload}`;
            const signature = encodeBase64Url(signHmac(secret, signedInput));

            const accessToken = `${signedInput}.${signature}`;
            return { accessToken, expiresAt: expiresAtIso };
        },

        verifyAccessToken(token: string): JwtAccessTokenPayload {
            const payload = decodeAndVerifyJwt(token);
            const currentSec = Math.floor(now().getTime() / 1000);

            if (payload.exp <= currentSec || payload.iat > currentSec + 60) {
                throw new Error('Access token expired.');
            }

            return payload;
        },

        async issueRefreshToken(userId: string, ttlSeconds = 604_800): Promise<{ refreshToken: string; expiresAt: string }> {
            const issuedAt = now();
            const expiresAt = new Date(issuedAt.getTime() + Math.max(3600, Math.min(2_592_000, ttlSeconds)));
            const rawToken = `rt_${encodeHex(randomBytes(32))}`;
            const tokenHash = hashRefreshToken(rawToken);

            await options.store.insert({
                userId,
                tokenHash,
                expiresAt: expiresAt.toISOString()
            });

            return { refreshToken: rawToken, expiresAt: expiresAt.toISOString() };
        },

        async verifyRefreshToken(rawToken: string): Promise<RefreshTokenRecord> {
            if (!rawToken || !rawToken.startsWith('rt_') || rawToken.length < 32) {
                throw new Error('Invalid refresh token.');
            }
            const tokenHash = hashRefreshToken(rawToken);
            const record = await options.store.findByHash(tokenHash);

            if (!record || record.revokedAt !== null || Date.parse(record.expiresAt) <= now().getTime()) {
                throw new Error('Refresh token invalid or expired.');
            }

            return record;
        },

        async revokeRefreshToken(rawToken: string): Promise<void> {
            try {
                if (!rawToken || !rawToken.startsWith('rt_')) return;
                const tokenHash = hashRefreshToken(rawToken);
                await options.store.revokeByHash(tokenHash, now().toISOString());
            } catch {
                // Ignore revocation errors to prevent token probing
            }
        }
    };
};

export const createDrizzleRefreshTokenStore = (
    database: PostgresJsDatabase<typeof schema>
): RefreshTokenStore => ({
    async insert(record) {
        await database.insert(schema.userRefreshTokens).values({
            userId: record.userId,
            tokenHash: record.tokenHash,
            expiresAt: record.expiresAt
        });
    },

    async findByHash(tokenHash) {
        const [record] = await database
            .select({
                id: schema.userRefreshTokens.id,
                userId: schema.userRefreshTokens.userId,
                tokenHash: schema.userRefreshTokens.tokenHash,
                expiresAt: schema.userRefreshTokens.expiresAt,
                revokedAt: schema.userRefreshTokens.revokedAt,
                createdAt: schema.userRefreshTokens.createdAt
            })
            .from(schema.userRefreshTokens)
            .where(eq(schema.userRefreshTokens.tokenHash, tokenHash))
            .limit(1);

        return record ?? null;
    },

    async revokeByHash(tokenHash, revokedAt) {
        await database
            .update(schema.userRefreshTokens)
            .set({ revokedAt })
            .where(and(
                eq(schema.userRefreshTokens.tokenHash, tokenHash),
                isNull(schema.userRefreshTokens.revokedAt)
            ));
    },

    async revokeAllForUser(userId, revokedAt) {
        await database
            .update(schema.userRefreshTokens)
            .set({ revokedAt })
            .where(and(
                eq(schema.userRefreshTokens.userId, userId),
                isNull(schema.userRefreshTokens.revokedAt)
            ));
    }
});
