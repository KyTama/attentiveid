import { asc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    CONTENT_LOCALES,
    LANDING_SECTION_ORDER,
    validateLandingContentMutation,
    type LandingContentMutation,
    type LocalizedText
} from '@attentiveid/shared';
import * as schema from '../db/schema';

type LandingRevisionStatus = typeof schema.landingRevisionStatusEnum.enumValues[number];

export interface LandingRevisionProjection {
    id: string;
    aggregateId: string;
    revisionNumber: number;
    basedOnRevisionId: string | null;
    status: LandingRevisionStatus;
    createdAt: string;
    publishedAt: string | null;
    content: LandingContentMutation;
}

export interface LandingContentSource {
    findPublished(): Promise<LandingRevisionProjection | null>;
    findRevisionById(id: string): Promise<LandingRevisionProjection | null>;
}

export interface LandingContentRead {
    revision: Omit<LandingRevisionProjection, 'content'>;
    content: LandingContentMutation;
}

type LandingSectionInput = LandingContentMutation['sections'][number];

export const mapLandingSectionMutation = (section: LandingSectionInput, position: number) => ({
    section: {
        key: section.key,
        position,
        visible: section.visible
    },
    translations: CONTENT_LOCALES.map((locale) => ({
        locale,
        headline: section.headline[locale],
        description: section.description[locale],
        primaryCta: 'primaryCta' in section ? section.primaryCta[locale] : null,
        secondaryCta: 'secondaryCta' in section ? section.secondaryCta[locale] : null,
        contact: 'contact' in section ? section.contact[locale] : null
    })),
    items: 'items' in section
        ? section.items.map((item) => ({
            id: item.id,
            position: item.position,
            translations: CONTENT_LOCALES.map((locale) => ({
                locale,
                title: item.title[locale],
                description: item.description[locale]
            }))
        }))
        : []
});

const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

const toLandingRead = (projection: LandingRevisionProjection | null): LandingContentRead | null => {
    if (!projection || !validateLandingContentMutation(projection.content)) {
        return null;
    }

    const { content, ...revision } = projection;
    return { revision, content };
};

export const createLandingContentRepository = (source: LandingContentSource) => ({
    async getPublished(): Promise<LandingContentRead | null> {
        const projection = await source.findPublished();
        if (projection?.status !== 'published' || projection.publishedAt === null) {
            return null;
        }
        return toLandingRead(projection);
    },

    async getRevision(id: string): Promise<LandingContentRead | null> {
        if (!identifierPattern.test(id)) {
            return null;
        }
        return toLandingRead(await source.findRevisionById(id));
    }
});

interface DrizzleLandingTranslationRow {
    locale: typeof CONTENT_LOCALES[number];
    headline: string;
    description: string;
    primaryCta: string | null;
    secondaryCta: string | null;
    contact: string | null;
}

interface DrizzleLandingItemRow {
    id: string;
    position: number;
    translations: {
        locale: typeof CONTENT_LOCALES[number];
        title: string;
        description: string;
    }[];
}

interface DrizzleLandingSectionRow {
    key: typeof LANDING_SECTION_ORDER[number];
    position: number;
    visible: boolean;
    translations: DrizzleLandingTranslationRow[];
    items: DrizzleLandingItemRow[];
}

interface DrizzleLandingRevisionRow {
    id: string;
    aggregateId: string;
    revisionNumber: number;
    basedOnRevisionId: string | null;
    status: LandingRevisionStatus;
    createdAt: string;
    publishedAt: string | null;
    sections: DrizzleLandingSectionRow[];
}

const localizedFromRows = <Row extends { locale: typeof CONTENT_LOCALES[number] }>(
    rows: readonly Row[],
    pick: (row: Row) => string | null
): LocalizedText | null => {
    const idRow = rows.find(({ locale }) => locale === 'id');
    const enRow = rows.find(({ locale }) => locale === 'en');
    const id = idRow ? pick(idRow) : null;
    const en = enRow ? pick(enRow) : null;
    return id && en ? { id, en } : null;
};

const mapSectionRow = (section: DrizzleLandingSectionRow) => {
    const headline = localizedFromRows(section.translations, (row) => row.headline);
    const description = localizedFromRows(section.translations, (row) => row.description);
    if (!headline || !description) {
        return null;
    }

    const base = { key: section.key, visible: section.visible, headline, description };
    const items = section.items.map((item) => {
        const title = localizedFromRows(item.translations, (row) => row.title);
        const itemDescription = localizedFromRows(item.translations, (row) => row.description);
        return title && itemDescription
            ? { id: item.id, position: item.position, title, description: itemDescription }
            : null;
    });
    if (items.some((item) => item === null)) {
        return null;
    }

    if (section.key === 'hero') {
        const primaryCta = localizedFromRows(section.translations, (row) => row.primaryCta);
        const secondaryCta = localizedFromRows(section.translations, (row) => row.secondaryCta);
        return primaryCta && secondaryCta ? { ...base, key: section.key, primaryCta, secondaryCta } : null;
    }
    if (section.key === 'closingInvitation') {
        const primaryCta = localizedFromRows(section.translations, (row) => row.primaryCta);
        const contact = localizedFromRows(section.translations, (row) => row.contact);
        return primaryCta && contact ? { ...base, key: section.key, primaryCta, contact } : null;
    }
    if (section.key === 'supportExplorer'
        || section.key === 'carePromise'
        || section.key === 'careJourney'
        || section.key === 'clientStories'
        || section.key === 'frequentlyAskedQuestions') {
        return { ...base, key: section.key, items: items.filter((item) => item !== null) };
    }
    return base;
};

const toProjection = (revision: DrizzleLandingRevisionRow | null | undefined): LandingRevisionProjection | null => {
    if (!revision) {
        return null;
    }

    const orderedSections = [...revision.sections].sort((left, right) => left.position - right.position);
    const mappedSections = orderedSections.map(mapSectionRow);
    if (mappedSections.some((section) => section === null)) {
        return null;
    }

    const content = { sections: mappedSections };
    if (!validateLandingContentMutation(content)) {
        return null;
    }

    return {
        id: revision.id,
        aggregateId: revision.aggregateId,
        revisionNumber: revision.revisionNumber,
        basedOnRevisionId: revision.basedOnRevisionId,
        status: revision.status,
        createdAt: revision.createdAt,
        publishedAt: revision.publishedAt,
        content
    };
};

const revisionWithContent = () => ({
    sections: {
        orderBy: [asc(schema.landingSections.position)],
        with: {
            translations: true as const,
            items: {
                orderBy: [asc(schema.landingItems.position)],
                with: { translations: true as const }
            }
        }
    }
});

export const createDrizzleLandingContentSource = (
    database: PostgresJsDatabase<typeof schema>
): LandingContentSource => ({
    async findPublished() {
        const aggregate = await database.query.landingAggregates.findFirst({
            where: eq(schema.landingAggregates.singletonKey, true),
            with: {
                publishedRevision: { with: revisionWithContent() }
            }
        });
        return toProjection(aggregate?.publishedRevision as DrizzleLandingRevisionRow | null | undefined);
    },

    async findRevisionById(id) {
        const revision = await database.query.landingRevisions.findFirst({
            where: eq(schema.landingRevisions.id, id),
            with: revisionWithContent()
        });
        return toProjection(revision as DrizzleLandingRevisionRow | null | undefined);
    }
});
