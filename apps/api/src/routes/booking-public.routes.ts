import { Elysia } from 'elysia';
import { validateBookingSubmission } from '@attentiveid/shared';
import type { BookingRepository } from '../repositories/booking.repository';

export interface BookingRateLimit {
    max: number;
    windowMs: number;
}

export interface BookingPublicRoutesDependencies {
    bookingRepository: Pick<BookingRepository, 'listBookingPsychologists' | 'createSubmission'>;
    triggerOutboxDrain?: () => Promise<unknown>;
    rateLimit?: BookingRateLimit;
    now?: () => number;
}

const DEFAULT_RATE_LIMIT: BookingRateLimit = { max: 5, windowMs: 10 * 60 * 1000 };

// Reverse proxy appends the real client IP last; earlier entries may be spoofed.
const clientIpKey = (headers: Record<string, string | undefined>) => {
    const forwarded = headers['x-forwarded-for'];
    if (!forwarded) return 'unknown';
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? 'unknown';
};

export const createBookingPublicRoutes = (dependencies: BookingPublicRoutesDependencies) => {
    const limit = dependencies.rateLimit ?? DEFAULT_RATE_LIMIT;
    const now = dependencies.now ?? Date.now;
    const hits = new Map<string, number[]>();

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

    return new Elysia({ name: 'booking-public-routes' })
        .get('/api/public/booking/psychologists', async ({ query }: any) => {
            const psychologists = await dependencies.bookingRepository.listBookingPsychologists({
                mode: typeof query?.mode === 'string' ? query.mode : undefined,
                location: typeof query?.location === 'string' ? query.location : undefined
            });
            return {
                status: 'success',
                data: psychologists
            };
        }, {
            detail: {
                tags: ['Booking'],
                summary: 'List active psychologists configured for public booking'
            }
        })
        .post('/api/public/booking/submit', async ({ body, headers, set }: any) => {
            // Honeypot check: respond cleanly without storing bot traffic.
            if (body && typeof body === 'object' && typeof body.website === 'string' && body.website !== '') {
                set.status = 201;
                return { status: 'success' };
            }

            if (isRateLimited(clientIpKey(headers))) {
                set.status = 429;
                return {
                    status: 'error',
                    message: 'Terlalu banyak percobaan booking. Coba beberapa menit lagi.'
                };
            }

            const validation = validateBookingSubmission(body);
            if (!validation.ok) {
                set.status = 400;
                return {
                    status: 'error',
                    errors: validation.errors
                };
            }

            const created = await dependencies.bookingRepository.createSubmission(validation.value);
            if (!created.ok) {
                set.status = created.status;
                return {
                    status: 'error',
                    message: created.message
                };
            }

            // Trigger non-blocking background webhook dispatch.
            if (dependencies.triggerOutboxDrain) {
                void dependencies.triggerOutboxDrain().catch((error) => {
                    console.error('[booking-outbox] Async trigger error:', error);
                });
            }

            set.status = 201;
            return {
                status: 'success',
                data: {
                    id: created.id,
                    bookingCode: created.bookingCode,
                    submittedAt: created.submittedAt,
                    baseRate: created.baseRate,
                    assessmentFee: created.assessmentFee,
                    totalRate: created.totalRate,
                    whatsappRouting: created.whatsappRouting
                }
            };
        }, {
            detail: {
                tags: ['Booking'],
                summary: 'Submit public consultation booking with durable n8n outbox'
            }
        });
};
