import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { matchParticipant, normalizeParticipantEmail as normalizeEmail, normalizeParticipantPhone as normalizePhone } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { assessmentAudit, assessmentInvites, assessmentParticipants, assessmentPaymentProofs, assessmentSubmissions, psychologistProfiles, psychologists } from '../db/schema';
import { priceFor } from '../services/assessment-payment';
import { creditDelta, decideTrack, PACKAGE_SIZE, type TrackDecision } from '../services/mhcu-tracks';
import { withCredential } from '../services/psychologist-title';

export type AssessmentInstrument = 'mhcu' | 'gsc';
export type AssessmentStatus = 'new' | 'reviewed' | 'released';

export const CODE_PREFIX: Record<AssessmentInstrument, string> = { mhcu: 'AT-MHCU-', gsc: 'AT-GSC-' };
/** The old Google Form used codes 001-099; the site starts at 100 so a code can never be issued twice. */
export const FIRST_SITE_SEQ = 100;

/** The invitation link is unknown, already used or cancelled. Thrown inside the saving transaction, so nothing is stored. */
export class InviteUnavailableError extends Error {
    constructor() {
        super('invite-unavailable');
        this.name = 'InviteUnavailableError';
    }
}

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
    /** The ?invite= token of the form (Mental Health Check-Up only). A valid open token decides the track and is used up by this very insert. */
    inviteToken?: string | null;
}

export interface CreatedAssessment {
    id: string;
    code: string;
    duplicate: boolean;
    participantId: string | null;
    waveNo: number | null;
    /** The track this check-up got (the fixture of older tests may leave these out). */
    track?: string;
    paymentStatus?: string;
    priceDue?: number | null;
    psychologistId?: string | null;
    /** Credits of the person's package left after this check-up. */
    creditsRemaining?: number;
    creditUsed?: boolean;
}

export interface AuditEntry {
    /** The staff user (or null for the system). */
    actor: string | null;
    action: string;
    submissionId?: string | null;
    /** A short text without names, e-mail addresses, phone numbers or scores. */
    detail?: string | null;
}

export type SetPriceResult = { status: 'ok'; row: AssessmentRow } | { status: 'notFound' } | { status: 'wrongTrack' };

export interface ParticipantInfo {
    participantNo: number;
    creditsRemaining: number;
    creditsTotal: number;
    psychologistId: string | null;
    trackOrigin: string | null;
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
    psychologistId: string | null;
    track: string;
    paymentStatus: string;
    paymentSubmittedAt: string | null;
    paymentFor: string | null;
    waveNo: number | null;
    createdAt: string;
}

export interface AssessmentsRepository {
    /**
     * Saves the submission and gives it the next code. When the same e-mail already sent the same answers within `dedupeMs`
     * (a double click, a retry) nothing new is saved and the earlier record is returned with `duplicate: true`. The check and the
     * insert happen under one lock, so two clicks arriving together cannot both be saved.
     */
    create(input: NewAssessmentSubmission, options?: { now?: Date; dedupeMs?: number }): Promise<CreatedAssessment>;
    list(instrument: AssessmentInstrument, options?: { status?: AssessmentStatus; limit?: number; psychologistId?: string }): Promise<AssessmentListItem[]>;
    get(id: string): Promise<AssessmentRow | null>;
    review(id: string, input: { status: AssessmentStatus; note: string | null; reviewerId: string }): Promise<AssessmentRow | null>;
    /** One update for the whole batch (all rows or none); an error text marks them as failed for the portal to show. */
    markSheetSynced(ids: string[], error: string | null): Promise<void>;
    getByCode(code: string): Promise<AssessmentRow | null>;
    markResultEmailSent(id: string): Promise<void>;
    markAdminAlertSent(id: string): Promise<void>;
    /** All check-ups of one person (oldest first), with the person's printed number (P00001). */
    listHistory(participantId: string): Promise<Array<AssessmentRow & { participantNo: number }>>;
    /** The psychologists a result can be assigned to. */
    listPsychologists(): Promise<Array<{ id: string; name: string }>>;
    getPsychologistName(id: string): Promise<string | null>;
    /** Assigns (or clears) the psychologist of a check-up; the person keeps the same psychologist for later check-ups. */
    assign(id: string, psychologistId: string | null): Promise<AssessmentRow | null>;
    /** `templateEn` / `customEn` left out (an older client) keeps what is stored; null clears it. */
    saveNote(id: string, input: { template: string | null; custom: string | null; templateEn?: string | null; customEn?: string | null; final: boolean; userId: string }): Promise<AssessmentRow | null>;
    /**
     * Staff confirm (or undo) a payment. A confirmed package of 3 on a 'mandiri' check-up gives the person 3 credits (this check-up is the
     * first, so 2 are left); saving the same payment again adds nothing, and moving it back to UNPAID takes the credits back.
     */
    setPayment(id: string, input: { status: string; package: string | null; amount: number | null; ref: string | null }): Promise<AssessmentRow | null>;
    /** The psychologist's price for a 'lanjutan' check-up. */
    setPrice(id: string, price: number): Promise<SetPriceResult>;
    /** The person behind a check-up: package credits, psychologist and how they first arrived. */
    getParticipant(participantId: string): Promise<ParticipantInfo | null>;
    /** Writes one row of the staff audit trail. Never throws into the caller's flow: a failed audit row is logged by the caller if it wants to. */
    audit(entry: AuditEntry): Promise<void>;
    /**
     * Permanently removes one result with its proof of transfer (owner only). The person's record is removed too when this was their only
     * result, otherwise its counters are recalculated. Returns what was removed, or null when it does not exist.
     */
    deleteSubmission(id: string): Promise<{ code: string; instrument: string } | null>;
    markReportReleased(id: string): Promise<AssessmentRow | null>;
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
            // An invitation is used up by this very insert: one conditional update, so of two uses of one link exactly one wins and
            // the other rolls the whole transaction back (nothing is stored, the link is not consumed twice).
            let invite: { id: string; track: 'asesmen' | 'free'; psychologistId: string } | null = null;
            if (input.instrument === 'mhcu' && input.inviteToken) {
                const used = await tx
                    .update(assessmentInvites)
                    .set({ status: 'USED', usedAt: sql`now()` })
                    .where(and(eq(assessmentInvites.token, input.inviteToken), eq(assessmentInvites.status, 'OPEN')))
                    .returning({ id: assessmentInvites.id, track: assessmentInvites.track, psychologistId: assessmentInvites.psychologistId });
                if (!used[0]) throw new InviteUnavailableError();
                invite = { id: used[0].id, track: used[0].track as 'asesmen' | 'free', psychologistId: used[0].psychologistId };
            }
            // The same person (same e-mail, else same WhatsApp number) keeps one participant record across their check-ups,
            // and each check-up gets its number T1, T2... Only the Mental Health Check-Up follows people over time.
            let participantId: string | null = null;
            let waveNo: number | null = null;
            let decision: TrackDecision | null = null;
            let creditsRemaining = 0;
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
                const known = match ? candidates.find((p) => p.id === match.participantId) ?? null : null;
                const asParticipant = (p: NonNullable<typeof known>, credits = p.creditsRemaining) => ({ creditsRemaining: credits, psychologistId: p.psychologistId, trackOrigin: p.trackOrigin });
                decision = decideTrack({ invite, participant: known ? asParticipant(known) : null, today: now });
                const nowIso = now.toISOString();
                if (known) {
                    if (decision.creditUsed) {
                        // Take one credit only if one is still there; if it is gone the person falls back to the next track.
                        const taken = await tx
                            .update(assessmentParticipants)
                            .set({ creditsRemaining: sql`${assessmentParticipants.creditsRemaining} - 1` })
                            .where(and(eq(assessmentParticipants.id, known.id), sql`${assessmentParticipants.creditsRemaining} > 0`))
                            .returning({ creditsRemaining: assessmentParticipants.creditsRemaining });
                        if (!taken[0]) decision = decideTrack({ invite: null, participant: asParticipant(known, 0), today: now });
                    }
                    const [updated] = await tx
                        .update(assessmentParticipants)
                        .set({
                            nSessions: sql`${assessmentParticipants.nSessions} + 1`,
                            lastSessionAt: nowIso,
                            ...(invite ? { psychologistId: invite.psychologistId, trackOrigin: invite.track } : {})
                        })
                        .where(eq(assessmentParticipants.id, known.id))
                        .returning({ id: assessmentParticipants.id, nSessions: assessmentParticipants.nSessions, creditsRemaining: assessmentParticipants.creditsRemaining });
                    participantId = updated.id;
                    waveNo = updated.nSessions;
                    creditsRemaining = updated.creditsRemaining;
                } else {
                    const [created] = await tx
                        .insert(assessmentParticipants)
                        .values({
                            emailNorm,
                            phoneNorm,
                            name: input.name,
                            sex: input.sex,
                            firstSessionAt: nowIso,
                            lastSessionAt: nowIso,
                            nSessions: 1,
                            psychologistId: invite?.psychologistId ?? null,
                            trackOrigin: invite?.track ?? 'mandiri'
                        })
                        .returning({ id: assessmentParticipants.id });
                    participantId = created.id;
                    waveNo = 1;
                }
            }
            const d: TrackDecision = decision ?? {
                track: input.track as TrackDecision['track'],
                paymentStatus: 'UNPAID',
                paymentPackage: null,
                paymentAmount: null,
                priceDue: null,
                psychologistId: null,
                creditUsed: false
            };
            const settled = d.paymentStatus !== 'UNPAID';
            const rows = await tx.execute(sql`
                insert into assessment_submissions
                  (instrument, code, code_year, code_seq, lang, track, consent_version, research_consent, guardian, consent_ack,
                   name, sex, age, phone, email, answers, scores, level, duration_sec, participant_id, wave_no,
                   payment_status, payment_package, payment_amount, paid_at, price_due, psychologist_id, credit_used, invite_id)
                select ${input.instrument},
                       ${CODE_PREFIX[input.instrument]} || ${year}::text || '-' || lpad(s.seq::text, 3, '0'),
                       ${year}, s.seq, ${input.lang}, ${d.track}, ${input.consentVersion}, ${input.researchConsent}, ${input.guardian},
                       ${JSON.stringify(input.consentAck)}::jsonb,
                       ${input.name}, ${input.sex}, ${input.age}, ${input.phone}, ${input.email},
                       ${JSON.stringify(input.answers)}::jsonb, ${JSON.stringify(input.scores)}::jsonb, ${input.level}, ${input.durationSec},
                       ${participantId}::uuid, ${waveNo},
                       ${d.paymentStatus}, ${d.paymentPackage}, ${d.paymentAmount}, ${settled ? sql`now()` : sql`null`}, ${d.priceDue},
                       ${d.psychologistId}::uuid, ${d.creditUsed}, ${invite?.id ?? null}::uuid
                from (
                  select coalesce(max(code_seq), ${FIRST_SITE_SEQ - 1}) + 1 as seq
                  from assessment_submissions where instrument = ${input.instrument} and code_year = ${year}
                ) s
                returning id, code`);
            const row = (rows as unknown as { rows?: { id: string; code: string }[] }).rows?.[0] ?? (rows as unknown as { id: string; code: string }[])[0];
            if (!row) throw new Error('Insert returned no row');
            if (invite) await tx.update(assessmentInvites).set({ usedSubmissionId: row.id }).where(eq(assessmentInvites.id, invite.id));
            return {
                id: row.id,
                code: row.code,
                duplicate: false,
                participantId,
                waveNo,
                track: d.track,
                paymentStatus: d.paymentStatus,
                priceDue: d.priceDue,
                psychologistId: d.psychologistId,
                creditsRemaining,
                creditUsed: d.creditUsed
            };
        });
    },

    async list(instrument, options = {}) {
        const conditions = [eq(assessmentSubmissions.instrument, instrument)];
        if (options.status) conditions.push(eq(assessmentSubmissions.status, options.status));
        if (options.psychologistId) conditions.push(eq(assessmentSubmissions.psychologistId, options.psychologistId));
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
                psychologistId: assessmentSubmissions.psychologistId,
                track: assessmentSubmissions.track,
                paymentStatus: assessmentSubmissions.paymentStatus,
                paymentSubmittedAt: assessmentSubmissions.paymentSubmittedAt,
                paymentFor: assessmentSubmissions.paymentFor,
                waveNo: assessmentSubmissions.waveNo,
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

    async listHistory(participantId) {
        const rows = await db
            .select({ row: assessmentSubmissions, participantNo: assessmentParticipants.participantNo })
            .from(assessmentSubmissions)
            .innerJoin(assessmentParticipants, eq(assessmentParticipants.id, assessmentSubmissions.participantId))
            .where(eq(assessmentSubmissions.participantId, participantId))
            .orderBy(assessmentSubmissions.waveNo, assessmentSubmissions.createdAt);
        return rows.map((r) => ({ ...r.row, participantNo: r.participantNo }));
    },

    async listPsychologists() {
        return db.select({ id: psychologists.id, name: psychologists.name }).from(psychologists).orderBy(psychologists.name);
    },

    async getPsychologistName(id) {
        // The name as printed on reports and e-mails: with the professional title (gelar) from the psychologist's profile.
        const rows = await db
            .select({ name: psychologists.name, credential: psychologistProfiles.credential })
            .from(psychologists)
            .leftJoin(psychologistProfiles, eq(psychologistProfiles.psychologistId, psychologists.id))
            .where(eq(psychologists.id, id))
            .limit(1);
        return rows[0] ? withCredential(rows[0].name, rows[0].credential) : null;
    },

    async assign(id, psychologistId) {
        return db.transaction(async (tx) => {
            const rows = await tx.update(assessmentSubmissions).set({ psychologistId }).where(eq(assessmentSubmissions.id, id)).returning();
            const row = rows[0];
            if (row?.participantId) {
                await tx.update(assessmentParticipants).set({ psychologistId }).where(eq(assessmentParticipants.id, row.participantId));
            }
            return row ?? null;
        });
    },

    async saveNote(id, input) {
        const rows = await db
            .update(assessmentSubmissions)
            .set({
                noteTemplate: input.template,
                noteCustom: input.custom,
                ...(input.templateEn !== undefined ? { noteTemplateEn: input.templateEn } : {}),
                ...(input.customEn !== undefined ? { noteCustomEn: input.customEn } : {}),
                noteFinal: input.final,
                noteUpdatedBy: input.userId,
                noteUpdatedAt: sql`now()`
            })
            .where(eq(assessmentSubmissions.id, id))
            .returning();
        return rows[0] ?? null;
    },

    async setPayment(id, input) {
        return db.transaction(async (tx) => {
            const current = (await tx.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.id, id)).for('update'))[0];
            if (!current) return null;
            const settled = input.status !== 'UNPAID';
            // A confirmed payment without an amount gets the price of what was bought (single report or package of 3).
            const amount = input.amount ?? (input.status === 'PAID' ? priceFor(input.package === '3x' ? 'package3' : 'single') : null);
            // Only a 'mandiri' check-up can buy a package; PAID is what counts, UNPAID or another status gives the credits back.
            const wanted = current.track === 'mandiri' && input.status === 'PAID' && input.package === '3x' ? PACKAGE_SIZE : 0;
            const delta = creditDelta(current.creditsGranted, wanted);
            let psychologistId = current.psychologistId;
            if (!psychologistId && settled && current.participantId) {
                // A returning person keeps their psychologist.
                const person = (await tx.select({ psychologistId: assessmentParticipants.psychologistId }).from(assessmentParticipants).where(eq(assessmentParticipants.id, current.participantId)))[0];
                psychologistId = person?.psychologistId ?? null;
            }
            const rows = await tx
                .update(assessmentSubmissions)
                .set({
                    paymentStatus: input.status,
                    paymentPackage: input.package,
                    paymentAmount: amount,
                    paymentRef: input.ref,
                    paidAt: settled ? sql`coalesce(${assessmentSubmissions.paidAt}, now())` : null,
                    creditsGranted: wanted,
                    psychologistId
                })
                .where(eq(assessmentSubmissions.id, id))
                .returning();
            if ((delta.total !== 0 || delta.remaining !== 0) && current.participantId) {
                await tx
                    .update(assessmentParticipants)
                    .set({
                        creditsTotal: sql`greatest(0, ${assessmentParticipants.creditsTotal} + ${delta.total})`,
                        creditsRemaining: sql`greatest(0, ${assessmentParticipants.creditsRemaining} + ${delta.remaining})`
                    })
                    .where(eq(assessmentParticipants.id, current.participantId));
            }
            return rows[0] ?? null;
        });
    },

    async setPrice(id, price) {
        const rows = await db
            .update(assessmentSubmissions)
            .set({ priceDue: price })
            .where(and(eq(assessmentSubmissions.id, id), eq(assessmentSubmissions.instrument, 'mhcu'), eq(assessmentSubmissions.track, 'lanjutan')))
            .returning();
        if (rows[0]) return { status: 'ok', row: rows[0] };
        const exists = await db.select({ id: assessmentSubmissions.id }).from(assessmentSubmissions).where(eq(assessmentSubmissions.id, id)).limit(1);
        return exists[0] ? { status: 'wrongTrack' } : { status: 'notFound' };
    },

    async getParticipant(participantId) {
        const rows = await db
            .select({
                participantNo: assessmentParticipants.participantNo,
                creditsRemaining: assessmentParticipants.creditsRemaining,
                creditsTotal: assessmentParticipants.creditsTotal,
                psychologistId: assessmentParticipants.psychologistId,
                trackOrigin: assessmentParticipants.trackOrigin
            })
            .from(assessmentParticipants)
            .where(eq(assessmentParticipants.id, participantId))
            .limit(1);
        return rows[0] ?? null;
    },

    async deleteSubmission(id) {
        return db.transaction(async (tx) => {
            const rows = await tx.select().from(assessmentSubmissions).where(eq(assessmentSubmissions.id, id)).limit(1);
            const row = rows[0];
            if (!row) return null;
            await tx.delete(assessmentPaymentProofs).where(eq(assessmentPaymentProofs.submissionId, id));
            // An invitation that was used for this result no longer points at it.
            await tx.update(assessmentInvites).set({ usedSubmissionId: null }).where(eq(assessmentInvites.usedSubmissionId, id));
            await tx.delete(assessmentSubmissions).where(eq(assessmentSubmissions.id, id));
            if (row.participantId) {
                const [rest] = await tx
                    .select({ n: sql<number>`count(*)`, first: sql<string | null>`min(${assessmentSubmissions.createdAt})`, last: sql<string | null>`max(${assessmentSubmissions.createdAt})` })
                    .from(assessmentSubmissions)
                    .where(eq(assessmentSubmissions.participantId, row.participantId));
                if (Number(rest?.n ?? 0) === 0) {
                    await tx.delete(assessmentParticipants).where(eq(assessmentParticipants.id, row.participantId));
                } else {
                    await tx.update(assessmentParticipants).set({ nSessions: Number(rest.n), firstSessionAt: rest.first, lastSessionAt: rest.last }).where(eq(assessmentParticipants.id, row.participantId));
                }
            }
            return { code: row.code, instrument: row.instrument };
        });
    },

    async audit(entry) {
        await db.insert(assessmentAudit).values({ actor: entry.actor, action: entry.action, submissionId: entry.submissionId ?? null, detail: entry.detail ?? null });
    },

    async markReportReleased(id) {
        const rows = await db
            .update(assessmentSubmissions)
            .set({ status: 'released', releasedAt: sql`coalesce(${assessmentSubmissions.releasedAt}, now())`, reportSentAt: sql`now()` })
            .where(eq(assessmentSubmissions.id, id))
            .returning();
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
