import { afterAll, describe, expect, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { createDrizzleLandingContentSource, createLandingContentRepository } from '../repositories/landing-content.repository';
import { createAdminCapability } from './authorization-capability';
import { createContentTransitions, createDrizzleContentTransitionDatabase } from './content-transitions';
import { createLandingHistory, type HeroSection } from './landing-history';

/** On real PostgreSQL with the seeded homepage. Runs only against a disposable attentiveid_test_* database. */
const databaseUrl = process.env.DATABASE_URL;
const databaseName = databaseUrl ? new URL(databaseUrl).pathname.slice(1) : '';
const isDisposable = Boolean(databaseUrl && /^attentiveid_test_[a-z0-9_]+$/.test(databaseName));
const describeIntegration = isDisposable ? describe : describe.skip;

const client = isDisposable ? postgres(databaseUrl!, { max: 4 }) : (null as unknown as ReturnType<typeof postgres>);
const database = isDisposable ? drizzle(client, { schema }) : (null as unknown as ReturnType<typeof drizzle>);
const repository = createLandingContentRepository(createDrizzleLandingContentSource(database as never));
const transitions = createContentTransitions(createDrizzleContentTransitionDatabase(database as never));
const history = createLandingHistory(database as never, transitions as never, async (id) => {
    const read = await repository.getRevision(id);
    return read ? { content: read.content, publishedAt: read.revision.publishedAt } : null;
});
const admin = createAdminCapability('history-test');

const live = async () => (await repository.getPublished())!;
const heroOf = (content: { sections: Array<{ key: string }> }) => content.sections.find((s) => s.key === 'hero') as unknown as HeroSection;
const faq = (content: any) => content.sections.find((s: any) => s.key === 'frequentlyAskedQuestions').headline.id as string;
const withHeadline = (content: any, hero: string, other: string) => ({
    ...content,
    sections: content.sections.map((s: any) => s.key === 'hero' ? { ...s, headline: { id: hero, en: hero } }
        : s.key === 'frequentlyAskedQuestions' ? { ...s, headline: { id: other, en: other } } : s)
});

describeIntegration('homepage history and scheduled highlight', () => {
    afterAll(async () => { await client.end(); });

    test('restores only the highlight, keeps the saved draft, and publishes on time once', async () => {
        const start = (await live()).content;
        await transitions.saveAndPublishLandingContent(admin, withHeadline(start, 'Old highlight', 'Old questions') as never);
        const oldId = (await history.versions()).find((v) => v.current)!.id;
        await transitions.saveAndPublishLandingContent(admin, withHeadline(start, 'New highlight', 'New questions') as never);
        const newHero = heroOf((await live()).content);
        await transitions.createLandingDraft(admin, withHeadline(start, 'Draft highlight', 'Draft questions') as never);

        await history.publishHero(admin, (await history.hero(oldId))!);
        let now = (await live()).content;
        expect(heroOf(now).headline.id).toBe('Old highlight');
        expect(faq(now)).toBe('New questions');
        const draft = (await repository.getDraftOrPublished())!;
        expect(heroOf(draft).headline.id).toBe('Draft highlight');

        const at = new Date(Date.now() + 3_600_000);
        expect(await history.fits(admin, newHero)).toBe(true);
        await history.schedule(newHero, at, 'tester@example.test');
        expect(await history.runDue(admin, new Date())).toBe(0);
        expect(await history.runDue(admin, new Date(at.getTime() + 1000))).toBe(1);
        expect(await history.runDue(admin, new Date(at.getTime() + 2000))).toBe(0);
        now = (await live()).content;
        expect(heroOf(now).headline.id).toBe('New highlight');
        expect(faq(now)).toBe('New questions');
        expect((await history.schedules())[0]).toMatchObject({ status: 'published' });
        expect(heroOf((await repository.getDraftOrPublished())!).headline.id).toBe('Draft highlight');
    });

    test('a cancelled schedule never goes live', async () => {
        const hero = { ...heroOf((await live()).content), headline: { id: 'Never', en: 'Never' } } as HeroSection;
        const id = await history.schedule(hero, new Date(Date.now() + 3_600_000), 'tester@example.test');
        expect(await history.cancel(id)).toBe(true);
        expect(await history.cancel(id)).toBe(false);
        expect(await history.runDue(admin, new Date(Date.now() + 7_200_000))).toBe(0);
        expect(heroOf((await live()).content).headline.id).not.toBe('Never');
    });
});
