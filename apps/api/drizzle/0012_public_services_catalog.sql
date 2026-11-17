CREATE TYPE "public"."service_lifecycle_status" AS ENUM('draft', 'published', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."service_pricing_model" AS ENUM('fixed_variant', 'psychologist_rate', 'price_on_request', 'free_external');--> statement-breakpoint
CREATE TYPE "public"."service_program_status" AS ENUM('draft', 'active', 'ended');--> statement-breakpoint
CREATE TYPE "public"."service_program_type" AS ENUM('harga', 'persen', 'nominal', 'gratis');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('layanan', 'addon');--> statement-breakpoint
CREATE TYPE "public"."service_visibility" AS ENUM('public', 'internal');--> statement-breakpoint
CREATE TABLE "service_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_categories_non_negative_position" CHECK ("service_categories"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "service_category_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "service_category_translations_category_locale_unique" UNIQUE("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "service_deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"variant_slugs_json" text DEFAULT '[]' NOT NULL,
	"text_id" text NOT NULL,
	"text_en" text NOT NULL,
	CONSTRAINT "service_deliverables_service_position_unique" UNIQUE("service_id","position"),
	CONSTRAINT "service_deliverables_non_negative_position" CHECK ("service_deliverables"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "service_faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"question_id" text NOT NULL,
	"question_en" text NOT NULL,
	"answer_id" text NOT NULL,
	"answer_en" text NOT NULL,
	CONSTRAINT "service_faqs_service_position_unique" UNIQUE("service_id","position"),
	CONSTRAINT "service_faqs_non_negative_position" CHECK ("service_faqs"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "service_program_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"promo_amount" integer NOT NULL,
	"note_id" text,
	"note_en" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_program_prices_program_variant_unique" UNIQUE("program_id","variant_id"),
	CONSTRAINT "service_program_prices_non_negative_amount" CHECK ("service_program_prices"."promo_amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "service_program_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"name" text NOT NULL,
	"badge" text,
	CONSTRAINT "service_program_translations_program_locale_unique" UNIQUE("program_id","locale")
);
--> statement-breakpoint
CREATE TABLE "service_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"program_type" "service_program_type" DEFAULT 'harga' NOT NULL,
	"status" "service_program_status" DEFAULT 'draft' NOT NULL,
	"starts_on" text NOT NULL,
	"ends_on" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_psychologists" (
	"service_id" uuid NOT NULL,
	"psychologist_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"note_id" text,
	"note_en" text,
	CONSTRAINT "service_psychologists_pk" PRIMARY KEY("service_id","psychologist_id"),
	CONSTRAINT "service_psychologists_non_negative_position" CHECK ("service_psychologists"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "service_public_prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"amount_max" integer,
	"effective_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_public_prices_non_negative_amount" CHECK ("service_public_prices"."amount" >= 0),
	CONSTRAINT "service_public_prices_valid_amount_max" CHECK ("service_public_prices"."amount_max" is null or "service_public_prices"."amount_max" >= "service_public_prices"."amount")
);
--> statement-breakpoint
CREATE TABLE "service_reference_links" (
	"service_id" uuid NOT NULL,
	"reference_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "service_reference_links_pk" PRIMARY KEY("service_id","reference_id"),
	CONSTRAINT "service_reference_links_non_negative_position" CHECK ("service_reference_links"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "service_references" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"citation_text" text NOT NULL,
	"doi_url" text
);
--> statement-breakpoint
CREATE TABLE "service_subgroup_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subgroup_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"name" text NOT NULL,
	"note" text,
	CONSTRAINT "service_subgroup_translations_subgroup_locale_unique" UNIQUE("subgroup_id","locale")
);
--> statement-breakpoint
CREATE TABLE "service_subgroups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"slug" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_subgroups_non_negative_position" CHECK ("service_subgroups"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "service_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"name" text NOT NULL,
	"full_name" text,
	"badge" text,
	"short_summary" text,
	"benefit" text,
	"introduction" text,
	"target_audience" text,
	"what_is_measured" text,
	"duration_info" text,
	"location_info" text,
	"process_steps_json" text DEFAULT '[]' NOT NULL,
	"terms_json" text DEFAULT '[]' NOT NULL,
	"results_explanation" text,
	"scientific_basis" text,
	"citation_summary" text,
	"assessment_purpose" text,
	"assessment_aspects" text,
	"assessment_age_range" text,
	"assessment_method" text,
	"assessment_prep" text,
	"assessment_output_format" text,
	"assessment_dimensions_json" text DEFAULT '[]' NOT NULL,
	"assessment_report_type" text,
	"assessment_interpretation" text,
	"assessment_recommendations" text,
	"assessment_turnaround" text,
	CONSTRAINT "service_translations_service_locale_unique" UNIQUE("service_id","locale")
);
--> statement-breakpoint
CREATE TABLE "service_variant_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"unit_label" text,
	"age_range_label" text,
	"duration_label" text,
	CONSTRAINT "service_variant_translations_variant_locale_unique" UNIQUE("variant_id","locale")
);
--> statement-breakpoint
CREATE TABLE "service_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"status" "service_lifecycle_status" DEFAULT 'draft' NOT NULL,
	"visibility" "service_visibility" DEFAULT 'public' NOT NULL,
	"modalities_json" text DEFAULT '[]' NOT NULL,
	"branch" text,
	"price_on_request" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_variants_branch_valid" CHECK ("service_variants"."branch" is null or "service_variants"."branch" in ('tbi', 'bsd', 'malang')),
	CONSTRAINT "service_variants_non_negative_position" CHECK ("service_variants"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category_id" uuid NOT NULL,
	"subgroup_id" uuid,
	"service_type" "service_type" DEFAULT 'layanan' NOT NULL,
	"pricing_model" "service_pricing_model" NOT NULL,
	"status" "service_lifecycle_status" DEFAULT 'draft' NOT NULL,
	"visibility" "service_visibility" DEFAULT 'public' NOT NULL,
	"applies_new_client_fee" boolean DEFAULT false NOT NULL,
	"is_assessment" boolean DEFAULT false NOT NULL,
	"is_featured_spotlight" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"external_url" text,
	"default_concern_id" text,
	"default_client_category" text,
	"audiences_json" text DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_non_negative_position" CHECK ("services"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "media_attachments" DROP CONSTRAINT "media_attachments_exactly_one_owner";--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "service_id" uuid;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "service_variant_id" uuid;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "service_name_snapshot" text;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD COLUMN "service_id" uuid;--> statement-breakpoint
ALTER TABLE "service_category_translations" ADD CONSTRAINT "service_category_translations_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_deliverables" ADD CONSTRAINT "service_deliverables_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_faqs" ADD CONSTRAINT "service_faqs_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_program_prices" ADD CONSTRAINT "service_program_prices_program_id_service_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."service_programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_program_prices" ADD CONSTRAINT "service_program_prices_variant_id_service_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."service_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_program_translations" ADD CONSTRAINT "service_program_translations_program_id_service_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."service_programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_psychologists" ADD CONSTRAINT "service_psychologists_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_psychologists" ADD CONSTRAINT "service_psychologists_psychologist_id_psychologists_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_public_prices" ADD CONSTRAINT "service_public_prices_variant_id_service_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."service_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reference_links" ADD CONSTRAINT "service_reference_links_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_reference_links" ADD CONSTRAINT "service_reference_links_reference_id_service_references_id_fk" FOREIGN KEY ("reference_id") REFERENCES "public"."service_references"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_subgroup_translations" ADD CONSTRAINT "service_subgroup_translations_subgroup_id_service_subgroups_id_fk" FOREIGN KEY ("subgroup_id") REFERENCES "public"."service_subgroups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_subgroups" ADD CONSTRAINT "service_subgroups_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_translations" ADD CONSTRAINT "service_translations_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_variant_translations" ADD CONSTRAINT "service_variant_translations_variant_id_service_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."service_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_variants" ADD CONSTRAINT "service_variants_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_subgroup_id_service_subgroups_id_fk" FOREIGN KEY ("subgroup_id") REFERENCES "public"."service_subgroups"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "service_categories_slug_unique" ON "service_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "service_programs_slug_unique" ON "service_programs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "service_programs_status_dates_idx" ON "service_programs" USING btree ("status","starts_on","ends_on");--> statement-breakpoint
CREATE UNIQUE INDEX "service_public_prices_variant_unique" ON "service_public_prices" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "service_references_code_unique" ON "service_references" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "service_subgroups_slug_unique" ON "service_subgroups" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "service_variants_slug_unique" ON "service_variants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "service_variants_service_status_idx" ON "service_variants" USING btree ("service_id","status","visibility","position");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_unique" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_public_catalog_idx" ON "services" USING btree ("status","visibility","position");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_variant_id_service_variants_id_fk" FOREIGN KEY ("service_variant_id") REFERENCES "public"."service_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bookings_service_id_idx" ON "bookings" USING btree ("service_id");--> statement-breakpoint
CREATE UNIQUE INDEX "media_attachments_service_role_position_unique" ON "media_attachments" USING btree ("service_id","role","position") WHERE "media_attachments"."service_id" is not null and "media_attachments"."detached_at" is null;--> statement-breakpoint
ALTER TABLE "media_attachments" ADD CONSTRAINT "media_attachments_exactly_one_owner" CHECK (num_nonnulls("media_attachments"."psychologist_id", "media_attachments"."landing_revision_id", "media_attachments"."article_revision_id", "media_attachments"."service_id") = 1);