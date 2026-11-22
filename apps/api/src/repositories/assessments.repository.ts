import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { matchParticipant, normalizeParticipantEmail as normalizeEmail, normalizeParticipantPhone as normalizePhone } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { assessmentParticipants, assessmentPaymentProofs, assessmentSubmissions } from '../db/schema';

export type AssessmentInstrument = 'mhcu' | 'gsc';
export type AssessmentStatus = 'new' | 'reviewed' | 'released';

export const CODE_PREFIX: Record<AssessmentInstrument, string> = { mhcu: 'AT-MHCU-', gsc: 'AT-GSC-' };
/** The old Google Form used codes 001-099; the site starts at 100 so a code can never be issued twice. */
export const FIRST_SITE_SEQ = 100;

export interface NewAssessmentSubmission {
    instrument: AssessmentInstrument;
    lang: string;
    track: string;
    consentVersion: string;
    researchConsent: boolean;
    guardian: boolean;
    consentAck: string[];
    name: string;
    sex: string | null;
    age: number;
    phone: string;
    email: string;
    answers: unknown;
    scores: unknown;
    level: number | null;
    durationSec: number | null;
}

export type AssessmentRow = typeof assessmentSubmissions.$inferSelect;

export interface AssessmentListItem {
    id: string;
    code: string;
    instrument: string;
    name: string;
    age: number;
    email: string;
    phone: string;
    level: number | null;
    status: AssessmentStatus;
    researchConsent: boolean;
    createdAt: string;
}

export interface AssessmentsRepository {
    /**
     * Saves the submission and gives it the next code. When the same e-mail already sent the same answers within `dedupeMs`
     * (a double click, a retry) nothing new is saved and the earlier record is returned with `duplicate: true`. The check and the
     * insert happen under one lock, so two clicks arriving together cannot both be saved.
     */
    create(input: NewAssessmentSubmission, options?: { now?: Date; dedupeMs?: number }): Promise<{ id: string; code: string; duplicate: boolean; participantId: string | null; waveNo: number | null }>;
    list(instrument: AssessmentInstrument, options?: { status?: AssessmentStatus; limit?: number }): Promise<AssessmentListItem[]>;
    get(id: string): Promise<AssessmentRow | null>;
    review(id: string, input: { status: AssessmentStatus; note: string | null; reviewerId: string }): Promise<AssessmentRow | null>;
    /** One update for the whole batch (all rows or none); an error text marks them as failed for the portal to show. */
    markSheetSynced(ids: string[], error: string | null): Promise<void>;
    getByCode(code: string): Promise<AssessmentRow | null>;
    markResultEmailSent(id: string): Promise<void>;
    markAdminAlertSent(id: string): Promise<void>;
    /** Records what the participant says they paid for and keeps the proof of transfer (a screenshot or PDF) with it. */
    savePayment(id: string, input: { paymentFor: string; mimeType: string; data: Buffer }): Promise<void>;
    /** The latest proof of transfer for a submission, or null. */
    getProof(id: string): Promise<{ mimeType: string; data: Buffer } | null>;
    /** Oldest first: the rows that are not in the Google Sheet yet. */
    listUnsynced(instrument: AssessmentInstrument, limit: number): Promise<AssessmentRow[]>;
}

export const createAssessmentsRepository = (db: typeof defaultDb = defaultDb): AssessmentsRepository => ({
    async create(input, options = {}) {
        const now = options.now ?? new Date();
        // Jakarta calendar year, so a submission at 00:10 on 1 January belongs to the new year.
        const year = new Date(now.getTime() + 7 * 3600 * 1000).getUTCFullYear();
        // One at a time per instrument: the duplicate check, the next number and the insert all happen inside the same locked
        // transaction, so two people (or two clicks) submitting together can never get the same code or be saved twice.
        return db.transaction(async (tx) => {
            await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${'assessment-code:' + input.instrument}))`);
            if (options.dedupeMs) {
                const since = new Date(now.getTime() - options.dedupeMs).toISOString();
                const earlier = await tx
                    .select({ id: assessmentSubmissions.id, code: assessmentSubmissions.code })
                    .from(assessmentSubmissions)
                    .where(and(
                        eq(assessmentSubmissions.instrument, input.instrument),
                        sql`lower(${assessmentSubmissions.email}) = ${input.email.toLowerCase()}`,
                        sql`${assessmentSubmissions.createdAt} >= ${since}`,
                        sql`${assessmentSubmissions.answers} = ${JSON.stringify(input.answers)}::jsonb`
                    ))
                    .limit(1);
                if (earlier[0]) return { ...earlier[0], duplicate: true, participantId: null, waveNo: null };
            }
            // The same person (same e-mail, else same WhatsApp number) keeps one participant record across their check-ups,
            // and each check-up gets its number T1, T2... Only the Mental Health Check-Up follows people over time.
            let participantId: string | null = null;
            let waveNo: number | null = null;
            if (input.instrument === 'mhcu') {
                const emailNorm = normalizeEmail(input.email);
                const phoneNorm = normalizePhone(input.phone);
                const conditions = [
                    emailNorm ? eq(assessmentParticipants.emailNorm, emailNorm) : undefined,
                    phoneNorm ? eq(assessmentParticipants.phoneNorm, phoneNorm) : undefined
                ].filter((condition): condition is NonNullable<typeof condition> => condition !== undefined);
                const candidates = conditions.length
                    ? await tx.select().from(assessmentParticipants).where(or(...conditions))
                    : [];
                const match = matchParticipant(
                    candidates.map((p) => ({ participantId: p.id, emailNorm: p.emailNorm, phoneNorm: p.phoneNorm })),
                    { email: input.email, phone: input.phone }
                );
                const nowIso = now.toISOString();
                if (match) {
                    const [updated] = await tx
                        .update(assessmentParticipants)
                        .set({ nSessions: sql`${assessmentParticipants.nSessions} + 1`, lastSessionAt: nowIso })
                        .where(eq(assessmentParticipants.id, match.participantId))
                        .returning({ id: assessmentParticipants.id, nSessions: assessmentParticipants.nSessions });
                    participantId = updated.id;
                    waveNo = updated.nSessions;
                } else {
                    const [created] = await tx
                        .insert(assessmentParticipants)
                        .values({ emailNorm, phoneNorm, name: input.name, sex: input.sex, firstSessionAt: nowIso, lastSessionAt: nowIso, nSessions: 1 })
                        .returning({ id: assessmentParticipants.id });
                    participantId = created.id;
                    waveNo = 1;
                }
            }
            const rows = await tx.execute(sql`
                insert into assessment_submissions
                  (instrument, code, code_year, code_seq, lang, track, consent_version, research_consent, guardian, consent_ack,
                   name, sex, age, phone, email, answers, scores, level, duration_sec, participant_id, wave_no)
                select ${input.instrument},
                       ${CODE_PREFIX[input.instrument]} || ${year}::text || '-' || lpad(s.seq::text, 3, '0'),
                       ${year}, s.seq, ${input.lang}, ${input.track}, ${input.consentVersion}, ${input.researchConsent}, ${input.guardian},
                       ${JSON.stringify(input.consentAck)}::jsonb,
                       ${input.name}, ${input.sex}, ${input.age}, ${input.phone}, ${input.email},
                       ${JSON.stringify(input.answers)}::jsonb, ${JSON.stringify(input.scores)}::jsonb, ${input.level}, ${input.durationSec},
                       ${participantId}::uuid, ${waveNo}
                from (
                  select coalesce(max(code_seq), ${FIRST_SITE_SEQ - 1}) + 1 as seq
                  from assessment_submissions where instrument = ${input.instrument} and code_year = ${year}
                ) s
                returning id, code`);
            const row = (rows as unknown as { rows?: { id: string; code: string }[] }).rows?.[0] ?? (rows as unknown as { id: string; code: string }[])[0];
            if (!row) throw new Error('Insert returned no row');
            return { id: row.id, code: row.code, duplicate: false, participantId, waveNo };
        });
    },

    async list(instrument, options = {}) {
        const conditions = [eq(assessmentSubmissions.instrument, instrument)];
        if (options.status) conditions.push(eq(assessmentSubmissions.status, options.status));
        const rows = await db
            .select({
                id: assessmentSubmissions.id,
                code: assessmentSubmissions.code,
                instrument: assessmentSubmissions.instrument,
                name: assessmentSubmissions.name,
                age: assessmentSubmissions.age,
                email: assessmentSubmissions.email,
                phone: assessmentSubmissions.phone,
                level: assessmentSubmissions.level,
                status: assessmentSubmissions.status,
                researchConsent: assessmentSubmissions.researchConsent,
                createdAt: assessmentSubmissions.createdAt
            })
            .from(assessmentSubmissions)
            .where(and(...conditions))
            .orderBy(desc(assessmentSubmissions.createdAt))
            .limit(options.limit ?? 300);
        return rows as AssessmentListItem[];
    },

    async get(id) {
        const rows = await db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.id, id)).limit(1);
        return rows[0] ?? null;
    },

    async review(id, input) {
        const rows = await db
            .update(assessmentSubmissions)
            .set({
                status: input.status,
                reviewerNote: input.note,
                reviewerId: input.reviewerId,
                reviewedAt: sql`now()`,
                releasedAt: input.status === 'released' ? sql`now()` : null
            })
            .where(eq(assessmentSubmissions.id, id))
            .returning();
        return rows[0] ?? null;
    },

    async listUnsynced(instrument, limit) {
        return db
            .select()
            .from(assessmentSubmissions)
            .where(and(eq(assessmentSubmissions.instrument, instrument), sql`${assessmentSubmissions.sheetSyncedAt} is null`))
            .orderBy(assessmentSubmissions.createdAt)
            .limit(limit);
    },

    async getByCode(code) {
        const rows = await db.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.code, code)).limit(1);
        return rows[0] ?? null;
    },

    async markAdminAlertSent(id) {
        await db.update(assessmentSubmissions).set({ adminAlertAt: sql`now()` }).where(eq(assessmentSubmissions.id, id));
    },

    async markResultEmailSent(id) {
        await db.update(assessmentSubmissions).set({ resultEmailSentAt: sql`now()` }).where(eq(assessmentSubmissions.id, id));
    },

    async savePayment(id, input) {
        await db.transaction(async (tx) => {
            await tx.insert(assessmentPaymentProofs).values({ submissionId: id, mimeType: input.mimeType, byteSize: input.data.length, data: input.data });
            await tx
                .update(assessmentSubmissions)
                .set({ paymentFor: input.paymentFor, paymentSubmittedAt: sql`now()` })
                .where(eq(assessmentSubmissions.id, id));
        });
    },

    async getProof(id) {
        const rows = await db
            .select({ mimeType: assessmentPaymentProofs.mimeType, data: assessmentPaymentProofs.data })
            .from(assessmentPaymentProofs)
            .where(eq(assessmentPaymentProofs.submissionId, id))
            .orderBy(desc(assessmentPaymentProofs.createdAt))
            .limit(1);
        return rows[0] ?? null;
    },

    async markSheetSynced(ids, error) {
        if (ids.length === 0) return;
        await db
            .update(assessmentSubmissions)
            .set({ sheetSyncedAt: error ? null : sql`now()`, sheetError: error })
            .where(inArray(assessmentSubmissions.id, ids));
    }
});
