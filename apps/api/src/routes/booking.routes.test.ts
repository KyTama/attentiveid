import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { eq, inArray, sql } from 'drizzle-orm';
import {
    BOOKING_ASSESSMENT_FEE,
    type BookingAdminRecord,
    type BookingPsychologistCatalogItem,
    type NormalizedBookingSubmission,
    type UserDto
} from '@attentiveid/shared';
import { db } from '../db';
import * as schema from '../db/schema';
import { createBookingRepository, type BookingRepository } from '../repositories/booking.repository';
import {
    buildBookingWebhookPayload,
    getRetryBackoffSeconds,
    processDueBookingOutbox,
    signBookingWebhookPayload
} from '../services/booking-outbox';
import { createTokenService } from '../security/token-service';
import { createBookingPublicRoutes } from './booking-public.routes';
import { createBookingAdminRoutes } from './booking-admin.routes';

const testJwtSecret = 'test-secret-key-must-be-at-least-32-bytes-long-for-hmac-sha256-security';

const makeUser = (id: string, role: UserDto['role']): UserDto => ({
    id,
    email: `${id}@attentive.id`,
    name: id,
    role,
    status: 'active',
    psychologistId: null,
    lastLoginAt: null,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z'
});

const adminUser = makeUser('admin-booking-test', 'admin');
const psychUser = makeUser('psych-booking-test', 'psychologist');
const usersById = new Map([[adminUser.id, adminUser], [psychUser.id, psychUser]]);

const tokenService = createTokenService({
    secret: testJwtSecret,
    store: {
        saveRefreshToken: async () => {},
        findRefreshToken: async () => null,
        revokeRefreshToken: async () => {},
        revokeAllForUser: async () => {}
    }
});
const adminToken = tokenService.issueAccessToken(adminUser).accessToken;
const psychToken = tokenService.issueAccessToken(psychUser).accessToken;

const sampleCatalog: BookingPsychologistCatalogItem[] = [
    {
        id: '11111111-1111-4111-8111-111111111111',
        slug: 'syazka',
        name: 'Syazka Kirani Narindra',
        nickname: 'Syazka',
        credential: 'M.Psi., Psikolog',
        tier: 'senior',
        primaryBranch: 'tbi',
        acceptingNewClients: true,
        featured: true,
        featuredOrder: 1,
        experienceYears: 6,
        supportArea: 'adultClinical',
        specializations: { id: ['Kecemasan'], en: ['Anxiety'] },
        consultationDuration: '60 menit',
        onlineRate: 750_000,
        offlineRate: 800_000,
        availableOnline: true,
        availableTbi: true,
        availableBsd: false,
        availableMalang: false,
        scheduleMon: 'OFF',
        scheduleTue: '10.00 s/d 19.00',
        scheduleWed: '10.00 s/d 19.00',
        scheduleThu: '10.00 s/d 19.00',
        scheduleFri: '10.00 s/d 19.00',
        scheduleSat: '10.00 s/d 14.00',
        scheduleSun: 'OFF'
    }
];

const validSubmitPayload = {
    language: 'id',
    clientStatus: 'new',
    name: 'Nadia Kusuma',
    whatsapp: '081298765432',
    email: 'Nadia.Kusuma@example.com',
    countryRegion: 'Indonesia / DKI Jakarta (WIB)',
    age: 28,
    gender: 'Perempuan',
    concernId: 'anxiety_mood',
    concernNote: 'SENSITIVE_NARRATIVE_DO_NOT_LEAK mengalami panik dan bunuh diri',
    consultationMode: 'online',
    psychologistChoice: 'self',
    psychologistSlug: 'syazka',
    scheduleOption1: '20-11-2026 · 14.00 WIB',
    marketingSource: 'Instagram Ads',
    utmSource: 'meta',
    utmCampaign: 'nov_promo',
    website: ''
};

describe('Booking Routes, Clinical Privacy Wall & Outbox Service', () => {
    it('handles public catalog listing, honeypot drop, rate limiting, and non-blocking outbox trigger', async () => {
        const stored: NormalizedBookingSubmission[] = [];
        let drainCount = 0;
        let clock = 1_000_000;

        const mockRepo: BookingRepository = {
            listBookingPsychologists: async () => sampleCatalog,
            createSubmission: async (input) => {
                stored.push(input);
                return {
                    ok: true,
                    id: `booking-${stored.length}`,
                    bookingCode: `ATT-2611-TEST0${stored.length}`,
                    submittedAt: '2026-11-15T10:00:00.000Z',
                    baseRate: 750_000,
                    assessmentFee: BOOKING_ASSESSMENT_FEE,
                    totalRate: 900_000,
                    whatsappRouting: { target: 'pusat', whatsappNumber: '6285156410912' }
                };
            },
            listAdmin: async () => ({ total: 0, records: [] }),
            listForExport: async () => [],
            transitionStatus: async () => ({ ok: false, status: 404, message: 'not found' }),
            retryWebhookDelivery: async () => ({ ok: false, status: 404, message: 'not found' }),
            getAttributionReport: async () => ({
                total: 0,
                attributed: 0,
                unattributed: 0,
                rows: [],
                byCampaign: [],
                byAdset: [],
                byAd: []
            })
        };

        const app = new Elysia().use(createBookingPublicRoutes({
            bookingRepository: mockRepo,
            triggerOutboxDrain: async () => { drainCount += 1; },
            rateLimit: { max: 2, windowMs: 60_000 },
            now: () => clock
        }));

        const catalogRes = await app.handle(new Request('http://localhost/api/public/booking/psychologists?mode=online'));
        expect(catalogRes.status).toBe(200);
        const catalogJson = await catalogRes.json();
        expect(catalogJson.data).toHaveLength(1);
        expect(catalogJson.data[0].slug).toBe('syazka');

        // Honeypot filled -> 201 silent no-op
        const botRes = await app.handle(new Request('http://localhost/api/public/booking/submit', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.10' },
            body: JSON.stringify({ ...validSubmitPayload, website: 'http://spam.invalid' })
        }));
        expect(botRes.status).toBe(201);
        expect(stored).toHaveLength(0);

        // First real submission -> 201 & triggers outbox
        const okRes = await app.handle(new Request('http://localhost/api/public/booking/submit', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.1, 203.0.113.20' },
            body: JSON.stringify(validSubmitPayload)
        }));
        expect(okRes.status).toBe(201);
        const okJson = await okRes.json();
        expect(okJson.data.totalRate).toBe(900_000);
        expect(stored[0].crisisFlagTriggered).toBe(true);
        expect(stored[0].emailNormalized).toBe('nadia.kusuma@example.com');
        expect(stored[0].whatsappE164).toBe('+6281298765432');
        expect(drainCount).toBe(1);

        // Second submission from same last-hop IP passes, third gets 429
        const secondRes = await app.handle(new Request('http://localhost/api/public/booking/submit', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.99, 203.0.113.20' },
            body: JSON.stringify(validSubmitPayload)
        }));
        expect(secondRes.status).toBe(201);

        const thirdRes = await app.handle(new Request('http://localhost/api/public/booking/submit', {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.20' },
            body: JSON.stringify(validSubmitPayload)
        }));
        expect(thirdRes.status).toBe(429);
    });

    it('enforces RBAC on /api/admin/bookings/* and excludes concernNote from CSV/admin list', async () => {
        const sampleRecord: BookingAdminRecord = {
            id: 'b-1',
            bookingCode: 'ATT-2611-999999',
            clientUserId: null,
            status: 'pending',
            language: 'id',
            clientStatus: 'new',
            name: '=HACK()',
            whatsapp: '081234567890',
            whatsappE164: '+6281234567890',
            email: 'nadia@example.com',
            countryRegion: 'Indonesia / DKI Jakarta',
            age: 28,
            gender: 'Perempuan',
            serviceType: 'Personal',
            concernId: 'anxiety_mood',
            concernCategory: 'Kecemasan, Overthinking & Mood',
            clientCategory: 'individual',
            genderPreference: 'female',
            hasClinicalNote: true,
            crisisFlagTriggered: true,
            consultationMode: 'online',
            location: null,
            psychologistChoice: 'self',
            psychologistId: '11111111-1111-4111-8111-111111111111',
            psychologistSlug: 'syazka',
            selectedPsychologistName: 'Syazka Kirani Narindra',
            scheduleOption1: '20-11-2026 · 14.00 WIB',
            scheduleOption2: null,
            scheduleOption3: null,
            confirmedStartAt: null,
            confirmedEndAt: null,
            baseRate: 750_000,
            assessmentFee: 150_000,
            totalRate: 900_000,
            marketingSource: 'Instagram',
            referrer: null,
            utmSource: 'meta',
            utmMedium: 'paid',
            utmCampaign: 'nov_promo',
            utmContent: null,
            utmTerm: null,
            campaignId: 'cmp_1',
            adsetId: null,
            adId: null,
            webhookStatus: 'delivered',
            webhookAttempts: 1,
            webhookLastError: null,
            submittedAt: '2026-11-15T10:00:00.000Z',
            updatedAt: '2026-11-15T10:00:00.000Z'
        };

        const mockAdminRepo: BookingRepository = {
            listBookingPsychologists: async () => [],
            createSubmission: async () => ({ ok: false, status: 400, message: 'unused' }),
            listAdmin: async () => ({ total: 1, records: [sampleRecord] }),
            listForExport: async () => [sampleRecord],
            transitionStatus: async () => ({ ok: true, record: { ...sampleRecord, status: 'confirmed' } }),
            retryWebhookDelivery: async () => ({ ok: true, deliveryId: 'del-1' }),
            getAttributionReport: async () => ({
                total: 1,
                attributed: 1,
                unattributed: 0,
                rows: [],
                byCampaign: [{ key: 'nov_promo', count: 1, online: 1, offline: 0 }],
                byAdset: [],
                byAd: []
            })
        };

        const app = new Elysia().use(createBookingAdminRoutes({
            tokenService,
            userRepository: { findById: async (id) => usersById.get(id) ?? null },
            bookingRepository: mockAdminRepo
        }));

        const unauthRes = await app.handle(new Request('http://localhost/api/admin/bookings'));
        expect(unauthRes.status).toBe(401);

        const psychForbidden = await app.handle(new Request('http://localhost/api/admin/bookings', {
            headers: { authorization: `Bearer ${psychToken}` }
        }));
        expect(psychForbidden.status).toBe(403);

        const adminOk = await app.handle(new Request('http://localhost/api/admin/bookings', {
            headers: { authorization: `Bearer ${adminToken}` }
        }));
        expect(adminOk.status).toBe(200);
        const listJson = await adminOk.json();
        expect(listJson.data.records[0].concernNote).toBeUndefined();
        expect(listJson.data.records[0].crisisFlagTriggered).toBe(true);

        const csvRes = await app.handle(new Request('http://localhost/api/admin/bookings/export.csv', {
            headers: { authorization: `Bearer ${adminToken}` }
        }));
        expect(csvRes.status).toBe(200);
        const csvText = await csvRes.text();
        expect(csvText).toContain("\"'=HACK()\"");
        expect(csvText).toContain('"CRISIS_FLAG"');
    });

    it('redacts raw clinical concernNote from n8n webhook payload and computes HMAC signatures', () => {
        const payload = buildBookingWebhookPayload({
            id: 'booking-uuid-1',
            bookingCode: 'ATT-2611-ABC123',
            submittedAt: '2026-11-15T10:00:00.000Z',
            normalized: {
                language: 'id',
                clientStatus: 'new',
                name: 'Nadia',
                whatsapp: '081298765432',
                whatsappE164: '+6281298765432',
                email: 'nadia@example.com',
                emailNormalized: 'nadia@example.com',
                countryRegion: 'Indonesia / DKI Jakarta',
                age: 28,
                gender: 'Perempuan',
                serviceType: 'Personal',
                concernId: 'anxiety_mood',
                concernCategory: 'Kecemasan, Overthinking & Mood',
                clientCategory: 'individual',
                genderPreference: 'female',
                concernNote: 'ULTRA_PRIVATE_CLINICAL_NOTE_NEVER_EXPORT',
                crisisFlagTriggered: true,
                consultationMode: 'online',
                location: null,
                psychologistChoice: 'self',
                psychologistSlug: 'syazka',
                psychologistId: 'psych-1',
                selectedPsychologistName: 'Syazka Kirani Narindra',
                scheduleOption1: '20-11-2026 · 14.00 WIB',
                scheduleOption2: null,
                scheduleOption3: null,
                marketingSource: 'Instagram',
                referrer: null,
                utmSource: 'meta',
                utmMedium: 'paid',
                utmCampaign: 'nov_promo',
                utmContent: null,
                utmTerm: null,
                campaignId: null,
                adsetId: null,
                adId: null
            },
            baseRate: 750_000,
            assessmentFee: 150_000,
            totalRate: 900_000,
            whatsappRouting: { target: 'pusat', whatsappNumber: '6285156410912' }
        });

        const serialized = JSON.stringify(payload);
        expect(serialized).not.toContain('ULTRA_PRIVATE_CLINICAL_NOTE_NEVER_EXPORT');
        expect(payload.notifications.googleSheetRow).toHaveLength(22);
        expect(payload.notifications.googleSheetRow[9]).toContain('CRISIS FLAG');
        expect(payload.notifications.adminEmail.textBody).toContain('CRISIS FLAG');

        const secret = 'webhook_secret_123';
        const expectedSig = `sha256=${createHmac('sha256', secret).update(serialized).digest('hex')}`;
        expect(signBookingWebhookPayload(serialized, secret)).toBe(expectedSig);
        expect(getRetryBackoffSeconds(1)).toBe(10);
        expect(getRetryBackoffSeconds(5)).toBe(1800);
    });

    it('persists booking + clinical privacy wall + advisory-locked 15m buffer + outbox delivery against real Postgres', async () => {
        if (!process.env.DATABASE_URL) return;

        const repo = createBookingRepository(db);
        const createdIds: string[] = [];

        try {
            const malangList = await repo.listBookingPsychologists({ mode: 'offline', location: 'malang' });
            expect(malangList.some((p) => p.slug === 'grace')).toBe(true);
            expect(malangList.every((p) => p.availableMalang)).toBe(true);

            // Create two bookings for syazka and test transactional lock + 15m buffer conflict
            const first = await repo.createSubmission({
                language: 'id',
                clientStatus: 'new',
                name: 'Booking Integration 1',
                whatsapp: '081211112222',
                whatsappE164: '+6281211112222',
                email: 'test1@example.com',
                emailNormalized: 'test1@example.com',
                countryRegion: 'Indonesia / Jakarta',
                age: 25,
                gender: 'Perempuan',
                serviceType: 'Personal',
                concernId: 'anxiety_mood',
                concernCategory: 'Kecemasan, Overthinking & Mood',
                clientCategory: 'individual',
                genderPreference: 'any',
                concernNote: 'CONFIDENTIAL_POSTGRES_THERAPY_NOTE',
                crisisFlagTriggered: false,
                consultationMode: 'online',
                location: null,
                psychologistChoice: 'self',
                psychologistSlug: 'syazka',
                psychologistId: null,
                selectedPsychologistName: 'Syazka',
                scheduleOption1: '25-11-2026 · 10.00 WIB',
                scheduleOption2: null,
                scheduleOption3: null,
                marketingSource: 'Google Search',
                referrer: null,
                utmSource: 'google',
                utmMedium: 'cpc',
                utmCampaign: 'test_campaign',
                utmContent: null,
                utmTerm: null,
                campaignId: null,
                adsetId: null,
                adId: null
            });
            expect(first.ok).toBe(true);
            if (!first.ok) throw new Error('First booking failed');
            createdIds.push(first.id);
            expect(first.baseRate).toBe(750_000);
            expect(first.assessmentFee).toBe(150_000);
            expect(first.totalRate).toBe(900_000);

            const second = await repo.createSubmission({
                language: 'id',
                clientStatus: 'returning',
                name: 'Booking Integration 2',
                whatsapp: '081233334444',
                whatsappE164: '+6281233334444',
                email: 'test2@example.com',
                emailNormalized: 'test2@example.com',
                countryRegion: 'Indonesia / Jakarta',
                age: null,
                gender: null,
                serviceType: 'Personal',
                concernId: null,
                concernCategory: null,
                clientCategory: null,
                genderPreference: null,
                concernNote: null,
                crisisFlagTriggered: false,
                consultationMode: 'online',
                location: null,
                psychologistChoice: 'self',
                psychologistSlug: 'syazka',
                psychologistId: null,
                selectedPsychologistName: 'Syazka',
                scheduleOption1: '25-11-2026 · 11.10 WIB',
                scheduleOption2: null,
                scheduleOption3: null,
                marketingSource: 'Google Search',
                referrer: null,
                utmSource: null,
                utmMedium: null,
                utmCampaign: null,
                utmContent: null,
                utmTerm: null,
                campaignId: null,
                adsetId: null,
                adId: null
            });
            expect(second.ok).toBe(true);
            if (!second.ok) throw new Error('Second booking failed');
            createdIds.push(second.id);
            expect(second.assessmentFee).toBe(0);
            expect(second.totalRate).toBe(750_000);

            // Confirm booking 1: 10:00–11:00 UTC
            const confirm1 = await repo.transitionStatus(first.id, {
                status: 'confirmed',
                confirmedStartAt: '2026-11-25T10:00:00.000Z',
                confirmedEndAt: '2026-11-25T11:00:00.000Z'
            });
            expect(confirm1.ok).toBe(true);

            // Confirm booking 2 inside 15-min buffer (11:10–12:10 UTC) -> rejected with slot_conflict
            const conflict = await repo.transitionStatus(second.id, {
                status: 'confirmed',
                confirmedStartAt: '2026-11-25T11:10:00.000Z',
                confirmedEndAt: '2026-11-25T12:10:00.000Z'
            });
            expect(conflict.ok).toBe(false);
            if (!conflict.ok) {
                expect(conflict.status).toBe(409);
                expect(conflict.code).toBe('slot_conflict');
            }

            // Exactly 15m gap (11:15–12:15 UTC) -> allowed
            const confirm2 = await repo.transitionStatus(second.id, {
                status: 'confirmed',
                confirmedStartAt: '2026-11-25T11:15:00.000Z',
                confirmedEndAt: '2026-11-25T12:15:00.000Z'
            });
            expect(confirm2.ok).toBe(true);

            // Admin operational list hides CONFIDENTIAL_POSTGRES_THERAPY_NOTE
            const adminList = await repo.listAdmin({ search: 'Booking Integration' });
            const serializedAdmin = JSON.stringify(adminList);
            expect(serializedAdmin).not.toContain('CONFIDENTIAL_POSTGRES_THERAPY_NOTE');

            // Test outbox worker retry -> dead_letter & signed delivery
            let deliveredHeaders: HeadersInit | undefined;
            const outboxRes = await processDueBookingOutbox({
                db,
                webhookUrl: 'https://n8n.example.test/webhook/booking',
                webhookSecret: 'test-webhook-hmac-secret',
                batchSize: 5,
                fetchFn: async (_url, init) => {
                    deliveredHeaders = init.headers;
                    return new Response('ok', { status: 200 });
                }
            });
            expect(outboxRes.delivered).toBeGreaterThanOrEqual(2);
            expect((deliveredHeaders as Record<string, string>)['X-Attentive-Signature']).toMatch(/^sha256=/);
            // Verify outbox retry -> dead_letter after 5 failures, then retryWebhookDelivery resets to pending & delivers
            const failedBooking = await repo.createSubmission({
                language: 'id',
                clientStatus: 'new',
                name: 'Booking Outbox Retry Test',
                whatsapp: '081255556666',
                whatsappE164: '+6281255556666',
                email: 'retry@example.com',
                emailNormalized: 'retry@example.com',
                countryRegion: 'Indonesia / Jakarta',
                age: 30,
                gender: 'Laki-laki',
                serviceType: 'Personal',
                concernId: 'career_burnout',
                concernCategory: 'Karier, Burnout & Pengembangan Diri',
                clientCategory: 'individual',
                genderPreference: 'any',
                concernNote: null,
                crisisFlagTriggered: false,
                consultationMode: 'online',
                location: null,
                psychologistChoice: 'recommended',
                psychologistSlug: null,
                psychologistId: null,
                selectedPsychologistName: null,
                scheduleOption1: '26-11-2026 · 14.00 WIB',
                scheduleOption2: null,
                scheduleOption3: null,
                marketingSource: 'Instagram',
                referrer: null,
                utmSource: null,
                utmMedium: null,
                utmCampaign: null,
                utmContent: null,
                utmTerm: null,
                campaignId: null,
                adsetId: null,
                adId: null
            });
            expect(failedBooking.ok).toBe(true);
            if (!failedBooking.ok) throw new Error('Retry test booking failed');
            createdIds.push(failedBooking.id);

            for (let attempt = 1; attempt <= 5; attempt++) {
                await db.update(schema.bookingWebhookDeliveries)
                    .set({ nextAttemptAt: sql`now() - interval '1 second'` })
                    .where(eq(schema.bookingWebhookDeliveries.bookingId, failedBooking.id));
                const failRes = await processDueBookingOutbox({
                    db,
                    webhookUrl: 'https://n8n.example.test/webhook/booking',
                    batchSize: 5,
                    fetchFn: async () => new Response('upstream error', { status: 500 })
                });
                if (attempt < 5) {
                    expect(failRes.failed).toBe(1);
                } else {
                    expect(failRes.deadLettered).toBe(1);
                }
            }

            const retryRes = await repo.retryWebhookDelivery(failedBooking.id);
            expect(retryRes.ok).toBe(true);
            const recoveredRes = await processDueBookingOutbox({
                db,
                webhookUrl: 'https://n8n.example.test/webhook/booking',
                batchSize: 5,
                fetchFn: async () => new Response('ok', { status: 200 })
            });
            expect(recoveredRes.delivered).toBe(1);
        } finally {
            if (createdIds.length > 0) {
                await db.delete(schema.bookings).where(inArray(schema.bookings.id, createdIds));
            }
        }
    });
});
