import { count, eq, sql } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import {
    serviceCategorySeedFixtures,
    serviceProgramSeedFixtures,
    serviceReferenceSeedFixtures,
    serviceSeedFixtures,
    serviceSubgroupSeedFixtures,
    type ServiceMediaSeedFixture
} from './seed-services-data';
import {
    internalCategorySeedFixtures,
    internalCostSeedFixtures,
    internalServiceSeedFixtures,
    internalSubgroupSeedFixtures,
    SERVICE_DEMO_CONFIG_FIXTURES,
    serviceDataIssueSeedFixtures,
    serviceOpsSettingsSeedFixture
} from './seed-services-internal-data';

export {
    serviceCategorySeedFixtures,
    serviceProgramSeedFixtures,
    serviceReferenceSeedFixtures,
    serviceSeedFixtures,
    serviceSubgroupSeedFixtures
} from './seed-services-data';
export {
    internalCategorySeedFixtures,
    internalCostSeedFixtures,
    internalServiceSeedFixtures,
    internalSubgroupSeedFixtures,
    serviceDataIssueSeedFixtures
} from './seed-services-internal-data';

export interface ServicesSeedResult {
    categories: number;
    subgroups: number;
    references: number;
    services: number;
    variants: number;
    publicPrices: number;
    programs: number;
    programPrices: number;
}

export interface ServicesSeedSummary {
    status: 'seeded' | 'alreadyInitialized';
    result?: ServicesSeedResult;
}

const upsertServiceMedia = async (
    tx: PostgresJsDatabase<typeof schema>,
    serviceId: string,
    role: 'cardCover' | 'reportPreview',
    position: number,
    media: ServiceMediaSeedFixture
) => {
    const [mediaObject] = await tx
        .insert(schema.mediaObjects)
        .values({
            objectKey: media.reference,
            width: media.width,
            height: media.height,
            altId: media.altId,
            altEn: media.altEn,
            mimeType: media.mimeType,
            lifecycle: 'active',
            orphanedAt: null
        })
        .onConflictDoUpdate({
            target: schema.mediaObjects.objectKey,
            set: {
                width: media.width,
                height: media.height,
                altId: media.altId,
                altEn: media.altEn,
                mimeType: media.mimeType,
                lifecycle: 'active',
                orphanedAt: null,
                updatedAt: sql`now()`
            }
        })
        .returning({ id: schema.mediaObjects.id });

    if (!mediaObject) {
        throw new Error(`Media upsert failed for ${media.reference}`);
    }

    await tx
        .insert(schema.mediaAttachments)
        .values({
            mediaObjectId: mediaObject.id,
            serviceId,
            role,
            position
        })
        .onConflictDoUpdate({
            target: [
                schema.mediaAttachments.serviceId,
                schema.mediaAttachments.role,
                schema.mediaAttachments.position
            ],
            targetWhere: sql`${schema.mediaAttachments.serviceId} is not null and ${schema.mediaAttachments.detachedAt} is null`,
            set: {
                mediaObjectId: mediaObject.id,
                detachedAt: null
            }
        });
};

export const seedServices = async (
    database: PostgresJsDatabase<typeof schema>
): Promise<ServicesSeedResult> => database.transaction(async (tx) => {
    const allCategoryFixtures = [...serviceCategorySeedFixtures, ...internalCategorySeedFixtures];
    const categoryIdBySlug = new Map<string, string>();
    for (const cat of allCategoryFixtures) {
        const [row] = await tx
            .insert(schema.serviceCategories)
            .values({
                slug: cat.slug,
                position: cat.position,
                isFree: cat.isFree
            })
            .onConflictDoUpdate({
                target: schema.serviceCategories.slug,
                set: {
                    position: cat.position,
                    isFree: cat.isFree,
                    updatedAt: sql`now()`
                }
            })
            .returning({ id: schema.serviceCategories.id });

        if (!row) throw new Error(`Category upsert returned no row for ${cat.slug}`);
        categoryIdBySlug.set(cat.slug, row.id);

        for (const [locale, name] of [['id', cat.nameId], ['en', cat.nameEn]] as const) {
            await tx
                .insert(schema.serviceCategoryTranslations)
                .values({ categoryId: row.id, locale, name })
                .onConflictDoUpdate({
                    target: [schema.serviceCategoryTranslations.categoryId, schema.serviceCategoryTranslations.locale],
                    set: { name }
                });
        }
    }

    const allSubgroupFixtures = [...serviceSubgroupSeedFixtures, ...internalSubgroupSeedFixtures];
    const subgroupIdBySlug = new Map<string, string>();
    for (const sub of allSubgroupFixtures) {
        const categoryId = sub.categorySlug ? (categoryIdBySlug.get(sub.categorySlug) ?? null) : null;
        const [row] = await tx
            .insert(schema.serviceSubgroups)
            .values({
                slug: sub.slug,
                categoryId,
                position: sub.position
            })
            .onConflictDoUpdate({
                target: schema.serviceSubgroups.slug,
                set: {
                    categoryId,
                    position: sub.position,
                    updatedAt: sql`now()`
                }
            })
            .returning({ id: schema.serviceSubgroups.id });

        if (!row) throw new Error(`Subgroup upsert returned no row for ${sub.slug}`);
        subgroupIdBySlug.set(sub.slug, row.id);

        for (const [locale, name, note] of [
            ['id', sub.nameId, sub.noteId],
            ['en', sub.nameEn, sub.noteEn]
        ] as const) {
            await tx
                .insert(schema.serviceSubgroupTranslations)
                .values({ subgroupId: row.id, locale, name, note })
                .onConflictDoUpdate({
                    target: [schema.serviceSubgroupTranslations.subgroupId, schema.serviceSubgroupTranslations.locale],
                    set: { name, note }
                });
        }
    }

    const referenceIdByCode = new Map<string, string>();
    for (const ref of serviceReferenceSeedFixtures) {
        const [row] = await tx
            .insert(schema.serviceReferences)
            .values({
                code: ref.code,
                citationText: ref.citationText,
                doiUrl: ref.doiUrl
            })
            .onConflictDoUpdate({
                target: schema.serviceReferences.code,
                set: {
                    citationText: ref.citationText,
                    doiUrl: ref.doiUrl
                }
            })
            .returning({ id: schema.serviceReferences.id });

        if (!row) throw new Error(`Reference upsert returned no row for ${ref.code}`);
        referenceIdByCode.set(ref.code, row.id);
    }

    const psychologistRows = await tx
        .select({ id: schema.psychologists.id, slug: schema.psychologists.slug })
        .from(schema.psychologists);
    const psychologistIdBySlug = new Map(psychologistRows.map((row) => [row.slug, row.id]));

    const serviceIdBySlug = new Map<string, string>();
    const variantIdBySlug = new Map<string, string>();
    let variantCount = 0;
    let publicPriceCount = 0;

    for (const item of serviceSeedFixtures) {
        const categoryId = categoryIdBySlug.get(item.categorySlug);
        if (!categoryId) {
            throw new Error(`Missing category ${item.categorySlug} for service ${item.slug}`);
        }
        const subgroupId = item.subgroupSlug ? (subgroupIdBySlug.get(item.subgroupSlug) ?? null) : null;
        const demoConfig = SERVICE_DEMO_CONFIG_FIXTURES[item.slug]
            ? JSON.stringify(SERVICE_DEMO_CONFIG_FIXTURES[item.slug])
            : null;

        const [serviceRow] = await tx
            .insert(schema.services)
            .values({
                slug: item.slug,
                categoryId,
                subgroupId,
                serviceType: item.serviceType,
                pricingModel: item.pricingModel,
                status: item.status,
                visibility: item.visibility,
                appliesNewClientFee: item.appliesNewClientFee,
                isAssessment: item.isAssessment,
                isFeaturedSpotlight: item.isFeaturedSpotlight,
                position: item.position,
                externalUrl: item.externalUrl,
                defaultConcernId: item.defaultConcernId,
                defaultClientCategory: item.defaultClientCategory,
                audiencesJson: JSON.stringify(item.audiences),
                demoConfigJson: demoConfig
            })
            .onConflictDoUpdate({
                target: schema.services.slug,
                set: {
                    categoryId,
                    subgroupId,
                    serviceType: item.serviceType,
                    pricingModel: item.pricingModel,
                    status: item.status,
                    visibility: item.visibility,
                    appliesNewClientFee: item.appliesNewClientFee,
                    isAssessment: item.isAssessment,
                    isFeaturedSpotlight: item.isFeaturedSpotlight,
                    position: item.position,
                    externalUrl: item.externalUrl,
                    defaultConcernId: item.defaultConcernId,
                    defaultClientCategory: item.defaultClientCategory,
                    audiencesJson: JSON.stringify(item.audiences),
                    demoConfigJson: demoConfig,
                    updatedAt: sql`now()`
                }
            })
            .returning({ id: schema.services.id });

        if (!serviceRow) throw new Error(`Service upsert returned no row for ${item.slug}`);
        serviceIdBySlug.set(item.slug, serviceRow.id);

        for (const locale of ['id', 'en'] as const) {
            const tr = item.translations[locale];
            await tx
                .insert(schema.serviceTranslations)
                .values({
                    serviceId: serviceRow.id,
                    locale,
                    name: tr.name,
                    fullName: tr.fullName,
                    badge: tr.badge,
                    shortSummary: tr.shortSummary,
                    benefit: tr.benefit,
                    introduction: tr.introduction,
                    targetAudience: tr.targetAudience,
                    whatIsMeasured: tr.whatIsMeasured,
                    durationInfo: tr.durationInfo,
                    locationInfo: tr.locationInfo,
                    processStepsJson: JSON.stringify(tr.processSteps),
                    termsJson: JSON.stringify(tr.terms),
                    resultsExplanation: tr.resultsExplanation,
                    scientificBasis: tr.scientificBasis,
                    citationSummary: tr.citationSummary,
                    assessmentPurpose: tr.assessmentPurpose,
                    assessmentAspects: tr.assessmentAspects,
                    assessmentAgeRange: tr.assessmentAgeRange,
                    assessmentMethod: tr.assessmentMethod,
                    assessmentPrep: tr.assessmentPrep,
                    assessmentOutputFormat: tr.assessmentOutputFormat,
                    assessmentDimensionsJson: JSON.stringify(tr.assessmentDimensions),
                    assessmentReportType: tr.assessmentReportType,
                    assessmentInterpretation: tr.assessmentInterpretation,
                    assessmentRecommendations: tr.assessmentRecommendations,
                    assessmentTurnaround: tr.assessmentTurnaround
                })
                .onConflictDoUpdate({
                    target: [schema.serviceTranslations.serviceId, schema.serviceTranslations.locale],
                    set: {
                        name: tr.name,
                        fullName: tr.fullName,
                        badge: tr.badge,
                        shortSummary: tr.shortSummary,
                        benefit: tr.benefit,
                        introduction: tr.introduction,
                        targetAudience: tr.targetAudience,
                        whatIsMeasured: tr.whatIsMeasured,
                        durationInfo: tr.durationInfo,
                        locationInfo: tr.locationInfo,
                        processStepsJson: JSON.stringify(tr.processSteps),
                        termsJson: JSON.stringify(tr.terms),
                        resultsExplanation: tr.resultsExplanation,
                        scientificBasis: tr.scientificBasis,
                        citationSummary: tr.citationSummary,
                        assessmentPurpose: tr.assessmentPurpose,
                        assessmentAspects: tr.assessmentAspects,
                        assessmentAgeRange: tr.assessmentAgeRange,
                        assessmentMethod: tr.assessmentMethod,
                        assessmentPrep: tr.assessmentPrep,
                        assessmentOutputFormat: tr.assessmentOutputFormat,
                        assessmentDimensionsJson: JSON.stringify(tr.assessmentDimensions),
                        assessmentReportType: tr.assessmentReportType,
                        assessmentInterpretation: tr.assessmentInterpretation,
                        assessmentRecommendations: tr.assessmentRecommendations,
                        assessmentTurnaround: tr.assessmentTurnaround
                    }
                });
        }

        for (const variant of item.variants) {
            const [variantRow] = await tx
                .insert(schema.serviceVariants)
                .values({
                    serviceId: serviceRow.id,
                    slug: variant.slug,
                    position: variant.position,
                    status: variant.status,
                    visibility: variant.visibility,
                    modalitiesJson: JSON.stringify(variant.modalities),
                    branch: variant.branch,
                    priceOnRequest: variant.priceOnRequest
                })
                .onConflictDoUpdate({
                    target: schema.serviceVariants.slug,
                    set: {
                        serviceId: serviceRow.id,
                        position: variant.position,
                        status: variant.status,
                        visibility: variant.visibility,
                        modalitiesJson: JSON.stringify(variant.modalities),
                        branch: variant.branch,
                        priceOnRequest: variant.priceOnRequest,
                        updatedAt: sql`now()`
                    }
                })
                .returning({ id: schema.serviceVariants.id });

            if (!variantRow) throw new Error(`Variant upsert returned no row for ${variant.slug}`);
            variantIdBySlug.set(variant.slug, variantRow.id);
            variantCount += 1;

            for (const [locale, name, description, unitLabel, ageRangeLabel, durationLabel] of [
                ['id', variant.nameId, variant.descriptionId, variant.unitLabelId, variant.ageRangeLabelId, variant.durationLabelId],
                ['en', variant.nameEn, variant.descriptionEn, variant.unitLabelEn, variant.ageRangeLabelEn, variant.durationLabelEn]
            ] as const) {
                await tx
                    .insert(schema.serviceVariantTranslations)
                    .values({
                        variantId: variantRow.id,
                        locale,
                        name,
                        description,
                        unitLabel,
                        ageRangeLabel,
                        durationLabel
                    })
                    .onConflictDoUpdate({
                        target: [schema.serviceVariantTranslations.variantId, schema.serviceVariantTranslations.locale],
                        set: {
                            name,
                            description,
                            unitLabel,
                            ageRangeLabel,
                            durationLabel
                        }
                    });
            }

            if (variant.publicPrice) {
                await tx
                    .insert(schema.servicePublicPrices)
                    .values({
                        variantId: variantRow.id,
                        amount: variant.publicPrice.amount,
                        amountMax: variant.publicPrice.amountMax,
                        effectiveDate: variant.publicPrice.effectiveDate
                    })
                    .onConflictDoUpdate({
                        target: schema.servicePublicPrices.variantId,
                        set: {
                            amount: variant.publicPrice.amount,
                            amountMax: variant.publicPrice.amountMax,
                            effectiveDate: variant.publicPrice.effectiveDate,
                            updatedAt: sql`now()`
                        }
                    });
                publicPriceCount += 1;
            }
        }

        await tx.delete(schema.servicePsychologists).where(eq(schema.servicePsychologists.serviceId, serviceRow.id));
        const seenPsychIds = new Set<string>();
        const linkValues = item.psychologists
            .map((link) => {
                const psychologistId = psychologistIdBySlug.get(link.slug);
                if (!psychologistId || seenPsychIds.has(psychologistId)) return null;
                seenPsychIds.add(psychologistId);
                return {
                    serviceId: serviceRow.id,
                    psychologistId,
                    position: seenPsychIds.size - 1,
                    noteId: link.noteId,
                    noteEn: link.noteEn
                };
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
        if (linkValues.length > 0) {
            await tx.insert(schema.servicePsychologists).values(linkValues);
        }

        await tx.delete(schema.serviceDeliverables).where(eq(schema.serviceDeliverables.serviceId, serviceRow.id));
        if (item.deliverables.length > 0) {
            await tx.insert(schema.serviceDeliverables).values(
                item.deliverables.map((d, position) => ({
                    serviceId: serviceRow.id,
                    position,
                    variantSlugsJson: JSON.stringify(d.variantSlugs),
                    textId: d.textId,
                    textEn: d.textEn
                }))
            );
        }

        await tx.delete(schema.serviceFaqs).where(eq(schema.serviceFaqs.serviceId, serviceRow.id));
        if (item.faqs.length > 0) {
            await tx.insert(schema.serviceFaqs).values(
                item.faqs.map((faq, position) => ({
                    serviceId: serviceRow.id,
                    position,
                    questionId: faq.questionId,
                    questionEn: faq.questionEn,
                    answerId: faq.answerId,
                    answerEn: faq.answerEn
                }))
            );
        }

        await tx.delete(schema.serviceReferenceLinks).where(eq(schema.serviceReferenceLinks.serviceId, serviceRow.id));
        const uniqueRefCodes = [...new Set(item.referenceCodes)];
        const refLinkValues = uniqueRefCodes
            .map((code, position) => {
                const referenceId = referenceIdByCode.get(code);
                if (!referenceId) return null;
                return {
                    serviceId: serviceRow.id,
                    referenceId,
                    position
                };
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
        if (refLinkValues.length > 0) {
            await tx.insert(schema.serviceReferenceLinks).values(refLinkValues);
        }

        if (item.cardMedia) {
            await upsertServiceMedia(tx, serviceRow.id, 'cardCover', 0, item.cardMedia);
        }

        for (let pos = 0; pos < item.reportPreviews.length; pos++) {
            await upsertServiceMedia(tx, serviceRow.id, 'reportPreview', pos, item.reportPreviews[pos]!);
        }
    }

    let programPriceCount = 0;
    for (const program of serviceProgramSeedFixtures) {
        const [programRow] = await tx
            .insert(schema.servicePrograms)
            .values({
                slug: program.slug,
                programType: program.programType,
                status: program.status,
                startsOn: program.startsOn,
                endsOn: program.endsOn
            })
            .onConflictDoUpdate({
                target: schema.servicePrograms.slug,
                set: {
                    programType: program.programType,
                    status: program.status,
                    startsOn: program.startsOn,
                    endsOn: program.endsOn,
                    updatedAt: sql`now()`
                }
            })
            .returning({ id: schema.servicePrograms.id });

        if (!programRow) throw new Error(`Program upsert returned no row for ${program.slug}`);

        for (const [locale, name, badge] of [
            ['id', program.nameId, program.badgeId],
            ['en', program.nameEn, program.badgeEn]
        ] as const) {
            await tx
                .insert(schema.serviceProgramTranslations)
                .values({ programId: programRow.id, locale, name, badge })
                .onConflictDoUpdate({
                    target: [schema.serviceProgramTranslations.programId, schema.serviceProgramTranslations.locale],
                    set: { name, badge }
                });
        }

        for (const price of program.prices) {
            const variantId = variantIdBySlug.get(price.variantSlug);
            if (!variantId) continue;

            await tx
                .insert(schema.serviceProgramPrices)
                .values({
                    programId: programRow.id,
                    variantId,
                    promoAmount: price.promoAmount,
                    noteId: price.noteId,
                    noteEn: price.noteEn
                })
                .onConflictDoUpdate({
                    target: [schema.serviceProgramPrices.programId, schema.serviceProgramPrices.variantId],
                    set: {
                        promoAmount: price.promoAmount,
                        noteId: price.noteId,
                        noteEn: price.noteEn,
                        updatedAt: sql`now()`
                    }
                });
            programPriceCount += 1;
        }
    }

    // Seed Phase 3 internal/draft/archived catalog records + isolated internal cost/issue tables
    for (const item of internalServiceSeedFixtures) {
        const categoryId = categoryIdBySlug.get(item.categorySlug);
        if (!categoryId) continue;
        const subgroupId = item.subgroupSlug ? (subgroupIdBySlug.get(item.subgroupSlug) ?? null) : null;

        const [serviceRow] = await tx
            .insert(schema.services)
            .values({
                slug: item.slug,
                categoryId,
                subgroupId,
                serviceType: item.serviceType,
                pricingModel: item.pricingModel,
                status: item.status,
                visibility: item.visibility,
                appliesNewClientFee: item.appliesNewClientFee,
                isAssessment: item.isAssessment,
                isFeaturedSpotlight: item.isFeaturedSpotlight,
                position: item.position,
                externalUrl: item.externalUrl,
                defaultConcernId: item.defaultConcernId,
                defaultClientCategory: item.defaultClientCategory,
                audiencesJson: JSON.stringify(item.audiences),
                demoConfigJson: null
            })
            .onConflictDoUpdate({
                target: schema.services.slug,
                set: {
                    categoryId,
                    subgroupId,
                    serviceType: item.serviceType,
                    pricingModel: item.pricingModel,
                    status: item.status,
                    visibility: item.visibility,
                    appliesNewClientFee: item.appliesNewClientFee,
                    isAssessment: item.isAssessment,
                    isFeaturedSpotlight: item.isFeaturedSpotlight,
                    position: item.position,
                    externalUrl: item.externalUrl,
                    audiencesJson: JSON.stringify(item.audiences),
                    updatedAt: sql`now()`
                }
            })
            .returning({ id: schema.services.id });

        if (!serviceRow) continue;
        serviceIdBySlug.set(item.slug, serviceRow.id);

        for (const locale of ['id', 'en'] as const) {
            const tr = item.translations[locale];
            await tx
                .insert(schema.serviceTranslations)
                .values({
                    serviceId: serviceRow.id,
                    locale,
                    name: tr.name,
                    fullName: tr.fullName,
                    badge: tr.badge,
                    shortSummary: tr.shortSummary,
                    benefit: tr.benefit,
                    introduction: tr.introduction,
                    targetAudience: tr.targetAudience,
                    whatIsMeasured: tr.whatIsMeasured,
                    durationInfo: tr.durationInfo,
                    locationInfo: tr.locationInfo,
                    processStepsJson: JSON.stringify(tr.processSteps),
                    termsJson: JSON.stringify(tr.terms),
                    resultsExplanation: tr.resultsExplanation,
                    scientificBasis: tr.scientificBasis,
                    citationSummary: tr.citationSummary,
                    assessmentPurpose: tr.assessmentPurpose,
                    assessmentAspects: tr.assessmentAspects,
                    assessmentAgeRange: tr.assessmentAgeRange,
                    assessmentMethod: tr.assessmentMethod,
                    assessmentPrep: tr.assessmentPrep,
                    assessmentOutputFormat: tr.assessmentOutputFormat,
                    assessmentDimensionsJson: JSON.stringify(tr.assessmentDimensions),
                    assessmentReportType: tr.assessmentReportType,
                    assessmentInterpretation: tr.assessmentInterpretation,
                    assessmentRecommendations: tr.assessmentRecommendations,
                    assessmentTurnaround: tr.assessmentTurnaround
                })
                .onConflictDoUpdate({
                    target: [schema.serviceTranslations.serviceId, schema.serviceTranslations.locale],
                    set: {
                        name: tr.name,
                        fullName: tr.fullName,
                        badge: tr.badge,
                        shortSummary: tr.shortSummary,
                        benefit: tr.benefit,
                        introduction: tr.introduction,
                        targetAudience: tr.targetAudience,
                        whatIsMeasured: tr.whatIsMeasured,
                        durationInfo: tr.durationInfo,
                        locationInfo: tr.locationInfo,
                        processStepsJson: JSON.stringify(tr.processSteps),
                        termsJson: JSON.stringify(tr.terms),
                        resultsExplanation: tr.resultsExplanation,
                        scientificBasis: tr.scientificBasis,
                        citationSummary: tr.citationSummary
                    }
                });
        }

        for (const variant of item.variants) {
            const [variantRow] = await tx
                .insert(schema.serviceVariants)
                .values({
                    serviceId: serviceRow.id,
                    slug: variant.slug,
                    position: variant.position,
                    status: variant.status,
                    visibility: variant.visibility,
                    modalitiesJson: JSON.stringify(variant.modalities),
                    branch: variant.branch,
                    priceOnRequest: variant.priceOnRequest
                })
                .onConflictDoUpdate({
                    target: schema.serviceVariants.slug,
                    set: {
                        serviceId: serviceRow.id,
                        position: variant.position,
                        status: variant.status,
                        visibility: variant.visibility,
                        modalitiesJson: JSON.stringify(variant.modalities),
                        branch: variant.branch,
                        priceOnRequest: variant.priceOnRequest,
                        updatedAt: sql`now()`
                    }
                })
                .returning({ id: schema.serviceVariants.id });

            if (!variantRow) continue;
            variantIdBySlug.set(variant.slug, variantRow.id);

            for (const [locale, name, description, unitLabel, ageRangeLabel, durationLabel] of [
                ['id', variant.nameId, variant.descriptionId, variant.unitLabelId, variant.ageRangeLabelId, variant.durationLabelId],
                ['en', variant.nameEn, variant.descriptionEn, variant.unitLabelEn, variant.ageRangeLabelEn, variant.durationLabelEn]
            ] as const) {
                await tx
                    .insert(schema.serviceVariantTranslations)
                    .values({
                        variantId: variantRow.id,
                        locale,
                        name,
                        description,
                        unitLabel,
                        ageRangeLabel,
                        durationLabel
                    })
                    .onConflictDoUpdate({
                        target: [schema.serviceVariantTranslations.variantId, schema.serviceVariantTranslations.locale],
                        set: { name, description, unitLabel, ageRangeLabel, durationLabel }
                    });
            }

            if (variant.publicPrice) {
                await tx
                    .insert(schema.servicePublicPrices)
                    .values({
                        variantId: variantRow.id,
                        amount: variant.publicPrice.amount,
                        amountMax: variant.publicPrice.amountMax,
                        effectiveDate: variant.publicPrice.effectiveDate
                    })
                    .onConflictDoUpdate({
                        target: schema.servicePublicPrices.variantId,
                        set: {
                            amount: variant.publicPrice.amount,
                            amountMax: variant.publicPrice.amountMax,
                            effectiveDate: variant.publicPrice.effectiveDate,
                            updatedAt: sql`now()`
                        }
                    });
            }
        }

        await tx.delete(schema.servicePsychologists).where(eq(schema.servicePsychologists.serviceId, serviceRow.id));
        const seenPsychIds = new Set<string>();
        const linkValues = item.psychologists
            .map((link) => {
                const psychologistId = psychologistIdBySlug.get(link.slug);
                if (!psychologistId || seenPsychIds.has(psychologistId)) return null;
                seenPsychIds.add(psychologistId);
                return {
                    serviceId: serviceRow.id,
                    psychologistId,
                    position: seenPsychIds.size - 1,
                    noteId: link.noteId,
                    noteEn: link.noteEn
                };
            })
            .filter((entry): entry is NonNullable<typeof entry> => entry !== null);
        if (linkValues.length > 0) {
            await tx.insert(schema.servicePsychologists).values(linkValues);
        }

        await tx.delete(schema.serviceDeliverables).where(eq(schema.serviceDeliverables.serviceId, serviceRow.id));
        if (item.deliverables.length > 0) {
            await tx.insert(schema.serviceDeliverables).values(
                item.deliverables.map((d, position) => ({
                    serviceId: serviceRow.id,
                    position,
                    variantSlugsJson: JSON.stringify(d.variantSlugs),
                    textId: d.textId,
                    textEn: d.textEn
                }))
            );
        }

        await tx.delete(schema.serviceFaqs).where(eq(schema.serviceFaqs.serviceId, serviceRow.id));
        if (item.faqs.length > 0) {
            await tx.insert(schema.serviceFaqs).values(
                item.faqs.map((faq, position) => ({
                    serviceId: serviceRow.id,
                    position,
                    questionId: faq.questionId,
                    questionEn: faq.questionEn,
                    answerId: faq.answerId,
                    answerEn: faq.answerEn
                }))
            );
        }
    }

    for (const cost of internalCostSeedFixtures) {
        const serviceId = serviceIdBySlug.get(cost.serviceSlug);
        if (!serviceId) continue;
        const variantId = cost.variantSlug ? (variantIdBySlug.get(cost.variantSlug) ?? null) : null;
        const psychologistId = cost.psychologistSlug ? (psychologistIdBySlug.get(cost.psychologistSlug) ?? null) : null;
        const sourcePayload =
            cost.variantSlug && !variantId
                ? JSON.stringify({ ...JSON.parse(cost.sourceMeta || '{}'), archivedVariantSlug: cost.variantSlug })
                : cost.sourceMeta;

        await tx
            .insert(schema.serviceInternalCosts)
            .values({
                legacyId: cost.legacyId,
                serviceId,
                variantId,
                psychologistId,
                recordKind: cost.recordKind,
                recordStatus: cost.recordStatus,
                amount: cost.amount,
                amountMax: cost.amountMax,
                unitLabel: cost.unitLabel,
                effectiveDate: cost.effectiveDate,
                label: cost.label,
                note: cost.note,
                sourceMetaJson: sourcePayload
            })
            .onConflictDoUpdate({
                target: schema.serviceInternalCosts.legacyId,
                set: {
                    serviceId,
                    variantId,
                    psychologistId,
                    recordKind: cost.recordKind,
                    recordStatus: cost.recordStatus,
                    amount: cost.amount,
                    amountMax: cost.amountMax,
                    unitLabel: cost.unitLabel,
                    effectiveDate: cost.effectiveDate,
                    label: cost.label,
                    note: cost.note,
                    sourceMetaJson: sourcePayload,
                    updatedAt: sql`now()`
                }
            });
    }

    for (const issue of serviceDataIssueSeedFixtures) {
        await tx
            .insert(schema.serviceDataIssues)
            .values({
                code: issue.code,
                issueType: issue.issueType,
                title: issue.title,
                detail: issue.detail,
                status: issue.status,
                resolution: issue.resolution,
                refsJson: JSON.stringify(issue.refs),
                createdAt: issue.createdAt,
                resolvedAt: issue.resolvedAt
            })
            .onConflictDoUpdate({
                target: schema.serviceDataIssues.code,
                set: {
                    issueType: issue.issueType,
                    title: issue.title,
                    detail: issue.detail,
                    refsJson: JSON.stringify(issue.refs),
                    updatedAt: sql`now()`
                }
            });
    }

    await tx
        .insert(schema.serviceOpsSettings)
        .values({
            singletonKey: true,
            marginThreshold: serviceOpsSettingsSeedFixture.marginThreshold,
            assumptionsJson: JSON.stringify(serviceOpsSettingsSeedFixture.assumptions)
        })
        .onConflictDoUpdate({
            target: schema.serviceOpsSettings.singletonKey,
            set: {
                marginThreshold: serviceOpsSettingsSeedFixture.marginThreshold,
                assumptionsJson: JSON.stringify(serviceOpsSettingsSeedFixture.assumptions),
                updatedAt: sql`now()`
            }
        });

    return {
        categories: allCategoryFixtures.length,
        subgroups: allSubgroupFixtures.length,
        references: serviceReferenceSeedFixtures.length,
        services: serviceSeedFixtures.length + internalServiceSeedFixtures.length,
        variants: variantCount,
        publicPrices: publicPriceCount,
        programs: serviceProgramSeedFixtures.length,
        programPrices: programPriceCount
    };
});

export const bootstrapServices = async (
    database: PostgresJsDatabase<typeof schema>
): Promise<ServicesSeedSummary> => {
    const [existing] = await database.select({ total: count() }).from(schema.services);
    if ((existing?.total ?? 0) > 0) {
        return { status: 'alreadyInitialized' };
    }
    return {
        status: 'seeded',
        result: await seedServices(database)
    };
};

const runServicesSeed = async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is required to seed services.');
        process.exitCode = 1;
        return;
    }

    let parsedDatabaseUrl: URL;
    try {
        parsedDatabaseUrl = new URL(databaseUrl);
    } catch {
        console.error('DATABASE_URL must be a valid PostgreSQL URL.');
        process.exitCode = 1;
        return;
    }

    if (parsedDatabaseUrl.protocol !== 'postgres:' && parsedDatabaseUrl.protocol !== 'postgresql:') {
        console.error('DATABASE_URL must use the postgres or postgresql protocol.');
        process.exitCode = 1;
        return;
    }

    const queryClient = postgres(databaseUrl, { max: 1 });
    const database = drizzle(queryClient, { schema });

    try {
        const force = process.argv.includes('--force') || process.argv.includes('--upsert');
        const result = force
            ? { status: 'seeded' as const, result: await seedServices(database) }
            : await bootstrapServices(database);
        console.info(
            result.status === 'seeded'
                ? `Seeded ${result.result?.services ?? 0} service records (${result.result?.variants ?? 0} variants).`
                : 'Services catalog already initialized.'
        );
    } catch (error) {
        console.error('Services seed failed.', error);
        process.exitCode = 1;
    } finally {
        await queryClient.end();
    }
};

if (import.meta.main) {
    await runServicesSeed();
}
