import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import postgres from 'postgres';
import type { UserDto } from '@attentiveid/shared';
import * as schema from '../db/schema';
import { createEmailCampaignsRepository } from '../repositories/email-campaigns.repository';
import { createEmailContactsRepository } from '../repositories/email-contacts.repository';
import { createEmailMessagesRepository } from '../repositories/email-messages.repository';
import { createTokenService } from '../security/token-service';
import { addressOf, syncInbox, withoutQuote, type GmailMessage, type GmailReader } from '../services/email-inbox';
import type { MailMessage } from '../services/mailer';
import { createEmailCampaignsRoutes } from './email-campaigns.routes';

/** Replies both ways on real PostgreSQL, with a fake mailer and a fake mailbox. */
const databaseUrl = process.env.DATABASE_URL;
const databaseName = databaseUrl ? new URL(databaseUrl).pathname.slice(1) : '';
const isDisposable = Boolean(databaseUrl && /^attentiveid_test_[a-z0-9_]+$/.test(databaseName));
const describeIntegration = isDisposable ? describe : describe.skip;

const client = isDisposable ? postgres(databaseUrl!, { max: 4 }) : (null as unknown as ReturnType<typeof postgres>);
const database = isDisposable ? drizzle(client, { schema }) : (null as unknown as ReturnType<typeof drizzle>);
const messages = createEmailMessagesRepository(database as never);

const SECRET = 'reply_test_secret_that_is_long_enough_123456';
const tokenService = createTokenService({ jwtSecret: SECRET });
const admin = { id: 'admin', email: 'admin@example.test', name: 'Admin Uji', role: 'admin', status: 'active', psychologistId: null } as UserDto;
const outbox: MailMessage[] = [];
let broken = false;
const mailer = { isConfigured: true, send: async (message: MailMessage) => { if (broken) throw new Error('smtp'); outbox.push(message); } };

const appWith = (enabled = true) => createEmailCampaignsRoutes({
    tokenService,
    userRepository: { findById: async () => admin },
    emailContactsRepository: createEmailContactsRepository(database as never),
    emailCampaignsRepository: createEmailCampaignsRepository(database as never),
    emailMessagesRepository: messages,
    bulk: { enabled, mailer, secret: SECRET, siteOrigin: 'https://attentiveid.com', replyTo: 'contact+bulk@attentiveid.com', inbox: true }
});

const call = async (method: string, path: string, body?: unknown, app = appWith(), signedIn = true) => {
    const response = await app.handle(new Request(`http://localhost${path}`, {
        method,
        headers: {
            ...(signedIn ? { authorization: `Bearer ${tokenService.issueAccessToken(admin).accessToken}` } : {}),
            ...(body === undefined ? {} : { 'content-type': 'application/json' })
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
    }));
    return { status: response.status, body: (await response.json().catch(() => null)) as any };
};

const b64 = (value: string) => Buffer.from(value).toString('base64url');
const mail = (id: string, from: string, text: string): GmailMessage => ({
    id,
    internalDate: String(Date.now() - 1000),
    payload: {
        mimeType: 'multipart/alternative',
        headers: [{ name: 'From', value: from }, { name: 'Subject', value: 'Re: Jadwal' }, { name: 'Message-ID', value: `<${id}@mail.test>` }],
        parts: [{ mimeType: 'text/plain', body: { data: b64(text) } }]
    }
});

let mailed = '';
let neverMailed = '';

describeIntegration('e-mail replies', () => {
    beforeAll(async () => {
        const add = async (email: string) => (await database.insert(schema.emailContacts).values({ email, name: 'Balas Uji' }).returning({ id: schema.emailContacts.id }))[0]!.id;
        mailed = await add('balas-uji@example.test');
        neverMailed = await add('belum-uji@example.test');
        const [campaign] = await database.insert(schema.emailCampaigns)
            .values({ title: 'Jadwal', html: '<p>Halo</p>', createdBy: admin.email, status: 'done', queuedAt: new Date(Date.now() - 60_000).toISOString() })
            .returning({ id: schema.emailCampaigns.id });
        await database.insert(schema.emailCampaignRecipients).values({ campaignId: campaign!.id, contactId: mailed, email: 'balas-uji@example.test', name: 'Balas Uji', status: 'sent', sentAt: new Date(Date.now() - 60_000).toISOString() });
    });

    afterAll(async () => {
        await database.delete(schema.emailCampaigns).where(eq(schema.emailCampaigns.title, 'Jadwal'));
        await database.execute(sql`delete from email_contacts where email like '%-uji@example.test'`);
        await client.end();
    });

    test('only a contact the portal has e-mailed can be answered, and only when sending is on', async () => {
        expect((await call('POST', `/api/admin/email/chats/${mailed}/reply`, { text: 'Halo' }, appWith(), false)).status).toBe(401);
        expect((await call('POST', `/api/admin/email/chats/${mailed}/reply`, { text: 'Halo' }, appWith(false))).status).toBe(503);
        expect((await call('POST', `/api/admin/email/chats/${neverMailed}/reply`, { text: 'Halo' })).status).toBe(409);
        expect((await call('POST', `/api/admin/email/chats/${mailed}/reply`, { text: '   ' })).status).toBe(400);
        expect((await call('POST', `/api/admin/email/chats/${mailed}/reply`, { text: 'x'.repeat(5001) })).status).toBe(400);
        expect(outbox).toHaveLength(0);
    });

    test('reads a reply from the contact once, ignores strangers, and shows it unread', async () => {
        const mails: Record<string, GmailMessage> = {
            m1: mail('m1', 'Balas Uji <Balas-Uji@example.test>', 'Bisa hari Senin?\n\nOn Tue, Attentive wrote:\n> Halo'),
            m2: mail('m2', 'orang-lain@example.test', 'spam'),
            m3: mail('m3', 'belum-uji@example.test', 'tidak pernah dikirimi')
        };
        const reader: GmailReader = { list: async () => Object.keys(mails), get: async (id) => mails[id]! };
        const run = () => syncInbox({
            reader,
            messages,
            replyAddress: 'contact+bulk@attentiveid.com',
            contactIdByEmail: async (email) => (await database.select({ id: schema.emailContacts.id }).from(schema.emailContacts).where(eq(schema.emailContacts.email, email)))[0]?.id ?? null
        });
        expect(await run()).toBe(1);
        expect(await run()).toBe(0);
        const list = await call('GET', '/api/admin/email/chats');
        expect(list.body.data.chats.find((chat: any) => chat.contactId === mailed)).toMatchObject({ unread: 1, lastTitle: 'Re: Jadwal', count: 2 });
        const thread = await call('GET', `/api/admin/email/chats/${mailed}`);
        expect(thread.body.data.canReply).toBe(true);
        expect(thread.body.data.messages.map((message: any) => [message.direction, message.kind])).toEqual([['out', 'bulk'], ['in', 'reply']]);
        expect(thread.body.data.messages[1].text).toBe('Bisa hari Senin?');
        // opening it marks it read
        expect((await call('GET', '/api/admin/email/chats')).body.data.chats.find((chat: any) => chat.contactId === mailed).unread).toBe(0);
    });

    test('a reply goes to that person, answers their message, and is not sent twice', async () => {
        const sent = await call('POST', `/api/admin/email/chats/${mailed}/reply`, { text: 'Bisa, <jam> 10.\nSampai jumpa' });
        expect(sent.status).toBe(201);
        expect(outbox).toHaveLength(1);
        expect(outbox[0]).toMatchObject({ to: 'balas-uji@example.test', subject: 'Re: Jadwal', replyTo: 'contact+bulk@attentiveid.com', text: 'Bisa, <jam> 10.\nSampai jumpa', headers: { 'In-Reply-To': '<m1@mail.test>' } });
        expect(outbox[0]!.html).toContain('&lt;jam&gt;');
        expect((await call('POST', `/api/admin/email/chats/${mailed}/reply`, { text: 'Bisa, <jam> 10.\nSampai jumpa' })).status).toBe(409);
        const thread = await call('GET', `/api/admin/email/chats/${mailed}`);
        expect(thread.body.data.messages.at(-1)).toMatchObject({ direction: 'out', kind: 'reply', status: 'sent', sentBy: admin.email });
    });

    test('a reply that cannot leave is kept and marked failed', async () => {
        broken = true;
        expect((await call('POST', `/api/admin/email/chats/${mailed}/reply`, { text: 'Gagal dikirim' })).status).toBe(502);
        broken = false;
        expect((await call('GET', `/api/admin/email/chats/${mailed}`)).body.data.messages.at(-1)).toMatchObject({ status: 'failed', text: 'Gagal dikirim' });
    });

    test('quoted history is dropped, but a reply is never left empty', () => {
        expect(withoutQuote('Ya\r\n\r\nPada Sel, 1 Des, Attentive <a@b.c>\r\nmenulis:\r\n> halo')).toBe('Ya');
        expect(withoutQuote('> hanya kutipan')).toBe('> hanya kutipan');
        expect(addressOf('"A <x>" <A@B.co>')).toBe('a@b.co');
    });
});
