import { describe, expect, it } from 'bun:test'
import {
  ARTICLE_LIFECYCLE_STATES,
  ARTICLE_REVISION_STATES,
  LANDING_SECTION_ORDER,
  MEDIA_LIFECYCLE_STATES,
  PSYCHOLOGIST_LIFECYCLE_STATES,
  PSYCHOLOGIST_SUPPORT_AREAS,
  USER_ROLES,
  USER_STATUSES,
} from '../../../../packages/shared/src'
import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core'
import {
  articleRevisionStatusEnum,
  articleReviews,
  articleRevisions,
  articleStatusEnum,
  articles,
  landingAggregates,
  landingItemTranslations,
  landingItems,
  landingPreviewCapabilities,
  landingRevisionStatusEnum,
  landingRevisions,
  landingSectionKeyEnum,
  landingSectionTranslations,
  landingSections,
  mediaAttachments,
  mediaLifecycleStatusEnum,
  mediaObjects,
  psychologistLifecycleStatusEnum,
  psychologistProfileTranslations,
  psychologistProfiles,
  psychologistSpecializationTranslations,
  psychologistSpecializations,
  psychologistSupportAreaEnum,
  psychologistSupportAreas,
  psychologists,
  userRefreshTokens,
  userRoleEnum,
  userStatusEnum,
  users,
} from './schema'

const configFor = (table: PgTable) => getTableConfig(table)
const columnsFor = (table: PgTable) => configFor(table).columns
const columnNamesFor = (table: PgTable) => columnsFor(table).map((column) => column.name)
const indexNamesFor = (table: PgTable) => configFor(table).indexes.map((index) => index.config.name)
const checkNamesFor = (table: PgTable) => configFor(table).checks.map((constraint) => constraint.name)
const uniqueNamesFor = (table: PgTable) => configFor(table).uniqueConstraints.map((constraint) => constraint.getName())

const expectRestrictiveForeignKeys = (tables: PgTable[]) => {
  for (const table of tables) {
    const config = configFor(table)
    expect(config.foreignKeys.length, `${config.name} should have foreign keys`).toBeGreaterThan(0)
    expect(config.foreignKeys.every((foreignKey) => foreignKey.onDelete === 'restrict'), config.name).toBe(true)
  }
}

const expectTimestamptz = (table: PgTable, names: string[]) => {
  for (const name of names) {
    const column = columnsFor(table).find((candidate) => candidate.name === name) as
      | (ReturnType<typeof columnsFor>[number] & { withTimezone?: boolean })
      | undefined

    expect(column, `${configFor(table).name}.${name}`).toBeDefined()
    expect(column?.columnType).toBe('PgTimestampString')
    expect(column?.withTimezone).toBe(true)
  }
}

describe('content domain schema', () => {
  it('mirrors shared lifecycle and locale-neutral section vocabulary', () => {
    expect(psychologistLifecycleStatusEnum.enumValues).toEqual([...PSYCHOLOGIST_LIFECYCLE_STATES])
    expect(psychologistSupportAreaEnum.enumValues).toEqual([...PSYCHOLOGIST_SUPPORT_AREAS])
    expect(articleStatusEnum.enumValues).toEqual([...ARTICLE_LIFECYCLE_STATES])
    expect(articleRevisionStatusEnum.enumValues).toEqual([...ARTICLE_REVISION_STATES])
    expect(mediaLifecycleStatusEnum.enumValues).toEqual([...MEDIA_LIFECYCLE_STATES])
    expect(landingSectionKeyEnum.enumValues).toEqual([...LANDING_SECTION_ORDER])
    expect(landingRevisionStatusEnum.enumValues).toEqual(['draft', 'published', 'superseded'])
    expect(userRoleEnum.enumValues).toEqual([...USER_ROLES])
    expect(userStatusEnum.enumValues).toEqual([...USER_STATUSES])
  })

  it('stores production user accounts and token rotation metadata with UUID primary keys', () => {
    const userColumns = columnNamesFor(users)
    expect(userColumns).toEqual(expect.arrayContaining([
      'id',
      'email',
      'name',
      'password_hash',
      'role',
      'status',
      'psychologist_id',
      'last_login_at',
      'created_at',
      'updated_at',
    ]))
    expect(indexNamesFor(users)).toContain('users_email_unique')
    expect(indexNamesFor(users)).toContain('users_role_idx')
    expect(indexNamesFor(users)).toContain('users_status_idx')

    const tokenColumns = columnNamesFor(userRefreshTokens)
    expect(tokenColumns).toEqual(expect.arrayContaining([
      'id',
      'user_id',
      'token_hash',
      'expires_at',
      'revoked_at',
      'created_at',
    ]))
    expect(indexNamesFor(userRefreshTokens)).toContain('user_refresh_tokens_token_hash_unique')
  })


  it('models one singleton landing aggregate with separate revision pointers and one active draft', () => {
    expect(columnNamesFor(landingAggregates)).toEqual(expect.arrayContaining([
      'id',
      'singleton_key',
      'active_draft_revision_id',
      'published_revision_id',
      'created_at',
      'updated_at',
    ]))
    expect(indexNamesFor(landingAggregates)).toContain('landing_aggregates_singleton_key_unique')
    expect(checkNamesFor(landingAggregates)).toContain('landing_aggregates_distinct_revision_pointers')
    expect(indexNamesFor(landingRevisions)).toContain('landing_revisions_one_draft_per_aggregate')
    expect(uniqueNamesFor(landingRevisions)).toContain('landing_revisions_aggregate_revision_number_unique')
    expect(columnNamesFor(landingRevisions)).toEqual(expect.arrayContaining([
      'based_on_revision_id',
      'revision_number',
      'status',
      'published_at',
    ]))
    expectTimestamptz(landingRevisions, ['created_at', 'published_at'])
  })

  it('locks fixed landing sections, paired translations, shared item identity, and ordering', () => {
    expect(checkNamesFor(landingSections)).toEqual(expect.arrayContaining([
      'landing_sections_position_range',
      'landing_sections_key_position_match',
    ]))
    expect(uniqueNamesFor(landingSections)).toEqual(expect.arrayContaining([
      'landing_sections_revision_key_unique',
      'landing_sections_revision_position_unique',
    ]))
    expect(uniqueNamesFor(landingSectionTranslations)).toContain('landing_section_translations_section_locale_unique')
    expect(uniqueNamesFor(landingItems)).toContain('landing_items_section_position_unique')
    expect(uniqueNamesFor(landingItemTranslations)).toContain('landing_item_translations_item_locale_unique')
    expect(columnNamesFor(landingSectionTranslations)).toEqual(expect.arrayContaining([
      'section_id',
      'locale',
      'headline',
      'description',
      'primary_cta',
      'secondary_cta',
      'contact',
      'session_label',
      'price',
      'price_unit',
    ]))
    expect(columnNamesFor(landingItemTranslations)).toEqual(expect.arrayContaining([
      'item_id',
      'locale',
      'title',
      'description',
    ]))
  })

  it('stores preview capability digests and revocation metadata without raw secrets', () => {
    const previewColumns = columnNamesFor(landingPreviewCapabilities)
    expect(previewColumns).toEqual([
      'id',
      'landing_revision_id',
      'token_digest',
      'expires_at',
      'revoked_at',
      'created_at',
    ])
    expect(previewColumns).not.toContain('token')
    expect(indexNamesFor(landingPreviewCapabilities)).toContain('landing_preview_capabilities_token_digest_unique')
    expect(columnsFor(landingPreviewCapabilities).find((column) => column.name === 'id')?.hasDefault).toBe(true)
    expectTimestamptz(landingPreviewCapabilities, ['expires_at', 'revoked_at', 'created_at'])
  })

  it('keeps one canonical psychologist with profile, support, specialization, and media relations', () => {
    expect(columnNamesFor(psychologists)).toEqual(expect.arrayContaining([
      'id',
      'slug',
      'status',
      'name',
      'nickname',
      'featured',
      'featured_order',
    ]))
    expect(indexNamesFor(psychologists)).toEqual(expect.arrayContaining([
      'psychologists_slug_unique',
      'psychologists_featured_order_unique',
      'psychologists_public_directory_idx',
    ]))
    expect(checkNamesFor(psychologists)).toContain('psychologists_featured_order_consistent')
    expect(columnNamesFor(psychologistProfiles)).toEqual(expect.arrayContaining([
      'psychologist_id',
      'credential',
      'experience_years',
      'license_number',
      'booking_url',
    ]))
    expect(uniqueNamesFor(psychologistProfileTranslations)).toContain('psychologist_profile_translations_profile_locale_unique')
    expect(uniqueNamesFor(psychologistSupportAreas)).toContain('psychologist_support_areas_psychologist_area_unique')
    expect(uniqueNamesFor(psychologistSpecializations)).toContain('psychologist_specializations_psychologist_position_unique')
    expect(uniqueNamesFor(psychologistSpecializationTranslations)).toContain('psychologist_specialization_translations_specialization_locale_unique')
  })

  it('separates article draft and published pointers while retaining review history', () => {
    expect(columnNamesFor(articles)).toEqual(expect.arrayContaining([
      'owner_psychologist_id',
      'slug',
      'status',
      'draft_revision_id',
      'published_revision_id',
    ]))
    expect(indexNamesFor(articles)).toContain('articles_slug_unique')
    expect(checkNamesFor(articles)).toContain('articles_distinct_revision_pointers')
    expect(indexNamesFor(articleRevisions)).toContain('article_revisions_one_draft_per_article')
    expect(uniqueNamesFor(articleRevisions)).toContain('article_revisions_article_revision_number_unique')
    expect(columnNamesFor(articleRevisions)).toEqual(expect.arrayContaining([
      'title_id',
      'title_en',
      'summary_id',
      'summary_en',
      'body_id',
      'body_en',
      'submitted_at',
      'approved_at',
    ]))
    expect(columnNamesFor(articleReviews)).toEqual(expect.arrayContaining([
      'article_revision_id',
      'reviewer_id',
      'decision',
      'notes',
      'created_at',
    ]))
    expectTimestamptz(articleReviews, ['created_at'])
  })

  it('stores portable media metadata and exactly one typed attachment owner without binaries', () => {
    const mediaColumns = columnNamesFor(mediaObjects)
    expect(mediaColumns).toEqual(expect.arrayContaining([
      'id',
      'object_key',
      'public_url',
      'width',
      'height',
      'alt_id',
      'alt_en',
      'lifecycle',
      'orphaned_at',
    ]))
    expect(checkNamesFor(mediaObjects)).toEqual(expect.arrayContaining([
      'media_objects_exactly_one_reference',
      'media_objects_positive_geometry',
      'media_objects_orphan_timestamp_consistent',
    ]))
    expect(checkNamesFor(mediaAttachments)).toContain('media_attachments_exactly_one_owner')
    expect(columnNamesFor(mediaAttachments)).toEqual(expect.arrayContaining([
      'media_object_id',
      'psychologist_id',
      'landing_revision_id',
      'article_revision_id',
      'role',
      'position',
      'detached_at',
    ]))

    const prohibitedColumnPattern = /binary|blob|bytea|provider|bucket|secret|raw_token/i
    expect([...mediaColumns, ...columnNamesFor(mediaAttachments)].some((name) => prohibitedColumnPattern.test(name))).toBe(false)
  })

  it('uses UUID identities and timezone-aware timestamps throughout the content domain', () => {
    const identityColumns: Array<[PgTable, string]> = [
      [landingAggregates, 'id'],
      [landingRevisions, 'id'],
      [landingSections, 'id'],
      [landingSectionTranslations, 'id'],
      [landingItems, 'id'],
      [landingItemTranslations, 'id'],
      [landingPreviewCapabilities, 'id'],
      [psychologists, 'id'],
      [users, 'id'],
      [userRefreshTokens, 'id'],
      [psychologistProfiles, 'psychologist_id'],

      [psychologistProfileTranslations, 'id'],
      [psychologistSupportAreas, 'psychologist_id'],
      [psychologistSpecializations, 'id'],
      [psychologistSpecializationTranslations, 'id'],
      [articles, 'id'],
      [articleRevisions, 'id'],
      [articleReviews, 'id'],
      [mediaObjects, 'id'],
      [mediaAttachments, 'id'],
    ]

    for (const [table, identityName] of identityColumns) {
      const identityColumn = columnsFor(table).find((column) => column.name === identityName)
      expect(identityColumn?.columnType, `${configFor(table).name}.${identityName}`).toBe('PgUUID')
    }

    for (const [table] of identityColumns) {
      const timestampColumns = columnsFor(table).filter((column) => column.name.endsWith('_at')) as
        Array<ReturnType<typeof columnsFor>[number] & { withTimezone?: boolean }>

      expect(timestampColumns.every((column) => column.columnType === 'PgTimestampString' && column.withTimezone === true), configFor(table).name).toBe(true)
    }
  })

  it('uses restrictive deletes across revision, canonical identity, review, and media history', () => {
    expectRestrictiveForeignKeys([
      landingRevisions,
      landingSections,
      landingSectionTranslations,
      landingItems,
      landingItemTranslations,
      landingPreviewCapabilities,
      psychologistProfiles,
      psychologistProfileTranslations,
      psychologistSupportAreas,
      psychologistSpecializations,
      psychologistSpecializationTranslations,
      articles,
      articleRevisions,
      articleReviews,
      mediaAttachments,
    ])
  })
})
