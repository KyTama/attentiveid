import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { env } from './config/env';

const app = new Elysia()
    // Swagger documentation
    .use(
        swagger({
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
        })
    )
    // Enable CORS for frontend
    .use(
        cors({
            origin: env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true,
        })
    )
    .get('/ready', () => ({
        status: 'ready',
        service: 'attentiveid-api',
    }), {
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
    .get('/api/health', () => "OK")
    // API info endpoint
    .get('/api/info', () => ({
        name: 'AttentiveId API',
        version: '0.1.0',
        description: 'Attentive Schedule Reservation System',
        endpoints: {
            docs: '/swagger',
            health: '/health',
        },
    }), {
        detail: {
            tags: ['Health'],
            summary: 'API information',
            description: 'Returns basic API information and available endpoints',
        },
    })
    // Listen
    .listen({
        hostname: '0.0.0.0',
        port: Number(env.PORT) || 3000,
    });

console.log(
    `🦊 AttentiveId API is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(`📚 Swagger docs available at http://localhost:${app.server?.port}/swagger`);

export type App = typeof app;
