import { Elysia, t } from 'elysia';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { AuthTokenService, AuthUserRepository } from './auth';
import type { AssessmentsRepository } from '../repositories/assessments.repository';
import {
    detectProofType,
    isPaymentFor,
    PAYMENT_ACCOUNT,
    PAYMENT_OPTIONS,
    priceFor,
    PROOF_MAX_BYTES,
    verifyPaymentToken,
    WHATSAPP_NUMBER
} from '../services/assessment-payment';

export interface AssessmentPaymentRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    assessmentsRepository: AssessmentsRepository;
    /** Secret that signs the links in the result e-mail (the API's JWT secret). */
    paymentSecret?: string;
    now?: () => number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SERVER_ERROR = 'Terjadi gangguan pada server. Silakan coba lagi sebentar lagi.';
const BAD_LINK = 'Tautan tidak valid. Gunakan tombol di email hasil Anda.';

const clientKey = (headers: Record<string, string | undefined>) => {
    const forwarded = headers['x-forwarded-for'];
    if (!forwarded) return 'unknown';
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? 'unknown';
};

/** The page behind "Get Your Full Analyzed Report Here!": how to pay, and where the participant uploads the proof of transfer. */
export const createAssessmentPaymentRoutes = (dependencies: AssessmentPaymentRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.assessmentsRepository;
    const now = dependencies.now ?? Date.now;
    const hits = new Map<string, number[]>();

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
        console.error(`[assessment-payment] ${where} failed:`, error instanceof Error ? error.name : 'error');
    };

    const validLink = (code: unknown, token: unknown): code is string =>
        typeof code === 'string' && Boolean(dependencies.paymentSecret) && verifyPaymentToken(dependencies.paymentSecret as string, code, token);

    return new Elysia({ name: 'assessment-payment-routes' })
        .use(roleGuard)
        .onAfterHandle({ as: 'local' }, ({ set }: any) => {
            set.headers['cache-control'] = 'no-store';
        })
        .get('/api/public/assessments/payment-info', async ({ query, headers, set }: any) => {
            if (limited(`info:${clientKey(headers)}`, 30, 10 * 60 * 1000)) {
                set.status = 429;
                return { status: 'error', message: 'Terlalu banyak percobaan.' };
            }
            if (!validLink(query?.id, query?.t)) {
                set.status = 404;
                return { status: 'notFound', message: BAD_LINK };
            }
            try {
                const row = await repository.getByCode(query.id);
                if (!row || row.instrument !== 'mhcu') {
                    set.status = 404;
                    return { status: 'notFound', message: BAD_LINK };
                }
                return {
                    status: 'success',
                    data: {
                        code: row.code,
                        name: row.name,
                        lang: row.lang,
                        submitted: row.paymentSubmittedAt !== null,
                        // What the page shows about the result itself (the team's report-access page): the index and the level.
                        mhi: typeof (row.scores as { mhi?: unknown })?.mhi === 'number' ? (row.scores as { mhi: number }).mhi : null,
                        level: row.level,
                        levelName: (row.scores as { levelName?: { id?: string; en?: string } })?.levelName ?? null,
                        track: row.track,
                        account: PAYMENT_ACCOUNT,
                        whatsapp: WHATSAPP_NUMBER,
                        options: (Object.keys(PAYMENT_OPTIONS) as Array<keyof typeof PAYMENT_OPTIONS>).map((key) => ({
                            key,
                            labelId: PAYMENT_OPTIONS[key].labelId,
                            labelEn: PAYMENT_OPTIONS[key].labelEn,
                            amount: priceFor(key),
                            normal: PAYMENT_OPTIONS[key].normal
                        }))
                    }
                };
            } catch (error) {
                logFailure('info', error);
                set.status = 503;
                return { status: 'error', message: SERVER_ERROR };
            }
        }, {
            detail: { tags: ['Assessments'], summary: 'Payment page data for the link in the result e-mail (public, signed link)' }
        })
        .post('/api/public/assessments/payment', async ({ body, headers, set }: any) => {
            if (limited(`pay-ip:${clientKey(headers)}`, 10, 60 * 60 * 1000)) {
                set.status = 429;
                return { status: 'error', message: 'Terlalu banyak percobaan. Coba lagi nanti.' };
            }
            if (!validLink(body?.id, body?.t)) {
                set.status = 404;
                return { status: 'notFound', message: BAD_LINK };
            }
            if (!isPaymentFor(body.paymentFor)) {
                set.status = 400;
                return { status: 'error', message: 'Pilihan pembayaran tidak valid.' };
            }
            const file = body.proof;
            if (!file || typeof file.arrayBuffer !== 'function') {
                set.status = 400;
                return { status: 'error', message: 'Bukti transfer wajib diunggah (gambar JPG/PNG/WebP atau PDF, maksimal 5 MB).' };
            }
            if (file.size > PROOF_MAX_BYTES) {
                set.status = 400;
                return { status: 'error', message: 'Ukuran file melebihi batas 5 MB. Kompres atau pilih berkas yang lebih kecil.' };
            }
            const data = Buffer.from(await file.arrayBuffer());
            const mimeType = detectProofType(data);
            if (!mimeType || data.length > PROOF_MAX_BYTES) {
                set.status = 400;
                return { status: 'error', message: 'Bukti transfer harus berupa gambar JPG/PNG/WebP atau PDF, maksimal 5 MB.' };
            }
            if (limited(`pay-code:${body.id}`, 5, 24 * 60 * 60 * 1000)) {
                set.status = 429;
                return { status: 'error', message: 'Bukti sudah dikirim beberapa kali. Hubungi kami lewat WhatsApp.' };
            }
            try {
                const row = await repository.getByCode(body.id);
                if (!row || row.instrument !== 'mhcu') {
                    set.status = 404;
                    return { status: 'notFound', message: BAD_LINK };
                }
                await repository.savePayment(row.id, { paymentFor: body.paymentFor, mimeType, data });
                return { status: 'success' };
            } catch (error) {
                logFailure('upload', error);
                set.status = 503;
                return { status: 'error', message: SERVER_ERROR };
            }
        }, {
            body: t.Object({ id: t.String(), t: t.String(), paymentFor: t.String(), proof: t.File() }),
            detail: { tags: ['Assessments'], summary: 'Upload the proof of transfer for the full report (public, signed link)' }
        })
        .get('/api/admin/assessments/:id/proof', async ({ params, set }: any) => {
            if (!UUID.test(params.id)) {
                set.status = 404;
                return { status: 'notFound', message: 'Data tidak ditemukan.' };
            }
            try {
                const proof = await repository.getProof(params.id);
                if (!proof) {
                    set.status = 404;
                    return { status: 'notFound', message: 'Belum ada bukti transfer.' };
                }
                return new Response(new Uint8Array(proof.data), {
                    headers: {
                        'content-type': proof.mimeType,
                        'content-disposition': 'inline; filename="bukti-transfer"',
                        'cache-control': 'no-store',
                        'x-content-type-options': 'nosniff'
                    }
                });
            } catch (error) {
                logFailure('proof', error);
                set.status = 503;
                return { status: 'error', message: 'Bukti belum bisa dimuat.' };
            }
        }, {
            requireRole: ['admin', 'psychologist'],
            detail: { tags: ['Assessments'], summary: 'The proof of transfer a participant uploaded (staff)' }
        });
};
