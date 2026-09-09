import { describe, expect, test } from 'bun:test';
import type { LandingContentMutation } from '@attentiveid/shared';
import {
    createLandingContentRepository,
    type LandingContentSource,
    type LandingRevisionProjection
} from './landing-content.repository';
import {
    createPsychologistsRepository,
    type CanonicalPsychologistRow,
    type PsychologistQuerySource
} from './psychologists.repository';
import {
    createArticlesRepository,
    type ArticlePublicRow,
    type ArticleQuerySource
} from './articles.repository';

const localized = (value: string) => ({ id: `${value} ID`, en: `${value} EN` });

const landingContent: LandingContentMutation = {
    sections: [
        {
            key: 'hero',
            visible: true,
            headline: localized('Hero'),
            description: localized('Hero description'),
            primaryCta: localized('Start'),
            secondaryCta: localized('Explore')
        },
        {
            key: 'supportExplorer',
            visible: true,
            headline: localized('Support'),
            description: localized('Support description'),
            items: Array.from({ length: 3 }, (_, position) => ({
                id: `support-${position}`,
                position,
                title: localized(`Support ${position}`),
                description: localized(`Support detail ${position}`)
            }))
        },
        {
            key: 'carePromise',
            visible: true,
            headline: localized('Promise'),
            description: localized('Promise description'),
            items: Array.from({ length: 3 }, (_, position) => ({
                id: `promise-${position}`,
                position,
                title: localized(`Promise ${position}`),
                description: localized(`Promise detail ${position}`)
            }))
        },
        {
            key: 'featuredPsychologists',
            visible: true,
            headline: localized('Featured'),
            description: localized('Featured description')
        },
        {
            key: 'careJourney',
            visible: true,
            headline: localized('Journey'),
            description: localized('Journey description'),
            items: Array.from({ length: 3 }, (_, position) => ({
                id: `journey-${position}`,
                position,
                title: localized(`Journey ${position}`),
                description: localized(`Journey detail ${position}`)
            }))
        },
        {
            key: 'clientStories',
            visible: true,
            headline: localized('Stories'),
            description: localized('Stories description'),
            items: Array.from({ length: 3 }, (_, position) => ({
                id: `story-${position}`,
                position,
                title: localized(`Story ${position}`),
                description: localized(`Story detail ${position}`)
            }))
        },
        {
            key: 'consultationReassurance',
            visible: true,
            headline: localized('Reassurance'),
            description: localized('Reassurance description')
        },
        {
            key: 'frequentlyAskedQuestions',
            visible: true,
            headline: localized('FAQ'),
            description: localized('FAQ description'),
            items: Array.from({ length: 3 }, (_, position) => ({
                id: `faq-${position}`,
                position,
                title: localized(`Question ${position}`),
                description: localized(`Answer ${position}`)
            }))
        },
        {
            key: 'closingInvitation',
            visible: true,
            headline: localized('Closing'),
            description: localized('Closing description'),
            primaryCta: localized('Contact'),
            contact: localized('WhatsApp')
        }
    ]
};

const landingRevision = (overrides: Partial<LandingRevisionProjection> = {}): LandingRevisionProjection => ({
    id: 'landing-revision-1',
    aggregateId: 'landing-aggregate-1',
    revisionNumber: 1,
    basedOnRevisionId: null,
    status: 'published',
    createdAt: '2026-09-09T00:00:00.000Z',
    publishedAt: '2026-09-09T01:00:00.000Z',
    content: landingContent,
    ...overrides
});

const psychologistRow = (overrides: Partial<CanonicalPsychologistRow> = {}): CanonicalPsychologistRow => ({
    id: 'psychologist-1',
    slug: 'syazka',
    status: 'active',
    name: 'Syazka Kirani Narindra',
    nickname: 'Syazka',
    featured: true,
    featuredOrder: 0,
    credential: 'M.Psi., Psikolog',
    experienceYears: 6,
    licenseNumber: 'SIPP-001',
    bookingUrl: 'https://wa.me/6285156410912',
    premiumBookingUrl: null,
    biography: localized('Biography'),
    availabilityMessage: localized('Available'),
    supportAreas: [{ supportArea: 'adultClinical', primary: true, position: 0 }],
    specializations: [
        { id: 'specialization-1', position: 0, label: localized('Trauma') },
        { id: 'specialization-2', position: 1, label: localized('Anxiety') }
    ],
    media: {
        reference: 'media/psychologists/syazka.webp',
        width: 600,
        height: 750,
        alt: localized('Profile photo')
    },
    ...overrides
});

describe('content repositories', () => {
    test('landing public read follows only the published pointer while explicit revision read supports preview', async () => {
        const published = landingRevision();
        const draft = landingRevision({
            id: 'landing-revision-2',
            revisionNumber: 2,
            status: 'draft',
            publishedAt: null
        });
        const source: LandingContentSource = {
            findPublished: async () => published,
            findRevisionById: async (id) => id === draft.id ? draft : null
        };
        const repository = createLandingContentRepository(source);

        expect((await repository.getPublished())?.revision.id).toBe(published.id);
        expect((await repository.getPublished())?.revision.id).not.toBe(draft.id);
        expect((await repository.getRevision(draft.id))?.revision.status).toBe('draft');
        expect(await repository.getRevision("revision' OR 1=1 --")).toBeNull();
    });

    test('psychologist directory normalizes adversarial search and bounds pagination before querying', async () => {
        let capturedQuery: Parameters<PsychologistQuerySource['listActive']>[0] | undefined;
        const source: PsychologistQuerySource = {
            listActive: async (query) => {
                capturedQuery = query;
                return [psychologistRow()];
            },
            findBySlug: async () => null
        };
        const repository = createPsychologistsRepository(source, { publicHosts: [] });

        const result = await repository.list({
            locale: 'en',
            search: "  100%_match' OR 1=1 --  ",
            supportArea: 'adultClinical',
            minimumExperienceYears: 3,
            limit: 9_999,
            offset: -20
        });

        expect(result).toHaveLength(1);
        expect(capturedQuery).toEqual({
            locale: 'en',
            search: "100\\%\\_match' OR 1=1 --",
            supportArea: 'adultClinical',
            minimumExperienceYears: 3,
            featuredOnly: false,
            limit: 50,
            offset: 0
        });
    });

    test('psychologist projections preserve active featured order, unavailable history, and safe media', async () => {
        const rows = new Map<string, CanonicalPsychologistRow>([
            ['syazka', psychologistRow()],
            ['inactive', psychologistRow({
                id: 'psychologist-2',
                slug: 'inactive',
                status: 'inactive',
                featured: false,
                featuredOrder: null
            })],
            ['archived', psychologistRow({
                id: 'psychologist-3',
                slug: 'archived',
                status: 'archived',
                featured: false,
                featuredOrder: null
            })],
            ['unsafe-media', psychologistRow({
                id: 'psychologist-4',
                slug: 'unsafe-media',
                featured: false,
                featuredOrder: null,
                media: {
                    reference: 'https://127.0.0.1/private.webp',
                    width: 600,
                    height: 750,
                    alt: localized('Unsafe')
                }
            })]
        ]);
        const source: PsychologistQuerySource = {
            listActive: async ({ featuredOnly }) => [...rows.values()].filter((row) => (
                row.status === 'active' && (!featuredOnly || row.featured)
            )),
            findBySlug: async (slug) => rows.get(slug) ?? null
        };
        const repository = createPsychologistsRepository(source, { publicHosts: [] });

        const featured = await repository.featured('id');
        expect(featured.map(({ id }) => id)).toEqual(['psychologist-1']);
        expect(featured[0]?.specializations).toEqual(['Trauma ID', 'Anxiety ID']);
        expect(featured[0]?.media).toMatchObject({ width: 600, height: 750 });
        expect(await repository.getBySlug('inactive', 'en')).toEqual({
            status: 'unavailable',
            psychologist: {
                slug: 'inactive',
                name: 'Syazka Kirani Narindra',
                nickname: 'Syazka'
            }
        });
        expect((await repository.getBySlug('archived', 'id')).status).toBe('unavailable');
        expect(await repository.getBySlug('missing', 'id')).toEqual({ status: 'notFound' });
        const unsafeLookup = await repository.getBySlug('unsafe-media', 'id');
        expect(unsafeLookup.status).toBe('found');
        if (unsafeLookup.status === 'found') {
            expect(unsafeLookup.psychologist.media).toBeUndefined();
        }
    });

    test('article public read follows only an approved published pointer', async () => {
        const approved: ArticlePublicRow = {
            articleId: 'article-1',
            slug: 'understanding-anxiety',
            articleStatus: 'published',
            revisionId: 'article-revision-1',
            revisionStatus: 'approved',
            title: localized('Understanding anxiety'),
            summary: localized('Article summary'),
            body: localized('Article body'),
            publishedAt: '2026-09-09T01:00:00.000Z'
        };
        const source: ArticleQuerySource = {
            findPublishedBySlug: async (slug) => slug === approved.slug ? approved : null
        };
        const repository = createArticlesRepository(source);

        expect((await repository.getPublishedBySlug(approved.slug)).status).toBe('found');
        expect(await repository.getPublishedBySlug("article' UNION SELECT secret --")).toEqual({ status: 'notFound' });

        const draftSource: ArticleQuerySource = {
            findPublishedBySlug: async () => ({ ...approved, revisionStatus: 'draft' })
        };
        expect(await createArticlesRepository(draftSource).getPublishedBySlug(approved.slug)).toEqual({ status: 'notFound' });
    });

    test('Drizzle adapters use parameterized builders and mutation mappers do not spread public DTOs', async () => {
        const files = [
            './landing-content.repository.ts',
            './psychologists.repository.ts',
            './articles.repository.ts'
        ];

        for (const file of files) {
            const source = await Bun.file(new URL(file, import.meta.url)).text();
            expect(source).not.toContain('sql.raw');
            expect(source).not.toMatch(/\.values\(\s*input\s*\)/);
        }
    });
});
