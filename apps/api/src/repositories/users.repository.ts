import { eq, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
    validateCreateUserMutation,
    type CreateUserMutation,
    type UserDto,
    type UserRole,
    type UserStatus
} from '@attentiveid/shared';
import * as schema from '../db/schema';

export interface UserRow {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: UserRole;
    status: UserStatus;
    psychologistId: string | null;
    lastLoginAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UserRepositorySource {
    createUser(input: {
        email: string;
        name: string;
        passwordHash: string;
        role: UserRole;
        psychologistId?: string | null;
    }): Promise<UserRow>;
    findByEmail(email: string): Promise<UserRow | null>;
    findById(id: string): Promise<UserRow | null>;
    updateLastLogin(userId: string): Promise<void>;
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const hashPassword = async (password: string): Promise<string> => {
    return await Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 65536,
        timeCost: 3
    });
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        return await Bun.password.verify(password, hash);
    } catch {
        return false;
    }
};

export const sanitizeUserDto = (row: UserRow): UserDto => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    status: row.status,
    psychologistId: row.psychologistId,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
});

export const createUserRepository = (source: UserRepositorySource) => ({
    async register(input: CreateUserMutation): Promise<UserDto> {
        if (!validateCreateUserMutation(input)) {
            throw new Error('Invalid user creation input.');
        }
        const normalizedEmail = normalizeEmail(input.email);
        const existing = await source.findByEmail(normalizedEmail);
        if (existing) {
            throw new Error('Email already registered.');
        }
        const passwordHash = await hashPassword(input.password);
        const created = await source.createUser({
            email: normalizedEmail,
            name: input.name.trim(),
            passwordHash,
            role: input.role,
            psychologistId: input.psychologistId ?? null
        });
        return sanitizeUserDto(created);
    },

    async findByEmail(email: string): Promise<UserRow | null> {
        return source.findByEmail(normalizeEmail(email));
    },

    async findById(id: string): Promise<UserDto | null> {
        const row = await source.findById(id);
        return row ? sanitizeUserDto(row) : null;
    },

    async updateLastLogin(userId: string): Promise<void> {
        await source.updateLastLogin(userId);
    }
});

export const createDrizzleUserRepositorySource = (
    database: PostgresJsDatabase<typeof schema>
): UserRepositorySource => ({
    async createUser(input) {
        const [record] = await database
            .insert(schema.users)
            .values({
                email: input.email,
                name: input.name,
                passwordHash: input.passwordHash,
                role: input.role,
                psychologistId: input.psychologistId ?? null
            })
            .returning();
        if (!record) {
            throw new Error('User creation returned no row.');
        }
        return record;
    },

    async findByEmail(email) {
        const [record] = await database
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, email))
            .limit(1);
        return record ?? null;
    },

    async findById(id) {
        const [record] = await database
            .select()
            .from(schema.users)
            .where(eq(schema.users.id, id))
            .limit(1);
        return record ?? null;
    },

    async updateLastLogin(userId) {
        await database
            .update(schema.users)
            .set({
                lastLoginAt: sql`now()`,
                updatedAt: sql`now()`
            })
            .where(eq(schema.users.id, userId));
    }
});
