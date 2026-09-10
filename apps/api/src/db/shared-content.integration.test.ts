import { afterAll, describe, expect, test } from 'bun:test'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import { createDrizzleLandingContentSource, createLandingContentRepository } from '../repositories/landing-content.repository'
import { createDrizzlePsychologistQuerySource, createPsychologistsRepository } from '../repositories/psychologists.repository'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required for shared-content integration tests.')

const databaseName = new URL(databaseUrl).pathname.slice(1)
if (!/^attentiveid_test_[a-z0-9_]+$/.test(databaseName)) {
  throw new Error('Shared-content integration tests require a disposable attentiveid_test_* database.')
}

const client = postgres(databaseUrl, { max: 2 })
const database = drizzle(client, { schema })

afterAll(async () => {
  await client.end()
})

describe('shared content live PostgreSQL contract', () => {
  test('runs only against the exact disposable target', async () => {
    const rows = await client<{ name: string }[]>`select current_database() as name`
    expect(rows[0]?.name).toBe(databaseName)
  })

  test('applies every shared-content table to PostgreSQL 16', async () => {
    const rows = await client<{ table_name: string }[]>`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
    `
    const tables = new Set(rows.map(({ table_name }) => table_name))

    for (const table of [
      'landing_aggregates',
      'landing_revisions',
      'landing_sections',
      'landing_section_translations',
      'landing_items',
      'landing_item_translations',
      'psychologists',
      'psychologist_profiles',
      'psychologist_profile_translations',
      'psychologist_support_areas',
      'psychologist_specializations',
      'psychologist_specialization_translations',
      'articles',
      'article_revisions',
      'article_reviews',
      'media_objects',
      'media_attachments',
      'landing_preview_capabilities',
    ]) expect(tables.has(table)).toBe(true)
  })

  test('keeps repeatable psychologist seeds canonical and publicly queryable', async () => {
    const counts = await client<{ total: number; unique_slugs: number }[]>`
      select count(*)::int as total, count(distinct slug)::int as unique_slugs
      from psychologists
    `
    expect(counts[0]?.total).toBeGreaterThan(0)
    expect(counts[0]?.unique_slugs).toBe(counts[0]?.total)

    const repository = createPsychologistsRepository(
      createDrizzlePsychologistQuerySource(database),
      { publicHosts: [] },
    )
    const psychologists = await repository.list({ locale: 'en', limit: 50 })
    expect(psychologists.length).toBe(counts[0]?.total)
    expect(psychologists.every(({ id, slug }) => Boolean(id && slug))).toBe(true)
    expect(psychologists.every(({ media }) => !media || (media.width > 0 && media.height > 0))).toBe(true)
  })

  test('publishes one complete canonical landing revision on a clean database', async () => {
    const repository = createLandingContentRepository(createDrizzleLandingContentSource(database))
    const landing = await repository.getPublished()

    expect(landing?.revision.status).toBe('published')
    expect(landing?.revision.revisionNumber).toBe(1)
    expect(landing?.content.sections[0].key).toBe('hero')
    expect(landing?.content.sections[0].items).toHaveLength(4)
    expect(landing?.content.sections[6].key).toBe('consultationReassurance')
    expect(landing?.content.sections[6].price.en).toBe('IDR 475,000')
  })

  test('searches localized areas of experience through the canonical PostgreSQL source', async () => {
    const repository = createPsychologistsRepository(
      createDrizzlePsychologistQuerySource(database),
      { publicHosts: [] },
    )

    const psychologists = await repository.list({ locale: 'en', search: 'Brainspotting', limit: 50 })

    expect(psychologists.map(({ slug }) => slug)).toEqual(['gita'])
  })
})
