/**
 * The portal's Email menu: categories and contacts. Superadmins and admins only (the role guard lets superadmins through
 * every 'admin' route). Nothing here sends mail or reads a mailbox. Logs and audit rows never hold an address or a name.
 */
import { Elysia } from 'elysia';
import {
    DEFAULT_EMAIL_CATEGORY, normalizeContactPhone, validateCategoryName, validateContact,
    type EmailContactErrors, type EmailContactInput
} from '@attentiveid/shared';
import { createRoleGuardPlugin } from '../security/role-guard';
import type { EmailContactsRepository } from '../repositories/email-contacts.repository';
import type { AuthTokenService, AuthUserRepository } from './auth';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** One bulk action at most (the screen selects what is listed). */
const MAX_IDS = 2000;

export interface EmailContactsRoutesDependencies {
    tokenService: Pick<AuthTokenService, 'verifyAccessToken'>;
    userRepository: Pick<AuthUserRepository, 'findById'>;
    emailContactsRepository: EmailContactsRepository;
}

type Set = { status?: number | string; headers: Record<string, string | number> };

export const createEmailContactsRoutes = (dependencies: EmailContactsRoutesDependencies) => {
    const roleGuard = createRoleGuardPlugin({
        tokenService: dependencies.tokenService,
        userRepository: dependencies.userRepository
    });
    const repository = dependencies.emailContactsRepository;

    const fail = (set: Set, status: number, message: string, errors?: EmailContactErrors) => {
        set.status = status;
        return { status: 'error', message, ...(errors ? { errors } : {}) };
    };
    const noContact = (set: Set) => fail(set, 404, 'Kontak tidak ditemukan.');
    const noCategory = (set: Set) => fail(set, 404, 'Kategori tidak ditemukan.');

    /** Checks the input and that every category exists; no category chosen means "client". */
    const readContact = async (body: unknown): Promise<{ value: EmailContactInput } | { errors: EmailContactErrors }> => {
        const result = validateContact(body);
        if (!result.ok) return { errors: result.errors };
        const categories = await repository.listCategories();
        if (result.value.categoryIds.some((id) => !categories.some((category) => category.id === id))) {
            return { errors: { categoryIds: 'invalid' } };
        }
        if (result.value.categoryIds.length > 0) return { value: result.value };
        const fallback = categories.find((category) => category.builtin && category.name === DEFAULT_EMAIL_CATEGORY);
        return fallback ? { value: { ...result.value, categoryIds: [fallback.id] } } : { errors: { categoryIds: 'required' } };
    };

    const readIds = (body: unknown): string[] | null => {
        const ids = (body as { ids?: unknown } | null)?.ids;
        if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_IDS) return null;
        return ids.every((id) => typeof id === 'string' && UUID.test(id)) ? [...new Set(ids as string[])] : null;
    };

    return new Elysia({ name: 'email-contacts-routes' })
        .use(roleGuard)
        .get('/api/admin/email/contacts', async ({ query, set }: any) => {
            set.headers['cache-control'] = 'no-store';
            const archived = query?.archived === '1';
            const [contacts, categories] = await Promise.all([repository.listContacts({ archived }), repository.listCategories()]);
            return { status: 'success', data: { contacts, categories } };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'List contacts and categories (admins)' } })
        .post('/api/admin/email/contacts', async ({ body, set, currentUser }: any) => {
            const input = await readContact(body);
            if ('errors' in input) return fail(set, 400, 'Periksa isian kontak.', input.errors);
            const contact = await repository.createContact(
                { ...input.value, phoneNormalized: normalizeContactPhone(input.value.phone) }, 'manual', currentUser.email);
            if (!contact) return fail(set, 409, 'Alamat e-mail ini sudah ada di kontak (cek juga arsip).');
            await repository.audit(currentUser.email, 'contact_added', contact.id);
            set.status = 201;
            return { status: 'success', data: contact };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Add a contact' } })
        .put('/api/admin/email/contacts/:id', async ({ params, body, set, currentUser }: any) => {
            if (!UUID.test(params.id)) return noContact(set);
            const input = await readContact(body);
            if ('errors' in input) return fail(set, 400, 'Periksa isian kontak.', input.errors);
            const result = await repository.updateContact(
                params.id, { ...input.value, phoneNormalized: normalizeContactPhone(input.value.phone) }, currentUser.email);
            if (result === 'missing') return noContact(set);
            if (result === 'taken') return fail(set, 409, 'Alamat e-mail ini sudah dipakai kontak lain.');
            await repository.audit(currentUser.email, 'contact_edited', params.id);
            return { status: 'success', data: result };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Edit a contact' } })
        .post('/api/admin/email/contacts/archive', async ({ body, set, currentUser }: any) => {
            const ids = readIds(body);
            if (!ids || typeof body?.archived !== 'boolean') return fail(set, 400, 'Pilih kontak yang mau diarsipkan.');
            const count = await repository.setArchived(ids, body.archived, currentUser.email);
            await repository.audit(currentUser.email, body.archived ? 'contacts_archived' : 'contacts_restored', String(count));
            return { status: 'success', data: { count } };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Archive or restore contacts' } })
        .post('/api/admin/email/contacts/delete', async ({ body, set, currentUser }: any) => {
            const ids = readIds(body);
            if (!ids) return fail(set, 400, 'Pilih kontak yang mau dihapus.');
            const count = await repository.deleteContacts(ids);
            await repository.audit(currentUser.email, 'contacts_deleted', String(count));
            return { status: 'success', data: { count } };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Delete contacts for good' } })
        .post('/api/admin/email/categories', async ({ body, set, currentUser }: any) => {
            const name = validateCategoryName(body?.name);
            if (!name) return fail(set, 400, 'Nama kategori wajib diisi, maksimal 40 karakter, tanpa titik koma.');
            const category = await repository.createCategory(name);
            if (!category) return fail(set, 409, 'Kategori dengan nama itu sudah ada.');
            await repository.audit(currentUser.email, 'category_added', name);
            set.status = 201;
            return { status: 'success', data: category };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Add a category' } })
        .put('/api/admin/email/categories/:id', async ({ params, body, set, currentUser }: any) => {
            if (!UUID.test(params.id)) return noCategory(set);
            const name = validateCategoryName(body?.name);
            if (!name) return fail(set, 400, 'Nama kategori wajib diisi, maksimal 40 karakter, tanpa titik koma.');
            const result = await repository.renameCategory(params.id, name);
            if (result === 'missing') return noCategory(set);
            if (result === 'builtin') return fail(set, 409, 'Kategori bawaan tidak bisa diubah.');
            if (result === 'taken') return fail(set, 409, 'Kategori dengan nama itu sudah ada.');
            await repository.audit(currentUser.email, 'category_renamed', name);
            return { status: 'success' };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Rename a category' } })
        .delete('/api/admin/email/categories/:id', async ({ params, set, currentUser }: any) => {
            if (!UUID.test(params.id)) return noCategory(set);
            const result = await repository.deleteCategory(params.id);
            if (result === 'missing') return noCategory(set);
            if (result === 'builtin') return fail(set, 409, 'Kategori bawaan tidak bisa dihapus.');
            if (result === 'in_use') return fail(set, 409, 'Masih ada kontak di kategori ini. Pindahkan dulu (cek juga arsip).');
            await repository.audit(currentUser.email, 'category_deleted', params.id);
            return { status: 'success' };
        }, { requireRole: 'admin', detail: { tags: ['Email'], summary: 'Delete an unused category' } });
};
