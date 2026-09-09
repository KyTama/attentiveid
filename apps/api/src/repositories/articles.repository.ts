import { and, eq } from 'drizzle-orm';
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
}

export interface ArticleQuerySource {
    findPublishedBySlug(slug: string): Promise<ArticlePublicRow | null>;
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
                publishedAt: row.publishedAt
            }
        };
        return validateArticlePublicLookup(lookup) ? lookup : { status: 'notFound' };
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
            publishedAt: schema.articleRevisions.approvedAt
        }).from(schema.articles)
            .innerJoin(schema.articleRevisions, eq(schema.articleRevisions.id, schema.articles.publishedRevisionId))
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
                publishedAt: row.publishedAt
            }
            : null;
    }
});
