/**
 * Earlier published homepage versions, and highlight cards that are to go live later.
 * Restoring or publishing on a schedule changes ONLY the highlight (hero) section of whatever is live at that moment, and
 * a draft somebody saved is kept.
 */
import { and, asc, desc, eq, isNotNull, lte, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { LandingContentMutation } from '@attentiveid/shared';
import * as schema from '../db/schema';
import type { AdminCapability } from './authorization-capability';

export type HeroSection = Extract<LandingContentMutation['sections'][number], { key: 'hero' }>;

export interface LandingVersion {
    id: string;
    number: number;
    publishedAt: string;
    current: boolean;
}

export type ScheduleStatus = 'pending' | 'publishing' | 'published' | 'failed' | 'canceled';

export interface LandingSchedule {
    id: string;
    publishAt: string;
    status: ScheduleStatus;
    createdBy: string;
    createdAt: string;
    error: string;
}

export interface LandingHistory {
    versions(): Promise<LandingVersion[]>;
    /** The highlight of one published version, or null when it is unknown or can no longer be read. */
    hero(revisionId: string): Promise<HeroSection | null>;
    publishHero(capability: AdminCapability, hero: HeroSection): Promise<void>;
    /** True when the live homepage would still be valid with this highlight. */
    fits(capability: AdminCapability, hero: HeroSection): Promise<boolean>;
    schedules(): Promise<LandingSchedule[]>;
    schedule(hero: HeroSection, publishAt: Date, createdBy: string): Promise<string>;
    cancel(scheduleId: string): Promise<boolean>;
    /** Publishes what is due. Returns how many went live. */
    runDue(capability: AdminCapability, now: Date): Promise<number>;
}

interface Transitions {
    publishHeroSection(capability: AdminCapability, hero: HeroSection): Promise<unknown>;
    heroFitsPublished(capability: AdminCapability, hero: HeroSection): Promise<boolean>;
}

const iso = (value: string) => new Date(value).toISOString();

export const createLandingHistory = (
    database: PostgresJsDatabase<typeof schema>,
    transitions: Transitions,
    readRevision: (id: string) => Promise<{ content: LandingContentMutation; publishedAt: string | null } | null>
): LandingHistory => {
    const { landingRevisions, landingAggregates, landingSchedules } = schema;

    return {
        async versions() {
            const [aggregate] = await database.select({ current: landingAggregates.publishedRevisionId }).from(landingAggregates)
                .where(eq(landingAggregates.singletonKey, true)).limit(1);
            const rows = await database.select({ id: landingRevisions.id, number: landingRevisions.revisionNumber, publishedAt: landingRevisions.publishedAt })
                .from(landingRevisions).where(isNotNull(landingRevisions.publishedAt))
                .orderBy(desc(landingRevisions.publishedAt)).limit(200);
            return rows.map((row) => ({ id: row.id, number: row.number, publishedAt: iso(row.publishedAt!), current: row.id === aggregate?.current }));
        },

        async hero(revisionId) {
            const revision = await readRevision(revisionId);
            // Drafts that were never live are not history.
            if (!revision || revision.publishedAt === null) return null;
            return (revision.content.sections.find((section) => section.key === 'hero') as HeroSection | undefined) ?? null;
        },

        async publishHero(capability, hero) {
            await transitions.publishHeroSection(capability, hero);
        },

        fits: (capability, hero) => transitions.heroFitsPublished(capability, hero).catch(() => false),

        async schedules() {
            const rows = await database.select().from(landingSchedules).orderBy(desc(landingSchedules.publishAt)).limit(20);
            return rows.map((row) => ({
                id: row.id,
                publishAt: iso(row.publishAt),
                status: row.status as ScheduleStatus,
                createdBy: row.createdBy,
                createdAt: iso(row.createdAt),
                error: row.error
            }));
        },

        async schedule(hero, publishAt, createdBy) {
            const [row] = await database.insert(landingSchedules)
                .values({ hero, publishAt: publishAt.toISOString(), createdBy })
                .returning({ id: landingSchedules.id });
            return row!.id;
        },

        async cancel(scheduleId) {
            const rows = await database.update(landingSchedules).set({ status: 'canceled', finishedAt: sql`now()` })
                .where(and(eq(landingSchedules.id, scheduleId), eq(landingSchedules.status, 'pending')))
                .returning({ id: landingSchedules.id });
            return rows.length > 0;
        },

        async runDue(capability, now) {
            const due = await database.select({ id: landingSchedules.id }).from(landingSchedules)
                .where(and(eq(landingSchedules.status, 'pending'), lte(landingSchedules.publishAt, now.toISOString())))
                .orderBy(asc(landingSchedules.publishAt));
            let published = 0;
            for (const { id } of due) {
                // Claimed in one step: a second server or a late cancel cannot publish it twice.
                const [claimed] = await database.update(landingSchedules).set({ status: 'publishing' })
                    .where(and(eq(landingSchedules.id, id), eq(landingSchedules.status, 'pending')))
                    .returning({ hero: landingSchedules.hero });
                if (!claimed) continue;
                try {
                    await transitions.publishHeroSection(capability, claimed.hero as HeroSection);
                    await database.update(landingSchedules).set({ status: 'published', finishedAt: sql`now()` }).where(eq(landingSchedules.id, id));
                    published += 1;
                } catch (error) {
                    await database.update(landingSchedules)
                        .set({ status: 'failed', finishedAt: sql`now()`, error: (error instanceof Error ? error.message : 'error').slice(0, 300) })
                        .where(eq(landingSchedules.id, id));
                }
            }
            return published;
        }
    };
};
