import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { db as defaultDb } from '../db';
import { assessmentSubmissions } from '../db/schema';

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
    create(input: NewAssessmentSubmission, options?: { now?: Date; dedupeMs?: number }): Promise<{ id: string; code: string; duplicate: boolean }>;
    list(instrument: AssessmentInstrument, options?: { status?: AssessmentStatus; limit?: number }): Promise<AssessmentListItem[]>;
    get(id: string): Promise<AssessmentRow | null>;
    review(id: string, input: { status: AssessmentStatus; note: string | null; reviewerId: string }): Promise<AssessmentRow | null>;
    /** One update for the whole batch (all rows or none); an error text marks them as failed for the portal to show. */
    markSheetSynced(ids: string[], error: string | null): Promise<void>;
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
                if (earlier[0]) return { ...earlier[0], duplicate: true };
            }
            const rows = await tx.execute(sql`
                insert into assessment_submissions
                  (instrument, code, code_year, code_seq, lang, track, consent_version, research_consent, guardian, consent_ack,
                   name, sex, age, phone, email, answers, scores, level, duration_sec)
                select ${input.instrument},
                       ${CODE_PREFIX[input.instrument]} || ${year}::text || '-' || lpad(s.seq::text, 3, '0'),
                       ${year}, s.seq, ${input.lang}, ${input.track}, ${input.consentVersion}, ${input.researchConsent}, ${input.guardian},
                       ${JSON.stringify(input.consentAck)}::jsonb,
                       ${input.name}, ${input.sex}, ${input.age}, ${input.phone}, ${input.email},
                       ${JSON.stringify(input.answers)}::jsonb, ${JSON.stringify(input.scores)}::jsonb, ${input.level}, ${input.durationSec}
                from (
                  select coalesce(max(code_seq), ${FIRST_SITE_SEQ - 1}) + 1 as seq
                  from assessment_submissions where instrument = ${input.instrument} and code_year = ${year}
                ) s
                returning id, code`);
            const row = (rows as unknown as { rows?: { id: string; code: string }[] }).rows?.[0] ?? (rows as unknown as { id: string; code: string }[])[0];
            if (!row) throw new Error('Insert returned no row');
            return { id: row.id, code: row.code, duplicate: false };
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

    async markSheetSynced(ids, error) {
        if (ids.length === 0) return;
        await db
            .update(assessmentSubmissions)
            .set({ sheetSyncedAt: error ? null : sql`now()`, sheetError: error })
            .where(inArray(assessmentSubmissions.id, ids));
    }
});
