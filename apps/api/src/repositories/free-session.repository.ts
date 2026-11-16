import { desc, inArray, isNull, sql } from 'drizzle-orm';
import type { FreeSessionGenderId, FreeSessionKeluhanId, FreeSessionRecord, FreeSessionSubmission } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { freeSessionSubmissions } from '../db/schema';

export interface FreeSessionRepository {
    create(submission: FreeSessionSubmission): Promise<{ id: string }>;
    listAll(): Promise<FreeSessionRecord[]>;
    /** Submissions not yet written to the Google Sheet, oldest first. */
    listUnsynced(limit?: number): Promise<FreeSessionRecord[]>;
    markSynced(ids: string[]): Promise<void>;
    markFailed(ids: string[], error: string): Promise<void>;
    sheetStatus(): Promise<{ pending: number; failed: number }>;
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
    }
});
