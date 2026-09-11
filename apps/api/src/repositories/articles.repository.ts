import { and, desc, eq, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    validateArticleDraftMutation,
    validateArticlePublicLookup,
    type ArticleDraftMutation,
    type ArticlePublicLookup,
    type LocalizedText
} from '@attentiveid/shared';
import * as schema from '../db/schema';

type ArticleStatus = typeof schema.articleStatusEnum.enumValues[number];
type ArticleRevisionStatus = typeof schema.articleRevisionStatusEnum.enumValues[number];

export interface ArticleAuthorRow {
    id: string;
    name: string;
    slug: string;
}

export interface ArticlePublicRow {
    articleId: string;
    slug: string;
    articleStatus: ArticleStatus;
    revisionId: string;
    revisionStatus: ArticleRevisionStatus;
    title: LocalizedText;
    summary: LocalizedText;
    body: LocalizedText;
    publishedAt: string | null;
    author?: ArticleAuthorRow;
}

export interface ArticleManageableRow {
    id: string;
    slug: string;
    status: ArticleStatus;
    revisionId: string | null;
    revisionStatus: ArticleRevisionStatus | null;
    revisionNumber: number | null;
    title: LocalizedText;
    summary: LocalizedText;
    body: LocalizedText;
    publishedAt: string | null;
    author: ArticleAuthorRow;
    updatedAt: string;
    createdAt: string;
}

export interface ArticleQuerySource {
    findPublishedBySlug(slug: string): Promise<ArticlePublicRow | null>;
    listPublishedArticles?: (options: { limit: number; offset: number; locale?: string }) => Promise<{ articles: ArticlePublicRow[]; total: number }>;
    listManageableArticles?: (filter: { psychologistId?: string; role?: string }) => Promise<ArticleManageableRow[]>;
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const mapArticleDraftMutation = (input: ArticleDraftMutation) => {
    if (!validateArticleDraftMutation(input)) {
        throw new Error('Invalid article draft.');
    }
    return {
        article: { slug: input.slug },
        revision: {
            titleId: input.title.id,
            titleEn: input.title.en,
            summaryId: input.summary.id,
            summaryEn: input.summary.en,
            bodyId: input.body.id,
            bodyEn: input.body.en
        }
    };
};

export const createArticlesRepository = (source: ArticleQuerySource) => ({
    async getPublishedBySlug(slug: string): Promise<ArticlePublicLookup> {
        if (!slugPattern.test(slug)) {
            return { status: 'notFound' };
        }
        const row = await source.findPublishedBySlug(slug);
        if (!row
            || row.articleStatus !== 'published'
            || row.revisionStatus !== 'approved'
            || row.publishedAt === null) {
            return { status: 'notFound' };
        }
        const lookup: ArticlePublicLookup = {
            status: 'found',
            article: {
                id: row.articleId,
                slug: row.slug,
                title: row.title,
                summary: row.summary,
                body: row.body,
                publishedAt: row.publishedAt,
                author: row.author ? {
                    id: row.author.id,
                    name: row.author.name,
                    slug: row.author.slug,
                } : undefined
            }
        };
        return validateArticlePublicLookup(lookup) ? lookup : { status: 'notFound' };
    },

    async listPublishedArticles(options: { limit?: number; offset?: number; locale?: string }) {
        if (!source.listPublishedArticles) {
            return { articles: [], total: 0 };
        }
        const limit = options.limit ?? 10;
        const offset = options.offset ?? 0;
        return source.listPublishedArticles({ limit, offset, locale: options.locale });
    },

    async listManageableArticles(filter: { psychologistId?: string; role?: string }) {
        if (!source.listManageableArticles) {
            return [];
        }
        return source.listManageableArticles(filter);
    }
});

export const createDrizzleArticleQuerySource = (
    database: PostgresJsDatabase<typeof schema>
): ArticleQuerySource => ({
    async findPublishedBySlug(slug) {
        const [row] = await database.select({
            articleId: schema.articles.id,
            slug: schema.articles.slug,
            articleStatus: schema.articles.status,
            revisionId: schema.articleRevisions.id,
            revisionStatus: schema.articleRevisions.status,
            titleId: schema.articleRevisions.titleId,
            titleEn: schema.articleRevisions.titleEn,
            summaryId: schema.articleRevisions.summaryId,
            summaryEn: schema.articleRevisions.summaryEn,
            bodyId: schema.articleRevisions.bodyId,
            bodyEn: schema.articleRevisions.bodyEn,
            publishedAt: schema.articleRevisions.approvedAt,
            authorId: schema.psychologists.id,
            authorName: schema.psychologists.name,
            authorSlug: schema.psychologists.slug,
        }).from(schema.articles)
            .innerJoin(schema.articleRevisions, eq(schema.articleRevisions.id, schema.articles.publishedRevisionId))
            .innerJoin(schema.psychologists, eq(schema.psychologists.id, schema.articles.ownerPsychologistId))
            .where(and(
                eq(schema.articles.slug, slug),
                eq(schema.articles.status, 'published'),
                eq(schema.articleRevisions.status, 'approved')
            ))
            .limit(1);
        return row
            ? {
                articleId: row.articleId,
                slug: row.slug,
                articleStatus: row.articleStatus,
                revisionId: row.revisionId,
                revisionStatus: row.revisionStatus,
                title: { id: row.titleId, en: row.titleEn },
                summary: { id: row.summaryId, en: row.summaryEn },
                body: { id: row.bodyId, en: row.bodyEn },
                publishedAt: row.publishedAt,
                author: {
                    id: row.authorId,
                    name: row.authorName,
                    slug: row.authorSlug,
                }
            }
            : null;
    },

    async listPublishedArticles(options) {
        const limit = Math.max(1, Math.min(50, options.limit));
        const offset = Math.max(0, options.offset);

        const rows = await database.select({
            articleId: schema.articles.id,
            slug: schema.articles.slug,
            articleStatus: schema.articles.status,
            revisionId: schema.articleRevisions.id,
            revisionStatus: schema.articleRevisions.status,
            titleId: schema.articleRevisions.titleId,
            titleEn: schema.articleRevisions.titleEn,
            summaryId: schema.articleRevisions.summaryId,
            summaryEn: schema.articleRevisions.summaryEn,
            bodyId: schema.articleRevisions.bodyId,
            bodyEn: schema.articleRevisions.bodyEn,
            publishedAt: schema.articleRevisions.approvedAt,
            authorId: schema.psychologists.id,
            authorName: schema.psychologists.name,
            authorSlug: schema.psychologists.slug,
        }).from(schema.articles)
            .innerJoin(schema.articleRevisions, eq(schema.articleRevisions.id, schema.articles.publishedRevisionId))
            .innerJoin(schema.psychologists, eq(schema.psychologists.id, schema.articles.ownerPsychologistId))
            .where(and(
                eq(schema.articles.status, 'published'),
                eq(schema.articleRevisions.status, 'approved')
            ))
            .orderBy(desc(schema.articleRevisions.approvedAt))
            .limit(limit)
            .offset(offset);

        const [{ count }] = await database.select({
            count: sql<number>`cast(count(*) as integer)`
        }).from(schema.articles)
            .innerJoin(schema.articleRevisions, eq(schema.articleRevisions.id, schema.articles.publishedRevisionId))
            .where(and(
                eq(schema.articles.status, 'published'),
                eq(schema.articleRevisions.status, 'approved')
            ));

        return {
            articles: rows.map(row => ({
                articleId: row.articleId,
                slug: row.slug,
                articleStatus: row.articleStatus,
                revisionId: row.revisionId,
                revisionStatus: row.revisionStatus,
                title: { id: row.titleId, en: row.titleEn },
                summary: { id: row.summaryId, en: row.summaryEn },
                body: { id: row.bodyId, en: row.bodyEn },
                publishedAt: row.publishedAt,
                author: {
                    id: row.authorId,
                    name: row.authorName,
                    slug: row.authorSlug,
                }
            })),
            total: count || 0
        };
    },

    async listManageableArticles(filter) {
        const activeRevId = sql<string>`coalesce(${schema.articles.draftRevisionId}, ${schema.articles.publishedRevisionId})`;
        const whereClause = filter.role !== 'admin' && filter.psychologistId
            ? eq(schema.articles.ownerPsychologistId, filter.psychologistId)
            : undefined;

        const rows = await database.select({
            id: schema.articles.id,
            slug: schema.articles.slug,
            status: schema.articles.status,
            draftRevisionId: schema.articles.draftRevisionId,
            publishedRevisionId: schema.articles.publishedRevisionId,
            updatedAt: schema.articles.updatedAt,
            createdAt: schema.articles.createdAt,
            revisionId: schema.articleRevisions.id,
            revisionStatus: schema.articleRevisions.status,
            revisionNumber: schema.articleRevisions.revisionNumber,
            titleId: schema.articleRevisions.titleId,
            titleEn: schema.articleRevisions.titleEn,
            summaryId: schema.articleRevisions.summaryId,
            summaryEn: schema.articleRevisions.summaryEn,
            bodyId: schema.articleRevisions.bodyId,
            bodyEn: schema.articleRevisions.bodyEn,
            approvedAt: schema.articleRevisions.approvedAt,
            authorId: schema.psychologists.id,
            authorName: schema.psychologists.name,
            authorSlug: schema.psychologists.slug,
        }).from(schema.articles)
            .leftJoin(schema.articleRevisions, eq(schema.articleRevisions.id, activeRevId))
            .innerJoin(schema.psychologists, eq(schema.psychologists.id, schema.articles.ownerPsychologistId))
            .where(whereClause)
            .orderBy(desc(schema.articles.updatedAt));

        return rows.map(row => ({
            id: row.id,
            slug: row.slug,
            status: row.status,
            revisionId: row.revisionId,
            revisionStatus: row.revisionStatus,
            revisionNumber: row.revisionNumber,
            title: { id: row.titleId || '', en: row.titleEn || '' },
            summary: { id: row.summaryId || '', en: row.summaryEn || '' },
            body: { id: row.bodyId || '', en: row.bodyEn || '' },
            publishedAt: row.approvedAt,
            author: {
                id: row.authorId,
                name: row.authorName,
                slug: row.authorSlug,
            },
            updatedAt: row.updatedAt,
            createdAt: row.createdAt,
        }));
    }
});
