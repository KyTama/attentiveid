import { afterAll, describe, expect, test } from 'bun:test';
import { eq, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { sweepAbandonedVersionedMedia } from './media-cleanup';

/** Real PostgreSQL. Runs only against a disposable database named attentiveid_test_*. */
const databaseUrl = process.env.DATABASE_URL;
const databaseName = databaseUrl ? new URL(databaseUrl).pathname.slice(1) : '';
const isDisposable = Boolean(databaseUrl && /^attentiveid_test_[a-z0-9_]+$/.test(databaseName));
const describeIntegration = isDisposable ? describe : describe.skip;

const client = isDisposable ? postgres(databaseUrl!, { max: 4 }) : (null as unknown as ReturnType<typeof postgres>);
const database = isDisposable ? drizzle(client, { schema }) : (null as unknown as ReturnType<typeof drizzle<typeof schema>>);

afterAll(async () => {
    if (isDisposable && client) await client.end();
});

describeIntegration('cleaning up abandoned uploads', () => {
    test('keeps pictures that saved hero slides mention, and removes the truly abandoned one', async () => {
        const stamp = Date.now().toString(36);
        const key = (name: string) => `media/landing/${name}-${stamp}-a1b2c3.png`;
        const slide = key('hero-slide-2');
        const english = key('hero-slide-3-en');
        const part = key('hero-part');
        const abandoned = key('hero-slide-4');
        const team = key('team-photo');
        const [member] = await database.insert(schema.teamMembers).values({ team: 'ops', name: 'Foto', photoUrl: `/${team}` }).returning({ id: schema.teamMembers.id });

        await database.insert(schema.landingAggregates).values({}).onConflictDoNothing();
        const [aggregate] = await database.select().from(schema.landingAggregates).limit(1);
        const [revision] = await database.insert(schema.landingRevisions)
            .values({ aggregateId: aggregate.id, revisionNumber: Math.floor(Math.random() * 1_000_000) + 1000, status: 'superseded' })
            .returning({ id: schema.landingRevisions.id });
        const [section] = await database.insert(schema.landingSections)
            .values({ landingRevisionId: revision.id, key: 'hero', position: 0 })
            .returning({ id: schema.landingSections.id });
        await database.insert(schema.landingSectionTranslations).values({
            sectionId: section.id,
            locale: 'id',
            headline: 'x',
            description: 'x',
            contact: JSON.stringify({ slideItems: [{}, { media: { reference: slide } }, { mediaEn: { reference: english }, elements: [{ media: { reference: part } }] }] })
        });

        const old = new Date(Date.now() - 3 * 3600_000).toISOString();
        await database.insert(schema.mediaObjects).values([slide, english, part, team, abandoned].map((objectKey) => ({
            objectKey, width: 10, height: 10, altId: '', altEn: '', mimeType: 'image/png', createdAt: old, updatedAt: old
        })));

        await sweepAbandonedVersionedMedia(database as never, { force: true });

        const left = await database.select({ objectKey: schema.mediaObjects.objectKey }).from(schema.mediaObjects)
            .where(inArray(schema.mediaObjects.objectKey, [slide, english, part, team, abandoned]));
        expect(left.map((row) => row.objectKey).sort()).toEqual([slide, english, part, team].sort());
        await database.delete(schema.mediaObjects).where(inArray(schema.mediaObjects.objectKey, [slide, english, part, team]));
        await database.delete(schema.teamMembers).where(eq(schema.teamMembers.id, member!.id));
        await database.delete(schema.landingSectionTranslations).where(eq(schema.landingSectionTranslations.sectionId, section.id));
    });
});
