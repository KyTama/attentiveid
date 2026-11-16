CREATE TABLE "featured_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title_id" text NOT NULL,
	"title_en" text NOT NULL,
	"description_id" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"url" text DEFAULT '' NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "featured_products_period_order" CHECK ("featured_products"."start_at" is null or "featured_products"."end_at" is null or "featured_products"."end_at" > "featured_products"."start_at")
);
--> statement-breakpoint
CREATE TABLE "page_view_daily" (
	"path" text NOT NULL,
	"day" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"sessions" integer DEFAULT 0 NOT NULL,
	"last_visit_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_view_daily_path_day_pk" PRIMARY KEY("path","day")
);
--> statement-breakpoint
CREATE TABLE "qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"target_url" text NOT NULL,
	"foreground" text DEFAULT '#14284B' NOT NULL,
	"background" text DEFAULT '#FFFFFF' NOT NULL,
	"logo_data_url" text DEFAULT '' NOT NULL,
	"logo_scale" double precision DEFAULT 0.2 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_previews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "featured_products_slug_unique" ON "featured_products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "share_previews_path_unique" ON "share_previews" USING btree ("path");--> statement-breakpoint
INSERT INTO "featured_products" ("slug", "title_id", "title_en", "url", "sort_order") VALUES
	('let-there-be-light', 'Let There Be Light', 'Let There Be Light', '/let-there-be-light', 1),
	('your-social-world', 'Your Social World', 'Your Social World', '', 2)
ON CONFLICT ("slug") DO NOTHING;
