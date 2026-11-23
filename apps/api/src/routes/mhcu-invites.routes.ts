import { Elysia, t } from 'elysia';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { AssessmentsRepository } from '../repositories/assessments.repository';
import type { InviteRecord, MhcuInvitesRepository } from '../repositories/mhcu-invites.repository';
import { isInvitedTrack } from '../services/mhcu-tracks';

export interface MhcuInviteRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    invitesRepository: MhcuInvitesRepository;
    /** For the audit trail. */
    assessmentsRepository: Pick<AssessmentsRepository, 'audit'>;
    /** The public address of the site; the link of an invitation is built from it. */
    siteOrigin?: string;
    now?: () => number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clientKey = (headers: Record<string, string | undefined>) => {
    const forwarded = headers['x-forwarded-for'];
    if (!forwarded) return 'unknown';
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? 'unknown';
};

const hasControl = (value: string): boolean => {
    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i);
        if (code < 32 || code === 127) return true;
    }
    return false;
};

/** An optional text: undefined/null/'' = none; anything else must be a clean string of at most `max` characters. */
const optionalText = (value: unknown, max: number): string | null | undefined => {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (trimmed.length > max || hasControl(trimmed)) return undefined;
    return trimmed || null;
};

export const createMhcuInviteRoutes = (dependencies: MhcuInviteRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.invitesRepository;
    const now = dependencies.now ?? Date.now;
    const hits = new Map<string, number[]>();
    const origin = () => (dependencies.siteOrigin || 'https://attentiveid.com').replace(/\/$/, '');

    const limited = (key: string, max: number, windowMs: number) => {
        const cutoff = now() - windowMs;
        const recent = (hits.get(key) ?? []).filter((time) => time > cutoff);
        if (recent.length >= max) {
            hits.set(key, recent);
            return true;
        }
        recent.push(now());
        hits.set(key, recent);
        if (hits.size > 5000) hits.delete(hits.keys().next().value as string);
        return false;
    };

    const logFailure = (where: string, error: unknown) => {
        console.error(`[mhcu-invites] ${where} failed:`, error instanceof Error ? error.name : 'error');
    };

    /** The audit row never holds a name or an address; a failed row is logged and never blocks the action. */
    const audit = async (entry: { actor: string | null; action: string; detail: string }) => {
        try {
            await dependencies.assessmentsRepository.audit(entry);
        } catch (error) {
            logFailure('audit', error);
        }
    };

    const withUrl = (invite: InviteRecord) => ({
        ...invite,
        url: `${origin()}/assessments/mhcu?invite=${invite.token}${invite.lang ? `&lang=${invite.lang}` : ''}`
    });

    return new Elysia({ name: 'mhcu-invite-routes' })
        .use(roleGuard)
        .onAfterHandle({ as: 'local' }, ({ set }: any) => {
            set.headers['cache-control'] = 'no-store';
        })
        .post('/api/admin/assessments/mhcu/invites', async ({ body, set, currentUser }: any) => {
            const track = body?.track;
            const psychologistId = body?.psychologistId;
            const clientName = optionalText(body?.clientName, 120);
            const clientEmail = optionalText(body?.clientEmail, 254);
            const phone = optionalText(body?.phone, 40);
            const note = optionalText(body?.note, 500);
            const lang = body?.lang === undefined || body?.lang === null || body?.lang === '' ? null : body.lang === 'id' || body.lang === 'en' ? body.lang : undefined;
            if (
                !isInvitedTrack(track) ||
                typeof psychologistId !== 'string' ||
                !UUID.test(psychologistId) ||
                clientName === undefined ||
                clientEmail === undefined ||
                phone === undefined ||
                note === undefined ||
                lang === undefined ||
                (clientEmail !== null && !EMAIL.test(clientEmail))
            ) {
                set.status = 400;
                return { status: 'error', message: 'Data undangan tidak valid.' };
            }
            try {
                if (!(await repository.isActivePsychologist(psychologistId))) {
                    set.status = 400;
                    return { status: 'error', message: 'Psikolog tidak ditemukan atau tidak aktif.' };
                }
                const invite = await repository.create({ track, psychologistId, clientName, clientEmail, phone, note, lang, createdBy: currentUser.id });
                await audit({ actor: currentUser.id, action: 'invite', detail: `${invite.code} ${invite.track}` });
                const invites = await repository.list();
                set.status = 201;
                return { invite: withUrl(invite), url: withUrl(invite).url, invites: invites.map(withUrl) };
            } catch (error) {
                logFailure('create', error);
                set.status = 503;
                return { status: 'error', message: 'Undangan belum tersimpan.' };
            }
        }, {
            requireRole: ['admin'],
            body: t.Any(),
            detail: { tags: ['Assessments'], summary: 'Create a one-time invitation link for the asesmen awal or free session (admin)' }
        })
        .get('/api/admin/assessments/mhcu/invites', async ({ set }: any) => {
            try {
                return (await repository.list()).map(withUrl);
            } catch (error) {
                logFailure('list', error);
                set.status = 503;
                return { status: 'error', message: 'Undangan belum bisa dimuat.' };
            }
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'All invitation links, newest first (admin)' }
        })
        .delete('/api/admin/assessments/mhcu/invites/:id', async ({ params, set, currentUser }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Undangan tidak ditemukan.' };
            }
            try {
                const result = await repository.cancel(params.id);
                if (result === 'notFound') {
                    set.status = 404;
                    return { status: 'notFound', message: 'Undangan tidak ditemukan.' };
                }
                if (result === 'notOpen') {
                    set.status = 409;
                    return { status: 'error', message: 'Hanya undangan berstatus OPEN yang dapat dibatalkan.' };
                }
                const cancelled = await repository.get(params.id);
                await audit({ actor: currentUser.id, action: 'invite_cancel', detail: cancelled ? `${cancelled.code} ${cancelled.track}` : 'cancel' });
                return (await repository.list()).map(withUrl);
            } catch (error) {
                logFailure('cancel', error);
                set.status = 503;
                return { status: 'error', message: 'Undangan belum dibatalkan.' };
            }
        }, {
            requireRole: ['admin'],
            detail: { tags: ['Assessments'], summary: 'Cancel an open invitation (admin; 409 when it is not OPEN)' }
        })
        .get('/api/public/assessments/invite', async ({ query, headers, set }: any) => {
            // The form asks once when it opens with ?invite=; a person never needs more than a few tries.
            if (limited(`invite:${clientKey(headers)}`, 30, 10 * 60 * 1000)) {
                set.status = 429;
                return { valid: false };
            }
            const token = typeof query?.token === 'string' ? query.token : '';
            try {
                // Nothing but validity, track, the name the admin typed and the language: no psychologist, e-mail, phone or note.
                const found = await repository.lookup(token);
                if (!found.valid) return { valid: false };
                return { valid: true, track: found.track, clientName: found.clientName ?? null, ...(found.lang ? { lang: found.lang } : {}) };
            } catch (error) {
                logFailure('lookup', error);
                set.status = 503;
                return { valid: false };
            }
        }, {
            detail: { tags: ['Assessments'], summary: 'Is this invitation link valid? (public, rate-limited)' }
        });
};
