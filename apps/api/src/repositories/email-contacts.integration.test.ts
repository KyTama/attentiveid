import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../db/schema';
import { createEmailContactsRepository, type NewEmailContact } from './email-contacts.repository';

/** Real PostgreSQL: unique addresses, category links and the protections. Runs only against a disposable attentiveid_test_* database. */
const databaseUrl = process.env.DATABASE_URL;
const databaseName = databaseUrl ? new URL(databaseUrl).pathname.slice(1) : '';
const isDisposable = Boolean(databaseUrl && /^attentiveid_test_[a-z0-9_]+$/.test(databaseName));
const describeIntegration = isDisposable ? describe : describe.skip;

const client = isDisposable ? postgres(databaseUrl!, { max: 4 }) : (null as unknown as ReturnType<typeof postgres>);
const database = isDisposable ? drizzle(client, { schema }) : (null as unknown as ReturnType<typeof drizzle>);
const repository = createEmailContactsRepository(database as never);

const contact = (email: string, categoryIds: string[]): NewEmailContact => ({ email, name: 'Tester', phone: '', phoneNormalized: '', categoryIds });

describeIntegration('email contacts repository (PostgreSQL)', () => {
    let clientId = '';
    let businessId = '';

    beforeAll(async () => {
        await database.execute(sql`delete from email_contacts`);
        await database.execute(sql`delete from email_categories where builtin = false`);
        const categories = await repository.listCategories();
        clientId = categories.find((c) => c.name === 'client')!.id;
        businessId = categories.find((c) => c.name === 'business')!.id;
    });
    afterAll(async () => { await client.end(); });

    test('the migration seeds client and business', async () => {
        expect((await repository.listCategories()).map((c) => [c.name, c.builtin])).toEqual(
            expect.arrayContaining([['client', true], ['business', true]]));
    });

    test('one contact per address, with several categories and counts', async () => {
        const created = await repository.createContact(contact('one@example.test', [clientId, businessId]), 'manual', 'a');
        expect(created!.categoryIds.sort()).toEqual([clientId, businessId].sort());
        expect(await repository.createContact(contact('one@example.test', [clientId]), 'manual', 'a')).toBeNull();
        const counts = Object.fromEntries((await repository.listCategories()).map((c) => [c.name, c.count]));
        expect(counts.client).toBe(1);
        expect(counts.business).toBe(1);
    });

    test('editing replaces the categories; another contact\'s address is refused', async () => {
        const second = (await repository.createContact(contact('two@example.test', [clientId]), 'manual', 'a'))!;
        const edited = await repository.updateContact(second.id, contact('two@example.test', [businessId]), 'b');
        expect(typeof edited === 'object' && edited.categoryIds).toEqual([businessId]);
        expect(await repository.updateContact(second.id, contact('one@example.test', [businessId]), 'b')).toBe('taken');
        expect((await repository.getContact(second.id))!.categoryIds).toEqual([businessId]);
        expect(await repository.updateContact('00000000-0000-4000-8000-000000000000', contact('x@example.test', []), 'b')).toBe('missing');
    });

    test('category names are unique in any letter case; one in use cannot be deleted', async () => {
        const made = (await repository.createCategory('Mitra'))!;
        expect(await repository.createCategory('mitra')).toBeNull();
        const third = (await repository.createContact(contact('three@example.test', [made.id]), 'manual', 'a'))!;
        expect(await repository.deleteCategory(made.id)).toBe('in_use');
        expect(await repository.renameCategory(made.id, 'Client')).toBe('taken');
        expect(await repository.renameCategory(clientId, 'x')).toBe('builtin');
        expect(await repository.deleteCategory(clientId)).toBe('builtin');
        expect(await repository.deleteContacts([third.id])).toBe(1);
        expect(await repository.deleteCategory(made.id)).toBe('ok');
    });

    test('a preview is applied all or nothing, once, only by its uploader, before it expires', async () => {
        const plan = { added: [], edited: [], overlapping: [], invalid: [], conflicts: [], unchanged: 3, newCategories: [] };
        const later = new Date(Date.now() + 60_000);
        const id = await repository.saveImport('a', plan, later);
        const never = async () => 'ran';
        expect(await repository.applyImport(id, 'b', new Date(), never)).toBeNull();
        expect(await repository.applyImport(id, 'a', new Date(later.getTime() + 1), never)).toBeNull();

        // Fails half-way: nothing is kept and the preview is still there.
        const failing = repository.applyImport(id, 'a', new Date(), async (_plan, inside) => {
            await inside.createContact(contact('half@example.test', [clientId]), 'import', 'a');
            await inside.createCategory('Mitra Impor');
            throw new Error('broke');
        });
        await expect(failing).rejects.toThrow('broke');
        expect((await repository.listContacts({ archived: false })).some((c) => c.email === 'half@example.test')).toBe(false);
        expect((await repository.listCategories()).some((c) => c.name === 'Mitra Impor')).toBe(false);

        // A duplicate inside the transaction must not abort the rest of it; two confirms apply once.
        const run = () => repository.applyImport(id, 'a', new Date(), async (_plan, inside) => {
            expect(await inside.createCategory('client')).toBeNull();
            await inside.createContact(contact('whole@example.test', [clientId]), 'import', 'a');
            return 'done';
        });
        expect((await Promise.all([run(), run()])).filter(Boolean)).toEqual(['done']);
        const [kept] = (await repository.listContacts({ archived: false })).filter((c) => c.email === 'whole@example.test');
        await repository.deleteContacts([kept!.id]);
    });

    test('expired previews are removed', async () => {
        const plan = { added: [], edited: [], overlapping: [], invalid: [], conflicts: [], unchanged: 0, newCategories: [] };
        await repository.saveImport('a', plan, new Date(Date.now() - 1000));
        await repository.purgeImports(new Date());
        const [row] = await database.execute(sql`select count(*)::int as n from email_imports where expires_at < now()`) as unknown as Array<{ n: number }>;
        expect(row!.n).toBe(0);
    });

    test('archived contacts leave the normal list and can come back', async () => {
        const [first] = await repository.listContacts({ archived: false });
        expect(await repository.setArchived([first!.id], true, 'a')).toBe(1);
        expect((await repository.listContacts({ archived: false })).some((c) => c.id === first!.id)).toBe(false);
        expect((await repository.listContacts({ archived: true })).map((c) => c.id)).toEqual([first!.id]);
        await repository.setArchived([first!.id], false, 'a');
        expect(await repository.listContacts({ archived: true })).toEqual([]);
    });
});
