import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { createPublicContentRoutes, type PublicContentDependencies } from './routes/public-content';

export type AppDependencies = PublicContentDependencies;

export const createApp = (dependencies: AppDependencies) => new Elysia()
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
    // Health check endpoint
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
    // API info endpoint
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

export type App = ReturnType<typeof createApp>;
