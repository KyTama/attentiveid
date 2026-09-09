CREATE TYPE "public"."article_review_decision" AS ENUM('approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."article_revision_status" AS ENUM('draft', 'inReview', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('draft', 'published', 'unpublished', 'archived');--> statement-breakpoint
CREATE TYPE "public"."content_locale" AS ENUM('id', 'en');--> statement-breakpoint
CREATE TYPE "public"."landing_revision_status" AS ENUM('draft', 'published', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."landing_section_key" AS ENUM('hero', 'supportExplorer', 'carePromise', 'featuredPsychologists', 'careJourney', 'clientStories', 'consultationReassurance', 'frequentlyAskedQuestions', 'closingInvitation');--> statement-breakpoint
CREATE TYPE "public"."media_lifecycle_status" AS ENUM('active', 'orphaned', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."psychologist_lifecycle_status" AS ENUM('draft', 'active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."psychologist_support_area" AS ENUM('adultClinical', 'childAdolescent', 'educational');--> statement-breakpoint
CREATE TABLE "article_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_revision_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"decision" "article_review_decision" NOT NULL,
	"notes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"status" "article_revision_status" DEFAULT 'draft' NOT NULL,
	"title_id" text NOT NULL,
	"title_en" text NOT NULL,
	"summary_id" text NOT NULL,
	"summary_en" text NOT NULL,
	"body_id" text NOT NULL,
	"body_en" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"approved_at" timestamp with time zone,
	CONSTRAINT "article_revisions_article_revision_number_unique" UNIQUE("article_id","revision_number"),
	CONSTRAINT "article_revisions_article_id_id_unique" UNIQUE("article_id","id"),
	CONSTRAINT "article_revisions_positive_revision_number" CHECK ("article_revisions"."revision_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_psychologist_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"status" "article_status" DEFAULT 'draft' NOT NULL,
	"draft_revision_id" uuid,
	"published_revision_id" uuid,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_distinct_revision_pointers" CHECK ("articles"."draft_revision_id" is null or "articles"."published_revision_id" is null or "articles"."draft_revision_id" <> "articles"."published_revision_id")
);
--> statement-breakpoint
CREATE TABLE "landing_aggregates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"singleton_key" boolean DEFAULT true NOT NULL,
	"active_draft_revision_id" uuid,
	"published_revision_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "landing_aggregates_distinct_revision_pointers" CHECK ("landing_aggregates"."active_draft_revision_id" is null or "landing_aggregates"."published_revision_id" is null or "landing_aggregates"."active_draft_revision_id" <> "landing_aggregates"."published_revision_id")
);
--> statement-breakpoint
CREATE TABLE "landing_item_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "landing_item_translations_item_locale_unique" UNIQUE("item_id","locale")
);
--> statement-breakpoint
CREATE TABLE "landing_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "landing_items_section_position_unique" UNIQUE("section_id","position"),
	CONSTRAINT "landing_items_non_negative_position" CHECK ("landing_items"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "landing_preview_capabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landing_revision_id" uuid NOT NULL,
	"token_digest" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "landing_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"based_on_revision_id" uuid,
	"revision_number" integer NOT NULL,
	"status" "landing_revision_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "landing_revisions_aggregate_revision_number_unique" UNIQUE("aggregate_id","revision_number"),
	CONSTRAINT "landing_revisions_aggregate_id_id_unique" UNIQUE("aggregate_id","id"),
	CONSTRAINT "landing_revisions_positive_revision_number" CHECK ("landing_revisions"."revision_number" > 0)
);
--> statement-breakpoint
CREATE TABLE "landing_section_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"headline" text NOT NULL,
	"description" text NOT NULL,
	"primary_cta" text,
	"secondary_cta" text,
	"contact" text,
	CONSTRAINT "landing_section_translations_section_locale_unique" UNIQUE("section_id","locale")
);
--> statement-breakpoint
CREATE TABLE "landing_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landing_revision_id" uuid NOT NULL,
	"key" "landing_section_key" NOT NULL,
	"position" integer NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "landing_sections_revision_key_unique" UNIQUE("landing_revision_id","key"),
	CONSTRAINT "landing_sections_revision_position_unique" UNIQUE("landing_revision_id","position"),
	CONSTRAINT "landing_sections_position_range" CHECK ("landing_sections"."position" between 0 and 8),
	CONSTRAINT "landing_sections_key_position_match" CHECK (
        case "landing_sections"."key"
            when 'hero' then 0
            when 'supportExplorer' then 1
            when 'carePromise' then 2
            when 'featuredPsychologists' then 3
            when 'careJourney' then 4
            when 'clientStories' then 5
            when 'consultationReassurance' then 6
            when 'frequentlyAskedQuestions' then 7
            when 'closingInvitation' then 8
        end = "landing_sections"."position"
    )
);
--> statement-breakpoint
CREATE TABLE "media_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"media_object_id" uuid NOT NULL,
	"psychologist_id" uuid,
	"landing_revision_id" uuid,
	"article_revision_id" uuid,
	"role" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"detached_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_attachments_exactly_one_owner" CHECK (num_nonnulls("media_attachments"."psychologist_id", "media_attachments"."landing_revision_id", "media_attachments"."article_revision_id") = 1),
	CONSTRAINT "media_attachments_non_negative_position" CHECK ("media_attachments"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "media_objects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"object_key" text,
	"public_url" text,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"alt_id" text NOT NULL,
	"alt_en" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer,
	"lifecycle" "media_lifecycle_status" DEFAULT 'active' NOT NULL,
	"orphaned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_objects_exactly_one_reference" CHECK (num_nonnulls("media_objects"."object_key", "media_objects"."public_url") = 1),
	CONSTRAINT "media_objects_positive_geometry" CHECK ("media_objects"."width" > 0 and "media_objects"."height" > 0),
	CONSTRAINT "media_objects_orphan_timestamp_consistent" CHECK (("media_objects"."lifecycle" = 'active' and "media_objects"."orphaned_at" is null) or ("media_objects"."lifecycle" in ('orphaned', 'deleted') and "media_objects"."orphaned_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "psychologist_profile_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"psychologist_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"biography" text NOT NULL,
	"availability_message" text NOT NULL,
	CONSTRAINT "psychologist_profile_translations_profile_locale_unique" UNIQUE("psychologist_id","locale")
);
--> statement-breakpoint
CREATE TABLE "psychologist_profiles" (
	"psychologist_id" uuid PRIMARY KEY NOT NULL,
	"credential" text NOT NULL,
	"experience_years" integer NOT NULL,
	"license_number" text NOT NULL,
	"booking_url" text NOT NULL,
	"premium_booking_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "psychologist_profiles_non_negative_experience" CHECK ("psychologist_profiles"."experience_years" >= 0)
);
--> statement-breakpoint
CREATE TABLE "psychologist_specialization_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"specialization_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"label" text NOT NULL,
	CONSTRAINT "psychologist_specialization_translations_specialization_locale_unique" UNIQUE("specialization_id","locale")
);
--> statement-breakpoint
CREATE TABLE "psychologist_specializations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"psychologist_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "psychologist_specializations_psychologist_position_unique" UNIQUE("psychologist_id","position"),
	CONSTRAINT "psychologist_specializations_non_negative_position" CHECK ("psychologist_specializations"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "psychologist_support_areas" (
	"psychologist_id" uuid NOT NULL,
	"support_area" "psychologist_support_area" NOT NULL,
	"primary" boolean DEFAULT false NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "psychologist_support_areas_pk" PRIMARY KEY("psychologist_id","support_area"),
	CONSTRAINT "psychologist_support_areas_psychologist_area_unique" UNIQUE("psychologist_id","support_area"),
	CONSTRAINT "psychologist_support_areas_psychologist_position_unique" UNIQUE("psychologist_id","position"),
	CONSTRAINT "psychologist_support_areas_non_negative_position" CHECK ("psychologist_support_areas"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "psychologists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" "psychologist_lifecycle_status" DEFAULT 'draft' NOT NULL,
	"name" text NOT NULL,
	"nickname" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "psychologists_featured_order_consistent" CHECK (("psychologists"."featured" = true and "psychologists"."featured_order" is not null and "psychologists"."featured_order" >= 0) or ("psychologists"."featured" = false and "psychologists"."featured_order" is null))
);
--> statement-breakpoint
ALTER TABLE "article_reviews" ADD CONSTRAINT "article_reviews_article_revision_id_article_revisions_id_fk" FOREIGN KEY ("article_revision_id") REFERENCES "public"."article_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_revisions" ADD CONSTRAINT "article_revisions_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_owner_psychologist_id_psychologists_id_fk" FOREIGN KEY ("owner_psychologist_id") REFERENCES "public"."psychologists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_draft_revision_id_article_revisions_id_fk" FOREIGN KEY ("draft_revision_id") REFERENCES "public"."article_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_published_revision_id_article_revisions_id_fk" FOREIGN KEY ("published_revision_id") REFERENCES "public"."article_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_aggregates" ADD CONSTRAINT "landing_aggregates_active_draft_revision_id_landing_revisions_id_fk" FOREIGN KEY ("active_draft_revision_id") REFERENCES "public"."landing_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_aggregates" ADD CONSTRAINT "landing_aggregates_published_revision_id_landing_revisions_id_fk" FOREIGN KEY ("published_revision_id") REFERENCES "public"."landing_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_item_translations" ADD CONSTRAINT "landing_item_translations_item_id_landing_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."landing_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_items" ADD CONSTRAINT "landing_items_section_id_landing_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."landing_sections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_preview_capabilities" ADD CONSTRAINT "landing_preview_capabilities_landing_revision_id_landing_revisions_id_fk" FOREIGN KEY ("landing_revision_id") REFERENCES "public"."landing_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_revisions" ADD CONSTRAINT "landing_revisions_aggregate_id_landing_aggregates_id_fk" FOREIGN KEY ("aggregate_id") REFERENCES "public"."landing_aggregates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_revisions" ADD CONSTRAINT "landing_revisions_based_on_revision_id_landing_revisions_id_fk" FOREIGN KEY ("based_on_revision_id") REFERENCES "public"."landing_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_section_translations" ADD CONSTRAINT "landing_section_translations_section_id_landing_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."landing_sections"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_sections" ADD CONSTRAINT "landing_sections_landing_revision_id_landing_revisions_id_fk" FOREIGN KEY ("landing_revision_id") REFERENCES "public"."landing_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_media_object_id_media_objects_id_fk" FOREIGN KEY ("media_object_id") REFERENCES "public"."media_objects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_psychologist_id_psychologists_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_landing_revision_id_landing_revisions_id_fk" FOREIGN KEY ("landing_revision_id") REFERENCES "public"."landing_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_article_revision_id_article_revisions_id_fk" FOREIGN KEY ("article_revision_id") REFERENCES "public"."article_revisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_profile_translations" ADD CONSTRAINT "psychologist_profile_translations_psychologist_id_psychologist_profiles_psychologist_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologist_profiles"("psychologist_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD CONSTRAINT "psychologist_profiles_psychologist_id_psychologists_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_specialization_translations" ADD CONSTRAINT "psychologist_specialization_translations_specialization_id_psychologist_specializations_id_fk" FOREIGN KEY ("specialization_id") REFERENCES "public"."psychologist_specializations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_specializations" ADD CONSTRAINT "psychologist_specializations_psychologist_id_psychologists_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_support_areas" ADD CONSTRAINT "psychologist_support_areas_psychologist_id_psychologists_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "article_reviews_revision_created_idx" ON "article_reviews" USING btree ("article_revision_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "article_revisions_one_draft_per_article" ON "article_revisions" USING btree ("article_id") WHERE "article_revisions"."status" = 'draft';--> statement-breakpoint
CREATE UNIQUE INDEX "articles_slug_unique" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "articles_owner_status_idx" ON "articles" USING btree ("owner_psychologist_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_aggregates_singleton_key_unique" ON "landing_aggregates" USING btree ("singleton_key");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_preview_capabilities_token_digest_unique" ON "landing_preview_capabilities" USING btree ("token_digest");--> statement-breakpoint
CREATE INDEX "landing_preview_capabilities_expiry_idx" ON "landing_preview_capabilities" USING btree ("expires_at","revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "landing_revisions_one_draft_per_aggregate" ON "landing_revisions" USING btree ("aggregate_id") WHERE "landing_revisions"."status" = 'draft';--> statement-breakpoint
CREATE UNIQUE INDEX "media_attachments_psychologist_role_position_unique" ON "media_attachments" USING btree ("psychologist_id","role","position") WHERE "media_attachments"."psychologist_id" is not null and "media_attachments"."detached_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "media_attachments_landing_role_position_unique" ON "media_attachments" USING btree ("landing_revision_id","role","position") WHERE "media_attachments"."landing_revision_id" is not null and "media_attachments"."detached_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "media_attachments_article_role_position_unique" ON "media_attachments" USING btree ("article_revision_id","role","position") WHERE "media_attachments"."article_revision_id" is not null and "media_attachments"."detached_at" is null;--> statement-breakpoint
CREATE INDEX "media_attachments_media_object_idx" ON "media_attachments" USING btree ("media_object_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_objects_object_key_unique" ON "media_objects" USING btree ("object_key");--> statement-breakpoint
CREATE UNIQUE INDEX "media_objects_public_url_unique" ON "media_objects" USING btree ("public_url");--> statement-breakpoint
CREATE UNIQUE INDEX "psychologists_slug_unique" ON "psychologists" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "psychologists_featured_order_unique" ON "psychologists" USING btree ("featured_order") WHERE "psychologists"."featured" = true;--> statement-breakpoint
CREATE INDEX "psychologists_public_directory_idx" ON "psychologists" USING btree ("status","name");