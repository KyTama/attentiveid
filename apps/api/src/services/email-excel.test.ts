import { describe, expect, it } from 'bun:test';
import type { EmailCategory, EmailContact } from '@attentiveid/shared';
import { EXISTING_SHEET, NEW_SHEET, buildContactsWorkbook, planImport, readContactsWorkbook } from './email-excel';
import { XlsxError, readXlsx, writeXlsx, zip } from './xlsx';

const CATEGORIES: EmailCategory[] = [
    { id: 'c1', name: 'client', builtin: true, count: 2 },
    { id: 'c2', name: 'business', builtin: true, count: 0 }
];
const contact = (id: string, email: string, over: Partial<EmailContact> = {}): EmailContact => ({
    id, email, name: '', phone: '', categoryIds: ['c1'], source: 'manual', archivedAt: null,
    createdAt: '2026-11-26 10:00:00.000001+00', updatedAt: '2026-11-26 10:00:00.123456+00', ...over
});
const CONTACTS = [
    contact('id-1', 'budi@example.test', { name: 'Budi', phone: '0812 0000 0001' }),
    contact('id-2', 'sari@example.test', { name: 'Sari' }),
    contact('id-9', 'lama@example.test', { archivedAt: '2026-11-01T00:00:00Z' })
];

const HEAD = ['E-mail', 'Nama / Name', 'Telepon / Phone', 'Kategori / Category'];
const file = (fresh: string[][], existing: string[][] = []) =>
    writeXlsx([
        { name: NEW_SHEET, rows: [HEAD, ...fresh] },
        { name: EXISTING_SHEET, rows: [[...HEAD, 'ID', 'Versi'], ...existing] }
    ]);
const plan = (fresh: string[][], existing: string[][] = []) => planImport(readContactsWorkbook(file(fresh, existing)), CONTACTS, CATEGORIES);
const VERSION = CONTACTS[0]!.updatedAt;

describe('xlsx', () => {
    it('writes text cells that read back the same, including symbols and formula-like values', () => {
        const rows = [['a', 'b'], ['=1+1', '0812'], ['Tom & "Jerry" <x>', 'é 日本 😺'], ['', 'only second']];
        expect(readXlsx(writeXlsx([{ name: 'One', rows }]))[0]).toEqual({ name: 'One', rows });
        // Nothing is ever stored as a formula.
        expect(writeXlsx([{ name: 'One', rows }]).includes(Buffer.from('<f>'))).toBe(false);
    });

    it('refuses what is not a workbook', () => {
        for (const bad of [Buffer.from('email,name\n'), Buffer.alloc(0), Buffer.from('PK\u0003\u0004rubbish')]) {
            expect(() => readXlsx(bad)).toThrow(XlsxError);
        }
    });

    it('refuses unclosed tags quickly instead of searching the file again and again', () => {
        const evil = writeXlsx([{ name: 'One', rows: [['a']] }, { name: 'Two', rows: [['b']] }]);
        expect(readXlsx(evil)).toHaveLength(2);
        // A hand-made workbook whose sheet is two hundred thousand opening tags that never close.
        const sheet = '<row>'.repeat(200_000);
        const entries: Array<[string, string]> = [
            ['xl/workbook.xml', '<workbook><sheets><sheet name="One" r:id="r1"/></sheets></workbook>'],
            ['xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="r1" Target="worksheets/s.xml"/></Relationships>'],
            ['xl/worksheets/s.xml', sheet]
        ];
        const started = Date.now();
        expect(() => readXlsx(zip(entries))).toThrow('not_xlsx');
        expect(Date.now() - started).toBeLessThan(2000);
    });

    it('stops at the limits', () => {
        const big = writeXlsx([{ name: 'One', rows: Array.from({ length: 50 }, () => ['x'.repeat(2000)]) }]);
        expect(() => readXlsx(big, { maxUnpackedBytes: 20_000 })).toThrow('too_big');
        expect(() => readXlsx(big, { maxRows: 10 })).toThrow('too_many_rows');
    });
});

describe('contact import plan', () => {
    it('an exported file that was not edited changes nothing', () => {
        const rows = readContactsWorkbook(buildContactsWorkbook(CONTACTS.slice(0, 2), CATEGORIES));
        const result = planImport(rows, CONTACTS, CATEGORIES);
        expect(result.unchanged).toBe(2);
        expect([result.added, result.edited, result.overlapping, result.invalid, result.conflicts]).toEqual([[], [], [], [], []]);
    });

    it('new rows: defaults to client, creates unknown categories, keeps the leading 0', () => {
        const result = plan([
            ['Andi@Example.test', 'Andi', '81200000077', ''],
            ['mitra@example.test', '', '', 'Business; Mitra Sekolah']
        ]);
        expect(result.added.map((r) => [r.email, r.phone, r.categories])).toEqual([
            ['andi@example.test', '081200000077', ['client']],
            ['mitra@example.test', '', ['business', 'Mitra Sekolah']]
        ]);
        expect(result.newCategories).toEqual(['Mitra Sekolah']);
    });

    it('warns about the same address or phone; only a shared phone may be added anyway', () => {
        const result = plan([
            ['budi@example.test', '', '', ''],
            ['lama@example.test', '', '', ''],
            ['x@example.test', '', '+62 812-0000-0001', ''],
            ['y@example.test', '', '', ''],
            ['y@example.test', '', '', ''],
            ['z@example.test', '', '081299999999', ''],
            ['w@example.test', '', '+6281299999999', 'Baru Sekali']
        ]);
        expect(result.added.map((r) => r.email)).toEqual(['y@example.test', 'z@example.test']);
        expect(result.overlapping.map((r) => [r.email, r.reason, r.canInclude])).toEqual([
            ['budi@example.test', 'email_exists', false],
            ['lama@example.test', 'email_archived', false],
            ['x@example.test', 'phone_exists', true],
            ['y@example.test', 'email_in_file', false],
            ['w@example.test', 'phone_in_file', true]
        ]);
    });

    it('edited existing rows update that contact; an empty category keeps its own', () => {
        const result = plan([], [['budi@example.test', 'Budi Santoso', '0812 0000 0001', '', 'id-1', VERSION]]);
        expect(result.edited).toHaveLength(1);
        expect(result.edited[0]).toMatchObject({ contactId: 'id-1', changed: ['name'], categories: ['client'], row: 2, sheet: 'existing' });
    });

    it('does not overwrite a contact changed after the download, or take another contact\'s address', () => {
        const stale = plan([], [['budi@example.test', 'Lain', '', 'client', 'id-1', '2026-11-20 09:00:00+00']]);
        expect(stale.conflicts.map((r) => r.email)).toEqual(['budi@example.test']);
        expect(stale.edited).toEqual([]);
        const taken = plan([], [['sari@example.test', 'Budi', '', 'client', 'id-1', VERSION]]);
        expect(taken.overlapping.map((r) => r.reason)).toEqual(['email_exists']);
    });

    it('reports bad rows with their row number, and ignores empty ones', () => {
        const result = plan(
            [['not-an-address', 'A', '', ''], [], ['a@example.test', '', 'telepon saya', ''], ['b@example.test', '', '', 'x'.repeat(41)]],
            [['c@example.test', '', '', '', 'gone', VERSION]]
        );
        expect(result.invalid.map((r) => [r.key, r.reason])).toEqual([
            ['existing:2', 'unknown_id'],
            ['new:2', 'email'],
            ['new:4', 'phone'],
            ['new:5', 'category']
        ]);
    });

    it('a tiny file whose rows all point at one huge category text is refused quickly', () => {
        // One 4 MB shared string, referenced by every row: small on disk, enormous if each row split it.
        const cell = (ref: string, index: number) => '<c r="' + ref + '" t="s"><v>' + index + '</v></c>';
        const rows = Array.from({ length: 3000 }, (_, i) => '<row r="' + (i + 2) + '">' + cell('A' + (i + 2), 2) + cell('D' + (i + 2), 1) + '</row>').join('');
        const data = zip([
            ['xl/workbook.xml', '<workbook><sheets><sheet name="' + NEW_SHEET + '" r:id="r1"/></sheets></workbook>'],
            ['xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="r1" Target="worksheets/s.xml"/></Relationships>'],
            ['xl/sharedStrings.xml', '<sst><si><t>E-mail</t></si><si><t>' + 'a;'.repeat(2_000_000) + '</t></si><si><t>p@example.test</t></si><si><t>Kategori</t></si></sst>'],
            ['xl/worksheets/s.xml', '<worksheet><sheetData><row r="1">' + cell('A1', 0) + cell('D1', 3) + '</row>' + rows + '</sheetData></worksheet>']
        ]);
        expect(data.length).toBeLessThan(60_000);
        const started = Date.now();
        const read = readContactsWorkbook(data);
        const result = planImport(read, CONTACTS, CATEGORIES);
        expect(Date.now() - started).toBeLessThan(3000);
        expect(read[0]!.categories.length).toBeLessThanOrEqual(2001);
        expect(result.invalid).toHaveLength(3000);
        expect(result.added).toHaveLength(0);
    });

    it('a file that is mostly empty rows is refused', () => {
        const data = zip([
            ['xl/workbook.xml', '<workbook><sheets><sheet name="One" r:id="r1"/></sheets></workbook>'],
            ['xl/_rels/workbook.xml.rels', '<Relationships><Relationship Id="r1" Target="worksheets/s.xml"/></Relationships>'],
            ['xl/worksheets/s.xml', '<row/>'.repeat(200_000)]
        ]);
        expect(() => readXlsx(data)).toThrow('too_many_rows');
    });

    it('a changed existing row without its version is a conflict, not an overwrite', () => {
        const result = plan([], [['budi@example.test', 'Lain', '0812 0000 0001', 'client', 'id-1', '']]);
        expect(result.conflicts.map((r) => r.email)).toEqual(['budi@example.test']);
        expect(result.edited).toEqual([]);
    });

    it('a file without our sheets or without an e-mail column is refused', () => {
        expect(() => readContactsWorkbook(writeXlsx([{ name: 'Sheet1', rows: [HEAD] }]))).toThrow(XlsxError);
        expect(() => readContactsWorkbook(writeXlsx([{ name: NEW_SHEET, rows: [['Nama']] }]))).toThrow(XlsxError);
    });
});
