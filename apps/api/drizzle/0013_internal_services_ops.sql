ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "demo_config_json" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_internal_costs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_id" text,
	"service_id" uuid NOT NULL,
	"variant_id" uuid,
	"psychologist_id" uuid,
	"record_kind" text NOT NULL,
	"record_status" text NOT NULL,
	"amount" integer,
	"amount_max" integer,
	"unit_label" text,
	"effective_date" text,
	"label" text,
	"note" text,
	"source_meta_json" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_internal_costs_kind_valid" CHECK ("service_internal_costs"."record_kind" in ('harga', 'fee', 'biaya', 'promo')),
	CONSTRAINT "service_internal_costs_status_valid" CHECK ("service_internal_costs"."record_status" in ('berlaku', 'usulan', 'historis')),
	CONSTRAINT "service_internal_costs_non_negative_amount" CHECK ("service_internal_costs"."amount" is null or "service_internal_costs"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_data_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"issue_type" text NOT NULL,
	"title" text NOT NULL,
	"detail" text NOT NULL,
	"status" text DEFAULT 'Terbuka' NOT NULL,
	"resolution" text,
	"refs_json" text DEFAULT '[]' NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_data_issues_type_valid" CHECK ("service_data_issues"."issue_type" in ('Perlu Verifikasi', 'Perlu Dilengkapi')),
	CONSTRAINT "service_data_issues_status_valid" CHECK ("service_data_issues"."status" in ('Terbuka', 'Selesai'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_ops_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"singleton_key" boolean DEFAULT true NOT NULL,
	"margin_threshold" integer DEFAULT 30 NOT NULL,
	"assumptions_json" text DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "service_ops_settings_threshold_valid" CHECK ("service_ops_settings"."margin_threshold" >= 0 and "service_ops_settings"."margin_threshold" <= 100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_slug" text,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_internal_costs" ADD CONSTRAINT "service_internal_costs_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "service_internal_costs" ADD CONSTRAINT "service_internal_costs_variant_id_service_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."service_variants"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "service_internal_costs" ADD CONSTRAINT "service_internal_costs_psychologist_id_psychologists_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "service_audit_logs" ADD CONSTRAINT "service_audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "service_internal_costs_legacy_id_unique" ON "service_internal_costs" USING btree ("legacy_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_internal_costs_service_variant_idx" ON "service_internal_costs" USING btree ("service_id","variant_id","record_kind","record_status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "service_data_issues_code_unique" ON "service_data_issues" USING btree ("code");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "service_ops_settings_singleton_unique" ON "service_ops_settings" USING btree ("singleton_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_audit_logs_created_idx" ON "service_audit_logs" USING btree ("created_at");
