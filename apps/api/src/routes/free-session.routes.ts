import { Elysia } from 'elysia';
import {
    dedupeFreeSessionRecords,
    freeSessionRecordsToCsv,
    genderLabel,
    type FreeSessionSubmission,
    keluhanLabel,
    validateFreeSessionSubmission
} from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import { isOwnerEmail } from '../security/owner';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { FreeSessionRepository } from '../repositories/free-session.repository';
import type { FreeSessionSheetSync } from '../services/free-session-sheet-sync';
import type { Mailer } from '../services/mailer';
import { buildFreeSessionReceivedEmail, buildFreeSessionStaffEmail } from '../services/form-notice-emails';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface FreeSessionRateLimit {
    max: number;
    windowMs: number;
}

export interface FreeSessionRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    freeSessionRepository: FreeSessionRepository;
    /** Writes submissions to the Google Sheet (optional; without it submissions stay in the database only). */
    sheetSync?: FreeSessionSheetSync;
    /** Sends the sign-up e-mails (optional; without it nothing is sent). */
    mailer?: Mailer;
    /** Staff inbox that gets every new sign-up. */
    alertEmail?: string;
    siteOrigin?: string;
    rateLimit?: FreeSessionRateLimit;
    now?: () => number;
}

/** A repeat of the same phone number within this time is the same click arriving twice, not a second sign-up. */
const SAME_CLICK_MS = 15 * 1000;

const ALREADY_REGISTERED = 'Nama / nomor telepon sudah terdaftar. Tim kami akan menghubungi kamu lewat WhatsApp. Jika data perlu diubah, hubungi kami lewat WhatsApp.';

class AlreadyRegistered extends Error {}

const DEFAULT_RATE_LIMIT: FreeSessionRateLimit = { max: 5, windowMs: 10 * 60 * 1000 };

// The ingress appends the real client address to X-Forwarded-For, so the last
// entry is the one the proxy vouches for; earlier entries are client-supplied.
const clientKey = (headers: Record<string, string | undefined>) => {
    const forwarded = headers['x-forwarded-for'];
    if (!forwarded) return 'unknown';
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? 'unknown';
};

export const createFreeSessionRoutes = (dependencies: FreeSessionRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.freeSessionRepository;
    const limit = dependencies.rateLimit ?? DEFAULT_RATE_LIMIT;
    const now = dependencies.now ?? Date.now;
    const hits = new Map<string, number[]>();
    // Sign-ups being saved right now, so two clicks that arrive together share one row.
    const inFlight = new Map<string, Promise<{ id: string }>>();

    /** E-mails staff (and the visitor, if they gave an address). Never blocks or fails the sign-up; logs only the error name, never the person's data. */
    const notify = (value: FreeSessionSubmission) => {
        const mailer = dependencies.mailer;
        if (!mailer?.isConfigured) return;
        const send = (to: string, mail: { subject: string; html: string; text: string }, where: string) =>
            void mailer.send({ to, ...mail }).catch((error) => {
                console.error(`[free-session] ${where} e-mail failed:`, error instanceof Error ? error.name : 'error');
            });
        try {
            if (dependencies.alertEmail) {
                send(dependencies.alertEmail, buildFreeSessionStaffEmail({
                    name: value.name,
                    age: value.age,
                    gender: value.gender ? genderLabel(value.gender) : null,
                    phone: value.phone,
                    email: value.email,
                    keluhan: keluhanLabel(value.keluhan) ?? value.keluhan,
                    keluhanDetail: value.keluhanDetail,
                    siteOrigin: dependencies.siteOrigin
                }), 'staff');
            }
            if (value.email) {
                send(value.email, buildFreeSessionReceivedEmail({ name: value.name, siteOrigin: dependencies.siteOrigin }), 'visitor');
            }
        } catch (error) {
            console.error('[free-session] e-mail failed:', error instanceof Error ? error.name : 'error');
        }
    };

    const isRateLimited = (key: string) => {
        const cutoff = now() - limit.windowMs;
        const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
        if (recent.length >= limit.max) {
            hits.set(key, recent);
            return true;
        }
        recent.push(now());
        hits.set(key, recent);
        return false;
    };

    return new Elysia({ name: 'free-session-routes' })
        .use(roleGuard)
        .post('/api/public/free-session', async ({ body, headers, set }: any) => {
            // Honeypot: pretend success so bots learn nothing, store nothing.
            if (body && typeof body === 'object' && typeof body.website === 'string' && body.website !== '') {
                set.status = 201;
                return { status: 'success' };
            }

            if (isRateLimited(clientKey(headers))) {
                set.status = 429;
                return { status: 'error', message: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.' };
            }

            const result = validateFreeSessionSubmission(body);
            if (!result.ok) {
                set.status = 400;
                return { status: 'error', errors: result.errors };
            }

            const personKey = `${result.value.name.trim().toLowerCase().replace(/\s+/g, ' ')}|${result.value.phone.replace(/\D+/g, '').replace(/^62/, '0')}`;
            let saving = inFlight.get(personKey);
            if (!saving) {
                saving = (async () => {
                    const earlier = await repository.findByPhone(result.value.phone);
                    if (earlier) {
                        if (now() - new Date(earlier.createdAt).getTime() <= SAME_CLICK_MS) return { id: earlier.id };
                        throw new AlreadyRegistered();
                    }
                    const row = await repository.create(result.value);
                    // Only a brand new sign-up is e-mailed, so a double click or a retry never sends twice.
                    notify(result.value);
                    return row;
                })();
                inFlight.set(personKey, saving);
                // Keep the entry briefly after saving so a click that lands just after still finds it.
                void saving.then(
                    () => setTimeout(() => inFlight.delete(personKey), 3000),
                    () => inFlight.delete(personKey),
                );
            }
            let created: { id: string };
            try {
                created = await saving;
            } catch (error) {
                if (error instanceof AlreadyRegistered) {
                    set.status = 409;
                    return { status: 'error', code: 'already_registered', message: ALREADY_REGISTERED };
                }
                throw error;
            }
            // The visitor never waits for Google; failures stay queued and are retried (next submission or portal button).
            void dependencies.sheetSync?.syncPending().catch(() => undefined);
            set.status = 201;
            return { status: 'success', data: { id: created.id } };
        }, {
            detail: {
                tags: ['Free Session'],
                summary: 'Submit the free session registration form'
            }
        })
        .get('/api/admin/free-session/submissions', async () => {
            const all = await repository.listAll();
            const records = dedupeFreeSessionRecords(all);
            return {
                status: 'success',
                data: {
                    total: all.length,
                    unique: records.length,
                    duplicates: all.length - records.length,
                    records
                }
            };
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'List deduplicated free session submissions' }
        })
        .get('/api/admin/free-session/sheet-status', async () => {
            const sync = dependencies.sheetSync;
            if (!sync) return { status: 'success', data: { configured: false, pending: 0, failed: 0, spreadsheetUrl: null } };
            return { status: 'success', data: await sync.status() };
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'How many submissions are not in the Google Sheet yet' }
        })
        .post('/api/admin/free-session/sync-sheet', async () => {
            const sync = dependencies.sheetSync;
            if (!sync) return { status: 'success', data: { configured: false, synced: 0, pending: 0, failed: 0, error: 'Google Sheet sync is not set up.' } };
            return { status: 'success', data: await sync.syncPending() };
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'Send every submission not yet in the Google Sheet' }
        })
        .delete('/api/admin/free-session/submissions/:id', async ({ params, set, currentUser }: any) => {
            // Owner only: the superadmin account that is on the owner list. Other admins (and other superadmins) get 403.
            if (currentUser?.role !== 'superadmin' || !isOwnerEmail(currentUser.email)) {
                set.status = 403;
                return { status: 'forbidden', message: 'Hanya akun pemilik yang dapat menghapus data.' };
            }
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            const removed = await repository.deleteById(params.id);
            if (!removed) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            console.warn(`[free-session] submission ${params.id} deleted by owner`);
            return { status: 'success', data: { id: params.id } };
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'Delete one submission (owner account only, for clearing test entries)' }
        })
        .get('/api/admin/free-session/export.csv', async ({ set }: any) => {
            const records = dedupeFreeSessionRecords(await repository.listAll());
            const stamp = new Date(now()).toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
            set.headers['content-type'] = 'text/csv; charset=utf-8';
            set.headers['content-disposition'] = `attachment; filename="sesi-gratis-report-${stamp}.csv"`;
            set.headers['cache-control'] = 'no-store';
            return freeSessionRecordsToCsv(records);
        }, {
            requireRole: 'admin',
            detail: { tags: ['Free Session'], summary: 'Download the deduplicated report as CSV' }
        });
};
