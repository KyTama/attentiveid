CREATE TABLE "sci_brief_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brief_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"data" "bytea" NOT NULL,
	"byte_size" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sci_brief_files_kind_valid" CHECK ("sci_brief_files"."kind" in ('preview', 'full'))
);
--> statement-breakpoint
CREATE TABLE "sci_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title_id" text NOT NULL,
	"title_en" text NOT NULL,
	"summary_id" text NOT NULL,
	"summary_en" text NOT NULL,
	"period_month" text NOT NULL,
	"release_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"document_name" text,
	"total_pages" integer,
	"preview_pages" integer DEFAULT 3 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sci_briefs_status_valid" CHECK ("sci_briefs"."status" in ('draft', 'published')),
	CONSTRAINT "sci_briefs_period_month_format" CHECK ("sci_briefs"."period_month" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
	CONSTRAINT "sci_briefs_preview_pages_range" CHECK ("sci_briefs"."preview_pages" between 1 and 10)
);
--> statement-breakpoint
ALTER TABLE "sci_brief_files" ADD CONSTRAINT "sci_brief_files_brief_id_sci_briefs_id_fk" FOREIGN KEY ("brief_id") REFERENCES "public"."sci_briefs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sci_brief_files_brief_kind_unique" ON "sci_brief_files" USING btree ("brief_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "sci_briefs_slug_unique" ON "sci_briefs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sci_briefs_release_at_idx" ON "sci_briefs" USING btree ("release_at");