import { desc, eq } from 'drizzle-orm';
import type { FeedbackKind, FeedbackReport, FeedbackSubmission } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { feedbackReports } from '../db/schema';

export interface FeedbackRepository {
    create(submission: FeedbackSubmission): Promise<void>;
    /** Newest first. */
    list(limit?: number): Promise<FeedbackReport[]>;
    /** Marks done or open again. Returns false when the report does not exist. */
    setDone(id: string, done: boolean): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}

const toReport = (row: typeof feedbackReports.$inferSelect): FeedbackReport => ({
    id: row.id,
    kind: row.kind as FeedbackKind,
    name: row.name,
    message: row.message,
    page: row.page,
    createdAt: row.createdAt,
    doneAt: row.doneAt
});

export const createFeedbackRepository = (db: typeof defaultDb = defaultDb): FeedbackRepository => ({
    async create(submission) {
        await db.insert(feedbackReports).values(submission);
    },
    async list(limit = 500) {
        const rows = await db.select().from(feedbackReports).orderBy(desc(feedbackReports.createdAt)).limit(limit);
        return rows.map(toReport);
    },
    async setDone(id, done) {
        const rows = await db.update(feedbackReports)
            .set({ doneAt: done ? new Date().toISOString() : null })
            .where(eq(feedbackReports.id, id))
            .returning({ id: feedbackReports.id });
        return rows.length > 0;
    },
    async delete(id) {
        const rows = await db.delete(feedbackReports).where(eq(feedbackReports.id, id)).returning({ id: feedbackReports.id });
        return rows.length > 0;
    }
});
