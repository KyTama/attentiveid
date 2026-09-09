import { describe, expect, test } from 'bun:test';
import type { LandingContentMutation } from '@attentiveid/shared';
import { createApp, type AppDependencies } from '../app';
import { createAdminCapability } from '../services/authorization-capability';
import {
    createPreviewCapabilityService,
    createPreviewSessionService,
    type PreviewCapabilityRecord,
    type PreviewCapabilityStore
} from '../security/preview-capability';

class MemoryPreviewStore implements PreviewCapabilityStore {
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
const content = { sections: [] } as unknown as LandingContentMutation;
const publishedLanding = {
    revision: {
        id: 'landing-revision-1',
        aggregateId: 'landing-aggregate-1',
        revisionNumber: 1,
        basedOnRevisionId: null,
        status: 'published' as const,
        createdAt: '2026-09-09T00:00:00.000Z',
        publishedAt: '2026-09-09T00:01:00.000Z'
    },
    content
};
const draftLanding = {
    revision: {
        id: 'landing-revision-2',
        aggregateId: 'landing-aggregate-1',
        revisionNumber: 2,
        basedOnRevisionId: 'landing-revision-1',
        status: 'draft' as const,
        createdAt: '2026-09-09T00:02:00.000Z',
        publishedAt: null
    },
    content
};

const psychologist = {
    id: 'psychologist-1',
    slug: 'syazka',
    name: 'Syazka Kirani Narindra',
    nickname: 'Syazka',
    credential: 'M.Psi., Psikolog',
    supportArea: 'adultClinical' as const,
    supportAreas: ['adultClinical' as const],
    specializations: ['Trauma'],
    experienceYears: 6,
    licenseNumber: 'SIPP-001',
    bookingUrl: 'https://wa.me/6285156410912',
    premiumBookingUrl: null,
    featured: true,
    featuredOrder: 0,
    biography: 'Biography',
    availabilityMessage: 'Available',
    media: {
        url: '/media/psychologists/syazka.webp',
        width: 600,
        height: 750,
        alt: { id: 'Foto profil', en: 'Profile photo' }
    }
};

const createHarness = () => {
    const store = new MemoryPreviewStore();
    const now = () => new Date('2026-09-09T00:00:00.000Z');
    const previewCapabilities = createPreviewCapabilityService({ secret, store, now });
    const previewSessions = createPreviewSessionService({ secret, store, now });
    const logs: unknown[] = [];
    const dependencies: AppDependencies = {
        frontendOrigin: 'https://staging.enialslab.duckdns.org',
        landingRepository: {
            getPublished: async () => publishedLanding,
            getRevision: async (id) => id === draftLanding.revision.id ? draftLanding : null
        },
        psychologistsRepository: {
            list: async () => [psychologist],
            featured: async () => [psychologist],
            getBySlug: async (slug) => slug === psychologist.slug
                ? { status: 'found' as const, psychologist }
                : slug === 'inactive'
                    ? { status: 'unavailable' as const, psychologist: { slug, name: 'Inactive Psychologist', nickname: 'Inactive' } }
                    : { status: 'notFound' as const }
        },
        previewCapabilities,
        previewSessions,
        accessLog: (entry) => logs.push(entry)
    };
    return { app: createApp(dependencies), logs, previewCapabilities, store };
};

describe('public content routes', () => {
    test('exchanges a body-only capability for a short-lived path-scoped preview cookie', async () => {
        const harness = createHarness();
        const issued = await harness.previewCapabilities.issue(
            createAdminCapability('admin-1'),
            draftLanding.revision.id,
            300
        );
        const response = await harness.app.handle(new Request(
            'https://api.example.test/api/preview/landing/session',
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    origin: 'https://staging.enialslab.duckdns.org'
                },
                body: JSON.stringify({ capability: issued.token })
            }
        ));
        const body = await response.text();
        const cookie = response.headers.get('set-cookie') ?? '';

        expect(response.status).toBe(200);
        expect(cookie).toContain('attentive_landing_preview=');
        expect(cookie).toContain('Path=/api/preview/landing');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('Secure');
        expect(cookie).toContain('SameSite=Strict');
        expect(cookie).not.toContain(issued.token);
        expect(body).not.toContain(issued.token);
        expect(JSON.stringify(harness.logs)).not.toContain(issued.token);
    });

    test('renders the complete draft through the fixed preview path with private no-store headers', async () => {
        const harness = createHarness();
        const issued = await harness.previewCapabilities.issue(createAdminCapability('admin-1'), draftLanding.revision.id, 300);
        const exchange = await harness.app.handle(new Request('https://api.example.test/api/preview/landing/session', {
            method: 'POST',
            headers: { 'content-type': 'application/json', origin: 'https://staging.enialslab.duckdns.org' },
            body: JSON.stringify({ capability: issued.token })
        }));
        const cookie = (exchange.headers.get('set-cookie') ?? '').split(';')[0];
        const response = await harness.app.handle(new Request('https://api.example.test/api/preview/landing', {
            headers: { cookie }
        }));
        const body = await response.json() as { status: string; preview: { landingRevisionId: string } };

        expect(response.status).toBe(200);
        expect(body.status).toBe('preview');
        expect(body.preview.landingRevisionId).toBe(draftLanding.revision.id);
        expect(response.headers.get('cache-control')).toBe('private, no-store');
        expect(response.headers.get('referrer-policy')).toBe('no-referrer');
        expect(JSON.stringify(body)).not.toContain(issued.token);
    });

    test('rejects alternate capability channels, cross-origin exchange, and invalid sessions generically', async () => {
        const harness = createHarness();
        const issued = await harness.previewCapabilities.issue(createAdminCapability('admin-1'), draftLanding.revision.id, 300);
        const attempts = [
            new Request(`https://api.example.test/api/preview/landing/session?capability=${encodeURIComponent(issued.token)}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json', origin: 'https://staging.enialslab.duckdns.org' },
                body: JSON.stringify({ capability: issued.token })
            }),
            new Request('https://api.example.test/api/preview/landing/session', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    origin: 'https://evil.example',
                    authorization: `Bearer ${issued.token}`
                },
                body: JSON.stringify({ capability: issued.token })
            })
        ];

        for (const request of attempts) {
            const response = await harness.app.handle(request);
            expect(response.status).toBe(403);
            expect(await response.text()).not.toContain(issued.token);
        }

        const invalidSession = await harness.app.handle(new Request('https://api.example.test/api/preview/landing', {
            headers: { cookie: 'attentive_landing_preview=invalid-session-token' }
        }));
        expect(invalidSession.status).toBe(403);
        expect(await invalidSession.text()).toBe('{"status":"invalidPreview"}');
    });

    test('public landing cannot select a draft through query input', async () => {
        const harness = createHarness();
        const response = await harness.app.handle(new Request(
            `https://api.example.test/api/content/landing?revisionId=${draftLanding.revision.id}`
        ));
        const body = await response.text();
        expect(body).not.toContain(draftLanding.revision.id);
        expect(body).toContain(publishedLanding.revision.id);
    });

    test('exposes active psychologist projections and distinct unavailable/not-found states', async () => {
        const harness = createHarness();
        const featured = await harness.app.handle(new Request('https://api.example.test/api/content/psychologists/featured?locale=id'));
        const directory = await harness.app.handle(new Request("https://api.example.test/api/content/psychologists?locale=en&search=100%25_match'%20OR%201%3D1--&supportArea=adultClinical"));
        const found = await harness.app.handle(new Request('https://api.example.test/api/content/psychologists/syazka?locale=id'));
        const unavailable = await harness.app.handle(new Request('https://api.example.test/api/content/psychologists/inactive?locale=en'));
        const missing = await harness.app.handle(new Request('https://api.example.test/api/content/psychologists/missing?locale=id'));

        expect(featured.status).toBe(200);
        expect(directory.status).toBe(200);
        expect((await found.json() as { psychologist: typeof psychologist }).psychologist.media).toMatchObject({ width: 600, height: 750 });
        expect((await unavailable.json() as { status: string }).status).toBe('unavailable');
        expect((await missing.json() as { status: string }).status).toBe('notFound');
    });
});
