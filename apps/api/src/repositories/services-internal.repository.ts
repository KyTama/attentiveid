import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    buildInternalLedgerCsv,
    computeServiceMargin,
    getServiceBookingDefaults,
    type InternalAuditLogItem,
    type InternalCompletenessCheck,
    type InternalCostKind,
    type InternalCostRecord,
    type InternalDataIssueRecord,
    type InternalLedgerRow,
    type InternalOpsSettingsRecord,
    type InternalPriceStatus,
    type InternalProductItem,
    type InternalProgramRecord,
    type InternalPsychologistMatrixRow,
    type InternalVariantRow,
    type PublicServiceDetail,
    type PublicServiceMedia,
    type PublicServiceProgram,
    type PublicServicePsychologistOption,
    type PublicServiceVariant,
    type ServiceBranch,
    type ServiceDataIssueStatus,
    type ServiceDemoConfig,
    type ServiceLifecycleStatus,
    type ServiceModality,
    type ServicePricingModel,
    type ServiceProgramStatus,
    type ServiceProgramType,
    type ServicesAdminOverviewResponse,
    type ServiceType,
    type ServiceVisibility,
    type SuperadminPreviewCatalogResponse,
    type SuperadminPreviewServiceDetail
} from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import * as schema from '../db/schema';
import { getTodayWibDate } from './services.repository';

export interface AdminActor {
    id: string;
    email: string;
}

export interface UpsertServicePayload {
    id?: string;
    slug: string;
    categorySlug: string;
    subgroupSlug?: string | null;
    serviceType: ServiceType;
    pricingModel: ServicePricingModel;
    status: ServiceLifecycleStatus;
    visibility: ServiceVisibility;
    appliesNewClientFee: boolean;
    isAssessment: boolean;
    isFeaturedSpotlight: boolean;
    position?: number;
    externalUrl?: string | null;
    defaultConcernId?: string | null;
    defaultClientCategory?: string | null;
    audiences?: string[];
    nameId: string;
    nameEn?: string;
    fullNameId?: string | null;
    fullNameEn?: string | null;
    badgeId?: string | null;
    badgeEn?: string | null;
    shortSummaryId?: string | null;
    shortSummaryEn?: string | null;
    benefitId?: string | null;
    benefitEn?: string | null;
    introductionId?: string | null;
    introductionEn?: string | null;
    targetAudienceId?: string | null;
    targetAudienceEn?: string | null;
    whatIsMeasuredId?: string | null;
    whatIsMeasuredEn?: string | null;
    durationInfoId?: string | null;
    durationInfoEn?: string | null;
    locationInfoId?: string | null;
    locationInfoEn?: string | null;
    resultsExplanationId?: string | null;
    resultsExplanationEn?: string | null;
    scientificBasisId?: string | null;
    scientificBasisEn?: string | null;
    processStepsId?: string[];
    processStepsEn?: string[];
    termsId?: string[];
    termsEn?: string[];
    linkedPsychologistSlugs?: string[];
    variants?: {
        id?: string;
        slug: string;
        status: ServiceLifecycleStatus;
        visibility: ServiceVisibility;
        nameId: string;
        nameEn?: string;
        descriptionId?: string | null;
        descriptionEn?: string | null;
        unitLabelId?: string | null;
        unitLabelEn?: string | null;
        durationLabelId?: string | null;
        durationLabelEn?: string | null;
        modalities: ServiceModality[];
        branch?: ServiceBranch | null;
        priceOnRequest?: boolean;
        publicPriceAmount?: number | null;
        publicPriceMax?: number | null;
    }[];
}

export interface UpsertInternalCostPayload {
    serviceId: string;
    variantId?: string | null;
    psychologistId?: string | null;
    recordKind: InternalCostKind;
    recordStatus: InternalPriceStatus;
    amount: number | null;
    amountMax?: number | null;
    unitLabel?: string | null;
    effectiveDate?: string | null;
    label?: string | null;
    note?: string | null;
    promoteToBerlaku?: boolean;
}

export interface SaveProgramPayload {
    id?: string;
    slug: string;
    programType: ServiceProgramType;
    status: ServiceProgramStatus;
    startsOn: string;
    endsOn: string;
    nameId: string;
    nameEn?: string;
    badgeId?: string | null;
    badgeEn?: string | null;
    prices: {
        variantId: string;
        promoAmount: number;
        noteId?: string | null;
        noteEn?: string | null;
    }[];
}

export interface UpdatePsychologistMatrixPayload {
    onlineRate: number | null;
    offlineRate: number | null;
    availableOnline: boolean;
    availableTbi: boolean;
    availableBsd: boolean;
    availableMalang: boolean;
    acceptingNewClients: boolean;
    linkedServiceSlugs: string[];
}

const parseJsonArray = (raw: string | null | undefined): string[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
        return [];
    }
};

const parseDemoConfig = (raw: string | null | undefined): ServiceDemoConfig | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as { tasks?: unknown; aaa?: unknown; reportKey?: unknown };
        const tasks = Array.isArray(parsed.tasks)
            ? parsed.tasks.filter(
                (t): t is ServiceDemoConfig['tasks'][number] =>
                    t === 'cpt' || t === 'sst' || t === 'nb' || t === 'gng'
            )
            : [];
        return {
            tasks,
            aaa: Boolean(parsed.aaa),
            reportKey: typeof parsed.reportKey === 'string' ? parsed.reportKey : null
        };
    } catch {
        return null;
    }
};

const toMediaUrl = (ref: string) => (ref.startsWith('media/') ? `/${ref}` : ref);

const parseIssueRefs = (raw: string | null | undefined): InternalDataIssueRecord['refs'] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const defaultSettings: InternalOpsSettingsRecord = {
    marginThreshold: 30,
    assumptions: {
        feePsikologPerJam: 500_000,
        gatewayPct: 3,
        iklanTesPct: 20,
        iklanExpertPct: 10,
        feeHaykal: 0
    }
};

export interface ServicesInternalRepository {
    getOverviewAndCatalog(): Promise<ServicesAdminOverviewResponse>;
    listSuperadminPreviewCatalog(locale: 'id' | 'en'): Promise<SuperadminPreviewCatalogResponse>;
    getSuperadminPreviewBySlug(slug: string, locale: 'id' | 'en'): Promise<SuperadminPreviewServiceDetail | null>;
    upsertService(actor: AdminActor, payload: UpsertServicePayload): Promise<{ id: string; slug: string }>;
    duplicateService(actor: AdminActor, serviceId: string): Promise<{ id: string; slug: string } | null>;
    upsertInternalCost(actor: AdminActor, payload: UpsertInternalCostPayload): Promise<{ id: string }>;
    saveProgram(actor: AdminActor, payload: SaveProgramPayload): Promise<{ id: string }>;
    updateProgramStatus(actor: AdminActor, programId: string, status: ServiceProgramStatus): Promise<boolean>;
    updatePsychologistMatrix(
        actor: AdminActor,
        psychologistId: string,
        payload: UpdatePsychologistMatrixPayload
    ): Promise<boolean>;
    updateIssueStatus(
        actor: AdminActor,
        issueId: string,
        status: ServiceDataIssueStatus,
        resolution?: string | null
    ): Promise<boolean>;
    exportLedgerCsv(): Promise<string>;
}

export const createServicesInternalRepository = (
    database: PostgresJsDatabase<typeof schema> = defaultDb,
    options: { now?: () => Date } = {}
): ServicesInternalRepository => {
    const now = options.now ?? (() => new Date());

    const appendAuditLog = async (
        tx: PostgresJsDatabase<typeof schema>,
        actor: AdminActor,
        action: string,
        entityType: string,
        entitySlug: string | null,
        summary: string
    ) => {
        await tx.insert(schema.serviceAuditLogs).values({
            actorUserId: actor.id,
            actorEmail: actor.email,
            action,
            entityType,
            entitySlug,
            summary
        });
    };

    const loadAllCoreState = async () => {
        const [
            categoryRows,
            categoryTransRows,
            subgroupRows,
            subgroupTransRows,
            serviceRows,
            serviceTransRows,
            variantRows,
            variantTransRows,
            publicPriceRows,
            costRows,
            programRows,
            programTransRows,
            programPriceRows,
            psychRows,
            psychProfileRows,
            servicePsychRows,
            deliverableRows,
            faqRows,
            issueRows,
            mediaRows,
            settingsRows,
            auditRows
        ] = await Promise.all([
            database.select().from(schema.serviceCategories).orderBy(asc(schema.serviceCategories.position)),
            database.select().from(schema.serviceCategoryTranslations),
            database.select().from(schema.serviceSubgroups).orderBy(asc(schema.serviceSubgroups.position)),
            database.select().from(schema.serviceSubgroupTranslations),
            database.select().from(schema.services).orderBy(asc(schema.services.position), asc(schema.services.slug)),
            database.select().from(schema.serviceTranslations),
            database.select().from(schema.serviceVariants).orderBy(asc(schema.serviceVariants.position), asc(schema.serviceVariants.slug)),
            database.select().from(schema.serviceVariantTranslations),
            database.select().from(schema.servicePublicPrices),
            database.select().from(schema.serviceInternalCosts).orderBy(desc(schema.serviceInternalCosts.updatedAt)),
            database.select().from(schema.servicePrograms).orderBy(desc(schema.servicePrograms.startsOn)),
            database.select().from(schema.serviceProgramTranslations),
            database.select().from(schema.serviceProgramPrices),
            database.select().from(schema.psychologists).orderBy(asc(schema.psychologists.name)),
            database.select().from(schema.psychologistProfiles),
            database.select().from(schema.servicePsychologists).orderBy(asc(schema.servicePsychologists.position)),
            database.select().from(schema.serviceDeliverables).orderBy(asc(schema.serviceDeliverables.position)),
            database.select().from(schema.serviceFaqs).orderBy(asc(schema.serviceFaqs.position)),
            database.select().from(schema.serviceDataIssues).orderBy(asc(schema.serviceDataIssues.code)),
            database
                .select({
                    serviceId: schema.mediaAttachments.serviceId,
                    psychologistId: schema.mediaAttachments.psychologistId,
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
                        eq(schema.mediaObjects.lifecycle, 'active'),
                        sql`${schema.mediaAttachments.detachedAt} is null`
                    )
                )
                .orderBy(asc(schema.mediaAttachments.position)),
            database.select().from(schema.serviceOpsSettings).limit(1),
            database.select().from(schema.serviceAuditLogs).orderBy(desc(schema.serviceAuditLogs.createdAt)).limit(100)
        ]);

        return {
            categoryRows,
            categoryTransRows,
            subgroupRows,
            subgroupTransRows,
            serviceRows,
            serviceTransRows,
            variantRows,
            variantTransRows,
            publicPriceRows,
            costRows,
            programRows,
            programTransRows,
            programPriceRows,
            psychRows,
            psychProfileRows,
            servicePsychRows,
            deliverableRows,
            faqRows,
            issueRows,
            mediaRows,
            settingsRows,
            auditRows
        };
    };

    const resolveScopedCost = (
        costs: (typeof schema.serviceInternalCosts.$inferSelect)[],
        variantId: string,
        psychologistId: string | null,
        kind: InternalCostKind,
        status: InternalPriceStatus
    ) => {
        const scoped = costs.filter(
            (c) =>
                c.variantId === variantId &&
                c.recordKind === kind &&
                c.recordStatus === status &&
                (psychologistId === null ? c.psychologistId === null : c.psychologistId === psychologistId)
        );
        if (scoped.length > 0) return scoped;
        if (psychologistId !== null) {
            return costs.filter(
                (c) =>
                    c.variantId === variantId &&
                    c.recordKind === kind &&
                    c.recordStatus === status &&
                    c.psychologistId === null
            );
        }
        return [];
    };

    const getOverviewAndCatalog = async (): Promise<ServicesAdminOverviewResponse> => {
        const state = await loadAllCoreState();
        const todayWib = getTodayWibDate(now);

        const settingsRow = state.settingsRows[0];
        let parsedAssumptions = defaultSettings.assumptions;
        if (settingsRow?.assumptionsJson) {
            try {
                parsedAssumptions = { ...defaultSettings.assumptions, ...JSON.parse(settingsRow.assumptionsJson) };
            } catch {
                parsedAssumptions = defaultSettings.assumptions;
            }
        }
        const settings: InternalOpsSettingsRecord = {
            marginThreshold: settingsRow?.marginThreshold ?? defaultSettings.marginThreshold,
            assumptions: parsedAssumptions
        };

        const catTransMap = new Map<string, { id?: string; en?: string }>();
        for (const t of state.categoryTransRows) {
            const entry = catTransMap.get(t.categoryId) ?? {};
            entry[t.locale] = t.name;
            catTransMap.set(t.categoryId, entry);
        }
        const categories = state.categoryRows.map((c) => {
            const tr = catTransMap.get(c.id);
            return {
                id: c.id,
                slug: c.slug,
                position: c.position,
                isFree: c.isFree,
                name: tr?.id ?? tr?.en ?? c.slug,
                nameId: tr?.id ?? tr?.en ?? c.slug,
                nameEn: tr?.en ?? tr?.id ?? c.slug
            };
        });
        const categoryById = new Map(categories.map((c) => [c.id, c]));

        const sgTransMap = new Map<string, { id?: { name: string; note: string | null }; en?: { name: string; note: string | null } }>();
        for (const t of state.subgroupTransRows) {
            const entry = sgTransMap.get(t.subgroupId) ?? {};
            entry[t.locale] = { name: t.name, note: t.note ?? null };
            sgTransMap.set(t.subgroupId, entry);
        }
        const subgroups = state.subgroupRows.map((g) => {
            const tr = sgTransMap.get(g.id);
            return {
                id: g.id,
                categoryId: g.categoryId,
                slug: g.slug,
                position: g.position,
                name: tr?.id?.name ?? tr?.en?.name ?? g.slug,
                note: tr?.id?.note ?? tr?.en?.note ?? null,
                nameId: tr?.id?.name ?? tr?.en?.name ?? g.slug,
                nameEn: tr?.en?.name ?? tr?.id?.name ?? g.slug
            };
        });
        const subgroupById = new Map(subgroups.map((g) => [g.id, g]));

        const psychById = new Map(state.psychRows.map((p) => [p.id, p]));
        const profileByPsychId = new Map(state.psychProfileRows.map((p) => [p.psychologistId, p]));
        const publicPriceByVariantId = new Map(state.publicPriceRows.map((p) => [p.variantId, p]));

        const variantTransMap = new Map<string, { id?: typeof schema.serviceVariantTranslations.$inferSelect; en?: typeof schema.serviceVariantTranslations.$inferSelect }>();
        for (const vt of state.variantTransRows) {
            const entry = variantTransMap.get(vt.variantId) ?? {};
            entry[vt.locale] = vt;
            variantTransMap.set(vt.variantId, entry);
        }

        const serviceTransMap = new Map<string, { id?: typeof schema.serviceTranslations.$inferSelect; en?: typeof schema.serviceTranslations.$inferSelect }>();
        for (const st of state.serviceTransRows) {
            const entry = serviceTransMap.get(st.serviceId) ?? {};
            entry[st.locale] = st;
            serviceTransMap.set(st.serviceId, entry);
        }

        const variantsByServiceId = new Map<string, InternalVariantRow[]>();
        const variantLookup = new Map<string, { serviceId: string; row: typeof schema.serviceVariants.$inferSelect; trId?: typeof schema.serviceVariantTranslations.$inferSelect }>();
        for (const v of state.variantRows) {
            const tr = variantTransMap.get(v.id);
            const pubPrice = publicPriceByVariantId.get(v.id);
            variantLookup.set(v.id, { serviceId: v.serviceId, row: v, trId: tr?.id });
            const list = variantsByServiceId.get(v.serviceId) ?? [];
            list.push({
                id: v.id,
                slug: v.slug,
                position: v.position,
                status: v.status,
                visibility: v.visibility,
                nameId: tr?.id?.name ?? tr?.en?.name ?? v.slug,
                nameEn: tr?.en?.name ?? tr?.id?.name ?? v.slug,
                descriptionId: tr?.id?.description ?? null,
                descriptionEn: tr?.en?.description ?? null,
                unitLabelId: tr?.id?.unitLabel ?? null,
                unitLabelEn: tr?.en?.unitLabel ?? null,
                ageRangeLabelId: tr?.id?.ageRangeLabel ?? null,
                ageRangeLabelEn: tr?.en?.ageRangeLabel ?? null,
                durationLabelId: tr?.id?.durationLabel ?? null,
                durationLabelEn: tr?.en?.durationLabel ?? null,
                modalities: parseJsonArray(v.modalitiesJson).filter((m): m is ServiceModality => m === 'online' || m === 'offline'),
                branch: v.branch === 'tbi' || v.branch === 'bsd' || v.branch === 'malang' ? v.branch : null,
                priceOnRequest: v.priceOnRequest,
                publicPriceAmount: pubPrice?.amount ?? null,
                publicPriceMax: pubPrice?.amountMax ?? null,
                publicEffectiveDate: pubPrice?.effectiveDate ?? null
            });
            variantsByServiceId.set(v.serviceId, list);
        }

        const serviceById = new Map(state.serviceRows.map((s) => [s.id, s]));
        const linkedPsychSlugsByServiceId = new Map<string, string[]>();
        const linkedServiceSlugsByPsychId = new Map<string, string[]>();
        for (const link of state.servicePsychRows) {
            const psych = psychById.get(link.psychologistId);
            const svc = serviceById.get(link.serviceId);
            if (!psych || !svc) continue;
            const pList = linkedPsychSlugsByServiceId.get(link.serviceId) ?? [];
            pList.push(psych.slug);
            linkedPsychSlugsByServiceId.set(link.serviceId, pList);

            const sList = linkedServiceSlugsByPsychId.get(link.psychologistId) ?? [];
            sList.push(svc.slug);
            linkedServiceSlugsByPsychId.set(link.psychologistId, sList);
        }

        const cardUrlByServiceId = new Map<string, string>();
        for (const m of state.mediaRows) {
            if (m.serviceId && m.role === 'cardCover' && !cardUrlByServiceId.has(m.serviceId)) {
                const ref = m.objectKey ?? m.publicUrl;
                if (ref) cardUrlByServiceId.set(m.serviceId, toMediaUrl(ref));
            }
        }

        // Active & all programs
        const programTransMap = new Map<string, { id?: { name: string; badge: string | null }; en?: { name: string; badge: string | null } }>();
        for (const pt of state.programTransRows) {
            const entry = programTransMap.get(pt.programId) ?? {};
            entry[pt.locale] = { name: pt.name, badge: pt.badge ?? null };
            programTransMap.set(pt.programId, entry);
        }
        const activePromoByVariantId = new Map<string, { promoAmount: number; programName: string }>();
        const programPricesByProgramId = new Map<string, typeof state.programPriceRows>();
        for (const pp of state.programPriceRows) {
            const list = programPricesByProgramId.get(pp.programId) ?? [];
            list.push(pp);
            programPricesByProgramId.set(pp.programId, list);
        }

        for (const prog of state.programRows) {
            if (prog.status !== 'active' || prog.startsOn > todayWib || prog.endsOn < todayWib) continue;
            const progName = programTransMap.get(prog.id)?.id?.name ?? prog.slug;
            for (const pp of programPricesByProgramId.get(prog.id) ?? []) {
                const cur = activePromoByVariantId.get(pp.variantId);
                if (!cur || pp.promoAmount < cur.promoAmount) {
                    activePromoByVariantId.set(pp.variantId, { promoAmount: pp.promoAmount, programName: progName });
                }
            }
        }

        const parsedIssues: InternalDataIssueRecord[] = state.issueRows.map((i) => ({
            id: i.id,
            code: i.code,
            issueType: i.issueType === 'Perlu Dilengkapi' ? 'Perlu Dilengkapi' : 'Perlu Verifikasi',
            title: i.title,
            detail: i.detail,
            status: i.status === 'Selesai' ? 'Selesai' : 'Terbuka',
            resolution: i.resolution ?? null,
            refs: parseIssueRefs(i.refsJson),
            createdAt: i.createdAt,
            resolvedAt: i.resolvedAt ?? null
        }));

        const openIssuesByServiceSlug = new Map<string, number>();
        const serviceSlugByVariantId = new Map<string, string>();
        for (const v of state.variantRows) {
            const s = serviceById.get(v.serviceId);
            if (s) serviceSlugByVariantId.set(v.id, s.slug);
        }
        for (const issue of parsedIssues) {
            if (issue.status === 'Selesai') continue;
            const touchedSlugs = new Set<string>();
            for (const ref of issue.refs) {
                if (ref.entity === 'products') {
                    touchedSlugs.add(ref.id);
                } else if (ref.entity === 'variants') {
                    const matchedVariant = state.variantRows.find((vr) => vr.slug === ref.id);
                    if (matchedVariant) {
                        const sSlug = serviceSlugByVariantId.get(matchedVariant.id);
                        if (sSlug) touchedSlugs.add(sSlug);
                    }
                }
            }
            for (const slug of touchedSlugs) {
                openIssuesByServiceSlug.set(slug, (openIssuesByServiceSlug.get(slug) ?? 0) + 1);
            }
        }

        const ledgerRows: InternalLedgerRow[] = [];
        const lowestMarginByServiceId = new Map<string, number>();
        const lowestPriceByServiceId = new Map<string, number>();

        for (const s of state.serviceRows) {
            const tr = serviceTransMap.get(s.id)?.id;
            const cat = categoryById.get(s.categoryId);
            const vs = (variantsByServiceId.get(s.id) ?? []).filter((v) => v.status !== 'archived');
            const serviceCosts = state.costRows.filter((c) => c.serviceId === s.id);

            for (const v of vs) {
                const variantCostRows = serviceCosts.filter((c) => c.variantId === v.id);
                const explicitPsychIds = new Set(
                    variantCostRows.map((c) => c.psychologistId).filter((id): id is string => Boolean(id))
                );
                if (s.pricingModel === 'psychologist_rate') {
                    for (const link of state.servicePsychRows) {
                        if (link.serviceId === s.id) explicitPsychIds.add(link.psychologistId);
                    }
                }
                const scopes: (string | null)[] = explicitPsychIds.size > 0 ? [...explicitPsychIds] : [null];

                for (const psychId of scopes) {
                    const psych = psychId ? psychById.get(psychId) : undefined;
                    const profile = psychId ? profileByPsychId.get(psychId) : undefined;

                    let berlakuPrice: number | null = v.publicPriceAmount;
                    let berlakuPriceMax: number | null = v.publicPriceMax;
                    let priceSource: InternalLedgerRow['priceSource'] =
                        v.priceOnRequest
                            ? 'price_on_request'
                            : s.pricingModel === 'free_external'
                                ? 'free'
                                : 'service_public_prices';

                    if (s.pricingModel === 'psychologist_rate' && psych && profile) {
                        const isOffline = v.modalities.includes('offline') && !v.modalities.includes('online');
                        const isOnline = v.modalities.includes('online') && !v.modalities.includes('offline');
                        if (isOnline && profile.onlineRate !== null) {
                            berlakuPrice = profile.onlineRate;
                            berlakuPriceMax = profile.onlineRate;
                            priceSource = 'psychologist_profiles';
                        } else if (isOffline && profile.offlineRate !== null) {
                            berlakuPrice = profile.offlineRate;
                            berlakuPriceMax = profile.offlineRate;
                            priceSource = 'psychologist_profiles';
                        }
                    } else if (berlakuPrice === null) {
                        const fallbackHarga = resolveScopedCost(variantCostRows, v.id, psychId, 'harga', 'berlaku')[0];
                        if (fallbackHarga && fallbackHarga.amount !== null) {
                            berlakuPrice = fallbackHarga.amount;
                            berlakuPriceMax = fallbackHarga.amountMax ?? fallbackHarga.amount;
                        }
                    }

                    const feeRow = resolveScopedCost(variantCostRows, v.id, psychId, 'fee', 'berlaku')[0];
                    const biayaRow = resolveScopedCost(variantCostRows, v.id, psychId, 'biaya', 'berlaku')[0];
                    const feeAmount = feeRow?.amount ?? null;
                    const directCostAmount = biayaRow?.amount ?? 0;

                    const margin =
                        berlakuPrice !== null && berlakuPriceMax !== null && berlakuPriceMax > berlakuPrice
                            ? null
                            : computeServiceMargin(berlakuPrice, feeAmount, directCostAmount);

                    const promo = activePromoByVariantId.get(v.id);
                    const promoAmount = promo && berlakuPrice !== null && promo.promoAmount < berlakuPrice ? promo.promoAmount : null;
                    const promoMargin = promoAmount !== null ? computeServiceMargin(promoAmount, feeAmount, directCostAmount) : null;

                    const usulanAmounts = resolveScopedCost(variantCostRows, v.id, psychId, 'harga', 'usulan')
                        .map((r) => r.amount)
                        .filter((a): a is number => a !== null);
                    const historisCount =
                        resolveScopedCost(variantCostRows, v.id, psychId, 'harga', 'historis').length +
                        resolveScopedCost(variantCostRows, v.id, psychId, 'fee', 'historis').length;

                    if (margin !== null) {
                        const curMin = lowestMarginByServiceId.get(s.id);
                        if (curMin === undefined || margin.pct < curMin) {
                            lowestMarginByServiceId.set(s.id, margin.pct);
                        }
                    }
                    if (berlakuPrice !== null) {
                        const curPrice = lowestPriceByServiceId.get(s.id);
                        if (curPrice === undefined || berlakuPrice < curPrice) {
                            lowestPriceByServiceId.set(s.id, berlakuPrice);
                        }
                    }

                    const psychName = psych
                        ? psych.name
                        : (linkedPsychSlugsByServiceId.get(s.id) ?? [])
                            .map((slug) => state.psychRows.find((p) => p.slug === slug)?.name ?? slug)
                            .join(', ') || 'Tim Attentive';

                    ledgerRows.push({
                        key: `${v.id}:${psychId ?? 'general'}`,
                        serviceId: s.id,
                        serviceSlug: s.slug,
                        serviceName: tr?.name ?? s.slug,
                        categoryName: cat?.name ?? '',
                        serviceStatus: s.status,
                        visibility: s.visibility,
                        variantId: v.id,
                        variantSlug: v.slug,
                        variantName: v.nameId,
                        variantStatus: v.status,
                        unitLabel: v.unitLabelId,
                        psychologistId: psychId,
                        psychologistSlug: psych?.slug ?? null,
                        psychologistName: psychName,
                        berlakuPrice,
                        berlakuPriceMax,
                        priceSource,
                        feeAmount,
                        directCostAmount: biayaRow?.amount ?? null,
                        margin,
                        promoAmount,
                        promoProgramName: promo?.programName ?? null,
                        promoMargin,
                        usulanAmounts,
                        historisCount
                    });
                }
            }
        }

        const deliverablesByService = new Map<string, number>();
        for (const d of state.deliverableRows) {
            deliverablesByService.set(d.serviceId, (deliverablesByService.get(d.serviceId) ?? 0) + 1);
        }
        const faqsByService = new Map<string, number>();
        for (const f of state.faqRows) {
            faqsByService.set(f.serviceId, (faqsByService.get(f.serviceId) ?? 0) + 1);
        }

        const services: InternalProductItem[] = state.serviceRows.map((s) => {
            const trId = serviceTransMap.get(s.id)?.id;
            const trEn = serviceTransMap.get(s.id)?.en;
            const cat = categoryById.get(s.categoryId);
            const sg = s.subgroupId ? subgroupById.get(s.subgroupId) : undefined;
            const variants = variantsByServiceId.get(s.id) ?? [];
            const linkedSlugs = linkedPsychSlugsByServiceId.get(s.id) ?? [];
            const stepsId = parseJsonArray(trId?.processStepsJson);
            const activeVariants = variants.filter((v) => v.status !== 'archived');
            const serviceLedger = ledgerRows.filter((r) => r.serviceId === s.id);

            const checks: InternalCompletenessCheck[] = [
                { label: 'Nama dan kategori', ok: Boolean(trId?.name && s.categoryId) },
                { label: 'Ringkasan manfaat', ok: Boolean(trId?.benefit?.trim()) },
                { label: 'Deskripsi', ok: Boolean(trId?.introduction?.trim() || trId?.assessmentPurpose?.trim()) },
                { label: 'Untuk siapa', ok: Boolean(trId?.targetAudience?.trim() || parseJsonArray(s.audiencesJson).length > 0) },
                { label: 'Tahapan', ok: stepsId.length > 0 },
                { label: 'Durasi', ok: Boolean(trId?.durationInfo?.trim() || activeVariants.some((v) => Boolean(v.durationLabelId))) },
                { label: 'Yang diterima', ok: (deliverablesByService.get(s.id) ?? 0) > 0 },
                {
                    label: 'Harga Berlaku untuk semua varian',
                    ok: activeVariants.length > 0 && serviceLedger.some((r) => r.berlakuPrice !== null || s.pricingModel === 'free_external')
                },
                {
                    label: 'Fee penyedia',
                    ok: s.pricingModel === 'free_external' || serviceLedger.some((r) => r.feeAmount !== null)
                },
                { label: 'Penyedia terkonfirmasi', ok: linkedSlugs.length > 0 },
                { label: 'Gambar sampul', ok: cardUrlByServiceId.has(s.id) },
                { label: 'FAQ', ok: (faqsByService.get(s.id) ?? 0) > 0 }
            ];
            const doneCount = checks.filter((c) => c.ok).length;
            const completenessPct = Math.round((doneCount / checks.length) * 100);

            return {
                id: s.id,
                slug: s.slug,
                categoryId: s.categoryId,
                categorySlug: cat?.slug ?? '',
                categoryName: cat?.name ?? '',
                subgroupId: s.subgroupId,
                subgroupSlug: sg?.slug ?? null,
                subgroupName: sg?.name ?? null,
                serviceType: s.serviceType,
                pricingModel: s.pricingModel,
                status: s.status,
                visibility: s.visibility,
                appliesNewClientFee: s.appliesNewClientFee,
                isAssessment: s.isAssessment,
                isFeaturedSpotlight: s.isFeaturedSpotlight,
                position: s.position,
                externalUrl: s.externalUrl,
                defaultConcernId: s.defaultConcernId,
                defaultClientCategory: s.defaultClientCategory,
                audiences: parseJsonArray(s.audiencesJson),
                nameId: trId?.name ?? s.slug,
                nameEn: trEn?.name ?? trId?.name ?? s.slug,
                fullNameId: trId?.fullName ?? null,
                fullNameEn: trEn?.fullName ?? null,
                badgeId: trId?.badge ?? null,
                badgeEn: trEn?.badge ?? null,
                shortSummaryId: trId?.shortSummary ?? null,
                shortSummaryEn: trEn?.shortSummary ?? null,
                benefitId: trId?.benefit ?? null,
                benefitEn: trEn?.benefit ?? null,
                introductionId: trId?.introduction ?? null,
                introductionEn: trEn?.introduction ?? null,
                targetAudienceId: trId?.targetAudience ?? null,
                targetAudienceEn: trEn?.targetAudience ?? null,
                whatIsMeasuredId: trId?.whatIsMeasured ?? null,
                whatIsMeasuredEn: trEn?.whatIsMeasured ?? null,
                durationInfoId: trId?.durationInfo ?? null,
                durationInfoEn: trEn?.durationInfo ?? null,
                locationInfoId: trId?.locationInfo ?? null,
                locationInfoEn: trEn?.locationInfo ?? null,
                resultsExplanationId: trId?.resultsExplanation ?? null,
                resultsExplanationEn: trEn?.resultsExplanation ?? null,
                scientificBasisId: trId?.scientificBasis ?? null,
                scientificBasisEn: trEn?.scientificBasis ?? null,
                processStepsId: stepsId,
                processStepsEn: parseJsonArray(trEn?.processStepsJson),
                termsId: parseJsonArray(trId?.termsJson),
                termsEn: parseJsonArray(trEn?.termsJson),
                cardImageUrl: cardUrlByServiceId.get(s.id) ?? null,
                linkedPsychologistSlugs: linkedSlugs,
                variants,
                completenessPct,
                completenessChecks: checks,
                openIssuesCount: openIssuesByServiceSlug.get(s.slug) ?? 0,
                lowestMarginPct: lowestMarginByServiceId.get(s.id) ?? null,
                lowestPriceAmount: lowestPriceByServiceId.get(s.id) ?? null
            };
        });

        const costRecords: InternalCostRecord[] = state.costRows.map((c) => {
            const vInfo = c.variantId ? variantLookup.get(c.variantId) : undefined;
            const psych = c.psychologistId ? psychById.get(c.psychologistId) : undefined;
            return {
                id: c.id,
                legacyId: c.legacyId ?? null,
                serviceId: c.serviceId,
                variantId: c.variantId ?? null,
                variantSlug: vInfo?.row.slug ?? null,
                variantName: vInfo?.trId?.name ?? vInfo?.row.slug ?? null,
                psychologistId: c.psychologistId ?? null,
                psychologistSlug: psych?.slug ?? null,
                psychologistName: psych?.name ?? null,
                recordKind: c.recordKind as InternalCostKind,
                recordStatus: c.recordStatus as InternalPriceStatus,
                amount: c.amount ?? null,
                amountMax: c.amountMax ?? null,
                unitLabel: c.unitLabel ?? null,
                effectiveDate: c.effectiveDate ?? null,
                label: c.label ?? null,
                note: c.note ?? null,
                sourceMeta: c.sourceMetaJson,
                updatedAt: c.updatedAt
            };
        });

        const programs: InternalProgramRecord[] = state.programRows.map((prog) => {
            const tr = programTransMap.get(prog.id);
            const prices = (programPricesByProgramId.get(prog.id) ?? []).map((pp) => {
                const vInfo = variantLookup.get(pp.variantId);
                const svc = vInfo ? serviceById.get(vInfo.serviceId) : undefined;
                const svcName = svc ? (serviceTransMap.get(svc.id)?.id?.name ?? svc.slug) : '';
                const normalPrice = publicPriceByVariantId.get(pp.variantId)?.amount ?? null;
                const vCosts = state.costRows.filter((c) => c.variantId === pp.variantId);
                const feeAmount = vCosts.find((c) => c.recordKind === 'fee' && c.recordStatus === 'berlaku')?.amount ?? null;
                const directCostAmount = vCosts.find((c) => c.recordKind === 'biaya' && c.recordStatus === 'berlaku')?.amount ?? 0;

                return {
                    variantId: pp.variantId,
                    variantSlug: vInfo?.row.slug ?? pp.variantId,
                    serviceSlug: svc?.slug ?? '',
                    serviceName: svcName,
                    variantName: vInfo?.trId?.name ?? vInfo?.row.slug ?? '',
                    normalPrice,
                    promoAmount: pp.promoAmount,
                    noteId: pp.noteId ?? null,
                    noteEn: pp.noteEn ?? null,
                    feeAmount,
                    directCostAmount,
                    promoMargin: computeServiceMargin(pp.promoAmount, feeAmount, directCostAmount)
                };
            });

            return {
                id: prog.id,
                slug: prog.slug,
                programType: prog.programType,
                status: prog.status,
                startsOn: prog.startsOn,
                endsOn: prog.endsOn,
                nameId: tr?.id?.name ?? prog.slug,
                nameEn: tr?.en?.name ?? tr?.id?.name ?? prog.slug,
                badgeId: tr?.id?.badge ?? null,
                badgeEn: tr?.en?.badge ?? null,
                prices
            };
        });

        const psychologists: InternalPsychologistMatrixRow[] = state.psychRows.map((p) => {
            const prof = profileByPsychId.get(p.id);
            return {
                id: p.id,
                slug: p.slug,
                name: p.name,
                nickname: p.nickname,
                credential: prof?.credential ?? '',
                tier: p.tier,
                status: p.status,
                primaryBranch: p.primaryBranch,
                experienceYears: prof?.experienceYears ?? 0,
                acceptingNewClients: p.acceptingNewClients,
                onlineRate: prof?.onlineRate ?? null,
                offlineRate: prof?.offlineRate ?? null,
                availableOnline: prof?.availableOnline ?? false,
                availableTbi: prof?.availableTbi ?? false,
                availableBsd: prof?.availableBsd ?? false,
                availableMalang: prof?.availableMalang ?? false,
                linkedServiceSlugs: linkedServiceSlugsByPsychId.get(p.id) ?? []
            };
        });

        const byStatus: Record<ServiceLifecycleStatus, number> = {
            published: 0,
            draft: 0,
            inactive: 0,
            archived: 0
        };
        for (const svc of services) {
            byStatus[svc.status] += 1;
        }
        const avgCompletenessPct = services.length > 0
            ? Math.round(services.reduce((sum, svc) => sum + svc.completenessPct, 0) / services.length)
            : 0;
        const lowMarginCount = ledgerRows.filter(
            (r) => r.margin !== null && r.margin.pct < settings.marginThreshold
        ).length;

        const auditLogs: InternalAuditLogItem[] = state.auditRows.map((a) => ({
            id: a.id,
            actorEmail: a.actorEmail,
            action: a.action,
            entityType: a.entityType,
            entitySlug: a.entitySlug ?? null,
            summary: a.summary,
            createdAt: a.createdAt
        }));

        return {
            status: 'success',
            settings,
            stats: {
                totalServices: services.length,
                byStatus,
                internalVisibilityCount: services.filter((s) => s.visibility === 'internal').length,
                lowMarginCount,
                openIssuesCount: parsedIssues.filter((i) => i.status === 'Terbuka').length,
                avgCompletenessPct
            },
            categories,
            subgroups,
            services,
            ledgerRows,
            costRecords,
            programs,
            issues: parsedIssues,
            psychologists,
            auditLogs
        };
    };

    const listSuperadminPreviewCatalog = async (locale: 'id' | 'en'): Promise<SuperadminPreviewCatalogResponse> => {
        const overview = await getOverviewAndCatalog();
        const todayWib = getTodayWibDate(now);
        const activePrograms: PublicServiceProgram[] = overview.programs
            .filter((p) => p.status === 'active' && p.startsOn <= todayWib && p.endsOn >= todayWib)
            .map((p) => ({
                id: p.id,
                slug: p.slug,
                name: locale === 'en' ? p.nameEn : p.nameId,
                badge: locale === 'en' ? (p.badgeEn ?? p.badgeId) : (p.badgeId ?? p.badgeEn),
                programType: p.programType,
                startsOn: p.startsOn,
                endsOn: p.endsOn
            }));

        const state = await loadAllCoreState();
        const cardByServiceId = new Map<string, PublicServiceMedia>();
        for (const m of state.mediaRows) {
            if (m.serviceId && m.role === 'cardCover' && !cardByServiceId.has(m.serviceId)) {
                const ref = m.objectKey ?? m.publicUrl;
                if (ref) {
                    cardByServiceId.set(m.serviceId, {
                        url: toMediaUrl(ref),
                        width: m.width,
                        height: m.height,
                        alt: locale === 'en' ? m.altEn : m.altId
                    });
                }
            }
        }
        const rawSvcById = new Map(state.serviceRows.map((s) => [s.id, s]));

        const promoByVariant = new Map<string, { promoAmount: number; badge: string | null; note: string | null; slug: string }>();
        for (const p of overview.programs) {
            if (p.status !== 'active' || p.startsOn > todayWib || p.endsOn < todayWib) continue;
            for (const pp of p.prices) {
                const existing = promoByVariant.get(pp.variantId);
                if (!existing || pp.promoAmount < existing.promoAmount) {
                    promoByVariant.set(pp.variantId, {
                        promoAmount: pp.promoAmount,
                        badge: locale === 'en' ? (p.badgeEn ?? p.badgeId) : (p.badgeId ?? p.badgeEn),
                        note: locale === 'en' ? (pp.noteEn ?? pp.noteId) : (pp.noteId ?? pp.noteEn),
                        slug: p.slug
                    });
                }
            }
        }

        const services = overview.services.map((svc) => {
            const rawSvc = rawSvcById.get(svc.id);
            const svcLedger = overview.ledgerRows.filter((r) => r.serviceId === svc.id);
            const feeVals = svcLedger.map((r) => r.feeAmount).filter((x): x is number => x !== null);
            const costVals = svcLedger.map((r) => r.directCostAmount).filter((x): x is number => x !== null);

            const variants: PublicServiceVariant[] = svc.variants.map((v) => {
                const ledgerMatches = svcLedger.filter((r) => r.variantId === v.id && r.berlakuPrice !== null);
                const amounts = ledgerMatches.map((r) => r.berlakuPrice as number);
                const minAmount = amounts.length > 0 ? Math.min(...amounts) : v.publicPriceAmount;
                const maxAmount = amounts.length > 0 ? Math.max(...amounts) : (v.publicPriceMax ?? minAmount);
                const promo = promoByVariant.get(v.id);
                const promoValid = promo && minAmount !== null && promo.promoAmount < minAmount;
                return {
                    id: v.id,
                    slug: v.slug,
                    position: v.position,
                    name: locale === 'en' ? v.nameEn : v.nameId,
                    description: locale === 'en' ? (v.descriptionEn ?? v.descriptionId) : (v.descriptionId ?? v.descriptionEn),
                    unitLabel: locale === 'en' ? (v.unitLabelEn ?? v.unitLabelId) : (v.unitLabelId ?? v.unitLabelEn),
                    ageRangeLabel: locale === 'en' ? (v.ageRangeLabelEn ?? v.ageRangeLabelId) : (v.ageRangeLabelId ?? v.ageRangeLabelEn),
                    durationLabel: locale === 'en' ? (v.durationLabelEn ?? v.durationLabelId) : (v.durationLabelId ?? v.durationLabelEn),
                    modalities: v.modalities,
                    branch: v.branch,
                    priceOnRequest: v.priceOnRequest,
                    pricing: {
                        minAmount,
                        maxAmount,
                        isRange: minAmount !== null && maxAmount !== null && maxAmount > minAmount,
                        variesByProvider: svc.pricingModel === 'psychologist_rate',
                        promoAmount: promoValid ? promo.promoAmount : null,
                        promoBadge: promoValid ? promo.badge : null,
                        promoNote: promoValid ? promo.note : null,
                        programSlug: promoValid ? promo.slug : null
                    }
                };
            });

            const allMin = variants.map((v) => v.pricing.minAmount).filter((x): x is number => x !== null);
            const allMax = variants.map((v) => v.pricing.maxAmount ?? v.pricing.minAmount).filter((x): x is number => x !== null);
            const allPromo = variants.map((v) => v.pricing.promoAmount).filter((x): x is number => x !== null);
            const defaults = getServiceBookingDefaults(svc.slug);
            const modalities = [...new Set(variants.flatMap((v) => v.modalities))];

            return {
                id: svc.id,
                slug: svc.slug,
                categoryId: svc.categoryId,
                categorySlug: svc.categorySlug,
                categoryName:
                    locale === 'en'
                        ? (overview.categories.find((c) => c.id === svc.categoryId)?.nameEn ?? svc.categoryName)
                        : svc.categoryName,
                subgroupId: svc.subgroupId,
                subgroupSlug: svc.subgroupSlug,
                subgroupName: svc.subgroupName,
                serviceType: svc.serviceType,
                pricingModel: svc.pricingModel,
                appliesNewClientFee: svc.appliesNewClientFee,
                isAssessment: svc.isAssessment,
                isFeaturedSpotlight: svc.isFeaturedSpotlight,
                position: svc.position,
                name: locale === 'en' ? svc.nameEn : svc.nameId,
                badge: locale === 'en' ? (svc.badgeEn ?? svc.badgeId) : (svc.badgeId ?? svc.badgeEn),
                shortSummary: locale === 'en' ? (svc.shortSummaryEn ?? svc.shortSummaryId) : (svc.shortSummaryId ?? svc.shortSummaryEn),
                benefit: locale === 'en' ? (svc.benefitEn ?? svc.benefitId) : (svc.benefitId ?? svc.benefitEn),
                audiences: svc.audiences,
                modalities,
                hasMalangBranch: variants.some((v) => v.branch === 'malang'),
                priceRange: {
                    minAmount: allMin.length > 0 ? Math.min(...allMin) : null,
                    maxAmount: allMax.length > 0 ? Math.max(...allMax) : null,
                    isRange: allMin.length > 0 && allMax.length > 0 && Math.max(...allMax) > Math.min(...allMin),
                    variesByProvider: svc.pricingModel === 'psychologist_rate',
                    promoAmount: allPromo.length > 0 ? Math.min(...allPromo) : null,
                    promoBadge: variants.find((v) => v.pricing.promoAmount !== null)?.pricing.promoBadge ?? null,
                    promoNote: variants.find((v) => v.pricing.promoAmount !== null)?.pricing.promoNote ?? null,
                    programSlug: variants.find((v) => v.pricing.promoAmount !== null)?.pricing.programSlug ?? null
                },
                cardMedia: cardByServiceId.get(svc.id) ?? null,
                variants,
                bookingPreset: {
                    bookable: svc.serviceType !== 'addon' && svc.pricingModel !== 'free_external',
                    bookingPath: svc.pricingModel === 'free_external' ? null : `/booking?service=${encodeURIComponent(svc.slug)}`,
                    externalUrl: svc.externalUrl,
                    defaultConcernId: svc.defaultConcernId ?? defaults.concernId,
                    defaultClientCategory: svc.defaultClientCategory ?? defaults.clientCategory,
                    requiresInitialCounseling: svc.slug === 'adhd-dewasa' || svc.pricingModel === 'price_on_request'
                },
                demo: parseDemoConfig(rawSvc?.demoConfigJson),
                internalMeta: {
                    status: svc.status,
                    visibility: svc.visibility,
                    completenessPct: svc.completenessPct,
                    openIssuesCount: svc.openIssuesCount,
                    lowestFeeAmount: feeVals.length > 0 ? Math.min(...feeVals) : null,
                    directCostAmount: costVals.length > 0 ? Math.max(...costVals) : null,
                    lowestMarginPct: svc.lowestMarginPct
                }
            };
        });

        return {
            locale,
            marginThreshold: overview.settings.marginThreshold,
            categories: overview.categories.map((c) => ({
                id: c.id,
                slug: c.slug,
                position: c.position,
                isFree: c.isFree,
                name: locale === 'en' ? c.nameEn : c.nameId
            })),
            subgroups: overview.subgroups.map((g) => ({
                id: g.id,
                categoryId: g.categoryId,
                slug: g.slug,
                position: g.position,
                name: locale === 'en' ? g.nameEn : g.nameId,
                note: g.note
            })),
            activePrograms,
            services
        };
    };

    const getSuperadminPreviewBySlug = async (
        slug: string,
        locale: 'id' | 'en'
    ): Promise<SuperadminPreviewServiceDetail | null> => {
        const previewCatalog = await listSuperadminPreviewCatalog(locale);
        const summary = previewCatalog.services.find((s) => s.slug === slug);
        if (!summary) return null;

        const overview = await getOverviewAndCatalog();
        const item = overview.services.find((s) => s.id === summary.id);
        if (!item) return null;

        const state = await loadAllCoreState();
        const reportPreviews: PublicServiceMedia[] = state.mediaRows
            .filter((m) => m.serviceId === item.id && m.role === 'reportPreview')
            .map((m) => {
                const ref = m.objectKey ?? m.publicUrl;
                return ref
                    ? {
                        url: toMediaUrl(ref),
                        width: m.width,
                        height: m.height,
                        alt: locale === 'en' ? m.altEn : m.altId
                    }
                    : null;
            })
            .filter((x): x is PublicServiceMedia => x !== null);

        const eligiblePsychologists: PublicServicePsychologistOption[] = state.servicePsychRows
            .filter((link) => link.serviceId === item.id)
            .map((link): PublicServicePsychologistOption | null => {
                const psych = state.psychRows.find((p) => p.id === link.psychologistId);
                const prof = state.psychProfileRows.find((pr) => pr.psychologistId === link.psychologistId);
                if (!psych || !prof) return null;
                return {
                    id: psych.id,
                    slug: psych.slug,
                    name: psych.name,
                    nickname: psych.nickname,
                    credential: prof.credential,
                    tier: psych.tier,
                    primaryBranch: psych.primaryBranch,
                    experienceYears: prof.experienceYears,
                    onlineRate: prof.onlineRate ?? null,
                    offlineRate: prof.offlineRate ?? null,
                    availableOnline: prof.availableOnline,
                    availableTbi: prof.availableTbi,
                    availableBsd: prof.availableBsd,
                    availableMalang: prof.availableMalang,
                    note: locale === 'en' ? (link.noteEn ?? link.noteId) : (link.noteId ?? link.noteEn),
                    media: null
                };
            })
            .filter((x): x is PublicServicePsychologistOption => x !== null);

        const deliverables = state.deliverableRows
            .filter((d) => d.serviceId === item.id)
            .map((d) => ({
                id: d.id,
                position: d.position,
                variantSlugs: parseJsonArray(d.variantSlugsJson),
                text: locale === 'en' ? d.textEn : d.textId
            }));

        const faqs = state.faqRows
            .filter((f) => f.serviceId === item.id)
            .map((f) => ({
                id: f.id,
                position: f.position,
                question: locale === 'en' ? f.questionEn : f.questionId,
                answer: locale === 'en' ? f.answerEn : f.answerId
            }));

        const costBreakdown = overview.costRecords.filter((c) => c.serviceId === item.id);

        const detail: PublicServiceDetail = {
            ...summary,
            fullName: locale === 'en' ? (item.fullNameEn ?? item.fullNameId) : (item.fullNameId ?? item.fullNameEn),
            introduction: locale === 'en' ? (item.introductionEn ?? item.introductionId) : (item.introductionId ?? item.introductionEn),
            targetAudience: locale === 'en' ? (item.targetAudienceEn ?? item.targetAudienceId) : (item.targetAudienceId ?? item.targetAudienceEn),
            whatIsMeasured: locale === 'en' ? (item.whatIsMeasuredEn ?? item.whatIsMeasuredId) : (item.whatIsMeasuredId ?? item.whatIsMeasuredEn),
            durationInfo: locale === 'en' ? (item.durationInfoEn ?? item.durationInfoId) : (item.durationInfoId ?? item.durationInfoEn),
            locationInfo: locale === 'en' ? (item.locationInfoEn ?? item.locationInfoId) : (item.locationInfoId ?? item.locationInfoEn),
            processSteps: locale === 'en' ? (item.processStepsEn.length > 0 ? item.processStepsEn : item.processStepsId) : item.processStepsId,
            terms: locale === 'en' ? (item.termsEn.length > 0 ? item.termsEn : item.termsId) : item.termsId,
            resultsExplanation: locale === 'en' ? (item.resultsExplanationEn ?? item.resultsExplanationId) : (item.resultsExplanationId ?? item.resultsExplanationEn),
            scientificBasis: locale === 'en' ? (item.scientificBasisEn ?? item.scientificBasisId) : (item.scientificBasisId ?? item.scientificBasisEn),
            citationSummary: null,
            reportPreviews,
            eligiblePsychologists,
            deliverables,
            faqs,
            references: [],
            assessmentDetails: null
        };

        return {
            ...detail,
            internalMeta: summary.internalMeta,
            costBreakdown
        };
    };

    const upsertService = async (actor: AdminActor, payload: UpsertServicePayload) =>
        database.transaction(async (tx) => {
            const [category] = await tx
                .select({ id: schema.serviceCategories.id })
                .from(schema.serviceCategories)
                .where(eq(schema.serviceCategories.slug, payload.categorySlug))
                .limit(1);
            if (!category) {
                throw new Error(`Category not found: ${payload.categorySlug}`);
            }

            let subgroupId: string | null = null;
            if (payload.subgroupSlug) {
                const [sg] = await tx
                    .select({ id: schema.serviceSubgroups.id })
                    .from(schema.serviceSubgroups)
                    .where(eq(schema.serviceSubgroups.slug, payload.subgroupSlug))
                    .limit(1);
                subgroupId = sg?.id ?? null;
            }

            let serviceRow: { id: string; slug: string } | undefined;
            if (payload.id) {
                [serviceRow] = await tx
                    .update(schema.services)
                    .set({
                        slug: payload.slug.trim(),
                        categoryId: category.id,
                        subgroupId,
                        serviceType: payload.serviceType,
                        pricingModel: payload.pricingModel,
                        status: payload.status,
                        visibility: payload.visibility,
                        appliesNewClientFee: payload.appliesNewClientFee,
                        isAssessment: payload.isAssessment,
                        isFeaturedSpotlight: payload.isFeaturedSpotlight,
                        position: payload.position ?? 100,
                        externalUrl: payload.externalUrl ?? null,
                        defaultConcernId: payload.defaultConcernId ?? null,
                        defaultClientCategory: payload.defaultClientCategory ?? null,
                        audiencesJson: JSON.stringify(payload.audiences ?? []),
                        updatedAt: sql`now()`
                    })
                    .where(eq(schema.services.id, payload.id))
                    .returning({ id: schema.services.id, slug: schema.services.slug });
            } else {
                [serviceRow] = await tx
                    .insert(schema.services)
                    .values({
                        slug: payload.slug.trim(),
                        categoryId: category.id,
                        subgroupId,
                        serviceType: payload.serviceType,
                        pricingModel: payload.pricingModel,
                        status: payload.status,
                        visibility: payload.visibility,
                        appliesNewClientFee: payload.appliesNewClientFee,
                        isAssessment: payload.isAssessment,
                        isFeaturedSpotlight: payload.isFeaturedSpotlight,
                        position: payload.position ?? 500,
                        externalUrl: payload.externalUrl ?? null,
                        defaultConcernId: payload.defaultConcernId ?? null,
                        defaultClientCategory: payload.defaultClientCategory ?? null,
                        audiencesJson: JSON.stringify(payload.audiences ?? [])
                    })
                    .returning({ id: schema.services.id, slug: schema.services.slug });
            }

            if (!serviceRow) {
                throw new Error('Failed to save service record');
            }

            const enName = payload.nameEn?.trim() || payload.nameId.trim();
            for (const locale of ['id', 'en'] as const) {
                const isEn = locale === 'en';
                const fields = {
                    name: isEn ? enName : payload.nameId.trim(),
                    fullName: isEn ? (payload.fullNameEn ?? payload.fullNameId ?? null) : (payload.fullNameId ?? null),
                    badge: isEn ? (payload.badgeEn ?? payload.badgeId ?? null) : (payload.badgeId ?? null),
                    shortSummary: isEn ? (payload.shortSummaryEn ?? payload.shortSummaryId ?? null) : (payload.shortSummaryId ?? null),
                    benefit: isEn ? (payload.benefitEn ?? payload.benefitId ?? null) : (payload.benefitId ?? null),
                    introduction: isEn ? (payload.introductionEn ?? payload.introductionId ?? null) : (payload.introductionId ?? null),
                    targetAudience: isEn ? (payload.targetAudienceEn ?? payload.targetAudienceId ?? null) : (payload.targetAudienceId ?? null),
                    whatIsMeasured: isEn ? (payload.whatIsMeasuredEn ?? payload.whatIsMeasuredId ?? null) : (payload.whatIsMeasuredId ?? null),
                    durationInfo: isEn ? (payload.durationInfoEn ?? payload.durationInfoId ?? null) : (payload.durationInfoId ?? null),
                    locationInfo: isEn ? (payload.locationInfoEn ?? payload.locationInfoId ?? null) : (payload.locationInfoId ?? null),
                    resultsExplanation: isEn ? (payload.resultsExplanationEn ?? payload.resultsExplanationId ?? null) : (payload.resultsExplanationId ?? null),
                    scientificBasis: isEn ? (payload.scientificBasisEn ?? payload.scientificBasisId ?? null) : (payload.scientificBasisId ?? null),
                    processStepsJson: JSON.stringify(isEn && (payload.processStepsEn?.length ?? 0) > 0 ? payload.processStepsEn : (payload.processStepsId ?? [])),
                    termsJson: JSON.stringify(isEn && (payload.termsEn?.length ?? 0) > 0 ? payload.termsEn : (payload.termsId ?? []))
                };
                await tx
                    .insert(schema.serviceTranslations)
                    .values({ serviceId: serviceRow.id, locale, ...fields })
                    .onConflictDoUpdate({
                        target: [schema.serviceTranslations.serviceId, schema.serviceTranslations.locale],
                        set: fields
                    });
            }

            if (payload.linkedPsychologistSlugs) {
                await tx.delete(schema.servicePsychologists).where(eq(schema.servicePsychologists.serviceId, serviceRow.id));
                if (payload.linkedPsychologistSlugs.length > 0) {
                    const psychs = await tx
                        .select({ id: schema.psychologists.id, slug: schema.psychologists.slug })
                        .from(schema.psychologists)
                        .where(inArray(schema.psychologists.slug, payload.linkedPsychologistSlugs));
                    const idBySlug = new Map(psychs.map((p) => [p.slug, p.id]));
                    const rowsToInsert = payload.linkedPsychologistSlugs
                        .map((slug, pos) => {
                            const pid = idBySlug.get(slug);
                            return pid ? { serviceId: serviceRow.id, psychologistId: pid, position: pos } : null;
                        })
                        .filter((r): r is NonNullable<typeof r> => r !== null);
                    if (rowsToInsert.length > 0) {
                        await tx.insert(schema.servicePsychologists).values(rowsToInsert);
                    }
                }
            }

            if (payload.variants) {
                for (let idx = 0; idx < payload.variants.length; idx++) {
                    const v = payload.variants[idx]!;
                    let variantRow: { id: string } | undefined;
                    if (v.id) {
                        [variantRow] = await tx
                            .update(schema.serviceVariants)
                            .set({
                                slug: v.slug.trim(),
                                position: idx,
                                status: v.status,
                                visibility: v.visibility,
                                modalitiesJson: JSON.stringify(v.modalities),
                                branch: v.branch ?? null,
                                priceOnRequest: Boolean(v.priceOnRequest),
                                updatedAt: sql`now()`
                            })
                            .where(and(eq(schema.serviceVariants.id, v.id), eq(schema.serviceVariants.serviceId, serviceRow.id)))
                            .returning({ id: schema.serviceVariants.id });
                    } else {
                        [variantRow] = await tx
                            .insert(schema.serviceVariants)
                            .values({
                                serviceId: serviceRow.id,
                                slug: v.slug.trim(),
                                position: idx,
                                status: v.status,
                                visibility: v.visibility,
                                modalitiesJson: JSON.stringify(v.modalities),
                                branch: v.branch ?? null,
                                priceOnRequest: Boolean(v.priceOnRequest)
                            })
                            .onConflictDoUpdate({
                                target: schema.serviceVariants.slug,
                                set: {
                                    status: v.status,
                                    visibility: v.visibility,
                                    modalitiesJson: JSON.stringify(v.modalities),
                                    branch: v.branch ?? null,
                                    priceOnRequest: Boolean(v.priceOnRequest),
                                    updatedAt: sql`now()`
                                }
                            })
                            .returning({ id: schema.serviceVariants.id });
                    }

                    if (!variantRow) continue;
                    for (const locale of ['id', 'en'] as const) {
                        const isEn = locale === 'en';
                        const vtFields = {
                            name: isEn ? (v.nameEn?.trim() || v.nameId.trim()) : v.nameId.trim(),
                            description: isEn ? (v.descriptionEn ?? v.descriptionId ?? null) : (v.descriptionId ?? null),
                            unitLabel: isEn ? (v.unitLabelEn ?? v.unitLabelId ?? null) : (v.unitLabelId ?? null),
                            durationLabel: isEn ? (v.durationLabelEn ?? v.durationLabelId ?? null) : (v.durationLabelId ?? null)
                        };
                        await tx
                            .insert(schema.serviceVariantTranslations)
                            .values({ variantId: variantRow.id, locale, ...vtFields })
                            .onConflictDoUpdate({
                                target: [schema.serviceVariantTranslations.variantId, schema.serviceVariantTranslations.locale],
                                set: vtFields
                            });
                    }

                    if (typeof v.publicPriceAmount === 'number' && Number.isFinite(v.publicPriceAmount)) {
                        await tx
                            .insert(schema.servicePublicPrices)
                            .values({
                                variantId: variantRow.id,
                                amount: Math.max(0, Math.round(v.publicPriceAmount)),
                                amountMax:
                                    typeof v.publicPriceMax === 'number'
                                        ? Math.max(Math.round(v.publicPriceAmount), Math.round(v.publicPriceMax))
                                        : null
                            })
                            .onConflictDoUpdate({
                                target: schema.servicePublicPrices.variantId,
                                set: {
                                    amount: Math.max(0, Math.round(v.publicPriceAmount)),
                                    amountMax:
                                        typeof v.publicPriceMax === 'number'
                                            ? Math.max(Math.round(v.publicPriceAmount), Math.round(v.publicPriceMax))
                                            : null,
                                    updatedAt: sql`now()`
                                }
                            });
                    }
                }
            }

            await appendAuditLog(
                tx,
                actor,
                payload.id ? 'service.updated' : 'service.created',
                'services',
                serviceRow.slug,
                `${payload.id ? 'Updated' : 'Created'} ${payload.nameId} (${payload.status}/${payload.visibility})`
            );

            return serviceRow;
        });

    const duplicateService = async (actor: AdminActor, serviceId: string) =>
        database.transaction(async (tx) => {
            const [source] = await tx
                .select()
                .from(schema.services)
                .where(eq(schema.services.id, serviceId))
                .limit(1);
            if (!source) return null;

            const trans = await tx
                .select()
                .from(schema.serviceTranslations)
                .where(eq(schema.serviceTranslations.serviceId, serviceId));

            const suffix = Date.now().toString(36).slice(-4);
            const newSlug = `${source.slug}-copy-${suffix}`;

            const [created] = await tx
                .insert(schema.services)
                .values({
                    slug: newSlug,
                    categoryId: source.categoryId,
                    subgroupId: source.subgroupId,
                    serviceType: source.serviceType,
                    pricingModel: source.pricingModel,
                    status: 'draft',
                    visibility: 'internal',
                    appliesNewClientFee: source.appliesNewClientFee,
                    isAssessment: source.isAssessment,
                    isFeaturedSpotlight: false,
                    position: source.position + 1,
                    externalUrl: source.externalUrl,
                    defaultConcernId: source.defaultConcernId,
                    defaultClientCategory: source.defaultClientCategory,
                    audiencesJson: source.audiencesJson
                })
                .returning({ id: schema.services.id, slug: schema.services.slug });

            if (!created) return null;

            for (const t of trans) {
                await tx.insert(schema.serviceTranslations).values({
                    serviceId: created.id,
                    locale: t.locale,
                    name: `${t.name} (Salinan)`,
                    fullName: t.fullName,
                    badge: t.badge,
                    shortSummary: t.shortSummary,
                    benefit: t.benefit,
                    introduction: t.introduction,
                    targetAudience: t.targetAudience,
                    whatIsMeasured: t.whatIsMeasured,
                    durationInfo: t.durationInfo,
                    locationInfo: t.locationInfo,
                    processStepsJson: t.processStepsJson,
                    termsJson: t.termsJson,
                    resultsExplanation: t.resultsExplanation,
                    scientificBasis: t.scientificBasis,
                    citationSummary: t.citationSummary,
                    assessmentPurpose: t.assessmentPurpose,
                    assessmentAspects: t.assessmentAspects,
                    assessmentAgeRange: t.assessmentAgeRange,
                    assessmentMethod: t.assessmentMethod,
                    assessmentPrep: t.assessmentPrep,
                    assessmentOutputFormat: t.assessmentOutputFormat,
                    assessmentDimensionsJson: t.assessmentDimensionsJson,
                    assessmentReportType: t.assessmentReportType,
                    assessmentInterpretation: t.assessmentInterpretation,
                    assessmentRecommendations: t.assessmentRecommendations,
                    assessmentTurnaround: t.assessmentTurnaround
                });
            }

            await appendAuditLog(tx, actor, 'service.duplicated', 'services', created.slug, `Duplicated from ${source.slug}`);
            return created;
        });

    const upsertInternalCost = async (actor: AdminActor, payload: UpsertInternalCostPayload) =>
        database.transaction(async (tx) => {
            const targetStatus: InternalPriceStatus = payload.promoteToBerlaku ? 'berlaku' : payload.recordStatus;
            const variantId = payload.variantId ?? null;
            const psychologistId = payload.psychologistId ?? null;

            if (targetStatus === 'berlaku' && variantId) {
                const scopeCondition = psychologistId
                    ? eq(schema.serviceInternalCosts.psychologistId, psychologistId)
                    : sql`${schema.serviceInternalCosts.psychologistId} is null`;
                await tx
                    .update(schema.serviceInternalCosts)
                    .set({ recordStatus: 'historis', updatedAt: sql`now()` })
                    .where(
                        and(
                            eq(schema.serviceInternalCosts.serviceId, payload.serviceId),
                            eq(schema.serviceInternalCosts.variantId, variantId),
                            scopeCondition,
                            eq(schema.serviceInternalCosts.recordKind, payload.recordKind),
                            eq(schema.serviceInternalCosts.recordStatus, 'berlaku')
                        )
                    );
            }

            const [inserted] = await tx
                .insert(schema.serviceInternalCosts)
                .values({
                    serviceId: payload.serviceId,
                    variantId,
                    psychologistId,
                    recordKind: payload.recordKind,
                    recordStatus: targetStatus,
                    amount: payload.amount !== null ? Math.max(0, Math.round(payload.amount)) : null,
                    amountMax: payload.amountMax != null ? Math.max(0, Math.round(payload.amountMax)) : null,
                    unitLabel: payload.unitLabel ?? null,
                    effectiveDate: payload.effectiveDate ?? getTodayWibDate(now),
                    label: payload.label ?? null,
                    note: payload.note ?? null
                })
                .returning({ id: schema.serviceInternalCosts.id });

            // Keep public price synchronized when superadmin explicitly sets a general Berlaku client harga
            if (payload.recordKind === 'harga' && targetStatus === 'berlaku' && variantId && psychologistId === null && payload.amount !== null) {
                await tx
                    .insert(schema.servicePublicPrices)
                    .values({
                        variantId,
                        amount: Math.max(0, Math.round(payload.amount)),
                        amountMax: payload.amountMax != null ? Math.max(Math.round(payload.amount), Math.round(payload.amountMax)) : null,
                        effectiveDate: payload.effectiveDate ?? getTodayWibDate(now)
                    })
                    .onConflictDoUpdate({
                        target: schema.servicePublicPrices.variantId,
                        set: {
                            amount: Math.max(0, Math.round(payload.amount)),
                            amountMax: payload.amountMax != null ? Math.max(Math.round(payload.amount), Math.round(payload.amountMax)) : null,
                            effectiveDate: payload.effectiveDate ?? getTodayWibDate(now),
                            updatedAt: sql`now()`
                        }
                    });
            }

            await appendAuditLog(
                tx,
                actor,
                `cost.${payload.recordKind}.${targetStatus}`,
                'service_internal_costs',
                variantId,
                `Set ${payload.recordKind} (${targetStatus}) = ${payload.amount ?? 'null'}`
            );

            return { id: inserted!.id };
        });

    const saveProgram = async (actor: AdminActor, payload: SaveProgramPayload) =>
        database.transaction(async (tx) => {
            let programRow: { id: string } | undefined;
            if (payload.id) {
                [programRow] = await tx
                    .update(schema.servicePrograms)
                    .set({
                        slug: payload.slug.trim(),
                        programType: payload.programType,
                        status: payload.status,
                        startsOn: payload.startsOn,
                        endsOn: payload.endsOn,
                        updatedAt: sql`now()`
                    })
                    .where(eq(schema.servicePrograms.id, payload.id))
                    .returning({ id: schema.servicePrograms.id });
            } else {
                [programRow] = await tx
                    .insert(schema.servicePrograms)
                    .values({
                        slug: payload.slug.trim(),
                        programType: payload.programType,
                        status: payload.status,
                        startsOn: payload.startsOn,
                        endsOn: payload.endsOn
                    })
                    .returning({ id: schema.servicePrograms.id });
            }

            if (!programRow) throw new Error('Failed to save program');

            for (const [locale, name, badge] of [
                ['id', payload.nameId.trim(), payload.badgeId ?? null],
                ['en', payload.nameEn?.trim() || payload.nameId.trim(), payload.badgeEn ?? payload.badgeId ?? null]
            ] as const) {
                await tx
                    .insert(schema.serviceProgramTranslations)
                    .values({ programId: programRow.id, locale, name, badge })
                    .onConflictDoUpdate({
                        target: [schema.serviceProgramTranslations.programId, schema.serviceProgramTranslations.locale],
                        set: { name, badge }
                    });
            }

            await tx.delete(schema.serviceProgramPrices).where(eq(schema.serviceProgramPrices.programId, programRow.id));
            if (payload.prices.length > 0) {
                await tx.insert(schema.serviceProgramPrices).values(
                    payload.prices.map((p) => ({
                        programId: programRow.id,
                        variantId: p.variantId,
                        promoAmount: Math.max(0, Math.round(p.promoAmount)),
                        noteId: p.noteId ?? null,
                        noteEn: p.noteEn ?? p.noteId ?? null
                    }))
                );
            }

            await appendAuditLog(
                tx,
                actor,
                payload.id ? 'program.updated' : 'program.created',
                'service_programs',
                payload.slug,
                `${payload.nameId} (${payload.status}, ${payload.prices.length} varian)`
            );

            return { id: programRow.id };
        });

    const updateProgramStatus = async (actor: AdminActor, programId: string, status: ServiceProgramStatus) =>
        database.transaction(async (tx) => {
            const [updated] = await tx
                .update(schema.servicePrograms)
                .set({ status, updatedAt: sql`now()` })
                .where(eq(schema.servicePrograms.id, programId))
                .returning({ id: schema.servicePrograms.id, slug: schema.servicePrograms.slug });
            if (!updated) return false;
            await appendAuditLog(tx, actor, 'program.status', 'service_programs', updated.slug, `Program status -> ${status}`);
            return true;
        });

    const updatePsychologistMatrix = async (
        actor: AdminActor,
        psychologistId: string,
        payload: UpdatePsychologistMatrixPayload
    ) =>
        database.transaction(async (tx) => {
            const [psych] = await tx
                .update(schema.psychologists)
                .set({
                    acceptingNewClients: payload.acceptingNewClients,
                    updatedAt: sql`now()`
                })
                .where(eq(schema.psychologists.id, psychologistId))
                .returning({ id: schema.psychologists.id, slug: schema.psychologists.slug });

            if (!psych) return false;

            await tx
                .update(schema.psychologistProfiles)
                .set({
                    onlineRate: payload.onlineRate,
                    offlineRate: payload.offlineRate,
                    availableOnline: payload.availableOnline,
                    availableTbi: payload.availableTbi,
                    availableBsd: payload.availableBsd,
                    availableMalang: payload.availableMalang,
                    updatedAt: sql`now()`
                })
                .where(eq(schema.psychologistProfiles.psychologistId, psychologistId));

            await tx.delete(schema.servicePsychologists).where(eq(schema.servicePsychologists.psychologistId, psychologistId));
            if (payload.linkedServiceSlugs.length > 0) {
                const svcs = await tx
                    .select({ id: schema.services.id, slug: schema.services.slug })
                    .from(schema.services)
                    .where(inArray(schema.services.slug, payload.linkedServiceSlugs));
                if (svcs.length > 0) {
                    await tx.insert(schema.servicePsychologists).values(
                        svcs.map((svc, idx) => ({
                            serviceId: svc.id,
                            psychologistId,
                            position: idx
                        }))
                    );
                }
            }

            await appendAuditLog(
                tx,
                actor,
                'psychologist.matrix.updated',
                'psychologists',
                psych.slug,
                `Updated rates (online=${payload.onlineRate}, offline=${payload.offlineRate}) & ${payload.linkedServiceSlugs.length} linked services`
            );

            return true;
        });

    const updateIssueStatus = async (
        actor: AdminActor,
        issueId: string,
        status: ServiceDataIssueStatus,
        resolution?: string | null
    ) =>
        database.transaction(async (tx) => {
            const [updated] = await tx
                .update(schema.serviceDataIssues)
                .set({
                    status,
                    resolution: resolution ?? null,
                    resolvedAt: status === 'Selesai' ? new Date().toISOString() : null,
                    updatedAt: sql`now()`
                })
                .where(eq(schema.serviceDataIssues.id, issueId))
                .returning({ id: schema.serviceDataIssues.id, code: schema.serviceDataIssues.code });

            if (!updated) return false;

            await appendAuditLog(
                tx,
                actor,
                `issue.${status.toLowerCase()}`,
                'service_data_issues',
                updated.code,
                `Issue ${updated.code} -> ${status}`
            );
            return true;
        });

    const exportLedgerCsv = async () => {
        const overview = await getOverviewAndCatalog();
        return buildInternalLedgerCsv(overview.ledgerRows);
    };

    return {
        getOverviewAndCatalog,
        listSuperadminPreviewCatalog,
        getSuperadminPreviewBySlug,
        upsertService,
        duplicateService,
        upsertInternalCost,
        saveProgram,
        updateProgramStatus,
        updatePsychologistMatrix,
        updateIssueStatus,
        exportLedgerCsv
    };
};
