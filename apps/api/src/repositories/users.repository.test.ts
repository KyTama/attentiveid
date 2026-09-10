import { describe, expect, test } from 'bun:test';
import {
    createUserRepository,
    hashPassword,
    normalizeEmail,
    sanitizeUserDto,
    verifyPassword,
    type UserRepositorySource,
    type UserRow
} from './users.repository';

class MemoryUserRepositorySource implements UserRepositorySource {
    private usersByEmail = new Map<string, UserRow>();
    private usersById = new Map<string, UserRow>();
    private sequence = 0;

    async createUser(input: {
        email: string;
        name: string;
        passwordHash: string;
        role: 'admin' | 'psychologist';
        psychologistId?: string | null;
    }): Promise<UserRow> {
        const id = `user-uuid-${++this.sequence}`;
        const now = new Date().toISOString();
        const row: UserRow = {
            id,
            email: input.email,
            name: input.name,
            passwordHash: input.passwordHash,
            role: input.role,
            status: 'active',
            psychologistId: input.psychologistId ?? null,
            lastLoginAt: null,
            createdAt: now,
            updatedAt: now
        };
        this.usersByEmail.set(input.email, row);
        this.usersById.set(id, row);
        return structuredClone(row);
    }

    async findByEmail(email: string): Promise<UserRow | null> {
        const row = this.usersByEmail.get(email);
        return row ? structuredClone(row) : null;
    }

    async findById(id: string): Promise<UserRow | null> {
        const row = this.usersById.get(id);
        return row ? structuredClone(row) : null;
    }

    async updateLastLogin(userId: string): Promise<void> {
        const row = this.usersById.get(userId);
        if (row) {
            row.lastLoginAt = new Date().toISOString();
            row.updatedAt = new Date().toISOString();
        }
    }
}

describe('users repository', () => {
    test('normalizes emails by trimming and lowercasing', () => {
        expect(normalizeEmail(' Admin@Attentive.ID ')).toBe('admin@attentive.id');
        expect(normalizeEmail('user@domain.com')).toBe('user@domain.com');
    });

    test('hashes and verifies passwords securely via Argon2id', async () => {
        const password = 'SuperSecretPassword123!';
        const hash = await hashPassword(password);

        expect(hash).toContain('$argon2id$');
        expect(await verifyPassword(password, hash)).toBe(true);
        expect(await verifyPassword('WrongPassword', hash)).toBe(false);
    });

    test('sanitizes user DTO and redacts password hash', () => {
        const row: UserRow = {
            id: 'user-uuid-1',
            email: 'admin@attentive.id',
            name: 'Admin User',
            passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$secret',
            role: 'admin',
            status: 'active',
            psychologistId: null,
            lastLoginAt: null,
            createdAt: '2026-09-11T00:00:00Z',
            updatedAt: '2026-09-11T00:00:00Z'
        };

        const dto = sanitizeUserDto(row);
        expect(dto.id).toBe(row.id);
        expect(dto.email).toBe(row.email);
        expect(dto.name).toBe(row.name);
        expect(dto.role).toBe(row.role);
        expect(dto.status).toBe(row.status);
        expect((dto as Record<string, unknown>).passwordHash).toBeUndefined();
    });

    test('registers a new user and rejects duplicate email registration', async () => {
        const source = new MemoryUserRepositorySource();
        const repository = createUserRepository(source);

        const created = await repository.register({
            email: 'Psychologist@Attentive.id',
            name: 'Dr. Syazka',
            password: 'SecurePassword123!',
            role: 'psychologist'
        });

        expect(created.email).toBe('psychologist@attentive.id');
        expect(created.name).toBe('Dr. Syazka');
        expect(created.role).toBe('psychologist');

        const foundRow = await repository.findByEmail('psychologist@attentive.id');
        expect(foundRow).not.toBeNull();
        expect(await verifyPassword('SecurePassword123!', foundRow!.passwordHash)).toBe(true);

        await expect(repository.register({
            email: 'psychologist@attentive.id',
            name: 'Duplicate Syazka',
            password: 'AnotherPassword123!',
            role: 'psychologist'
        })).rejects.toThrow('Email already registered.');
    });

    test('rejects invalid email or weak payload format during registration', async () => {
        const source = new MemoryUserRepositorySource();
        const repository = createUserRepository(source);

        await expect(repository.register({
            email: 'not-an-email',
            name: 'Test',
            password: 'short',
            role: 'admin'
        })).rejects.toThrow('Invalid user creation input.');
    });
});
