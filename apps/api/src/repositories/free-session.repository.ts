import { desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { FreeSessionGenderId, FreeSessionKeluhanId, FreeSessionRecord, FreeSessionSubmission } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { freeSessionSubmissions } from '../db/schema';

export interface FreeSessionRepository {
    create(submission: FreeSessionSubmission): Promise<{ id: string }>;
    /** The newest submission with this phone number (0812... and +62 812... match), if any. */
    findByPhone(phone: string): Promise<{ id: string; createdAt: string } | null>;
    listAll(): Promise<FreeSessionRecord[]>;
    /** Submissions not yet written to the Google Sheet, oldest first. */
    listUnsynced(limit?: number): Promise<FreeSessionRecord[]>;
    markSynced(ids: string[]): Promise<void>;
    markFailed(ids: string[], error: string): Promise<void>;
    sheetStatus(): Promise<{ pending: number; failed: number }>;
    /** Permanently removes one submission (owner-only clean-up of test entries). Returns false when it does not exist. */
    deleteById(id: string): Promise<boolean>;
}

const toRecord = (row: typeof freeSessionSubmissions.$inferSelect): FreeSessionRecord => ({
    id: row.id,
    createdAt: row.createdAt,
    name: row.name,
    age: row.age,
    gender: row.gender as FreeSessionGenderId | null,
    phone: row.phone,
    email: row.email,
    keluhan: row.keluhan as FreeSessionKeluhanId,
    keluhanDetail: row.keluhanDetail
});

/** Digits only, with a leading country code 62 treated as 0 (0812... and +62 812... are the same number). */
const digits = (value: string) => value.replace(/\D+/g, '').replace(/^62/, '0');

export const createFreeSessionRepository = (db: typeof defaultDb = defaultDb): FreeSessionRepository => ({
    async create(submission) {
        const rows = await db
            .insert(freeSessionSubmissions)
            .values({
                name: submission.name,
                age: submission.age,
                gender: submission.gender,
                phone: submission.phone,
                email: submission.email,
                keluhan: submission.keluhan,
                keluhanDetail: submission.keluhanDetail
            })
            .returning({ id: freeSessionSubmissions.id });
        return { id: rows[0].id };
    },

    async findByPhone(phone) {
        const key = digits(phone);
        const rows = await db
            .select({ id: freeSessionSubmissions.id, createdAt: freeSessionSubmissions.createdAt })
            .from(freeSessionSubmissions)
            .where(sql`regexp_replace(regexp_replace(${freeSessionSubmissions.phone}, '[^0-9]', '', 'g'), '^62', '0') = ${key}`)
            .orderBy(desc(freeSessionSubmissions.createdAt))
            .limit(1);
        return rows[0] ?? null;
    },

    async listAll() {
        const rows = await db
            .select()
            .from(freeSessionSubmissions)
            .orderBy(desc(freeSessionSubmissions.createdAt));
        return rows.map(toRecord);
    },

    async listUnsynced(limit = 200) {
        const rows = await db
            .select()
            .from(freeSessionSubmissions)
            .where(isNull(freeSessionSubmissions.sheetSyncedAt))
            .orderBy(freeSessionSubmissions.createdAt)
            .limit(limit);
        return rows.map(toRecord);
    },

    async markSynced(ids) {
        if (ids.length === 0) return;
        await db
            .update(freeSessionSubmissions)
            .set({ sheetSyncedAt: sql`now()`, sheetError: null })
            .where(inArray(freeSessionSubmissions.id, ids));
    },

    async markFailed(ids, error) {
        if (ids.length === 0) return;
        await db
            .update(freeSessionSubmissions)
            .set({ sheetError: error.slice(0, 500) })
            .where(inArray(freeSessionSubmissions.id, ids));
    },

    async sheetStatus() {
        const [row] = await db
            .select({
                pending: sql<number>`count(*) filter (where ${freeSessionSubmissions.sheetSyncedAt} is null)`,
                failed: sql<number>`count(*) filter (where ${freeSessionSubmissions.sheetSyncedAt} is null and ${freeSessionSubmissions.sheetError} is not null)`
            })
            .from(freeSessionSubmissions);
        return { pending: Number(row?.pending ?? 0), failed: Number(row?.failed ?? 0) };
    },

    async deleteById(id) {
        const rows = await db
            .delete(freeSessionSubmissions)
            .where(eq(freeSessionSubmissions.id, id))
            .returning({ id: freeSessionSubmissions.id });
        return rows.length > 0;
    }
});
