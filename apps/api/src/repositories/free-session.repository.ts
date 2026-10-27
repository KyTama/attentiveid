import { desc } from 'drizzle-orm';
import type { FreeSessionGenderId, FreeSessionKeluhanId, FreeSessionRecord, FreeSessionSubmission } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { freeSessionSubmissions } from '../db/schema';

export interface FreeSessionRepository {
    create(submission: FreeSessionSubmission): Promise<{ id: string }>;
    listAll(): Promise<FreeSessionRecord[]>;
}

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
        return rows.map((row) => ({
            id: row.id,
            createdAt: row.createdAt,
            name: row.name,
            age: row.age,
            gender: row.gender as FreeSessionGenderId | null,
            phone: row.phone,
            email: row.email,
            keluhan: row.keluhan as FreeSessionKeluhanId,
            keluhanDetail: row.keluhanDetail
        }));
    }
});
