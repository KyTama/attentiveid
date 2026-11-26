import { describe, expect, it, spyOn } from 'bun:test';
import type { ClaimedMail, EmailQueue } from '../repositories/email-campaigns.repository';
import type { MailMessage } from './mailer';
import { MAX_ATTEMPTS, classifySendError, createEmailSender } from './email-sender';

spyOn(console, 'error').mockImplementation(() => {});

const mail = (over: Partial<ClaimedMail> = {}): ClaimedMail => ({
    id: '0f8fad5b-d9cb-469f-a165-70867728950e', campaignId: 'c1', contactId: 'k1', email: 'ani@example.test', name: 'Ani', attempts: 1, ...over
});

const make = (options: { next?: ClaimedMail | null; error?: object; blocked?: 'unsubscribed' | 'archived'; attempts?: number; limit?: number } = {}) => {
    const calls: unknown[][] = [];
    const sent: MailMessage[] = [];
    const record = (name: string) => async (...args: unknown[]) => { calls.push([name, ...args.filter((a) => !(a instanceof Date))]); };
    const queue: EmailQueue = {
        releaseStale: async () => 0,
        attemptsSince: async () => options.attempts ?? 0,
        claimNext: async () => (options.next === undefined ? mail() : options.next),
        content: async () => ({ title: 'Kabar', html: '<p>Halo {{name}}</p>', lang: 'id', links: [], files: [{ name: 'a.pdf', mimeType: 'application/pdf', data: Buffer.from('%PDF') }] }),
        blocked: async () => options.blocked ?? null,
        markSent: record('sent'),
        markRetry: record('retry'),
        markDone: record('done'),
        pauseAll: record('pause'),
        finishIfDone: record('finish')
    };
    const sender = createEmailSender({
        queue,
        mailer: { isConfigured: true, send: async (message) => { if (options.error) throw options.error; sent.push(message); } },
        secret: 'bulk_test_secret_that_is_long_enough_123456',
        siteOrigin: 'https://attentiveid.com',
        replyTo: 'contact+bulk@attentiveid.com',
        messageDomain: 'attentiveid.com',
        dailyLimit: options.limit ?? 500
    });
    return { sender, calls, sent };
};

describe('bulk sender', () => {
    it('sends one e-mail to one person, with reply address, unsubscribe headers and message id', async () => {
        const { sender, sent, calls } = make();
        expect(await sender.tick()).toBe('sent');
        expect(sent).toHaveLength(1);
        expect(sent[0]).toMatchObject({ to: 'ani@example.test', subject: 'Kabar', replyTo: 'contact+bulk@attentiveid.com', messageId: '<bulk.0f8fad5b-d9cb-469f-a165-70867728950e@attentiveid.com>' });
        expect(sent[0]!.headers!['List-Unsubscribe']).toContain('/api/public/e/u/');
        expect(sent[0]!.attachments).toHaveLength(1);
        expect(calls.map((c) => c[0])).toEqual(['sent', 'finish']);
    });

    it('stops at the daily limit without taking anything from the queue', async () => {
        const { sender, sent, calls } = make({ attempts: 500 });
        expect(await sender.tick()).toBe('limit');
        expect(sent).toHaveLength(0);
        expect(calls).toHaveLength(0);
    });

    it('skips someone who unsubscribed or was archived after the send was queued', async () => {
        for (const reason of ['unsubscribed', 'archived'] as const) {
            const { sender, sent, calls } = make({ blocked: reason });
            await sender.tick();
            expect(sent).toHaveLength(0);
            expect(calls[0]).toEqual(['done', mail().id, 'skipped', reason]);
        }
    });

    it('pauses everything on Google\'s daily limit or a failed sign-in', async () => {
        for (const [error, reason] of [[{ responseCode: 550, response: '550 5.4.5 Daily user sending limit exceeded.' }, 'daily_limit'], [{ code: 'EAUTH' }, 'sign_in']] as const) {
            const { sender, calls } = make({ error });
            expect(await sender.tick()).toBe('paused');
            expect(calls).toEqual([['pause', mail().id, reason]]);
        }
    });

    it('retries a temporary failure, then gives up', async () => {
        const first = make({ error: { responseCode: 421 } });
        await first.sender.tick();
        expect(first.calls[0]).toEqual(['retry', mail().id, 'temporary']);
        const last = make({ error: { code: 'ECONNECTION', command: 'CONN' }, next: mail({ attempts: MAX_ATTEMPTS }) });
        await last.sender.tick();
        expect(last.calls[0]).toEqual(['done', mail().id, 'failed', 'temporary']);
    });

    it('never retries when the message may already have gone out', async () => {
        const { sender, calls } = make({ error: { code: 'ETIMEDOUT', command: 'DATA' } });
        await sender.tick();
        expect(calls[0]).toEqual(['done', mail().id, 'unknown', 'unknown']);
    });

    it('does nothing with an empty queue and never runs twice at once', async () => {
        const { sender } = make({ next: null });
        const [first, second] = await Promise.all([sender.tick(), sender.tick()]);
        expect([first, second]).toEqual(['idle', 'busy']);
    });

    it('classifies errors', () => {
        expect(classifySendError({ responseCode: 550, response: '550 5.1.1 no such user' })).toBe('refused');
        expect(classifySendError({ responseCode: 535 })).toBe('sign_in');
        expect(classifySendError({ responseCode: 451, command: 'DATA' })).toBe('temporary');
        expect(classifySendError(new Error('boom'))).toBe('temporary');
    });
});
