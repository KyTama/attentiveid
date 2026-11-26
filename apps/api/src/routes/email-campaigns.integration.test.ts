import { afterAll, beforeAll, describe, expect, spyOn, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import postgres from 'postgres';
import type { UserDto } from '@attentiveid/shared';
import * as schema from '../db/schema';
import { createEmailCampaignsRepository } from '../repositories/email-campaigns.repository';
import { createEmailContactsRepository } from '../repositories/email-contacts.repository';
import { createTokenService } from '../security/token-service';
import { createEmailSender } from '../services/email-sender';
import { trackToken } from '../services/email-content';
import type { MailMessage } from '../services/mailer';
import { createEmailCampaignsRoutes, type EmailBulkSettings } from './email-campaigns.routes';

/** The whole path on real PostgreSQL with a fake mailer. Runs only against a disposable attentiveid_test_* database. */
const databaseUrl = process.env.DATABASE_URL;
const databaseName = databaseUrl ? new URL(databaseUrl).pathname.slice(1) : '';
const isDisposable = Boolean(databaseUrl && /^attentiveid_test_[a-z0-9_]+$/.test(databaseName));
const describeIntegration = isDisposable ? describe : describe.skip;

const client = isDisposable ? postgres(databaseUrl!, { max: 6 }) : (null as unknown as ReturnType<typeof postgres>);
const database = isDisposable ? drizzle(client, { schema }) : (null as unknown as ReturnType<typeof drizzle>);
const campaigns = createEmailCampaignsRepository(database as never);
const contacts = createEmailContactsRepository(database as never);

const SECRET = 'bulk_test_secret_that_is_long_enough_123456';
const tokenService = createTokenService({ jwtSecret: SECRET });
const person = (id: string, role: UserDto['role']): UserDto => ({ id, email: `${id}@example.test`, name: 'Admin Uji', role, status: 'active', psychologistId: null } as UserDto);
const admin = person('admin', 'admin');
const psychologist = person('psy', 'psychologist' as UserDto['role']);

const outbox: MailMessage[] = [];
const mailer = { isConfigured: true, send: async (message: MailMessage) => { outbox.push(message); } };

const appWith = (over: Partial<EmailBulkSettings> = {}) => createEmailCampaignsRoutes({
    tokenService,
    userRepository: { findById: async (id: string) => [admin, psychologist].find((u) => u.id === id) ?? null },
    emailContactsRepository: contacts,
    emailCampaignsRepository: campaigns,
    bulk: { enabled: true, mailer, secret: SECRET, siteOrigin: 'https://attentiveid.com', replyTo: 'contact+bulk@attentiveid.com', ...over }
});
const app = isDisposable ? appWith() : (null as unknown as ReturnType<typeof appWith>);

const call = async (method: string, path: string, as: UserDto | null = admin, body?: unknown, target = app) => {
    const form = body instanceof FormData;
    const response = await target.handle(new Request(`http://localhost${path}`, {
        method,
        headers: {
            ...(as ? { authorization: `Bearer ${tokenService.issueAccessToken(as).accessToken}` } : {}),
            ...(body === undefined || form ? {} : { 'content-type': 'application/json' })
        },
        ...(body === undefined ? {} : { body: form ? (body as FormData) : JSON.stringify(body) })
    }));
    const text = await response.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* a page or an image */ }
    return { status: response.status, headers: response.headers, text, body: json };
};

const draft = { title: 'Kabar untuk {{name}}', html: '<p>Halo {{name}} <a href="https://attentiveid.com/sci-brief?a=1&amp;b=%20x">baca</a></p><script>1</script>' };
const contactIds: Record<string, string> = {};
let categoryId = '';

describeIntegration('bulk e-mail (PostgreSQL, fake mailer)', () => {
    beforeAll(async () => {
        spyOn(console, 'error').mockImplementation(() => {});
        await database.execute(sql`delete from email_campaigns`);
        await database.execute(sql`delete from email_suppressions`);
        await database.execute(sql`delete from email_contacts`);
        categoryId = (await contacts.listCategories()).find((c) => c.name === 'client')!.id;
        for (const name of ['ani', 'budi', 'citra', 'dewi']) {
            const made = await contacts.createContact({ email: `${name}@example.test`, name: name === 'dewi' ? '' : name, phone: '', phoneNormalized: '', categoryIds: [categoryId] }, 'manual', 'test');
            contactIds[name] = made!.id;
        }
        await contacts.setArchived([contactIds.citra!], true, 'test');
    });
    afterAll(async () => { await client.end(); });

    const tick = () => createEmailSender({ queue: campaigns, mailer, secret: SECRET, siteOrigin: 'https://attentiveid.com', replyTo: 'contact+bulk@attentiveid.com', messageDomain: 'attentiveid.com' }).tick();
    let id = '';

    test('admin routes refuse visitors and psychologists', async () => {
        const paths: Array<[string, string]> = [
            ['GET', '/api/admin/email/campaigns'], ['POST', '/api/admin/email/campaigns'], ['POST', '/api/admin/email/audience'],
            ['GET', '/api/admin/email/campaigns/x'], ['PUT', '/api/admin/email/campaigns/x'], ['DELETE', '/api/admin/email/campaigns/x'],
            ['POST', '/api/admin/email/campaigns/x/send'], ['POST', '/api/admin/email/campaigns/x/test'], ['POST', '/api/admin/email/campaigns/x/pause'],
            ['POST', '/api/admin/email/campaigns/x/files'], ['DELETE', '/api/admin/email/campaigns/x/files/y']
        ];
        for (const [method, path] of paths) {
            const body = method === 'GET' || method === 'DELETE' ? undefined : draft;
            expect((await call(method, path, null, body)).status).toBe(401);
            expect((await call(method, path, psychologist, body)).status).toBe(403);
        }
        expect(outbox).toHaveLength(0);
    });

    test('a draft is saved cleaned; attachments are checked by content', async () => {
        const made = await call('POST', '/api/admin/email/campaigns', admin, draft);
        expect(made.status).toBe(201);
        id = made.body.data.id;
        expect(made.body.data.html).not.toContain('script');
        expect((await call('POST', '/api/admin/email/campaigns', admin, { title: '', html: '<p>x</p>' })).status).toBe(400);
        expect((await call('POST', '/api/admin/email/campaigns', admin, { title: 'x', html: '<p> </p><script>1</script>' })).status).toBe(400);

        const upload = (name: string, content: string) => {
            const form = new FormData();
            form.append('file', new File([content], name));
            return call('POST', `/api/admin/email/campaigns/${id}/files`, admin, form);
        };
        expect((await upload('virus.exe', 'MZ')).status).toBe(400);
        expect((await upload('palsu.pdf', 'not a pdf')).status).toBe(400);
        expect((await upload('brosur.pdf', '%PDF-1.4 uji')).status).toBe(201);
        expect(await campaigns.storedBytes()).toBeGreaterThan(0);
    });

    test('a test goes only to the person pressing, marked TEST, without tracking', async () => {
        const result = await call('POST', `/api/admin/email/campaigns/${id}/test`);
        expect(result.status).toBe(200);
        expect(outbox).toHaveLength(1);
        expect(outbox[0]!.to).toBe('admin@example.test');
        expect(outbox[0]!.subject).toBe('[TEST] Kabar untuk Admin Uji');
        expect(outbox[0]!.html).not.toContain('/e/o/');
        outbox.length = 0;
    });

    test('when sending is switched off, nothing can be sent', async () => {
        const off = appWith({ enabled: false });
        expect((await call('POST', `/api/admin/email/campaigns/${id}/test`, admin, {}, off)).status).toBe(503);
        expect((await call('POST', `/api/admin/email/campaigns/${id}/send`, admin, { audience: { mode: 'all' }, expected: 3 }, off)).status).toBe(503);
        expect((await call('GET', '/api/admin/email/campaigns', admin, undefined, off)).body.data.sending.enabled).toBe(false);
        expect(outbox).toHaveLength(0);
    });

    test('send needs the confirmed count, and happens once', async () => {
        const audience = { mode: 'categories', ids: [categoryId] };
        const preview = await call('POST', '/api/admin/email/audience', admin, { audience });
        expect(preview.body.data).toEqual({ count: 3, archived: 1, unsubscribed: 0 });
        expect((await call('POST', `/api/admin/email/campaigns/${id}/send`, admin, { audience, expected: 2 })).status).toBe(409);
        const both = await Promise.all([1, 2].map(() => call('POST', `/api/admin/email/campaigns/${id}/send`, admin, { audience, expected: 3 })));
        expect(both.map((r) => r.status).sort()).toEqual([200, 409]);
        const campaign = (await campaigns.get(id))!;
        expect(campaign.counts).toMatchObject({ total: 3, queued: 3 });
        expect((await call('PUT', `/api/admin/email/campaigns/${id}`, admin, draft)).status).toBe(409);
        expect((await call('DELETE', `/api/admin/email/campaigns/${id}`)).status).toBe(409);
    });

    test('two senders never take the same e-mail; paused sends nothing; finishing empties attachments', async () => {
        expect((await call('POST', `/api/admin/email/campaigns/${id}/pause`)).status).toBe(200);
        expect(await tick()).toBe('idle');
        expect((await call('POST', `/api/admin/email/campaigns/${id}/resume`)).status).toBe(200);
        await Promise.all([tick(), tick()]);
        await tick();
        expect(outbox.map((m) => m.to).sort()).toEqual(['ani@example.test', 'budi@example.test', 'dewi@example.test']);
        expect(outbox.find((m) => m.to === 'dewi@example.test')!.subject).toBe('Kabar untuk Kak');
        expect(outbox[0]!.attachments).toHaveLength(1);
        const campaign = (await campaigns.get(id))!;
        expect(campaign.status).toBe('done');
        expect(campaign.counts.sent).toBe(3);
        expect(await campaigns.storedBytes()).toBe(0);
        expect(await tick()).toBe('idle');
    });

    test('opens and clicks are counted; a link leads only to a stored address', async () => {
        const [row] = await database.select().from(schema.emailCampaignRecipients).where(eq(schema.emailCampaignRecipients.email, 'ani@example.test'));
        const open = await call('GET', `/api/public/e/o/${trackToken(SECRET, 'open', row!.id)}`, null);
        expect(open.headers.get('content-type')).toBe('image/gif');
        await call('GET', `/api/public/e/o/${trackToken(SECRET, 'open', row!.id)}`, null);
        const click = await call('GET', `/api/public/e/c/${trackToken(SECRET, 'click', row!.id)}/0`, null);
        expect(click.status).toBe(302);
        expect(click.headers.get('location')).toBe('https://attentiveid.com/sci-brief?a=1&b=%20x');
        for (const bad of [`${trackToken(SECRET, 'click', row!.id)}/7`, `${trackToken(SECRET, 'open', row!.id)}/0`, 'abc/0']) {
            const other = await call('GET', `/api/public/e/c/${bad}`, null);
            expect(other.headers.get('location')).toBe('https://attentiveid.com/');
        }
        expect((await call('GET', '/api/public/e/o/nonsense', null)).status).toBe(200);
        const log = await call('GET', `/api/admin/email/campaigns/${id}`);
        const ani = log.body.data.recipients.find((r: any) => r.email === 'ani@example.test');
        expect([ani.openCount, ani.clickCount, Boolean(ani.openedAt), Boolean(ani.clickedAt)]).toEqual([2, 1, true, true]);
        expect((await campaigns.get(id))!.counts).toMatchObject({ opened: 1, clicked: 1 });
    });

    test('unsubscribe: visiting the page changes nothing, pressing stops later sends, even queued ones', async () => {
        const second = (await call('POST', '/api/admin/email/campaigns', admin, draft)).body.data.id;
        await call('POST', `/api/admin/email/campaigns/${second}/send`, admin, { audience: { mode: 'all' }, expected: 3 });
        const [row] = await database.select().from(schema.emailCampaignRecipients).where(eq(schema.emailCampaignRecipients.email, 'budi@example.test'));
        const path = `/api/public/e/u/${trackToken(SECRET, 'unsubscribe', row!.id)}`;

        const page = await call('GET', path, null);
        expect(page.status).toBe(200);
        expect(page.text).toContain('<form method="post">');
        expect(page.headers.get('content-security-policy')).toContain("form-action 'self'");
        expect((await campaigns.suppressed(['budi@example.test'])).size).toBe(0);

        // Gmail's one-click button posts a form without any sign-in.
        const form = new URLSearchParams({ 'List-Unsubscribe': 'One-Click' });
        const done = await app.handle(new Request(`http://localhost${path}`, { method: 'POST', body: form.toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } }));
        expect(done.status).toBe(200);
        expect((await campaigns.suppressed(['budi@example.test'])).size).toBe(1);
        expect((await call('POST', '/api/public/e/u/nonsense', null)).status).toBe(404);

        outbox.length = 0;
        for (let i = 0; i < 3; i += 1) await tick();
        expect(outbox.map((m) => m.to).sort()).toEqual(['ani@example.test', 'dewi@example.test']);
        expect((await campaigns.get(second))!.counts).toMatchObject({ sent: 2, skipped: 1 });
        expect((await call('POST', '/api/admin/email/audience', admin, { audience: { mode: 'all' } })).body.data).toEqual({ count: 2, archived: 1, unsubscribed: 1 });
    });

    test('cancel skips what is waiting; Google\'s limit pauses and keeps it waiting', async () => {
        const third = (await call('POST', '/api/admin/email/campaigns', admin, draft)).body.data.id;
        await call('POST', `/api/admin/email/campaigns/${third}/send`, admin, { audience: { mode: 'all' }, expected: 2 });
        const refusing = createEmailSender({
            queue: campaigns, secret: SECRET, siteOrigin: 'https://attentiveid.com', replyTo: 'x@example.test', messageDomain: 'example.test',
            mailer: { isConfigured: true, send: async () => { throw Object.assign(new Error('limit'), { responseCode: 550, response: '550 5.4.5 Daily user sending limit exceeded' }); } }
        });
        expect(await refusing.tick()).toBe('paused');
        const paused = (await campaigns.get(third))!;
        expect([paused.status, paused.pausedReason, paused.counts.queued]).toEqual(['paused', 'daily_limit', 2]);
        expect((await call('POST', `/api/admin/email/campaigns/${third}/cancel`)).status).toBe(200);
        expect((await campaigns.get(third))!.counts).toMatchObject({ queued: 0, skipped: 2 });
        expect((await call('POST', `/api/admin/email/campaigns/${third}/resume`)).status).toBe(409);
    });

    test('an e-mail left half-sent by a restart becomes unknown, not sent again', async () => {
        const fourth = (await call('POST', '/api/admin/email/campaigns', admin, draft)).body.data.id;
        await call('POST', `/api/admin/email/campaigns/${fourth}/send`, admin, { audience: { mode: 'contacts', ids: [contactIds.ani] }, expected: 1 });
        expect(await campaigns.claimNext(new Date(Date.now() - 10 * 60_000))).not.toBeNull();
        outbox.length = 0;
        await tick();
        expect(outbox).toHaveLength(0);
        expect((await campaigns.get(fourth))!.counts).toMatchObject({ unknown: 1 });
    });
});
