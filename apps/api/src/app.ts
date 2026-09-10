import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { createPublicContentRoutes, type PublicContentDependencies } from './routes/public-content';
import { createAuthRoutes, type AuthDependencies } from './routes/auth';
import { createArticleRoutes } from './routes/articles';
import { createLandingCmsRoutes } from './routes/landing-cms';

export type AppDependencies = PublicContentDependencies & Partial<AuthDependencies> & {
    articlesRepository?: any;
    landingContentRepository?: any;
    contentTransitions?: any;
};

export const createApp = (dependencies: AppDependencies) => {
    const baseApp = new Elysia()
        // Swagger documentation
        .use(swagger({
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
                ],
            },
        }))
        // Enable CORS for frontend
        .use(cors({ origin: dependencies.frontendOrigin, credentials: true }))
        .use(createPublicContentRoutes(dependencies))
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
        });

    if (dependencies.userRepository && dependencies.tokenService && dependencies.verifyPassword) {
        return baseApp
            .use(createAuthRoutes(dependencies as AuthDependencies))
            .use(createArticleRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                articlesRepository: dependencies.articlesRepository || { getPublishedBySlug: async () => ({ status: 'notFound' }) },
                contentTransitions: dependencies.contentTransitions,
            }))
            .use(createLandingCmsRoutes({
                tokenService: dependencies.tokenService,
                userRepository: dependencies.userRepository,
                landingContentRepository: dependencies.landingContentRepository,
                contentTransitions: dependencies.contentTransitions,
            }));
    }

    return baseApp;
};

export type App = ReturnType<typeof createApp>;
