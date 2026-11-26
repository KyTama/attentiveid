CREATE TABLE "email_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"builtin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_contact_categories" (
	"contact_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	CONSTRAINT "email_contact_categories_contact_id_category_id_pk" PRIMARY KEY("contact_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "email_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"phone_normalized" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_by" text DEFAULT '' NOT NULL,
	"updated_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"plan" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"applied_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_contact_categories" ADD CONSTRAINT "email_contact_categories_contact_id_email_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."email_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_contact_categories" ADD CONSTRAINT "email_contact_categories_category_id_email_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."email_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_audit_created_at_idx" ON "email_audit" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_categories_name_idx" ON "email_categories" USING btree (lower("name"));--> statement-breakpoint
CREATE INDEX "email_contact_categories_category_idx" ON "email_contact_categories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_contacts_email_idx" ON "email_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_contacts_phone_idx" ON "email_contacts" USING btree ("phone_normalized");--> statement-breakpoint
INSERT INTO "email_categories" ("name", "builtin") VALUES ('client', true), ('business', true);
