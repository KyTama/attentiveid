import { randomBytes } from 'node:crypto';
import { desc, eq, and } from 'drizzle-orm';
import { db as defaultDb } from '../db';
import { assessmentInvites, psychologists } from '../db/schema';
import type { InvitedTrack } from '../services/mhcu-tracks';

export type InviteStatus = 'OPEN' | 'USED' | 'CANCELLED';

/** INV0001 style number of an invitation. */
export const inviteCode = (inviteNo: number): string => `INV${String(inviteNo).padStart(4, '0')}`;

export interface InviteRecord {
    id: string;
    /** INV0001 */
    code: string;
    token: string;
    track: InvitedTrack;
    psychologistId: string;
    psychologistName: string | null;
    clientName: string | null;
    clientEmail: string | null;
    phone: string | null;
    note: string | null;
    lang: 'id' | 'en' | null;
    status: InviteStatus;
    createdBy: string | null;
    createdAt: string;
    usedAt: string | null;
    usedSubmissionId: string | null;
}

export interface NewInvite {
    track: InvitedTrack;
    psychologistId: string;
    clientName?: string | null;
    clientEmail?: string | null;
    phone?: string | null;
    note?: string | null;
    lang?: 'id' | 'en' | null;
    createdBy: string | null;
}

/** What the public form may learn about a link: nothing but whether it works, the track and the name the admin typed. */
export interface PublicInvite {
    valid: boolean;
    track?: InvitedTrack;
    clientName?: string | null;
    lang?: 'id' | 'en' | null;
}

export type CancelResult = 'cancelled' | 'notFound' | 'notOpen';

export interface MhcuInvitesRepository {
    create(input: NewInvite): Promise<InviteRecord>;
    /** Newest first. */
    list(limit?: number): Promise<InviteRecord[]>;
    get(id: string): Promise<InviteRecord | null>;
    /** Only an OPEN invitation can be cancelled. */
    cancel(id: string): Promise<CancelResult>;
    /** For the public form: does this token work, and for which track. */
    lookup(token: string): Promise<PublicInvite>;
    /** An invitation can only name a psychologist who exists and takes clients (status 'active'). */
    isActivePsychologist(id: string): Promise<boolean>;
}

export const INVITE_TOKEN = /^[0-9a-f]{16}$/;

const toRecord = (row: typeof assessmentInvites.$inferSelect, psychologistName: string | null): InviteRecord => ({
    id: row.id,
    code: inviteCode(row.inviteNo),
    token: row.token,
    track: row.track as InvitedTrack,
    psychologistId: row.psychologistId,
    psychologistName,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    phone: row.phone,
    note: row.note,
    lang: row.lang === 'id' || row.lang === 'en' ? row.lang : null,
    status: row.status as InviteStatus,
    createdBy: row.createdBy,
    createdAt: row.createdAt,
    usedAt: row.usedAt,
    usedSubmissionId: row.usedSubmissionId
});

export const createMhcuInvitesRepository = (db: typeof defaultDb = defaultDb): MhcuInvitesRepository => {
    const selectWithName = () =>
        db
            .select({ invite: assessmentInvites, psychologistName: psychologists.name })
            .from(assessmentInvites)
            .leftJoin(psychologists, eq(psychologists.id, assessmentInvites.psychologistId));

    return {
        async create(input) {
            // 64 random bits as 16 hex characters; a clash (practically impossible) is retried with a new token.
            for (let attempt = 0; attempt < 5; attempt++) {
                const token = randomBytes(8).toString('hex');
                try {
                    const [row] = await db
                        .insert(assessmentInvites)
                        .values({
                            token,
                            track: input.track,
                            psychologistId: input.psychologistId,
                            clientName: input.clientName ?? null,
                            clientEmail: input.clientEmail ?? null,
                            phone: input.phone ?? null,
                            note: input.note ?? null,
                            lang: input.lang ?? null,
                            createdBy: input.createdBy
                        })
                        .returning();
                    const found = await this.get(row.id);
                    return found as InviteRecord;
                } catch (error) {
                    const message = error instanceof Error ? `${error.message} ${(error as { cause?: Error }).cause?.message ?? ''}` : '';
                    if (!/assessment_invites_token_idx|duplicate key/i.test(message)) throw error;
                }
            }
            throw new Error('Could not create a unique invitation token');
        },

        async list(limit = 200) {
            const rows = await selectWithName().orderBy(desc(assessmentInvites.createdAt), desc(assessmentInvites.inviteNo)).limit(limit);
            return rows.map((r) => toRecord(r.invite, r.psychologistName));
        },

        async get(id) {
            const rows = await selectWithName().where(eq(assessmentInvites.id, id)).limit(1);
            return rows[0] ? toRecord(rows[0].invite, rows[0].psychologistName) : null;
        },

        async cancel(id) {
            const rows = await db
                .update(assessmentInvites)
                .set({ status: 'CANCELLED' })
                .where(and(eq(assessmentInvites.id, id), eq(assessmentInvites.status, 'OPEN')))
                .returning({ id: assessmentInvites.id });
            if (rows[0]) return 'cancelled';
            const exists = await db.select({ id: assessmentInvites.id }).from(assessmentInvites).where(eq(assessmentInvites.id, id)).limit(1);
            return exists[0] ? 'notOpen' : 'notFound';
        },

        async isActivePsychologist(id) {
            const rows = await db.select({ id: psychologists.id }).from(psychologists).where(and(eq(psychologists.id, id), eq(psychologists.status, 'active'))).limit(1);
            return rows.length > 0;
        },

        async lookup(token) {
            if (!INVITE_TOKEN.test(token)) return { valid: false };
            const rows = await db
                .select({ track: assessmentInvites.track, clientName: assessmentInvites.clientName, lang: assessmentInvites.lang, status: assessmentInvites.status })
                .from(assessmentInvites)
                .where(eq(assessmentInvites.token, token))
                .limit(1);
            const row = rows[0];
            if (!row || row.status !== 'OPEN') return { valid: false };
            return { valid: true, track: row.track as InvitedTrack, clientName: row.clientName, lang: row.lang === 'id' || row.lang === 'en' ? row.lang : null };
        }
    };
};
