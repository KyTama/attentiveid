import { describe, expect, test } from 'bun:test';
import {
    bootstrapPsychologists,
    psychologistSeedFixtures,
    seedPsychologists,
    type PsychologistBootstrapDatabase,
    type PsychologistSeedDatabase,
    type PsychologistSeedFixture,
    type PsychologistSeedTransaction
} from './seed-psychologists';

type PsychologistInput = Parameters<PsychologistSeedTransaction['upsertPsychologist']>[0];
type ProfileInput = Parameters<PsychologistSeedTransaction['upsertProfile']>[0];
type ProfileTranslationInput = Parameters<PsychologistSeedTransaction['upsertProfileTranslation']>[0];
type SupportAreaInput = Parameters<PsychologistSeedTransaction['upsertSupportArea']>[0];
type SpecializationInput = Parameters<PsychologistSeedTransaction['upsertSpecialization']>[0];
type SpecializationTranslationInput = Parameters<PsychologistSeedTransaction['upsertSpecializationTranslation']>[0];
type MediaObjectInput = Parameters<PsychologistSeedTransaction['upsertMediaObject']>[0];
type MediaAttachmentInput = Parameters<PsychologistSeedTransaction['upsertMediaAttachment']>[0];

type MemoryState = {
    psychologists: Map<string, PsychologistInput & { id: string }>;
    profiles: Map<string, ProfileInput>;
    profileTranslations: Map<string, ProfileTranslationInput>;
    supportAreas: Map<string, SupportAreaInput>;
    specializations: Map<string, SpecializationInput & { id: string }>;
    specializationTranslations: Map<string, SpecializationTranslationInput>;
    mediaObjects: Map<string, MediaObjectInput & { id: string }>;
    mediaAttachments: Map<string, MediaAttachmentInput>;
    sequence: {
        media: number;
        psychologist: number;
        specialization: number;
    };
};

const createMemoryState = (): MemoryState => ({
    psychologists: new Map(),
    profiles: new Map(),
    profileTranslations: new Map(),
    supportAreas: new Map(),
    specializations: new Map(),
    specializationTranslations: new Map(),
    mediaObjects: new Map(),
    mediaAttachments: new Map(),
    sequence: {
        media: 0,
        psychologist: 0,
        specialization: 0
    }
});

class MemoryPsychologistSeedDatabase implements PsychologistBootstrapDatabase {
    private state = createMemoryState();

    constructor(private readonly failureMessage?: string) {}

    async transaction<Result>(operation: (transaction: PsychologistSeedTransaction) => Promise<Result>): Promise<Result> {
        if (this.failureMessage) {
            throw new Error(this.failureMessage);
        }

        const staged = structuredClone(this.state);
        const transaction: PsychologistSeedTransaction = {
            upsertPsychologist: async (input) => {
                const existing = staged.psychologists.get(input.slug);
                const id = existing?.id ?? `psychologist-${++staged.sequence.psychologist}`;
                staged.psychologists.set(input.slug, { ...input, id });
                return id;
            },
            upsertProfile: async (input) => {
                staged.profiles.set(input.psychologistId, { ...input });
            },
            upsertProfileTranslation: async (input) => {
                staged.profileTranslations.set(`${input.psychologistId}:${input.locale}`, { ...input });
            },
            upsertSupportArea: async (input) => {
                staged.supportAreas.set(`${input.psychologistId}:${input.supportArea}`, { ...input });
            },
            upsertSpecialization: async (input) => {
                const key = `${input.psychologistId}:${input.position}`;
                const existing = staged.specializations.get(key);
                const id = existing?.id ?? `specialization-${++staged.sequence.specialization}`;
                staged.specializations.set(key, { ...input, id });
                return id;
            },
            upsertSpecializationTranslation: async (input) => {
                staged.specializationTranslations.set(`${input.specializationId}:${input.locale}`, { ...input });
            },
            upsertMediaObject: async (input) => {
                const existing = staged.mediaObjects.get(input.reference);
                const id = existing?.id ?? `media-${++staged.sequence.media}`;
                staged.mediaObjects.set(input.reference, { ...input, id });
                return id;
            },
            upsertMediaAttachment: async (input) => {
                staged.mediaAttachments.set(`${input.psychologistId}:${input.role}:${input.position}`, { ...input });
            }
        };

        const result = await operation(transaction);
        this.state = staged;
        return result;
    }

    snapshot() {
        return structuredClone(this.state);
    }

    async countPsychologists() {
        return this.state.psychologists.size;
    }
}

const expectedCounts = {
    psychologists: 12,
    profiles: 12,
    profileTranslations: 24,
    supportAreas: 12,
    specializations: 95,
    specializationTranslations: 190,
    mediaObjects: 12,
    mediaAttachments: 12
};

describe('psychologist seed bootstrap', () => {
    test('preserves existing managed psychologist content during deployment bootstrap', async () => {
        const database = new MemoryPsychologistSeedDatabase();

        const firstResult = await bootstrapPsychologists(database);
        const firstSnapshot = database.snapshot();
        const secondResult = await bootstrapPsychologists(database);

        expect(firstResult).toEqual({ status: 'seeded', result: expectedCounts });
        expect(secondResult).toEqual({ status: 'unchanged' });
        expect(database.snapshot()).toEqual(firstSnapshot);
    });

    test('seeds twice without duplicating canonical identities or ordered relations', async () => {
        const database = new MemoryPsychologistSeedDatabase();

        const firstResult = await seedPsychologists(database);
        const firstSnapshot = database.snapshot();
        const secondResult = await seedPsychologists(database);
        const secondSnapshot = database.snapshot();

        expect(firstResult).toEqual(expectedCounts);
        expect(secondResult).toEqual(expectedCounts);
        expect(secondSnapshot.psychologists.size).toBe(expectedCounts.psychologists);
        expect(secondSnapshot.profiles.size).toBe(expectedCounts.profiles);
        expect(secondSnapshot.profileTranslations.size).toBe(expectedCounts.profileTranslations);
        expect(secondSnapshot.supportAreas.size).toBe(expectedCounts.supportAreas);
        expect(secondSnapshot.specializations.size).toBe(expectedCounts.specializations);
        expect(secondSnapshot.specializationTranslations.size).toBe(expectedCounts.specializationTranslations);
        expect(secondSnapshot.mediaObjects.size).toBe(expectedCounts.mediaObjects);
        expect(secondSnapshot.mediaAttachments.size).toBe(expectedCounts.mediaAttachments);
        expect(
            [...secondSnapshot.psychologists.values()].map(({ id, featuredOrder, slug }) => ({ id, featuredOrder, slug }))
        ).toEqual(
            [...firstSnapshot.psychologists.values()].map(({ id, featuredOrder, slug }) => ({ id, featuredOrder, slug }))
        );
        expect(
            [...secondSnapshot.specializations.values()].map(({ id, position, psychologistId }) => ({ id, position, psychologistId }))
        ).toEqual(
            [...firstSnapshot.specializations.values()].map(({ id, position, psychologistId }) => ({ id, position, psychologistId }))
        );
        expect(
            [...secondSnapshot.mediaObjects.values()].map(({ id, reference }) => ({ id, reference }))
        ).toEqual(
            [...firstSnapshot.mediaObjects.values()].map(({ id, reference }) => ({ id, reference }))
        );
        expect([...secondSnapshot.psychologists.values()].map(({ featuredOrder }) => featuredOrder)).toEqual(
            Array.from({ length: psychologistSeedFixtures.length }, (_, index) => index)
        );
    });

    test('rejects adversarial slug text before opening a transaction', async () => {
        const database = new MemoryPsychologistSeedDatabase();
        const fixtures = structuredClone(psychologistSeedFixtures) as PsychologistSeedFixture[];
        fixtures[0].slug = "safe'); DELETE FROM psychologists;--";

        await expect(seedPsychologists(database, fixtures)).rejects.toThrow('Invalid psychologist seed fixture.');
        expect(database.snapshot().psychologists.size).toBe(0);
    });

    test('updates corrected mutable fields without replacing psychologist or media identities', async () => {
        const database = new MemoryPsychologistSeedDatabase();
        await seedPsychologists(database);
        const before = database.snapshot();
        const fixtures = structuredClone(psychologistSeedFixtures) as PsychologistSeedFixture[];

        fixtures[0].nickname = 'Kirana';
        fixtures[0].specializations[0].label = {
            id: 'Gangguan kepribadian dan pola relasi',
            en: 'Personality and relationship patterns'
        };
        fixtures[0].media.alt = {
            id: 'Foto profil terbaru Syazka Kirani Narindra',
            en: 'Updated profile photo of Syazka Kirani Narindra'
        };

        const result = await seedPsychologists(database, fixtures);
        const after = database.snapshot();

        expect(result).toEqual(expectedCounts);
        expect(after.psychologists.get('syazka')?.id).toBe(before.psychologists.get('syazka')?.id);
        expect(after.psychologists.get('syazka')?.nickname).toBe('Kirana');
        expect(after.mediaObjects.get('media/psychologists/syazka.webp')?.id).toBe(
            before.mediaObjects.get('media/psychologists/syazka.webp')?.id
        );
        expect(after.mediaObjects.get('media/psychologists/syazka.webp')?.alt.en).toBe(
            'Updated profile photo of Syazka Kirani Narindra'
        );
        expect(after.specializationTranslations.get('specialization-1:en')?.label).toBe(
            'Personality and relationship patterns'
        );
    });

    test('rejects unsafe media and rolls back the complete seed transaction', async () => {
        const database = new MemoryPsychologistSeedDatabase();
        const fixtures = structuredClone(psychologistSeedFixtures) as PsychologistSeedFixture[];
        fixtures[5].media.reference = 'https://127.0.0.1/private.webp';

        await expect(seedPsychologists(database, fixtures)).rejects.toThrow('Invalid psychologist seed fixture.');
        expect(database.snapshot()).toEqual(createMemoryState());
    });

    test('requires positive media geometry with paired Indonesian and English alt text', () => {
        for (const fixture of psychologistSeedFixtures) {
            expect(fixture.media.width).toBeGreaterThan(0);
            expect(fixture.media.height).toBeGreaterThan(0);
            expect(fixture.media.alt.id.trim()).not.toBe('');
            expect(fixture.media.alt.en.trim()).not.toBe('');
        }
    });

    test('redacts database failures and returns only aggregate counts', async () => {
        const sensitiveFailure = 'postgresql://fixture-user:fixture-password@db.example.invalid/attentive';
        const database = new MemoryPsychologistSeedDatabase(sensitiveFailure);
        let thrownError: unknown;

        try {
            await seedPsychologists(database);
        } catch (error) {
            thrownError = error;
        }

        const renderedError = String(thrownError);
        expect(renderedError).toContain('Psychologist seed failed.');
        expect(renderedError).not.toContain('fixture-user');
        expect(renderedError).not.toContain('fixture-password');
        expect(renderedError).not.toContain('db.example.invalid');

        const successfulOutput = JSON.stringify(await seedPsychologists(new MemoryPsychologistSeedDatabase()));
        expect(successfulOutput).not.toContain('https://');
        expect(successfulOutput).not.toContain('password');
    });

    test('uses transactional parameterized Drizzle operations without importing browser assets', async () => {
        const source = await Bun.file(new URL('./seed-psychologists.ts', import.meta.url)).text();

        expect(source).toContain('.transaction(');
        expect(source).toContain('onConflictDoUpdate');
        expect(source).not.toContain('sql.raw');
        expect(source).not.toContain('apps/web');
        expect(source).not.toContain('@/assets');
    });
});
