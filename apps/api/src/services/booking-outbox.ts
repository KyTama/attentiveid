import { createHmac } from 'node:crypto';
import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    BOOKING_BRANCH_LABELS,
    type BookingPhysicalBranch,
    type NormalizedBookingSubmission
} from '@attentiveid/shared';
import * as schema from '../db/schema';

export interface OutboxPayloadBuildInput {
    id: string;
    bookingCode: string;
    submittedAt: string;
    normalized: NormalizedBookingSubmission;
    baseRate: number;
    assessmentFee: number;
    totalRate: number;
    whatsappRouting: { target: 'malang' | 'pusat'; whatsappNumber: string };
}

export interface BookingWebhookPayload {
    event: 'booking.submitted';
    idempotencyKey: string;
    booking: {
        id: string;
        bookingCode: string;
        submittedAt: string;
        status: 'pending';
        language: 'id' | 'en';
        clientStatus: 'new' | 'returning';
        name: string;
        whatsapp: string;
        whatsappE164: string;
        email: string;
        countryRegion: string | null;
        age: number | null;
        gender: string | null;
        serviceType: string;
        concernId: string | null;
        concernCategory: string | null;
        clientCategory: string | null;
        genderPreference: string | null;
        hasClinicalNote: boolean;
        crisisFlagTriggered: boolean;
        consultationMode: 'online' | 'offline';
        location: BookingPhysicalBranch | null;
        psychologistChoice: 'recommended' | 'previous' | 'self';
        psychologistId: string | null;
        psychologistSlug: string | null;
        selectedPsychologistName: string | null;
        scheduleOption1: string;
        scheduleOption2: string | null;
        scheduleOption3: string | null;
        baseRate: number;
        assessmentFee: number;
        totalRate: number;
        marketingSource: string | null;
        referrer: string | null;
        utmSource: string | null;
        utmMedium: string | null;
        utmCampaign: string | null;
        utmContent: string | null;
        utmTerm: string | null;
        campaignId: string | null;
        adsetId: string | null;
        adId: string | null;
        whatsappRouting: { target: 'malang' | 'pusat'; whatsappNumber: string };
    };
    notifications: {
        adminEmail: {
            to: string;
            subject: string;
            textBody: string;
        };
        googleSheetRow: string[];
    };
}

const formatWibTimestamp = (iso: string): string => {
    const parsed = new Date(iso);
    const ms = Number.isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
    const wib = new Date(ms + 7 * 3_600_000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const h24 = wib.getUTCHours();
    const h12 = h24 % 12 || 12;
    const ampm = h24 < 12 ? 'AM' : 'PM';
    return `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth() + 1)}-${pad(wib.getUTCDate())} ${pad(h12)}:${pad(wib.getUTCMinutes())} ${ampm}`;
};

const PSYCH_CHOICE_LABELS: Record<'recommended' | 'previous' | 'self', string> = {
    recommended: 'Rekomendasi Attentive',
    previous: 'Psikolog sebelumnya',
    self: 'Pilih sendiri'
};

/**
 * Builds the transactional outbox JSON payload for n8n.
 * Intentionally excludes raw clinical narrative (`concernNote`) from both email
 * and Google Sheet representations to uphold the Clinical Privacy Wall.
 */
export const buildBookingWebhookPayload = (input: OutboxPayloadBuildInput): BookingWebhookPayload => {
    const { normalized } = input;
    const idempotencyKey = `booking.submitted:${input.id}`;
    const hasClinicalNote = Boolean(normalized.concernNote);
    const crisisFlagTriggered = normalized.crisisFlagTriggered;
    const dash = '—';

    const clinicalRedactionNote = crisisFlagTriggered
        ? '[CRISIS FLAG — Triage note stored securely in Clinical Portal]'
        : hasClinicalNote
            ? '[Triage note stored securely in Clinical Portal]'
            : dash;

    const branchLabel = normalized.location ? BOOKING_BRANCH_LABELS.id[normalized.location] : '';
    const clientStatusLabel = normalized.clientStatus === 'new' ? 'Klien baru' : 'Klien lama';
    const modeLabel = normalized.consultationMode === 'online' ? 'Online' : 'Offline';
    const psychChoiceLabel = PSYCH_CHOICE_LABELS[normalized.psychologistChoice];

    const priceLines: string[] = [];
    if (input.baseRate > 0) {
        priceLines.push(`Tarif Psikolog: Rp ${input.baseRate.toLocaleString('id-ID')}`);
        if (input.assessmentFee > 0) {
            priceLines.push(`Biaya Asesmen Awal: Rp ${input.assessmentFee.toLocaleString('id-ID')}`);
        }
        priceLines.push(`Total Estimasi: Rp ${input.totalRate.toLocaleString('id-ID')}`);
    }
    const priceSection = priceLines.length > 0 ? `\n\nRincian Pembayaran:\n${priceLines.join('\n')}` : '';

    const textBody = [
        `NEW BOOKING — ATTENTIVE (${input.bookingCode})`,
        '',
        `Kode Booking: ${input.bookingCode}`,
        `Nama Lengkap: ${normalized.name}`,
        `Status Konsultasi: ${clientStatusLabel}`,
        `Nomor WhatsApp: ${normalized.whatsapp} (${normalized.whatsappE164})`,
        `Email: ${normalized.email}`,
        `Negara / Kota: ${normalized.countryRegion || dash}`,
        `Usia: ${normalized.age !== null ? String(normalized.age) : dash}`,
        `Jenis Kelamin: ${normalized.gender || dash}`,
        `Kategori Kebutuhan Utama: ${normalized.concernCategory || dash}`,
        `Catatan Klinis: ${clinicalRedactionNote}`,
        `Mode Konsultasi: ${modeLabel}`,
        `Lokasi/Cabang: ${branchLabel || dash}`,
        `Pilihan Psikolog: ${psychChoiceLabel}`,
        `Psikolog yang Dipilih: ${normalized.selectedPsychologistName || dash}`,
        `Pilihan Jadwal Utama: ${normalized.scheduleOption1}`,
        `Pilihan Jadwal Kedua: ${normalized.scheduleOption2 || dash}`,
        `Pilihan Jadwal Ketiga: ${normalized.scheduleOption3 || dash}`,
        `Target Admin WA: ${input.whatsappRouting.target} (${input.whatsappRouting.whatsappNumber})`,
        ...(priceSection ? [priceSection.trimStart()] : []),
        '',
        `Sumber Informasi: ${normalized.marketingSource || dash}`,
        `Perekomendasi: ${normalized.referrer || dash}`,
    ].join('\n');

    // Strict 22-column A:V Google Sheet mapping matching legacy Zite integration.
    const googleSheetRow = [
        '=ROW()-1',                                                   // A: No
        normalized.name,                                              // B: Name
        clientStatusLabel,                                            // C: Client Status
        normalized.whatsapp,                                          // D: WhatsApp
        normalized.email,                                             // E: Email
        normalized.countryRegion || '',                               // F: Country / Region
        normalized.age !== null ? String(normalized.age) : '',        // G: Age
        normalized.gender || '',                                      // H: Gender
        normalized.concernCategory || '',                             // I: Need Category
        hasClinicalNote || crisisFlagTriggered ? clinicalRedactionNote : '', // J: Redacted clinical ref
        modeLabel,                                                    // K: Consultation Mode
        branchLabel,                                                  // L: Location
        psychChoiceLabel,                                             // M: Psychologist Choice
        normalized.selectedPsychologistName || '',                    // N: Selected Psychologist
        normalized.scheduleOption1,                                   // O: Schedule Option 1
        normalized.scheduleOption2 || '',                             // P: Schedule Option 2
        normalized.scheduleOption3 || '',                             // Q: Schedule Option 3
        normalized.marketingSource || '',                             // R: Marketing Source
        normalized.referrer || '',                                    // S: Referrer
        'Pending',                                                    // T: Status
        normalized.language,                                          // U: Language
        formatWibTimestamp(input.submittedAt),                        // V: Submitted At
    ];

    return {
        event: 'booking.submitted',
        idempotencyKey,
        booking: {
            id: input.id,
            bookingCode: input.bookingCode,
            submittedAt: input.submittedAt,
            status: 'pending',
            language: normalized.language,
            clientStatus: normalized.clientStatus,
            name: normalized.name,
            whatsapp: normalized.whatsapp,
            whatsappE164: normalized.whatsappE164,
            email: normalized.email,
            countryRegion: normalized.countryRegion,
            age: normalized.age,
            gender: normalized.gender,
            serviceType: normalized.serviceType,
            concernId: normalized.concernId,
            concernCategory: normalized.concernCategory,
            clientCategory: normalized.clientCategory,
            genderPreference: normalized.genderPreference,
            hasClinicalNote,
            crisisFlagTriggered,
            consultationMode: normalized.consultationMode,
            location: normalized.location,
            psychologistChoice: normalized.psychologistChoice,
            psychologistId: normalized.psychologistId,
            psychologistSlug: normalized.psychologistSlug,
            selectedPsychologistName: normalized.selectedPsychologistName,
            scheduleOption1: normalized.scheduleOption1,
            scheduleOption2: normalized.scheduleOption2,
            scheduleOption3: normalized.scheduleOption3,
            baseRate: input.baseRate,
            assessmentFee: input.assessmentFee,
            totalRate: input.totalRate,
            marketingSource: normalized.marketingSource,
            referrer: normalized.referrer,
            utmSource: normalized.utmSource,
            utmMedium: normalized.utmMedium,
            utmCampaign: normalized.utmCampaign,
            utmContent: normalized.utmContent,
            utmTerm: normalized.utmTerm,
            campaignId: normalized.campaignId,
            adsetId: normalized.adsetId,
            adId: normalized.adId,
            whatsappRouting: input.whatsappRouting
        },
        notifications: {
            adminEmail: {
                to: 'contact@attentiveid.com',
                subject: `[NEW BOOKING] ${input.bookingCode} - ${normalized.name}`,
                textBody
            },
            googleSheetRow
        }
    };
};

export const signBookingWebhookPayload = (payloadJson: string, secret: string): string => {
    const digest = createHmac('sha256', secret).update(payloadJson).digest('hex');
    return `sha256=${digest}`;
};

const BACKOFF_SECONDS = [10, 30, 120, 600, 1800] as const;
const MAX_DELIVERY_ATTEMPTS = 5;

export const getRetryBackoffSeconds = (attempts: number): number => {
    const index = Math.max(0, Math.min(BACKOFF_SECONDS.length - 1, attempts - 1));
    return BACKOFF_SECONDS[index];
};

export interface DrainBookingOutboxOptions {
    db: PostgresJsDatabase<typeof schema>;
    webhookUrl?: string;
    webhookSecret?: string;
    batchSize?: number;
    fetchFn?: (url: string, init: RequestInit) => Promise<Response>;
    onError?: (error: unknown) => void;
}

export interface DrainBookingOutboxResult {
    claimed: number;
    delivered: number;
    failed: number;
    deadLettered: number;
    skippedUnconfigured: boolean;
}

interface ClaimedDeliveryRow {
    id: string;
    idempotency_key: string;
    payload_json: string;
    attempts: number;
}

export async function processDueBookingOutbox(options: DrainBookingOutboxOptions): Promise<DrainBookingOutboxResult> {
    const webhookUrl = options.webhookUrl?.trim();
    if (!webhookUrl) {
        return { claimed: 0, delivered: 0, failed: 0, deadLettered: 0, skippedUnconfigured: true };
    }

    const batchSize = Math.max(1, Math.min(50, options.batchSize ?? 10));
    const fetchImpl = options.fetchFn ?? fetch;

    const claimed = await options.db.execute(sql`
        with due as (
            select id
            from ${schema.bookingWebhookDeliveries}
            where status in ('pending', 'failed')
              and next_attempt_at <= now()
            order by next_attempt_at asc
            limit ${batchSize}
            for update skip locked
        )
        update ${schema.bookingWebhookDeliveries} as d
        set status = 'processing',
            attempts = d.attempts + 1,
            updated_at = now()
        from due
        where d.id = due.id
        returning d.id, d.idempotency_key, d.payload_json, d.attempts
    `) as unknown as ClaimedDeliveryRow[];

    let delivered = 0;
    let failed = 0;
    let deadLettered = 0;

    for (const row of claimed) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'X-Attentive-Idempotency-Key': row.idempotency_key
            };
            if (options.webhookSecret) {
                headers['X-Attentive-Signature'] = signBookingWebhookPayload(row.payload_json, options.webhookSecret);
            }

            const response = await fetchImpl(webhookUrl, {
                method: 'POST',
                headers,
                body: row.payload_json
            });

            if (response.ok) {
                await options.db.execute(sql`
                    update ${schema.bookingWebhookDeliveries}
                    set status = 'delivered',
                        delivered_at = now(),
                        last_error = null,
                        updated_at = now()
                    where id = ${row.id}
                `);
                delivered++;
                continue;
            }

            const responseSnippet = (await response.text().catch(() => '')).slice(0, 300);
            throw new Error(`HTTP ${response.status}${responseSnippet ? `: ${responseSnippet}` : ''}`);
        } catch (error) {
            options.onError?.(error);
            const message = error instanceof Error ? error.message.slice(0, 500) : 'Webhook delivery failed';
            const isDeadLetter = row.attempts >= MAX_DELIVERY_ATTEMPTS;
            const nextStatus = isDeadLetter ? 'dead_letter' : 'failed';
            const backoffSeconds = getRetryBackoffSeconds(row.attempts);

            await options.db.execute(sql`
                update ${schema.bookingWebhookDeliveries}
                set status = ${nextStatus},
                    last_error = ${message},
                    next_attempt_at = now() + (${backoffSeconds} * interval '1 second'),
                    updated_at = now()
                where id = ${row.id}
            `);

            if (isDeadLetter) {
                deadLettered++;
            } else {
                failed++;
            }
        }
    }

    return {
        claimed: claimed.length,
        delivered,
        failed,
        deadLettered,
        skippedUnconfigured: false
    };
}
