import { desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import type { FeedbackKind, FeedbackReport, FeedbackSubmission } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { feedbackFiles, feedbackReports } from '../db/schema';

export interface FeedbackUpload {
    name: string;
    mimeType: string;
    data: Buffer;
}

export interface FeedbackRepository {
    create(submission: FeedbackSubmission, files: FeedbackUpload[]): Promise<{ id: string }>;
    /** Newest first. */
    list(limit?: number): Promise<FeedbackReport[]>;
    get(id: string): Promise<FeedbackReport | null>;
    /** Files whose content is still in the database (not yet in Drive). */
    pendingFiles(id: string): Promise<FeedbackUpload[]>;
    /** Total size of file content still waiting in the database. */
    pendingBytes(): Promise<number>;
    /** Records the Drive folder and empties the stored file content. */
    markCopied(id: string, folderId: string): Promise<void>;
    markCopyFailed(id: string, error: string): Promise<void>;
    /** Marks done or open again. Returns false when the report does not exist. */
    setDone(id: string, done: boolean): Promise<boolean>;
    delete(id: string): Promise<boolean>;
}

type Database = typeof defaultDb;

export const createFeedbackRepository = (db: Database = defaultDb): FeedbackRepository => {
    const withFiles = async (rows: Array<typeof feedbackReports.$inferSelect>): Promise<FeedbackReport[]> => {
        if (rows.length === 0) return [];
        const files = await db
            .select({ reportId: feedbackFiles.reportId, name: feedbackFiles.name, size: feedbackFiles.byteSize })
            .from(feedbackFiles)
            .where(inArray(feedbackFiles.reportId, rows.map((row) => row.id)));
        return rows.map((row) => ({
            id: row.id,
            kind: row.kind as FeedbackKind,
            name: row.name,
            message: row.message,
            page: row.page,
            createdAt: row.createdAt,
            doneAt: row.doneAt,
            driveFolderId: row.driveFolderId,
            driveError: row.driveError,
            files: files.filter((file) => file.reportId === row.id).map(({ name, size }) => ({ name, size }))
        }));
    };

    return {
        async create(submission, files) {
            return db.transaction(async (tx) => {
                const [row] = await tx.insert(feedbackReports).values(submission).returning({ id: feedbackReports.id });
                if (files.length > 0) {
                    await tx.insert(feedbackFiles).values(files.map((file) => ({
                        reportId: row.id,
                        name: file.name,
                        mimeType: file.mimeType,
                        byteSize: file.data.length,
                        data: file.data
                    })));
                }
                return row;
            });
        },
        async list(limit = 500) {
            return withFiles(await db.select().from(feedbackReports).orderBy(desc(feedbackReports.createdAt)).limit(limit));
        },
        async get(id) {
            const rows = await db.select().from(feedbackReports).where(eq(feedbackReports.id, id)).limit(1);
            return (await withFiles(rows))[0] ?? null;
        },
        async pendingFiles(id) {
            const rows = await db.select().from(feedbackFiles).where(eq(feedbackFiles.reportId, id));
            return rows.flatMap((row) => (row.data ? [{ name: row.name, mimeType: row.mimeType, data: row.data }] : []));
        },
        async pendingBytes() {
            const [row] = await db
                .select({ total: sql<string>`coalesce(sum(${feedbackFiles.byteSize}), 0)` })
                .from(feedbackFiles)
                .where(isNotNull(feedbackFiles.data));
            return Number(row?.total ?? 0);
        },
        async markCopied(id, folderId) {
            await db.update(feedbackReports).set({ driveFolderId: folderId, driveError: null }).where(eq(feedbackReports.id, id));
            await db.update(feedbackFiles).set({ data: null }).where(eq(feedbackFiles.reportId, id));
        },
        async markCopyFailed(id, error) {
            await db.update(feedbackReports).set({ driveError: error.slice(0, 300) }).where(eq(feedbackReports.id, id));
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
    };
};
