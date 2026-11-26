/**
 * The contact list as an Excel file, and what an edited file would change. Two sheets: "Baru - New" (empty, for new people)
 * and "Ada - Existing" (the current contacts). Checking a file changes nothing; the plan is applied only after "confirm".
 * Rows removed from the file are ignored: contacts are only deleted in the portal.
 */
import {
    DEFAULT_EMAIL_CATEGORY, EMAIL_IMPORT_MAX_ROWS, cleanContactText, normalizeContactPhone,
    validateCategoryName, validateContact,
    type EmailCategory, type EmailContact, type EmailImportInvalidReason, type EmailImportPlan, type EmailImportRow, type EmailImportSheet
} from '@attentiveid/shared';
import { XlsxError, readXlsx, writeXlsx, type SheetData } from './xlsx';

/** Ten category names of 40 characters, with separators and spare room. */
const MAX_CATEGORY_CELL = 500;

export const NEW_SHEET = 'Baru - New';
export const EXISTING_SHEET = 'Ada - Existing';

type Column = 'email' | 'name' | 'phone' | 'categories' | 'id' | 'version';

const HEADERS: Record<Column, string> = {
    email: 'E-mail',
    name: 'Nama / Name',
    phone: 'Telepon / Phone',
    categories: 'Kategori / Category (pisahkan dengan ;)',
    id: 'ID (jangan diubah / do not edit)',
    version: 'Versi'
};
const WIDTHS = [34, 28, 18, 38, 38, 30];

/** Header cells are matched by their start, so the order of the columns may change. */
const columnOf = (header: string): Column | null => {
    const text = header.trim().toLowerCase();
    if (/^e-?mail/.test(text)) return 'email';
    if (/^(nama|name)/.test(text)) return 'name';
    if (/^(telepon|phone|no\.? ?hp|whatsapp)/.test(text)) return 'phone';
    if (/^(kategori|categor)/.test(text)) return 'categories';
    if (/^id\b/.test(text)) return 'id';
    if (/^vers/.test(text)) return 'version';
    return null;
};

export const buildContactsWorkbook = (contacts: EmailContact[], categories: EmailCategory[]): Buffer => {
    const names = new Map(categories.map((category) => [category.id, category.name]));
    return writeXlsx([
        { name: NEW_SHEET, rows: [[HEADERS.email, HEADERS.name, HEADERS.phone, HEADERS.categories]], widths: WIDTHS },
        {
            name: EXISTING_SHEET,
            widths: WIDTHS,
            // The version tells whether the contact changed in the portal after this download.
            hidden: [5],
            rows: [
                [HEADERS.email, HEADERS.name, HEADERS.phone, HEADERS.categories, HEADERS.id, HEADERS.version],
                ...contacts.map((contact) => [
                    contact.email, contact.name, contact.phone,
                    contact.categoryIds.map((id) => names.get(id)).filter(Boolean).join('; '),
                    contact.id, contact.updatedAt
                ])
            ]
        }
    ]);
};

interface FileRow extends Record<Column, string> {
    sheet: EmailImportSheet;
    row: number;
}

const rowsOf = (sheet: SheetData, kind: EmailImportSheet): FileRow[] => {
    const header = sheet.rows[0] ?? [];
    const columns = header.map(columnOf);
    if (!columns.includes('email')) throw new XlsxError('not_xlsx');
    const rows: FileRow[] = [];
    sheet.rows.slice(1).forEach((cells, index) => {
        const row: FileRow = { sheet: kind, row: index + 2, email: '', name: '', phone: '', categories: '', id: '', version: '' };
        columns.forEach((column, i) => {
            if (column) row[column] = (cells[i] ?? '').trim();
        });
        // A phone typed as a number loses its leading 0.
        if (/^8\d{7,13}$/.test(row.phone)) row.phone = `0${row.phone}`;
        else if (/^62\d{7,13}$/.test(row.phone)) row.phone = `+${row.phone}`;
        if (row.email || row.name || row.phone) rows.push(row);
    });
    return rows;
};

/** Reads an uploaded file; throws XlsxError when it is not this kind of workbook or too large. */
export const readContactsWorkbook = (data: Buffer): FileRow[] => {
    const sheets = readXlsx(data, { maxRows: EMAIL_IMPORT_MAX_ROWS + 1 });
    const find = (name: string) => sheets.find((sheet) => sheet.name.trim().toLowerCase() === name.toLowerCase());
    const fresh = find(NEW_SHEET);
    const existing = find(EXISTING_SHEET);
    if (!fresh && !existing) throw new XlsxError('not_xlsx');
    const rows = [...(existing ? rowsOf(existing, 'existing') : []), ...(fresh ? rowsOf(fresh, 'new') : [])];
    if (rows.length > EMAIL_IMPORT_MAX_ROWS) throw new XlsxError('too_many_rows');
    return rows;
};

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((value) => b.includes(value));

/** What the file would change. `contacts` must include the archived ones. */
export const planImport = (rows: ReturnType<typeof readContactsWorkbook>, contacts: EmailContact[], categories: EmailCategory[]): EmailImportPlan => {
    const plan: EmailImportPlan = { added: [], edited: [], overlapping: [], invalid: [], conflicts: [], unchanged: 0, newCategories: [] };
    const byId = new Map(contacts.map((contact) => [contact.id, contact]));
    const byEmail = new Map(contacts.map((contact) => [contact.email, contact]));
    const byPhone = new Map<string, string>();
    for (const contact of contacts) {
        const phone = normalizeContactPhone(contact.phone);
        if (phone) byPhone.set(phone, contact.id);
    }
    const categoryName = new Map(categories.map((category) => [category.id, category.name]));
    // Lower-case name -> the spelling to use. A name seen first in the file keeps that spelling.
    const known = new Map(categories.map((category) => [category.name.toLowerCase(), category.name]));
    const fileEmails = new Set<string>();
    const filePhones = new Set<string>();

    // Existing rows come first, so a "new" row that repeats an edited address is the one marked as overlapping.
    for (const file of rows) {
        const key = `${file.sheet}:${file.row}`;
        const bad = (reason: EmailImportInvalidReason) =>
            plan.invalid.push({ key, sheet: file.sheet, row: file.row, email: file.email.slice(0, 254), reason });

        const checked = validateContact({ email: file.email, name: file.name, phone: file.phone, categoryIds: [] });
        if (!checked.ok) {
            bad(checked.errors.email ? 'email' : checked.errors.name ? 'name' : 'phone');
            continue;
        }
        // Checked before splitting: ten rows of one huge cell must not turn into millions of strings.
        if (file.categories.length > MAX_CATEGORY_CELL) {
            bad('category');
            continue;
        }
        const wanted = file.categories.split(';').map(cleanContactText).filter(Boolean);
        if (wanted.some((name) => !validateCategoryName(name)) || wanted.length > 10) {
            bad('category');
            continue;
        }

        const existing = file.sheet === 'existing' && file.id ? byId.get(file.id) : undefined;
        if (file.sheet === 'existing' && file.id && !existing) {
            bad('unknown_id');
            continue;
        }
        const { email, name, phone } = checked.value;
        const current = existing ? existing.categoryIds.map((id) => categoryName.get(id)!).filter(Boolean) : [];
        // No category written: an existing contact keeps its own, a new one is a client.
        const names = wanted.length > 0
            ? [...new Set(wanted.map((value) => known.get(value.toLowerCase()) ?? value))]
            : existing ? current : [known.get(DEFAULT_EMAIL_CATEGORY) ?? DEFAULT_EMAIL_CATEGORY];
        const row: EmailImportRow = { key, sheet: file.sheet, row: file.row, email, name, phone, categories: names };
        const normalized = normalizeContactPhone(phone);
        const useCategories = () => {
            for (const value of names) {
                if (!known.has(value.toLowerCase())) {
                    known.set(value.toLowerCase(), value);
                    plan.newCategories.push(value);
                }
            }
        };
        const remember = () => {
            fileEmails.add(email);
            if (normalized) filePhones.add(normalized);
        };
        const overlap = (reason: EmailImportPlan['overlapping'][number]['reason'], canInclude: boolean) =>
            plan.overlapping.push({ ...row, reason, canInclude });

        if (existing) {
            const changed: EmailImportPlan['edited'][number]['changed'] = [];
            if (email !== existing.email) changed.push('email');
            if (name !== existing.name) changed.push('name');
            if (phone !== existing.phone) changed.push('phone');
            if (!sameSet(names.map((v) => v.toLowerCase()), current.map((v) => v.toLowerCase()))) changed.push('categories');
            if (changed.length === 0) {
                plan.unchanged += 1;
                remember();
                continue;
            }
            // Excel may rewrite the timestamp's form; compare the moment it names.
            // Without the version nobody can tell whether the contact changed meanwhile.
            if (!file.version || Date.parse(file.version) !== Date.parse(existing.updatedAt)) {
                plan.conflicts.push(row);
                continue;
            }
            const holder = byEmail.get(email);
            if (holder && holder.id !== existing.id) {
                overlap('email_exists', false);
                continue;
            }
            if (fileEmails.has(email)) {
                overlap('email_in_file', false);
                continue;
            }
            remember();
            useCategories();
            plan.edited.push({ ...row, contactId: existing.id, version: existing.updatedAt, changed });
            continue;
        }

        const holder = byEmail.get(email);
        if (holder) {
            overlap(holder.archivedAt ? 'email_archived' : 'email_exists', false);
            continue;
        }
        if (fileEmails.has(email)) {
            overlap('email_in_file', false);
            continue;
        }
        if (normalized && (byPhone.has(normalized) || filePhones.has(normalized))) {
            overlap(byPhone.has(normalized) ? 'phone_exists' : 'phone_in_file', true);
            fileEmails.add(email);
            continue;
        }
        remember();
        useCategories();
        plan.added.push(row);
    }
    return plan;
};
