import { afterAll, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import postgres from 'postgres';
import { MHCU_LEVELS } from '@attentiveid/shared';
import * as schema from '../db/schema';
import { createAssessmentsRepository } from './assessments.repository';
import { recommendationOf } from '../services/mhcu-report-service';

/**
 * Real PostgreSQL: the backfill of migration 0026. Old results of people who filled in the form in English must print the same
 * English (and Indonesian) paragraph as before. Runs only against a disposable database named attentiveid_test_*.
 */
const databaseUrl = process.env.DATABASE_URL;
const isDisposable = Boolean(databaseUrl && /^attentiveid_test_[a-z0-9_]+$/.test(new URL(databaseUrl).pathname.slice(1)));
const describeIntegration = isDisposable ? describe : describe.skip;
const client = isDisposable ? postgres(databaseUrl!, { max: 2 }) : (null as unknown as ReturnType<typeof postgres>);
const database = isDisposable ? drizzle(client, { schema }) : (null as unknown as ReturnType<typeof drizzle>);

const migration = readFileSync(new URL('../../drizzle/0026_mhcu_note_english.sql', import.meta.url), 'utf8');
const backfill = migration.split('--> statement-breakpoint').map((part) => part.replace(/^\s*--.*$/gm, '').trim()).find((part) => part.startsWith('UPDATE'))!;

afterAll(async () => {
    if (isDisposable && client) await client.end();
});

describeIntegration('migration 0026 backfill on PostgreSQL', () => {
    /** What the report printed before this change: one set of fields for both languages. */
    const before = (row: { noteTemplate: string | null; noteCustom: string | null }, level: 1 | 2 | 3 | 4 | 5, lang: 'id' | 'en') =>
        [row.noteTemplate?.trim() || (lang === 'en' ? MHCU_LEVELS[level].actionEn : MHCU_LEVELS[level].actionId), row.noteCustom?.trim()].filter(Boolean).join(' ');

    test('copies the note of English-language results only, keeps the originals, and the reports print exactly as before', async () => {
        const repository = createAssessmentsRepository(database as never);
        let n = 0;
        const make = async (lang: 'id' | 'en', template: string | null, custom: string | null, instrument: 'mhcu' | 'gsc' = 'mhcu') => {
            n += 1;
            const created = await repository.create({ instrument, lang, track: 'mandiri', consentVersion: 'v', researchConsent: true, guardian: false, consentAck: [], name: `Backfill ${n}`, sex: null, age: 30, phone: `0813000${String(n).padStart(5, '0')}`, email: `backfill${n}-${Date.now()}@example.test`, answers: { n }, scores: {}, level: 3, durationSec: 1 });
            await database.update(schema.assessmentSubmissions).set({ noteTemplate: template, noteCustom: custom, noteTemplateEn: null, noteCustomEn: null }).where(eq(schema.assessmentSubmissions.id, created.id));
            return created.id;
        };
        const longest = 'x'.repeat(500);
        const longTemplate = 'My advice. '.repeat(363);
        const ids = {
            both: await make('en', 'My own recommendation.', 'Sleep well.'),
            customOnly: await make('en', null, longest),
            templateOnly: await make('en', longTemplate, null),
            none: await make('en', null, null),
            indonesian: await make('id', 'Teks.', 'Catatan.'),
            gsc: await make('en', null, 'Not an MHCU note.', 'gsc')
        };
        await database.execute(sql.raw(backfill));
        const row = async (id: string) => (await database.select().from(schema.assessmentSubmissions).where(eq(schema.assessmentSubmissions.id, id)))[0]!;

        for (const id of [ids.both, ids.customOnly, ids.templateOnly, ids.none]) {
            const after = await row(id);
            expect(after.noteTemplateEn).toBe(after.noteTemplate);
            expect(after.noteCustomEn).toBe(after.noteCustom);
            for (const lang of ['en', 'id'] as const) expect(recommendationOf(after, 3, lang)).toBe(before(after, 3, lang));
        }
        expect((await row(ids.customOnly)).noteCustomEn).toHaveLength(500);
        expect((await row(ids.both)).noteTemplate).toBe('My own recommendation.');
        for (const id of [ids.indonesian, ids.gsc]) {
            const untouched = await row(id);
            expect(untouched.noteTemplateEn).toBeNull();
            expect(untouched.noteCustomEn).toBeNull();
        }
        // nothing longer than 500 can exist: the old column has had the same limit since 0022
        const tooLong = async () => { await database.update(schema.assessmentSubmissions).set({ noteCustom: 'x'.repeat(501) }).where(eq(schema.assessmentSubmissions.id, ids.none)); };
        await expect(tooLong()).rejects.toThrow();
    });
});
