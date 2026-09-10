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
  const adminEmail = normalizeEmail('admin@attentive.id')
  const psychEmail = normalizeEmail('psychologist@attentive.id')
  const defaultPassword = 'Password123!'
  const passwordHash = await hashPassword(defaultPassword)

  // Seed Admin
  const existingAdmin = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1)

  if (existingAdmin.length === 0) {
    await db.insert(schema.users).values({
      email: adminEmail,
      name: 'Attentive Admin',
      passwordHash,
      role: 'admin',
      status: 'active',
    })
    console.log(`✓ Seeded admin user: ${adminEmail} (password: ${defaultPassword})`)
  } else {
    console.log(`ℹ Admin user already exists: ${adminEmail}`)
  }

  // Find a psychologist to link
  const [psychologist] = await db.select({ id: schema.psychologists.id, name: schema.psychologists.name })
    .from(schema.psychologists)
    .limit(1)

  // Seed Psychologist
  const existingPsych = await db.select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, psychEmail))
    .limit(1)

  if (existingPsych.length === 0) {
    await db.insert(schema.users).values({
      email: psychEmail,
      name: psychologist?.name || 'Dr. Psychologist',
      passwordHash,
      role: 'psychologist',
      status: 'active',
      psychologistId: psychologist?.id || null,
    })
    console.log(`✓ Seeded psychologist user: ${psychEmail} (password: ${defaultPassword})`)
  } else {
    console.log(`ℹ Psychologist user already exists: ${psychEmail}`)
  }

  await client.end()
}

if (import.meta.main) {
  seedUsers().catch((err) => {
    console.error('Failed to seed users:', err)
    process.exit(1)
  })
}
