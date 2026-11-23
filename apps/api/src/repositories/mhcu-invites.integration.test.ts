import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { createAssessmentsRepository, InviteUnavailableError, type NewAssessmentSubmission } from './assessments.repository';
import { createMhcuInvitesRepository } from './mhcu-invites.repository';

/**
 * Real PostgreSQL 16: the invitation race, package credits and the track rules.
 * Runs only against a disposable database named attentiveid_test_* (the same guard as the shared-content integration test).
 */
const databaseUrl = process.env.DATABASE_URL;
const databaseName = databaseUrl ? new URL(databaseUrl).pathname.slice(1) : '';
const isDisposable = Boolean(databaseUrl && /^attentiveid_test_[a-z0-9_]+$/.test(databaseName));
const describeIntegration = isDisposable ? describe : describe.skip;

const client = isDisposable ? postgres(databaseUrl!, { max: 12 }) : (null as unknown as ReturnType<typeof postgres>);
const database = isDisposable ? drizzle(client, { schema }) : (null as unknown as ReturnType<typeof drizzle>);
const assessments = createAssessmentsRepository(database as never);
const invites = createMhcuInvitesRepository(database as never);

const PSY = '00000000-0000-4000-8000-0000000000aa';
const PSY_2 = '00000000-0000-4000-8000-0000000000bb';

let counter = 0;
const person = (overrides: Partial<NewAssessmentSubmission> = {}): NewAssessmentSubmission => {
    counter += 1;
    return {
        instrument: 'mhcu',
        lang: 'id',
        track: 'mandiri',
        consentVersion: 'MHCU-IC-ID/EN-2026.11',
        researchConsent: true,
        guardian: false,
        consentAck: [],
        name: `Tester ${counter}`,
        sex: null,
        age: 30,
        phone: `0812000${String(counter).padStart(5, '0')}`,
        email: `tester${counter}@example.test`,
        answers: { n: counter },
        scores: { mhi: 60, level: 2 },
        level: 2,
        durationSec: 100,
        ...overrides
    };
};
const submissionOf = async (id: string) => (await database.select().from(schema.assessmentSubmissions).where(eq(schema.assessmentSubmissions.id, id)))[0]!;
const participantOf = async (id: string) => (await database.select().from(schema.assessmentParticipants).where(eq(schema.assessmentParticipants.id, id)))[0]!;

beforeAll(async () => {
    if (!isDisposable) return;
    await database.execute(sql`truncate assessment_submissions, assessment_participants, assessment_invites, assessment_audit restart identity cascade`);
});
afterAll(async () => {
    if (isDisposable && client) await client.end();
});

describeIntegration('MHCU invitations, tracks and package quotas on PostgreSQL', () => {
    test('runs only against the disposable database', async () => {
        const rows = await client<{ name: string }[]>`select current_database() as name`;
        expect(rows[0]?.name).toBe(databaseName);
    });

    test('migration 0023 created the tables and columns', async () => {
        const tables = await client<{ table_name: string }[]>`select table_name from information_schema.tables where table_schema = 'public' and table_name in ('assessment_invites','assessment_audit')`;
        expect(tables.map((t) => t.table_name).sort()).toEqual(['assessment_audit', 'assessment_invites']);
        const columns = await client<{ column_name: string }[]>`select column_name from information_schema.columns where table_name = 'assessment_submissions' and column_name in ('invite_id','price_due','credit_used','credits_granted')`;
        expect(columns).toHaveLength(4);
        const track = await client<{ conname: string }[]>`select conname from pg_constraint where conname = 'assessment_submissions_track'`;
        expect(track).toHaveLength(1);
    });

    describe('track rules', () => {
        test('a new person on the public link is mandiri, UNPAID, with the single price due and no psychologist', async () => {
            const created = await assessments.create(person());
            const row = await submissionOf(created.id);
            expect(created.track).toBe('mandiri');
            expect(row).toMatchObject({ track: 'mandiri', paymentStatus: 'UNPAID', creditUsed: false, psychologistId: null, inviteId: null, waveNo: 1 });
            expect(row.priceDue).toBeGreaterThan(0);
            const info = await assessments.getParticipant(created.participantId!);
            expect(info).toMatchObject({ creditsRemaining: 0, creditsTotal: 0, trackOrigin: 'mandiri', psychologistId: null });
        });

        test('claims in the input cannot create another track: the repository decides', async () => {
            const created = await assessments.create(person({ track: 'asesmen' }));
            expect(created.track).toBe('mandiri');
            expect((await submissionOf(created.id)).paymentStatus).toBe('UNPAID');
        });

        test('an asesmen invitation: track from the invite, INCLUDED, Rp 150.000, the invite psychologist, invitation used up', async () => {
            const invite = await invites.create({ track: 'asesmen', psychologistId: PSY, clientName: 'A', createdBy: null });
            expect(invite.code).toMatch(/^INV\d{4}$/);
            expect(invite.token).toMatch(/^[0-9a-f]{16}$/);
            const created = await assessments.create(person({ inviteToken: invite.token }));
            const row = await submissionOf(created.id);
            expect(row).toMatchObject({ track: 'asesmen', paymentStatus: 'INCLUDED', paymentAmount: 150000, priceDue: 0, psychologistId: PSY, inviteId: invite.id });
            expect(row.paidAt).not.toBeNull();
            const used = await invites.get(invite.id);
            expect(used).toMatchObject({ status: 'USED', usedSubmissionId: created.id });
            expect(used?.usedAt).not.toBeNull();
            const info = await assessments.getParticipant(created.participantId!);
            expect(info).toMatchObject({ trackOrigin: 'asesmen', psychologistId: PSY });
        });

        test('a free invitation gives track free and payment FREE', async () => {
            const invite = await invites.create({ track: 'free', psychologistId: PSY_2, createdBy: null });
            const created = await assessments.create(person({ inviteToken: invite.token }));
            expect(await submissionOf(created.id)).toMatchObject({ track: 'free', paymentStatus: 'FREE', paymentAmount: 0, priceDue: 0, psychologistId: PSY_2 });
        });

        test('a returning client from an invitation continues as lanjutan with the same psychologist and no price yet', async () => {
            const invite = await invites.create({ track: 'asesmen', psychologistId: PSY, createdBy: null });
            const first = person({ inviteToken: invite.token });
            const t1 = await assessments.create(first);
            const t2 = await assessments.create({ ...first, inviteToken: null, answers: { again: 1 } });
            expect(t2.waveNo).toBe(2);
            const row = await submissionOf(t2.id);
            expect(row).toMatchObject({ track: 'lanjutan', paymentStatus: 'UNPAID', psychologistId: PSY, priceDue: null });
            expect(await submissionOf(t1.id)).toMatchObject({ track: 'asesmen' });
        });

        test('a returning mandiri person stays mandiri, even once a psychologist was assigned (team demo: P00002 T4, P00006 T2)', async () => {
            const first = person();
            const t1 = await assessments.create(first);
            await assessments.setPayment(t1.id, { status: 'PAID', package: '1x', amount: null, ref: null });
            await assessments.assign(t1.id, PSY);
            const t2 = await assessments.create({ ...first, answers: { again: 2 } });
            expect(await submissionOf(t2.id)).toMatchObject({ track: 'mandiri', paymentStatus: 'UNPAID' });
        });

        test('the person is matched by WhatsApp number when the e-mail is new', async () => {
            const first = person();
            const t1 = await assessments.create(first);
            const t2 = await assessments.create({ ...first, email: 'new.address@example.test', answers: { other: 1 } });
            expect(t2.participantId).toBe(t1.participantId);
            expect(t2.waveNo).toBe(2);
        });

        test('setPrice works only for lanjutan, rejects other tracks, and the audit trail holds no personal data', async () => {
            const invite = await invites.create({ track: 'free', psychologistId: PSY, createdBy: null });
            const first = person({ inviteToken: invite.token });
            await assessments.create(first);
            const t2 = await assessments.create({ ...first, inviteToken: null, answers: { p: 1 } });
            const ok = await assessments.setPrice(t2.id, 200000);
            expect(ok.status).toBe('ok');
            expect((await submissionOf(t2.id)).priceDue).toBe(200000);
            const mandiri = await assessments.create(person());
            expect((await assessments.setPrice(mandiri.id, 1000)).status).toBe('wrongTrack');
            expect((await assessments.setPrice('00000000-0000-4000-8000-00000000dead', 1000)).status).toBe('notFound');
            await assessments.audit({ actor: null, action: 'price', submissionId: t2.id, detail: '200000' });
            const rows = await database.select().from(schema.assessmentAudit);
            expect(rows).toHaveLength(1);
            expect(rows[0]).toMatchObject({ action: 'price', submissionId: t2.id, detail: '200000' });
        });
    });

    describe('invitation race and one-time use', () => {
        test('two concurrent uses of one token: exactly one wins, the other stores nothing', async () => {
            const invite = await invites.create({ track: 'asesmen', psychologistId: PSY, createdBy: null });
            const before = (await database.select({ n: sql<number>`count(*)::int` }).from(schema.assessmentSubmissions))[0]!.n;
            const results = await Promise.allSettled([
                assessments.create(person({ inviteToken: invite.token })),
                assessments.create(person({ inviteToken: invite.token }))
            ]);
            const won = results.filter((r) => r.status === 'fulfilled');
            const lost = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
            expect(won).toHaveLength(1);
            expect(lost).toHaveLength(1);
            expect(lost[0]!.reason).toBeInstanceOf(InviteUnavailableError);
            const after = (await database.select({ n: sql<number>`count(*)::int` }).from(schema.assessmentSubmissions))[0]!.n;
            expect(after).toBe(before + 1);
            const used = await invites.get(invite.id);
            expect(used?.status).toBe('USED');
            const linked = await database.select({ n: sql<number>`count(*)::int` }).from(schema.assessmentSubmissions).where(eq(schema.assessmentSubmissions.inviteId, invite.id));
            expect(linked[0]!.n).toBe(1);
        });

        test('twelve concurrent uses of one token: still exactly one winner', async () => {
            const invite = await invites.create({ track: 'free', psychologistId: PSY, createdBy: null });
            const results = await Promise.allSettled(Array.from({ length: 12 }, () => assessments.create(person({ inviteToken: invite.token }))));
            expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
            expect(results.filter((r) => r.status === 'rejected')).toHaveLength(11);
        });

        test('a used, cancelled or unknown token is refused and the participant is not created', async () => {
            const used = await invites.create({ track: 'asesmen', psychologistId: PSY, createdBy: null });
            await assessments.create(person({ inviteToken: used.token }));
            const cancelled = await invites.create({ track: 'free', psychologistId: PSY, createdBy: null });
            expect(await invites.cancel(cancelled.id)).toBe('cancelled');
            const participantsBefore = (await database.select({ n: sql<number>`count(*)::int` }).from(schema.assessmentParticipants))[0]!.n;
            for (const token of [used.token, cancelled.token, 'abcdef0123456789']) {
                await expect(assessments.create(person({ inviteToken: token }))).rejects.toBeInstanceOf(InviteUnavailableError);
            }
            const participantsAfter = (await database.select({ n: sql<number>`count(*)::int` }).from(schema.assessmentParticipants))[0]!.n;
            expect(participantsAfter).toBe(participantsBefore);
        });

        test('cancelling: only OPEN works, USED and already cancelled give notOpen, unknown gives notFound', async () => {
            const open = await invites.create({ track: 'asesmen', psychologistId: PSY, createdBy: null });
            expect(await invites.cancel(open.id)).toBe('cancelled');
            expect(await invites.cancel(open.id)).toBe('notOpen');
            const usedInvite = await invites.create({ track: 'free', psychologistId: PSY, createdBy: null });
            await assessments.create(person({ inviteToken: usedInvite.token }));
            expect(await invites.cancel(usedInvite.id)).toBe('notOpen');
            expect(await invites.cancel('00000000-0000-4000-8000-00000000dead')).toBe('notFound');
        });

        test('a double click (same e-mail and answers) does not consume an invitation twice', async () => {
            const invite = await invites.create({ track: 'asesmen', psychologistId: PSY, createdBy: null });
            const input = person({ inviteToken: invite.token });
            const first = await assessments.create(input, { dedupeMs: 30 * 60 * 1000 });
            const second = await assessments.create(input, { dedupeMs: 30 * 60 * 1000 });
            expect(first.duplicate).toBe(false);
            expect(second.duplicate).toBe(true);
            expect(second.code).toBe(first.code);
        });

        test('lookup tells only validity, track, name and language', async () => {
            const invite = await invites.create({ track: 'free', psychologistId: PSY, clientName: 'Budi', clientEmail: 'budi@example.test', phone: '0812', note: 'secret', lang: 'en', createdBy: null });
            expect(await invites.lookup(invite.token)).toEqual({ valid: true, track: 'free', clientName: 'Budi', lang: 'en' });
            expect(await invites.lookup('nothex')).toEqual({ valid: false });
            expect(await invites.lookup('0000000000000000')).toEqual({ valid: false });
            await invites.cancel(invite.id);
            expect(await invites.lookup(invite.token)).toEqual({ valid: false });
        });

        test('list is newest first with the INV number', async () => {
            const a = await invites.create({ track: 'free', psychologistId: PSY, createdBy: null });
            const b = await invites.create({ track: 'free', psychologistId: PSY, createdBy: null });
            const list = await invites.list(5);
            expect(list[0]?.id).toBe(b.id);
            expect(list[1]?.id).toBe(a.id);
            expect(Number(b.code.slice(3))).toBe(Number(a.code.slice(3)) + 1);
        });
    });

    describe('package of 3 credits', () => {
        const buyPackage = async (first: NewAssessmentSubmission) => {
            const t1 = await assessments.create(first);
            await assessments.setPayment(t1.id, { status: 'PAID', package: '3x', amount: null, ref: null });
            return t1;
        };

        test('paying a package of 3 gives 3 credits bought, 2 left (this check-up is the first); the default amount is the bundle price', async () => {
            const t1 = await buyPackage(person());
            const info = await assessments.getParticipant(t1.participantId!);
            expect(info).toMatchObject({ creditsTotal: 3, creditsRemaining: 2 });
            const row = await submissionOf(t1.id);
            expect(row).toMatchObject({ paymentStatus: 'PAID', paymentPackage: '3x', creditsGranted: 3 });
            expect(row.paymentAmount).toBeGreaterThanOrEqual(647000);
        });

        test('saving the same payment again never adds credits twice', async () => {
            const t1 = await buyPackage(person());
            for (let i = 0; i < 3; i++) await assessments.setPayment(t1.id, { status: 'PAID', package: '3x', amount: 647000, ref: 'ref' });
            expect(await assessments.getParticipant(t1.participantId!)).toMatchObject({ creditsTotal: 3, creditsRemaining: 2 });
        });

        test('the next two check-ups use a credit each (track paket, PAID, credit used), the third falls back to mandiri', async () => {
            const first = person();
            const t1 = await buyPackage(first);
            const t2 = await assessments.create({ ...first, answers: { a: 2 } });
            expect(t2).toMatchObject({ track: 'paket', paymentStatus: 'PAID', creditsRemaining: 1, creditUsed: true });
            expect(await submissionOf(t2.id)).toMatchObject({ track: 'paket', paymentStatus: 'PAID', paymentPackage: '3x', paymentAmount: 0, priceDue: 0, creditUsed: true });
            const t3 = await assessments.create({ ...first, answers: { a: 3 } });
            expect(t3).toMatchObject({ track: 'paket', creditsRemaining: 0 });
            const t4 = await assessments.create({ ...first, answers: { a: 4 } });
            expect(t4.track).toBe('mandiri');
            expect(await assessments.getParticipant(t1.participantId!)).toMatchObject({ creditsTotal: 3, creditsRemaining: 0 });
        });

        test('concurrent check-ups never use more credits than the person has', async () => {
            const first = person();
            await buyPackage(first);
            const results = await Promise.all(Array.from({ length: 6 }, (_, i) => assessments.create({ ...first, answers: { race: i } })));
            expect(results.filter((r) => r.track === 'paket')).toHaveLength(2);
            expect(results.filter((r) => r.track === 'mandiri')).toHaveLength(4);
            const info = await assessments.getParticipant(results[0]!.participantId!);
            expect(info?.creditsRemaining).toBe(0);
            expect(info?.creditsTotal).toBe(3);
        });

        test('undoing the payment takes the credits back, never below zero', async () => {
            const t1 = await buyPackage(person());
            await assessments.setPayment(t1.id, { status: 'UNPAID', package: null, amount: null, ref: null });
            expect(await assessments.getParticipant(t1.participantId!)).toMatchObject({ creditsTotal: 0, creditsRemaining: 0 });
            expect((await submissionOf(t1.id)).creditsGranted).toBe(0);
        });

        test('a single report (1x) gives no credits, and a package on a non-mandiri check-up gives none either', async () => {
            const single = await assessments.create(person());
            await assessments.setPayment(single.id, { status: 'PAID', package: '1x', amount: null, ref: null });
            expect(await assessments.getParticipant(single.participantId!)).toMatchObject({ creditsTotal: 0, creditsRemaining: 0 });
            const invite = await invites.create({ track: 'asesmen', psychologistId: PSY, createdBy: null });
            const invited = await assessments.create(person({ inviteToken: invite.token }));
            await assessments.setPayment(invited.id, { status: 'PAID', package: '3x', amount: null, ref: null });
            expect(await assessments.getParticipant(invited.participantId!)).toMatchObject({ creditsTotal: 0, creditsRemaining: 0 });
        });

        test('a package paid on a mandiri check-up of a returning person keeps their psychologist', async () => {
            const invite = await invites.create({ track: 'free', psychologistId: PSY_2, createdBy: null });
            const first = person({ inviteToken: invite.token });
            await assessments.create(first);
            const t2 = await assessments.create({ ...first, inviteToken: null, answers: { x: 1 } });
            expect(t2.track).toBe('lanjutan');
            await assessments.setPayment(t2.id, { status: 'PAID', package: '1x', amount: 200000, ref: null });
            expect((await submissionOf(t2.id)).psychologistId).toBe(PSY_2);
            expect((await participantOf(t2.participantId!)).psychologistId).toBe(PSY_2);
        });
    });
});
