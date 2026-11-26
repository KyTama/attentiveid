/**
 * Bulk e-mail: drafts, attachments, who receives, send / pause / cancel, the send log (superadmins and admins), and the
 * three public addresses inside the e-mails (open image, click, unsubscribe).
 */
import { createHash } from 'node:crypto';
import { Elysia } from 'elysia';
import {
    EMAIL_BODY_MAX, EMAIL_DAILY_LIMIT, EMAIL_FILES_MAX_TOTAL, EMAIL_FILE_EXTENSIONS, EMAIL_FILE_MAX_BYTES, EMAIL_FILE_MAX_COUNT,
    EMAIL_TITLE_MAX, FEEDBACK_FILE_TYPES, cleanContactText, feedbackFileExtension,
    type EmailAudience, type EmailAudiencePreview, type EmailContact, type EmailLanguage, type EmailSendingState
} from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { CampaignDraft, EmailCampaignsRepository, Recipient } from '../repositories/email-campaigns.repository';
import type { EmailContactsRepository } from '../repositories/email-contacts.repository';
import { buildPersonalMail, cleanEmailHtml, escapeHtml, hasNameInAddress, readTrackToken, trackedLinks } from '../services/email-content';
import { EMAIL_COPY } from '../services/email-copy';
import { cleanName, contentMatches } from '../services/feedback-files';
import type { Mailer } from '../services/mailer';
import type { AuthTokenService, AuthUserRepository } from './auth';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Attachments waiting in the database, all campaigns together (the server disk is shared). */
const MAX_STORED_BYTES = 200 * 1024 * 1024;
const PAGE = 500;
// A 1x1 transparent GIF.
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

/** The stored address as a valid header value (already encoded parts stay as they are). */
const safeLocation = (url: string | null, fallback: string) => {
    try {
        return new URL(url ?? fallback).href;
    } catch {
        return fallback;
    }
};

export interface EmailBulkSettings {
    /** Real sending is off until the server is told to (EMAIL_BULK_ENABLED=true) and has a mail account. */
    enabled: boolean;
    mailer?: Mailer;
    secret: string;
    siteOrigin: string;
    replyTo: string;
}

export interface EmailCampaignsRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    emailContactsRepository: EmailContactsRepository;
    emailCampaignsRepository: EmailCampaignsRepository;
    bulk: EmailBulkSettings;
    now?: () => Date;
}

type Set = { status?: number | string; headers: Record<string, string | number> };

export const createEmailCampaignsRoutes = (dependencies: EmailCampaignsRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const campaigns = dependencies.emailCampaignsRepository;
    const contacts = dependencies.emailContactsRepository;
    const { bulk } = dependencies;
    const now = dependencies.now ?? (() => new Date());
    const canSend = () => bulk.enabled && Boolean(bulk.mailer?.isConfigured);

    const fail = (set: Set, status: number, message: string) => {
        set.status = status;
        return { status: 'error', message };
    };
    const noCampaign = (set: Set) => fail(set, 404, 'Kiriman tidak ditemukan.');
    const notDraft = (set: Set) => fail(set, 409, 'Kiriman ini sudah dikirim atau diantrekan, tidak bisa diubah.');
    const switchedOff = (set: Set) => fail(set, 503, 'Pengiriman e-mail massal belum diaktifkan di server.');
    const find = async (id: string) => (UUID.test(id) ? campaigns.get(id) : null);

    const readDraft = (body: any): CampaignDraft | string => {
        const title = cleanContactText(body?.title);
        const raw = typeof body?.html === 'string' ? body.html : '';
        if (!title || title.length > EMAIL_TITLE_MAX) return `Judul wajib diisi, maksimal ${EMAIL_TITLE_MAX} karakter.`;
        if (raw.length > EMAIL_BODY_MAX) return 'Isi e-mail terlalu panjang.';
        if (hasNameInAddress(raw)) return '{{name}} tidak boleh dipakai di awal atau di nama situs sebuah tautan atau gambar.';
        const html = cleanEmailHtml(raw);
        if (!html.replace(/<(?!img)[^>]*>|&nbsp;|\s/g, '')) return 'Isi e-mail masih kosong.';
        const lang: EmailLanguage = body?.lang === 'en' ? 'en' : 'id';
        return { title, html, lang };
    };

    const readAudience = (value: any): EmailAudience | null => {
        if (value?.mode === 'all') return { mode: 'all' };
        if ((value?.mode === 'categories' || value?.mode === 'contacts') && Array.isArray(value.ids) && value.ids.length > 0 && value.ids.length <= 10_000
            && value.ids.every((id: unknown) => typeof id === 'string' && UUID.test(id))) {
            return { mode: value.mode, ids: [...new globalThis.Set<string>(value.ids)] };
        }
        return null;
    };

    /** Who would get it right now, and who is left out. */
    const resolve = async (audience: EmailAudience): Promise<{ recipients: Recipient[]; preview: EmailAudiencePreview }> => {
        const wanted = (contact: EmailContact) =>
            audience.mode === 'all'
            || (audience.mode === 'contacts' ? audience.ids.includes(contact.id) : contact.categoryIds.some((id) => audience.ids.includes(id)));
        const active = (await contacts.listContacts({ archived: false })).filter(wanted);
        const archived = (await contacts.listContacts({ archived: true })).filter(wanted).length;
        const stopped = await campaigns.suppressed(active.map((contact) => contact.email));
        const recipients = active.filter((contact) => !stopped.has(contact.email)).map((contact) => ({ contactId: contact.id, email: contact.email, name: contact.name }));
        return { recipients, preview: { count: recipients.length, archived, unsubscribed: stopped.size } };
    };

    const state = async (): Promise<EmailSendingState> => ({
        enabled: canSend(),
        sentLast24h: await campaigns.attemptsSince(new Date(now().getTime() - 24 * 60 * 60 * 1000)),
        dailyLimit: EMAIL_DAILY_LIMIT
    });

    const page = (set: Set, lang: EmailLanguage, body: string, status = 200) => {
        set.status = status;
        set.headers['content-type'] = 'text/html; charset=utf-8';
        set.headers['cache-control'] = 'no-store';
        // The site-wide API policy would block even this page's own styling and button.
        set.headers['content-security-policy'] = "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'";
        return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(EMAIL_COPY[lang].pageTitle)} · Attentive</title></head>`
            + `<body style="margin:0;padding:48px 20px;background:#fbfaf7;color:#16233f;font:16px/1.6 Arial,sans-serif;text-align:center"><div style="max-width:420px;margin:0 auto">`
            + `<h1 style="font-size:22px">${escapeHtml(EMAIL_COPY[lang].pageTitle)}</h1>${body}</div></body></html>`;
    };
    // The link carries no language; show both.
    const both = (key: 'pageAsk' | 'pageDone' | 'pageInvalid') => `<p>${escapeHtml(EMAIL_COPY.id[key])}</p><p style="color:#64748b" lang="en">${escapeHtml(EMAIL_COPY.en[key])}</p>`;

    return new Elysia({ name: 'email-campaigns-routes' })
        .use(roleGuard)
        .get('/api/admin/email/campaigns', async ({ set }: any) => {
            set.headers['cache-control'] = 'no-store';
            return { status: 'success', data: { campaigns: await campaigns.list(), sending: await state() } };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Bulk send log and drafts' } })
        .get('/api/admin/email/campaigns/:id', async ({ params, query, set }: any) => {
            const campaign = await find(params.id);
            if (!campaign) return noCampaign(set);
            set.headers['cache-control'] = 'no-store';
            const offset = Math.max(0, Math.floor(Number(query?.offset) || 0));
            return { status: 'success', data: { campaign, recipients: await campaigns.recipients(campaign.id, offset, PAGE), offset, pageSize: PAGE } };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'One send with its recipients' } })
        .post('/api/admin/email/campaigns', async ({ body, set, currentUser }: any) => {
            const draft = readDraft(body);
            if (typeof draft === 'string') return fail(set, 400, draft);
            const id = await campaigns.create(draft, currentUser.email);
            set.status = 201;
            return { status: 'success', data: await campaigns.get(id) };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Save a new draft' } })
        .put('/api/admin/email/campaigns/:id', async ({ params, body, set }: any) => {
            const draft = readDraft(body);
            if (typeof draft === 'string') return fail(set, 400, draft);
            if (!(await find(params.id))) return noCampaign(set);
            if (!(await campaigns.update(params.id, draft))) return notDraft(set);
            return { status: 'success', data: await campaigns.get(params.id) };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Change a draft' } })
        .delete('/api/admin/email/campaigns/:id', async ({ params, set, currentUser }: any) => {
            if (!(await find(params.id))) return noCampaign(set);
            if (!(await campaigns.deleteDraft(params.id))) return notDraft(set);
            await contacts.audit(currentUser.email, 'draft_deleted', params.id);
            return { status: 'success' };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Delete a draft (sent ones stay in the log)' } })
        .post('/api/admin/email/campaigns/:id/files', async ({ params, body, set }: any) => {
            const campaign = await find(params.id);
            if (!campaign) return noCampaign(set);
            if (campaign.status !== 'draft') return notDraft(set);
            const file = body?.file;
            if (!(file instanceof File)) return fail(set, 400, 'Pilih berkas.');
            const extension = feedbackFileExtension(file.name);
            if (!(EMAIL_FILE_EXTENSIONS as readonly string[]).includes(extension)) return fail(set, 400, 'Jenis berkas tidak didukung. Pakai PDF, gambar, Word, Excel, PowerPoint, atau TXT.');
            const tooBig = 'Satu lampiran maksimal 7 MB, semuanya maksimal 10 MB.';
            if (file.size === 0 || file.size > EMAIL_FILE_MAX_BYTES) return fail(set, 400, tooBig);
            const data = Buffer.from(await file.arrayBuffer());
            if (!contentMatches(extension, data)) return fail(set, 400, 'Isi berkas tidak sesuai dengan jenisnya.');
            const added = await campaigns.addFile(campaign.id, {
                name: cleanName(file.name),
                mimeType: FEEDBACK_FILE_TYPES[extension]!,
                data,
                sha256: createHash('sha256').update(data).digest('hex')
            }, { count: EMAIL_FILE_MAX_COUNT, totalBytes: EMAIL_FILES_MAX_TOTAL, storedBytes: MAX_STORED_BYTES });
            if (added === 'not_draft') return notDraft(set);
            if (added === 'count') return fail(set, 400, `Maksimal ${EMAIL_FILE_MAX_COUNT} lampiran.`);
            if (added === 'size') return fail(set, 400, tooBig);
            if (added === 'full') return fail(set, 507, 'Ruang lampiran penuh. Selesaikan atau hapus kiriman lain dulu.');
            set.status = 201;
            return { status: 'success', data: added };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Attach one file to a draft' } })
        .delete('/api/admin/email/campaigns/:id/files/:fileId', async ({ params, set }: any) => {
            const campaign = await find(params.id);
            if (!campaign || !UUID.test(params.fileId)) return noCampaign(set);
            if (campaign.status !== 'draft') return notDraft(set);
            return (await campaigns.removeFile(campaign.id, params.fileId)) ? { status: 'success' } : fail(set, 404, 'Lampiran tidak ditemukan.');
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Remove an attachment from a draft' } })
        .post('/api/admin/email/audience', async ({ body, set }: any) => {
            const audience = readAudience(body?.audience);
            if (!audience) return fail(set, 400, 'Pilih penerima.');
            return { status: 'success', data: (await resolve(audience)).preview };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Count who would receive' } })
        .post('/api/admin/email/campaigns/:id/test', async ({ params, set, currentUser }: any) => {
            const campaign = await find(params.id);
            if (!campaign) return noCampaign(set);
            if (!canSend()) return switchedOff(set);
            const content = await campaigns.content(campaign.id);
            const built = buildPersonalMail({
                ...content,
                name: currentUser.name ?? '',
                // No real recipient row: the links in a test lead to "not valid", and nothing is counted.
                recipientId: '00000000-0000-0000-0000-000000000000',
                links: [],
                secret: bulk.secret,
                siteOrigin: bulk.siteOrigin,
                track: false
            });
            try {
                // Only ever to the person pressing the button.
                await bulk.mailer!.send({
                    to: currentUser.email,
                    subject: `[TEST] ${built.subject}`,
                    html: built.html,
                    text: built.text,
                    replyTo: bulk.replyTo,
                    attachments: content.files.map((file) => ({ filename: file.name, content: file.data, contentType: file.mimeType }))
                });
            } catch {
                return fail(set, 502, 'E-mail uji gagal terkirim.');
            }
            await contacts.audit(currentUser.email, 'test_sent', campaign.id);
            return { status: 'success', data: { to: currentUser.email } };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Send a test to yourself' } })
        .post('/api/admin/email/campaigns/:id/send', async ({ params, body, set, currentUser }: any) => {
            const campaign = await find(params.id);
            if (!campaign) return noCampaign(set);
            if (campaign.status !== 'draft') return notDraft(set);
            if (!canSend()) return switchedOff(set);
            const audience = readAudience(body?.audience);
            if (!audience) return fail(set, 400, 'Pilih penerima.');
            const { recipients, preview } = await resolve(audience);
            if (recipients.length === 0) return fail(set, 400, 'Tidak ada penerima yang bisa dikirimi.');
            // What was confirmed on screen must still be true.
            if (body?.expected !== preview.count) return fail(set, 409, `Jumlah penerima berubah menjadi ${preview.count}. Periksa lagi sebelum mengirim.`);
            if (!(await campaigns.queue(campaign.id, audience, recipients, trackedLinks(campaign.html), currentUser.email))) return notDraft(set);
            await contacts.audit(currentUser.email, 'send_queued', `${campaign.id}: ${recipients.length}`);
            return { status: 'success', data: await campaigns.get(campaign.id) };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Queue a draft for sending' } })
        .post('/api/admin/email/campaigns/:id/:action', async ({ params, set, currentUser }: any) => {
            const moves = {
                pause: { from: ['queued'], to: 'paused', reason: 'manual' },
                resume: { from: ['paused'], to: 'queued', reason: null },
                cancel: { from: ['queued', 'paused'], to: 'cancelled', reason: null }
            } as const;
            const move = moves[params.action as keyof typeof moves];
            if (!move || !(await find(params.id))) return noCampaign(set);
            if (!(await campaigns.setStatus(params.id, [...move.from], move.to, move.reason))) return fail(set, 409, 'Status kiriman sudah berubah.');
            // A campaign paused while its last e-mail was on the way has nothing left to send.
            if (params.action === 'resume') await campaigns.finishIfDone(params.id, now());
            await contacts.audit(currentUser.email, `send_${params.action}`, params.id);
            return { status: 'success', data: await campaigns.get(params.id) };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Pause, resume or cancel' } })

        // ---- public: the addresses inside the e-mails. The signed token is the only key. ----
        .get('/api/public/e/o/:token', async ({ params }: any) => {
            const id = readTrackToken(bulk.secret, 'open', params.token);
            if (id) await campaigns.recordOpen(id, now());
            return new Response(new Uint8Array(PIXEL), { headers: { 'content-type': 'image/gif', 'cache-control': 'no-store, max-age=0' } });
        }, { detail: { tags: ['Email'], summary: 'Open image' } })
        .get('/api/public/e/c/:token/:position', async ({ params }: any) => {
            const id = readTrackToken(bulk.secret, 'click', params.token);
            const position = /^\d{1,3}$/.test(params.position) ? Number(params.position) : -1;
            const url = id && position >= 0 ? await campaigns.recordClick(id, position, now()) : null;
            // Only an address stored with the campaign; anything else goes to the website.
            return new Response(null, { status: 302, headers: { location: safeLocation(url, bulk.siteOrigin), 'cache-control': 'no-store' } });
        }, { detail: { tags: ['Email'], summary: 'Tracked link' } })
        .get('/api/public/e/u/:token', async ({ params, set }: any) => {
            // A page with a button: mail scanners that only visit links cannot unsubscribe anyone.
            if (!readTrackToken(bulk.secret, 'unsubscribe', params.token)) return page(set, 'id', both('pageInvalid'), 404);
            return page(set, 'id', `${both('pageAsk')}<form method="post"><button style="margin-top:16px;padding:12px 24px;border:0;border-radius:8px;background:#16233f;color:#fff;font:600 16px Arial,sans-serif;cursor:pointer" type="submit">${escapeHtml(EMAIL_COPY.id.pageButton)}</button></form>`);
        }, { detail: { tags: ['Email'], summary: 'Unsubscribe page' } })
        .post('/api/public/e/u/:token', async ({ params, set }: any) => {
            const id = readTrackToken(bulk.secret, 'unsubscribe', params.token);
            if (!id || !(await campaigns.unsubscribe(id))) return page(set, 'id', both('pageInvalid'), 404);
            return page(set, 'id', both('pageDone'));
        }, { detail: { tags: ['Email'], summary: 'Unsubscribe (button and one-click)' } });
};
