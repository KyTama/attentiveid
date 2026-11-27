/**
 * Reads replies to the portal's e-mails from the mailbox (Gmail API, read-only permission) and stores them in the chat of
 * the contact who wrote. Only mail addressed to the reply address (contact+bulk@...) is asked for, and only mail from a
 * contact the portal has e-mailed is kept. The mailbox is never changed.
 */
import type { EmailMessagesRepository } from '../repositories/email-messages.repository';
import { htmlToText } from './email-content';

export interface InboxCredentials {
    clientId: string;
    clientSecret: string;
    /** From scripts/google-gmail-token.ts, scope gmail.readonly. */
    refreshToken: string;
}

export interface GmailPart {
    mimeType?: string;
    filename?: string;
    headers?: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: GmailPart[];
}

export interface GmailMessage {
    id: string;
    internalDate?: string;
    payload?: GmailPart;
}

export interface GmailReader {
    list(query: string): Promise<string[]>;
    get(id: string): Promise<GmailMessage>;
}

const API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const BODY_MAX = 10_000;

export const createGmailReader = (credentials: InboxCredentials, request: typeof fetch = fetch): GmailReader => {
    let token = { value: '', until: 0 };
    const accessToken = async () => {
        if (Date.now() < token.until) return token.value;
        const response = await request('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: credentials.clientId, client_secret: credentials.clientSecret, refresh_token: credentials.refreshToken, grant_type: 'refresh_token' }),
            signal: AbortSignal.timeout(15_000)
        });
        const json = (await response.json()) as { access_token?: string; expires_in?: number };
        if (!response.ok || !json.access_token) throw new Error(`Gmail sign-in failed (${response.status})`);
        token = { value: json.access_token, until: Date.now() + ((json.expires_in ?? 3600) - 60) * 1000 };
        return token.value;
    };
    const read = async <T>(path: string): Promise<T> => {
        const response = await request(`${API}${path}`, { headers: { authorization: `Bearer ${await accessToken()}` }, signal: AbortSignal.timeout(15_000) });
        if (!response.ok) throw new Error(`Gmail read failed (${response.status})`);
        return (await response.json()) as T;
    };
    return {
        async list(query) {
            const json = await read<{ messages?: Array<{ id: string }> }>(`/messages?${new URLSearchParams({ q: query, maxResults: '100' })}`);
            return (json.messages ?? []).map((message) => message.id);
        },
        get: (id) => read<GmailMessage>(`/messages/${encodeURIComponent(id)}?format=full`)
    };
};

const header = (part: GmailPart | undefined, name: string) =>
    part?.headers?.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value ?? '';

/** The address of "Name <a@b.c>" or "a@b.c", lower case. */
export const addressOf = (from: string) => (from.match(/<([^<>]+)>\s*$/)?.[1] ?? from).trim().toLowerCase();

const decode = (data: string) => Buffer.from(data, 'base64url').toString('utf8');

const find = (part: GmailPart | undefined, mimeType: string): string | null => {
    if (!part) return null;
    if (part.mimeType === mimeType && !part.filename && part.body?.data) return decode(part.body.data);
    for (const child of part.parts ?? []) {
        const found = find(child, mimeType);
        if (found !== null) return found;
    }
    return null;
};

const fileNames = (part: GmailPart | undefined): string[] =>
    part ? [...(part.filename ? [part.filename.slice(0, 200)] : []), ...(part.parts ?? []).flatMap(fileNames)] : [];

/** Drops the quoted copy of our own e-mail that mail apps add under a reply. */
export const withoutQuote = (text: string) => {
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    const cut = lines.findIndex((line, index) =>
        /^\s*>/.test(line)
        || /^(On|Pada) .{0,200}(wrote|menulis):\s*$/i.test(line)
        // Long attributions are wrapped onto two lines.
        || (/^(On|Pada) /i.test(line) && /(wrote|menulis):\s*$/i.test(lines[index + 1] ?? ''))
        || /^-{2,}\s*(Original Message|Pesan Asli|Forwarded message)/i.test(line));
    const kept = (cut < 0 ? lines : lines.slice(0, cut)).join('\n').trim();
    // A reply that is nothing but quote is shown whole rather than as an empty bubble.
    return (kept || text.trim()).slice(0, BODY_MAX);
};

export interface InboxDependencies {
    reader: GmailReader;
    messages: EmailMessagesRepository;
    /** The contact with this e-mail address, or null. */
    contactIdByEmail(email: string): Promise<string | null>;
    replyAddress: string;
}

/** Reads what is new. Returns how many replies were stored. */
export const syncInbox = async (dependencies: InboxDependencies): Promise<number> => {
    const { reader, messages } = dependencies;
    const ids = await reader.list(`to:${dependencies.replyAddress} newer_than:14d`);
    const known = await messages.knownProviderIds(ids);
    let stored = 0;
    // Oldest first, so the chat order is right even if a run stops half way.
    for (const id of ids.filter((candidate) => !known.has(candidate)).reverse()) {
        const mail = await reader.get(id);
        const contactId = await dependencies.contactIdByEmail(addressOf(header(mail.payload, 'From')));
        if (!contactId || !(await messages.wasMailed(contactId))) continue;
        const plain = find(mail.payload, 'text/plain');
        const html = plain === null ? find(mail.payload, 'text/html') : null;
        const added = await messages.add({
            contactId,
            direction: 'in',
            subject: header(mail.payload, 'Subject').slice(0, 300),
            body: withoutQuote(plain ?? (html === null ? '' : htmlToText(html))),
            files: fileNames(mail.payload).slice(0, 20),
            status: 'received',
            messageId: header(mail.payload, 'Message-ID').slice(0, 300),
            providerId: mail.id,
            at: new Date(Number(mail.internalDate) || Date.now())
        });
        if (added) stored += 1;
    }
    return stored;
};
