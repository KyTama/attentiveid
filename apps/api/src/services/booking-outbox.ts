import { createHmac } from 'node:crypto';
import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    BOOKING_SHEET_LOCATION_VALUES,
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
    notifyEmail?: string;
}

export const BOOKING_SHEET_COLUMN_HEADERS = [
    'Name',
    'Client Status',
    'WhatsApp',
    'Email',
    'Country / Region',
    'Age',
    'Gender',
    'Need Category',
    'Concern Note',
    'Consultation Mode',
    'Location',
    'Psychologist Choice',
    'Selected Psychologist',
    'Schedule Option 1',
    'Schedule Option 2',
    'Schedule Option 3',
    'Marketing Source',
    'Referrer',
    'Status',
    'Language',
    'Submitted At',
    'Booking Code',
    'Base Rate',
    'Assessment Fee',
    'Total Rate',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign'
] as const;

export type BookingSheetColumnHeader = (typeof BOOKING_SHEET_COLUMN_HEADERS)[number];

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
        googleSheetColumns: Record<BookingSheetColumnHeader, string>;
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
 * Builds the transactional outbox JSON payload for Google Sheets / Gmail / optional n8n webhook.
 * Preserves column J (`Concern Note`) and operational email notes as-is for operational dispatch
 * while PostgreSQL booking_clinical_intakes remains isolated from general CMS admin queues.
 */
export const buildBookingWebhookPayload = (input: OutboxPayloadBuildInput): BookingWebhookPayload => {
    const { normalized } = input;
    const idempotencyKey = `booking.submitted:${input.id}`;
    const hasClinicalNote = Boolean(normalized.concernNote);
    const crisisFlagTriggered = normalized.crisisFlagTriggered;
    const dash = '—';

    const sheetLocation = normalized.location ? BOOKING_SHEET_LOCATION_VALUES[normalized.location] : '';
    const clientStatusLabel = normalized.clientStatus === 'new' ? 'Klien baru' : 'Klien lama';
    const modeLabel = normalized.consultationMode === 'online' ? 'Online' : 'Offline';
    const psychChoiceLabel = PSYCH_CHOICE_LABELS[normalized.psychologistChoice];
    const submittedWib = formatWibTimestamp(input.submittedAt);

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
        `Catatan: ${normalized.concernNote || dash}`,
        `Mode Konsultasi: ${modeLabel}`,
        `Lokasi/Cabang: ${sheetLocation || dash}`,
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

    const googleSheetColumns: Record<BookingSheetColumnHeader, string> = {
        Name: normalized.name,
        'Client Status': clientStatusLabel,
        WhatsApp: normalized.whatsapp,
        Email: normalized.email,
        'Country / Region': normalized.countryRegion || '',
        Age: normalized.age !== null ? String(normalized.age) : '',
        Gender: normalized.gender || '',
        'Need Category': normalized.concernCategory || '',
        'Concern Note': normalized.concernNote || '',
        'Consultation Mode': modeLabel,
        Location: sheetLocation,
        'Psychologist Choice': psychChoiceLabel,
        'Selected Psychologist': normalized.selectedPsychologistName || '',
        'Schedule Option 1': normalized.scheduleOption1,
        'Schedule Option 2': normalized.scheduleOption2 || '',
        'Schedule Option 3': normalized.scheduleOption3 || '',
        'Marketing Source': normalized.marketingSource || '',
        Referrer: normalized.referrer || '',
        Status: 'Pending',
        Language: normalized.language,
        'Submitted At': submittedWib,
        'Booking Code': input.bookingCode,
        'Base Rate': input.baseRate > 0 ? String(input.baseRate) : '',
        'Assessment Fee': input.assessmentFee > 0 ? String(input.assessmentFee) : '',
        'Total Rate': input.totalRate > 0 ? String(input.totalRate) : '',
        'UTM Source': normalized.utmSource || '',
        'UTM Medium': normalized.utmMedium || '',
        'UTM Campaign': normalized.utmCampaign || '',
    };

    // Strict 29-column A:AC mapping (legacy A:V + Booking Code/Rates/UTM W:AC).
    const googleSheetRow = [
        '=ROW()-1',
        ...BOOKING_SHEET_COLUMN_HEADERS.map((header) => googleSheetColumns[header])
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
                to: input.notifyEmail?.trim() || 'contact@attentiveid.com',
                subject: `[NEW BOOKING] ${input.bookingCode} - ${normalized.name}`,
                textBody
            },
            googleSheetRow,
            googleSheetColumns
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

export interface GoogleBookingSyncConfig {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    spreadsheetId: string;
    sheetName?: string;
    notifyEmail?: string;
    sendEmail?: boolean;
}

export interface DrainBookingOutboxOptions {
    db: PostgresJsDatabase<typeof schema>;
    webhookUrl?: string;
    webhookSecret?: string;
    google?: GoogleBookingSyncConfig;
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

let cachedGoogleToken: { cacheKey: string; accessToken: string; expiresAtMs: number } | null = null;

const getGoogleAccessToken = async (
    config: GoogleBookingSyncConfig,
    fetchImpl: (url: string, init: RequestInit) => Promise<Response>,
    useCache: boolean
): Promise<string> => {
    const cacheKey = `${config.clientId}:${config.refreshToken.slice(-8)}`;
    if (useCache && cachedGoogleToken && cachedGoogleToken.cacheKey === cacheKey && cachedGoogleToken.expiresAtMs > Date.now() + 60_000) {
        return cachedGoogleToken.accessToken;
    }

    const tokenResponse = await fetchImpl('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: config.refreshToken,
            grant_type: 'refresh_token'
        }).toString()
    });

    const tokenData = await tokenResponse.json().catch(() => null) as { access_token?: string; expires_in?: number; error_description?: string; error?: string } | null;
    if (!tokenResponse.ok || !tokenData?.access_token) {
        const detail = tokenData?.error_description || tokenData?.error || `HTTP ${tokenResponse.status}`;
        throw new Error(`Google OAuth token exchange failed: ${detail}`);
    }

    if (useCache) {
        const ttlSeconds = typeof tokenData.expires_in === 'number' && tokenData.expires_in > 0 ? tokenData.expires_in : 3600;
        cachedGoogleToken = {
            cacheKey,
            accessToken: tokenData.access_token,
            expiresAtMs: Date.now() + ttlSeconds * 1000
        };
    }

    return tokenData.access_token;
};

const formatSheetRange = (sheetName: string, range: string): string => {
    const escaped = sheetName.replace(/'/g, "''");
    return `'${escaped}'!${range}`;
};

const toColumnLetter = (columnNumber: number): string => {
    let n = Math.max(1, columnNumber);
    let result = '';
    while (n > 0) {
        const rem = (n - 1) % 26;
        result = String.fromCharCode(65 + rem) + result;
        n = Math.floor((n - 1) / 26);
    }
    return result;
};

const resolveSheetColumns = (payload: BookingWebhookPayload): Record<string, string> => {
    if (payload.notifications.googleSheetColumns && typeof payload.notifications.googleSheetColumns === 'object') {
        return payload.notifications.googleSheetColumns;
    }
    const row = payload.notifications.googleSheetRow ?? [];
    const fallback: Record<string, string> = {};
    BOOKING_SHEET_COLUMN_HEADERS.forEach((header, idx) => {
        fallback[header] = row[idx + 1] ?? '';
    });
    return fallback;
};

export const alignBookingRowToHeaders = (
    headers: string[],
    columns: Record<string, string>
): string[] => {
    const normalizedValues = new Map<string, string>();
    for (const [key, value] of Object.entries(columns)) {
        normalizedValues.set(key.trim().toLowerCase(), value);
    }

    return headers.map((header, index) => {
        const key = header.trim().toLowerCase();
        if (key === 'no' || (index === 0 && key === '')) {
            return '=ROW()-1';
        }
        if (!key) {
            return '';
        }
        return normalizedValues.get(key) ?? '';
    });
};

export function normalizeGoogleSheetId(raw: string): string {
    const trimmed = raw.trim();
    const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return urlMatch?.[1] ?? trimmed;
}

export const deliverBookingToGoogle = async (
    payload: BookingWebhookPayload,
    config: GoogleBookingSyncConfig,
    fetchImpl: (url: string, init: RequestInit) => Promise<Response> = fetch,
    useCache = true
): Promise<void> => {
    const accessToken = await getGoogleAccessToken(config, fetchImpl, useCache);
    const sheetName = config.sheetName?.trim() || 'Sheet1';
    const sheetId = encodeURIComponent(normalizeGoogleSheetId(config.spreadsheetId));
    const authHeaders = {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    // 1. Read row 1 headers so editor column shifts/inserts never misalign fields
    const headerReadRange = encodeURIComponent(formatSheetRange(sheetName, 'A1:AZ1'));
    const headerRes = await fetchImpl(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${headerReadRange}`,
        { method: 'GET', headers: authHeaders }
    );
    if (!headerRes.ok) {
        const snippet = (await headerRes.text().catch(() => '')).slice(0, 300);
        throw new Error(`Google Sheets header read failed: HTTP ${headerRes.status}${snippet ? `: ${snippet}` : ''}`);
    }
    const headerJson = await headerRes.json().catch(() => null) as { values?: unknown[][] } | null;
    const rawFirstRow = Array.isArray(headerJson?.values?.[0]) ? headerJson.values[0] : [];
    let activeHeaders = rawFirstRow.map((cell) => String(cell ?? ''));

    const columnMap = resolveSheetColumns(payload);
    const existingSet = new Set(activeHeaders.map((h) => h.trim().toLowerCase()).filter(Boolean));
    const missingHeaders = Object.keys(columnMap).filter((h) => !existingSet.has(h.trim().toLowerCase()));

    if (activeHeaders.length === 0) {
        activeHeaders = ['', ...Object.keys(columnMap)];
    } else if (missingHeaders.length > 0) {
        activeHeaders = [...activeHeaders, ...missingHeaders];
    }

    if (rawFirstRow.length === 0 || missingHeaders.length > 0) {
        const headerWriteRange = encodeURIComponent(formatSheetRange(sheetName, 'A1'));
        const updateHeaderRes = await fetchImpl(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${headerWriteRange}?valueInputOption=RAW`,
            {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify({
                    range: formatSheetRange(sheetName, 'A1'),
                    majorDimension: 'ROWS',
                    values: [activeHeaders]
                })
            }
        );
        if (!updateHeaderRes.ok) {
            const snippet = (await updateHeaderRes.text().catch(() => '')).slice(0, 300);
            throw new Error(`Google Sheets header update failed: HTTP ${updateHeaderRes.status}${snippet ? `: ${snippet}` : ''}`);
        }
    }

    // 2. Append aligned row spanning the full header width so empty A1 never misleads table detection
    const alignedRow = alignBookingRowToHeaders(activeHeaders, columnMap);
    const lastColumnLetter = toColumnLetter(activeHeaders.length);
    const appendRange = encodeURIComponent(formatSheetRange(sheetName, `A1:${lastColumnLetter}1`));
    const appendRes = await fetchImpl(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                majorDimension: 'ROWS',
                values: [alignedRow]
            })
        }
    );
    if (!appendRes.ok) {
        const snippet = (await appendRes.text().catch(() => '')).slice(0, 300);
        throw new Error(`Google Sheets append failed: HTTP ${appendRes.status}${snippet ? `: ${snippet}` : ''}`);
    }

    // 3. Send operational admin notification via Gmail REST API
    if (config.sendEmail !== false) {
        const safeTo = (config.notifyEmail?.trim() || payload.notifications.adminEmail.to || 'contact@attentiveid.com')
            .replace(/[\r\n]/g, ' ');
        const safeSubject = payload.notifications.adminEmail.subject.replace(/[\r\n]/g, ' ');
        const encodedSubject = `=?UTF-8?B?${Buffer.from(safeSubject, 'utf8').toString('base64')}?=`;
        const rawMime = [
            `To: ${safeTo}`,
            `Subject: ${encodedSubject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset="UTF-8"',
            '',
            payload.notifications.adminEmail.textBody.replace(/\r?\n/g, '\r\n')
        ].join('\r\n');
        const encodedRaw = Buffer.from(rawMime, 'utf8').toString('base64url');

        const gmailRes = await fetchImpl(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ raw: encodedRaw })
            }
        );
        if (!gmailRes.ok) {
            const snippet = (await gmailRes.text().catch(() => '')).slice(0, 300);
            throw new Error(`Gmail API send failed: HTTP ${gmailRes.status}${snippet ? `: ${snippet}` : ''}`);
        }
    }
};

export async function processDueBookingOutbox(options: DrainBookingOutboxOptions): Promise<DrainBookingOutboxResult> {
    const webhookUrl = options.webhookUrl?.trim();
    const googleConfig =
        options.google?.clientId &&
        options.google?.clientSecret &&
        options.google?.refreshToken &&
        options.google?.spreadsheetId
            ? options.google
            : undefined;

    if (!webhookUrl && !googleConfig) {
        return { claimed: 0, delivered: 0, failed: 0, deadLettered: 0, skippedUnconfigured: true };
    }

    const batchSize = Math.max(1, Math.min(50, options.batchSize ?? 10));
    const fetchImpl = options.fetchFn ?? fetch;
    const useTokenCache = !options.fetchFn;

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
            if (googleConfig) {
                const payload = JSON.parse(row.payload_json) as BookingWebhookPayload;
                await deliverBookingToGoogle(payload, googleConfig, fetchImpl, useTokenCache);
            }

            if (webhookUrl) {
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

                if (!response.ok) {
                    const responseSnippet = (await response.text().catch(() => '')).slice(0, 300);
                    throw new Error(`HTTP ${response.status}${responseSnippet ? `: ${responseSnippet}` : ''}`);
                }
            }

            await options.db.execute(sql`
                update ${schema.bookingWebhookDeliveries}
                set status = 'delivered',
                    delivered_at = now(),
                    last_error = null,
                    updated_at = now()
                where id = ${row.id}
            `);
            delivered++;
        } catch (error) {
            options.onError?.(error);
            const message = error instanceof Error ? error.message.slice(0, 500) : 'Outbox delivery failed';
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
