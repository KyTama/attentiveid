import { and, asc, eq, gt, inArray, isNull, lt, ne, sql } from 'drizzle-orm';
import type { EmailCategory, EmailContact, EmailContactInput, EmailContactSource, EmailImportPlan } from '@attentiveid/shared';
import { db as defaultDb } from '../db';
import { emailAudit, emailCategories, emailContactCategories, emailContacts, emailImports, emailSuppressions } from '../db/schema';

export interface NewEmailContact extends EmailContactInput {
    phoneNormalized: string;
}

export interface EmailContactsRepository {
    listCategories(): Promise<EmailCategory[]>;
    /** Null when a category with that name (any letter case) already exists. */
    createCategory(name: string): Promise<EmailCategory | null>;
    renameCategory(id: string, name: string): Promise<'ok' | 'missing' | 'taken' | 'builtin'>;
    /** Only a category no contact has, and not a built-in one. */
    deleteCategory(id: string): Promise<'ok' | 'missing' | 'in_use' | 'builtin'>;

    /** Newest first; archived contacts only when asked for. */
    listContacts(options: { archived: boolean }): Promise<EmailContact[]>;
    getContact(id: string): Promise<EmailContact | null>;
    /** Null when the address is already a contact. */
    createContact(input: NewEmailContact, source: EmailContactSource, actor: string): Promise<EmailContact | null>;
    updateContact(id: string, input: NewEmailContact, actor: string): Promise<EmailContact | 'missing' | 'taken'>;
    setArchived(ids: string[], archived: boolean, actor: string): Promise<number>;
    deleteContacts(ids: string[]): Promise<number>;

    audit(actor: string, action: string, detail: string): Promise<void>;

    /** Keeps a checked file waiting for "confirm"; also removes old ones. */
    saveImport(actor: string, plan: EmailImportPlan, expiresAt: Date): Promise<string>;
    /** Hands the plan out once, to the person who uploaded it, before it expires; null otherwise. */
    takeImport(id: string, actor: string, now: Date): Promise<EmailImportPlan | null>;
}

const isUniqueViolation = (error: unknown): boolean => {
    for (let e = error as { code?: string; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
        if (e.code === '23505') return true;
    }
    return false;
};

export const createEmailContactsRepository = (database: typeof defaultDb = defaultDb): EmailContactsRepository => {
    const categoriesOf = async (ids: string[]) => {
        const map = new Map<string, string[]>();
        if (ids.length === 0) return map;
        const links = await database.select().from(emailContactCategories).where(inArray(emailContactCategories.contactId, ids));
        for (const link of links) map.set(link.contactId, [...(map.get(link.contactId) ?? []), link.categoryId]);
        return map;
    };

    const unsubscribedOf = async (emails: string[]) => {
        if (emails.length === 0) return new Set<string>();
        const rows = await database.select({ email: emailSuppressions.email }).from(emailSuppressions).where(inArray(emailSuppressions.email, emails));
        return new Set(rows.map((row) => row.email));
    };

    const toContact = (row: typeof emailContacts.$inferSelect, categoryIds: string[], stopped: ReadonlySet<string>): EmailContact => ({
        unsubscribed: stopped.has(row.email),
        id: row.id,
        email: row.email,
        name: row.name,
        phone: row.phone,
        categoryIds,
        source: row.source as EmailContactSource,
        archivedAt: row.archivedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    });

    const getContact = async (id: string) => {
        const [row] = await database.select().from(emailContacts).where(eq(emailContacts.id, id)).limit(1);
        if (!row) return null;
        return toContact(row, (await categoriesOf([id])).get(id) ?? [], await unsubscribedOf([row.email]));
    };

    const listCategories = async (): Promise<EmailCategory[]> => {
        const rows = await database
            .select({
                id: emailCategories.id,
                name: emailCategories.name,
                builtin: emailCategories.builtin,
                count: sql<number>`count(${emailContactCategories.contactId})::int`
            })
            .from(emailCategories)
            .leftJoin(emailContactCategories, eq(emailContactCategories.categoryId, emailCategories.id))
            .groupBy(emailCategories.id)
            // Built-in categories first, then in the order they were added.
            .orderBy(sql`${emailCategories.builtin} desc`, asc(emailCategories.createdAt), sql`${emailCategories.name} = 'client' desc`, asc(emailCategories.name));
        return rows;
    };

    const findCategory = async (id: string) => (await database.select().from(emailCategories).where(eq(emailCategories.id, id)).limit(1))[0];

    return {
        listCategories,

        async createCategory(name) {
            try {
                const [row] = await database.insert(emailCategories).values({ name }).returning();
                return { id: row!.id, name: row!.name, builtin: row!.builtin, count: 0 };
            } catch (error) {
                if (isUniqueViolation(error)) return null;
                throw error;
            }
        },

        async renameCategory(id, name) {
            const found = await findCategory(id);
            if (!found) return 'missing';
            if (found.builtin) return 'builtin';
            try {
                await database.update(emailCategories).set({ name }).where(eq(emailCategories.id, id));
            } catch (error) {
                if (isUniqueViolation(error)) return 'taken';
                throw error;
            }
            return 'ok';
        },

        async deleteCategory(id) {
            const found = await findCategory(id);
            if (!found) return 'missing';
            if (found.builtin) return 'builtin';
            try {
                // The foreign key refuses the delete while any contact has the category, also against a contact added meanwhile.
                await database.delete(emailCategories).where(and(eq(emailCategories.id, id), ne(emailCategories.builtin, true)));
            } catch (error) {
                const [used] = await database.select().from(emailContactCategories).where(eq(emailContactCategories.categoryId, id)).limit(1);
                if (used) return 'in_use';
                throw error;
            }
            return 'ok';
        },

        async listContacts({ archived }) {
            const rows = await database
                .select()
                .from(emailContacts)
                .where(archived ? sql`${emailContacts.archivedAt} is not null` : sql`${emailContacts.archivedAt} is null`)
                .orderBy(sql`${emailContacts.createdAt} desc`, asc(emailContacts.email));
            const links = await categoriesOf(rows.map((row) => row.id));
            const stopped = await unsubscribedOf(rows.map((row) => row.email));
            return rows.map((row) => toContact(row, links.get(row.id) ?? [], stopped));
        },

        getContact,

        async createContact(input, source, actor) {
            const { categoryIds, ...fields } = input;
            const id = await database.transaction(async (tx) => {
                const [row] = await tx
                    .insert(emailContacts)
                    .values({ ...fields, source, createdBy: actor, updatedBy: actor })
                    .onConflictDoNothing({ target: emailContacts.email })
                    .returning({ id: emailContacts.id });
                if (!row) return null;
                if (categoryIds.length > 0) {
                    await tx.insert(emailContactCategories).values(categoryIds.map((categoryId) => ({ contactId: row.id, categoryId })));
                }
                return row.id;
            });
            return id ? getContact(id) : null;
        },

        async updateContact(id, input, actor) {
            const { categoryIds, ...fields } = input;
            try {
                const found = await database.transaction(async (tx) => {
                    const [row] = await tx
                        .update(emailContacts)
                        .set({ ...fields, updatedBy: actor, updatedAt: new Date().toISOString() })
                        .where(eq(emailContacts.id, id))
                        .returning({ id: emailContacts.id });
                    if (!row) return false;
                    await tx.delete(emailContactCategories).where(eq(emailContactCategories.contactId, id));
                    if (categoryIds.length > 0) {
                        await tx.insert(emailContactCategories).values(categoryIds.map((categoryId) => ({ contactId: id, categoryId })));
                    }
                    return true;
                });
                if (!found) return 'missing';
            } catch (error) {
                if (isUniqueViolation(error)) return 'taken';
                throw error;
            }
            return (await getContact(id)) ?? 'missing';
        },

        async setArchived(ids, archived, actor) {
            if (ids.length === 0) return 0;
            const now = new Date().toISOString();
            const rows = await database
                .update(emailContacts)
                .set({ archivedAt: archived ? now : null, updatedBy: actor, updatedAt: now })
                .where(inArray(emailContacts.id, ids))
                .returning({ id: emailContacts.id });
            return rows.length;
        },

        async deleteContacts(ids) {
            if (ids.length === 0) return 0;
            const rows = await database.delete(emailContacts).where(inArray(emailContacts.id, ids)).returning({ id: emailContacts.id });
            return rows.length;
        },

        async audit(actor, action, detail) {
            await database.insert(emailAudit).values({ actor, action, detail });
        },

        async saveImport(actor, plan, expiresAt) {
            await database.delete(emailImports).where(lt(emailImports.expiresAt, new Date().toISOString()));
            const [row] = await database.insert(emailImports).values({ actor, plan, expiresAt: expiresAt.toISOString() }).returning({ id: emailImports.id });
            return row!.id;
        },

        async takeImport(id, actor, now) {
            // One statement, so two clicks on "confirm" cannot both get it.
            const [row] = await database
                .update(emailImports)
                .set({ appliedAt: now.toISOString() })
                .where(and(eq(emailImports.id, id), eq(emailImports.actor, actor), isNull(emailImports.appliedAt), gt(emailImports.expiresAt, now.toISOString())))
                .returning({ plan: emailImports.plan });
            return row ? (row.plan as EmailImportPlan) : null;
        }
    };
};
