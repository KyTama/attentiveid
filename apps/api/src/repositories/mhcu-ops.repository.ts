import { and, eq, sql } from 'drizzle-orm';
import { db as defaultDb } from '../db';
import { assessmentSubmissions, siteSettings, users } from '../db/schema';
import { SETTINGS_KEY } from '../services/mhcu-settings';

export interface MhcuOverviewStats {
    sessions: number;
    participants: number;
    /** People with 2 or more check-ups. */
    returning: number;
    /** Count of results per level, index 0 = level 1. */
    levels: [number, number, number, number, number];
    meanMhi: number | null;
    /** Mean change in MHI from the first to the latest check-up, over people who came back. */
    meanChange: number | null;
    months: Array<{ m: string; n: number; mhi: number | null }>;
    unpaid: number;
    /** Proof of transfer received and not yet confirmed. */
    awaitingConfirmation: number;
    /** Notes not yet marked final (not counting old data). */
    notesToFinish: number;
    /** Paid or free and ready, but the report is not released yet. */
    readyNotReleased: number;
    notAssigned: number;
}

export interface MhcuOpsRepository {
    loadSettings(): Promise<unknown>;
    saveSettings(value: unknown): Promise<void>;
    /** Numbers for the overview tiles; a psychologist only counts the check-ups assigned to them. */
    overview(scope: { psychologistId?: string }): Promise<MhcuOverviewStats>;
    /** The portal psychologist with the fewest open check-ups (a returning person keeps theirs, handled by the caller). */
    pickPsychologist(): Promise<string | null>;
    /** The sign-in e-mail of the portal user linked to a psychologist profile (for the alert), if any. */
    psychologistEmail(psychologistId: string): Promise<string | null>;
}

const round1 = (value: number): number => Math.round(value * 10) / 10;

export const createMhcuOpsRepository = (db: typeof defaultDb = defaultDb): MhcuOpsRepository => ({
    async loadSettings() {
        const rows = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, SETTINGS_KEY)).limit(1);
        return rows[0]?.value ?? null;
    },

    async saveSettings(value) {
        await db
            .insert(siteSettings)
            .values({ key: SETTINGS_KEY, value: value as object })
            .onConflictDoUpdate({ target: siteSettings.key, set: { value: value as object, updatedAt: sql`now()` } });
    },

    async overview(scope) {
        const conditions = [eq(assessmentSubmissions.instrument, 'mhcu')];
        if (scope.psychologistId) conditions.push(eq(assessmentSubmissions.psychologistId, scope.psychologistId));
        const rows = await db
            .select({
                participantId: assessmentSubmissions.participantId,
                waveNo: assessmentSubmissions.waveNo,
                level: assessmentSubmissions.level,
                mhi: sql<number | null>`(${assessmentSubmissions.scores}->>'mhi')::float`,
                paymentStatus: assessmentSubmissions.paymentStatus,
                paymentSubmittedAt: assessmentSubmissions.paymentSubmittedAt,
                noteFinal: assessmentSubmissions.noteFinal,
                psychologistId: assessmentSubmissions.psychologistId,
                reportSentAt: assessmentSubmissions.reportSentAt,
                createdAt: assessmentSubmissions.createdAt
            })
            .from(assessmentSubmissions)
            .where(and(...conditions));

        const levels: [number, number, number, number, number] = [0, 0, 0, 0, 0];
        const byPerson = new Map<string, Array<{ wave: number; mhi: number | null }>>();
        const months = new Map<string, { n: number; sum: number; count: number }>();
        let mhiSum = 0;
        let mhiCount = 0;
        let unpaid = 0;
        let awaiting = 0;
        let notes = 0;
        let ready = 0;
        let notAssigned = 0;
        for (const row of rows) {
            if (typeof row.level === 'number' && row.level >= 1 && row.level <= 5) levels[row.level - 1] += 1;
            const mhi = typeof row.mhi === 'number' && Number.isFinite(row.mhi) ? row.mhi : null;
            if (mhi !== null) {
                mhiSum += mhi;
                mhiCount += 1;
            }
            if (row.participantId) {
                const list = byPerson.get(row.participantId) ?? [];
                list.push({ wave: row.waveNo ?? 0, mhi });
                byPerson.set(row.participantId, list);
            }
            const month = new Date(row.createdAt).toISOString().slice(0, 7);
            const bucket = months.get(month) ?? { n: 0, sum: 0, count: 0 };
            bucket.n += 1;
            if (mhi !== null) {
                bucket.sum += mhi;
                bucket.count += 1;
            }
            months.set(month, bucket);
            if (row.paymentStatus === 'UNPAID') {
                unpaid += 1;
                if (row.paymentSubmittedAt) awaiting += 1;
            }
            if (!row.noteFinal && row.paymentStatus !== 'LEGACY') notes += 1;
            if (['PAID', 'FREE', 'INCLUDED'].includes(row.paymentStatus) && !row.reportSentAt) ready += 1;
            if (!row.psychologistId) notAssigned += 1;
        }
        let returning = 0;
        let changeSum = 0;
        let changeCount = 0;
        for (const list of byPerson.values()) {
            if (list.length < 2) continue;
            returning += 1;
            const ordered = [...list].sort((a, b) => a.wave - b.wave);
            const first = ordered[0]?.mhi;
            const last = ordered[ordered.length - 1]?.mhi;
            if (typeof first === 'number' && typeof last === 'number') {
                changeSum += last - first;
                changeCount += 1;
            }
        }
        return {
            sessions: rows.length,
            participants: byPerson.size,
            returning,
            levels,
            meanMhi: mhiCount ? round1(mhiSum / mhiCount) : null,
            meanChange: changeCount ? round1(changeSum / changeCount) : null,
            months: [...months.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([m, v]) => ({ m, n: v.n, mhi: v.count ? round1(v.sum / v.count) : null })),
            unpaid,
            awaitingConfirmation: awaiting,
            notesToFinish: notes,
            readyNotReleased: ready,
            notAssigned
        };
    },

    async pickPsychologist() {
        const result = await db.execute(sql`
            select u.psychologist_id as id
            from ${users} u
            where u.role = 'psychologist' and u.status = 'active' and u.psychologist_id is not null
            order by (
                select count(*) from ${assessmentSubmissions} s
                where s.instrument = 'mhcu' and s.psychologist_id = u.psychologist_id and s.report_sent_at is null
            ) asc, u.psychologist_id asc
            limit 1`);
        const first = (result as unknown as Array<{ id: string | null }>)[0];
        return first?.id ?? null;
    },

    async psychologistEmail(psychologistId) {
        const rows = await db
            .select({ email: users.email })
            .from(users)
            .where(and(eq(users.psychologistId, psychologistId), eq(users.status, 'active')))
            .limit(1);
        return rows[0]?.email ?? null;
    }
});
