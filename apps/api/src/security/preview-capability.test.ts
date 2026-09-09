import { describe, expect, test } from 'bun:test';
import { createAdminCapability } from '../services/authorization-capability';
import {
    createPreviewCapabilityService,
    requirePreviewHmacSecret,
    type PreviewCapabilityRecord,
    type PreviewCapabilityStore
} from './preview-capability';

class MemoryPreviewCapabilityStore implements PreviewCapabilityStore {
    readonly records = new Map<string, PreviewCapabilityRecord>();

    async insert(record: PreviewCapabilityRecord) {
        this.records.set(record.tokenDigest, structuredClone(record));
    }

    async findByDigest(tokenDigest: string) {
        return structuredClone(this.records.get(tokenDigest) ?? null);
    }

    async revokeByDigest(tokenDigest: string, revokedAt: string) {
        const record = this.records.get(tokenDigest);
        if (record) record.revokedAt = revokedAt;
    }
}

const secret = '8f95a1f77d1dbdf64308475a50f29ea2700f1bd404692f85f44b9d787184985e';
const admin = createAdminCapability('admin-1');

describe('landing preview capability', () => {
    test('issues a signed opaque capability while persisting digest and metadata only', async () => {
        const store = new MemoryPreviewCapabilityStore();
        const service = createPreviewCapabilityService({
            secret,
            store,
            now: () => new Date('2026-09-09T00:00:00.000Z'),
            randomBytes: (length) => new Uint8Array(length).fill(7)
        });

        const issued = await service.issue(admin, 'landing-revision-2', 300);
        expect(issued.token).toMatch(/^v1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
        expect(issued.expiresAt).toBe('2026-09-09T00:05:00.000Z');
        expect(store.records.size).toBe(1);
        const [record] = store.records.values();
        expect(record?.landingRevisionId).toBe('landing-revision-2');
        expect(record?.tokenDigest).not.toContain(issued.token);
        expect(JSON.stringify(record)).not.toContain(issued.token);
        expect(JSON.stringify(record)).not.toContain(secret);
    });

    test('verifies repeated use before expiry and rejects the exact expiry boundary', async () => {
        const store = new MemoryPreviewCapabilityStore();
        let currentTime = new Date('2026-09-09T00:00:00.000Z');
        const service = createPreviewCapabilityService({ secret, store, now: () => currentTime });
        const issued = await service.issue(admin, 'landing-revision-2', 60);

        expect((await service.verify(issued.token)).landingRevisionId).toBe('landing-revision-2');
        expect((await service.verify(issued.token)).landingRevisionId).toBe('landing-revision-2');
        currentTime = new Date('2026-09-09T00:01:00.000Z');
        await expect(service.verify(issued.token)).rejects.toThrow('Invalid preview capability.');
    });

    test('rejects tampering, wrong secrets, revision mismatch, and revocation generically', async () => {
        const store = new MemoryPreviewCapabilityStore();
        const service = createPreviewCapabilityService({
            secret,
            store,
            now: () => new Date('2026-09-09T00:00:00.000Z')
        });
        const issued = await service.issue(admin, 'landing-revision-2', 300);
        const tampered = `${issued.token.slice(0, -1)}${issued.token.endsWith('a') ? 'b' : 'a'}`;
        await expect(service.verify(tampered)).rejects.toThrow('Invalid preview capability.');

        const wrongSecretService = createPreviewCapabilityService({
            secret: '1f95a1f77d1dbdf64308475a50f29ea2700f1bd404692f85f44b9d787184985f',
            store,
            now: () => new Date('2026-09-09T00:00:00.000Z')
        });
        await expect(wrongSecretService.verify(issued.token)).rejects.toThrow('Invalid preview capability.');

        const [record] = store.records.values();
        if (!record) throw new Error('Expected stored capability.');
        record.landingRevisionId = 'landing-revision-other';
        await expect(service.verify(issued.token)).rejects.toThrow('Invalid preview capability.');
        record.landingRevisionId = 'landing-revision-2';

        await service.revoke(admin, issued.token);
        await expect(service.verify(issued.token)).rejects.toThrow('Invalid preview capability.');
    });

    test('uses the injected constant-time comparison path for valid-length signatures', async () => {
        const store = new MemoryPreviewCapabilityStore();
        let comparisons = 0;
        const service = createPreviewCapabilityService({
            secret,
            store,
            now: () => new Date('2026-09-09T00:00:00.000Z'),
            constantTimeCompare: (left, right) => {
                comparisons += 1;
                return left.every((value, index) => value === right[index]);
            }
        });
        const issued = await service.issue(admin, 'landing-revision-2', 300);
        const parts = issued.token.split('.');
        parts[2] = `${parts[2]?.slice(0, -1)}${parts[2]?.endsWith('a') ? 'b' : 'a'}`;

        await expect(service.verify(parts.join('.'))).rejects.toThrow('Invalid preview capability.');
        expect(comparisons).toBe(1);
    });

    test('requires a strong environment secret with no default and redacts sensitive failures', async () => {
        expect(() => requirePreviewHmacSecret(undefined)).toThrow('PREVIEW_HMAC_SECRET is required.');
        expect(() => requirePreviewHmacSecret('development-secret')).toThrow('PREVIEW_HMAC_SECRET is invalid.');
        expect(requirePreviewHmacSecret(secret)).toBe(secret);

        const store = new MemoryPreviewCapabilityStore();
        const service = createPreviewCapabilityService({ secret, store });
        const sensitiveToken = `v1.${Buffer.from('postgresql://user:password@db/private').toString('base64url')}.invalid`;
        let rendered = '';
        try {
            await service.verify(sensitiveToken);
        } catch (error) {
            rendered = String(error);
        }
        expect(rendered).toBe('Error: Invalid preview capability.');
        expect(rendered).not.toContain('password');
        expect(rendered).not.toContain(secret);
        expect(rendered).not.toContain(sensitiveToken);
    });
});
