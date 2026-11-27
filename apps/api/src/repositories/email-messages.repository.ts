import { and, asc, desc, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';

const { emailMessages, emailCampaignRecipients } = schema;

export type MessageDirection = 'out' | 'in';
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'received';

/** One single e-mail of a conversation: a reply written in the portal, or one that came in. */
export interface EmailMessageRow {
    id: string;
    contactId: string;
    direction: MessageDirection;
    subject: string;
    body: string;
    files: string[];
    sentBy: string;
    status: MessageStatus;
    messageId: string;
    at: string;
    readAt: string | null;
}

export interface NewEmailMessage {
    contactId: string;
    direction: MessageDirection;
    subject: string;
    body: string;
    files?: string[];
    sentBy?: string;
    status: MessageStatus;
    messageId?: string;
    /** The mailbox's own id of an incoming message, so it is stored once. */
    providerId?: string;
    at: Date;
}

export interface MessageSummary {
    contactId: string;
    lastSubject: string;
    lastAt: string;
    count: number;
    unread: number;
}

export interface EmailMessagesRepository {
    summaries(): Promise<MessageSummary[]>;
    /** Oldest first, the last 100. */
    conversation(contactId: string): Promise<EmailMessageRow[]>;
    /** Null when a message with this providerId is already stored. */
    add(message: NewEmailMessage): Promise<string | null>;
    setStatus(id: string, status: MessageStatus): Promise<void>;
    markRead(contactId: string, at: Date): Promise<void>;
    /** True when the same text was already written to this person after `since` (a double click, or two admins). */
    sentSame(contactId: string, body: string, since: Date): Promise<boolean>;
    outgoingSince(since: Date): Promise<number>;
    knownProviderIds(ids: string[]): Promise<Set<string>>;
    /** Whether the portal has ever e-mailed this contact. */
    wasMailed(contactId: string): Promise<boolean>;
}

const iso = (value: string) => new Date(value).toISOString();

export const createEmailMessagesRepository = (database: PostgresJsDatabase<typeof schema>): EmailMessagesRepository => ({
    async summaries() {
        const rows = await database.execute(sql`
            select distinct on (contact_id)
                contact_id as "contactId", subject as "lastSubject", created_at as "lastAt",
                (count(*) over (partition by contact_id))::int as count,
                (count(*) filter (where direction = 'in' and read_at is null) over (partition by contact_id))::int as unread
            from email_messages
            order by contact_id, created_at desc`);
        return (rows as unknown as MessageSummary[]).map((row) => ({ ...row, lastAt: iso(row.lastAt) }));
    },

    async conversation(contactId) {
        const rows = await database.select().from(emailMessages).where(eq(emailMessages.contactId, contactId))
            .orderBy(desc(emailMessages.createdAt)).limit(100);
        return rows.reverse().map((row) => ({
            id: row.id,
            contactId: row.contactId,
            direction: row.direction as MessageDirection,
            subject: row.subject,
            body: row.body,
            files: row.files,
            sentBy: row.sentBy,
            status: row.status as MessageStatus,
            messageId: row.messageId,
            at: iso(row.createdAt),
            readAt: row.readAt ? iso(row.readAt) : null
        }));
    },

    async add({ at, ...message }) {
        const [row] = await database.insert(emailMessages)
            .values({ ...message, createdAt: at.toISOString() })
            .onConflictDoNothing()
            .returning({ id: emailMessages.id });
        return row?.id ?? null;
    },

    async setStatus(id, status) {
        await database.update(emailMessages).set({ status }).where(eq(emailMessages.id, id));
    },

    async markRead(contactId, at) {
        await database.update(emailMessages).set({ readAt: at.toISOString() })
            .where(and(eq(emailMessages.contactId, contactId), eq(emailMessages.direction, 'in'), isNull(emailMessages.readAt)));
    },

    async sentSame(contactId, body, since) {
        const [row] = await database.select({ id: emailMessages.id }).from(emailMessages)
            .where(and(eq(emailMessages.contactId, contactId), eq(emailMessages.direction, 'out'), eq(emailMessages.body, body),
                inArray(emailMessages.status, ['sending', 'sent']), gt(emailMessages.createdAt, since.toISOString())))
            .limit(1);
        return Boolean(row);
    },

    async outgoingSince(since) {
        const [row] = await database.select({ n: sql<number>`count(*)::int` }).from(emailMessages)
            .where(and(eq(emailMessages.direction, 'out'), gt(emailMessages.createdAt, since.toISOString())));
        return row?.n ?? 0;
    },

    async knownProviderIds(ids) {
        if (ids.length === 0) return new Set<string>();
        const rows = await database.select({ id: emailMessages.providerId }).from(emailMessages).where(inArray(emailMessages.providerId, ids)).orderBy(asc(emailMessages.createdAt));
        return new Set(rows.map((row) => row.id!));
    },

    async wasMailed(contactId) {
        const [sent] = await database.select({ id: emailCampaignRecipients.id }).from(emailCampaignRecipients)
            .where(and(eq(emailCampaignRecipients.contactId, contactId), eq(emailCampaignRecipients.status, 'sent'))).limit(1);
        return Boolean(sent);
    }
});

/** For tests and setups without the table: nothing is stored, nothing is shown. */
export const noEmailMessages: EmailMessagesRepository = {
    summaries: async () => [],
    conversation: async () => [],
    add: async () => null,
    setStatus: async () => undefined,
    markRead: async () => undefined,
    sentSame: async () => false,
    outgoingSince: async () => 0,
    knownProviderIds: async () => new Set<string>(),
    wasMailed: async () => false
};
