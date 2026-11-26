import { describe, expect, it } from 'bun:test';
import type { EmailCategory, EmailContact, UserDto } from '@attentiveid/shared';
import { createTokenService } from '../security/token-service';
import type { EmailContactsRepository } from '../repositories/email-contacts.repository';
import { createEmailContactsRoutes } from './email-contacts.routes';
import { NEW_SHEET } from '../services/email-excel';
import { writeXlsx } from '../services/xlsx';
import type { EmailImportPlan } from '@attentiveid/shared';

const tokenService = createTokenService({ jwtSecret: 'email_test_secret_that_is_long_enough_1234567890' });
const user = (id: string, role: UserDto['role']): UserDto => ({ id, email: `${id}@example.test`, name: id, role, status: 'active', psychologistId: null } as UserDto);
const admin = user('admin', 'admin');
const superadmin = user('super', 'superadmin');
const psychologist = user('psy', 'psychologist' as UserDto['role']);
const users = new Map([admin, superadmin, psychologist].map((u) => [u.id, u]));

const CLIENT = '11111111-1111-4111-8111-111111111111';
const BUSINESS = '22222222-2222-4222-8222-222222222222';
const CONTACT = '33333333-3333-4333-8333-333333333333';

const make = () => {
    const categories: EmailCategory[] = [
        { id: CLIENT, name: 'client', builtin: true, count: 0 },
        { id: BUSINESS, name: 'business', builtin: true, count: 0 }
    ];
    const contacts: EmailContact[] = [];
    const audits: Array<[string, string, string]> = [];
    const archived: Array<[string[], boolean]> = [];
    const imports = new Map<string, { actor: string; plan: EmailImportPlan }>();
    const repository: EmailContactsRepository = {
        listCategories: async () => categories,
        createCategory: async (name) => categories.some((c) => c.name.toLowerCase() === name.toLowerCase()) ? null : { id: CONTACT, name, builtin: false, count: 0 },
        renameCategory: async (id) => categories.find((c) => c.id === id)?.builtin ? 'builtin' : 'missing',
        deleteCategory: async (id) => id === CONTACT ? 'in_use' : categories.find((c) => c.id === id)?.builtin ? 'builtin' : 'missing',
        listContacts: async ({ archived: wanted }) => contacts.filter((c) => Boolean(c.archivedAt) === wanted),
        getContact: async (id) => contacts.find((c) => c.id === id) ?? null,
        createContact: async ({ phoneNormalized: _p, ...input }, source) => {
            if (contacts.some((c) => c.email === input.email)) return null;
            const contact: EmailContact = { ...input, id: CONTACT, source, archivedAt: null, createdAt: '2026-11-26T00:00:00Z', updatedAt: '2026-11-26T00:00:00Z' };
            contacts.push(contact);
            return contact;
        },
        updateContact: async (id, { phoneNormalized: _p, ...input }) => {
            const contact = contacts.find((c) => c.id === id);
            return contact ? Object.assign(contact, input) : 'missing';
        },
        setArchived: async (ids, value) => { archived.push([ids, value]); return ids.length; },
        deleteContacts: async (ids) => ids.length,
        audit: async (actor, action, detail) => { audits.push([actor, action, detail]); },
        saveImport: async (actor, plan) => { imports.set(CONTACT, { actor, plan }); return CONTACT; },
        takeImport: async (id, actor) => {
            const found = imports.get(id);
            if (!found || found.actor !== actor) return null;
            imports.delete(id);
            return found.plan;
        }
    };
    const app = createEmailContactsRoutes({
        tokenService,
        userRepository: { findById: async (id: string) => users.get(id) ?? null },
        emailContactsRepository: repository
    });
    const call = async (method: string, path: string, as: UserDto | null, body?: unknown) => {
        const response = await app.handle(new Request(`http://localhost${path}`, {
            method,
            headers: {
                ...(as ? { authorization: `Bearer ${tokenService.issueAccessToken(as).accessToken}` } : {}),
                ...(body === undefined ? {} : { 'content-type': 'application/json' })
            },
            ...(body === undefined ? {} : { body: JSON.stringify(body) })
        }));
        return { status: response.status, headers: response.headers, body: await response.json().catch(() => null) as any };
    };
    const upload = async (as: UserDto | null, data: Buffer | null) => {
        const form = new FormData();
        if (data) form.append('file', new File([new Uint8Array(data)], 'kontak.xlsx'));
        else form.append('other', 'x');
        const response = await app.handle(new Request('http://localhost/api/admin/email/import', {
            method: 'POST', body: form, headers: as ? { authorization: `Bearer ${tokenService.issueAccessToken(as).accessToken}` } : {}
        }));
        return { status: response.status, body: await response.json().catch(() => null) as any };
    };
    const download = (as: UserDto | null) => app.handle(new Request('http://localhost/api/admin/email/export', {
        headers: as ? { authorization: `Bearer ${tokenService.issueAccessToken(as).accessToken}` } : {}
    }));
    return { call, upload, download, contacts, audits, archived };
};

const ROUTES: Array<[string, string]> = [
    ['GET', '/api/admin/email/contacts'],
    ['POST', '/api/admin/email/contacts'],
    ['PUT', `/api/admin/email/contacts/${CONTACT}`],
    ['POST', '/api/admin/email/contacts/archive'],
    ['POST', '/api/admin/email/contacts/delete'],
    ['POST', '/api/admin/email/categories'],
    ['PUT', `/api/admin/email/categories/${CONTACT}`],
    ['DELETE', `/api/admin/email/categories/${CONTACT}`],
    ['GET', '/api/admin/email/export'],
    ['POST', '/api/admin/email/import'],
    ['POST', `/api/admin/email/import/${CONTACT}/apply`]
];

describe('email contacts routes', () => {
    it('every route refuses visitors and psychologists, and changes nothing', async () => {
        const { call, contacts, audits } = make();
        for (const [method, path] of ROUTES) {
            const body = method === 'GET' || method === 'DELETE' ? undefined : { email: 'a@example.test', ids: [CONTACT], archived: true, name: 'x' };
            expect((await call(method, path, null, body)).status).toBe(401);
            expect((await call(method, path, psychologist, body)).status).toBe(403);
        }
        expect(contacts).toHaveLength(0);
        expect(audits).toHaveLength(0);
    });

    it('admins and superadmins can list; the list is not cached', async () => {
        const { call } = make();
        for (const who of [admin, superadmin]) {
            const result = await call('GET', '/api/admin/email/contacts', who);
            expect(result.status).toBe(200);
            expect(result.headers.get('cache-control')).toBe('no-store');
            expect(result.body.data.categories).toHaveLength(2);
        }
    });

    it('a new contact without a category is a client; the audit holds no address', async () => {
        const { call, audits } = make();
        const result = await call('POST', '/api/admin/email/contacts', admin, { email: ' Budi@Example.TEST ', name: 'Budi' });
        expect(result.status).toBe(201);
        expect(result.body.data.email).toBe('budi@example.test');
        expect(result.body.data.categoryIds).toEqual([CLIENT]);
        expect(audits).toEqual([['admin@example.test', 'contact_added', CONTACT]]);
    });

    it('keeps several categories', async () => {
        const { call } = make();
        const result = await call('POST', '/api/admin/email/contacts', admin, { email: 'a@example.test', categoryIds: [CLIENT, BUSINESS] });
        expect(result.body.data.categoryIds).toEqual([CLIENT, BUSINESS]);
    });

    it('refuses the same address twice, a bad address and an unknown category', async () => {
        const { call } = make();
        await call('POST', '/api/admin/email/contacts', admin, { email: 'a@example.test' });
        expect((await call('POST', '/api/admin/email/contacts', admin, { email: 'A@example.test' })).status).toBe(409);
        const bad = await call('POST', '/api/admin/email/contacts', admin, { email: 'a@b.test, c@d.test' });
        expect(bad.status).toBe(400);
        expect(bad.body.errors.email).toBe('invalid');
        const unknown = await call('POST', '/api/admin/email/contacts', admin, { email: 'b@example.test', categoryIds: [CONTACT] });
        expect(unknown.status).toBe(400);
        expect(unknown.body.errors.categoryIds).toBe('invalid');
    });

    it('edits a contact; a wrong id is 404', async () => {
        const { call } = make();
        await call('POST', '/api/admin/email/contacts', admin, { email: 'a@example.test' });
        const edited = await call('PUT', `/api/admin/email/contacts/${CONTACT}`, admin, { email: 'a@example.test', name: 'Ani', categoryIds: [BUSINESS] });
        expect(edited.body.data.name).toBe('Ani');
        expect((await call('PUT', '/api/admin/email/contacts/nope', admin, { email: 'a@example.test' })).status).toBe(404);
    });

    it('archive and delete need a list of real ids', async () => {
        const { call, archived } = make();
        for (const body of [{}, { ids: [] }, { ids: ['x'] }, { ids: 'all' }]) {
            expect((await call('POST', '/api/admin/email/contacts/delete', admin, body)).status).toBe(400);
        }
        expect((await call('POST', '/api/admin/email/contacts/archive', admin, { ids: [CONTACT] })).status).toBe(400);
        const done = await call('POST', '/api/admin/email/contacts/archive', admin, { ids: [CONTACT, CONTACT], archived: true });
        expect(done.body.data.count).toBe(1);
        expect(archived).toEqual([[[CONTACT], true]]);
    });

    it('categories: duplicates, built-in ones and ones in use are protected', async () => {
        const { call } = make();
        expect((await call('POST', '/api/admin/email/categories', admin, { name: 'Client' })).status).toBe(409);
        expect((await call('POST', '/api/admin/email/categories', admin, { name: 'a;b' })).status).toBe(400);
        expect((await call('POST', '/api/admin/email/categories', admin, { name: 'Mitra' })).status).toBe(201);
        expect((await call('PUT', `/api/admin/email/categories/${CLIENT}`, admin, { name: 'x' })).status).toBe(409);
        expect((await call('DELETE', `/api/admin/email/categories/${CLIENT}`, admin)).status).toBe(409);
        expect((await call('DELETE', `/api/admin/email/categories/${CONTACT}`, admin)).status).toBe(409);
    });
});

describe('email contacts Excel', () => {
    const workbook = (rows: string[][]) => writeXlsx([{ name: NEW_SHEET, rows: [['E-mail', 'Nama', 'Telepon', 'Kategori'], ...rows] }]);

    it('export is a private download and is recorded', async () => {
        const { download, audits } = make();
        const response = await download(admin);
        expect(response.status).toBe(200);
        expect(response.headers.get('content-disposition')).toContain('.xlsx');
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(audits).toEqual([['admin@example.test', 'contacts_exported', '0']]);
    });

    it('checking a file changes nothing; confirm applies it once', async () => {
        const { upload, call, contacts, audits } = make();
        const checked = await upload(admin, workbook([['a@example.test', 'Ani', '081200000001', '']]));
        expect(checked.status).toBe(200);
        expect(checked.body.data.plan.added).toHaveLength(1);
        expect(contacts).toHaveLength(0);
        const done = await call('POST', `/api/admin/email/import/${CONTACT}/apply`, admin, {});
        expect(done.body.data).toEqual({ added: 1, updated: 0, skipped: 0 });
        expect(contacts.map((c) => [c.email, c.source, c.categoryIds])).toEqual([['a@example.test', 'import', [CLIENT]]]);
        expect(audits.at(-1)).toEqual(['admin@example.test', 'contacts_imported', 'added 1, updated 0, skipped 0']);
        expect((await call('POST', `/api/admin/email/import/${CONTACT}/apply`, admin, {})).status).toBe(410);
    });

    it('only the person who uploaded can confirm', async () => {
        const { upload, call, contacts } = make();
        await upload(admin, workbook([['a@example.test', '', '', '']]));
        expect((await call('POST', `/api/admin/email/import/${CONTACT}/apply`, superadmin, {})).status).toBe(410);
        expect(contacts).toHaveLength(0);
    });

    it('refuses a missing or wrong file', async () => {
        const { upload } = make();
        expect((await upload(admin, null)).status).toBe(400);
        const wrong = await upload(admin, Buffer.from('email,a@example.test'));
        expect(wrong.status).toBe(400);
        expect(wrong.body.message).toContain('bukan Excel kontak');
    });
});
