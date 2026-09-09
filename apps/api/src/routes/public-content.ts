import { Elysia, t } from 'elysia';
import type { LandingContentRead } from '../repositories/landing-content.repository';
import type {
    PsychologistListQuery,
    PsychologistPublicProjection
} from '../repositories/psychologists.repository';

const previewCookieName = 'attentive_landing_preview';

interface LandingRepository {
    getPublished(): Promise<LandingContentRead | null>;
    getRevision(id: string): Promise<LandingContentRead | null>;
}

interface PsychologistsRepository {
    list(query: PsychologistListQuery): Promise<PsychologistPublicProjection[]>;
    featured(locale: 'id' | 'en'): Promise<PsychologistPublicProjection[]>;
    getBySlug(slug: string, locale: 'id' | 'en'): Promise<
        | { status: 'found'; psychologist: PsychologistPublicProjection }
        | { status: 'unavailable'; psychologist: { slug: string; name: string; nickname: string } }
        | { status: 'notFound' }
    >;
}

interface PreviewCapabilities {
    verify(token: string): Promise<{
        landingRevisionId: string;
        expiresAt: string;
        tokenDigest: string;
    }>;
}

interface PreviewSessions {
    issue(capability: {
        landingRevisionId: string;
        expiresAt: string;
        tokenDigest: string;
    }, ttlSeconds?: number): Promise<{ token: string; expiresAt: string }>;
    verify(token: string): Promise<{ landingRevisionId: string; expiresAt: string }>;
}

export interface PublicContentDependencies {
    frontendOrigin: string;
    landingRepository: LandingRepository;
    psychologistsRepository: PsychologistsRepository;
    previewCapabilities: PreviewCapabilities;
    previewSessions: PreviewSessions;
    accessLog?: (entry: { method: string; path: string; body: '[REDACTED]' | null }) => void;
}

const genericInvalidPreview = { status: 'invalidPreview' as const };

const cookieValue = (request: Request, name: string) => {
    const cookie = request.headers.get('cookie');
    if (!cookie) return null;
    for (const segment of cookie.split(';')) {
        const [key, ...valueParts] = segment.trim().split('=');
        if (key === name) return valueParts.join('=') || null;
    }
    return null;
};

const hasTokenInHeaders = (request: Request, token: string) => {
    for (const [, value] of request.headers) {
        if (value.includes(token)) return true;
    }
    return false;
};

const localeSchema = t.Union([t.Literal('id'), t.Literal('en')]);

export const createPublicContentRoutes = (dependencies: PublicContentDependencies) => new Elysia({
    name: 'public-content-routes'
})
    .get('/api/content/landing', async () => ({
        status: 'found' as const,
        landing: await dependencies.landingRepository.getPublished()
    }))
    .get('/api/content/psychologists/featured', async ({ query }) => ({
        status: 'found' as const,
        psychologists: await dependencies.psychologistsRepository.featured(query.locale)
    }), {
        query: t.Object({ locale: localeSchema }, { additionalProperties: false })
    })
    .get('/api/content/psychologists', async ({ query }) => ({
        status: 'found' as const,
        psychologists: await dependencies.psychologistsRepository.list({
            locale: query.locale,
            ...(query.search ? { search: query.search } : {}),
            ...(query.supportArea ? { supportArea: query.supportArea } : {}),
            ...(query.minimumExperienceYears === undefined
                ? {}
                : { minimumExperienceYears: query.minimumExperienceYears }),
            ...(query.limit === undefined ? {} : { limit: query.limit }),
            ...(query.offset === undefined ? {} : { offset: query.offset })
        })
    }), {
        query: t.Object({
            locale: localeSchema,
            search: t.Optional(t.String({ maxLength: 200 })),
            supportArea: t.Optional(t.Union([
                t.Literal('adultClinical'),
                t.Literal('childAdolescent'),
                t.Literal('educational')
            ])),
            minimumExperienceYears: t.Optional(t.Numeric({ minimum: 0, maximum: 80 })),
            limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
            offset: t.Optional(t.Numeric({ minimum: 0, maximum: 10_000 }))
        }, { additionalProperties: false })
    })
    .get('/api/content/psychologists/:slug', async ({ params, query }) => (
        dependencies.psychologistsRepository.getBySlug(params.slug, query.locale)
    ), {
        params: t.Object({ slug: t.String({ minLength: 1, maxLength: 160 }) }, { additionalProperties: false }),
        query: t.Object({ locale: localeSchema }, { additionalProperties: false })
    })
    .post('/api/preview/landing/session', async ({ body, request, set }) => {
        dependencies.accessLog?.({ method: request.method, path: new URL(request.url).pathname, body: '[REDACTED]' });
        try {
            const requestUrl = new URL(request.url);
            if (requestUrl.search !== ''
                || request.headers.get('origin') !== dependencies.frontendOrigin
                || hasTokenInHeaders(request, body.capability)) {
                throw new Error('Invalid preview exchange.');
            }
            const capability = await dependencies.previewCapabilities.verify(body.capability);
            const draft = await dependencies.landingRepository.getRevision(capability.landingRevisionId);
            if (!draft || draft.revision.status !== 'draft') throw new Error('Invalid preview exchange.');
            const session = await dependencies.previewSessions.issue(capability, 300);
            const maxAge = Math.max(0, Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1_000));
            set.headers['set-cookie'] = `${previewCookieName}=${session.token}; Max-Age=${maxAge}; Path=/api/preview/landing; HttpOnly; Secure; SameSite=Strict`;
            set.headers['cache-control'] = 'private, no-store';
            set.headers['referrer-policy'] = 'no-referrer';
            return { status: 'ready' as const, expiresAt: session.expiresAt };
        } catch {
            set.status = 403;
            set.headers['cache-control'] = 'private, no-store';
            set.headers['referrer-policy'] = 'no-referrer';
            return genericInvalidPreview;
        }
    }, {
        body: t.Object({ capability: t.String({ minLength: 1, maxLength: 4_096 }) }, { additionalProperties: false })
    })
    .get('/api/preview/landing', async ({ request, set }) => {
        dependencies.accessLog?.({ method: request.method, path: new URL(request.url).pathname, body: null });
        set.headers['cache-control'] = 'private, no-store';
        set.headers['referrer-policy'] = 'no-referrer';
        try {
            if (new URL(request.url).search !== '') throw new Error('Invalid preview session.');
            const sessionToken = cookieValue(request, previewCookieName);
            if (!sessionToken) throw new Error('Invalid preview session.');
            const session = await dependencies.previewSessions.verify(sessionToken);
            const landing = await dependencies.landingRepository.getRevision(session.landingRevisionId);
            if (!landing || landing.revision.status !== 'draft') throw new Error('Invalid preview session.');
            return {
                status: 'preview' as const,
                preview: { landingRevisionId: session.landingRevisionId, expiresAt: session.expiresAt },
                landing
            };
        } catch {
            set.status = 403;
            return genericInvalidPreview;
        }
    });
