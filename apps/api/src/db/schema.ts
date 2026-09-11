import { pgTable, text } from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';
import {
    type AnyPgColumn,
    boolean,
    check,
    index,
    integer,
    pgEnum,
    primaryKey,
    timestamp,
    unique,
    uniqueIndex,
    uuid
} from 'drizzle-orm/pg-core';
import {
    ARTICLE_LIFECYCLE_STATES,
    ARTICLE_REVISION_STATES,
    CONTENT_LOCALES,
    LANDING_SECTION_ORDER,
    MEDIA_LIFECYCLE_STATES,
    PRACTICE_BRANCHES,
    PSYCHOLOGIST_LIFECYCLE_STATES,
    PSYCHOLOGIST_SUPPORT_AREAS,
    PSYCHOLOGIST_TIERS,
    USER_ROLES,
    USER_STATUSES
} from '@attentiveid/shared';

export const contentLocaleEnum = pgEnum('content_locale', CONTENT_LOCALES);
export const landingSectionKeyEnum = pgEnum('landing_section_key', LANDING_SECTION_ORDER);
export const landingRevisionStatusEnum = pgEnum('landing_revision_status', ['draft', 'published', 'superseded']);
export const psychologistLifecycleStatusEnum = pgEnum('psychologist_lifecycle_status', PSYCHOLOGIST_LIFECYCLE_STATES);
export const psychologistSupportAreaEnum = pgEnum('psychologist_support_area', PSYCHOLOGIST_SUPPORT_AREAS);
export const psychologistTierEnum = pgEnum('psychologist_tier', PSYCHOLOGIST_TIERS);
export const practiceBranchEnum = pgEnum('practice_branch', PRACTICE_BRANCHES);
export const articleStatusEnum = pgEnum('article_status', ARTICLE_LIFECYCLE_STATES);
export const articleRevisionStatusEnum = pgEnum('article_revision_status', ARTICLE_REVISION_STATES);
export const articleReviewDecisionEnum = pgEnum('article_review_decision', ['approved', 'rejected']);
export const mediaLifecycleStatusEnum = pgEnum('media_lifecycle_status', MEDIA_LIFECYCLE_STATES);
export const userRoleEnum = pgEnum('user_role', USER_ROLES);
export const userStatusEnum = pgEnum('user_status', USER_STATUSES);


const auditTimestamps = {
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
};

export const landingAggregates = pgTable('landing_aggregates', {
    id: uuid('id').defaultRandom().primaryKey(),
    singletonKey: boolean('singleton_key').default(true).notNull(),
    activeDraftRevisionId: uuid('active_draft_revision_id').references((): AnyPgColumn => landingRevisions.id, { onDelete: 'restrict' }),
    publishedRevisionId: uuid('published_revision_id').references((): AnyPgColumn => landingRevisions.id, { onDelete: 'restrict' }),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('landing_aggregates_singleton_key_unique').on(table.singletonKey),
    check(
        'landing_aggregates_distinct_revision_pointers',
        sql`${table.activeDraftRevisionId} is null or ${table.publishedRevisionId} is null or ${table.activeDraftRevisionId} <> ${table.publishedRevisionId}`
    )
]);

export const landingRevisions = pgTable('landing_revisions', {
    id: uuid('id').defaultRandom().primaryKey(),
    aggregateId: uuid('aggregate_id').notNull().references((): AnyPgColumn => landingAggregates.id, { onDelete: 'restrict' }),
    basedOnRevisionId: uuid('based_on_revision_id').references((): AnyPgColumn => landingRevisions.id, { onDelete: 'restrict' }),
    revisionNumber: integer('revision_number').notNull(),
    status: landingRevisionStatusEnum('status').default('draft').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'string' })
}, (table) => [
    unique('landing_revisions_aggregate_revision_number_unique').on(table.aggregateId, table.revisionNumber),
    unique('landing_revisions_aggregate_id_id_unique').on(table.aggregateId, table.id),
    uniqueIndex('landing_revisions_one_draft_per_aggregate')
        .on(table.aggregateId)
        .where(sql`${table.status} = 'draft'`),
    check('landing_revisions_positive_revision_number', sql`${table.revisionNumber} > 0`)
]);

export const landingSections = pgTable('landing_sections', {
    id: uuid('id').defaultRandom().primaryKey(),
    landingRevisionId: uuid('landing_revision_id').notNull().references(() => landingRevisions.id, { onDelete: 'restrict' }),
    key: landingSectionKeyEnum('key').notNull(),
    position: integer('position').notNull(),
    visible: boolean('visible').default(true).notNull(),
    ...auditTimestamps
}, (table) => [
    unique('landing_sections_revision_key_unique').on(table.landingRevisionId, table.key),
    unique('landing_sections_revision_position_unique').on(table.landingRevisionId, table.position),
    check('landing_sections_position_range', sql`${table.position} between 0 and 8`),
    check('landing_sections_key_position_match', sql`
        case ${table.key}
            when 'hero' then 0
            when 'supportExplorer' then 1
            when 'carePromise' then 2
            when 'featuredPsychologists' then 3
            when 'careJourney' then 4
            when 'clientStories' then 5
            when 'consultationReassurance' then 6
            when 'frequentlyAskedQuestions' then 7
            when 'closingInvitation' then 8
        end = ${table.position}
    `)
]);

export const landingSectionTranslations = pgTable('landing_section_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    sectionId: uuid('section_id').notNull().references(() => landingSections.id, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    headline: text('headline').notNull(),
    description: text('description').notNull(),
    primaryCta: text('primary_cta'),
    secondaryCta: text('secondary_cta'),
    contact: text('contact'),
    sessionLabel: text('session_label'),
    price: text('price'),
    priceUnit: text('price_unit')
}, (table) => [
    unique('landing_section_translations_section_locale_unique').on(table.sectionId, table.locale)
]);

export const landingItems = pgTable('landing_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    sectionId: uuid('section_id').notNull().references(() => landingSections.id, { onDelete: 'restrict' }),
    position: integer('position').notNull(),
    ...auditTimestamps
}, (table) => [
    unique('landing_items_section_position_unique').on(table.sectionId, table.position),
    check('landing_items_non_negative_position', sql`${table.position} >= 0`)
]);

export const landingItemTranslations = pgTable('landing_item_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    itemId: uuid('item_id').notNull().references(() => landingItems.id, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull()
}, (table) => [
    unique('landing_item_translations_item_locale_unique').on(table.itemId, table.locale)
]);

export const landingPreviewCapabilities = pgTable('landing_preview_capabilities', {
    id: uuid('id').defaultRandom().primaryKey(),
    landingRevisionId: uuid('landing_revision_id').notNull().references(() => landingRevisions.id, { onDelete: 'restrict' }),
    tokenDigest: text('token_digest').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    uniqueIndex('landing_preview_capabilities_token_digest_unique').on(table.tokenDigest),
    index('landing_preview_capabilities_expiry_idx').on(table.expiresAt, table.revokedAt)
]);

export const psychologists = pgTable('psychologists', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    status: psychologistLifecycleStatusEnum('status').default('draft').notNull(),
    name: text('name').notNull(),
    nickname: text('nickname').notNull(),
    tier: psychologistTierEnum('tier').default('mid').notNull(),
    primaryBranch: practiceBranchEnum('primary_branch').default('tbi').notNull(),
    acceptingNewClients: boolean('accepting_new_clients').default(true).notNull(),
    featured: boolean('featured').default(false).notNull(),
    featuredOrder: integer('featured_order'),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('psychologists_slug_unique').on(table.slug),
    uniqueIndex('psychologists_featured_order_unique')
        .on(table.featuredOrder)
        .where(sql`${table.featured} = true`),
    index('psychologists_public_directory_idx').on(table.status, table.name),
    check(
        'psychologists_featured_order_consistent',
        sql`(${table.featured} = true and ${table.featuredOrder} is not null and ${table.featuredOrder} >= 0) or (${table.featured} = false and ${table.featuredOrder} is null)`
    )
]);


export const users = pgTable('users', {

    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').default('psychologist').notNull(),
    status: userStatusEnum('status').default('active').notNull(),
    psychologistId: uuid('psychologist_id').references(() => psychologists.id, { onDelete: 'set null' }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'string' }),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    index('users_role_idx').on(table.role),
    index('users_status_idx').on(table.status)
]);

export const userRefreshTokens = pgTable('user_refresh_tokens', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    uniqueIndex('user_refresh_tokens_token_hash_unique').on(table.tokenHash),
    index('user_refresh_tokens_user_id_idx').on(table.userId)
]);

export const psychologistProfiles = pgTable('psychologist_profiles', {

    psychologistId: uuid('psychologist_id').primaryKey().references(() => psychologists.id, { onDelete: 'restrict' }),
    credential: text('credential').notNull(),
    experienceYears: integer('experience_years').notNull(),
    licenseNumber: text('license_number').notNull(),
    bookingUrl: text('booking_url').notNull(),
    premiumBookingUrl: text('premium_booking_url'),
    ...auditTimestamps
}, (table) => [
    check('psychologist_profiles_non_negative_experience', sql`${table.experienceYears} >= 0`)
]);

export const psychologistProfileTranslations = pgTable('psychologist_profile_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    psychologistId: uuid('psychologist_id').notNull().references(() => psychologistProfiles.psychologistId, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    biography: text('biography').notNull(),
    availabilityMessage: text('availability_message').notNull()
}, (table) => [
    unique('psychologist_profile_translations_profile_locale_unique').on(table.psychologistId, table.locale)
]);

export const psychologistSupportAreas = pgTable('psychologist_support_areas', {
    psychologistId: uuid('psychologist_id').notNull().references(() => psychologists.id, { onDelete: 'restrict' }),
    supportArea: psychologistSupportAreaEnum('support_area').notNull(),
    primary: boolean('primary').default(false).notNull(),
    position: integer('position').notNull()
}, (table) => [
    primaryKey({ name: 'psychologist_support_areas_pk', columns: [table.psychologistId, table.supportArea] }),
    unique('psychologist_support_areas_psychologist_area_unique').on(table.psychologistId, table.supportArea),
    unique('psychologist_support_areas_psychologist_position_unique').on(table.psychologistId, table.position),
    check('psychologist_support_areas_non_negative_position', sql`${table.position} >= 0`)
]);

export const psychologistSpecializations = pgTable('psychologist_specializations', {
    id: uuid('id').defaultRandom().primaryKey(),
    psychologistId: uuid('psychologist_id').notNull().references(() => psychologists.id, { onDelete: 'restrict' }),
    position: integer('position').notNull()
}, (table) => [
    unique('psychologist_specializations_psychologist_position_unique').on(table.psychologistId, table.position),
    check('psychologist_specializations_non_negative_position', sql`${table.position} >= 0`)
]);

export const psychologistSpecializationTranslations = pgTable('psychologist_specialization_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    specializationId: uuid('specialization_id').notNull().references(() => psychologistSpecializations.id, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    label: text('label').notNull()
}, (table) => [
    unique('psychologist_specialization_translations_specialization_locale_unique').on(table.specializationId, table.locale)
]);

export const articles = pgTable('articles', {
    id: uuid('id').defaultRandom().primaryKey(),
    ownerPsychologistId: uuid('owner_psychologist_id').notNull().references(() => psychologists.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    status: articleStatusEnum('status').default('draft').notNull(),
    draftRevisionId: uuid('draft_revision_id').references((): AnyPgColumn => articleRevisions.id, { onDelete: 'restrict' }),
    publishedRevisionId: uuid('published_revision_id').references((): AnyPgColumn => articleRevisions.id, { onDelete: 'restrict' }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'string' }),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('articles_slug_unique').on(table.slug),
    index('articles_owner_status_idx').on(table.ownerPsychologistId, table.status),
    check(
        'articles_distinct_revision_pointers',
        sql`${table.draftRevisionId} is null or ${table.publishedRevisionId} is null or ${table.draftRevisionId} <> ${table.publishedRevisionId}`
    )
]);

export const articleRevisions = pgTable('article_revisions', {
    id: uuid('id').defaultRandom().primaryKey(),
    articleId: uuid('article_id').notNull().references((): AnyPgColumn => articles.id, { onDelete: 'restrict' }),
    revisionNumber: integer('revision_number').notNull(),
    status: articleRevisionStatusEnum('status').default('draft').notNull(),
    titleId: text('title_id').notNull(),
    titleEn: text('title_en').notNull(),
    summaryId: text('summary_id').notNull(),
    summaryEn: text('summary_en').notNull(),
    bodyId: text('body_id').notNull(),
    bodyEn: text('body_en').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'string' }),
    approvedAt: timestamp('approved_at', { withTimezone: true, mode: 'string' })
}, (table) => [
    unique('article_revisions_article_revision_number_unique').on(table.articleId, table.revisionNumber),
    unique('article_revisions_article_id_id_unique').on(table.articleId, table.id),
    uniqueIndex('article_revisions_one_draft_per_article')
        .on(table.articleId)
        .where(sql`${table.status} = 'draft'`),
    check('article_revisions_positive_revision_number', sql`${table.revisionNumber} > 0`)
]);

export const articleReviews = pgTable('article_reviews', {
    id: uuid('id').defaultRandom().primaryKey(),
    articleRevisionId: uuid('article_revision_id').notNull().references(() => articleRevisions.id, { onDelete: 'restrict' }),
    reviewerId: uuid('reviewer_id').notNull(),
    decision: articleReviewDecisionEnum('decision').notNull(),
    notes: text('notes').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('article_reviews_revision_created_idx').on(table.articleRevisionId, table.createdAt)
]);

export const mediaObjects = pgTable('media_objects', {
    id: uuid('id').defaultRandom().primaryKey(),
    objectKey: text('object_key'),
    publicUrl: text('public_url'),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    altId: text('alt_id').notNull(),
    altEn: text('alt_en').notNull(),
    mimeType: text('mime_type').notNull(),
    byteSize: integer('byte_size'),
    lifecycle: mediaLifecycleStatusEnum('lifecycle').default('active').notNull(),
    orphanedAt: timestamp('orphaned_at', { withTimezone: true, mode: 'string' }),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('media_objects_object_key_unique').on(table.objectKey),
    uniqueIndex('media_objects_public_url_unique').on(table.publicUrl),
    check(
        'media_objects_exactly_one_reference',
        sql`num_nonnulls(${table.objectKey}, ${table.publicUrl}) = 1`
    ),
    check('media_objects_positive_geometry', sql`${table.width} > 0 and ${table.height} > 0`),
    check(
        'media_objects_orphan_timestamp_consistent',
        sql`(${table.lifecycle} = 'active' and ${table.orphanedAt} is null) or (${table.lifecycle} in ('orphaned', 'deleted') and ${table.orphanedAt} is not null)`
    )
]);

export const mediaAttachments = pgTable('media_attachments', {
    id: uuid('id').defaultRandom().primaryKey(),
    mediaObjectId: uuid('media_object_id').notNull().references(() => mediaObjects.id, { onDelete: 'restrict' }),
    psychologistId: uuid('psychologist_id').references(() => psychologists.id, { onDelete: 'restrict' }),
    landingRevisionId: uuid('landing_revision_id').references(() => landingRevisions.id, { onDelete: 'restrict' }),
    articleRevisionId: uuid('article_revision_id').references(() => articleRevisions.id, { onDelete: 'restrict' }),
    role: text('role').notNull(),
    position: integer('position').default(0).notNull(),
    detachedAt: timestamp('detached_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    check(
        'media_attachments_exactly_one_owner',
        sql`num_nonnulls(${table.psychologistId}, ${table.landingRevisionId}, ${table.articleRevisionId}) = 1`
    ),
    check('media_attachments_non_negative_position', sql`${table.position} >= 0`),
    uniqueIndex('media_attachments_psychologist_role_position_unique')
        .on(table.psychologistId, table.role, table.position)
        .where(sql`${table.psychologistId} is not null and ${table.detachedAt} is null`),
    uniqueIndex('media_attachments_landing_role_position_unique')
        .on(table.landingRevisionId, table.role, table.position)
        .where(sql`${table.landingRevisionId} is not null and ${table.detachedAt} is null`),
    uniqueIndex('media_attachments_article_role_position_unique')
        .on(table.articleRevisionId, table.role, table.position)
        .where(sql`${table.articleRevisionId} is not null and ${table.detachedAt} is null`),
    index('media_attachments_media_object_idx').on(table.mediaObjectId)
]);

export const landingAggregatesRelations = relations(landingAggregates, ({ many, one }) => ({
    revisions: many(landingRevisions, { relationName: 'landingAggregateRevisions' }),
    activeDraftRevision: one(landingRevisions, {
        relationName: 'landingActiveDraftRevision',
        fields: [landingAggregates.id, landingAggregates.activeDraftRevisionId],
        references: [landingRevisions.aggregateId, landingRevisions.id]
    }),
    publishedRevision: one(landingRevisions, {
        relationName: 'landingPublishedRevision',
        fields: [landingAggregates.id, landingAggregates.publishedRevisionId],
        references: [landingRevisions.aggregateId, landingRevisions.id]
    })
}));

export const landingRevisionsRelations = relations(landingRevisions, ({ many, one }) => ({
    aggregate: one(landingAggregates, {
        relationName: 'landingAggregateRevisions',
        fields: [landingRevisions.aggregateId],
        references: [landingAggregates.id]
    }),
    basedOnRevision: one(landingRevisions, {
        relationName: 'landingRevisionLineage',
        fields: [landingRevisions.basedOnRevisionId],
        references: [landingRevisions.id]
    }),
    derivedRevisions: many(landingRevisions, { relationName: 'landingRevisionLineage' }),
    sections: many(landingSections),
    previewCapabilities: many(landingPreviewCapabilities),
    mediaAttachments: many(mediaAttachments)
}));

export const landingSectionsRelations = relations(landingSections, ({ many, one }) => ({
    revision: one(landingRevisions, {
        fields: [landingSections.landingRevisionId],
        references: [landingRevisions.id]
    }),
    translations: many(landingSectionTranslations),
    items: many(landingItems)
}));

export const landingSectionTranslationsRelations = relations(landingSectionTranslations, ({ one }) => ({
    section: one(landingSections, {
        fields: [landingSectionTranslations.sectionId],
        references: [landingSections.id]
    })
}));

export const landingItemsRelations = relations(landingItems, ({ many, one }) => ({
    section: one(landingSections, {
        fields: [landingItems.sectionId],
        references: [landingSections.id]
    }),
    translations: many(landingItemTranslations)
}));

export const landingItemTranslationsRelations = relations(landingItemTranslations, ({ one }) => ({
    item: one(landingItems, {
        fields: [landingItemTranslations.itemId],
        references: [landingItems.id]
    })
}));

export const psychologistsRelations = relations(psychologists, ({ many, one }) => ({
    profile: one(psychologistProfiles),
    supportAreas: many(psychologistSupportAreas),
    specializations: many(psychologistSpecializations),
    articles: many(articles),
    mediaAttachments: many(mediaAttachments)
}));

export const psychologistProfilesRelations = relations(psychologistProfiles, ({ many, one }) => ({
    psychologist: one(psychologists, {
        fields: [psychologistProfiles.psychologistId],
        references: [psychologists.id]
    }),
    translations: many(psychologistProfileTranslations)
}));

export const psychologistSpecializationsRelations = relations(psychologistSpecializations, ({ many, one }) => ({
    psychologist: one(psychologists, {
        fields: [psychologistSpecializations.psychologistId],
        references: [psychologists.id]
    }),
    translations: many(psychologistSpecializationTranslations)
}));

export const articlesRelations = relations(articles, ({ many, one }) => ({
    owner: one(psychologists, {
        fields: [articles.ownerPsychologistId],
        references: [psychologists.id]
    }),
    revisions: many(articleRevisions, { relationName: 'articleRevisions' }),
    draftRevision: one(articleRevisions, {
        relationName: 'articleDraftRevision',
        fields: [articles.id, articles.draftRevisionId],
        references: [articleRevisions.articleId, articleRevisions.id]
    }),
    publishedRevision: one(articleRevisions, {
        relationName: 'articlePublishedRevision',
        fields: [articles.id, articles.publishedRevisionId],
        references: [articleRevisions.articleId, articleRevisions.id]
    })
}));

export const articleRevisionsRelations = relations(articleRevisions, ({ many, one }) => ({
    article: one(articles, {
        relationName: 'articleRevisions',
        fields: [articleRevisions.articleId],
        references: [articles.id]
    }),
    reviews: many(articleReviews),
    mediaAttachments: many(mediaAttachments)
}));

export const mediaObjectsRelations = relations(mediaObjects, ({ many }) => ({
    attachments: many(mediaAttachments)
}));

export const mediaAttachmentsRelations = relations(mediaAttachments, ({ one }) => ({
    mediaObject: one(mediaObjects, {
        fields: [mediaAttachments.mediaObjectId],
        references: [mediaObjects.id]
    }),
    psychologist: one(psychologists, {
        fields: [mediaAttachments.psychologistId],
        references: [psychologists.id]
    }),
    landingRevision: one(landingRevisions, {
        fields: [mediaAttachments.landingRevisionId],
        references: [landingRevisions.id]
    }),
    articleRevision: one(articleRevisions, {
        fields: [mediaAttachments.articleRevisionId],
        references: [articleRevisions.id]
    })
}));
