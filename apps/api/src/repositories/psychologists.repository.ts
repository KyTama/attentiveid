import { and, asc, count, eq, gte, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    CONTENT_LOCALES,
    validateMediaMutation,
    validatePsychologistPublicLookup,
    type FullPsychologistMutation,
    type LocalizedText,
    type MediaReferencePolicy,
    type PsychologistMutation,
    type PsychologistPublicLookup
} from '@attentiveid/shared';
import * as schema from '../db/schema';

type ContentLocale = typeof CONTENT_LOCALES[number];
type PsychologistStatus = typeof schema.psychologistLifecycleStatusEnum.enumValues[number];
type SupportArea = typeof schema.psychologistSupportAreaEnum.enumValues[number];

export interface CanonicalPsychologistRow {
    id: string;
    slug: string;
    status: PsychologistStatus;
    name: string;
    nickname: string;
    featured: boolean;
    featuredOrder: number | null;
    credential: string;
    experienceYears: number;
    licenseNumber: string;
    bookingUrl: string;
    premiumBookingUrl: string | null;
    biography: LocalizedText;
    availabilityMessage: LocalizedText;
    supportAreas: readonly {
        supportArea: SupportArea;
        primary: boolean;
        position: number;
    }[];
    specializations: readonly {
        id: string;
        position: number;
        label: LocalizedText;
    }[];
    media?: {
        reference: string;
        width: number;
        height: number;
        alt: LocalizedText;
    };
}

export interface NormalizedPsychologistQuery {
    locale: ContentLocale;
    search?: string;
    supportArea?: SupportArea;
    minimumExperienceYears?: number;
    featuredOnly: boolean;
    limit: number;
    offset: number;
}

export interface PsychologistAdminQuery {
    status?: PsychologistStatus;
    search?: string;
    supportArea?: SupportArea;
    limit?: number;
    offset?: number;
}

export interface PsychologistQuerySource {
    listActive(query: NormalizedPsychologistQuery): Promise<readonly CanonicalPsychologistRow[]>;
    listAllAdmin?(query: PsychologistAdminQuery): Promise<{ psychologists: readonly CanonicalPsychologistRow[]; total: number }>;
    findById?(id: string): Promise<CanonicalPsychologistRow | null>;
    findBySlug(slug: string): Promise<CanonicalPsychologistRow | null>;
    savePsychologist?(id: string | undefined, input: FullPsychologistMutation): Promise<CanonicalPsychologistRow>;
    updateStatus?(id: string, status: PsychologistStatus): Promise<CanonicalPsychologistRow | null>;
}

export interface PsychologistListQuery {
    locale: ContentLocale;
    search?: string;
    supportArea?: SupportArea;
    minimumExperienceYears?: number;
    limit?: number;
    offset?: number;
}

export interface PsychologistPublicProjection {
    id: string;
    slug: string;
    name: string;
    nickname: string;
    credential: string;
    supportArea: SupportArea;
    supportAreas: SupportArea[];
    specializations: string[];
    experienceYears: number;
    licenseNumber: string;
    bookingUrl: string;
    premiumBookingUrl: string | null;
    featured: boolean;
    featuredOrder: number | null;
    biography: string;
    availabilityMessage: string;
    media?: {
        url: string;
        width: number;
        height: number;
        alt: LocalizedText;
    };
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, '\\$&');

export const mapPsychologistMutation = (input: PsychologistMutation) => ({
    psychologist: {
        slug: input.slug,
        name: input.name,
        nickname: input.nickname,
        featured: input.featured,
        featuredOrder: input.featuredOrder
    },
    profile: {
        credential: input.credential,
        experienceYears: input.experienceYears,
        licenseNumber: input.licenseNumber,
        bookingUrl: input.bookingUrl
    },
    primarySupportArea: input.supportArea,
    specializations: input.specializations.map((label, position) => ({ label, position }))
});

const normalizeQuery = (query: PsychologistListQuery, featuredOnly: boolean): NormalizedPsychologistQuery => {
    const search = query.search?.trim();
    return {
        locale: query.locale,
        ...(search ? { search: escapeLikePattern(search) } : {}),
        ...(query.supportArea ? { supportArea: query.supportArea } : {}),
        ...(query.minimumExperienceYears === undefined
            ? {}
            : { minimumExperienceYears: Math.max(0, Math.min(80, query.minimumExperienceYears)) }),
        featuredOnly,
        limit: Math.max(1, Math.min(50, query.limit ?? 20)),
        offset: Math.max(0, query.offset ?? 0)
    };
};

const toMediaUrl = (reference: string) => reference.startsWith('media/') ? `/${reference}` : reference;

const toPublicProjection = (
    row: CanonicalPsychologistRow,
    locale: ContentLocale,
    mediaPolicy: MediaReferencePolicy
): PsychologistPublicProjection | null => {
    const primarySupportArea = [...row.supportAreas]
        .sort((left, right) => left.position - right.position)
        .find(({ primary }) => primary)?.supportArea;
    if (!primarySupportArea) {
        return null;
    }

    const specializations = [...row.specializations]
        .sort((left, right) => left.position - right.position)
        .map(({ label }) => label[locale]);
    const media = row.media && validateMediaMutation(row.media, mediaPolicy)
        ? {
            url: toMediaUrl(row.media.reference),
            width: row.media.width,
            height: row.media.height,
            alt: row.media.alt
        }
        : undefined;
    const lookup: PsychologistPublicLookup = {
        status: 'found',
        psychologist: {
            id: row.id,
            slug: row.slug,
            name: row.name,
            nickname: row.nickname,
            credential: row.credential,
            supportArea: primarySupportArea,
            specializations,
            experienceYears: row.experienceYears,
            licenseNumber: row.licenseNumber,
            bookingUrl: row.bookingUrl,
            featured: row.featured,
            featuredOrder: row.featuredOrder,
            ...(media ? { media } : {})
        }
    };
    if (!validatePsychologistPublicLookup(lookup)) {
        return null;
    }

    return {
        id: lookup.psychologist.id,
        slug: lookup.psychologist.slug,
        name: lookup.psychologist.name,
        nickname: lookup.psychologist.nickname,
        credential: lookup.psychologist.credential,
        supportArea: lookup.psychologist.supportArea,
        supportAreas: [...row.supportAreas]
            .sort((left, right) => left.position - right.position)
            .map(({ supportArea }) => supportArea),
        specializations: lookup.psychologist.specializations,
        experienceYears: lookup.psychologist.experienceYears,
        licenseNumber: row.licenseNumber,
        bookingUrl: lookup.psychologist.bookingUrl,
        premiumBookingUrl: row.premiumBookingUrl,
        featured: lookup.psychologist.featured,
        featuredOrder: lookup.psychologist.featuredOrder,
        biography: row.biography[locale],
        availabilityMessage: row.availabilityMessage[locale],
        ...(lookup.psychologist.media ? { media: lookup.psychologist.media } : {})
    };
};

export const createPsychologistsRepository = (
    source: PsychologistQuerySource,
    mediaPolicy: MediaReferencePolicy
) => ({
    async list(query: PsychologistListQuery): Promise<PsychologistPublicProjection[]> {
        const normalizedQuery = normalizeQuery(query, false);
        const rows = await source.listActive(normalizedQuery);
        return rows
            .map((row) => toPublicProjection(row, normalizedQuery.locale, mediaPolicy))
            .filter((row): row is PsychologistPublicProjection => row !== null);
    },

    async featured(locale: ContentLocale): Promise<PsychologistPublicProjection[]> {
        const query = normalizeQuery({ locale, limit: 50 }, true);
        const rows = await source.listActive(query);
        return rows
            .map((row) => toPublicProjection(row, locale, mediaPolicy))
            .filter((row): row is PsychologistPublicProjection => row !== null)
            .sort((left, right) => (left.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (right.featuredOrder ?? Number.MAX_SAFE_INTEGER));
    },

    async getBySlug(slug: string, locale: ContentLocale): Promise<
        | { status: 'found'; psychologist: PsychologistPublicProjection }
        | { status: 'unavailable'; psychologist: { slug: string; name: string; nickname: string } }
        | { status: 'notFound' }
    > {
        if (!slugPattern.test(slug)) {
            return { status: 'notFound' };
        }
        const row = await source.findBySlug(slug);
        if (!row || row.status === 'draft') {
            return { status: 'notFound' };
        }
        if (row.status === 'inactive' || row.status === 'archived') {
            return {
                status: 'unavailable',
                psychologist: { slug: row.slug, name: row.name, nickname: row.nickname }
            };
        }
        const psychologist = toPublicProjection(row, locale, mediaPolicy);
        return psychologist ? { status: 'found', psychologist } : { status: 'notFound' };
    },

    async listAdmin(query: PsychologistAdminQuery): Promise<{ psychologists: CanonicalPsychologistRow[]; total: number }> {
        if (!source.listAllAdmin) return { psychologists: [], total: 0 };
        const result = await source.listAllAdmin(query);
        return { psychologists: [...result.psychologists], total: result.total };
    },

    async getAdminById(id: string): Promise<CanonicalPsychologistRow | null> {
        if (!source.findById) return null;
        return source.findById(id);
    },

    async saveAdmin(id: string | undefined, input: FullPsychologistMutation): Promise<CanonicalPsychologistRow> {
        if (!source.savePsychologist) throw new Error('savePsychologist source method not implemented');
        return source.savePsychologist(id, input);
    },

    async updateStatusAdmin(id: string, status: PsychologistStatus): Promise<CanonicalPsychologistRow | null> {
        if (!source.updateStatus) return null;
        return source.updateStatus(id, status);
    }
});

type DrizzlePsychologistBase = Omit<CanonicalPsychologistRow, 'biography' | 'availabilityMessage' | 'supportAreas' | 'specializations' | 'media'>;

const loadPsychologistRelations = async (
    database: PostgresJsDatabase<typeof schema>,
    base: DrizzlePsychologistBase
): Promise<CanonicalPsychologistRow | null> => {
    const profileTranslations = await database.select({
        locale: schema.psychologistProfileTranslations.locale,
        biography: schema.psychologistProfileTranslations.biography,
        availabilityMessage: schema.psychologistProfileTranslations.availabilityMessage
    }).from(schema.psychologistProfileTranslations)
        .where(eq(schema.psychologistProfileTranslations.psychologistId, base.id));
    const idProfile = profileTranslations.find(({ locale }) => locale === 'id');
    const enProfile = profileTranslations.find(({ locale }) => locale === 'en');
    if (!idProfile || !enProfile) {
        return null;
    }

    const supportAreas = await database.select({
        supportArea: schema.psychologistSupportAreas.supportArea,
        primary: schema.psychologistSupportAreas.primary,
        position: schema.psychologistSupportAreas.position
    }).from(schema.psychologistSupportAreas)
        .where(eq(schema.psychologistSupportAreas.psychologistId, base.id))
        .orderBy(asc(schema.psychologistSupportAreas.position));
    const specializationRows = await database.select({
        id: schema.psychologistSpecializations.id,
        position: schema.psychologistSpecializations.position,
        locale: schema.psychologistSpecializationTranslations.locale,
        label: schema.psychologistSpecializationTranslations.label
    }).from(schema.psychologistSpecializations)
        .innerJoin(
            schema.psychologistSpecializationTranslations,
            eq(schema.psychologistSpecializationTranslations.specializationId, schema.psychologistSpecializations.id)
        )
        .where(eq(schema.psychologistSpecializations.psychologistId, base.id))
        .orderBy(asc(schema.psychologistSpecializations.position));
    const specializationMap = new Map<string, CanonicalPsychologistRow['specializations'][number]>();
    for (const row of specializationRows) {
        const current = specializationMap.get(row.id) ?? {
            id: row.id,
            position: row.position,
            label: { id: '', en: '' }
        };
        current.label[row.locale] = row.label;
        specializationMap.set(row.id, current);
    }
    const specializations = [...specializationMap.values()];
    if (specializations.some(({ label }) => !label.id || !label.en)) {
        return null;
    }

    const [media] = await database.select({
        objectKey: schema.mediaObjects.objectKey,
        publicUrl: schema.mediaObjects.publicUrl,
        width: schema.mediaObjects.width,
        height: schema.mediaObjects.height,
        altId: schema.mediaObjects.altId,
        altEn: schema.mediaObjects.altEn
    }).from(schema.mediaAttachments)
        .innerJoin(schema.mediaObjects, eq(schema.mediaObjects.id, schema.mediaAttachments.mediaObjectId))
        .where(and(
            eq(schema.mediaAttachments.psychologistId, base.id),
            eq(schema.mediaAttachments.role, 'profilePhoto'),
            eq(schema.mediaObjects.lifecycle, 'active'),
            sql`${schema.mediaAttachments.detachedAt} is null`
        ))
        .limit(1);
    const reference = media?.objectKey ?? media?.publicUrl ?? null;

    return {
        ...base,
        biography: { id: idProfile.biography, en: enProfile.biography },
        availabilityMessage: {
            id: idProfile.availabilityMessage,
            en: enProfile.availabilityMessage
        },
        supportAreas,
        specializations,
        ...(media && reference
            ? {
                media: {
                    reference,
                    width: media.width,
                    height: media.height,
                    alt: { id: media.altId, en: media.altEn }
                }
            }
            : {})
    };
};

const selectPsychologistBase = {
    id: schema.psychologists.id,
    slug: schema.psychologists.slug,
    status: schema.psychologists.status,
    name: schema.psychologists.name,
    nickname: schema.psychologists.nickname,
    featured: schema.psychologists.featured,
    featuredOrder: schema.psychologists.featuredOrder,
    credential: schema.psychologistProfiles.credential,
    experienceYears: schema.psychologistProfiles.experienceYears,
    licenseNumber: schema.psychologistProfiles.licenseNumber,
    bookingUrl: schema.psychologistProfiles.bookingUrl,
    premiumBookingUrl: schema.psychologistProfiles.premiumBookingUrl
} as const;

export const createDrizzlePsychologistQuerySource = (
    database: PostgresJsDatabase<typeof schema>
): PsychologistQuerySource => ({
    async listActive(query) {
        const conditions = [eq(schema.psychologists.status, 'active')];
        if (query.featuredOnly) {
            conditions.push(eq(schema.psychologists.featured, true));
        }
        if (query.minimumExperienceYears !== undefined) {
            conditions.push(gte(schema.psychologistProfiles.experienceYears, query.minimumExperienceYears));
        }
        if (query.search) {
            const pattern = `%${query.search}%`;
            conditions.push(sql`(
                ${schema.psychologists.name} ilike ${pattern} escape '\\'
                or ${schema.psychologists.nickname} ilike ${pattern} escape '\\'
                or exists (
                    select 1
                    from ${schema.psychologistSpecializations}
                    inner join ${schema.psychologistSpecializationTranslations}
                        on ${schema.psychologistSpecializationTranslations.specializationId} = ${schema.psychologistSpecializations.id}
                    where ${schema.psychologistSpecializations.psychologistId} = ${schema.psychologists.id}
                    and ${schema.psychologistSpecializationTranslations.locale} = ${query.locale}
                    and ${schema.psychologistSpecializationTranslations.label} ilike ${pattern} escape '\\'
                )
            )`);
        }
        if (query.supportArea) {
            conditions.push(sql`exists (
                select 1 from ${schema.psychologistSupportAreas}
                where ${schema.psychologistSupportAreas.psychologistId} = ${schema.psychologists.id}
                and ${schema.psychologistSupportAreas.supportArea} = ${query.supportArea}
            )`);
        }

        const baseRows = await database.select(selectPsychologistBase)
            .from(schema.psychologists)
            .innerJoin(schema.psychologistProfiles, eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id))
            .where(and(...conditions))
            .orderBy(asc(schema.psychologists.featuredOrder), asc(schema.psychologists.name))
            .limit(query.limit)
            .offset(query.offset);
        const rows = await Promise.all(baseRows.map((row) => loadPsychologistRelations(database, row)));
        return rows.filter((row): row is CanonicalPsychologistRow => row !== null);
    },

    async findBySlug(slug) {
        const [base] = await database.select(selectPsychologistBase)
            .from(schema.psychologists)
            .innerJoin(schema.psychologistProfiles, eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id))
            .where(eq(schema.psychologists.slug, slug))
            .limit(1);
        return base ? loadPsychologistRelations(database, base) : null;
    },

    async listAllAdmin(query) {
        const conditions: any[] = [];
        if (query.status) {
            conditions.push(eq(schema.psychologists.status, query.status));
        }
        if (query.search) {
            const pattern = `%${escapeLikePattern(query.search.trim())}%`;
            conditions.push(sql`(${schema.psychologists.name} ilike ${pattern} escape '\\' or ${schema.psychologists.nickname} ilike ${pattern} escape '\\')`);
        }
        if (query.supportArea) {
            conditions.push(sql`exists (
                select 1 from ${schema.psychologistSupportAreas}
                where ${schema.psychologistSupportAreas.psychologistId} = ${schema.psychologists.id}
                and ${schema.psychologistSupportAreas.supportArea} = ${query.supportArea}
            )`);
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const limit = Math.max(1, Math.min(100, query.limit ?? 20));
        const offset = Math.max(0, query.offset ?? 0);

        const baseRows = await database.select(selectPsychologistBase)
            .from(schema.psychologists)
            .innerJoin(schema.psychologistProfiles, eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id))
            .where(whereClause)
            .orderBy(asc(schema.psychologists.name))
            .limit(limit)
            .offset(offset);

        const [{ totalCount }] = await database.select({ totalCount: count() })
            .from(schema.psychologists)
            .innerJoin(schema.psychologistProfiles, eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id))
            .where(whereClause);

        const rows = await Promise.all(baseRows.map((row) => loadPsychologistRelations(database, row)));
        return {
            psychologists: rows.filter((row): row is CanonicalPsychologistRow => row !== null),
            total: Number(totalCount || 0)
        };
    },

    async findById(id) {
        const [base] = await database.select(selectPsychologistBase)
            .from(schema.psychologists)
            .innerJoin(schema.psychologistProfiles, eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id))
            .where(eq(schema.psychologists.id, id))
            .limit(1);
        return base ? loadPsychologistRelations(database, base) : null;
    },

    async updateStatus(id, status) {
        await database.update(schema.psychologists)
            .set({ status, updatedAt: sql`now()` })
            .where(eq(schema.psychologists.id, id));
        return this.findById!(id);
    },

    async savePsychologist(id, input) {
        return await database.transaction(async (tx) => {
            let psychologistId = id;
            if (psychologistId) {
                await tx.update(schema.psychologists)
                    .set({
                        slug: input.slug,
                        status: input.status,
                        name: input.name,
                        nickname: input.nickname,
                        featured: input.featured,
                        featuredOrder: input.featured ? (input.featuredOrder ?? null) : null,
                        updatedAt: sql`now()`
                    })
                    .where(eq(schema.psychologists.id, psychologistId));

                await tx.update(schema.psychologistProfiles)
                    .set({
                        credential: input.credential,
                        experienceYears: input.experienceYears,
                        licenseNumber: input.licenseNumber,
                        bookingUrl: input.bookingUrl,
                        premiumBookingUrl: input.premiumBookingUrl || null,
                        updatedAt: sql`now()`
                    })
                    .where(eq(schema.psychologistProfiles.psychologistId, psychologistId));
            } else {
                const [inserted] = await tx.insert(schema.psychologists)
                    .values({
                        slug: input.slug,
                        status: input.status,
                        name: input.name,
                        nickname: input.nickname,
                        featured: input.featured,
                        featuredOrder: input.featured ? (input.featuredOrder ?? null) : null
                    })
                    .returning({ id: schema.psychologists.id });
                psychologistId = inserted.id;

                await tx.insert(schema.psychologistProfiles)
                    .values({
                        psychologistId,
                        credential: input.credential,
                        experienceYears: input.experienceYears,
                        licenseNumber: input.licenseNumber,
                        bookingUrl: input.bookingUrl,
                        premiumBookingUrl: input.premiumBookingUrl || null
                    });
            }

            // Update Profile Translations
            await tx.delete(schema.psychologistProfileTranslations)
                .where(eq(schema.psychologistProfileTranslations.psychologistId, psychologistId));

            await tx.insert(schema.psychologistProfileTranslations)
                .values([
                    {
                        psychologistId,
                        locale: 'id',
                        biography: input.biography.id,
                        availabilityMessage: input.availabilityMessage.id
                    },
                    {
                        psychologistId,
                        locale: 'en',
                        biography: input.biography.en,
                        availabilityMessage: input.availabilityMessage.en
                    }
                ]);

            // Update Support Areas
            await tx.delete(schema.psychologistSupportAreas)
                .where(eq(schema.psychologistSupportAreas.psychologistId, psychologistId));

            if (input.supportAreas && input.supportAreas.length > 0) {
                await tx.insert(schema.psychologistSupportAreas)
                    .values(input.supportAreas.map((sa: any, index: number) => ({
                        psychologistId,
                        supportArea: sa.supportArea,
                        primary: sa.primary ?? (index === 0),
                        position: index
                    })));
            }

            // Update Specializations
            const existingSpecializations = await tx.select({ id: schema.psychologistSpecializations.id })
                .from(schema.psychologistSpecializations)
                .where(eq(schema.psychologistSpecializations.psychologistId, psychologistId));
            for (const spec of existingSpecializations) {
                await tx.delete(schema.psychologistSpecializationTranslations)
                    .where(eq(schema.psychologistSpecializationTranslations.specializationId, spec.id));
            }
            await tx.delete(schema.psychologistSpecializations)
                .where(eq(schema.psychologistSpecializations.psychologistId, psychologistId));

            if (input.specializations && input.specializations.length > 0) {
                for (let pos = 0; pos < input.specializations.length; pos++) {
                    const specInput = input.specializations[pos];
                    const [spec] = await tx.insert(schema.psychologistSpecializations)
                        .values({ psychologistId, position: pos })
                        .returning({ id: schema.psychologistSpecializations.id });
                    await tx.insert(schema.psychologistSpecializationTranslations)
                        .values([
                            { specializationId: spec.id, locale: 'id', label: specInput.label.id },
                            { specializationId: spec.id, locale: 'en', label: specInput.label.en }
                        ]);
                }
            }

            // Media attachment handling
            if (input.media) {
                await tx.update(schema.mediaAttachments)
                    .set({ detachedAt: sql`now()` })
                    .where(and(
                        eq(schema.mediaAttachments.psychologistId, psychologistId),
                        eq(schema.mediaAttachments.role, 'profilePhoto')
                    ));

                const [existingMedia] = await tx.select({ id: schema.mediaObjects.id })
                    .from(schema.mediaObjects)
                    .where(eq(schema.mediaObjects.objectKey, input.media.reference))
                    .limit(1);

                let mediaObjectId = existingMedia?.id;
                if (!mediaObjectId) {
                    const [newMedia] = await tx.insert(schema.mediaObjects)
                        .values({
                            objectKey: input.media.reference,
                            width: input.media.width,
                            height: input.media.height,
                            altId: input.media.alt.id,
                            altEn: input.media.alt.en,
                            mimeType: 'image/webp',
                            lifecycle: 'active'
                        })
                        .returning({ id: schema.mediaObjects.id });
                    mediaObjectId = newMedia.id;
                }

                await tx.insert(schema.mediaAttachments)
                    .values({
                        mediaObjectId,
                        psychologistId,
                        role: 'profilePhoto',
                        position: 0
                    });
            }

            const [base] = await tx.select(selectPsychologistBase)
                .from(schema.psychologists)
                .innerJoin(schema.psychologistProfiles, eq(schema.psychologistProfiles.psychologistId, schema.psychologists.id))
                .where(eq(schema.psychologists.id, psychologistId))
                .limit(1);
            const canonical = await loadPsychologistRelations(tx as any, base);
            if (!canonical) throw new Error('Failed to load canonical psychologist row after save.');
            return canonical;
        });
    }
});
