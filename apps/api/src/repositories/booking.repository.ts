import { randomBytes } from 'node:crypto';
import { and, asc, count, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    BOOKING_ASSESSMENT_FEE,
    BOOKING_SESSION_BUFFER_MINUTES,
    canTransitionBookingStatus,
    normalizeBookingBranch,
    resolveBookingWhatsAppRouting,
    type BookingAdminRecord,
    type BookingPhysicalBranch,
    type BookingPsychologistCatalogItem,
    type BookingStatus,
    type NormalizedBookingSubmission
} from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import * as schema from '../db/schema';
import { escapeLikePattern } from './psychologists.repository';
import { buildBookingWebhookPayload } from '../services/booking-outbox';

const BOOKING_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const generateBookingCode = (now: Date = new Date()): string => {
    const yy = String(now.getUTCFullYear()).slice(-2);
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const bytes = randomBytes(6);
    let suffix = '';
    for (let i = 0; i < 6; i++) {
        suffix += BOOKING_CODE_ALPHABET[bytes[i] % BOOKING_CODE_ALPHABET.length];
    }
    return `ATT-${yy}${mm}-${suffix}`;
};

const toMediaUrl = (reference: string) => (reference.startsWith('media/') ? `/${reference}` : reference);

export interface BookingCatalogQuery {
    mode?: string;
    location?: string;
}

export interface BookingAdminListQuery {
    status?: string;
    consultationMode?: string;
    location?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
}

export type CreateBookingResult =
    | {
        ok: true;
        id: string;
        bookingCode: string;
        submittedAt: string;
        baseRate: number;
        assessmentFee: number;
        totalRate: number;
        whatsappRouting: { target: 'malang' | 'pusat'; whatsappNumber: string };
    }
    | {
        ok: false;
        status: 400 | 404 | 409;
        message: string;
    };

export type TransitionBookingResult =
    | { ok: true; record: BookingAdminRecord }
    | { ok: false; status: 400 | 404 | 409; code?: 'slot_conflict' | 'invalid_transition'; message: string };

export interface AttributionSummaryBucket {
    key: string;
    count: number;
    online: number;
    offline: number;
}

export interface BookingAttributionReport {
    total: number;
    attributed: number;
    unattributed: number;
    rows: {
        id: string;
        bookingCode: string;
        submittedAt: string;
        name: string;
        status: BookingStatus;
        consultationMode: string;
        location: string | null;
        marketingSource: string | null;
        utmSource: string | null;
        utmMedium: string | null;
        utmCampaign: string | null;
        utmContent: string | null;
        utmTerm: string | null;
        campaignId: string | null;
        adsetId: string | null;
        adId: string | null;
    }[];
    byCampaign: AttributionSummaryBucket[];
    byAdset: AttributionSummaryBucket[];
    byAd: AttributionSummaryBucket[];
}

export interface BookingRepository {
    listBookingPsychologists(query: BookingCatalogQuery): Promise<BookingPsychologistCatalogItem[]>;
    createSubmission(input: NormalizedBookingSubmission): Promise<CreateBookingResult>;
    listAdmin(query: BookingAdminListQuery): Promise<{ total: number; records: BookingAdminRecord[] }>;
    listForExport(query: Omit<BookingAdminListQuery, 'limit' | 'offset'>): Promise<BookingAdminRecord[]>;
    transitionStatus(
        id: string,
        input: { status: BookingStatus; confirmedStartAt?: string | null; confirmedEndAt?: string | null }
    ): Promise<TransitionBookingResult>;
    retryWebhookDelivery(bookingId: string): Promise<{ ok: true; deliveryId: string } | { ok: false; status: 404; message: string }>;
    getAttributionReport(query: { dateFrom?: string; dateTo?: string }): Promise<BookingAttributionReport>;
    /** Permanently removes one booking with its intake note and webhook rows (owner only). False when it does not exist. */
    deleteBooking(id: string): Promise<boolean>;
}

const mapAdminRows = async (
    database: PostgresJsDatabase<typeof schema>,
    rows: Array<{
        booking: typeof schema.bookings.$inferSelect;
        psychologistSlug: string | null;
        hasClinicalNote: boolean;
        crisisFlagTriggered: boolean;
    }>
): Promise<BookingAdminRecord[]> => {
    if (rows.length === 0) return [];

    const bookingIds = rows.map((r) => r.booking.id);
    const deliveries = await database
        .select({
            bookingId: schema.bookingWebhookDeliveries.bookingId,
            status: schema.bookingWebhookDeliveries.status,
            attempts: schema.bookingWebhookDeliveries.attempts,
            lastError: schema.bookingWebhookDeliveries.lastError,
            createdAt: schema.bookingWebhookDeliveries.createdAt
        })
        .from(schema.bookingWebhookDeliveries)
        .where(inArray(schema.bookingWebhookDeliveries.bookingId, bookingIds))
        .orderBy(desc(schema.bookingWebhookDeliveries.createdAt));

    const latestDeliveryByBooking = new Map<string, typeof deliveries[number]>();
    for (const d of deliveries) {
        if (!latestDeliveryByBooking.has(d.bookingId)) {
            latestDeliveryByBooking.set(d.bookingId, d);
        }
    }

    return rows.map(({ booking, psychologistSlug, hasClinicalNote, crisisFlagTriggered }) => {
        const delivery = latestDeliveryByBooking.get(booking.id);
        return {
            id: booking.id,
            bookingCode: booking.bookingCode,
            clientUserId: booking.clientUserId ?? null,
            status: booking.status,
            language: booking.language,
            clientStatus: booking.clientStatus as 'new' | 'returning',
            name: booking.name,
            whatsapp: booking.whatsapp,
            whatsappE164: booking.whatsappE164,
            email: booking.email,
            countryRegion: booking.countryRegion ?? null,
            age: booking.age ?? null,
            gender: booking.gender ?? null,
            serviceType: booking.serviceType,
            concernId: booking.concernId ?? null,
            concernCategory: booking.concernCategory ?? null,
            clientCategory: booking.clientCategory ?? null,
            genderPreference: booking.genderPreference ?? null,
            hasClinicalNote: Boolean(hasClinicalNote),
            crisisFlagTriggered: Boolean(crisisFlagTriggered),
            consultationMode: booking.consultationMode as 'online' | 'offline',
            location: (booking.location as BookingPhysicalBranch | null) ?? null,
            psychologistChoice: booking.psychologistChoice as 'recommended' | 'previous' | 'self',
            psychologistId: booking.psychologistId ?? null,
            psychologistSlug: psychologistSlug ?? null,
            selectedPsychologistName: booking.selectedPsychologistName ?? null,
            scheduleOption1: booking.scheduleOption1,
            scheduleOption2: booking.scheduleOption2 ?? null,
            scheduleOption3: booking.scheduleOption3 ?? null,
            confirmedStartAt: booking.confirmedStartAt ?? null,
            confirmedEndAt: booking.confirmedEndAt ?? null,
            baseRate: booking.baseRate,
            assessmentFee: booking.assessmentFee,
            totalRate: booking.totalRate,
            marketingSource: booking.marketingSource ?? null,
            referrer: booking.referrer ?? null,
            utmSource: booking.utmSource ?? null,
            utmMedium: booking.utmMedium ?? null,
            utmCampaign: booking.utmCampaign ?? null,
            utmContent: booking.utmContent ?? null,
            utmTerm: booking.utmTerm ?? null,
            campaignId: booking.campaignId ?? null,
            adsetId: booking.adsetId ?? null,
            adId: booking.adId ?? null,
            webhookStatus: delivery?.status ?? null,
            webhookAttempts: delivery?.attempts ?? 0,
            webhookLastError: delivery?.lastError ?? null,
            submittedAt: booking.submittedAt,
            updatedAt: booking.updatedAt
        };
    });
};

const buildAdminFilterConditions = (query: BookingAdminListQuery) => {
    const conditions: any[] = [];

    if (query.status && query.status !== 'all') {
        conditions.push(eq(schema.bookings.status, query.status as BookingStatus));
    }
    if (query.consultationMode && (query.consultationMode === 'online' || query.consultationMode === 'offline')) {
        conditions.push(eq(schema.bookings.consultationMode, query.consultationMode));
    }
    const normalizedLocation = normalizeBookingBranch(query.location);
    if (normalizedLocation) {
        conditions.push(eq(schema.bookings.location, normalizedLocation));
    }
    if (query.search && query.search.trim()) {
        const pattern = `%${escapeLikePattern(query.search.trim())}%`;
        conditions.push(sql`(
            ${schema.bookings.bookingCode} ilike ${pattern} escape '\\'
            or ${schema.bookings.name} ilike ${pattern} escape '\\'
            or ${schema.bookings.whatsapp} ilike ${pattern} escape '\\'
            or ${schema.bookings.email} ilike ${pattern} escape '\\'
        )`);
    }
    if (query.dateFrom) {
        const start = new Date(query.dateFrom);
        if (!Number.isNaN(start.getTime())) {
            conditions.push(gte(schema.bookings.submittedAt, start.toISOString()));
        }
    }
    if (query.dateTo) {
        const end = new Date(query.dateTo);
        if (!Number.isNaN(end.getTime())) {
            if (query.dateTo.length <= 10) {
                end.setUTCHours(23, 59, 59, 999);
            }
            conditions.push(lte(schema.bookings.submittedAt, end.toISOString()));
        }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
};

export const createBookingRepository = (
    database: PostgresJsDatabase<typeof schema> = defaultDb
): BookingRepository => ({
    async listBookingPsychologists(query) {
        const conditions: any[] = [
            eq(schema.psychologists.status, 'active'),
            eq(schema.psychologists.acceptingNewClients, true),
            sql`(
                ${schema.psychologistProfiles.availableOnline} = true
                or ${schema.psychologistProfiles.availableTbi} = true
                or ${schema.psychologistProfiles.availableBsd} = true
                or ${schema.psychologistProfiles.availableMalang} = true
            )`
        ];

        if (query.mode === 'online') {
            conditions.push(eq(schema.psychologistProfiles.availableOnline, true));
        } else if (query.mode === 'offline') {
            const branch = normalizeBookingBranch(query.location);
            if (branch === 'tbi') {
                conditions.push(eq(schema.psychologistProfiles.availableTbi, true));
            } else if (branch === 'bsd') {
                conditions.push(eq(schema.psychologistProfiles.availableBsd, true));
            } else if (branch === 'malang') {
                conditions.push(eq(schema.psychologistProfiles.availableMalang, true));
            } else {
                conditions.push(or(
                    eq(schema.psychologistProfiles.availableTbi, true),
                    eq(schema.psychologistProfiles.availableBsd, true),
                    eq(schema.psychologistProfiles.availableMalang, true)
                )!);
            }
        }

        const baseRows = await database
            .select({
                id: schema.psychologists.id,
                slug: schema.psychologists.slug,
                name: schema.psychologists.name,
                nickname: schema.psychologists.nickname,
                tier: schema.psychologists.tier,
                primaryBranch: schema.psychologists.primaryBranch,
                acceptingNewClients: schema.psychologists.acceptingNewClients,
                featured: schema.psychologists.featured,
                featuredOrder: schema.psychologists.featuredOrder,
                credential: schema.psychologistProfiles.credential,
                experienceYears: schema.psychologistProfiles.experienceYears,
                consultationDuration: schema.psychologistProfiles.consultationDuration,
                onlineRate: schema.psychologistProfiles.onlineRate,
                offlineRate: schema.psychologistProfiles.offlineRate,
                availableOnline: schema.psychologistProfiles.availableOnline,
                availableTbi: schema.psychologistProfiles.availableTbi,
                availableBsd: schema.psychologistProfiles.availableBsd,
                availableMalang: schema.psychologistProfiles.availableMalang,
                scheduleMon: schema.psychologistProfiles.scheduleMon,
                scheduleTue: schema.psychologistProfiles.scheduleTue,
                scheduleWed: schema.psychologistProfiles.scheduleWed,
                scheduleThu: schema.psychologistProfiles.scheduleThu,
                scheduleFri: schema.psychologistProfiles.scheduleFri,
                scheduleSat: schema.psychologistProfiles.scheduleSat,
                scheduleSun: schema.psychologistProfiles.scheduleSun
            })
            .from(schema.psychologists)
            .innerJoin(
                schema.psychologistProfiles,
                eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id)
            )
            .where(and(...conditions))
            .orderBy(
                sql`case when ${schema.psychologists.featuredOrder} is null then 1 else 0 end`,
                asc(schema.psychologists.featuredOrder),
                asc(schema.psychologists.name)
            );

        if (baseRows.length === 0) return [];

        const psychIds = baseRows.map((row) => row.id);

        const [translations, supportAreas, specializations, mediaRows] = await Promise.all([
            database
                .select({
                    psychologistId: schema.psychologistProfileTranslations.psychologistId,
                    locale: schema.psychologistProfileTranslations.locale,
                    shortBio: schema.psychologistProfileTranslations.shortBio
                })
                .from(schema.psychologistProfileTranslations)
                .where(inArray(schema.psychologistProfileTranslations.psychologistId, psychIds)),
            database
                .select({
                    psychologistId: schema.psychologistSupportAreas.psychologistId,
                    supportArea: schema.psychologistSupportAreas.supportArea,
                    primary: schema.psychologistSupportAreas.primary,
                    position: schema.psychologistSupportAreas.position
                })
                .from(schema.psychologistSupportAreas)
                .where(inArray(schema.psychologistSupportAreas.psychologistId, psychIds))
                .orderBy(asc(schema.psychologistSupportAreas.position)),
            database
                .select({
                    psychologistId: schema.psychologistSpecializations.psychologistId,
                    position: schema.psychologistSpecializations.position,
                    locale: schema.psychologistSpecializationTranslations.locale,
                    label: schema.psychologistSpecializationTranslations.label
                })
                .from(schema.psychologistSpecializations)
                .innerJoin(
                    schema.psychologistSpecializationTranslations,
                    eq(schema.psychologistSpecializationTranslations.specializationId, schema.psychologistSpecializations.id)
                )
                .where(inArray(schema.psychologistSpecializations.psychologistId, psychIds))
                .orderBy(asc(schema.psychologistSpecializations.position)),
            database
                .select({
                    psychologistId: schema.mediaAttachments.psychologistId,
                    objectKey: schema.mediaObjects.objectKey,
                    publicUrl: schema.mediaObjects.publicUrl,
                    width: schema.mediaObjects.width,
                    height: schema.mediaObjects.height,
                    altId: schema.mediaObjects.altId,
                    altEn: schema.mediaObjects.altEn
                })
                .from(schema.mediaAttachments)
                .innerJoin(
                    schema.mediaObjects,
                    eq(schema.mediaObjects.id, schema.mediaAttachments.mediaObjectId)
                )
                .where(and(
                    inArray(schema.mediaAttachments.psychologistId, psychIds),
                    eq(schema.mediaAttachments.role, 'profilePhoto'),
                    eq(schema.mediaObjects.lifecycle, 'active'),
                    sql`${schema.mediaAttachments.detachedAt} is null`
                ))
        ]);

        const items: BookingPsychologistCatalogItem[] = [];

        for (const base of baseRows) {
            const saRows = supportAreas.filter((s) => s.psychologistId === base.id);
            const primarySa = saRows.find((s) => s.primary)?.supportArea ?? saRows[0]?.supportArea ?? 'adultClinical';

            const specRows = specializations.filter((s) => s.psychologistId === base.id);
            const specsId = specRows.filter((s) => s.locale === 'id').map((s) => s.label);
            const specsEn = specRows.filter((s) => s.locale === 'en').map((s) => s.label);

            const idTrans = translations.find((t) => t.psychologistId === base.id && t.locale === 'id');
            const enTrans = translations.find((t) => t.psychologistId === base.id && t.locale === 'en');
            const shortBio = idTrans?.shortBio || enTrans?.shortBio
                ? {
                    id: idTrans?.shortBio ?? enTrans?.shortBio ?? '',
                    en: enTrans?.shortBio ?? idTrans?.shortBio ?? ''
                }
                : undefined;

            const mediaRow = mediaRows.find((m) => m.psychologistId === base.id);
            const ref = mediaRow?.objectKey ?? mediaRow?.publicUrl;
            const media = mediaRow && ref
                ? {
                    url: toMediaUrl(ref),
                    width: mediaRow.width,
                    height: mediaRow.height,
                    alt: { id: mediaRow.altId, en: mediaRow.altEn }
                }
                : undefined;

            items.push({
                id: base.id,
                slug: base.slug,
                name: base.name,
                nickname: base.nickname,
                credential: base.credential,
                tier: base.tier,
                primaryBranch: base.primaryBranch,
                acceptingNewClients: base.acceptingNewClients,
                featured: base.featured,
                featuredOrder: base.featuredOrder,
                experienceYears: base.experienceYears,
                supportArea: primarySa,
                specializations: {
                    id: specsId.length > 0 ? specsId : specsEn,
                    en: specsEn.length > 0 ? specsEn : specsId
                },
                ...(shortBio ? { shortBio } : {}),
                ...(media ? { media } : {}),
                consultationDuration: base.consultationDuration,
                onlineRate: base.onlineRate ?? null,
                offlineRate: base.offlineRate ?? null,
                availableOnline: base.availableOnline,
                availableTbi: base.availableTbi,
                availableBsd: base.availableBsd,
                availableMalang: base.availableMalang,
                scheduleMon: base.scheduleMon ?? null,
                scheduleTue: base.scheduleTue ?? null,
                scheduleWed: base.scheduleWed ?? null,
                scheduleThu: base.scheduleThu ?? null,
                scheduleFri: base.scheduleFri ?? null,
                scheduleSat: base.scheduleSat ?? null,
                scheduleSun: base.scheduleSun ?? null
            });
        }

        return items;
    },

    async createSubmission(input) {
        return database.transaction(async (tx) => {
            let resolvedPsychId: string | null = null;
            let resolvedPsychSlug: string | null = null;
            let resolvedPsychName: string | null = input.selectedPsychologistName;
            let primaryBranch: BookingPhysicalBranch | 'online_only' | 'multiple' | null = null;
            let availableMalang = false;
            let baseRate = 0;

            const wantsSpecificPsychologist = input.psychologistChoice === 'self' || input.psychologistChoice === 'previous';
            const lookupKey = input.psychologistId && UUID_PATTERN.test(input.psychologistId)
                ? { type: 'id' as const, value: input.psychologistId }
                : input.psychologistSlug
                    ? { type: 'slug' as const, value: input.psychologistSlug }
                    : input.psychologistId
                        ? { type: 'slug' as const, value: input.psychologistId }
                        : null;

            if (wantsSpecificPsychologist || lookupKey) {
                if (!lookupKey) {
                    return { ok: false, status: 400, message: 'Psikolog wajib dipilih.' };
                }

                const [match] = await tx
                    .select({
                        id: schema.psychologists.id,
                        slug: schema.psychologists.slug,
                        status: schema.psychologists.status,
                        acceptingNewClients: schema.psychologists.acceptingNewClients,
                        name: schema.psychologists.name,
                        primaryBranch: schema.psychologists.primaryBranch,
                        onlineRate: schema.psychologistProfiles.onlineRate,
                        offlineRate: schema.psychologistProfiles.offlineRate,
                        availableOnline: schema.psychologistProfiles.availableOnline,
                        availableTbi: schema.psychologistProfiles.availableTbi,
                        availableBsd: schema.psychologistProfiles.availableBsd,
                        availableMalang: schema.psychologistProfiles.availableMalang
                    })
                    .from(schema.psychologists)
                    .innerJoin(
                        schema.psychologistProfiles,
                        eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id)
                    )
                    .where(
                        lookupKey.type === 'id'
                            ? eq(schema.psychologists.id, lookupKey.value)
                            : eq(schema.psychologists.slug, lookupKey.value)
                    )
                    .limit(1);

                if (!match) {
                    return { ok: false, status: 404, message: 'Psikolog tidak ditemukan.' };
                }
                if (match.status !== 'active' || !match.acceptingNewClients) {
                    return { ok: false, status: 409, message: 'Psikolog sedang tidak menerima klien baru.' };
                }

                if (input.consultationMode === 'online') {
                    if (!match.availableOnline || match.onlineRate === null) {
                        return { ok: false, status: 400, message: 'Psikolog ini tidak tersedia untuk sesi online.' };
                    }
                    baseRate = match.onlineRate;
                } else {
                    const branchAvailable = input.location === 'tbi'
                        ? match.availableTbi
                        : input.location === 'bsd'
                            ? match.availableBsd
                            : input.location === 'malang'
                                ? match.availableMalang
                                : false;
                    if (!branchAvailable || match.offlineRate === null) {
                        return { ok: false, status: 400, message: 'Psikolog ini tidak praktik di cabang yang dipilih.' };
                    }
                    baseRate = match.offlineRate;
                }

                resolvedPsychId = match.id;
                resolvedPsychSlug = match.slug;
                resolvedPsychName = match.name;
                primaryBranch = match.primaryBranch;
                availableMalang = match.availableMalang;
            }

            const assessmentFee = input.clientStatus === 'new' ? BOOKING_ASSESSMENT_FEE : 0;
            const totalRate = baseRate + assessmentFee;
            const bookingCode = generateBookingCode();

            const [created] = await tx
                .insert(schema.bookings)
                .values({
                    bookingCode,
                    clientUserId: null,
                    status: 'pending',
                    language: input.language,
                    clientStatus: input.clientStatus,
                    name: input.name,
                    whatsapp: input.whatsapp,
                    whatsappE164: input.whatsappE164,
                    email: input.email,
                    emailNormalized: input.emailNormalized,
                    countryRegion: input.countryRegion,
                    age: input.age,
                    gender: input.gender,
                    serviceType: input.serviceType,
                    concernId: input.concernId,
                    concernCategory: input.concernCategory,
                    clientCategory: input.clientCategory,
                    genderPreference: input.genderPreference,
                    consultationMode: input.consultationMode,
                    location: input.location,
                    psychologistChoice: input.psychologistChoice,
                    psychologistId: resolvedPsychId,
                    selectedPsychologistName: resolvedPsychName,
                    scheduleOption1: input.scheduleOption1,
                    scheduleOption2: input.scheduleOption2,
                    scheduleOption3: input.scheduleOption3,
                    baseRate,
                    assessmentFee,
                    totalRate,
                    marketingSource: input.marketingSource,
                    referrer: input.referrer,
                    utmSource: input.utmSource,
                    utmMedium: input.utmMedium,
                    utmCampaign: input.utmCampaign,
                    utmContent: input.utmContent,
                    utmTerm: input.utmTerm,
                    campaignId: input.campaignId,
                    adsetId: input.adsetId,
                    adId: input.adId
                })
                .returning({
                    id: schema.bookings.id,
                    bookingCode: schema.bookings.bookingCode,
                    submittedAt: schema.bookings.submittedAt
                });

            if (input.concernNote || input.crisisFlagTriggered) {
                await tx.insert(schema.bookingClinicalIntakes).values({
                    bookingId: created.id,
                    concernNote: input.concernNote,
                    crisisFlagTriggered: input.crisisFlagTriggered
                });
            }

            const whatsappRouting = resolveBookingWhatsAppRouting({
                mode: input.consultationMode,
                location: input.location,
                psychChoice: input.psychologistChoice,
                availableMalang,
                primaryBranch
            });

            const outboxPayload = buildBookingWebhookPayload({
                id: created.id,
                bookingCode: created.bookingCode,
                submittedAt: created.submittedAt,
                normalized: {
                    ...input,
                    psychologistId: resolvedPsychId,
                    psychologistSlug: resolvedPsychSlug,
                    selectedPsychologistName: resolvedPsychName
                },
                baseRate,
                assessmentFee,
                totalRate,
                whatsappRouting
            });

            await tx.insert(schema.bookingWebhookDeliveries).values({
                bookingId: created.id,
                eventType: 'booking.submitted',
                idempotencyKey: outboxPayload.idempotencyKey,
                payloadJson: JSON.stringify(outboxPayload),
                status: 'pending'
            });

            return {
                ok: true,
                id: created.id,
                bookingCode: created.bookingCode,
                submittedAt: created.submittedAt,
                baseRate,
                assessmentFee,
                totalRate,
                whatsappRouting
            };
        });
    },

    async listAdmin(query) {
        const whereClause = buildAdminFilterConditions(query);
        const limit = Math.max(1, Math.min(200, query.limit ?? 50));
        const offset = Math.max(0, query.offset ?? 0);

        const [{ totalCount }] = await database
            .select({ totalCount: count() })
            .from(schema.bookings)
            .where(whereClause);

        const rows = await database
            .select({
                booking: schema.bookings,
                psychologistSlug: schema.psychologists.slug,
                hasClinicalNote: sql<boolean>`(${schema.bookingClinicalIntakes.concernNote} is not null)`,
                crisisFlagTriggered: sql<boolean>`coalesce(${schema.bookingClinicalIntakes.crisisFlagTriggered}, false)`
            })
            .from(schema.bookings)
            .leftJoin(schema.psychologists, eq(schema.psychologists.id, schema.bookings.psychologistId))
            .leftJoin(schema.bookingClinicalIntakes, eq(schema.bookingClinicalIntakes.bookingId, schema.bookings.id))
            .where(whereClause)
            .orderBy(desc(schema.bookings.submittedAt))
            .limit(limit)
            .offset(offset);

        const records = await mapAdminRows(database, rows);
        return { total: Number(totalCount || 0), records };
    },

    async listForExport(query) {
        const whereClause = buildAdminFilterConditions(query);
        const rows = await database
            .select({
                booking: schema.bookings,
                psychologistSlug: schema.psychologists.slug,
                hasClinicalNote: sql<boolean>`(${schema.bookingClinicalIntakes.concernNote} is not null)`,
                crisisFlagTriggered: sql<boolean>`coalesce(${schema.bookingClinicalIntakes.crisisFlagTriggered}, false)`
            })
            .from(schema.bookings)
            .leftJoin(schema.psychologists, eq(schema.psychologists.id, schema.bookings.psychologistId))
            .leftJoin(schema.bookingClinicalIntakes, eq(schema.bookingClinicalIntakes.bookingId, schema.bookings.id))
            .where(whereClause)
            .orderBy(desc(schema.bookings.submittedAt));

        return mapAdminRows(database, rows);
    },

    async transitionStatus(id, input) {
        const result = await database.transaction(async (tx): Promise<
            | { ok: true }
            | { ok: false; status: 400 | 404 | 409; code?: 'slot_conflict' | 'invalid_transition'; message: string }
        > => {
            const [locked] = await tx
                .select()
                .from(schema.bookings)
                .where(eq(schema.bookings.id, id))
                .for('update');

            if (!locked) {
                return { ok: false, status: 404, message: 'Booking tidak ditemukan.' };
            }

            if (!canTransitionBookingStatus(locked.status, input.status)) {
                return {
                    ok: false,
                    status: 409,
                    code: 'invalid_transition',
                    message: `Transisi status dari '${locked.status}' ke '${input.status}' tidak diizinkan.`
                };
            }

            let confirmedStartAt = locked.confirmedStartAt;
            let confirmedEndAt = locked.confirmedEndAt;

            const hasStart = input.confirmedStartAt !== undefined && input.confirmedStartAt !== null && input.confirmedStartAt !== '';
            const hasEnd = input.confirmedEndAt !== undefined && input.confirmedEndAt !== null && input.confirmedEndAt !== '';

            if (hasStart !== hasEnd) {
                return {
                    ok: false,
                    status: 400,
                    message: 'confirmedStartAt dan confirmedEndAt harus diisi berpasangan.'
                };
            }

            if (hasStart && hasEnd) {
                const startDate = new Date(input.confirmedStartAt!);
                const endDate = new Date(input.confirmedEndAt!);
                if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
                    return {
                        ok: false,
                        status: 400,
                        message: 'Rentang waktu konfirmasi tidak valid (waktu selesai harus setelah waktu mulai).'
                    };
                }

                confirmedStartAt = startDate.toISOString();
                confirmedEndAt = endDate.toISOString();

                if (input.status === 'confirmed' && locked.psychologistId) {
                    // Transaction-scoped advisory lock per practitioner serializes concurrent slot confirmations.
                    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${locked.psychologistId}))`);

                    const conflicts = await tx
                        .select({
                            id: schema.bookings.id,
                            bookingCode: schema.bookings.bookingCode
                        })
                        .from(schema.bookings)
                        .where(and(
                            eq(schema.bookings.psychologistId, locked.psychologistId),
                            sql`${schema.bookings.id} <> ${locked.id}`,
                            inArray(schema.bookings.status, ['confirmed', 'in_session']),
                            sql`${schema.bookings.confirmedStartAt} is not null and ${schema.bookings.confirmedEndAt} is not null`,
                            sql`${schema.bookings.confirmedStartAt} < (${confirmedEndAt}::timestamptz + (${BOOKING_SESSION_BUFFER_MINUTES} * interval '1 minute'))`,
                            sql`${schema.bookings.confirmedEndAt} > (${confirmedStartAt}::timestamptz - (${BOOKING_SESSION_BUFFER_MINUTES} * interval '1 minute'))`
                        ))
                        .limit(1);

                    if (conflicts.length > 0) {
                        return {
                            ok: false,
                            status: 409,
                            code: 'slot_conflict',
                            message: `Jadwal bentrok atau berada dalam buffer ${BOOKING_SESSION_BUFFER_MINUTES} menit dari booking ${conflicts[0].bookingCode}.`
                        };
                    }
                }
            }

            await tx
                .update(schema.bookings)
                .set({
                    status: input.status,
                    confirmedStartAt,
                    confirmedEndAt,
                    updatedAt: sql`now()`
                })
                .where(eq(schema.bookings.id, id));

            return { ok: true };
        });

        if (!result.ok) {
            return result;
        }

        const [row] = await database
            .select({
                booking: schema.bookings,
                psychologistSlug: schema.psychologists.slug,
                hasClinicalNote: sql<boolean>`(${schema.bookingClinicalIntakes.concernNote} is not null)`,
                crisisFlagTriggered: sql<boolean>`coalesce(${schema.bookingClinicalIntakes.crisisFlagTriggered}, false)`
            })
            .from(schema.bookings)
            .leftJoin(schema.psychologists, eq(schema.psychologists.id, schema.bookings.psychologistId))
            .leftJoin(schema.bookingClinicalIntakes, eq(schema.bookingClinicalIntakes.bookingId, schema.bookings.id))
            .where(eq(schema.bookings.id, id))
            .limit(1);

        if (!row) {
            return { ok: false, status: 404, message: 'Booking tidak ditemukan.' };
        }

        const [record] = await mapAdminRows(database, [row]);
        return { ok: true, record };
    },

    async deleteBooking(id) {
        // The clinical intake and the webhook deliveries are removed with it (ON DELETE CASCADE).
        const rows = await database.delete(schema.bookings).where(eq(schema.bookings.id, id)).returning({ id: schema.bookings.id });
        return rows.length > 0;
    },

    async retryWebhookDelivery(bookingId) {
        const [delivery] = await database
            .select({ id: schema.bookingWebhookDeliveries.id })
            .from(schema.bookingWebhookDeliveries)
            .where(eq(schema.bookingWebhookDeliveries.bookingId, bookingId))
            .orderBy(desc(schema.bookingWebhookDeliveries.createdAt))
            .limit(1);

        if (!delivery) {
            return { ok: false, status: 404, message: 'Outbox webhook delivery tidak ditemukan untuk booking ini.' };
        }

        await database
            .update(schema.bookingWebhookDeliveries)
            .set({
                status: 'pending',
                nextAttemptAt: sql`now()`,
                lastError: null,
                updatedAt: sql`now()`
            })
            .where(eq(schema.bookingWebhookDeliveries.id, delivery.id));

        return { ok: true, deliveryId: delivery.id };
    },

    async getAttributionReport(query) {
        const whereClause = buildAdminFilterConditions({
            dateFrom: query.dateFrom,
            dateTo: query.dateTo
        });

        const rows = await database
            .select({
                id: schema.bookings.id,
                bookingCode: schema.bookings.bookingCode,
                submittedAt: schema.bookings.submittedAt,
                name: schema.bookings.name,
                status: schema.bookings.status,
                consultationMode: schema.bookings.consultationMode,
                location: schema.bookings.location,
                marketingSource: schema.bookings.marketingSource,
                utmSource: schema.bookings.utmSource,
                utmMedium: schema.bookings.utmMedium,
                utmCampaign: schema.bookings.utmCampaign,
                utmContent: schema.bookings.utmContent,
                utmTerm: schema.bookings.utmTerm,
                campaignId: schema.bookings.campaignId,
                adsetId: schema.bookings.adsetId,
                adId: schema.bookings.adId
            })
            .from(schema.bookings)
            .where(whereClause)
            .orderBy(desc(schema.bookings.submittedAt));

        const campaignMap = new Map<string, AttributionSummaryBucket>();
        const adsetMap = new Map<string, AttributionSummaryBucket>();
        const adMap = new Map<string, AttributionSummaryBucket>();

        const bumpBucket = (map: Map<string, AttributionSummaryBucket>, rawKey: string | null, mode: string) => {
            const key = rawKey?.trim() || '—';
            const current = map.get(key) ?? { key, count: 0, online: 0, offline: 0 };
            current.count += 1;
            if (mode === 'online') current.online += 1;
            else if (mode === 'offline') current.offline += 1;
            map.set(key, current);
        };

        let attributed = 0;
        let unattributed = 0;

        for (const r of rows) {
            const hasUtm = Boolean(r.utmSource || r.utmMedium || r.utmCampaign || r.campaignId || r.adsetId || r.adId);
            if (hasUtm) {
                attributed += 1;
            } else {
                unattributed += 1;
            }
            bumpBucket(campaignMap, r.utmCampaign || r.campaignId, r.consultationMode);
            bumpBucket(adsetMap, r.adsetId || r.utmContent, r.consultationMode);
            bumpBucket(adMap, r.adId || r.utmTerm, r.consultationMode);
        }

        const sortDesc = (a: AttributionSummaryBucket, b: AttributionSummaryBucket) => b.count - a.count;

        return {
            total: rows.length,
            attributed,
            unattributed,
            rows,
            byCampaign: [...campaignMap.values()].sort(sortDesc),
            byAdset: [...adsetMap.values()].sort(sortDesc),
            byAd: [...adMap.values()].sort(sortDesc)
        };
    }
});
