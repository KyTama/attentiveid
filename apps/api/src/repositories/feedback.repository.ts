import { asc, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import type { FeedbackEvent, FeedbackKind, FeedbackReport, FeedbackStatus, FeedbackSubmission } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { feedbackEvents, feedbackFiles, feedbackNotes, feedbackReports } from '../db/schema';

export interface FeedbackUpload {
    name: string;
    mimeType: string;
    data: Buffer;
}

export interface PendingFeedbackFile extends FeedbackUpload {
    id: string;
}

export interface FeedbackEventInput {
    actor: string;
    action: FeedbackEvent['action'];
    detail?: string;
}

export interface FeedbackChange {
    status?: FeedbackStatus;
    kind?: FeedbackKind;
    assignee?: string;
}

export interface FeedbackRepository {
    create(submission: FeedbackSubmission, files: FeedbackUpload[], events: FeedbackEventInput[]): Promise<{ id: string }>;
    /** Newest first. */
    list(limit?: number): Promise<FeedbackReport[]>;
    get(id: string): Promise<FeedbackReport | null>;
    /** Changes status, type or who processes it, and records what happened. */
    update(id: string, change: FeedbackChange, events: FeedbackEventInput[]): Promise<void>;
    addNote(id: string, note: { author: string; body: string }, files: FeedbackUpload[]): Promise<void>;
    /** Files whose content is still in the database (not yet in Drive). */
    pendingFiles(id: string): Promise<PendingFeedbackFile[]>;
    /** Total size of file content still waiting in the database. */
    pendingBytes(): Promise<number>;
    /** Records the Drive folder and empties the content of the files that were copied. */
    markCopied(id: string, folderId: string, fileIds: string[]): Promise<void>;
    markCopyFailed(id: string, error: string): Promise<void>;
    delete(id: string): Promise<boolean>;
}

type Database = typeof defaultDb;

export const createFeedbackRepository = (db: Database = defaultDb): FeedbackRepository => {
    const complete = async (rows: Array<typeof feedbackReports.$inferSelect>): Promise<FeedbackReport[]> => {
        if (rows.length === 0) return [];
        const ids = rows.map((row) => row.id);
        const files = await db
            .select({ reportId: feedbackFiles.reportId, noteId: feedbackFiles.noteId, name: feedbackFiles.name, size: feedbackFiles.byteSize })
            .from(feedbackFiles)
            .where(inArray(feedbackFiles.reportId, ids));
        const notes = await db.select().from(feedbackNotes).where(inArray(feedbackNotes.reportId, ids)).orderBy(asc(feedbackNotes.createdAt));
        const events = await db.select().from(feedbackEvents).where(inArray(feedbackEvents.reportId, ids)).orderBy(asc(feedbackEvents.createdAt));
        const filesOf = (reportId: string, noteId: string | null) =>
            files.filter((file) => file.reportId === reportId && file.noteId === noteId).map(({ name, size }) => ({ name, size }));
        return rows.map((row) => ({
            id: row.id,
            kind: row.kind as FeedbackKind,
            name: row.name,
            message: row.message,
            page: row.page,
            createdAt: row.createdAt,
            status: row.status as FeedbackStatus,
            assignee: row.assignee,
            doneAt: row.doneAt,
            driveFolderId: row.driveFolderId,
            driveError: row.driveError,
            files: filesOf(row.id, null),
            notes: notes
                .filter((note) => note.reportId === row.id)
                .map((note) => ({ id: note.id, author: note.author, body: note.body, createdAt: note.createdAt, files: filesOf(row.id, note.id) })),
            log: events
                .filter((event) => event.reportId === row.id)
                .map((event) => ({ id: event.id, at: event.createdAt, actor: event.actor, action: event.action as FeedbackEvent['action'], detail: event.detail }))
        }));
    };

    const fileRows = (reportId: string, files: FeedbackUpload[], noteId: string | null) =>
        files.map((file) => ({ reportId, noteId, name: file.name, mimeType: file.mimeType, byteSize: file.data.length, data: file.data }));

    return {
        async create(submission, files, events) {
            return db.transaction(async (tx) => {
                const [row] = await tx.insert(feedbackReports).values(submission).returning({ id: feedbackReports.id });
                if (files.length > 0) await tx.insert(feedbackFiles).values(fileRows(row.id, files, null));
                if (events.length > 0) await tx.insert(feedbackEvents).values(events.map((event) => ({ ...event, reportId: row.id })));
                return row;
            });
        },
        async list(limit = 2000) {
            return complete(await db.select().from(feedbackReports).orderBy(desc(feedbackReports.createdAt)).limit(limit));
        },
        async get(id) {
            const rows = await db.select().from(feedbackReports).where(eq(feedbackReports.id, id)).limit(1);
            return (await complete(rows))[0] ?? null;
        },
        async update(id, change, events) {
            await db.transaction(async (tx) => {
                const values = {
                    ...change,
                    ...(change.status ? { doneAt: change.status === 'done' ? new Date().toISOString() : null } : {})
                };
                if (Object.keys(values).length > 0) await tx.update(feedbackReports).set(values).where(eq(feedbackReports.id, id));
                if (events.length > 0) await tx.insert(feedbackEvents).values(events.map((event) => ({ ...event, reportId: id })));
            });
        },
        async addNote(id, note, files) {
            await db.transaction(async (tx) => {
                const [row] = await tx.insert(feedbackNotes).values({ reportId: id, ...note }).returning({ id: feedbackNotes.id });
                if (files.length > 0) await tx.insert(feedbackFiles).values(fileRows(id, files, row.id));
                await tx.insert(feedbackEvents).values({ reportId: id, actor: note.author, action: 'note', detail: files.map((file) => file.name).join(', ') });
            });
        },
        async pendingFiles(id) {
            const rows = await db.select().from(feedbackFiles).where(eq(feedbackFiles.reportId, id));
            return rows.flatMap((row) => (row.data ? [{ id: row.id, name: row.name, mimeType: row.mimeType, data: row.data }] : []));
        },
        async pendingBytes() {
            const [row] = await db
                .select({ total: sql<string>`coalesce(sum(${feedbackFiles.byteSize}), 0)` })
                .from(feedbackFiles)
                .where(isNotNull(feedbackFiles.data));
            return Number(row?.total ?? 0);
        },
        async markCopied(id, folderId, fileIds) {
            await db.update(feedbackReports).set({ driveFolderId: folderId, driveError: null }).where(eq(feedbackReports.id, id));
            if (fileIds.length > 0) await db.update(feedbackFiles).set({ data: null }).where(inArray(feedbackFiles.id, fileIds));
        },
        async markCopyFailed(id, error) {
            await db.update(feedbackReports).set({ driveError: error.slice(0, 300) }).where(eq(feedbackReports.id, id));
        },
        async delete(id) {
            const rows = await db.delete(feedbackReports).where(eq(feedbackReports.id, id)).returning({ id: feedbackReports.id });
            return rows.length > 0;
        }
    };
};
