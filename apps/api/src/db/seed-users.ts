import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import * as schema from './schema'
import { hashPassword, normalizeEmail } from '../repositories/users.repository'
import { resolveSeedPassword } from './seed-password'

/**
 * Creates the first superadmin accounts when they do not exist yet. This repository is public, so no password is written
 * here: it is read from SEED_SUPERADMIN_PASSWORD (at least 14 characters). Accounts that already exist are NOT changed:
 * a password is never reset by this script, and no default or demo accounts are created.
 */
export const seedUsers = async () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL is required to seed users.')
    process.exit(1)
  }
  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client, { schema })

  const production = process.env.NODE_ENV === 'production'
  const { password, generated } = resolveSeedPassword(process.env.SEED_SUPERADMIN_PASSWORD, {
    production,
    label: 'SEED_SUPERADMIN_PASSWORD',
  })
  const passwordHash = await hashPassword(password)

  const [haykalPsych] = await db.select({ id: schema.psychologists.id, name: schema.psychologists.name })
    .from(schema.psychologists)
    .where(eq(schema.psychologists.slug, 'haykal'))
    .limit(1)

  const accounts = [
    { email: normalizeEmail('kytama@attentiveid.com'), name: 'KyTama', psychologistId: null as string | null },
    { email: normalizeEmail('haykal@attentiveid.com'), name: haykalPsych?.name || 'Dr. Haykal Hafizul Arifin', psychologistId: haykalPsych?.id || null },
  ]

  for (const account of accounts) {
    const [existing] = await db.select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, account.email))
      .limit(1)
    if (existing) {
      console.log(`- ${account.email} already exists: left unchanged.`)
      continue
    }
    await db.insert(schema.users).values({
      email: account.email,
      name: account.name,
      passwordHash,
      role: 'superadmin',
      status: 'active',
      psychologistId: account.psychologistId,
    })
    console.log(`✓ Created superadmin ${account.email}.`)
  }

  if (generated) {
    // only possible outside production: a throw-away password for a local database
    console.log(`Local database only: generated password for the new accounts: ${password}`)
  }

  await client.end()
}

if (import.meta.main) {
  seedUsers().catch((err) => {
    console.error('Failed to seed users:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
