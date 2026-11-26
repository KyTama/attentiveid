import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { createPublicContentRoutes, type PublicContentDependencies } from './routes/public-content';
import { createAuthRoutes, type AuthDependencies } from './routes/auth';
import { createArticleRoutes } from './routes/articles';
import { createLandingCmsRoutes } from './routes/landing-cms';
import { createPsychologistsCmsRoutes } from './routes/psychologists-cms';
import { createOverviewRoutes } from './routes/overview.routes';
import { createPsychologistSelfRoutes } from './routes/psychologist-self.routes';
import { createUsersManagementRoutes } from './routes/users-management.routes';
import { createFreeSessionRoutes } from './routes/free-session.routes';
import { createPrayersRoutes } from './routes/prayers.routes';
import { createFeedbackRoutes } from './routes/feedback.routes';
import { createReviewImportsRoutes } from './routes/review-imports.routes';
import { createReviewImportsRepository, type ReviewImportsRepository } from './repositories/review-imports.repository';
import type { ReviewSheet } from './services/review-sheet';
import type { DriveRequests } from './services/drive-reports';
import { createFeedbackRepository, type FeedbackRepository } from './repositories/feedback.repository';
import { createAssessmentsRoutes } from './routes/assessments.routes';
import { createAccountSettingsRoutes } from './routes/account-settings.routes';
import { createAssessmentsRepository, type AssessmentsRepository } from './repositories/assessments.repository';
import type { AssessmentsSheetSync } from './services/assessments-sheet-sync';
import type { Mailer } from './services/mailer';
import type { FeedbackSheet } from './services/feedback-sheet';
import type { DriveReports } from './services/drive-reports';
import { createAssessmentPaymentRoutes } from './routes/assessment-payment.routes';
import { createMhcuOpsRoutes, type MhcuSettingsStore } from './routes/mhcu-ops.routes';
import { createMhcuOpsRepository, type MhcuOpsRepository } from './repositories/mhcu-ops.repository';
import { createMemorySettingsStore } from './services/mhcu-settings-store';
import { createMhcuInviteRoutes } from './routes/mhcu-invites.routes';
import { createMhcuInvitesRepository, type MhcuInvitesRepository } from './repositories/mhcu-invites.repository';
import { createPrayersRepository, type PrayersRepository } from './repositories/prayers.repository';
import type { FreeSessionSheetSync } from './services/free-session-sheet-sync';
import { createFreeSessionRepository, type FreeSessionRepository } from './repositories/free-session.repository';
import { createSciBriefsRoutes } from './routes/sci-briefs.routes';
import { createAdminToolsRoutes } from './routes/admin-tools.routes';
import { createAdminToolsRepository, type AdminToolsRepository } from './repositories/admin-tools.repository';
import { createSciBriefsRepository, type SciBriefsRepository } from './repositories/sci-briefs.repository';
import { createSitemapRoutes } from './routes/sitemap.routes';
import { createBookingRepository, type BookingRepository } from './repositories/booking.repository';
import { createBookingPublicRoutes } from './routes/booking-public.routes';
import { createBookingAdminRoutes } from './routes/booking-admin.routes';
import { getMediaFilePath } from './services/media-storage';

export type AppDependencies = PublicContentDependencies & Partial<AuthDependencies> & {
    articlesRepository?: any;
    landingContentRepository?: any;
    contentTransitions?: any;
    db?: any;
    reviewImportsRepository?: ReviewImportsRepository;
    reviewSheet?: ReviewSheet;
    freeSessionRepository?: FreeSessionRepository;
    prayersRepository?: PrayersRepository;
    feedbackRepository?: FeedbackRepository;
    feedbackSheet?: FeedbackSheet;
    /** Copies website bug reports and update requests into Drive (optional). */
    driveRequests?: DriveRequests;
    assessmentsRepository?: AssessmentsRepository;
    assessmentsSheetSync?: AssessmentsSheetSync;
    /** Saves released reports to Google Drive (optional). */
    driveReports?: DriveReports;
    mhcuInvitesRepository?: MhcuInvitesRepository;
    mailer?: Mailer;
    alertEmail?: string;
    mhcuSettings?: MhcuSettingsStore;
    mhcuOpsRepository?: MhcuOpsRepository;
    paymentSecret?: string;
    freeSessionSheetSync?: FreeSessionSheetSync;
    sciBriefsRepository?: SciBriefsRepository;
    adminToolsRepository?: AdminToolsRepository;
    bookingRepository?: BookingRepository;
    triggerOutboxDrain?: () => Promise<unknown>;
};

export const createApp = (dependencies: AppDependencies) => {
    const bookingRepository = dependencies.bookingRepository ?? createBookingRepository(dependencies.db);

    const production = process.env.NODE_ENV === 'production';

    const baseApp = new Elysia()
        // Security headers on every API response (the API only serves JSON, files and small meta pages).
        .onAfterHandle({ as: 'global' }, ({ set }) => {
            set.headers['x-content-type-options'] = 'nosniff';
            set.headers['referrer-policy'] = 'no-referrer';
            // A route that serves a real page (the report) sets its own, slightly wider policy; everything else gets the locked-down one.
            if (!set.headers['content-security-policy']) {
                set.headers['content-security-policy'] = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'";
            }
            set.headers['cross-origin-resource-policy'] = 'same-site';
            set.headers['permissions-policy'] = 'camera=(), microphone=(), geolocation=(), payment=()';
        })
        // API documentation lists every endpoint: only on a developer machine, not in production.
        .use(production ? new Elysia() : swagger({
            documentation: {
                info: {
                    title: 'AttentiveId API',
                    version: '0.1.0',
                    description: 'Attentive Schedule Reservation System API',
                },
                tags: [
                    { name: 'Health', description: 'Health check endpoints' },
                    { name: 'Auth', description: 'Authentication endpoints' },
                    { name: 'Landing CMS', description: 'Landing page section content editor' },
                    { name: 'Articles', description: 'Psychology articles and reading' },
                    { name: 'Articles CMS', description: 'Article management and review workflows' },
                    { name: 'Reservations', description: 'Reservation management' },
                    { name: 'Admin', description: 'Admin operations' },
                    { name: 'Psychologist', description: 'Psychologist operations' },
                    { name: 'Free Session', description: 'Free session registration form and admin report' },
                    { name: 'Booking', description: 'Consultation booking catalog, submission, operational portal, and attribution' },
                ],
            },
        }))
        // Enable CORS for frontend
        .use(cors({ origin: dependencies.frontendOrigin, credentials: true }))
        .use(createPublicContentRoutes(dependencies))
        .use(createSitemapRoutes({ db: dependencies.db, siteOrigin: dependencies.frontendOrigin }))
        .use(createBookingPublicRoutes({
            bookingRepository,
            triggerOutboxDrain: dependencies.triggerOutboxDrain
        }))
        .get('/ready', () => ({ status: 'ready', service: 'attentiveid-api' }), {
            detail: {
                tags: ['Health'],
                summary: 'Readiness check',
                description: 'Confirms that the API process is ready to receive traffic',
            },
        })
        .get('/health', () => ({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'attentiveid-api',
        }), {
            detail: {
                tags: ['Health'],
                summary: 'Health check',
                description: 'Returns the health status of the API',
            },
        })
        .get('/api/health', () => 'OK')
        .get('/api/info', () => ({
            name: 'AttentiveId API',
            version: '0.1.0',
            description: 'Attentive Schedule Reservation System',
            endpoints: { docs: '/swagger', health: '/health' },
        }), {
            detail: {
                tags: ['Health'],
                summary: 'API information',
                description: 'Returns basic API information and available endpoints',
            },
        })
        .get('/media/*', ({ params, set }: { params: Record<string, string>; set: any }) => {
            const requestedPath = params['*'];
            const filePath = getMediaFilePath(requestedPath);
            if (!filePath) {
                set.status = 404;
                return { status: 'notFound', message: 'Media file not found' };
            }
            return Bun.file(filePath);
        }, {
            detail: {
                tags: ['Media'],
                summary: 'Serve static media file',
                description: 'Serves uploaded psychologist photos and landing page media assets',
            },
        })
        .get('/api/media/*', ({ params, set }: { params: Record<string, string>; set: any }) => {
            const requestedPath = params['*'];
            const filePath = getMediaFilePath(requestedPath);
            if (!filePath) {
                set.status = 404;
                return { status: 'notFound', message: 'Media file not found' };
            }
            return Bun.file(filePath);
        }, {
            detail: {
                tags: ['Media'],
                summary: 'Serve static media file alias',
                description: 'Serves uploaded media through api path prefix',
            },
        });

    if (dependencies.userRepository && dependencies.tokenService && dependencies.verifyPassword) {
        return baseApp
            .use(createAuthRoutes(dependencies as AuthDependencies))
            .use(createArticleRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                articlesRepository: dependencies.articlesRepository || { getPublishedBySlug: async () => ({ status: 'notFound' }) },
                contentTransitions: dependencies.contentTransitions,
                db: dependencies.db,
            }))
            .use(createLandingCmsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                landingContentRepository: dependencies.landingContentRepository || dependencies.landingRepository,
                contentTransitions: dependencies.contentTransitions,
                previewCapabilities: dependencies.previewCapabilities,
                db: dependencies.db,
            }))
            .use(createReviewImportsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                reviewImportsRepository: dependencies.reviewImportsRepository || createReviewImportsRepository(dependencies.db),
                reviewSheet: dependencies.reviewSheet,
            }))
            .use(createPsychologistsCmsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                psychologistsRepository: dependencies.psychologistsRepository,
                db: dependencies.db,
            }))
            .use(createOverviewRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                db: dependencies.db,
            }))
            .use(createPsychologistSelfRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                db: dependencies.db,
            }))
            .use(createUsersManagementRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                db: dependencies.db,
            }))
            .use(createFreeSessionRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                freeSessionRepository: dependencies.freeSessionRepository || createFreeSessionRepository(dependencies.db),
                sheetSync: dependencies.freeSessionSheetSync,
                mailer: dependencies.mailer,
                alertEmail: dependencies.alertEmail,
                siteOrigin: dependencies.frontendOrigin,
            }))
            .use(createFeedbackRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                feedbackRepository: dependencies.feedbackRepository || createFeedbackRepository(dependencies.db),
                sheet: dependencies.feedbackSheet,
                driveRequests: dependencies.driveRequests,
            }))
            .use(createPrayersRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                prayersRepository: dependencies.prayersRepository || createPrayersRepository(dependencies.db),
                adminToolsRepository: dependencies.adminToolsRepository || createAdminToolsRepository(dependencies.db),
            }))
            .use(createAccountSettingsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                db: dependencies.db,
            }))
            .use(createAssessmentPaymentRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                assessmentsRepository: dependencies.assessmentsRepository || createAssessmentsRepository(dependencies.db),
                paymentSecret: dependencies.paymentSecret,
                mailer: dependencies.mailer,
                alertEmail: dependencies.alertEmail,
                settings: dependencies.mhcuSettings,
                siteOrigin: dependencies.frontendOrigin,
            }))
            .use(createMhcuInviteRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                invitesRepository: dependencies.mhcuInvitesRepository || createMhcuInvitesRepository(dependencies.db),
                assessmentsRepository: dependencies.assessmentsRepository || createAssessmentsRepository(dependencies.db),
                siteOrigin: dependencies.frontendOrigin,
            }))
            .use(createAssessmentsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                assessmentsRepository: dependencies.assessmentsRepository || createAssessmentsRepository(dependencies.db),
                sheetSync: dependencies.assessmentsSheetSync,
                mailer: dependencies.mailer,
                alertEmail: dependencies.alertEmail,
                settings: dependencies.mhcuSettings,
                ops: dependencies.mhcuSettings ? dependencies.mhcuOpsRepository || createMhcuOpsRepository(dependencies.db) : undefined,
                paymentSecret: dependencies.paymentSecret,
                siteOrigin: dependencies.frontendOrigin,
                driveReports: dependencies.driveReports,
            }))
            .use(createMhcuOpsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                assessmentsRepository: dependencies.assessmentsRepository || createAssessmentsRepository(dependencies.db),
                ops: dependencies.mhcuOpsRepository || createMhcuOpsRepository(dependencies.db),
                settings: dependencies.mhcuSettings || createMemorySettingsStore(dependencies.alertEmail),
                audit: async (entry) => {
                    const repo = dependencies.assessmentsRepository || createAssessmentsRepository(dependencies.db);
                    await repo.audit({ actor: entry.actor, action: entry.action, submissionId: entry.submissionId, detail: entry.detail });
                },
                mailer: dependencies.mailer,
                paymentSecret: dependencies.paymentSecret,
                siteOrigin: dependencies.frontendOrigin,
            }))
            .use(createSciBriefsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                sciBriefsRepository: dependencies.sciBriefsRepository || createSciBriefsRepository(dependencies.db),
            }))
            .use(createAdminToolsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                repository: dependencies.adminToolsRepository || createAdminToolsRepository(dependencies.db),
                psychologistsRepository: dependencies.psychologistsRepository,
                siteOrigin: dependencies.frontendOrigin,
            }))
            .use(createBookingAdminRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                bookingRepository,
                triggerOutboxDrain: dependencies.triggerOutboxDrain
            }));
    }

    return baseApp;
};

export type App = ReturnType<typeof createApp>;
