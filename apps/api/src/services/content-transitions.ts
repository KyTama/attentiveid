import { and, eq, max, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    validateArticleDraftMutation,
    validateLandingContentMutation,
    type ArticleDraftMutation,
    type LandingContentMutation
} from '@attentiveid/shared';
import * as schema from '../db/schema';
import {
    createDrizzleLandingContentSource,
    mapLandingSectionMutation
} from '../repositories/landing-content.repository';
import { mapArticleDraftMutation } from '../repositories/articles.repository';
import type { AdminCapability, PsychologistAuthorCapability } from './authorization-capability';

type LandingRevisionStatus = typeof schema.landingRevisionStatusEnum.enumValues[number];
type PsychologistStatus = typeof schema.psychologistLifecycleStatusEnum.enumValues[number];
type ArticleStatus = typeof schema.articleStatusEnum.enumValues[number];
type ArticleRevisionStatus = typeof schema.articleRevisionStatusEnum.enumValues[number];

export interface LandingAggregateRecord {
    id: string;
    activeDraftRevisionId: string | null;
    publishedRevisionId: string | null;
}

export interface LandingRevisionRecord {
    id: string;
    aggregateId: string;
    revisionNumber: number;
    basedOnRevisionId: string | null;
    status: LandingRevisionStatus;
    content: LandingContentMutation;
}

export interface PsychologistLifecycleRecord {
    id: string;
    status: PsychologistStatus;
    featured: boolean;
    featuredOrder: number | null;
}

export interface ArticleRecord {
    id: string;
    ownerPsychologistId: string;
    slug: string;
    status: ArticleStatus;
    draftRevisionId: string | null;
    publishedRevisionId: string | null;
}

export interface ArticleRevisionRecord {
    id: string;
    articleId: string;
    revisionNumber: number;
    status: ArticleRevisionStatus;
    input: ArticleDraftMutation;
    submittedAt: string | null;
    approvedAt: string | null;
}

export interface MediaAttachmentRecord {
    id: string;
    mediaObjectId: string;
    detachedAt: string | null;
}

export interface ContentTransitionTransaction {
    getLandingAggregate(): Promise<LandingAggregateRecord | null>;
    getLandingRevision(id: string): Promise<LandingRevisionRecord | null>;
    createLandingDraft(input: {
        content: LandingContentMutation;
        basedOnRevisionId: string | null;
    }): Promise<LandingRevisionRecord>;
    publishLandingRevision(input: {
        aggregateId: string;
        revisionId: string;
        publishedAt: string;
    }): Promise<void>;
    getPsychologist(id: string): Promise<PsychologistLifecycleRecord | null>;
    updatePsychologist(input: {
        id: string;
        status?: PsychologistStatus;
        featured?: boolean;
        featuredOrder?: number | null;
    }): Promise<void>;
    getArticle(id: string): Promise<ArticleRecord | null>;
    getArticleRevision(id: string): Promise<ArticleRevisionRecord | null>;
    createArticleDraft(input: {
        ownerPsychologistId: string;
        articleId: string | null;
        input: ArticleDraftMutation;
    }): Promise<{ article: ArticleRecord; revision: ArticleRevisionRecord }>;
    updateArticleDraft(revisionId: string, input: ArticleDraftMutation): Promise<void>;
    updateArticleRevision(input: {
        id: string;
        status: ArticleRevisionStatus;
        submittedAt?: string | null;
        approvedAt?: string | null;
    }): Promise<void>;
    updateArticle(input: {
        id: string;
        status?: ArticleStatus;
        draftRevisionId?: string | null;
        publishedRevisionId?: string | null;
        archivedAt?: string | null;
    }): Promise<void>;
    addArticleReview(input: {
        revisionId: string;
        reviewerId: string;
        decision: 'approved' | 'rejected';
        notes: string;
    }): Promise<void>;
    getMediaAttachment(id: string): Promise<MediaAttachmentRecord | null>;
    detachMediaAttachment(id: string, detachedAt: string): Promise<void>;
    hasActiveMediaAttachments(mediaObjectId: string): Promise<boolean>;
    markMediaOrphaned(mediaObjectId: string, orphanedAt: string): Promise<void>;
}

export interface ContentTransitionDatabase {
    transaction<Result>(operation: (transaction: ContentTransitionTransaction) => Promise<Result>): Promise<Result>;
}

const timestamp = () => new Date().toISOString();

const assertAdmin = (capability: AdminCapability) => {
    if (capability.kind !== 'admin' || capability.assurance !== 'callerSupplied') {
        throw new Error('Admin capability required.');
    }
};

const assertAuthor = (capability: PsychologistAuthorCapability, ownerPsychologistId: string) => {
    if (capability.kind !== 'psychologistAuthor'
        || capability.assurance !== 'callerSupplied'
        || capability.psychologistId !== ownerPsychologistId) {
        throw new Error('Article author capability mismatch.');
    }
};

const assertTimestamp = (value: string) => {
    if (!Number.isFinite(Date.parse(value))) {
        throw new Error('Invalid transition timestamp.');
    }
};

export const isPsychologistReservationEligible = (psychologist: PsychologistLifecycleRecord) => (
    psychologist.status === 'active'
);

const psychologistTransitions: Record<PsychologistStatus, readonly PsychologistStatus[]> = {
    draft: ['active', 'archived'],
    active: ['inactive', 'archived'],
    inactive: ['active', 'archived'],
    archived: []
};

export const createContentTransitions = (database: ContentTransitionDatabase) => ({
    async createLandingDraft(
        capability: AdminCapability,
        content: LandingContentMutation,
        basedOnRevisionId: string | null = null
    ) {
        assertAdmin(capability);
        if (!validateLandingContentMutation(content)) {
            throw new Error('Invalid landing content transition.');
        }
        return database.transaction(async (transaction) => {
            const aggregate = await transaction.getLandingAggregate();
            if (!aggregate || aggregate.activeDraftRevisionId !== null) {
                throw new Error('Invalid landing content transition.');
            }
            if (basedOnRevisionId) {
                const basedOn = await transaction.getLandingRevision(basedOnRevisionId);
                if (!basedOn || basedOn.aggregateId !== aggregate.id) {
                    throw new Error('Invalid landing content transition.');
                }
            }
            return transaction.createLandingDraft({ content, basedOnRevisionId });
        });
    },

    async publishLandingDraft(capability: AdminCapability, revisionId: string) {
        assertAdmin(capability);
        return database.transaction(async (transaction) => {
            const aggregate = await transaction.getLandingAggregate();
            const revision = await transaction.getLandingRevision(revisionId);
            if (!aggregate
                || aggregate.activeDraftRevisionId !== revisionId
                || !revision
                || revision.aggregateId !== aggregate.id
                || revision.status !== 'draft'
                || !validateLandingContentMutation(revision.content)) {
                throw new Error('Invalid landing content transition.');
            }
            await transaction.publishLandingRevision({
                aggregateId: aggregate.id,
                revisionId,
                publishedAt: timestamp()
            });
        });
    },

    async rollbackLanding(capability: AdminCapability, historicalRevisionId: string) {
        assertAdmin(capability);
        return database.transaction(async (transaction) => {
            const aggregate = await transaction.getLandingAggregate();
            const historical = await transaction.getLandingRevision(historicalRevisionId);
            if (!aggregate
                || aggregate.activeDraftRevisionId !== null
                || !historical
                || historical.aggregateId !== aggregate.id
                || (historical.status !== 'published' && historical.status !== 'superseded')
                || !validateLandingContentMutation(historical.content)) {
                throw new Error('Invalid landing content transition.');
            }
            const draft = await transaction.createLandingDraft({
                content: historical.content,
                basedOnRevisionId: historical.id
            });
            await transaction.publishLandingRevision({
                aggregateId: aggregate.id,
                revisionId: draft.id,
                publishedAt: timestamp()
            });
            return { ...draft, status: 'published' as const };
        });
    },

    async setPsychologistStatus(
        capability: AdminCapability,
        psychologistId: string,
        status: PsychologistStatus
    ) {
        assertAdmin(capability);
        return database.transaction(async (transaction) => {
            const psychologist = await transaction.getPsychologist(psychologistId);
            if (!psychologist || !psychologistTransitions[psychologist.status].includes(status)) {
                throw new Error('Invalid psychologist transition.');
            }
            await transaction.updatePsychologist({
                id: psychologist.id,
                status,
                ...(status === 'inactive' || status === 'archived'
                    ? { featured: false, featuredOrder: null }
                    : {})
            });
        });
    },

    async setPsychologistFeatured(
        capability: AdminCapability,
        psychologistId: string,
        featured: boolean,
        featuredOrder: number | null
    ) {
        assertAdmin(capability);
        return database.transaction(async (transaction) => {
            const psychologist = await transaction.getPsychologist(psychologistId);
            if (!psychologist
                || psychologist.status !== 'active'
                || (featured && (!Number.isInteger(featuredOrder) || featuredOrder === null || featuredOrder < 0))) {
                throw new Error('Invalid psychologist transition.');
            }
            await transaction.updatePsychologist({
                id: psychologist.id,
                featured,
                featuredOrder: featured ? featuredOrder : null
            });
        });
    },

    async createArticleDraft(
        capability: PsychologistAuthorCapability,
        input: ArticleDraftMutation,
        articleId: string | null = null
    ) {
        if (!validateArticleDraftMutation(input)) {
            throw new Error('Invalid article transition.');
        }
        return database.transaction(async (transaction) => {
            if (articleId) {
                const article = await transaction.getArticle(articleId);
                if (!article || article.status === 'archived' || article.draftRevisionId !== null || article.slug !== input.slug) {
                    throw new Error('Invalid article transition.');
                }
                assertAuthor(capability, article.ownerPsychologistId);
            } else {
                const psychologist = await transaction.getPsychologist(capability.psychologistId);
                if (!psychologist || psychologist.status === 'archived') {
                    throw new Error('Invalid article transition.');
                }
            }
            return transaction.createArticleDraft({
                ownerPsychologistId: capability.psychologistId,
                articleId,
                input
            });
        });
    },

    async editArticleDraft(
        capability: PsychologistAuthorCapability,
        revisionId: string,
        input: ArticleDraftMutation
    ) {
        if (!validateArticleDraftMutation(input)) {
            throw new Error('Invalid article transition.');
        }
        return database.transaction(async (transaction) => {
            const revision = await transaction.getArticleRevision(revisionId);
            const article = revision ? await transaction.getArticle(revision.articleId) : null;
            if (!revision
                || !article
                || revision.status !== 'draft'
                || article.draftRevisionId !== revision.id
                || article.slug !== input.slug) {
                throw new Error('Invalid article transition.');
            }
            assertAuthor(capability, article.ownerPsychologistId);
            await transaction.updateArticleDraft(revision.id, input);
        });
    },

    async submitArticleRevision(
        capability: PsychologistAuthorCapability,
        revisionId: string,
        submittedAt: string
    ) {
        assertTimestamp(submittedAt);
        return database.transaction(async (transaction) => {
            const revision = await transaction.getArticleRevision(revisionId);
            const article = revision ? await transaction.getArticle(revision.articleId) : null;
            if (!revision
                || !article
                || revision.status !== 'draft'
                || article.draftRevisionId !== revision.id) {
                throw new Error('Invalid article transition.');
            }
            assertAuthor(capability, article.ownerPsychologistId);
            await transaction.updateArticleRevision({
                id: revision.id,
                status: 'inReview',
                submittedAt,
                approvedAt: null
            });
        });
    },

    async approveArticleRevision(
        capability: AdminCapability,
        revisionId: string,
        notes: string,
        approvedAt: string
    ) {
        assertAdmin(capability);
        assertTimestamp(approvedAt);
        if (!notes.trim()) throw new Error('Invalid article transition.');
        return database.transaction(async (transaction) => {
            const revision = await transaction.getArticleRevision(revisionId);
            if (!revision || revision.status !== 'inReview') {
                throw new Error('Invalid article transition.');
            }
            await transaction.addArticleReview({
                revisionId,
                reviewerId: capability.principalId,
                decision: 'approved',
                notes: notes.trim()
            });
            await transaction.updateArticleRevision({
                id: revisionId,
                status: 'approved',
                approvedAt
            });
        });
    },

    async rejectArticleRevision(capability: AdminCapability, revisionId: string, notes: string) {
        assertAdmin(capability);
        if (!notes.trim()) throw new Error('Invalid article transition.');
        return database.transaction(async (transaction) => {
            const revision = await transaction.getArticleRevision(revisionId);
            if (!revision || revision.status !== 'inReview') {
                throw new Error('Invalid article transition.');
            }
            await transaction.addArticleReview({
                revisionId,
                reviewerId: capability.principalId,
                decision: 'rejected',
                notes: notes.trim()
            });
            await transaction.updateArticleRevision({
                id: revisionId,
                status: 'draft',
                submittedAt: null,
                approvedAt: null
            });
        });
    },

    async publishArticleRevision(
        capability: AdminCapability,
        articleId: string,
        revisionId: string
    ) {
        assertAdmin(capability);
        return database.transaction(async (transaction) => {
            const article = await transaction.getArticle(articleId);
            const revision = await transaction.getArticleRevision(revisionId);
            if (!article
                || article.status === 'archived'
                || article.draftRevisionId !== revisionId
                || !revision
                || revision.articleId !== article.id
                || revision.status !== 'approved') {
                throw new Error('Invalid article transition.');
            }
            await transaction.updateArticle({
                id: article.id,
                status: 'published',
                draftRevisionId: null,
                publishedRevisionId: revision.id,
                archivedAt: null
            });
        });
    },

    async unpublishArticle(capability: AdminCapability, articleId: string) {
        assertAdmin(capability);
        return database.transaction(async (transaction) => {
            const article = await transaction.getArticle(articleId);
            if (!article || article.status !== 'published') {
                throw new Error('Invalid article transition.');
            }
            await transaction.updateArticle({ id: article.id, status: 'unpublished' });
        });
    },

    async archiveArticle(capability: AdminCapability, articleId: string) {
        assertAdmin(capability);
        return database.transaction(async (transaction) => {
            const article = await transaction.getArticle(articleId);
            if (!article || article.status === 'archived') {
                throw new Error('Invalid article transition.');
            }
            await transaction.updateArticle({ id: article.id, status: 'archived', archivedAt: timestamp() });
        });
    },

    async detachMedia(capability: AdminCapability, attachmentId: string, detachedAt: string) {
        assertAdmin(capability);
        assertTimestamp(detachedAt);
        return database.transaction(async (transaction) => {
            const attachment = await transaction.getMediaAttachment(attachmentId);
            if (!attachment || attachment.detachedAt !== null) {
                throw new Error('Invalid media transition.');
            }
            await transaction.detachMediaAttachment(attachment.id, detachedAt);
            if (!await transaction.hasActiveMediaAttachments(attachment.mediaObjectId)) {
                await transaction.markMediaOrphaned(attachment.mediaObjectId, detachedAt);
            }
        });
    }
});

const asLandingDatabase = (transaction: unknown) => transaction as PostgresJsDatabase<typeof schema>;

export const createDrizzleContentTransitionDatabase = (
    database: PostgresJsDatabase<typeof schema>
): ContentTransitionDatabase => ({
    transaction: (operation) => database.transaction(async (transaction) => {
        const executor = asLandingDatabase(transaction);
        const api: ContentTransitionTransaction = {
            async getLandingAggregate() {
                const [aggregate] = await transaction.select({
                    id: schema.landingAggregates.id,
                    activeDraftRevisionId: schema.landingAggregates.activeDraftRevisionId,
                    publishedRevisionId: schema.landingAggregates.publishedRevisionId
                }).from(schema.landingAggregates)
                    .where(eq(schema.landingAggregates.singletonKey, true))
                    .limit(1);
                return aggregate ?? null;
            },
            async getLandingRevision(id) {
                const projection = await createDrizzleLandingContentSource(executor).findRevisionById(id);
                return projection
                    ? {
                        id: projection.id,
                        aggregateId: projection.aggregateId,
                        revisionNumber: projection.revisionNumber,
                        basedOnRevisionId: projection.basedOnRevisionId,
                        status: projection.status,
                        content: projection.content
                    }
                    : null;
            },
            async createLandingDraft(input) {
                const [aggregate] = await transaction.select({ id: schema.landingAggregates.id })
                    .from(schema.landingAggregates)
                    .where(eq(schema.landingAggregates.singletonKey, true))
                    .limit(1);
                if (!aggregate) throw new Error('Landing aggregate missing.');
                const [sequence] = await transaction.select({ value: max(schema.landingRevisions.revisionNumber) })
                    .from(schema.landingRevisions)
                    .where(eq(schema.landingRevisions.aggregateId, aggregate.id));
                const revisionNumber = (sequence?.value ?? 0) + 1;
                const [revision] = await transaction.insert(schema.landingRevisions).values({
                    aggregateId: aggregate.id,
                    basedOnRevisionId: input.basedOnRevisionId,
                    revisionNumber,
                    status: 'draft'
                }).returning({ id: schema.landingRevisions.id });
                if (!revision) throw new Error('Landing revision insert failed.');

                for (const [position, sectionInput] of input.content.sections.entries()) {
                    const mapped = mapLandingSectionMutation(sectionInput, position);
                    const [section] = await transaction.insert(schema.landingSections).values({
                        landingRevisionId: revision.id,
                        key: mapped.section.key,
                        position: mapped.section.position,
                        visible: mapped.section.visible
                    }).returning({ id: schema.landingSections.id });
                    if (!section) throw new Error('Landing section insert failed.');
                    await transaction.insert(schema.landingSectionTranslations).values(
                        mapped.translations.map((translation) => ({ sectionId: section.id, ...translation }))
                    );
                    for (const itemInput of mapped.items) {
                        const [item] = await transaction.insert(schema.landingItems).values({
                            sectionId: section.id,
                            position: itemInput.position
                        }).returning({ id: schema.landingItems.id });
                        if (!item) throw new Error('Landing item insert failed.');
                        await transaction.insert(schema.landingItemTranslations).values(
                            itemInput.translations.map((translation) => ({ itemId: item.id, ...translation }))
                        );
                    }
                }
                await transaction.update(schema.landingAggregates).set({
                    activeDraftRevisionId: revision.id,
                    updatedAt: sql`now()`
                }).where(eq(schema.landingAggregates.id, aggregate.id));
                return {
                    id: revision.id,
                    aggregateId: aggregate.id,
                    revisionNumber,
                    basedOnRevisionId: input.basedOnRevisionId,
                    status: 'draft',
                    content: input.content
                };
            },
            async publishLandingRevision(input) {
                const [aggregate] = await transaction.select({
                    publishedRevisionId: schema.landingAggregates.publishedRevisionId
                }).from(schema.landingAggregates)
                    .where(eq(schema.landingAggregates.id, input.aggregateId))
                    .limit(1);
                if (aggregate?.publishedRevisionId) {
                    await transaction.update(schema.landingRevisions).set({ status: 'superseded' })
                        .where(eq(schema.landingRevisions.id, aggregate.publishedRevisionId));
                }
                await transaction.update(schema.landingRevisions).set({
                    status: 'published',
                    publishedAt: input.publishedAt
                }).where(and(
                    eq(schema.landingRevisions.id, input.revisionId),
                    eq(schema.landingRevisions.aggregateId, input.aggregateId)
                ));
                await transaction.update(schema.landingAggregates).set({
                    activeDraftRevisionId: null,
                    publishedRevisionId: input.revisionId,
                    updatedAt: sql`now()`
                }).where(eq(schema.landingAggregates.id, input.aggregateId));
            },
            async getPsychologist(id) {
                const [psychologist] = await transaction.select({
                    id: schema.psychologists.id,
                    status: schema.psychologists.status,
                    featured: schema.psychologists.featured,
                    featuredOrder: schema.psychologists.featuredOrder
                }).from(schema.psychologists).where(eq(schema.psychologists.id, id)).limit(1);
                return psychologist ?? null;
            },
            async updatePsychologist(input) {
                await transaction.update(schema.psychologists).set({
                    status: input.status,
                    featured: input.featured,
                    featuredOrder: input.featuredOrder,
                    updatedAt: sql`now()`
                }).where(eq(schema.psychologists.id, input.id));
            },
            async getArticle(id) {
                const [article] = await transaction.select({
                    id: schema.articles.id,
                    ownerPsychologistId: schema.articles.ownerPsychologistId,
                    slug: schema.articles.slug,
                    status: schema.articles.status,
                    draftRevisionId: schema.articles.draftRevisionId,
                    publishedRevisionId: schema.articles.publishedRevisionId
                }).from(schema.articles).where(eq(schema.articles.id, id)).limit(1);
                return article ?? null;
            },
            async getArticleRevision(id) {
                const [revision] = await transaction.select().from(schema.articleRevisions)
                    .where(eq(schema.articleRevisions.id, id)).limit(1);
                return revision
                    ? {
                        id: revision.id,
                        articleId: revision.articleId,
                        revisionNumber: revision.revisionNumber,
                        status: revision.status,
                        input: {
                            slug: '',
                            title: { id: revision.titleId, en: revision.titleEn },
                            summary: { id: revision.summaryId, en: revision.summaryEn },
                            body: { id: revision.bodyId, en: revision.bodyEn }
                        },
                        submittedAt: revision.submittedAt,
                        approvedAt: revision.approvedAt
                    }
                    : null;
            },
            async createArticleDraft(request) {
                const mapped = mapArticleDraftMutation(request.input);
                let articleId = request.articleId;
                if (!articleId) {
                    const [createdArticle] = await transaction.insert(schema.articles).values({
                        ownerPsychologistId: request.ownerPsychologistId,
                        slug: mapped.article.slug,
                        status: 'draft'
                    }).returning({ id: schema.articles.id });
                    if (!createdArticle) throw new Error('Article insert failed.');
                    articleId = createdArticle.id;
                }
                const [sequence] = await transaction.select({ value: max(schema.articleRevisions.revisionNumber) })
                    .from(schema.articleRevisions)
                    .where(eq(schema.articleRevisions.articleId, articleId));
                const revisionNumber = (sequence?.value ?? 0) + 1;
                const [revision] = await transaction.insert(schema.articleRevisions).values({
                    articleId,
                    revisionNumber,
                    status: 'draft',
                    titleId: mapped.revision.titleId,
                    titleEn: mapped.revision.titleEn,
                    summaryId: mapped.revision.summaryId,
                    summaryEn: mapped.revision.summaryEn,
                    bodyId: mapped.revision.bodyId,
                    bodyEn: mapped.revision.bodyEn
                }).returning({ id: schema.articleRevisions.id });
                if (!revision) throw new Error('Article revision insert failed.');
                await transaction.update(schema.articles).set({
                    draftRevisionId: revision.id,
                    updatedAt: sql`now()`
                }).where(eq(schema.articles.id, articleId));
                const article = await api.getArticle(articleId);
                if (!article) throw new Error('Article reload failed.');
                return {
                    article,
                    revision: {
                        id: revision.id,
                        articleId,
                        revisionNumber,
                        status: 'draft',
                        input: request.input,
                        submittedAt: null,
                        approvedAt: null
                    }
                };
            },
            async updateArticleDraft(revisionId, input) {
                const mapped = mapArticleDraftMutation(input);
                await transaction.update(schema.articleRevisions).set(mapped.revision)
                    .where(eq(schema.articleRevisions.id, revisionId));
            },
            async updateArticleRevision(input) {
                await transaction.update(schema.articleRevisions).set({
                    status: input.status,
                    submittedAt: input.submittedAt,
                    approvedAt: input.approvedAt
                }).where(eq(schema.articleRevisions.id, input.id));
            },
            async updateArticle(input) {
                await transaction.update(schema.articles).set({
                    status: input.status,
                    draftRevisionId: input.draftRevisionId,
                    publishedRevisionId: input.publishedRevisionId,
                    archivedAt: input.archivedAt,
                    updatedAt: sql`now()`
                }).where(eq(schema.articles.id, input.id));
            },
            async addArticleReview(input) {
                await transaction.insert(schema.articleReviews).values({
                    articleRevisionId: input.revisionId,
                    reviewerId: input.reviewerId,
                    decision: input.decision,
                    notes: input.notes
                });
            },
            async getMediaAttachment(id) {
                const [attachment] = await transaction.select({
                    id: schema.mediaAttachments.id,
                    mediaObjectId: schema.mediaAttachments.mediaObjectId,
                    detachedAt: schema.mediaAttachments.detachedAt
                }).from(schema.mediaAttachments).where(eq(schema.mediaAttachments.id, id)).limit(1);
                return attachment ?? null;
            },
            async detachMediaAttachment(id, detachedAt) {
                await transaction.update(schema.mediaAttachments).set({ detachedAt })
                    .where(eq(schema.mediaAttachments.id, id));
            },
            async hasActiveMediaAttachments(mediaObjectId) {
                const [attachment] = await transaction.select({ id: schema.mediaAttachments.id })
                    .from(schema.mediaAttachments)
                    .where(and(
                        eq(schema.mediaAttachments.mediaObjectId, mediaObjectId),
                        sql`${schema.mediaAttachments.detachedAt} is null`
                    )).limit(1);
                return Boolean(attachment);
            },
            async markMediaOrphaned(mediaObjectId, orphanedAt) {
                await transaction.update(schema.mediaObjects).set({
                    lifecycle: 'orphaned',
                    orphanedAt,
                    updatedAt: sql`now()`
                }).where(eq(schema.mediaObjects.id, mediaObjectId));
            }
        };
        return operation(api);
    })
});
