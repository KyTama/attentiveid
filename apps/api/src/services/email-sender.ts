/**
 * Sends queued bulk e-mails one at a time. One person per e-mail, a daily limit well under Google's (the same account also
 * sends results and payment e-mails), and it prefers not sending over sending twice.
 */
import { EMAIL_DAILY_LIMIT } from '@attentiveid/shared';
import type { ClaimedMail, EmailQueue } from '../repositories/email-campaigns.repository';
import type { Mailer } from './mailer';
import { buildPersonalMail } from './email-content';

export const MAX_ATTEMPTS = 3;
const RETRY_AFTER_MS = 10 * 60 * 1000;
const STALE_AFTER_MS = 5 * 60 * 1000;

export type SendFailure =
    /** Google refuses more mail today: stop everything. */
    | 'daily_limit'
    /** The account cannot sign in: stop everything rather than failing every address. */
    | 'sign_in'
    /** Not accepted this time; worth trying again. */
    | 'temporary'
    /** This address is refused for good. */
    | 'refused'
    /** The connection broke after the message was being handed over: it may have been sent. */
    | 'unknown';

export const classifySendError = (error: unknown): SendFailure => {
    const e = (error ?? {}) as { responseCode?: number; code?: string; command?: string; response?: string };
    const text = e.response ?? '';
    if (/5\.4\.5|daily (user )?(sending )?(limit|quota)/i.test(text)) return 'daily_limit';
    if (e.code === 'EAUTH' || e.responseCode === 535 || e.responseCode === 534) return 'sign_in';
    if (typeof e.responseCode === 'number') return e.responseCode >= 500 ? 'refused' : 'temporary';
    return e.command === 'DATA' ? 'unknown' : 'temporary';
};

export interface EmailSenderDependencies {
    queue: EmailQueue;
    mailer: Mailer;
    /** Signs the unsubscribe and tracking links. */
    secret: string;
    siteOrigin: string;
    /** Replies go here, so one Gmail filter can label them. */
    replyTo: string;
    /** Domain used in Message-ID, so replies can be matched later. */
    messageDomain: string;
    dailyLimit?: number;
    now?: () => Date;
}

export type TickResult = 'sent' | 'idle' | 'limit' | 'paused' | 'failed' | 'busy';

export const createEmailSender = (dependencies: EmailSenderDependencies) => {
    const { queue, mailer } = dependencies;
    const now = dependencies.now ?? (() => new Date());
    const limit = dependencies.dailyLimit ?? EMAIL_DAILY_LIMIT;
    let running = false;

    const deliver = async (mail: ClaimedMail): Promise<TickResult> => {
        const reason = await queue.blocked(mail);
        if (reason) {
            await queue.markDone(mail.id, 'skipped', reason);
            return 'failed';
        }
        const content = await queue.content(mail.campaignId);
        const built = buildPersonalMail({
            ...content,
            name: mail.name,
            recipientId: mail.id,
            secret: dependencies.secret,
            siteOrigin: dependencies.siteOrigin,
            track: true
        });
        try {
            await mailer.send({
                to: mail.email,
                subject: built.subject,
                html: built.html,
                text: built.text,
                headers: built.headers,
                replyTo: dependencies.replyTo,
                messageId: `<bulk.${mail.id}@${dependencies.messageDomain}>`,
                attachments: content.files.map((file) => ({ filename: file.name, content: file.data, contentType: file.mimeType }))
            });
        } catch (error) {
            const failure = classifySendError(error);
            // Only the kind of failure is kept or logged: server answers can quote addresses.
            console.error('[email-bulk] send failed:', failure);
            if (failure === 'daily_limit' || failure === 'sign_in') {
                await queue.pauseAll(mail.id, failure);
                return 'paused';
            }
            if (failure === 'temporary' && mail.attempts < MAX_ATTEMPTS) {
                await queue.markRetry(mail.id, failure, new Date(now().getTime() + RETRY_AFTER_MS));
                return 'failed';
            }
            await queue.markDone(mail.id, failure === 'unknown' ? 'unknown' : 'failed', failure);
            return 'failed';
        }
        await queue.markSent(mail.id, now());
        return 'sent';
    };

    return {
        /** Sends at most one e-mail. */
        async tick(): Promise<TickResult> {
            if (running) return 'busy';
            running = true;
            try {
                const at = now();
                await queue.releaseStale(new Date(at.getTime() - STALE_AFTER_MS));
                if ((await queue.attemptsSince(new Date(at.getTime() - 24 * 60 * 60 * 1000))) >= limit) return 'limit';
                const mail = await queue.claimNext(at);
                if (!mail) return 'idle';
                const result = await deliver(mail);
                if (result !== 'paused') await queue.finishIfDone(mail.campaignId, now());
                return result;
            } finally {
                running = false;
            }
        }
    };
};
