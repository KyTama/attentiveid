import { and, asc, eq, inArray, lte, gte, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    getServiceBookingDefaults,
    type BookingPhysicalBranch,
    type PublicServiceBookingPreset,
    type PublicServiceCatalogResponse,
    type PublicServiceCategory,
    type PublicServiceDeliverable,
    type PublicServiceDetail,
    type PublicServiceFaq,
    type PublicServiceMedia,
    type PublicServiceProgram,
    type PublicServicePsychologistOption,
    type PublicServiceReference,
    type PublicServiceSubgroup,
    type PublicServiceSummary,
    type PublicServiceVariant,
    type PublicServiceVariantPricing,
    type ServiceDemoConfig,
    type ServiceModality,
    type ServicePricingModel
} from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import * as schema from '../db/schema';

const toMediaUrl = (reference: string) => (reference.startsWith('media/') ? `/${reference}` : reference);

export const getTodayWibDate = (now: () => Date = () => new Date()): string => {
    const ms = now().getTime() + 7 * 3_600_000;
    const wib = new Date(ms);
    const y = wib.getUTCFullYear();
    const m = String(wib.getUTCMonth() + 1).padStart(2, '0');
    const d = String(wib.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const parseStringArray = (raw: string | null | undefined): string[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch {
        return [];
    }
};

const parseModalities = (raw: string | null | undefined): ServiceModality[] => {
    const items = parseStringArray(raw);
    return items.filter((m): m is ServiceModality => m === 'online' || m === 'offline');
};

const parseDemoConfig = (raw: string | null | undefined): ServiceDemoConfig | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as { tasks?: unknown; aaa?: unknown; reportKey?: unknown };
        const validTasks = Array.isArray(parsed.tasks)
            ? parsed.tasks.filter(
                (t): t is ServiceDemoConfig['tasks'][number] =>
                    t === 'cpt' || t === 'sst' || t === 'nb' || t === 'gng'
            )
            : [];
        return {
            tasks: validTasks,
            aaa: Boolean(parsed.aaa),
            reportKey: typeof parsed.reportKey === 'string' ? parsed.reportKey : null
        };
    } catch {
        return null;
    }
};

const emptyPricing = (variesByProvider = false): PublicServiceVariantPricing => ({
    minAmount: null,
    maxAmount: null,
    isRange: false,
    variesByProvider,
    promoAmount: null,
    promoBadge: null,
    promoNote: null,
    programSlug: null
});

const buildBookingPreset = (service: {
    slug: string;
    serviceType: 'layanan' | 'addon';
    pricingModel: ServicePricingModel;
    externalUrl: string | null;
    defaultConcernId: string | null;
    defaultClientCategory: string | null;
}): PublicServiceBookingPreset => {
    const fallbackDefaults = getServiceBookingDefaults(service.slug);
    const defaultConcernId = service.defaultConcernId ?? fallbackDefaults.concernId;
    const defaultClientCategory = service.defaultClientCategory ?? fallbackDefaults.clientCategory;

    if (service.serviceType === 'addon') {
        return {
            bookable: false,
            bookingPath: null,
            externalUrl: null,
            defaultConcernId,
            defaultClientCategory,
            requiresInitialCounseling: false
        };
    }

    if (service.pricingModel === 'free_external') {
        return {
            bookable: false,
            bookingPath: null,
            externalUrl: service.externalUrl,
            defaultConcernId,
            defaultClientCategory,
            requiresInitialCounseling: false
        };
    }

    if (service.slug === 'adhd-dewasa' || service.pricingModel === 'price_on_request') {
        return {
            bookable: true,
            bookingPath: '/booking?service=konseling-dewasa&concern=attention',
            externalUrl: null,
            defaultConcernId: 'attention',
            defaultClientCategory: 'individual',
            requiresInitialCounseling: true
        };
    }

    return {
        bookable: true,
        bookingPath: `/booking?service=${encodeURIComponent(service.slug)}`,
        externalUrl: null,
        defaultConcernId,
        defaultClientCategory,
        requiresInitialCounseling: false
    };
};

export interface ResolvedBookingServiceSelection {
    ok: true;
    serviceId: string;
    serviceVariantId: string | null;
    serviceNameSnapshot: string;
    variantNameSnapshot: string | null;
    pricingModel: ServicePricingModel;
    appliesNewClientFee: boolean;
    fixedBaseRate: number | null;
    eligiblePsychologistIds: string[];
}

export interface RejectedBookingServiceSelection {
    ok: false;
    status: 400 | 404;
    message: string;
}

export interface ServicesRepository {
    listPublicCatalog(locale: 'id' | 'en'): Promise<PublicServiceCatalogResponse>;
    getPublicBySlug(slug: string, locale: 'id' | 'en'): Promise<PublicServiceDetail | null>;
    resolveBookingServiceSelection(input: {
        serviceSlug: string;
        variantSlug?: string | null;
        consultationMode: 'online' | 'offline';
        location?: BookingPhysicalBranch | null;
        tx?: PostgresJsDatabase<typeof schema>;
    }): Promise<ResolvedBookingServiceSelection | RejectedBookingServiceSelection>;
}

export const createServicesRepository = (
    database: PostgresJsDatabase<typeof schema> = defaultDb,
    options: { now?: () => Date } = {}
): ServicesRepository => {
    const now = options.now ?? (() => new Date());

    const loadActivePrograms = async (
        db: PostgresJsDatabase<typeof schema>,
        locale: 'id' | 'en',
        todayWib: string
    ) => {
        const programRows = await db
            .select({
                id: schema.servicePrograms.id,
                slug: schema.servicePrograms.slug,
                programType: schema.servicePrograms.programType,
                startsOn: schema.servicePrograms.startsOn,
                endsOn: schema.servicePrograms.endsOn,
                name: schema.serviceProgramTranslations.name,
                badge: schema.serviceProgramTranslations.badge
            })
            .from(schema.servicePrograms)
            .innerJoin(
                schema.serviceProgramTranslations,
                and(
                    eq(schema.serviceProgramTranslations.programId, schema.servicePrograms.id),
                    eq(schema.serviceProgramTranslations.locale, locale)
                )
            )
            .where(
                and(
                    eq(schema.servicePrograms.status, 'active'),
                    lte(schema.servicePrograms.startsOn, todayWib),
                    gte(schema.servicePrograms.endsOn, todayWib)
                )
            );

        const activePrograms: PublicServiceProgram[] = programRows.map((row) => ({
            id: row.id,
            slug: row.slug,
            name: row.name,
            badge: row.badge,
            programType: row.programType,
            startsOn: row.startsOn,
            endsOn: row.endsOn
        }));

        const programIds = programRows.map((p) => p.id);
        const programPriceRows = programIds.length > 0
            ? await db
                .select({
                    programId: schema.serviceProgramPrices.programId,
                    variantId: schema.serviceProgramPrices.variantId,
                    promoAmount: schema.serviceProgramPrices.promoAmount,
                    noteId: schema.serviceProgramPrices.noteId,
                    noteEn: schema.serviceProgramPrices.noteEn
                })
                .from(schema.serviceProgramPrices)
                .where(inArray(schema.serviceProgramPrices.programId, programIds))
            : [];

        const promoByVariantId = new Map<
            string,
            {
                promoAmount: number;
                promoBadge: string | null;
                promoNote: string | null;
                programSlug: string;
            }
        >();

        const programById = new Map(activePrograms.map((p) => [p.id, p]));
        for (const priceRow of programPriceRows) {
            const program = programById.get(priceRow.programId);
            if (!program) continue;
            const existing = promoByVariantId.get(priceRow.variantId);
            if (!existing || priceRow.promoAmount < existing.promoAmount) {
                promoByVariantId.set(priceRow.variantId, {
                    promoAmount: priceRow.promoAmount,
                    promoBadge: program.badge,
                    promoNote: locale === 'en' ? (priceRow.noteEn ?? priceRow.noteId) : (priceRow.noteId ?? priceRow.noteEn),
                    programSlug: program.slug
                });
            }
        }

        return { activePrograms, promoByVariantId };
    };

    const loadEligiblePsychologists = async (
        db: PostgresJsDatabase<typeof schema>,
        serviceIds: string[],
        locale: 'id' | 'en',
        includeRatesUnavailableForCounseling: boolean
    ) => {
        if (serviceIds.length === 0) return new Map<string, PublicServicePsychologistOption[]>();

        const linkRows = await db
            .select({
                serviceId: schema.servicePsychologists.serviceId,
                position: schema.servicePsychologists.position,
                noteId: schema.servicePsychologists.noteId,
                noteEn: schema.servicePsychologists.noteEn,
                id: schema.psychologists.id,
                slug: schema.psychologists.slug,
                name: schema.psychologists.name,
                nickname: schema.psychologists.nickname,
                tier: schema.psychologists.tier,
                primaryBranch: schema.psychologists.primaryBranch,
                acceptingNewClients: schema.psychologists.acceptingNewClients,
                credential: schema.psychologistProfiles.credential,
                experienceYears: schema.psychologistProfiles.experienceYears,
                onlineRate: schema.psychologistProfiles.onlineRate,
                offlineRate: schema.psychologistProfiles.offlineRate,
                availableOnline: schema.psychologistProfiles.availableOnline,
                availableTbi: schema.psychologistProfiles.availableTbi,
                availableBsd: schema.psychologistProfiles.availableBsd,
                availableMalang: schema.psychologistProfiles.availableMalang
            })
            .from(schema.servicePsychologists)
            .innerJoin(schema.psychologists, eq(schema.psychologists.id, schema.servicePsychologists.psychologistId))
            .innerJoin(
                schema.psychologistProfiles,
                eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id)
            )
            .where(
                and(
                    inArray(schema.servicePsychologists.serviceId, serviceIds),
                    eq(schema.psychologists.status, 'active'),
                    eq(schema.psychologists.acceptingNewClients, true)
                )
            )
            .orderBy(asc(schema.servicePsychologists.position), asc(schema.psychologists.name));

        const psychIds = [...new Set(linkRows.map((r) => r.id))];
        const mediaRows = psychIds.length > 0
            ? await db
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
                .innerJoin(schema.mediaObjects, eq(schema.mediaObjects.id, schema.mediaAttachments.mediaObjectId))
                .where(
                    and(
                        inArray(schema.mediaAttachments.psychologistId, psychIds),
                        eq(schema.mediaAttachments.role, 'profilePhoto'),
                        eq(schema.mediaObjects.lifecycle, 'active'),
                        sql`${schema.mediaAttachments.detachedAt} is null`
                    )
                )
            : [];

        const mediaByPsychId = new Map<string, PublicServiceMedia>();
        for (const m of mediaRows) {
            if (!m.psychologistId) continue;
            const ref = m.objectKey ?? m.publicUrl;
            if (!ref) continue;
            mediaByPsychId.set(m.psychologistId, {
                url: toMediaUrl(ref),
                width: m.width,
                height: m.height,
                alt: locale === 'en' ? m.altEn : m.altId
            });
        }

        const result = new Map<string, PublicServicePsychologistOption[]>();
        for (const row of linkRows) {
            if (!includeRatesUnavailableForCounseling) {
                const hasAnyModality = row.availableOnline || row.availableTbi || row.availableBsd || row.availableMalang;
                const hasAnyRate = row.onlineRate !== null || row.offlineRate !== null;
                if (!hasAnyModality || !hasAnyRate) continue;
            }

            const list = result.get(row.serviceId) ?? [];
            list.push({
                id: row.id,
                slug: row.slug,
                name: row.name,
                nickname: row.nickname,
                credential: row.credential,
                tier: row.tier,
                primaryBranch: row.primaryBranch,
                experienceYears: row.experienceYears,
                onlineRate: row.onlineRate ?? null,
                offlineRate: row.offlineRate ?? null,
                availableOnline: row.availableOnline,
                availableTbi: row.availableTbi,
                availableBsd: row.availableBsd,
                availableMalang: row.availableMalang,
                note: locale === 'en' ? (row.noteEn ?? row.noteId) : (row.noteId ?? row.noteEn),
                media: mediaByPsychId.get(row.id) ?? null
            });
            result.set(row.serviceId, list);
        }

        return result;
    };

    const computePriceRangeForService = (
        pricingModel: ServicePricingModel,
        variants: PublicServiceVariant[],
        eligiblePsychologists: PublicServicePsychologistOption[]
    ): PublicServiceVariantPricing => {
        if (pricingModel === 'free_external') {
            return {
                minAmount: 0,
                maxAmount: 0,
                isRange: false,
                variesByProvider: false,
                promoAmount: null,
                promoBadge: null,
                promoNote: null,
                programSlug: null
            };
        }

        if (pricingModel === 'price_on_request') {
            return emptyPricing(false);
        }

        if (pricingModel === 'psychologist_rate') {
            const amounts: number[] = [];
            for (const p of eligiblePsychologists) {
                if (p.availableOnline && p.onlineRate !== null) amounts.push(p.onlineRate);
                if ((p.availableTbi || p.availableBsd || p.availableMalang) && p.offlineRate !== null) {
                    amounts.push(p.offlineRate);
                }
            }
            if (amounts.length === 0) return emptyPricing(true);
            const minAmount = Math.min(...amounts);
            const maxAmount = Math.max(...amounts);
            return {
                minAmount,
                maxAmount,
                isRange: maxAmount > minAmount,
                variesByProvider: true,
                promoAmount: null,
                promoBadge: null,
                promoNote: null,
                programSlug: null
            };
        }

        const effectiveAmounts: number[] = [];
        const baseAmounts: number[] = [];
        let lowestPromo: { promoAmount: number; promoBadge: string | null; promoNote: string | null; programSlug: string | null } | null = null;

        for (const variant of variants) {
            if (variant.priceOnRequest) continue;
            const { minAmount, maxAmount, promoAmount, promoBadge, promoNote, programSlug } = variant.pricing;
            if (minAmount !== null) {
                baseAmounts.push(minAmount);
                effectiveAmounts.push(promoAmount !== null && promoAmount < minAmount ? promoAmount : minAmount);
            }
            if (maxAmount !== null) {
                baseAmounts.push(maxAmount);
                effectiveAmounts.push(maxAmount);
            }
            if (promoAmount !== null && minAmount !== null && promoAmount < minAmount) {
                if (!lowestPromo || promoAmount < lowestPromo.promoAmount) {
                    lowestPromo = { promoAmount, promoBadge, promoNote, programSlug };
                }
            }
        }

        if (baseAmounts.length === 0) return emptyPricing(false);
        const minBase = Math.min(...baseAmounts);
        const maxBase = Math.max(...baseAmounts);
        return {
            minAmount: minBase,
            maxAmount: maxBase,
            isRange: maxBase > minBase,
            variesByProvider: false,
            promoAmount: lowestPromo?.promoAmount ?? null,
            promoBadge: lowestPromo?.promoBadge ?? null,
            promoNote: lowestPromo?.promoNote ?? null,
            programSlug: lowestPromo?.programSlug ?? null
        };
    };

    const buildVariantsForServices = async (
        db: PostgresJsDatabase<typeof schema>,
        serviceRows: Array<{ id: string; pricingModel: ServicePricingModel }>,
        locale: 'id' | 'en',
        promoByVariantId: Map<string, { promoAmount: number; promoBadge: string | null; promoNote: string | null; programSlug: string }>,
        psychologistsByServiceId: Map<string, PublicServicePsychologistOption[]>
    ) => {
        const serviceIds = serviceRows.map((s) => s.id);
        if (serviceIds.length === 0) return new Map<string, PublicServiceVariant[]>();

        const variantRows = await db
            .select({
                id: schema.serviceVariants.id,
                serviceId: schema.serviceVariants.serviceId,
                slug: schema.serviceVariants.slug,
                position: schema.serviceVariants.position,
                modalitiesJson: schema.serviceVariants.modalitiesJson,
                branch: schema.serviceVariants.branch,
                priceOnRequest: schema.serviceVariants.priceOnRequest,
                name: schema.serviceVariantTranslations.name,
                description: schema.serviceVariantTranslations.description,
                unitLabel: schema.serviceVariantTranslations.unitLabel,
                ageRangeLabel: schema.serviceVariantTranslations.ageRangeLabel,
                durationLabel: schema.serviceVariantTranslations.durationLabel,
                amount: schema.servicePublicPrices.amount,
                amountMax: schema.servicePublicPrices.amountMax
            })
            .from(schema.serviceVariants)
            .innerJoin(
                schema.serviceVariantTranslations,
                and(
                    eq(schema.serviceVariantTranslations.variantId, schema.serviceVariants.id),
                    eq(schema.serviceVariantTranslations.locale, locale)
                )
            )
            .leftJoin(schema.servicePublicPrices, eq(schema.servicePublicPrices.variantId, schema.serviceVariants.id))
            .where(
                and(
                    inArray(schema.serviceVariants.serviceId, serviceIds),
                    eq(schema.serviceVariants.status, 'published'),
                    eq(schema.serviceVariants.visibility, 'public')
                )
            )
            .orderBy(asc(schema.serviceVariants.position), asc(schema.serviceVariants.slug));

        const pricingModelByServiceId = new Map(serviceRows.map((s) => [s.id, s.pricingModel]));
        const variantsByServiceId = new Map<string, PublicServiceVariant[]>();

        for (const row of variantRows) {
            const pricingModel = pricingModelByServiceId.get(row.serviceId);
            const modalities = parseModalities(row.modalitiesJson);
            const promo = promoByVariantId.get(row.id);

            let pricing: PublicServiceVariantPricing;
            if (row.priceOnRequest || pricingModel === 'price_on_request') {
                pricing = emptyPricing(false);
            } else if (pricingModel === 'psychologist_rate') {
                const psychs = psychologistsByServiceId.get(row.serviceId) ?? [];
                const isOffline = modalities.includes('offline') && !modalities.includes('online');
                const rates = psychs
                    .map((p) => (isOffline ? (p.availableTbi || p.availableBsd || p.availableMalang ? p.offlineRate : null) : (p.availableOnline ? p.onlineRate : null)))
                    .filter((rate): rate is number => rate !== null);
                const minAmount = rates.length > 0 ? Math.min(...rates) : null;
                const maxAmount = rates.length > 0 ? Math.max(...rates) : null;
                pricing = {
                    minAmount,
                    maxAmount,
                    isRange: minAmount !== null && maxAmount !== null && maxAmount > minAmount,
                    variesByProvider: true,
                    promoAmount: null,
                    promoBadge: null,
                    promoNote: null,
                    programSlug: null
                };
            } else {
                const baseAmount = row.amount ?? null;
                const baseMax = row.amountMax ?? baseAmount;
                const promoApplies = promo && baseAmount !== null && promo.promoAmount < baseAmount;
                pricing = {
                    minAmount: baseAmount,
                    maxAmount: baseMax,
                    isRange: baseAmount !== null && baseMax !== null && baseMax > baseAmount,
                    variesByProvider: false,
                    promoAmount: promoApplies ? promo.promoAmount : null,
                    promoBadge: promoApplies ? promo.promoBadge : null,
                    promoNote: promoApplies ? promo.promoNote : null,
                    programSlug: promoApplies ? promo.programSlug : null
                };
            }

            const branch =
                row.branch === 'tbi' || row.branch === 'bsd' || row.branch === 'malang'
                    ? row.branch
                    : null;

            const list = variantsByServiceId.get(row.serviceId) ?? [];
            list.push({
                id: row.id,
                slug: row.slug,
                position: row.position,
                name: row.name,
                description: row.description,
                unitLabel: row.unitLabel,
                ageRangeLabel: row.ageRangeLabel,
                durationLabel: row.durationLabel,
                modalities,
                branch,
                priceOnRequest: row.priceOnRequest,
                pricing
            });
            variantsByServiceId.set(row.serviceId, list);
        }

        return variantsByServiceId;
    };

    const loadServiceMedia = async (
        db: PostgresJsDatabase<typeof schema>,
        serviceIds: string[],
        locale: 'id' | 'en'
    ) => {
        if (serviceIds.length === 0) {
            return {
                cardMediaByServiceId: new Map<string, PublicServiceMedia>(),
                reportPreviewsByServiceId: new Map<string, PublicServiceMedia[]>()
            };
        }

        const rows = await db
            .select({
                serviceId: schema.mediaAttachments.serviceId,
                role: schema.mediaAttachments.role,
                position: schema.mediaAttachments.position,
                objectKey: schema.mediaObjects.objectKey,
                publicUrl: schema.mediaObjects.publicUrl,
                width: schema.mediaObjects.width,
                height: schema.mediaObjects.height,
                altId: schema.mediaObjects.altId,
                altEn: schema.mediaObjects.altEn
            })
            .from(schema.mediaAttachments)
            .innerJoin(schema.mediaObjects, eq(schema.mediaObjects.id, schema.mediaAttachments.mediaObjectId))
            .where(
                and(
                    inArray(schema.mediaAttachments.serviceId, serviceIds),
                    eq(schema.mediaObjects.lifecycle, 'active'),
                    sql`${schema.mediaAttachments.detachedAt} is null`
                )
            )
            .orderBy(asc(schema.mediaAttachments.position));

        const cardMediaByServiceId = new Map<string, PublicServiceMedia>();
        const reportPreviewsByServiceId = new Map<string, PublicServiceMedia[]>();

        for (const row of rows) {
            if (!row.serviceId) continue;
            const ref = row.objectKey ?? row.publicUrl;
            if (!ref) continue;
            const item: PublicServiceMedia = {
                url: toMediaUrl(ref),
                width: row.width,
                height: row.height,
                alt: locale === 'en' ? row.altEn : row.altId
            };
            if (row.role === 'cardCover' && !cardMediaByServiceId.has(row.serviceId)) {
                cardMediaByServiceId.set(row.serviceId, item);
            } else if (row.role === 'reportPreview') {
                const list = reportPreviewsByServiceId.get(row.serviceId) ?? [];
                list.push(item);
                reportPreviewsByServiceId.set(row.serviceId, list);
            }
        }

        return { cardMediaByServiceId, reportPreviewsByServiceId };
    };

    return {
        async listPublicCatalog(locale) {
            const todayWib = getTodayWibDate(now);
            const [categoryRows, subgroupRows, serviceRows, { activePrograms, promoByVariantId }] = await Promise.all([
                database
                    .select({
                        id: schema.serviceCategories.id,
                        slug: schema.serviceCategories.slug,
                        position: schema.serviceCategories.position,
                        isFree: schema.serviceCategories.isFree,
                        name: schema.serviceCategoryTranslations.name
                    })
                    .from(schema.serviceCategories)
                    .innerJoin(
                        schema.serviceCategoryTranslations,
                        and(
                            eq(schema.serviceCategoryTranslations.categoryId, schema.serviceCategories.id),
                            eq(schema.serviceCategoryTranslations.locale, locale)
                        )
                    )
                    .orderBy(asc(schema.serviceCategories.position)),
                database
                    .select({
                        id: schema.serviceSubgroups.id,
                        categoryId: schema.serviceSubgroups.categoryId,
                        slug: schema.serviceSubgroups.slug,
                        position: schema.serviceSubgroups.position,
                        name: schema.serviceSubgroupTranslations.name,
                        note: schema.serviceSubgroupTranslations.note
                    })
                    .from(schema.serviceSubgroups)
                    .innerJoin(
                        schema.serviceSubgroupTranslations,
                        and(
                            eq(schema.serviceSubgroupTranslations.subgroupId, schema.serviceSubgroups.id),
                            eq(schema.serviceSubgroupTranslations.locale, locale)
                        )
                    )
                    .orderBy(asc(schema.serviceSubgroups.position)),
                database
                    .select({
                        id: schema.services.id,
                        slug: schema.services.slug,
                        categoryId: schema.services.categoryId,
                        subgroupId: schema.services.subgroupId,
                        serviceType: schema.services.serviceType,
                        pricingModel: schema.services.pricingModel,
                        appliesNewClientFee: schema.services.appliesNewClientFee,
                        isAssessment: schema.services.isAssessment,
                        isFeaturedSpotlight: schema.services.isFeaturedSpotlight,
                        position: schema.services.position,
                        externalUrl: schema.services.externalUrl,
                        defaultConcernId: schema.services.defaultConcernId,
                        defaultClientCategory: schema.services.defaultClientCategory,
                        audiencesJson: schema.services.audiencesJson,
                        demoConfigJson: schema.services.demoConfigJson,
                        name: schema.serviceTranslations.name,
                        badge: schema.serviceTranslations.badge,
                        shortSummary: schema.serviceTranslations.shortSummary,
                        benefit: schema.serviceTranslations.benefit
                    })
                    .from(schema.services)
                    .innerJoin(
                        schema.serviceTranslations,
                        and(
                            eq(schema.serviceTranslations.serviceId, schema.services.id),
                            eq(schema.serviceTranslations.locale, locale)
                        )
                    )
                    .where(
                        and(
                            eq(schema.services.status, 'published'),
                            eq(schema.services.visibility, 'public')
                        )
                    )
                    .orderBy(asc(schema.services.position), asc(schema.services.slug)),
                loadActivePrograms(database, locale, todayWib)
            ]);

            const categoryById = new Map<string, PublicServiceCategory>(categoryRows.map((c) => [c.id, c]));
            const subgroupById = new Map<string, PublicServiceSubgroup>(subgroupRows.map((s) => [s.id, s]));

            const counselingServiceIds = serviceRows
                .filter((s) => s.pricingModel === 'psychologist_rate')
                .map((s) => s.id);
            const fixedServiceIds = serviceRows
                .filter((s) => s.pricingModel !== 'psychologist_rate')
                .map((s) => s.id);

            const [counselingPsychs, fixedPsychs, { cardMediaByServiceId }] = await Promise.all([
                loadEligiblePsychologists(database, counselingServiceIds, locale, false),
                loadEligiblePsychologists(database, fixedServiceIds, locale, true),
                loadServiceMedia(database, serviceRows.map((s) => s.id), locale)
            ]);

            const psychologistsByServiceId = new Map<string, PublicServicePsychologistOption[]>([
                ...counselingPsychs.entries(),
                ...fixedPsychs.entries()
            ]);

            const variantsByServiceId = await buildVariantsForServices(
                database,
                serviceRows,
                locale,
                promoByVariantId,
                psychologistsByServiceId
            );

            const services: PublicServiceSummary[] = serviceRows.map((row) => {
                const category = categoryById.get(row.categoryId);
                const subgroup = row.subgroupId ? subgroupById.get(row.subgroupId) : undefined;
                const variants = variantsByServiceId.get(row.id) ?? [];
                const eligiblePsychs = psychologistsByServiceId.get(row.id) ?? [];
                const modalitySet = new Set<ServiceModality>();
                let hasMalangBranch = false;

                for (const variant of variants) {
                    for (const mod of variant.modalities) modalitySet.add(mod);
                    if (variant.branch === 'malang') hasMalangBranch = true;
                }
                if (row.pricingModel === 'psychologist_rate') {
                    for (const psych of eligiblePsychs) {
                        if (psych.availableOnline) modalitySet.add('online');
                        if (psych.availableTbi || psych.availableBsd || psych.availableMalang) modalitySet.add('offline');
                        if (psych.availableMalang) hasMalangBranch = true;
                    }
                }

                return {
                    id: row.id,
                    slug: row.slug,
                    categoryId: row.categoryId,
                    categorySlug: category?.slug ?? '',
                    categoryName: category?.name ?? '',
                    subgroupId: row.subgroupId,
                    subgroupSlug: subgroup?.slug ?? null,
                    subgroupName: subgroup?.name ?? null,
                    serviceType: row.serviceType,
                    pricingModel: row.pricingModel,
                    appliesNewClientFee: row.appliesNewClientFee,
                    isAssessment: row.isAssessment,
                    isFeaturedSpotlight: row.isFeaturedSpotlight,
                    position: row.position,
                    name: row.name,
                    badge: row.badge,
                    shortSummary: row.shortSummary,
                    benefit: row.benefit,
                    audiences: parseStringArray(row.audiencesJson),
                    modalities: [...modalitySet],
                    hasMalangBranch,
                    priceRange: computePriceRangeForService(row.pricingModel, variants, eligiblePsychs),
                    cardMedia: cardMediaByServiceId.get(row.id) ?? null,
                    variants,
                    bookingPreset: buildBookingPreset(row),
                    demo: parseDemoConfig(row.demoConfigJson)
                };
            });

            return {
                locale,
                categories: categoryRows,
                subgroups: subgroupRows,
                activePrograms,
                services
            };
        },

        async getPublicBySlug(slug, locale) {
            const [row] = await database
                .select({
                    id: schema.services.id,
                    slug: schema.services.slug,
                    categoryId: schema.services.categoryId,
                    subgroupId: schema.services.subgroupId,
                    serviceType: schema.services.serviceType,
                    pricingModel: schema.services.pricingModel,
                    appliesNewClientFee: schema.services.appliesNewClientFee,
                    isAssessment: schema.services.isAssessment,
                    isFeaturedSpotlight: schema.services.isFeaturedSpotlight,
                    position: schema.services.position,
                    externalUrl: schema.services.externalUrl,
                    defaultConcernId: schema.services.defaultConcernId,
                    defaultClientCategory: schema.services.defaultClientCategory,
                    audiencesJson: schema.services.audiencesJson,
                    demoConfigJson: schema.services.demoConfigJson,
                    name: schema.serviceTranslations.name,
                    fullName: schema.serviceTranslations.fullName,
                    badge: schema.serviceTranslations.badge,
                    shortSummary: schema.serviceTranslations.shortSummary,
                    benefit: schema.serviceTranslations.benefit,
                    introduction: schema.serviceTranslations.introduction,
                    targetAudience: schema.serviceTranslations.targetAudience,
                    whatIsMeasured: schema.serviceTranslations.whatIsMeasured,
                    durationInfo: schema.serviceTranslations.durationInfo,
                    locationInfo: schema.serviceTranslations.locationInfo,
                    processStepsJson: schema.serviceTranslations.processStepsJson,
                    termsJson: schema.serviceTranslations.termsJson,
                    resultsExplanation: schema.serviceTranslations.resultsExplanation,
                    scientificBasis: schema.serviceTranslations.scientificBasis,
                    citationSummary: schema.serviceTranslations.citationSummary,
                    assessmentPurpose: schema.serviceTranslations.assessmentPurpose,
                    assessmentAspects: schema.serviceTranslations.assessmentAspects,
                    assessmentAgeRange: schema.serviceTranslations.assessmentAgeRange,
                    assessmentMethod: schema.serviceTranslations.assessmentMethod,
                    assessmentPrep: schema.serviceTranslations.assessmentPrep,
                    assessmentOutputFormat: schema.serviceTranslations.assessmentOutputFormat,
                    assessmentDimensionsJson: schema.serviceTranslations.assessmentDimensionsJson,
                    assessmentReportType: schema.serviceTranslations.assessmentReportType,
                    assessmentInterpretation: schema.serviceTranslations.assessmentInterpretation,
                    assessmentRecommendations: schema.serviceTranslations.assessmentRecommendations,
                    assessmentTurnaround: schema.serviceTranslations.assessmentTurnaround
                })
                .from(schema.services)
                .innerJoin(
                    schema.serviceTranslations,
                    and(
                        eq(schema.serviceTranslations.serviceId, schema.services.id),
                        eq(schema.serviceTranslations.locale, locale)
                    )
                )
                .where(
                    and(
                        eq(schema.services.slug, slug),
                        eq(schema.services.status, 'published'),
                        eq(schema.services.visibility, 'public')
                    )
                )
                .limit(1);

            if (!row) return null;

            const todayWib = getTodayWibDate(now);
            const [
                [category],
                subgroupRows,
                { promoByVariantId },
                psychologistsByServiceId,
                { cardMediaByServiceId, reportPreviewsByServiceId },
                deliverableRows,
                faqRows,
                referenceRows
            ] = await Promise.all([
                database
                    .select({
                        slug: schema.serviceCategories.slug,
                        name: schema.serviceCategoryTranslations.name
                    })
                    .from(schema.serviceCategories)
                    .innerJoin(
                        schema.serviceCategoryTranslations,
                        and(
                            eq(schema.serviceCategoryTranslations.categoryId, schema.serviceCategories.id),
                            eq(schema.serviceCategoryTranslations.locale, locale)
                        )
                    )
                    .where(eq(schema.serviceCategories.id, row.categoryId))
                    .limit(1),
                row.subgroupId
                    ? database
                        .select({
                            slug: schema.serviceSubgroups.slug,
                            name: schema.serviceSubgroupTranslations.name
                        })
                        .from(schema.serviceSubgroups)
                        .innerJoin(
                            schema.serviceSubgroupTranslations,
                            and(
                                eq(schema.serviceSubgroupTranslations.subgroupId, schema.serviceSubgroups.id),
                                eq(schema.serviceSubgroupTranslations.locale, locale)
                            )
                        )
                        .where(eq(schema.serviceSubgroups.id, row.subgroupId))
                        .limit(1)
                    : Promise.resolve([]),
                loadActivePrograms(database, locale, todayWib),
                loadEligiblePsychologists(
                    database,
                    [row.id],
                    locale,
                    row.pricingModel !== 'psychologist_rate'
                ),
                loadServiceMedia(database, [row.id], locale),
                database
                    .select({
                        id: schema.serviceDeliverables.id,
                        position: schema.serviceDeliverables.position,
                        variantSlugsJson: schema.serviceDeliverables.variantSlugsJson,
                        textId: schema.serviceDeliverables.textId,
                        textEn: schema.serviceDeliverables.textEn
                    })
                    .from(schema.serviceDeliverables)
                    .where(eq(schema.serviceDeliverables.serviceId, row.id))
                    .orderBy(asc(schema.serviceDeliverables.position)),
                database
                    .select({
                        id: schema.serviceFaqs.id,
                        position: schema.serviceFaqs.position,
                        questionId: schema.serviceFaqs.questionId,
                        questionEn: schema.serviceFaqs.questionEn,
                        answerId: schema.serviceFaqs.answerId,
                        answerEn: schema.serviceFaqs.answerEn
                    })
                    .from(schema.serviceFaqs)
                    .where(eq(schema.serviceFaqs.serviceId, row.id))
                    .orderBy(asc(schema.serviceFaqs.position)),
                database
                    .select({
                        id: schema.serviceReferences.id,
                        code: schema.serviceReferences.code,
                        citationText: schema.serviceReferences.citationText,
                        doiUrl: schema.serviceReferences.doiUrl
                    })
                    .from(schema.serviceReferenceLinks)
                    .innerJoin(
                        schema.serviceReferences,
                        eq(schema.serviceReferences.id, schema.serviceReferenceLinks.referenceId)
                    )
                    .where(eq(schema.serviceReferenceLinks.serviceId, row.id))
                    .orderBy(asc(schema.serviceReferenceLinks.position))
            ]);

            const variantsByServiceId = await buildVariantsForServices(
                database,
                [row],
                locale,
                promoByVariantId,
                psychologistsByServiceId
            );

            const variants = variantsByServiceId.get(row.id) ?? [];
            const eligiblePsychologists = psychologistsByServiceId.get(row.id) ?? [];

            const modalitySet = new Set<ServiceModality>();
            let hasMalangBranch = false;
            for (const variant of variants) {
                for (const mod of variant.modalities) modalitySet.add(mod);
                if (variant.branch === 'malang') hasMalangBranch = true;
            }
            if (row.pricingModel === 'psychologist_rate') {
                for (const psych of eligiblePsychologists) {
                    if (psych.availableOnline) modalitySet.add('online');
                    if (psych.availableTbi || psych.availableBsd || psych.availableMalang) modalitySet.add('offline');
                    if (psych.availableMalang) hasMalangBranch = true;
                }
            }

            const deliverables: PublicServiceDeliverable[] = deliverableRows.map((d) => ({
                id: d.id,
                position: d.position,
                variantSlugs: parseStringArray(d.variantSlugsJson),
                text: locale === 'en' ? d.textEn : d.textId
            }));

            const faqs: PublicServiceFaq[] = faqRows.map((f) => ({
                id: f.id,
                position: f.position,
                question: locale === 'en' ? f.questionEn : f.questionId,
                answer: locale === 'en' ? f.answerEn : f.answerId
            }));

            const references: PublicServiceReference[] = referenceRows;

            const assessmentDims = parseStringArray(row.assessmentDimensionsJson);
            const hasAssessmentDetails = Boolean(
                row.isAssessment
                || row.assessmentPurpose
                || row.assessmentAspects
                || row.assessmentAgeRange
                || row.assessmentMethod
                || row.assessmentPrep
                || row.assessmentOutputFormat
                || assessmentDims.length > 0
                || row.assessmentReportType
                || row.assessmentInterpretation
                || row.assessmentRecommendations
                || row.assessmentTurnaround
            );

            const subgroup = subgroupRows[0];

            return {
                id: row.id,
                slug: row.slug,
                categoryId: row.categoryId,
                categorySlug: category?.slug ?? '',
                categoryName: category?.name ?? '',
                subgroupId: row.subgroupId,
                subgroupSlug: subgroup?.slug ?? null,
                subgroupName: subgroup?.name ?? null,
                serviceType: row.serviceType,
                pricingModel: row.pricingModel,
                appliesNewClientFee: row.appliesNewClientFee,
                isAssessment: row.isAssessment,
                isFeaturedSpotlight: row.isFeaturedSpotlight,
                position: row.position,
                name: row.name,
                fullName: row.fullName,
                badge: row.badge,
                shortSummary: row.shortSummary,
                benefit: row.benefit,
                introduction: row.introduction,
                targetAudience: row.targetAudience,
                whatIsMeasured: row.whatIsMeasured,
                durationInfo: row.durationInfo,
                locationInfo: row.locationInfo,
                processSteps: parseStringArray(row.processStepsJson),
                terms: parseStringArray(row.termsJson),
                resultsExplanation: row.resultsExplanation,
                scientificBasis: row.scientificBasis,
                citationSummary: row.citationSummary,
                audiences: parseStringArray(row.audiencesJson),
                modalities: [...modalitySet],
                hasMalangBranch,
                priceRange: computePriceRangeForService(row.pricingModel, variants, eligiblePsychologists),
                cardMedia: cardMediaByServiceId.get(row.id) ?? null,
                reportPreviews: reportPreviewsByServiceId.get(row.id) ?? [],
                variants,
                eligiblePsychologists,
                deliverables,
                faqs,
                references,
                assessmentDetails: hasAssessmentDetails
                    ? {
                        purpose: row.assessmentPurpose,
                        aspects: row.assessmentAspects,
                        ageRange: row.assessmentAgeRange,
                        method: row.assessmentMethod,
                        preparation: row.assessmentPrep,
                        outputFormat: row.assessmentOutputFormat,
                        dimensions: assessmentDims,
                        reportType: row.assessmentReportType,
                        interpretation: row.assessmentInterpretation,
                        recommendations: row.assessmentRecommendations,
                        turnaround: row.assessmentTurnaround
                    }
                    : null,
                bookingPreset: buildBookingPreset(row),
                demo: parseDemoConfig(row.demoConfigJson)
            };
        },

        async resolveBookingServiceSelection({ serviceSlug, variantSlug, consultationMode, location, tx }) {
            const db = tx ?? database;
            const [service] = await db
                .select({
                    id: schema.services.id,
                    slug: schema.services.slug,
                    serviceType: schema.services.serviceType,
                    pricingModel: schema.services.pricingModel,
                    appliesNewClientFee: schema.services.appliesNewClientFee,
                    nameId: schema.serviceTranslations.name
                })
                .from(schema.services)
                .innerJoin(
                    schema.serviceTranslations,
                    and(
                        eq(schema.serviceTranslations.serviceId, schema.services.id),
                        eq(schema.serviceTranslations.locale, 'id')
                    )
                )
                .where(
                    and(
                        eq(schema.services.slug, serviceSlug),
                        eq(schema.services.status, 'published'),
                        eq(schema.services.visibility, 'public')
                    )
                )
                .limit(1);

            if (!service || service.serviceType !== 'layanan') {
                return { ok: false, status: 404, message: 'Layanan yang dipilih tidak ditemukan atau belum tersedia.' };
            }

            if (service.pricingModel === 'free_external') {
                return { ok: false, status: 400, message: 'Layanan ini dikerjakan langsung secara mandiri tanpa reservasi jadwal.' };
            }

            const variantRows = await db
                .select({
                    id: schema.serviceVariants.id,
                    slug: schema.serviceVariants.slug,
                    modalitiesJson: schema.serviceVariants.modalitiesJson,
                    branch: schema.serviceVariants.branch,
                    priceOnRequest: schema.serviceVariants.priceOnRequest,
                    nameId: schema.serviceVariantTranslations.name,
                    baseAmount: schema.servicePublicPrices.amount
                })
                .from(schema.serviceVariants)
                .innerJoin(
                    schema.serviceVariantTranslations,
                    and(
                        eq(schema.serviceVariantTranslations.variantId, schema.serviceVariants.id),
                        eq(schema.serviceVariantTranslations.locale, 'id')
                    )
                )
                .leftJoin(schema.servicePublicPrices, eq(schema.servicePublicPrices.variantId, schema.serviceVariants.id))
                .where(
                    and(
                        eq(schema.serviceVariants.serviceId, service.id),
                        eq(schema.serviceVariants.status, 'published'),
                        eq(schema.serviceVariants.visibility, 'public')
                    )
                )
                .orderBy(asc(schema.serviceVariants.position));

            let selectedVariant = variantSlug
                ? variantRows.find((v) => v.slug === variantSlug)
                : undefined;

            if (variantSlug && !selectedVariant) {
                return { ok: false, status: 404, message: 'Paket/varian layanan yang dipilih tidak ditemukan.' };
            }

            if (!selectedVariant && variantRows.length > 0) {
                selectedVariant = variantRows.find((v) => {
                    const mods = parseModalities(v.modalitiesJson);
                    const modOk = mods.length === 0 || mods.includes(consultationMode);
                    const branchOk = !v.branch || consultationMode !== 'offline' || v.branch === location;
                    return modOk && branchOk;
                }) ?? variantRows[0];
            }

            if (selectedVariant) {
                const mods = parseModalities(selectedVariant.modalitiesJson);
                if (mods.length > 0 && !mods.includes(consultationMode)) {
                    return {
                        ok: false,
                        status: 400,
                        message: `Paket layanan ini hanya tersedia untuk sesi ${mods.join(' / ')}.`
                    };
                }
                if (selectedVariant.branch && consultationMode === 'offline' && location !== selectedVariant.branch) {
                    return {
                        ok: false,
                        status: 400,
                        message: `Paket layanan ini khusus untuk cabang ${selectedVariant.branch.toUpperCase()}.`
                    };
                }
            }

            let fixedBaseRate: number | null = null;
            if (service.pricingModel === 'fixed_variant' && selectedVariant && !selectedVariant.priceOnRequest) {
                const todayWib = getTodayWibDate(now);
                const { promoByVariantId } = await loadActivePrograms(db, 'id', todayWib);
                const promo = promoByVariantId.get(selectedVariant.id);
                const baseAmount = selectedVariant.baseAmount ?? 0;
                fixedBaseRate = promo && promo.promoAmount < baseAmount ? promo.promoAmount : baseAmount;
            } else if (service.pricingModel === 'price_on_request') {
                fixedBaseRate = 0;
            }

            const linkedPsychRows = await db
                .select({ psychologistId: schema.servicePsychologists.psychologistId })
                .from(schema.servicePsychologists)
                .where(eq(schema.servicePsychologists.serviceId, service.id));

            return {
                ok: true,
                serviceId: service.id,
                serviceVariantId: selectedVariant?.id ?? null,
                serviceNameSnapshot: service.nameId,
                variantNameSnapshot: selectedVariant?.nameId ?? null,
                pricingModel: service.pricingModel,
                appliesNewClientFee: service.appliesNewClientFee,
                fixedBaseRate,
                eligiblePsychologistIds: linkedPsychRows.map((r) => r.psychologistId)
            };
        }
    };
};
