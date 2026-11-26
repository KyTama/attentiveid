import { and, asc, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import type {
    EmailAudience, EmailCampaign, EmailCampaignCounts, EmailCampaignFile, EmailCampaignStatus, EmailLanguage,
    EmailPauseReason, EmailRecipientRow, EmailRecipientStatus
} from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { emailCampaignFiles, emailCampaignRecipients, emailCampaigns, emailSuppressions } from '../db/schema';

export interface CampaignDraft {
    title: string;
    html: string;
    lang: EmailLanguage;
}

export interface NewCampaignFile {
    name: string;
    mimeType: string;
    data: Buffer;
    sha256: string;
}

export interface Recipient {
    contactId: string;
    email: string;
    name: string;
}

/** One e-mail the sender has taken from the queue. */
export interface ClaimedMail {
    id: string;
    campaignId: string;
    contactId: string | null;
    email: string;
    name: string;
    attempts: number;
}

export interface CampaignContent {
    title: string;
    html: string;
    lang: EmailLanguage;
    links: string[];
    files: Array<{ name: string; mimeType: string; data: Buffer }>;
}

/** What the background sender needs. */
export interface EmailQueue {
    /** E-mails left "sending" by a restart are marked "unknown", never sent again on their own. */
    releaseStale(olderThan: Date): Promise<number>;
    attemptsSince(since: Date): Promise<number>;
    claimNext(now: Date): Promise<ClaimedMail | null>;
    content(campaignId: string): Promise<CampaignContent>;
    /** Why this person must not get it any more (unsubscribed or removed or archived since), or null. */
    blocked(mail: ClaimedMail): Promise<'unsubscribed' | 'archived' | null>;
    markSent(id: string, at: Date): Promise<void>;
    markRetry(id: string, error: string, at: Date): Promise<void>;
    markDone(id: string, status: 'failed' | 'skipped' | 'unknown', error: string): Promise<void>;
    /** Puts the claimed e-mail back as it was and pauses every running campaign. */
    pauseAll(id: string, reason: EmailPauseReason): Promise<void>;
    /** Marks the campaign finished (and empties its attachments) when nothing is waiting. */
    finishIfDone(campaignId: string, at: Date): Promise<void>;
}

export interface EmailCampaignsRepository extends EmailQueue {
    list(): Promise<EmailCampaign[]>;
    get(id: string): Promise<EmailCampaign | null>;
    create(draft: CampaignDraft, actor: string): Promise<string>;
    /** Only a draft can change. */
    update(id: string, draft: CampaignDraft): Promise<boolean>;
    deleteDraft(id: string): Promise<boolean>;
    addFile(campaignId: string, file: NewCampaignFile): Promise<EmailCampaignFile>;
    removeFile(campaignId: string, fileId: string): Promise<boolean>;
    storedBytes(): Promise<number>;
    suppressed(emails: string[]): Promise<Set<string>>;
    /** Draft -> queued with its recipients, once: a second call (or a second click) returns false. */
    queue(id: string, audience: EmailAudience, recipients: Recipient[], links: string[], actor: string): Promise<boolean>;
    setStatus(id: string, from: EmailCampaignStatus[], to: EmailCampaignStatus, reason: EmailPauseReason | null): Promise<boolean>;
    recipients(campaignId: string, offset: number, limit: number): Promise<EmailRecipientRow[]>;

    recordOpen(recipientId: string, at: Date): Promise<void>;
    /** Counts the click and returns where the link at this position leads, or null. */
    recordClick(recipientId: string, position: number, at: Date): Promise<string | null>;
    /** Stops all bulk e-mail to this recipient's address; false when the recipient is unknown. */
    unsubscribe(recipientId: string): Promise<boolean>;
}

const EMPTY: EmailCampaignCounts = { total: 0, queued: 0, sent: 0, failed: 0, skipped: 0, unknown: 0, opened: 0, clicked: 0 };

export const createEmailCampaignsRepository = (database: typeof defaultDb = defaultDb): EmailCampaignsRepository => {
    const countsFor = async (ids: string[]) => {
        const map = new Map<string, EmailCampaignCounts>();
        if (ids.length === 0) return map;
        const rows = await database
            .select({
                campaignId: emailCampaignRecipients.campaignId,
                status: emailCampaignRecipients.status,
                n: sql<number>`count(*)::int`,
                opened: sql<number>`count(${emailCampaignRecipients.openedAt})::int`,
                clicked: sql<number>`count(${emailCampaignRecipients.clickedAt})::int`
            })
            .from(emailCampaignRecipients)
            .where(inArray(emailCampaignRecipients.campaignId, ids))
            .groupBy(emailCampaignRecipients.campaignId, emailCampaignRecipients.status);
        for (const row of rows) {
            const counts = map.get(row.campaignId) ?? { ...EMPTY };
            const key = (row.status === 'sending' ? 'queued' : row.status) as Exclude<EmailRecipientStatus, 'sending'>;
            counts[key] += row.n;
            counts.total += row.n;
            counts.opened += row.opened;
            counts.clicked += row.clicked;
            map.set(row.campaignId, counts);
        }
        return map;
    };

    const filesFor = async (ids: string[]) => {
        const map = new Map<string, EmailCampaignFile[]>();
        if (ids.length === 0) return map;
        const rows = await database
            .select({ id: emailCampaignFiles.id, campaignId: emailCampaignFiles.campaignId, name: emailCampaignFiles.name, size: emailCampaignFiles.byteSize })
            .from(emailCampaignFiles)
            .where(inArray(emailCampaignFiles.campaignId, ids))
            .orderBy(asc(emailCampaignFiles.name));
        for (const { campaignId, ...file } of rows) map.set(campaignId, [...(map.get(campaignId) ?? []), file]);
        return map;
    };

    const toCampaigns = async (rows: Array<typeof emailCampaigns.$inferSelect>): Promise<EmailCampaign[]> => {
        const ids = rows.map((row) => row.id);
        const [counts, files] = await Promise.all([countsFor(ids), filesFor(ids)]);
        return rows.map((row) => ({
            id: row.id,
            title: row.title,
            html: row.html,
            lang: row.lang as EmailLanguage,
            status: row.status as EmailCampaignStatus,
            pausedReason: row.pausedReason as EmailPauseReason | null,
            audience: row.audience as EmailAudience | null,
            createdBy: row.createdBy,
            sentBy: row.sentBy,
            createdAt: row.createdAt,
            queuedAt: row.queuedAt,
            finishedAt: row.finishedAt,
            files: files.get(row.id) ?? [],
            counts: counts.get(row.id) ?? { ...EMPTY }
        }));
    };

    const emptyFiles = (campaignId: string) =>
        database.update(emailCampaignFiles).set({ data: null }).where(eq(emailCampaignFiles.campaignId, campaignId));

    const setRecipient = (id: string, values: Partial<typeof emailCampaignRecipients.$inferInsert>) =>
        database.update(emailCampaignRecipients).set(values).where(eq(emailCampaignRecipients.id, id));

    return {
        async list() {
            return toCampaigns(await database.select().from(emailCampaigns).orderBy(desc(emailCampaigns.createdAt)).limit(200));
        },

        async get(id) {
            const rows = await database.select().from(emailCampaigns).where(eq(emailCampaigns.id, id)).limit(1);
            return (await toCampaigns(rows))[0] ?? null;
        },

        async create(draft, actor) {
            const [row] = await database.insert(emailCampaigns).values({ ...draft, createdBy: actor }).returning({ id: emailCampaigns.id });
            return row!.id;
        },

        async update(id, draft) {
            const rows = await database
                .update(emailCampaigns)
                .set({ ...draft, updatedAt: new Date().toISOString() })
                .where(and(eq(emailCampaigns.id, id), eq(emailCampaigns.status, 'draft')))
                .returning({ id: emailCampaigns.id });
            return rows.length > 0;
        },

        async deleteDraft(id) {
            const rows = await database.delete(emailCampaigns).where(and(eq(emailCampaigns.id, id), eq(emailCampaigns.status, 'draft'))).returning({ id: emailCampaigns.id });
            return rows.length > 0;
        },

        async addFile(campaignId, file) {
            const [row] = await database
                .insert(emailCampaignFiles)
                .values({ campaignId, name: file.name, mimeType: file.mimeType, byteSize: file.data.length, sha256: file.sha256, data: file.data })
                .returning({ id: emailCampaignFiles.id });
            return { id: row!.id, name: file.name, size: file.data.length };
        },

        async removeFile(campaignId, fileId) {
            const rows = await database
                .delete(emailCampaignFiles)
                .where(and(eq(emailCampaignFiles.id, fileId), eq(emailCampaignFiles.campaignId, campaignId)))
                .returning({ id: emailCampaignFiles.id });
            return rows.length > 0;
        },

        async storedBytes() {
            const [row] = await database
                .select({ bytes: sql<number>`coalesce(sum(${emailCampaignFiles.byteSize}), 0)::int` })
                .from(emailCampaignFiles)
                .where(isNotNull(emailCampaignFiles.data));
            return row?.bytes ?? 0;
        },

        async suppressed(emails) {
            if (emails.length === 0) return new Set();
            const rows = await database.select({ email: emailSuppressions.email }).from(emailSuppressions).where(inArray(emailSuppressions.email, emails));
            return new Set(rows.map((row) => row.email));
        },

        async queue(id, audience, recipients, links, actor) {
            return database.transaction(async (tx) => {
                const now = new Date().toISOString();
                const claimed = await tx
                    .update(emailCampaigns)
                    .set({ status: 'queued', audience, links, sentBy: actor, queuedAt: now, updatedAt: now })
                    .where(and(eq(emailCampaigns.id, id), eq(emailCampaigns.status, 'draft')))
                    .returning({ id: emailCampaigns.id });
                if (claimed.length === 0) return false;
                for (let at = 0; at < recipients.length; at += 500) {
                    await tx.insert(emailCampaignRecipients)
                        .values(recipients.slice(at, at + 500).map((recipient) => ({ ...recipient, campaignId: id })))
                        .onConflictDoNothing();
                }
                return true;
            });
        },

        async setStatus(id, from, to, reason) {
            const now = new Date().toISOString();
            const rows = await database
                .update(emailCampaigns)
                .set({ status: to, pausedReason: reason, updatedAt: now, ...(to === 'cancelled' ? { finishedAt: now } : {}) })
                .where(and(eq(emailCampaigns.id, id), inArray(emailCampaigns.status, from)))
                .returning({ id: emailCampaigns.id });
            if (rows.length === 0) return false;
            if (to === 'cancelled') {
                await database
                    .update(emailCampaignRecipients)
                    .set({ status: 'skipped', error: 'cancelled' })
                    .where(and(eq(emailCampaignRecipients.campaignId, id), eq(emailCampaignRecipients.status, 'queued')));
                await emptyFiles(id);
            }
            return true;
        },

        async recipients(campaignId, offset, limit) {
            const rows = await database
                .select()
                .from(emailCampaignRecipients)
                .where(eq(emailCampaignRecipients.campaignId, campaignId))
                .orderBy(asc(emailCampaignRecipients.email))
                .offset(offset)
                .limit(limit);
            return rows.map((row) => ({
                id: row.id,
                email: row.email,
                name: row.name,
                status: row.status as EmailRecipientStatus,
                error: row.error,
                sentAt: row.sentAt,
                openedAt: row.openedAt,
                openCount: row.openCount,
                clickedAt: row.clickedAt,
                clickCount: row.clickCount
            }));
        },

        async releaseStale(olderThan) {
            const rows = await database
                .update(emailCampaignRecipients)
                .set({ status: 'unknown', error: 'interrupted' })
                .where(and(eq(emailCampaignRecipients.status, 'sending'), sql`${emailCampaignRecipients.attemptedAt} < ${olderThan.toISOString()}`))
                .returning({ campaignId: emailCampaignRecipients.campaignId });
            return rows.length;
        },

        async attemptsSince(since) {
            const [row] = await database
                .select({ n: sql<number>`count(*)::int` })
                .from(emailCampaignRecipients)
                .where(sql`${emailCampaignRecipients.attemptedAt} > ${since.toISOString()}`);
            return row?.n ?? 0;
        },

        async claimNext(now) {
            const at = now.toISOString();
            // SKIP LOCKED: two senders can never take the same e-mail.
            const rows = await database.execute(sql`
                update email_campaign_recipients set status = 'sending', attempted_at = ${at}, attempts = attempts + 1
                where id = (
                    select r.id from email_campaign_recipients r
                    join email_campaigns c on c.id = r.campaign_id
                    where c.status = 'queued' and r.status = 'queued' and (r.next_attempt_at is null or r.next_attempt_at <= ${at})
                    order by c.queued_at, r.id
                    for update of r skip locked
                    limit 1
                )
                returning id, campaign_id as "campaignId", contact_id as "contactId", email, name, attempts`);
            return (rows as unknown as ClaimedMail[])[0] ?? null;
        },

        async content(campaignId) {
            const [row] = await database.select().from(emailCampaigns).where(eq(emailCampaigns.id, campaignId)).limit(1);
            if (!row) throw new Error('campaign missing');
            const files = await database.select().from(emailCampaignFiles).where(eq(emailCampaignFiles.campaignId, campaignId));
            return {
                title: row.title,
                html: row.html,
                lang: row.lang as EmailLanguage,
                links: row.links as string[],
                files: files.filter((file) => file.data).map((file) => ({ name: file.name, mimeType: file.mimeType, data: file.data! }))
            };
        },

        async blocked(mail) {
            const found = await database.execute(sql`
                select
                    exists(select 1 from email_suppressions where email = ${mail.email}) as unsubscribed,
                    not exists(select 1 from email_contacts where id = ${mail.contactId} and archived_at is null) as gone`);
            const row = (found as unknown as Array<{ unsubscribed: boolean; gone: boolean }>)[0]!;
            return row.unsubscribed ? 'unsubscribed' : row.gone ? 'archived' : null;
        },

        async markSent(id, at) {
            await setRecipient(id, { status: 'sent', sentAt: at.toISOString(), error: '', nextAttemptAt: null });
        },

        async markRetry(id, error, at) {
            await setRecipient(id, { status: 'queued', error, nextAttemptAt: at.toISOString() });
        },

        async markDone(id, status, error) {
            // A skipped e-mail was never handed to the mail server, so it does not count against the daily limit.
            await setRecipient(id, { status, error, ...(status === 'skipped' ? { attemptedAt: null } : {}) });
        },

        async pauseAll(id, reason) {
            await database.update(emailCampaignRecipients)
                .set({ status: 'queued', attemptedAt: null, attempts: sql`${emailCampaignRecipients.attempts} - 1` })
                .where(eq(emailCampaignRecipients.id, id));
            await database.update(emailCampaigns)
                .set({ status: 'paused', pausedReason: reason, updatedAt: new Date().toISOString() })
                .where(eq(emailCampaigns.status, 'queued'));
        },

        async finishIfDone(campaignId, at) {
            const rows = await database.execute(sql`
                update email_campaigns set status = 'done', finished_at = ${at.toISOString()}, updated_at = ${at.toISOString()}
                where id = ${campaignId} and status in ('queued', 'paused')
                  and not exists(select 1 from email_campaign_recipients where campaign_id = ${campaignId} and status in ('queued', 'sending'))
                returning id`);
            if ((rows as unknown as unknown[]).length > 0) await emptyFiles(campaignId);
        },

        async recordOpen(recipientId, at) {
            const when = at.toISOString();
            await setRecipient(recipientId, {
                openedAt: sql`coalesce(${emailCampaignRecipients.openedAt}, ${when})` as never,
                lastOpenedAt: when,
                openCount: sql`${emailCampaignRecipients.openCount} + 1` as never
            });
        },

        async recordClick(recipientId, position, at) {
            const [row] = await database
                .select({ links: emailCampaigns.links })
                .from(emailCampaignRecipients)
                .innerJoin(emailCampaigns, eq(emailCampaigns.id, emailCampaignRecipients.campaignId))
                .where(eq(emailCampaignRecipients.id, recipientId))
                .limit(1);
            const url = (row?.links as string[] | undefined)?.[position];
            if (!url) return null;
            await setRecipient(recipientId, {
                clickedAt: sql`coalesce(${emailCampaignRecipients.clickedAt}, ${at.toISOString()})` as never,
                clickCount: sql`${emailCampaignRecipients.clickCount} + 1` as never
            });
            return url;
        },

        async unsubscribe(recipientId) {
            const [row] = await database.select({ email: emailCampaignRecipients.email }).from(emailCampaignRecipients).where(eq(emailCampaignRecipients.id, recipientId)).limit(1);
            if (!row) return false;
            await database.insert(emailSuppressions).values({ email: row.email, reason: 'unsubscribed' }).onConflictDoNothing();
            return true;
        }
    };
};
