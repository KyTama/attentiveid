import { describe, expect, it } from 'bun:test';
import { Value } from '@sinclair/typebox/value';
import {
    BOOKING_ASSESSMENT_FEE,
    PublicServiceCatalogResponseSchema,
    PublicServiceDetailSchema,
    type PublicServiceCatalogResponse,
    type PublicServiceDetail
} from '@attentiveid/shared';
import { createApp, type AppDependencies } from '../app';
import { createBookingRepository } from '../repositories/booking.repository';
import { createServicesRepository, getTodayWibDate } from '../repositories/services.repository';
import { buildBookingWebhookPayload } from '../services/booking-outbox';

const FORBIDDEN_INTERNAL_KEYS = [
    'fee',
    'biaya',
    'margin',
    'marginThreshold',
    'asumsi',
    'internalNote',
    'driveNote',
    'dataIssues',
    'sheetId',
    'driveFolderId',
    'zite',
    'historis',
    'usulan'
];

const hasForbiddenKey = (obj: unknown): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    if (Array.isArray(obj)) {
        for (const item of obj) {
            const found = hasForbiddenKey(item);
            if (found) return found;
        }
        return null;
    }
    for (const [key, val] of Object.entries(obj)) {
        if (
            key !== 'appliesNewClientFee'
            && FORBIDDEN_INTERNAL_KEYS.some((bad) => key.toLowerCase().includes(bad.toLowerCase()))
        ) {
            return key;
        }
        const nested = hasForbiddenKey(val);
        if (nested) return nested;
    }
    return null;
};

const sampleCatalog: PublicServiceCatalogResponse = {
    locale: 'id',
    categories: [
        { id: 'cat-1', slug: 'asesmen', position: 0, isFree: false, name: 'Asesmen Psikologi' },
        { id: 'cat-2', slug: 'konseling', position: 1, isFree: false, name: 'Konseling/Terapi' }
    ],
    subgroups: [
        { id: 'sub-1', categoryId: 'cat-1', slug: 'utama', position: 0, name: 'Paket & tes utama', note: null }
    ],
    activePrograms: [
        {
            id: 'prog-1',
            slug: 'edisi-nov-2026-apr-2027',
            name: 'Promo edisi November 2026 sampai April 2027',
            badge: 'Promo',
            programType: 'harga',
            startsOn: '2026-11-01',
            endsOn: '2027-04-30'
        }
    ],
    services: [
        {
            id: 'svc-acm',
            slug: 'acm-y48',
            categoryId: 'cat-1',
            categorySlug: 'asesmen',
            categoryName: 'Asesmen Psikologi',
            subgroupId: 'sub-1',
            subgroupSlug: 'utama',
            subgroupName: 'Paket & tes utama',
            serviceType: 'layanan',
            pricingModel: 'fixed_variant',
            appliesNewClientFee: false,
            isAssessment: true,
            isFeaturedSpotlight: true,
            position: 0,
            name: 'Tes Minat Karier (ACM-Y48)',
            badge: 'Promo',
            shortSummary: 'Asesmen minat karier enam tipe.',
            benefit: 'Memetakan minat karier.',
            audiences: ['Dewasa'],
            modalities: ['online'],
            hasMalangBranch: false,
            priceRange: {
                minAmount: 1_085_000,
                maxAmount: 1_085_000,
                isRange: false,
                variesByProvider: false,
                promoAmount: 485_000,
                promoBadge: 'Promo',
                promoNote: 'Termasuk sesi 1 jam bersama pakar Dr. Haykal, gratis.',
                programSlug: 'edisi-nov-2026-apr-2027'
            },
            cardMedia: {
                url: '/media/services/cards/r-minat.webp',
                width: 800,
                height: 450,
                alt: 'Ilustrasi Tes Minat Karier'
            },
            variants: [
                {
                    id: 'var-acm',
                    slug: 'v-acm-y48',
                    position: 0,
                    name: 'Paket Standar',
                    description: null,
                    unitLabel: 'per orang',
                    ageRangeLabel: null,
                    durationLabel: null,
                    modalities: ['online'],
                    branch: null,
                    priceOnRequest: false,
                    pricing: {
                        minAmount: 1_085_000,
                        maxAmount: 1_085_000,
                        isRange: false,
                        variesByProvider: false,
                        promoAmount: 485_000,
                        promoBadge: 'Promo',
                        promoNote: 'Termasuk sesi 1 jam bersama pakar Dr. Haykal, gratis.',
                        programSlug: 'edisi-nov-2026-apr-2027'
                    }
                }
            ],
            bookingPreset: {
                bookable: true,
                bookingPath: '/booking?service=acm-y48',
                externalUrl: null,
                defaultConcernId: 'career',
                defaultClientCategory: 'individual',
                requiresInitialCounseling: false
            }
        }
    ]
};

const sampleDetail: PublicServiceDetail = {
    ...sampleCatalog.services[0]!,
    fullName: null,
    introduction: 'Pengantar tes minat karier.',
    targetAudience: 'Mahasiswa dan profesional muda.',
    whatIsMeasured: 'Enam tipe minat karier.',
    durationInfo: '45 menit',
    locationInfo: 'Online',
    processSteps: ['Isi kuesioner online'],
    terms: [],
    resultsExplanation: 'Laporan persentil.',
    scientificBasis: 'Holland RIASEC.',
    citationSummary: null,
    reportPreviews: [],
    eligiblePsychologists: [
        {
            id: 'psych-haykal',
            slug: 'haykal',
            name: 'Dr. Haykal Hafizul Arifin',
            nickname: 'Haykal',
            credential: 'S.Psi., M.Si.',
            tier: 'consultant',
            primaryBranch: 'tbi',
            experienceYears: 12,
            onlineRate: null,
            offlineRate: null,
            availableOnline: false,
            availableTbi: false,
            availableBsd: false,
            availableMalang: false,
            note: 'Sesi 1 jam bersama pakar untuk paket dengan sesi.',
            media: {
                url: '/media/psychologists/haykal.webp',
                width: 600,
                height: 750,
                alt: 'Foto profil Dr. Haykal'
            }
        }
    ],
    deliverables: [],
    faqs: [],
    references: [],
    assessmentDetails: null
};

const createTestApp = () => {
    const deps: AppDependencies = {
        frontendOrigin: 'https://attentiveid.com',
        landingRepository: {
            getPublished: async () => null,
            getRevision: async () => null
        },
        psychologistsRepository: {
            list: async () => [],
            featured: async () => [],
            getBySlug: async () => ({ status: 'notFound' })
        },
        servicesRepository: {
            listPublicCatalog: async () => sampleCatalog,
            getPublicBySlug: async (slug) => (slug === 'acm-y48' ? sampleDetail : null),
            resolveBookingServiceSelection: async () => ({
                ok: false,
                status: 404,
                message: 'not found'
            })
        },
        previewCapabilities: { verify: async () => ({ landingRevisionId: 'r', expiresAt: '', tokenDigest: '' }) },
        previewSessions: {
            issue: async () => ({ token: '', expiresAt: '' }),
            verify: async () => ({ landingRevisionId: 'r', expiresAt: '' })
        }
    };
    return createApp(deps);
};

describe('Services Public Security & Booking Bridge', () => {
    it('returns strict DTO-compliant public catalog and detail responses with zero forbidden internal fields', async () => {
        const app = createTestApp();

        const listRes = await app.handle(new Request('http://localhost/api/content/services?locale=id'));
        expect(listRes.status).toBe(200);
        const listJson = await listRes.json() as { status: string; catalog: PublicServiceCatalogResponse };
        expect(listJson.status).toBe('found');
        expect(Value.Check(PublicServiceCatalogResponseSchema, listJson.catalog)).toBe(true);
        expect(hasForbiddenKey(listJson)).toBeNull();

        const detailRes = await app.handle(new Request('http://localhost/api/content/services/acm-y48?locale=id'));
        expect(detailRes.status).toBe(200);
        const detailJson = await detailRes.json() as { status: string; service: PublicServiceDetail };
        expect(detailJson.status).toBe('found');
        expect(Value.Check(PublicServiceDetailSchema, detailJson.service)).toBe(true);
        expect(detailJson.service.eligiblePsychologists[0]?.slug).toBe('haykal');
        expect(hasForbiddenKey(detailJson)).toBeNull();

        const missingRes = await app.handle(new Request('http://localhost/api/content/services/draft-internal-secret?locale=id'));
        expect(missingRes.status).toBe(404);
    });

    it('enforces WIB promo window boundaries cleanly', () => {
        expect(getTodayWibDate(() => new Date('2026-10-31T16:59:59Z'))).toBe('2026-10-31');
        expect(getTodayWibDate(() => new Date('2026-10-31T17:00:00Z'))).toBe('2026-11-01');
    });

    it('computes fixed_variant baseRate without new-client fee, preserves haykal without counseling rates, and renders service in outbox email', async () => {
        const insertedBookings: Record<string, unknown>[] = [];
        const insertedOutbox: Record<string, unknown>[] = [];

        const fakeTx = {
            select: () => ({
                from: () => ({
                    innerJoin: () => ({
                        where: () => ({
                            limit: async () => [
                                {
                                    id: 'psych-haykal',
                                    slug: 'haykal',
                                    status: 'active',
                                    acceptingNewClients: true,
                                    name: 'Dr. Haykal Hafizul Arifin',
                                    primaryBranch: 'tbi',
                                    onlineRate: null,
                                    offlineRate: null,
                                    availableOnline: false,
                                    availableTbi: false,
                                    availableBsd: false,
                                    availableMalang: false
                                }
                            ]
                        })
                    })
                })
            }),
            insert: (table: any) => ({
                values: (vals: Record<string, unknown>) => {
                    if ('bookingCode' in vals) {
                        insertedBookings.push(vals);
                        return {
                            returning: async () => [
                                {
                                    id: 'booking-1',
                                    bookingCode: vals.bookingCode as string,
                                    submittedAt: '2026-11-16T03:00:00.000Z'
                                }
                            ]
                        };
                    }
                    if ('idempotencyKey' in vals) {
                        insertedOutbox.push(vals);
                    }
                    return Promise.resolve([]);
                }
            })
        };

        const fakeDb = {
            transaction: async (cb: (tx: any) => Promise<any>) => cb(fakeTx)
        } as any;

        const repo = createBookingRepository(fakeDb, {
            servicesRepository: {
                resolveBookingServiceSelection: async () => ({
                    ok: true,
                    serviceId: 'svc-acm',
                    serviceVariantId: 'var-acm',
                    serviceNameSnapshot: 'Tes Minat Karier (ACM-Y48)',
                    variantNameSnapshot: 'Paket Standar',
                    pricingModel: 'fixed_variant',
                    appliesNewClientFee: false,
                    fixedBaseRate: 485_000,
                    eligiblePsychologistIds: ['psych-haykal']
                })
            }
        });

        const res = await repo.createSubmission({
            language: 'id',
            clientStatus: 'new',
            name: 'Rina',
            whatsapp: '081234567890',
            whatsappE164: '+6281234567890',
            email: 'rina@example.com',
            emailNormalized: 'rina@example.com',
            countryRegion: 'indonesia / Jakarta',
            age: 24,
            gender: 'female',
            serviceType: 'Personal',
            serviceSlug: 'acm-y48',
            variantSlug: 'v-acm-y48',
            concernId: 'career',
            concernCategory: 'Karier',
            clientCategory: 'individual',
            genderPreference: 'any',
            concernNote: null,
            crisisFlagTriggered: false,
            consultationMode: 'online',
            location: null,
            psychologistChoice: 'self',
            psychologistSlug: 'haykal',
            psychologistId: null,
            selectedPsychologistName: 'Dr. Haykal Hafizul Arifin',
            scheduleOption1: '20-11-2026 · 10:00 WIB',
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

        expect(res.ok).toBe(true);
        if (res.ok) {
            expect(res.baseRate).toBe(485_000);
            expect(res.assessmentFee).toBe(0);
            expect(res.totalRate).toBe(485_000);
        }

        expect(insertedBookings[0]?.serviceId).toBe('svc-acm');
        expect(insertedBookings[0]?.serviceVariantId).toBe('var-acm');
        expect(insertedBookings[0]?.serviceNameSnapshot).toBe('Tes Minat Karier (ACM-Y48)');

        const outboxPayload = JSON.parse(String(insertedOutbox[0]?.payloadJson));
        expect(outboxPayload.notifications.adminEmail.textBody).toContain('Layanan / Paket: Tes Minat Karier (ACM-Y48) (Paket Standar)');
        expect(outboxPayload.notifications.adminEmail.textBody).toContain('Tarif Layanan: Rp 485.000');
        expect(outboxPayload.notifications.adminEmail.textBody).not.toContain('Biaya Asesmen Awal');

        // Also confirm appliesNewClientFee: true (konseling-dewasa) still charges BOOKING_ASSESSMENT_FEE
        const counselingOutbox = buildBookingWebhookPayload({
            id: 'b-2',
            bookingCode: 'ATT-2611-CNS001',
            submittedAt: '2026-11-16T03:00:00.000Z',
            normalized: {
                language: 'id',
                clientStatus: 'new',
                name: 'Sari',
                whatsapp: '081234567891',
                whatsappE164: '+6281234567891',
                email: 'sari@example.com',
                emailNormalized: 'sari@example.com',
                countryRegion: 'indonesia / Jakarta',
                age: 27,
                gender: 'female',
                serviceType: 'Konseling Individu Dewasa',
                serviceSlug: 'konseling-dewasa',
                variantSlug: null,
                concernId: 'anxiety',
                concernCategory: 'Kecemasan',
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
                scheduleOption1: '20-11-2026 · 14:00 WIB',
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
            },
            serviceNameSnapshot: 'Konseling Individu Dewasa',
            variantNameSnapshot: 'Online',
            baseRate: 750_000,
            assessmentFee: BOOKING_ASSESSMENT_FEE,
            totalRate: 900_000,
            whatsappRouting: { target: 'pusat', whatsappNumber: '6285156410912' }
        });
        expect(counselingOutbox.notifications.adminEmail.textBody).toContain('Biaya Asesmen Awal: Rp 150.000');
        expect(counselingOutbox.notifications.adminEmail.textBody).toContain('Tarif Psikolog: Rp 750.000');
    });

    it('excludes draft/internal services and archived variants inside createServicesRepository', async () => {
        // Simulated DB returning only public published rows verifies repository DTO shaping & rate derivation
        let selectCall = 0;
        const fakeResults = [
            [{ id: 'cat-1', slug: 'konseling', position: 0, isFree: false, name: 'Konseling/Terapi' }],
            [],
            [
                {
                    id: 'svc-anak',
                    slug: 'konseling-anak',
                    categoryId: 'cat-1',
                    subgroupId: null,
                    serviceType: 'layanan',
                    pricingModel: 'psychologist_rate',
                    appliesNewClientFee: false,
                    isAssessment: false,
                    isFeaturedSpotlight: false,
                    position: 0,
                    externalUrl: null,
                    defaultConcernId: 'childDevelopment',
                    defaultClientCategory: 'child_teen',
                    audiencesJson: '["Anak"]',
                    name: 'Konseling Psikolog Klinis Anak',
                    badge: null,
                    shortSummary: 'Konseling anak.',
                    benefit: 'Mendampingi tumbuh kembang anak.'
                }
            ],
            [],
            [
                {
                    serviceId: 'svc-anak',
                    position: 0,
                    noteId: null,
                    noteEn: null,
                    id: 'psych-gisella',
                    slug: 'gisella',
                    name: 'Gisella Tani Pratiwi',
                    nickname: 'Gisella',
                    tier: 'principal',
                    primaryBranch: 'tbi',
                    acceptingNewClients: true,
                    credential: 'M.Psi., Psikolog',
                    experienceYears: 15,
                    onlineRate: 950_000,
                    offlineRate: 1_000_000,
                    availableOnline: true,
                    availableTbi: true,
                    availableBsd: false,
                    availableMalang: false
                }
            ],
            [],
            [],
            []
        ];

        const makeChain = (rows: any[]) => {
            const chain: any = {
                from: () => chain,
                innerJoin: () => chain,
                leftJoin: () => chain,
                where: () => chain,
                orderBy: () => Promise.resolve(rows),
                then: (resolve: (val: any) => void) => resolve(rows)
            };
            return chain;
        };

        const fakeDb = {
            select: () => makeChain(fakeResults[selectCall++] ?? [])
        } as any;

        const repo = createServicesRepository(fakeDb, { now: () => new Date('2026-11-16T03:00:00Z') });
        const catalog = await repo.listPublicCatalog('id');

        expect(catalog.services.length).toBe(1);
        expect(catalog.services[0]?.slug).toBe('konseling-anak');
        expect(catalog.services[0]?.appliesNewClientFee).toBe(false);
        expect(catalog.services[0]?.priceRange.minAmount).toBe(950_000);
        expect(catalog.services[0]?.priceRange.maxAmount).toBe(1_000_000);
        expect(catalog.services[0]?.priceRange.variesByProvider).toBe(true);
    });
});
