CREATE TABLE "review_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_hash" text NOT NULL,
	"name" text NOT NULL,
	"quote_id" text NOT NULL,
	"quote_en" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_imports_status_valid" CHECK ("review_imports"."status" in ('new', 'shown', 'dismissed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "review_imports_source_hash_unique" ON "review_imports" USING btree ("source_hash");