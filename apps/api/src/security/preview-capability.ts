import { createHash, createHmac, randomBytes as nodeRandomBytes, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import type { AdminCapability } from '../services/authorization-capability';

export interface PreviewCapabilityRecord {
    tokenDigest: string;
    landingRevisionId: string;
    expiresAt: string;
    revokedAt: string | null;
}

export interface PreviewCapabilityStore {
    insert(record: PreviewCapabilityRecord): Promise<void>;
    findByDigest(tokenDigest: string): Promise<PreviewCapabilityRecord | null>;
    revokeByDigest(tokenDigest: string, revokedAt: string): Promise<void>;
}

interface PreviewCapabilityPayload {
    capabilityId: string;
    landingRevisionId: string;
    issuedAt: string;
    expiresAt: string;
    nonce: string;
}

interface PreviewCapabilityServiceOptions {
    secret: string;
    store: PreviewCapabilityStore;
    now?: () => Date;
    randomBytes?: (length: number) => Uint8Array;
    constantTimeCompare?: (left: Uint8Array, right: Uint8Array) => boolean;
}

const capabilityIdentifierPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const genericCapabilityError = () => new Error('Invalid preview capability.');

export const requirePreviewHmacSecret = (value: string | undefined) => {
    if (value === undefined || value === '') {
        throw new Error('PREVIEW_HMAC_SECRET is required.');
    }
    const bytes = Buffer.from(value, 'utf8');
    const uniqueCharacters = new Set(value).size;
    if (bytes.length < 32 || uniqueCharacters < 12 || /^(.+)\1+$/.test(value)) {
        throw new Error('PREVIEW_HMAC_SECRET is invalid.');
    }
    return value;
};

const encode = (value: Uint8Array | string) => Buffer.from(value).toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url');
const digestToken = (token: string) => createHash('sha256').update(token).digest('hex');
const sign = (secret: string, input: string) => createHmac('sha256', secret).update(input).digest();

const isPayload = (value: unknown): value is PreviewCapabilityPayload => {
    if (!value || typeof value !== 'object') return false;
    const payload = value as Partial<PreviewCapabilityPayload>;
    return typeof payload.capabilityId === 'string'
        && capabilityIdentifierPattern.test(payload.capabilityId)
        && typeof payload.landingRevisionId === 'string'
        && capabilityIdentifierPattern.test(payload.landingRevisionId)
        && typeof payload.issuedAt === 'string'
        && Number.isFinite(Date.parse(payload.issuedAt))
        && typeof payload.expiresAt === 'string'
        && Number.isFinite(Date.parse(payload.expiresAt))
        && typeof payload.nonce === 'string'
        && capabilityIdentifierPattern.test(payload.nonce);
};

const assertAdmin = (capability: AdminCapability) => {
    if (capability.kind !== 'admin' || capability.assurance !== 'callerSupplied') {
        throw new Error('Admin capability required.');
    }
};

export const createPreviewCapabilityService = (options: PreviewCapabilityServiceOptions) => {
    const secret = requirePreviewHmacSecret(options.secret);
    const now = options.now ?? (() => new Date());
    const randomBytes = options.randomBytes ?? ((length: number) => nodeRandomBytes(length));
    const constantTimeCompare = options.constantTimeCompare ?? ((left: Uint8Array, right: Uint8Array) => (
        left.byteLength === right.byteLength && timingSafeEqual(left, right)
    ));

    const decodeAuthenticated = (token: string): PreviewCapabilityPayload => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3 || parts[0] !== 'v1' || !parts[1] || !parts[2]) {
                throw genericCapabilityError();
            }
            const signedInput = `${parts[0]}.${parts[1]}`;
            const suppliedSignature = decode(parts[2]);
            const expectedSignature = sign(secret, signedInput);
            if (suppliedSignature.byteLength !== expectedSignature.byteLength
                || !constantTimeCompare(suppliedSignature, expectedSignature)) {
                throw genericCapabilityError();
            }
            const parsed: unknown = JSON.parse(decode(parts[1]).toString('utf8'));
            if (!isPayload(parsed)) {
                throw genericCapabilityError();
            }
            return parsed;
        } catch {
            throw genericCapabilityError();
        }
    };

    return {
        async issue(capability: AdminCapability, landingRevisionId: string, ttlSeconds: number) {
            assertAdmin(capability);
            if (!capabilityIdentifierPattern.test(landingRevisionId)
                || !Number.isInteger(ttlSeconds)
                || ttlSeconds < 30
                || ttlSeconds > 86_400) {
                throw new Error('Invalid preview capability request.');
            }
            const issuedAt = now();
            const expiresAt = new Date(issuedAt.getTime() + ttlSeconds * 1_000);
            const payload: PreviewCapabilityPayload = {
                capabilityId: encode(randomBytes(16)),
                landingRevisionId,
                issuedAt: issuedAt.toISOString(),
                expiresAt: expiresAt.toISOString(),
                nonce: encode(randomBytes(24))
            };
            const encodedPayload = encode(JSON.stringify(payload));
            const signedInput = `v1.${encodedPayload}`;
            const token = `${signedInput}.${encode(sign(secret, signedInput))}`;
            await options.store.insert({
                tokenDigest: digestToken(token),
                landingRevisionId,
                expiresAt: payload.expiresAt,
                revokedAt: null
            });
            return { token, expiresAt: payload.expiresAt };
        },

        async verify(token: string) {
            try {
                const payload = decodeAuthenticated(token);
                const currentTime = now().getTime();
                const record = await options.store.findByDigest(digestToken(token));
                if (!record
                    || record.revokedAt !== null
                    || record.landingRevisionId !== payload.landingRevisionId
                    || record.expiresAt !== payload.expiresAt
                    || Date.parse(payload.issuedAt) > currentTime
                    || Date.parse(payload.expiresAt) <= currentTime
                    || Date.parse(record.expiresAt) <= currentTime) {
                    throw genericCapabilityError();
                }
                return {
                    capabilityId: payload.capabilityId,
                    landingRevisionId: payload.landingRevisionId,
                    expiresAt: payload.expiresAt
                };
            } catch {
                throw genericCapabilityError();
            }
        },

        async revoke(capability: AdminCapability, token: string) {
            assertAdmin(capability);
            try {
                decodeAuthenticated(token);
                const tokenDigest = digestToken(token);
                await options.store.revokeByDigest(tokenDigest, now().toISOString());
            } catch {
                throw genericCapabilityError();
            }
        }
    };
};

export const createDrizzlePreviewCapabilityStore = (
    database: PostgresJsDatabase<typeof schema>
): PreviewCapabilityStore => ({
    async insert(record) {
        await database.insert(schema.landingPreviewCapabilities).values({
            tokenDigest: record.tokenDigest,
            landingRevisionId: record.landingRevisionId,
            expiresAt: record.expiresAt,
            revokedAt: record.revokedAt
        });
    },
    async findByDigest(tokenDigest) {
        const [record] = await database.select({
            tokenDigest: schema.landingPreviewCapabilities.tokenDigest,
            landingRevisionId: schema.landingPreviewCapabilities.landingRevisionId,
            expiresAt: schema.landingPreviewCapabilities.expiresAt,
            revokedAt: schema.landingPreviewCapabilities.revokedAt
        }).from(schema.landingPreviewCapabilities)
            .where(eq(schema.landingPreviewCapabilities.tokenDigest, tokenDigest))
            .limit(1);
        return record ?? null;
    },
    async revokeByDigest(tokenDigest, revokedAt) {
        await database.update(schema.landingPreviewCapabilities).set({ revokedAt })
            .where(eq(schema.landingPreviewCapabilities.tokenDigest, tokenDigest));
    }
});

export const previewTokenDigest = digestToken;
