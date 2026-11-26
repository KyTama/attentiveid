import { pgTable, text } from 'drizzle-orm/pg-core';

import { relations, sql } from 'drizzle-orm';
import {
    type AnyPgColumn,
    boolean,
    check,
    customType,
    date,
    doublePrecision,
    index,
    integer,
    jsonb,
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
    /** Minutes without activity (typing, scrolling, clicking in the portal) before the person is signed out; the browser warns first. */
    idleTimeoutMinutes: integer('idle_timeout_minutes').default(15).notNull(),
    ...auditTimestamps
}, (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    check('users_idle_timeout_range', sql`${table.idleTimeoutMinutes} between 5 and 120`),
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
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    /** When the row was written to the Google Sheet (null = not yet). */
    sheetSyncedAt: timestamp('sheet_synced_at', { withTimezone: true, mode: 'string' }),
    /** Last Google Sheet error for this row, cleared on success. */
    sheetError: text('sheet_error')
}, (table) => [
    index('free_session_submissions_created_at_idx').on(table.createdAt),
    index('free_session_submissions_phone_idx').on(table.phone),
    check('free_session_submissions_age_range', sql`${table.age} between 15 and 99`)
]);

// One row per person across their Mental Health Check-Ups (the same person = same e-mail, else same WhatsApp number).
export const assessmentParticipants = pgTable('assessment_participants', {
    id: uuid('id').defaultRandom().primaryKey(),
    /** P00001, P00002...: the number printed on reports. */
    participantNo: integer('participant_no').generatedAlwaysAsIdentity().notNull(),
    emailNorm: text('email_norm'),
    phoneNorm: text('phone_norm'),
    name: text('name').notNull(),
    sex: text('sex'),
    firstSessionAt: timestamp('first_session_at', { withTimezone: true, mode: 'string' }),
    lastSessionAt: timestamp('last_session_at', { withTimezone: true, mode: 'string' }),
    nSessions: integer('n_sessions').default(0).notNull(),
    /** The psychologist who follows this person (kept for their next check-ups). */
    psychologistId: uuid('psychologist_id'),
    /** Package of 3: how many check-ups were bought and how many are left. */
    creditsTotal: integer('credits_total').default(0).notNull(),
    creditsRemaining: integer('credits_remaining').default(0).notNull(),
    /** How the person first arrived ('mandiri' | 'asesmen' | 'free'): people who came through an invitation continue as 'lanjutan' with their psychologist. */
    trackOrigin: text('track_origin'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    uniqueIndex('assessment_participants_no_idx').on(table.participantNo),
    index('assessment_participants_email_idx').on(table.emailNorm),
    index('assessment_participants_phone_idx').on(table.phoneNorm)
]);

// Answers to the assessments hosted on the site (Mental Health Check-Up first, Goal System Compass next).
// Health information: only staff with a portal login can read it, and nothing here is ever sent to a public place.
export const assessmentSubmissions = pgTable('assessment_submissions', {
    id: uuid('id').defaultRandom().primaryKey(),
    /** 'mhcu' | 'gsc' */
    instrument: text('instrument').notNull(),
    /** Public code such as AT-MHCU-2026-101. */
    code: text('code').notNull(),
    codeYear: integer('code_year').notNull(),
    codeSeq: integer('code_seq').notNull(),
    lang: text('lang').notNull(),
    /** How the person arrived: 'mandiri' (public link) for now; invite tracks come later. */
    track: text('track').default('mandiri').notNull(),
    consentVersion: text('consent_version').notNull(),
    /** false = the person said their data may not be used for research. */
    researchConsent: boolean('research_consent').notNull(),
    guardian: boolean('guardian').default(false).notNull(),
    /** The acknowledgements the person ticked on the consent step (evidence of what they agreed to). */
    consentAck: jsonb('consent_ack').default(sql`'[]'::jsonb`).notNull(),
    name: text('name').notNull(),
    sex: text('sex'),
    age: integer('age').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    answers: jsonb('answers').notNull(),
    scores: jsonb('scores').notNull(),
    /** MHCU level 1-5 (5 = priority, same-day contact). */
    level: integer('level'),
    durationSec: integer('duration_sec'),
    /** new → reviewed (a psychologist looked at it) → released (the report may go to the person). */
    status: text('status').default('new').notNull(),
    reviewerId: uuid('reviewer_id'),
    reviewerNote: text('reviewer_note'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true, mode: 'string' }),
    releasedAt: timestamp('released_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    sheetSyncedAt: timestamp('sheet_synced_at', { withTimezone: true, mode: 'string' }),
    sheetError: text('sheet_error'),
    /** When the result e-mail (index scores and a link to order the full report) was sent to the participant. */
    resultEmailSentAt: timestamp('result_email_sent_at', { withTimezone: true, mode: 'string' }),
    /** What the participant says they paid for ('single' | 'package3'); the proof of transfer is in assessment_payment_proofs. */
    paymentFor: text('payment_for'),
    paymentSubmittedAt: timestamp('payment_submitted_at', { withTimezone: true, mode: 'string' }),
    /** Who this check-up belongs to over time, and which check-up of theirs it is (T1, T2...). */
    participantId: uuid('participant_id'),
    waveNo: integer('wave_no'),
    /** The psychologist assigned to review this result (a row of the public psychologists table). */
    psychologistId: uuid('psychologist_id'),
    /** The psychologist's note for the full report: the editable paragraph, a special note (max 500) and the final flag. */
    noteTemplate: text('note_template'),
    noteCustom: text('note_custom'),
    noteFinal: boolean('note_final').default(false).notNull(),
    noteUpdatedBy: uuid('note_updated_by'),
    noteUpdatedAt: timestamp('note_updated_at', { withTimezone: true, mode: 'string' }),
    /** UNPAID | PAID | FREE | INCLUDED | LEGACY, set by staff after checking the proof of transfer. */
    paymentStatus: text('payment_status').default('UNPAID').notNull(),
    paymentPackage: text('payment_package'),
    paymentAmount: integer('payment_amount'),
    paymentRef: text('payment_ref'),
    paidAt: timestamp('paid_at', { withTimezone: true, mode: 'string' }),
    /** When the full report was released to the participant (a link to the report page is e-mailed). */
    reportSentAt: timestamp('report_sent_at', { withTimezone: true, mode: 'string' }),
    /** When the admin alert for a level 4-5 result was sent. */
    adminAlertAt: timestamp('admin_alert_at', { withTimezone: true, mode: 'string' }),
    /** The invitation this check-up was made with (asesmen awal / free session), when there was one. */
    inviteId: uuid('invite_id'),
    /** What the report costs for this check-up, in Rupiah. 'lanjutan': set by the psychologist (null until then). */
    priceDue: integer('price_due'),
    /** true = this check-up used one credit of a package of 3. */
    creditUsed: boolean('credit_used').default(false).notNull(),
    /** Credits of a package that this check-up's payment added to the person (3 for a confirmed package of 3), so a repeated save never adds twice. */
    creditsGranted: integer('credits_granted').default(0).notNull(),
}, (table) => [
    uniqueIndex('assessment_submissions_code_idx').on(table.code),
    uniqueIndex('assessment_submissions_seq_idx').on(table.instrument, table.codeYear, table.codeSeq),
    index('assessment_submissions_created_at_idx').on(table.instrument, table.createdAt),
    index('assessment_submissions_email_idx').on(table.email),
    index('assessment_submissions_participant_idx').on(table.participantId, table.waveNo),
    check('assessment_submissions_status', sql`${table.status} in ('new','reviewed','released')`),
    check('assessment_submissions_payment_status', sql`${table.paymentStatus} in ('UNPAID','PAID','FREE','INCLUDED','LEGACY')`),
    check('assessment_submissions_note_custom_len', sql`${table.noteCustom} is null or char_length(${table.noteCustom}) <= 500`),
    check('assessment_submissions_track', sql`${table.track} in ('mandiri','asesmen','free','paket','lanjutan','legacy')`),
    check('assessment_submissions_price_due', sql`${table.priceDue} is null or ${table.priceDue} >= 0`),
    index('assessment_submissions_invite_idx').on(table.inviteId)
]);

/** One-time invitation links for the invited tracks (asesmen awal, free session). The token is what ?invite= carries. */
export const assessmentInvites = pgTable('assessment_invites', {
    id: uuid('id').defaultRandom().primaryKey(),
    /** 1, 2, 3...: printed as INV0001. */
    inviteNo: integer('invite_no').generatedAlwaysAsIdentity().notNull(),
    /** 16 hex characters. */
    token: text('token').notNull(),
    /** 'asesmen' | 'free' */
    track: text('track').notNull(),
    psychologistId: uuid('psychologist_id').notNull(),
    clientName: text('client_name'),
    clientEmail: text('client_email'),
    phone: text('phone'),
    note: text('note'),
    /** Language the form opens in (optional). */
    lang: text('lang'),
    /** OPEN | USED | CANCELLED */
    status: text('status').default('OPEN').notNull(),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    usedAt: timestamp('used_at', { withTimezone: true, mode: 'string' }),
    usedSubmissionId: uuid('used_submission_id')
}, (table) => [
    uniqueIndex('assessment_invites_no_idx').on(table.inviteNo),
    uniqueIndex('assessment_invites_token_idx').on(table.token),
    index('assessment_invites_status_idx').on(table.status, table.createdAt),
    check('assessment_invites_track', sql`${table.track} in ('asesmen','free')`),
    check('assessment_invites_status', sql`${table.status} in ('OPEN','USED','CANCELLED')`)
]);

/** What staff did and when. Never holds names, e-mails, phone numbers or scores. */
export const assessmentAudit = pgTable('assessment_audit', {
    id: uuid('id').defaultRandom().primaryKey(),
    at: timestamp('at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    actor: uuid('actor'),
    action: text('action').notNull(),
    submissionId: uuid('submission_id'),
    detail: text('detail')
}, (table) => [
    index('assessment_audit_at_idx').on(table.at),
    index('assessment_audit_submission_idx').on(table.submissionId)
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

/** Featured products listed in the site's Featured menu during their (admin-only) featured period. */
export const featuredProducts = pgTable('featured_products', {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull(),
    titleId: text('title_id').notNull(),
    titleEn: text('title_en').notNull(),
    descriptionId: text('description_id').default('').notNull(),
    descriptionEn: text('description_en').default('').notNull(),
    theme: text('theme').default('blue').notNull(),
    icon: text('icon').default('sparkles').notNull(),
    badgeId: text('badge_id').default('').notNull(),
    badgeEn: text('badge_en').default('').notNull(),
    ctaId: text('cta_id').default('').notNull(),
    ctaEn: text('cta_en').default('').notNull(),
    url: text('url').default('').notNull(),
    startAt: timestamp('start_at', { withTimezone: true, mode: 'string' }),
    endAt: timestamp('end_at', { withTimezone: true, mode: 'string' }),
    enabled: boolean('enabled').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    uniqueIndex('featured_products_slug_unique').on(table.slug),
    check('featured_products_period_order', sql`${table.startAt} is null or ${table.endAt} is null or ${table.endAt} > ${table.startAt}`)
]);

/** Link preview (title/description/image shown when a page link is shared), one per page path. */
export const sharePreviews = pgTable('share_previews', {
    id: uuid('id').defaultRandom().primaryKey(),
    path: text('path').notNull(),
    title: text('title').default('').notNull(),
    description: text('description').default('').notNull(),
    imageUrl: text('image_url').default('').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    uniqueIndex('share_previews_path_unique').on(table.path)
]);

/** Per-day visit counters for main pages. No visitor data is stored. */
export const pageViewDaily = pgTable('page_view_daily', {
    path: text('path').notNull(),
    day: date('day', { mode: 'string' }).notNull(),
    views: integer('views').default(0).notNull(),
    sessions: integer('sessions').default(0).notNull(),
    lastVisitAt: timestamp('last_visit_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.path, table.day] })
]);

/** Saved QR code designs (settings only; the image is generated in the browser). */
export const qrCodes = pgTable('qr_codes', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    targetUrl: text('target_url').notNull(),
    foreground: text('foreground').default('#14284B').notNull(),
    background: text('background').default('#FFFFFF').notNull(),
    logoDataUrl: text('logo_data_url').default('').notNull(),
    logoScale: doublePrecision('logo_scale').default(0.2).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
});

/** Site-wide settings edited in the portal (floating bar, browser tab...), one JSON value per key. */
// Prayers written on the Let There Be Light page; a random visible one is shown inside the gift.
export const prayers = pgTable('prayers', {
    id: uuid('id').defaultRandom().primaryKey(),
    prayer: text('prayer').notNull(),
    /** Hidden by an admin (or waiting for approval when moderation is manual). */
    hidden: boolean('hidden').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('prayers_created_at_idx').on(table.createdAt)
]);

// Proof of transfer uploaded by a participant for the full report. Kept in the database (private, never a public file).
export const assessmentPaymentProofs = pgTable('assessment_payment_proofs', {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id').notNull().references(() => assessmentSubmissions.id, { onDelete: 'cascade' }),
    mimeType: text('mime_type').notNull(),
    byteSize: integer('byte_size').notNull(),
    data: bytea('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('assessment_payment_proofs_submission_idx').on(table.submissionId)
]);

// Bug reports and suggestions about the website (public form; admins read them in the portal).
export const feedbackReports = pgTable('feedback_reports', {
    id: uuid('id').defaultRandom().primaryKey(),
    kind: text('kind').notNull(),
    name: text('name').notNull(),
    message: text('message').notNull(),
    page: text('page').default('').notNull(),
    doneAt: timestamp('done_at', { withTimezone: true, mode: 'string' }),
    status: text('status').default('new').notNull(),
    assignee: text('assignee').default('').notNull(),
    driveFolderId: text('drive_folder_id'),
    driveError: text('drive_error'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('feedback_reports_created_at_idx').on(table.createdAt)
]);

// Files attached to a report. The content is kept only until it is in Google Drive, then emptied to save disk space.
export const feedbackFiles = pgTable('feedback_files', {
    id: uuid('id').defaultRandom().primaryKey(),
    reportId: uuid('report_id').notNull().references(() => feedbackReports.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    mimeType: text('mime_type').notNull(),
    byteSize: integer('byte_size').notNull(),
    data: customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => 'bytea' })('data'),
    /** Set when the file belongs to a note added in the portal, not to the original report. */
    noteId: uuid('note_id').references(() => feedbackNotes.id, { onDelete: 'cascade' })
}, (table) => [
    index('feedback_files_report_idx').on(table.reportId)
]);

// Notes added to a report in the portal.
export const feedbackNotes = pgTable('feedback_notes', {
    id: uuid('id').defaultRandom().primaryKey(),
    reportId: uuid('report_id').notNull().references(() => feedbackReports.id, { onDelete: 'cascade' }),
    author: text('author').notNull(),
    body: text('body').default('').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('feedback_notes_report_idx').on(table.reportId)
]);

// What happened to each report (received, status changes, notes...).
export const feedbackEvents = pgTable('feedback_events', {
    id: uuid('id').defaultRandom().primaryKey(),
    reportId: uuid('report_id').notNull().references(() => feedbackReports.id, { onDelete: 'cascade' }),
    actor: text('actor').default('').notNull(),
    action: text('action').notNull(),
    detail: text('detail').default('').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('feedback_events_report_idx').on(table.reportId)
]);

export const siteSettings = pgTable('site_settings', {
    key: text('key').primaryKey(),
    value: jsonb('value').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
});

// Contacts of the portal's Email menu (bulk e-mail). A contact has one or more categories.
export const emailCategories = pgTable('email_categories', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    builtin: boolean('builtin').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    uniqueIndex('email_categories_name_idx').on(sql`lower(${table.name})`)
]);

export const emailContacts = pgTable('email_contacts', {
    id: uuid('id').defaultRandom().primaryKey(),
    /** Always stored lower-case. */
    email: text('email').notNull(),
    name: text('name').default('').notNull(),
    phone: text('phone').default('').notNull(),
    /** The phone in one comparable form, to warn about the same person twice. */
    phoneNormalized: text('phone_normalized').default('').notNull(),
    source: text('source').default('manual').notNull(),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'string' }),
    createdBy: text('created_by').default('').notNull(),
    updatedBy: text('updated_by').default('').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    uniqueIndex('email_contacts_email_idx').on(table.email),
    index('email_contacts_phone_idx').on(table.phoneNormalized)
]);

export const emailContactCategories = pgTable('email_contact_categories', {
    contactId: uuid('contact_id').notNull().references(() => emailContacts.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id').notNull().references(() => emailCategories.id, { onDelete: 'restrict' })
}, (table) => [
    primaryKey({ columns: [table.contactId, table.categoryId] }),
    index('email_contact_categories_category_idx').on(table.categoryId)
]);

// Who did what in the Email menu (no message content, no contact details beyond what the action needs).
export const emailAudit = pgTable('email_audit', {
    id: uuid('id').defaultRandom().primaryKey(),
    actor: text('actor').notNull(),
    action: text('action').notNull(),
    detail: text('detail').default('').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
}, (table) => [
    index('email_audit_created_at_idx').on(table.createdAt)
]);

// An uploaded Excel file, parsed and waiting for "confirm". Removed after an hour.
export const emailImports = pgTable('email_imports', {
    id: uuid('id').defaultRandom().primaryKey(),
    actor: text('actor').notNull(),
    plan: jsonb('plan').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
    appliedAt: timestamp('applied_at', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull()
});
