import { pgTable, text } from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';
import {
    type AnyPgColumn,
    boolean,
    check,
    customType,
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
    BOOKING_STATUSES,
    CONTENT_LOCALES,
    LANDING_SECTION_ORDER,
    MEDIA_LIFECYCLE_STATES,
    PRACTICE_BRANCHES,
    PSYCHOLOGIST_LIFECYCLE_STATES,
    PSYCHOLOGIST_SUPPORT_AREAS,
    PSYCHOLOGIST_TIERS,
    SERVICE_LIFECYCLE_STATUSES,
    SERVICE_PRICING_MODELS,
    SERVICE_PROGRAM_STATUSES,
    SERVICE_PROGRAM_TYPES,
    SERVICE_TYPES,
    SERVICE_VISIBILITIES,
    USER_ROLES,
    USER_STATUSES,
    WEBHOOK_DELIVERY_STATUSES
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
export const bookingStatusEnum = pgEnum('booking_status', BOOKING_STATUSES);
export const webhookDeliveryStatusEnum = pgEnum('webhook_delivery_status', WEBHOOK_DELIVERY_STATUSES);
export const serviceTypeEnum = pgEnum('service_type', SERVICE_TYPES);
export const serviceLifecycleStatusEnum = pgEnum('service_lifecycle_status', SERVICE_LIFECYCLE_STATUSES);
export const serviceVisibilityEnum = pgEnum('service_visibility', SERVICE_VISIBILITIES);
export const servicePricingModelEnum = pgEnum('service_pricing_model', SERVICE_PRICING_MODELS);
export const serviceProgramTypeEnum = pgEnum('service_program_type', SERVICE_PROGRAM_TYPES);
export const serviceProgramStatusEnum = pgEnum('service_program_status', SERVICE_PROGRAM_STATUSES);


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
    consultationDuration: text('consultation_duration').default('60 menit').notNull(),
    onlineRate: integer('online_rate'),
    offlineRate: integer('offline_rate'),
    availableOnline: boolean('available_online').default(false).notNull(),
    availableTbi: boolean('available_tbi').default(false).notNull(),
    availableBsd: boolean('available_bsd').default(false).notNull(),
    availableMalang: boolean('available_malang').default(false).notNull(),
    scheduleMon: text('schedule_mon'),
    scheduleTue: text('schedule_tue'),
    scheduleWed: text('schedule_wed'),
    scheduleThu: text('schedule_thu'),
    scheduleFri: text('schedule_fri'),
    scheduleSat: text('schedule_sat'),
    scheduleSun: text('schedule_sun'),
    ...auditTimestamps
}, (table) => [
    check('psychologist_profiles_non_negative_experience', sql`${table.experienceYears} >= 0`),
    check('psychologist_profiles_non_negative_online_rate', sql`${table.onlineRate} is null or ${table.onlineRate} >= 0`),
    check('psychologist_profiles_non_negative_offline_rate', sql`${table.offlineRate} is null or ${table.offlineRate} >= 0`),
    check('psychologist_profiles_online_rate_required', sql`${table.availableOnline} = false or ${table.onlineRate} is not null`),
    check('psychologist_profiles_offline_rate_required', sql`(not ${table.availableTbi} and not ${table.availableBsd} and not ${table.availableMalang}) or ${table.offlineRate} is not null`)
]);

export const psychologistProfileTranslations = pgTable('psychologist_profile_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    psychologistId: uuid('psychologist_id').notNull().references(() => psychologistProfiles.psychologistId, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    biography: text('biography').notNull(),
    shortBio: text('short_bio'),
    conversationQuote: text('conversation_quote'),
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
    serviceId: uuid('service_id').references((): AnyPgColumn => services.id, { onDelete: 'restrict' }),
    role: text('role').notNull(),
    position: integer('position').default(0).notNull(),
    detachedAt: timestamp('detached_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    check(
        'media_attachments_exactly_one_owner',
        sql`num_nonnulls(${table.psychologistId}, ${table.landingRevisionId}, ${table.articleRevisionId}, ${table.serviceId}) = 1`
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
    uniqueIndex('media_attachments_service_role_position_unique')
        .on(table.serviceId, table.role, table.position)
        .where(sql`${table.serviceId} is not null and ${table.detachedAt} is null`),
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
    }),
    service: one(services, {
        fields: [mediaAttachments.serviceId],
        references: [services.id]
    })
}));

// Leads from the public "Sesi Gratis 60 Menit" form. Append-only audit trail:
// duplicates are kept here and only collapsed in the admin report.
export const freeSessionSubmissions = pgTable('free_session_submissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    age: integer('age').notNull(),
    gender: text('gender'),
    phone: text('phone').notNull(),
    email: text('email'),
    keluhan: text('keluhan').notNull(),
    keluhanDetail: text('keluhan_detail'),
    agreedAt: timestamp('agreed_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('free_session_submissions_created_at_idx').on(table.createdAt),
    index('free_session_submissions_phone_idx').on(table.phone),
    check('free_session_submissions_age_range', sql`${table.age} between 15 and 99`)
]);

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
    dataType: () => 'bytea'
});

/**
 * Monthly "Sci-Brief" research digests. Only the public preview file (first few
 * pages) is ever served to visitors; the full document stays admin-only.
 */
export const sciBriefs = pgTable('sci_briefs', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    titleId: text('title_id').notNull(),
    titleEn: text('title_en').notNull(),
    summaryId: text('summary_id').notNull(),
    summaryEn: text('summary_en').notNull(),
    /** The month the brief covers, as YYYY-MM. */
    periodMonth: text('period_month').notNull(),
    /** Visible to the public once status is published and this moment has passed. */
    releaseAt: timestamp('release_at', { withTimezone: true, mode: 'string' }).notNull(),
    status: text('status').default('draft').notNull(),
    documentName: text('document_name'),
    totalPages: integer('total_pages'),
    previewPages: integer('preview_pages').default(3).notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('sci_briefs_slug_unique').on(table.slug),
    index('sci_briefs_release_at_idx').on(table.releaseAt),
    check('sci_briefs_status_valid', sql`${table.status} in ('draft', 'published')`),
    check('sci_briefs_period_month_format', sql`${table.periodMonth} ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'`),
    check('sci_briefs_preview_pages_range', sql`${table.previewPages} between 1 and 10`)
]);

export const sciBriefFiles = pgTable('sci_brief_files', {
    id: uuid('id').defaultRandom().primaryKey(),
    briefId: uuid('brief_id').notNull().references(() => sciBriefs.id, { onDelete: 'cascade' }),
    /** 'preview' = public first pages, 'full' = complete document (admin only). */
    kind: text('kind').notNull(),
    data: bytea('data').notNull(),
    byteSize: integer('byte_size').notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('sci_brief_files_brief_kind_unique').on(table.briefId, table.kind),
    check('sci_brief_files_kind_valid', sql`${table.kind} in ('preview', 'full')`)
]);

/**
 * Operational booking submissions migrated from Zite.
 * Upholds the Clinical Privacy Wall (concern_note lives in booking_clinical_intakes)
 * and prepares progressive client account claiming via client_user_id + normalized keys.
 */
export const bookings = pgTable('bookings', {
    id: uuid('id').defaultRandom().primaryKey(),
    bookingCode: text('booking_code').notNull(),
    clientUserId: uuid('client_user_id').references(() => users.id, { onDelete: 'set null' }),
    status: bookingStatusEnum('status').default('pending').notNull(),
    language: contentLocaleEnum('language').default('id').notNull(),
    clientStatus: text('client_status').notNull(),
    name: text('name').notNull(),
    whatsapp: text('whatsapp').notNull(),
    whatsappE164: text('whatsapp_e164').notNull(),
    email: text('email').notNull(),
    emailNormalized: text('email_normalized').notNull(),
    countryRegion: text('country_region'),
    age: integer('age'),
    gender: text('gender'),
    serviceType: text('service_type').default('Personal').notNull(),
    serviceId: uuid('service_id').references((): AnyPgColumn => services.id, { onDelete: 'set null' }),
    serviceVariantId: uuid('service_variant_id').references((): AnyPgColumn => serviceVariants.id, { onDelete: 'set null' }),
    serviceNameSnapshot: text('service_name_snapshot'),
    concernId: text('concern_id'),
    concernCategory: text('concern_category'),
    clientCategory: text('client_category'),
    genderPreference: text('gender_preference'),
    consultationMode: text('consultation_mode').notNull(),
    location: text('location'),
    psychologistChoice: text('psychologist_choice').notNull(),
    psychologistId: uuid('psychologist_id').references(() => psychologists.id, { onDelete: 'restrict' }),
    selectedPsychologistName: text('selected_psychologist_name'),
    scheduleOption1: text('schedule_option_1').notNull(),
    scheduleOption2: text('schedule_option_2'),
    scheduleOption3: text('schedule_option_3'),
    confirmedStartAt: timestamp('confirmed_start_at', { withTimezone: true, mode: 'string' }),
    confirmedEndAt: timestamp('confirmed_end_at', { withTimezone: true, mode: 'string' }),
    baseRate: integer('base_rate').default(0).notNull(),
    assessmentFee: integer('assessment_fee').default(0).notNull(),
    totalRate: integer('total_rate').default(0).notNull(),
    marketingSource: text('marketing_source'),
    referrer: text('referrer'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmContent: text('utm_content'),
    utmTerm: text('utm_term'),
    campaignId: text('campaign_id'),
    adsetId: text('adset_id'),
    adId: text('ad_id'),
    submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    uniqueIndex('bookings_booking_code_unique').on(table.bookingCode),
    index('bookings_status_submitted_at_idx').on(table.status, table.submittedAt),
    index('bookings_psychologist_confirmed_start_idx').on(table.psychologistId, table.confirmedStartAt),
    index('bookings_email_normalized_idx').on(table.emailNormalized),
    index('bookings_whatsapp_e164_idx').on(table.whatsappE164),
    index('bookings_client_user_id_idx').on(table.clientUserId),
    index('bookings_service_id_idx').on(table.serviceId),
    index('bookings_utm_campaign_idx').on(table.utmCampaign),
    index('bookings_campaign_id_idx').on(table.campaignId),
    check('bookings_client_status_valid', sql`${table.clientStatus} in ('new', 'returning')`),
    check('bookings_consultation_mode_valid', sql`${table.consultationMode} in ('online', 'offline')`),
    check('bookings_location_valid', sql`${table.location} is null or ${table.location} in ('tbi', 'bsd', 'malang')`),
    check('bookings_psychologist_choice_valid', sql`${table.psychologistChoice} in ('recommended', 'previous', 'self')`),
    check('bookings_non_negative_rates', sql`${table.baseRate} >= 0 and ${table.assessmentFee} >= 0 and ${table.totalRate} >= 0`)
]);

/**
 * Restricted clinical triage notes & acute crisis flags separated from general
 * booking operations (Clinical Privacy Wall).
 */
export const bookingClinicalIntakes = pgTable('booking_clinical_intakes', {
    bookingId: uuid('booking_id').primaryKey().references(() => bookings.id, { onDelete: 'cascade' }),
    concernNote: text('concern_note'),
    crisisFlagTriggered: boolean('crisis_flag_triggered').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
});

/**
 * Transactional outbox for durable idempotent n8n booking webhooks.
 */
export const bookingWebhookDeliveries = pgTable('booking_webhook_deliveries', {
    id: uuid('id').defaultRandom().primaryKey(),
    bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
    eventType: text('event_type').default('booking.submitted').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    payloadJson: text('payload_json').notNull(),
    status: webhookDeliveryStatusEnum('status').default('pending').notNull(),
    attempts: integer('attempts').default(0).notNull(),
    nextAttemptAt: timestamp('next_attempt_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    lastError: text('last_error'),
    deliveredAt: timestamp('delivered_at', { withTimezone: true, mode: 'string' }),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('booking_webhook_deliveries_idempotency_key_unique').on(table.idempotencyKey),
    index('booking_webhook_deliveries_due_idx').on(table.status, table.nextAttemptAt),
    index('booking_webhook_deliveries_booking_id_idx').on(table.bookingId)
]);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
    psychologist: one(psychologists, {
        fields: [bookings.psychologistId],
        references: [psychologists.id]
    }),
    clientUser: one(users, {
        fields: [bookings.clientUserId],
        references: [users.id]
    }),
    clinicalIntake: one(bookingClinicalIntakes, {
        fields: [bookings.id],
        references: [bookingClinicalIntakes.bookingId]
    }),
    webhookDeliveries: many(bookingWebhookDeliveries)
}));

export const bookingClinicalIntakesRelations = relations(bookingClinicalIntakes, ({ one }) => ({
    booking: one(bookings, {
        fields: [bookingClinicalIntakes.bookingId],
        references: [bookings.id]
    })
}));

export const bookingWebhookDeliveriesRelations = relations(bookingWebhookDeliveries, ({ one }) => ({
    booking: one(bookings, {
        fields: [bookingWebhookDeliveries.bookingId],
        references: [bookings.id]
    })
}));

/**
 * Public Services Catalog (Phase 1) — Physical Table Isolation:
 * Stores ONLY public-safe catalog metadata and client-facing prices.
 * Internal fees, operational costs, margins, and historical/proposed prices
 * never exist in these tables.
 */
export const serviceCategories = pgTable('service_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    position: integer('position').default(0).notNull(),
    isFree: boolean('is_free').default(false).notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('service_categories_slug_unique').on(table.slug),
    check('service_categories_non_negative_position', sql`${table.position} >= 0`)
]);

export const serviceCategoryTranslations = pgTable('service_category_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').notNull().references(() => serviceCategories.id, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    name: text('name').notNull()
}, (table) => [
    unique('service_category_translations_category_locale_unique').on(table.categoryId, table.locale)
]);

export const serviceSubgroups = pgTable('service_subgroups', {
    id: uuid('id').defaultRandom().primaryKey(),
    categoryId: uuid('category_id').references(() => serviceCategories.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    position: integer('position').default(0).notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('service_subgroups_slug_unique').on(table.slug),
    check('service_subgroups_non_negative_position', sql`${table.position} >= 0`)
]);

export const serviceSubgroupTranslations = pgTable('service_subgroup_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    subgroupId: uuid('subgroup_id').notNull().references(() => serviceSubgroups.id, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    name: text('name').notNull(),
    note: text('note')
}, (table) => [
    unique('service_subgroup_translations_subgroup_locale_unique').on(table.subgroupId, table.locale)
]);

export const services = pgTable('services', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    categoryId: uuid('category_id').notNull().references(() => serviceCategories.id, { onDelete: 'restrict' }),
    subgroupId: uuid('subgroup_id').references(() => serviceSubgroups.id, { onDelete: 'restrict' }),
    serviceType: serviceTypeEnum('service_type').default('layanan').notNull(),
    pricingModel: servicePricingModelEnum('pricing_model').notNull(),
    status: serviceLifecycleStatusEnum('status').default('draft').notNull(),
    visibility: serviceVisibilityEnum('visibility').default('public').notNull(),
    appliesNewClientFee: boolean('applies_new_client_fee').default(false).notNull(),
    isAssessment: boolean('is_assessment').default(false).notNull(),
    isFeaturedSpotlight: boolean('is_featured_spotlight').default(false).notNull(),
    position: integer('position').default(0).notNull(),
    externalUrl: text('external_url'),
    defaultConcernId: text('default_concern_id'),
    defaultClientCategory: text('default_client_category'),
    audiencesJson: text('audiences_json').default('[]').notNull(),
    demoConfigJson: text('demo_config_json'),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('services_slug_unique').on(table.slug),
    index('services_public_catalog_idx').on(table.status, table.visibility, table.position),
    check('services_non_negative_position', sql`${table.position} >= 0`)
]);

export const serviceTranslations = pgTable('service_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    name: text('name').notNull(),
    fullName: text('full_name'),
    badge: text('badge'),
    shortSummary: text('short_summary'),
    benefit: text('benefit'),
    introduction: text('introduction'),
    targetAudience: text('target_audience'),
    whatIsMeasured: text('what_is_measured'),
    durationInfo: text('duration_info'),
    locationInfo: text('location_info'),
    processStepsJson: text('process_steps_json').default('[]').notNull(),
    termsJson: text('terms_json').default('[]').notNull(),
    resultsExplanation: text('results_explanation'),
    scientificBasis: text('scientific_basis'),
    citationSummary: text('citation_summary'),
    assessmentPurpose: text('assessment_purpose'),
    assessmentAspects: text('assessment_aspects'),
    assessmentAgeRange: text('assessment_age_range'),
    assessmentMethod: text('assessment_method'),
    assessmentPrep: text('assessment_prep'),
    assessmentOutputFormat: text('assessment_output_format'),
    assessmentDimensionsJson: text('assessment_dimensions_json').default('[]').notNull(),
    assessmentReportType: text('assessment_report_type'),
    assessmentInterpretation: text('assessment_interpretation'),
    assessmentRecommendations: text('assessment_recommendations'),
    assessmentTurnaround: text('assessment_turnaround')
}, (table) => [
    unique('service_translations_service_locale_unique').on(table.serviceId, table.locale)
]);

export const serviceVariants = pgTable('service_variants', {
    id: uuid('id').defaultRandom().primaryKey(),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
    slug: text('slug').notNull(),
    position: integer('position').default(0).notNull(),
    status: serviceLifecycleStatusEnum('status').default('draft').notNull(),
    visibility: serviceVisibilityEnum('visibility').default('public').notNull(),
    modalitiesJson: text('modalities_json').default('[]').notNull(),
    branch: text('branch'),
    priceOnRequest: boolean('price_on_request').default(false).notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('service_variants_slug_unique').on(table.slug),
    index('service_variants_service_status_idx').on(table.serviceId, table.status, table.visibility, table.position),
    check('service_variants_branch_valid', sql`${table.branch} is null or ${table.branch} in ('tbi', 'bsd', 'malang')`),
    check('service_variants_non_negative_position', sql`${table.position} >= 0`)
]);

export const serviceVariantTranslations = pgTable('service_variant_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id').notNull().references(() => serviceVariants.id, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    unitLabel: text('unit_label'),
    ageRangeLabel: text('age_range_label'),
    durationLabel: text('duration_label')
}, (table) => [
    unique('service_variant_translations_variant_locale_unique').on(table.variantId, table.locale)
]);

export const servicePublicPrices = pgTable('service_public_prices', {
    id: uuid('id').defaultRandom().primaryKey(),
    variantId: uuid('variant_id').notNull().references(() => serviceVariants.id, { onDelete: 'restrict' }),
    amount: integer('amount').notNull(),
    amountMax: integer('amount_max'),
    effectiveDate: text('effective_date'),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('service_public_prices_variant_unique').on(table.variantId),
    check('service_public_prices_non_negative_amount', sql`${table.amount} >= 0`),
    check('service_public_prices_valid_amount_max', sql`${table.amountMax} is null or ${table.amountMax} >= ${table.amount}`)
]);

export const servicePrograms = pgTable('service_programs', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    programType: serviceProgramTypeEnum('program_type').default('harga').notNull(),
    status: serviceProgramStatusEnum('status').default('draft').notNull(),
    startsOn: text('starts_on').notNull(),
    endsOn: text('ends_on').notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('service_programs_slug_unique').on(table.slug),
    index('service_programs_status_dates_idx').on(table.status, table.startsOn, table.endsOn)
]);

export const serviceProgramTranslations = pgTable('service_program_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    programId: uuid('program_id').notNull().references(() => servicePrograms.id, { onDelete: 'restrict' }),
    locale: contentLocaleEnum('locale').notNull(),
    name: text('name').notNull(),
    badge: text('badge')
}, (table) => [
    unique('service_program_translations_program_locale_unique').on(table.programId, table.locale)
]);

export const serviceProgramPrices = pgTable('service_program_prices', {
    id: uuid('id').defaultRandom().primaryKey(),
    programId: uuid('program_id').notNull().references(() => servicePrograms.id, { onDelete: 'restrict' }),
    variantId: uuid('variant_id').notNull().references(() => serviceVariants.id, { onDelete: 'restrict' }),
    promoAmount: integer('promo_amount').notNull(),
    noteId: text('note_id'),
    noteEn: text('note_en'),
    ...auditTimestamps
}, (table) => [
    unique('service_program_prices_program_variant_unique').on(table.programId, table.variantId),
    check('service_program_prices_non_negative_amount', sql`${table.promoAmount} >= 0`)
]);

export const servicePsychologists = pgTable('service_psychologists', {
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
    psychologistId: uuid('psychologist_id').notNull().references(() => psychologists.id, { onDelete: 'restrict' }),
    position: integer('position').default(0).notNull(),
    noteId: text('note_id'),
    noteEn: text('note_en')
}, (table) => [
    primaryKey({ name: 'service_psychologists_pk', columns: [table.serviceId, table.psychologistId] }),
    check('service_psychologists_non_negative_position', sql`${table.position} >= 0`)
]);

export const serviceDeliverables = pgTable('service_deliverables', {
    id: uuid('id').defaultRandom().primaryKey(),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
    position: integer('position').default(0).notNull(),
    variantSlugsJson: text('variant_slugs_json').default('[]').notNull(),
    textId: text('text_id').notNull(),
    textEn: text('text_en').notNull()
}, (table) => [
    unique('service_deliverables_service_position_unique').on(table.serviceId, table.position),
    check('service_deliverables_non_negative_position', sql`${table.position} >= 0`)
]);

export const serviceFaqs = pgTable('service_faqs', {
    id: uuid('id').defaultRandom().primaryKey(),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
    position: integer('position').default(0).notNull(),
    questionId: text('question_id').notNull(),
    questionEn: text('question_en').notNull(),
    answerId: text('answer_id').notNull(),
    answerEn: text('answer_en').notNull()
}, (table) => [
    unique('service_faqs_service_position_unique').on(table.serviceId, table.position),
    check('service_faqs_non_negative_position', sql`${table.position} >= 0`)
]);

export const serviceReferences = pgTable('service_references', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    citationText: text('citation_text').notNull(),
    doiUrl: text('doi_url')
}, (table) => [
    uniqueIndex('service_references_code_unique').on(table.code)
]);

export const serviceReferenceLinks = pgTable('service_reference_links', {
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
    referenceId: uuid('reference_id').notNull().references(() => serviceReferences.id, { onDelete: 'restrict' }),
    position: integer('position').default(0).notNull()
}, (table) => [
    primaryKey({ name: 'service_reference_links_pk', columns: [table.serviceId, table.referenceId] }),
    check('service_reference_links_non_negative_position', sql`${table.position} >= 0`)
]);

/**
 * Superadmin Internal Financial & Operations Ledger (Phase 3) — Physically Isolated:
 * Never joined or queried by public catalog endpoints. Stores provider fee splits,
 * direct operational costs, and historical/proposed price records strictly behind superadmin auth.
 */
export const serviceInternalCosts = pgTable('service_internal_costs', {
    id: uuid('id').defaultRandom().primaryKey(),
    legacyId: text('legacy_id'),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'restrict' }),
    variantId: uuid('variant_id').references(() => serviceVariants.id, { onDelete: 'restrict' }),
    psychologistId: uuid('psychologist_id').references(() => psychologists.id, { onDelete: 'restrict' }),
    recordKind: text('record_kind').notNull(),
    recordStatus: text('record_status').notNull(),
    amount: integer('amount'),
    amountMax: integer('amount_max'),
    unitLabel: text('unit_label'),
    effectiveDate: text('effective_date'),
    label: text('label'),
    note: text('note'),
    sourceMetaJson: text('source_meta_json').default('{}').notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('service_internal_costs_legacy_id_unique').on(table.legacyId),
    index('service_internal_costs_service_variant_idx').on(table.serviceId, table.variantId, table.recordKind, table.recordStatus),
    check('service_internal_costs_kind_valid', sql`${table.recordKind} in ('harga', 'fee', 'biaya', 'promo')`),
    check('service_internal_costs_status_valid', sql`${table.recordStatus} in ('berlaku', 'usulan', 'historis')`),
    check('service_internal_costs_non_negative_amount', sql`${table.amount} is null or ${table.amount} >= 0`)
]);

export const serviceDataIssues = pgTable('service_data_issues', {
    id: uuid('id').defaultRandom().primaryKey(),
    code: text('code').notNull(),
    issueType: text('issue_type').notNull(),
    title: text('title').notNull(),
    detail: text('detail').notNull(),
    status: text('status').default('Terbuka').notNull(),
    resolution: text('resolution'),
    refsJson: text('refs_json').default('[]').notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'string' }),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('service_data_issues_code_unique').on(table.code),
    check('service_data_issues_type_valid', sql`${table.issueType} in ('Perlu Verifikasi', 'Perlu Dilengkapi')`),
    check('service_data_issues_status_valid', sql`${table.status} in ('Terbuka', 'Selesai')`)
]);

export const serviceOpsSettings = pgTable('service_ops_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    singletonKey: boolean('singleton_key').default(true).notNull(),
    marginThreshold: integer('margin_threshold').default(30).notNull(),
    assumptionsJson: text('assumptions_json').default('{}').notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('service_ops_settings_singleton_unique').on(table.singletonKey),
    check('service_ops_settings_threshold_valid', sql`${table.marginThreshold} >= 0 and ${table.marginThreshold} <= 100`)
]);

export const serviceAuditLogs = pgTable('service_audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    actorUserId: uuid('actor_user_id').references(() => users.id, { onDelete: 'restrict' }),
    actorEmail: text('actor_email').notNull(),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entitySlug: text('entity_slug'),
    summary: text('summary').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('service_audit_logs_created_idx').on(table.createdAt)
]);
