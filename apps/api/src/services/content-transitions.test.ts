import { describe, expect, test } from 'bun:test';
import type { ArticleDraftMutation, LandingContentMutation } from '@attentiveid/shared';
import {
    createContentTransitions,
    isPsychologistReservationEligible,
    type ArticleRecord,
    type ArticleRevisionRecord,
    type ContentTransitionDatabase,
    type ContentTransitionTransaction,
    type LandingAggregateRecord,
    type LandingRevisionRecord,
    type MediaAttachmentRecord,
    type PsychologistLifecycleRecord
} from './content-transitions';
import {
    createAdminCapability,
    createPsychologistAuthorCapability
} from './authorization-capability';

const localized = (value: string) => ({ id: `${value} ID`, en: `${value} EN` });

const repeater = (prefix: string) => Array.from({ length: 3 }, (_, position) => ({
    id: `${prefix}-${position}`,
    position,
    title: localized(`${prefix} title ${position}`),
    description: localized(`${prefix} description ${position}`)
}));

const landingContent: LandingContentMutation = {
    sections: [
        { key: 'hero', visible: true, headline: localized('Hero'), description: localized('Hero description'), primaryCta: localized('Start'), secondaryCta: localized('Explore'), items: repeater('metric') },
        { key: 'supportExplorer', visible: true, headline: localized('Support'), description: localized('Support description'), items: repeater('support') },
        { key: 'carePromise', visible: true, headline: localized('Promise'), description: localized('Promise description'), items: repeater('promise') },
        { key: 'featuredPsychologists', visible: true, headline: localized('Featured'), description: localized('Featured description') },
        { key: 'careJourney', visible: true, headline: localized('Journey'), description: localized('Journey description'), items: repeater('journey') },
        { key: 'clientStories', visible: true, headline: localized('Stories'), description: localized('Stories description'), items: repeater('stories') },
        { key: 'consultationReassurance', visible: true, headline: localized('Reassurance'), description: localized('Reassurance description'), sessionLabel: localized('Session label'), price: localized('Price'), priceUnit: localized('Price unit'), primaryCta: localized('Ask about pricing') },
        { key: 'frequentlyAskedQuestions', visible: true, headline: localized('FAQ'), description: localized('FAQ description'), items: repeater('faq') },
        { key: 'closingInvitation', visible: true, headline: localized('Closing'), description: localized('Closing description'), primaryCta: localized('Contact'), contact: localized('WhatsApp') }
    ]
};

const articleDraft = (slug = 'understanding-anxiety'): ArticleDraftMutation => ({
    slug,
    title: localized('Understanding anxiety'),
    summary: localized('A practical introduction'),
    body: localized('Long-form article body')
});

type MemoryState = {
    landingAggregate: LandingAggregateRecord;
    landingRevisions: Map<string, LandingRevisionRecord>;
    psychologists: Map<string, PsychologistLifecycleRecord>;
    articles: Map<string, ArticleRecord>;
    articleRevisions: Map<string, ArticleRevisionRecord>;
    articleReviews: { revisionId: string; reviewerId: string; decision: 'approved' | 'rejected'; notes: string }[];
    mediaAttachments: Map<string, MediaAttachmentRecord>;
    mediaLifecycle: Map<string, { lifecycle: 'active' | 'orphaned'; orphanedAt: string | null }>;
    sequence: { landing: number; article: number; articleRevision: number };
};

const initialState = (): MemoryState => ({
    landingAggregate: {
        id: 'landing-aggregate-1',
        activeDraftRevisionId: null,
        publishedRevisionId: 'landing-revision-1'
    },
    landingRevisions: new Map([
        ['landing-revision-1', {
            id: 'landing-revision-1',
            aggregateId: 'landing-aggregate-1',
            revisionNumber: 1,
            basedOnRevisionId: null,
            status: 'published',
            content: landingContent
        }]
    ]),
    psychologists: new Map([
        ['psychologist-1', {
            id: 'psychologist-1',
            status: 'active',
            featured: true,
            featuredOrder: 0
        }]
    ]),
    articles: new Map(),
    articleRevisions: new Map(),
    articleReviews: [],
    mediaAttachments: new Map([
        ['attachment-1', {
            id: 'attachment-1',
            mediaObjectId: 'media-1',
            detachedAt: null
        }]
    ]),
    mediaLifecycle: new Map([
        ['media-1', { lifecycle: 'active', orphanedAt: null }]
    ]),
    sequence: { landing: 1, article: 0, articleRevision: 0 }
});

const createMemoryDatabase = () => {
    let state = initialState();

    const database: ContentTransitionDatabase = {
        async transaction<Result>(operation: (transaction: ContentTransitionTransaction) => Promise<Result>) {
            const staged = structuredClone(state);
            const transaction: ContentTransitionTransaction = {
                getLandingAggregate: async () => structuredClone(staged.landingAggregate),
                getLandingRevision: async (id) => structuredClone(staged.landingRevisions.get(id) ?? null),
                createLandingDraft: async (input) => {
                    const id = `landing-revision-${++staged.sequence.landing}`;
                    staged.landingRevisions.set(id, {
                        id,
                        aggregateId: staged.landingAggregate.id,
                        revisionNumber: staged.sequence.landing,
                        basedOnRevisionId: input.basedOnRevisionId,
                        status: 'draft',
                        content: structuredClone(input.content)
                    });
                    staged.landingAggregate.activeDraftRevisionId = id;
                    return structuredClone(staged.landingRevisions.get(id)!);
                },
                publishLandingRevision: async ({ revisionId }) => {
                    const previousId = staged.landingAggregate.publishedRevisionId;
                    const revision = staged.landingRevisions.get(revisionId)!;
                    if (previousId) staged.landingRevisions.get(previousId)!.status = 'superseded';
                    revision.status = 'published';
                    staged.landingAggregate.publishedRevisionId = revisionId;
                    staged.landingAggregate.activeDraftRevisionId = null;
                },
                getPsychologist: async (id) => structuredClone(staged.psychologists.get(id) ?? null),
                updatePsychologist: async (input) => {
                    const current = staged.psychologists.get(input.id)!;
                    staged.psychologists.set(input.id, { ...current, ...input });
                },
                getArticle: async (id) => structuredClone(staged.articles.get(id) ?? null),
                getArticleRevision: async (id) => structuredClone(staged.articleRevisions.get(id) ?? null),
                createArticleDraft: async ({ ownerPsychologistId, articleId, input }) => {
                    const resolvedArticleId = articleId ?? `article-${++staged.sequence.article}`;
                    const revisionId = `article-revision-${++staged.sequence.articleRevision}`;
                    const existingArticle = staged.articles.get(resolvedArticleId);
                    const article: ArticleRecord = existingArticle ?? {
                        id: resolvedArticleId,
                        ownerPsychologistId,
                        slug: input.slug,
                        status: 'draft',
                        draftRevisionId: null,
                        publishedRevisionId: null
                    };
                    article.slug = input.slug;
                    article.draftRevisionId = revisionId;
                    staged.articles.set(resolvedArticleId, article);
                    const revision: ArticleRevisionRecord = {
                        id: revisionId,
                        articleId: resolvedArticleId,
                        revisionNumber: [...staged.articleRevisions.values()].filter((value) => value.articleId === resolvedArticleId).length + 1,
                        status: 'draft',
                        input: structuredClone(input),
                        submittedAt: null,
                        approvedAt: null
                    };
                    staged.articleRevisions.set(revisionId, revision);
                    return structuredClone({ article, revision });
                },
                updateArticleDraft: async (revisionId, input) => {
                    staged.articleRevisions.get(revisionId)!.input = structuredClone(input);
                },
                updateArticleRevision: async (input) => {
                    const revision = staged.articleRevisions.get(input.id)!;
                    staged.articleRevisions.set(input.id, { ...revision, ...input });
                },
                updateArticle: async (input) => {
                    const article = staged.articles.get(input.id)!;
                    staged.articles.set(input.id, { ...article, ...input });
                },
                addArticleReview: async (review) => {
                    staged.articleReviews.push({ ...review });
                },
                getMediaAttachment: async (id) => structuredClone(staged.mediaAttachments.get(id) ?? null),
                detachMediaAttachment: async (id, detachedAt) => {
                    staged.mediaAttachments.get(id)!.detachedAt = detachedAt;
                },
                hasActiveMediaAttachments: async (mediaObjectId) => [...staged.mediaAttachments.values()].some((attachment) => (
                    attachment.mediaObjectId === mediaObjectId && attachment.detachedAt === null
                )),
                markMediaOrphaned: async (mediaObjectId, orphanedAt) => {
                    staged.mediaLifecycle.set(mediaObjectId, { lifecycle: 'orphaned', orphanedAt });
                }
            };
            const result = await operation(transaction);
            state = staged;
            return result;
        }
    };

    return { database, snapshot: () => structuredClone(state) };
};

describe('content transitions', () => {
    test('publishes one complete landing draft atomically and rollback creates new immutable lineage', async () => {
        const memory = createMemoryDatabase();
        const transitions = createContentTransitions(memory.database);
        const admin = createAdminCapability('admin-1');

        const draft = await transitions.createLandingDraft(admin, landingContent, 'landing-revision-1');
        expect(memory.snapshot().landingAggregate.publishedRevisionId).toBe('landing-revision-1');
        await transitions.publishLandingDraft(admin, draft.id);
        expect(memory.snapshot().landingAggregate).toMatchObject({
            activeDraftRevisionId: null,
            publishedRevisionId: draft.id
        });
        expect(memory.snapshot().landingRevisions.get('landing-revision-1')?.status).toBe('superseded');

        const rollback = await transitions.rollbackLanding(admin, 'landing-revision-1');
        const snapshot = memory.snapshot();
        expect(rollback.id).not.toBe('landing-revision-1');
        expect(snapshot.landingRevisions.get(rollback.id)?.basedOnRevisionId).toBe('landing-revision-1');
        expect(snapshot.landingAggregate.publishedRevisionId).toBe(rollback.id);
        expect(snapshot.landingRevisions.get('landing-revision-1')?.content).toEqual(landingContent);
    });

    test('rejects incomplete landing content and leaves persisted state unchanged', async () => {
        const memory = createMemoryDatabase();
        const transitions = createContentTransitions(memory.database);
        const invalid = structuredClone(landingContent) as LandingContentMutation;
        invalid.sections[0].headline.en = '';

        await expect(transitions.createLandingDraft(createAdminCapability('admin-1'), invalid)).rejects.toThrow('Invalid landing content transition.');
        expect(memory.snapshot()).toEqual(initialState());
    });

    test('updates one psychologist lifecycle row and blocks reservations outside active state', async () => {
        const memory = createMemoryDatabase();
        const transitions = createContentTransitions(memory.database);
        const admin = createAdminCapability('admin-1');

        await transitions.setPsychologistStatus(admin, 'psychologist-1', 'inactive');
        let psychologist = memory.snapshot().psychologists.get('psychologist-1')!;
        expect(psychologist).toEqual({ id: 'psychologist-1', status: 'inactive', featured: false, featuredOrder: null });
        expect(isPsychologistReservationEligible(psychologist)).toBe(false);

        await transitions.setPsychologistStatus(admin, 'psychologist-1', 'active');
        await transitions.setPsychologistFeatured(admin, 'psychologist-1', true, 3);
        psychologist = memory.snapshot().psychologists.get('psychologist-1')!;
        expect(psychologist.id).toBe('psychologist-1');
        expect(psychologist.featuredOrder).toBe(3);
        expect(isPsychologistReservationEligible(psychologist)).toBe(true);

        await transitions.setPsychologistStatus(admin, 'psychologist-1', 'archived');
        await expect(transitions.setPsychologistStatus(admin, 'psychologist-1', 'active')).rejects.toThrow('Invalid psychologist transition.');
        expect(memory.snapshot().psychologists.get('psychologist-1')?.status).toBe('archived');
    });

    test('keeps the published article live while a newer owned draft is reviewed and then published', async () => {
        const memory = createMemoryDatabase();
        const transitions = createContentTransitions(memory.database);
        const author = createPsychologistAuthorCapability('psychologist-1');
        const otherAuthor = createPsychologistAuthorCapability('psychologist-2');
        const admin = createAdminCapability('admin-1');

        const first = await transitions.createArticleDraft(author, articleDraft());
        await transitions.submitArticleRevision(author, first.revision.id, '2026-09-09T01:00:00.000Z');
        await transitions.approveArticleRevision(admin, first.revision.id, 'Approved', '2026-09-09T02:00:00.000Z');
        await transitions.publishArticleRevision(admin, first.article.id, first.revision.id);

        const second = await transitions.createArticleDraft(author, articleDraft('understanding-anxiety'), first.article.id);
        await expect(transitions.editArticleDraft(otherAuthor, second.revision.id, articleDraft())).rejects.toThrow('Article author capability mismatch.');
        await transitions.submitArticleRevision(author, second.revision.id, '2026-09-09T03:00:00.000Z');
        expect(memory.snapshot().articles.get(first.article.id)?.publishedRevisionId).toBe(first.revision.id);

        await transitions.approveArticleRevision(admin, second.revision.id, 'Approved update', '2026-09-09T04:00:00.000Z');
        expect(memory.snapshot().articles.get(first.article.id)?.publishedRevisionId).toBe(first.revision.id);
        await transitions.publishArticleRevision(admin, first.article.id, second.revision.id);
        expect(memory.snapshot().articles.get(first.article.id)?.publishedRevisionId).toBe(second.revision.id);
    });

    test('rejection returns the same article revision to draft and retains review history', async () => {
        const memory = createMemoryDatabase();
        const transitions = createContentTransitions(memory.database);
        const author = createPsychologistAuthorCapability('psychologist-1');
        const admin = createAdminCapability('admin-1');
        const created = await transitions.createArticleDraft(author, articleDraft());

        await transitions.submitArticleRevision(author, created.revision.id, '2026-09-09T01:00:00.000Z');
        await transitions.rejectArticleRevision(admin, created.revision.id, 'Clarify the source.');

        const snapshot = memory.snapshot();
        expect(snapshot.articleRevisions.get(created.revision.id)?.status).toBe('draft');
        expect(snapshot.articles.get(created.article.id)?.draftRevisionId).toBe(created.revision.id);
        expect(snapshot.articleReviews).toEqual([{
            revisionId: created.revision.id,
            reviewerId: 'admin-1',
            decision: 'rejected',
            notes: 'Clarify the source.'
        }]);
    });

    test('unpublishing and archiving retain slug, pointers, and revision history', async () => {
        const memory = createMemoryDatabase();
        const transitions = createContentTransitions(memory.database);
        const author = createPsychologistAuthorCapability('psychologist-1');
        const admin = createAdminCapability('admin-1');
        const created = await transitions.createArticleDraft(author, articleDraft());
        await transitions.submitArticleRevision(author, created.revision.id, '2026-09-09T01:00:00.000Z');
        await transitions.approveArticleRevision(admin, created.revision.id, 'Approved', '2026-09-09T02:00:00.000Z');
        await transitions.publishArticleRevision(admin, created.article.id, created.revision.id);
        await transitions.unpublishArticle(admin, created.article.id);
        await transitions.archiveArticle(admin, created.article.id);

        const article = memory.snapshot().articles.get(created.article.id)!;
        expect(article).toMatchObject({
            slug: 'understanding-anxiety',
            status: 'archived',
            publishedRevisionId: created.revision.id
        });
        expect(memory.snapshot().articleRevisions.has(created.revision.id)).toBe(true);
    });

    test('detaches media, preserves the binary record, and marks only unreferenced objects orphaned', async () => {
        const memory = createMemoryDatabase();
        const transitions = createContentTransitions(memory.database);
        const detachedAt = '2026-09-09T05:00:00.000Z';

        await transitions.detachMedia(createAdminCapability('admin-1'), 'attachment-1', detachedAt);
        const snapshot = memory.snapshot();
        expect(snapshot.mediaAttachments.get('attachment-1')?.detachedAt).toBe(detachedAt);
        expect(snapshot.mediaLifecycle.get('media-1')).toEqual({ lifecycle: 'orphaned', orphanedAt: detachedAt });
    });
});
