import { desc, eq, sql } from 'drizzle-orm';
import type { PrayerAdminDto, PrayerInput, PrayerPublicDto } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { prayers } from '../db/schema';

export interface PrayersRepository {
    create(input: PrayerInput, options: { hidden: boolean }): Promise<{ id: string }>;
    /** A prayer that was already saved with the same text since `sinceMs` ago (the same one sent twice). */
    findRecentSameText(prayer: string, sinceMs: number): Promise<{ id: string } | null>;
    /** One random visible prayer, or null when there is none. */
    random(): Promise<PrayerPublicDto | null>;
    listAdmin(limit?: number): Promise<PrayerAdminDto[]>;
    setHidden(id: string, hidden: boolean): Promise<boolean>;
    remove(id: string): Promise<boolean>;
}

const toAdmin = (row: typeof prayers.$inferSelect): PrayerAdminDto => ({
    id: row.id,
    name: row.name ?? '',
    city: row.city ?? '',
    prayer: row.prayer,
    hidden: row.hidden,
    createdAt: row.createdAt
});

export const createPrayersRepository = (db: typeof defaultDb = defaultDb): PrayersRepository => ({
    async create(input, options) {
        const rows = await db
            .insert(prayers)
            .values({ name: input.name || null, city: input.city || null, prayer: input.prayer, hidden: options.hidden })
            .returning({ id: prayers.id });
        return { id: rows[0].id };
    },

    async findRecentSameText(prayer, sinceMs) {
        const since = new Date(Date.now() - sinceMs).toISOString();
        const rows = await db
            .select({ id: prayers.id })
            .from(prayers)
            .where(sql`${prayers.createdAt} >= ${since} and lower(${prayers.prayer}) = ${prayer.toLowerCase()}`)
            .limit(1);
        return rows[0] ?? null;
    },

    async random() {
        const rows = await db
            .select({ prayer: prayers.prayer, name: prayers.name, city: prayers.city })
            .from(prayers)
            .where(eq(prayers.hidden, false))
            .orderBy(sql`random()`)
            .limit(1);
        const row = rows[0];
        return row ? { text: row.prayer, name: row.name ?? '', city: row.city ?? '' } : null;
    },

    async listAdmin(limit = 300) {
        const rows = await db.select().from(prayers).orderBy(desc(prayers.createdAt)).limit(limit);
        return rows.map(toAdmin);
    },

    async setHidden(id, hidden) {
        const rows = await db.update(prayers).set({ hidden }).where(eq(prayers.id, id)).returning({ id: prayers.id });
        return rows.length > 0;
    },

    async remove(id) {
        const rows = await db.delete(prayers).where(eq(prayers.id, id)).returning({ id: prayers.id });
        return rows.length > 0;
    }
});
