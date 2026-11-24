import { Elysia, t } from 'elysia';
import {
    BOOKING_STATUSES,
    bookingsToCsv,
    type BookingStatus
} from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import { isOwnerUser } from '../security/owner';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { BookingRepository } from '../repositories/booking.repository';

export interface BookingAdminRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    bookingRepository: Pick<
        BookingRepository,
        'listAdmin' | 'listForExport' | 'transitionStatus' | 'retryWebhookDelivery' | 'getAttributionReport' | 'deleteBooking'
    >;
    triggerOutboxDrain?: () => Promise<unknown>;
}

export const createBookingAdminRoutes = (dependencies: BookingAdminRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });

    return new Elysia({ name: 'booking-admin-routes' })
        .use(roleGuard)
        .get('/api/admin/bookings', async ({ query }: any) => {
            const limit = query?.limit ? Number(query.limit) : undefined;
            const offset = query?.offset ? Number(query.offset) : undefined;

            const result = await dependencies.bookingRepository.listAdmin({
                status: typeof query?.status === 'string' ? query.status : undefined,
                consultationMode: typeof query?.consultationMode === 'string' ? query.consultationMode : undefined,
                location: typeof query?.location === 'string' ? query.location : undefined,
                search: typeof query?.search === 'string' ? query.search : undefined,
                dateFrom: typeof query?.dateFrom === 'string' ? query.dateFrom : undefined,
                dateTo: typeof query?.dateTo === 'string' ? query.dateTo : undefined,
                ...(Number.isFinite(limit) ? { limit } : {}),
                ...(Number.isFinite(offset) ? { offset } : {})
            });

            return {
                status: 'success',
                data: result
            };
        }, {
            requireRole: ['admin', 'superadmin'],
            detail: {
                tags: ['Booking'],
                summary: 'List operational booking queue (Clinical Privacy Wall excludes clinical narrative)'
            }
        })
        .patch('/api/admin/bookings/:id/status', async ({ params, body, set }: any) => {
            const status = body?.status as BookingStatus;
            if (!BOOKING_STATUSES.includes(status)) {
                set.status = 400;
                return { status: 'error', message: 'Status booking tidak valid.' };
            }

            const result = await dependencies.bookingRepository.transitionStatus(params.id, {
                status,
                confirmedStartAt: body?.confirmedStartAt,
                confirmedEndAt: body?.confirmedEndAt
            });

            if (!result.ok) {
                set.status = result.status;
                return {
                    status: 'error',
                    code: result.code,
                    message: result.message
                };
            }

            return {
                status: 'success',
                data: result.record
            };
        }, {
            requireRole: ['admin', 'superadmin'],
            body: t.Object({
                status: t.String(),
                confirmedStartAt: t.Optional(t.Union([t.String(), t.Null()])),
                confirmedEndAt: t.Optional(t.Union([t.String(), t.Null()]))
            }),
            detail: {
                tags: ['Booking'],
                summary: 'Transition booking lifecycle status with advisory-locked slot overlap check'
            }
        })
        .post('/api/admin/bookings/:id/retry-webhook', async ({ params, set }: any) => {
            const result = await dependencies.bookingRepository.retryWebhookDelivery(params.id);
            if (!result.ok) {
                set.status = result.status;
                return { status: 'error', message: result.message };
            }

            if (dependencies.triggerOutboxDrain) {
                void dependencies.triggerOutboxDrain().catch((error) => {
                    console.error('[booking-outbox] Retry drain error:', error);
                });
            }

            return {
                status: 'success',
                data: { deliveryId: result.deliveryId },
                message: 'Pengiriman webhook dijadwalkan ulang.'
            };
        }, {
            requireRole: ['admin', 'superadmin'],
            detail: {
                tags: ['Booking'],
                summary: 'Manually reschedule failed or dead-lettered booking webhook delivery'
            }
        })
        .delete('/api/admin/bookings/:id', async ({ params, set, currentUser }: any) => {
            // Owner only: the superadmin on the owner list. Everyone else, other admins included, gets 403.
            if (!isOwnerUser(currentUser)) {
                set.status = 403;
                return { status: 'forbidden', message: 'Hanya akun pemilik yang dapat menghapus data.' };
            }
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Reservasi tidak ditemukan.' };
            }
            const removed = await dependencies.bookingRepository.deleteBooking(params.id);
            if (!removed) {
                set.status = 404;
                return { status: 'notFound', message: 'Reservasi tidak ditemukan.' };
            }
            console.warn(`[booking] booking ${params.id} deleted by owner`);
            return { status: 'success', data: { id: params.id } };
        }, {
            requireRole: ['admin', 'superadmin'],
            detail: { tags: ['Booking'], summary: 'Permanently delete one booking (owner account only)' }
        })
        .get('/api/admin/bookings/attribution', async ({ query }: any) => {
            const report = await dependencies.bookingRepository.getAttributionReport({
                dateFrom: typeof query?.dateFrom === 'string' ? query.dateFrom : undefined,
                dateTo: typeof query?.dateTo === 'string' ? query.dateTo : undefined
            });
            return {
                status: 'success',
                data: report
            };
        }, {
            requireRole: ['admin', 'superadmin'],
            detail: {
                tags: ['Booking'],
                summary: 'Aggregate UTM & Meta Ad attribution report across bookings'
            }
        })
        .get('/api/admin/bookings/export.csv', async ({ query }: any) => {
            const records = await dependencies.bookingRepository.listForExport({
                status: typeof query?.status === 'string' ? query.status : undefined,
                consultationMode: typeof query?.consultationMode === 'string' ? query.consultationMode : undefined,
                location: typeof query?.location === 'string' ? query.location : undefined,
                search: typeof query?.search === 'string' ? query.search : undefined,
                dateFrom: typeof query?.dateFrom === 'string' ? query.dateFrom : undefined,
                dateTo: typeof query?.dateTo === 'string' ? query.dateTo : undefined
            });
            const csv = bookingsToCsv(records);
            return new Response(csv, {
                headers: {
                    'Content-Type': 'text/csv; charset=utf-8',
                    'Content-Disposition': 'attachment; filename="attentive-bookings.csv"'
                }
            });
        }, {
            requireRole: ['admin', 'superadmin'],
            detail: {
                tags: ['Booking'],
                summary: 'Export formula-neutralized operational booking CSV without raw clinical notes'
            }
        });
};
