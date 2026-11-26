CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team" text NOT NULL,
	"name" text NOT NULL,
	"role_id" text DEFAULT '' NOT NULL,
	"role_en" text DEFAULT '' NOT NULL,
	"photo_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_team_valid" CHECK ("team_members"."team" in ('psych', 'scientist', 'counsel', 'ops', 'advisor'))
);
--> statement-breakpoint
ALTER TABLE "sci_briefs" ADD COLUMN "is_free" boolean DEFAULT false NOT NULL;