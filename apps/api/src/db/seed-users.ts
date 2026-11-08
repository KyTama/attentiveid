import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import * as schema from './schema'
import { hashPassword, normalizeEmail } from '../repositories/users.repository'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL is required to seed users.')
  process.exit(1)
}

const client = postgres(databaseUrl, { max: 1 })
const db = drizzle(client, { schema })

export const seedUsers = async () => {
  const legacyAdminEmail = normalizeEmail('admin@attentive.id')
  const legacyPsychEmail = normalizeEmail('psychologist@attentive.id')
  const kytamaEmail = normalizeEmail('kytama@attentiveid.com')
  const haykalEmail = normalizeEmail('haykal@attentiveid.com')

  const defaultPassword = 'Password123!'
  const superPassword = '@Password6969'
  const defaultPasswordHash = await hashPassword(defaultPassword)
  const superPasswordHash = await hashPassword(superPassword)

  // Find Haykal psychologist record if available
  const [haykalPsych] = await db.select({ id: schema.psychologists.id, name: schema.psychologists.name })
    .from(schema.psychologists)
    .where(eq(schema.psychologists.slug, 'haykal'))
    .limit(1)

  // 1. Seed / Upsert KyTama as Superadmin
  const existingKytama = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, kytamaEmail))
    .limit(1)

  if (existingKytama.length === 0) {
    await db.insert(schema.users).values({
      email: kytamaEmail,
      name: 'KyTama',
      passwordHash: superPasswordHash,
      role: 'superadmin',
      status: 'active',
    })
    console.log(`✓ Seeded superadmin user: ${kytamaEmail} (password: ${superPassword})`)
  } else {
    await db.update(schema.users).set({
      role: 'superadmin',
      passwordHash: superPasswordHash,
      status: 'active',
      updatedAt: new Date().toISOString()
    }).where(eq(schema.users.id, existingKytama[0].id))
    console.log(`✓ Updated existing user to superadmin: ${kytamaEmail}`)
  }

  // 2. Seed / Upsert Haykal as Superadmin
  const existingHaykal = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, haykalEmail))
    .limit(1)

  if (existingHaykal.length === 0) {
    await db.insert(schema.users).values({
      email: haykalEmail,
      name: haykalPsych?.name || 'Dr. Haykal Hafizul Arifin',
      passwordHash: superPasswordHash,
      role: 'superadmin',
      status: 'active',
      psychologistId: haykalPsych?.id || null,
    })
    console.log(`✓ Seeded superadmin user: ${haykalEmail} (password: ${superPassword})`)
  } else {
    await db.update(schema.users).set({
      role: 'superadmin',
      passwordHash: superPasswordHash,
      status: 'active',
      psychologistId: haykalPsych?.id || null,
      updatedAt: new Date().toISOString()
    }).where(eq(schema.users.id, existingHaykal[0].id))
    console.log(`✓ Updated existing user to superadmin: ${haykalEmail}`)
  }

  // 3. Seed legacy admin
  const existingAdmin = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, legacyAdminEmail))
    .limit(1)

  if (existingAdmin.length === 0) {
    await db.insert(schema.users).values({
      email: legacyAdminEmail,
      name: 'Attentive Admin',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      status: 'active',
    })
    console.log(`✓ Seeded admin user: ${legacyAdminEmail}`)
  }

  // 4. Seed legacy psychologist
  const existingPsych = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, legacyPsychEmail))
    .limit(1)

  if (existingPsych.length === 0) {
    await db.insert(schema.users).values({
      email: legacyPsychEmail,
      name: haykalPsych?.name || 'Dr. Psychologist',
      passwordHash: defaultPasswordHash,
      role: 'psychologist',
      status: 'active',
      psychologistId: haykalPsych?.id || null,
    })
    console.log(`✓ Seeded psychologist user: ${legacyPsychEmail}`)
  }

  await client.end()
}

if (import.meta.main) {
  seedUsers().catch((err) => {
    console.error('Failed to seed users:', err)
    process.exit(1)
  })
}
