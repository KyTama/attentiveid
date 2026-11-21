import { afterAll, describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
import { eq, inArray } from 'drizzle-orm'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../db/schema'
import { createUsersManagementRoutes } from './users-management.routes'
import { createDrizzleRefreshTokenStore, createTokenService } from '../security/token-service'
import { createDrizzleUserRepositorySource, createUserRepository, hashPassword } from '../repositories/users.repository'

/**
 * Staff account rules against a real database (skipped when none is reachable, e.g. on a laptop without one):
 * an admin cannot create a superadmin, cannot take over or suspend a superadmin, and a password reset or suspension
 * signs the account out everywhere.
 */
const databaseUrl = process.env.DATABASE_URL
const reachable = await (async () => {
  if (!databaseUrl) return false
  const probe = postgres(databaseUrl, { max: 1, connect_timeout: 2 })
  try {
    await probe`select 1 from users limit 1`
    return true
  } catch {
    return false
  } finally {
    await probe.end({ timeout: 1 }).catch(() => undefined)
  }
})()

describe.skipIf(!reachable)('staff account management against a real database', () => {
  const client = postgres(databaseUrl as string, { max: 2 })
  const db = drizzle(client, { schema })
  const tokenService = createTokenService({
    secret: 'attentive_test_secret_key_32bytes_minimum_length_required!',
    store: createDrizzleRefreshTokenStore(db),
  })
  const userRepository = createUserRepository(createDrizzleUserRepositorySource(db))
  const app = new Elysia().use(createUsersManagementRoutes({ tokenService, userRepository, db }))
  const suffix = crypto.randomUUID().slice(0, 8)
  const createdIds: string[] = []

  const makeUser = async (name: string, role: 'superadmin' | 'admin' | 'psychologist') => {
    const [row] = await db.insert(schema.users).values({
      email: `audit-${name}-${suffix}@example.invalid`,
      name,
      passwordHash: await hashPassword('a-long-enough-password-1'),
      role,
      status: 'active',
    }).returning()
    createdIds.push(row.id)
    return row
  }
  const tokenFor = async (id: string) => tokenService.issueAccessToken((await userRepository.findById(id))!).accessToken

  const call = (method: string, path: string, token: string, body?: unknown) =>
    app.handle(new Request(`http://localhost${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }))

  afterAll(async () => {
    if (createdIds.length > 0) {
      await db.delete(schema.userRefreshTokens).where(inArray(schema.userRefreshTokens.userId, createdIds))
      await db.delete(schema.users).where(inArray(schema.users.id, createdIds))
    }
    await db.delete(schema.users).where(eq(schema.users.email, `new-super-${suffix}@example.invalid`))
    await client.end({ timeout: 2 })
  })

  it('stops an admin from creating a superadmin, or taking over or suspending one', async () => {
    const admin = await makeUser('admin', 'admin')
    const superadmin = await makeUser('super', 'superadmin')
    const adminToken = await tokenFor(admin.id)

    const create = await call('POST', '/api/admin/users', adminToken, { email: `new-super-${suffix}@example.invalid`, name: 'Sneaky', password: 'another-long-password-9', role: 'superadmin' })
    expect(create.status).toBe(403)
    expect((await call('POST', `/api/admin/users/${superadmin.id}/reset-password`, adminToken, { password: 'attacker-chosen-password-1' })).status).toBe(403)
    expect((await call('PATCH', `/api/admin/users/${superadmin.id}/status`, adminToken, { status: 'suspended' })).status).toBe(403)
    const [still] = await db.select().from(schema.users).where(eq(schema.users.id, superadmin.id))
    expect(still.status).toBe('active')
    expect(await Bun.password.verify('a-long-enough-password-1', still.passwordHash)).toBe(true)
  })

  it('lets a superadmin do those things, and refuses short passwords and self-suspension', async () => {
    const superadmin = await makeUser('boss', 'superadmin')
    const token = await tokenFor(superadmin.id)
    const created = await call('POST', '/api/admin/users', token, { email: `new-super-${suffix}@example.invalid`, name: 'Second', password: 'another-long-password-9', role: 'superadmin' })
    expect(created.status).toBe(200)
    expect((await call('POST', '/api/admin/users', token, { email: `short-${suffix}@example.invalid`, name: 'Short', password: 'short-pass', role: 'admin' })).status).toBe(422)
    expect((await call('PATCH', `/api/admin/users/${superadmin.id}/status`, token, { status: 'suspended' })).status).toBe(400)
  })

  it('signs an account out everywhere when its password is reset or it is suspended', async () => {
    const admin = await makeUser('admin2', 'admin')
    const psychologist = await makeUser('psy', 'psychologist')
    const adminToken = await tokenFor(admin.id)

    const { refreshToken } = await tokenService.issueRefreshToken(psychologist.id)
    await expect(tokenService.verifyRefreshToken(refreshToken)).resolves.toBeDefined()
    expect((await call('POST', `/api/admin/users/${psychologist.id}/reset-password`, adminToken, { password: 'a-brand-new-long-password' })).status).toBe(200)
    await expect(tokenService.verifyRefreshToken(refreshToken)).rejects.toThrow()

    const second = await tokenService.issueRefreshToken(psychologist.id)
    expect((await call('PATCH', `/api/admin/users/${psychologist.id}/status`, adminToken, { status: 'suspended' })).status).toBe(200)
    await expect(tokenService.verifyRefreshToken(second.refreshToken)).rejects.toThrow()
  })
})
