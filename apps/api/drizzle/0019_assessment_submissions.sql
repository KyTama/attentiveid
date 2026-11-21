CREATE TABLE "assessment_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instrument" text NOT NULL,
	"code" text NOT NULL,
	"code_year" integer NOT NULL,
	"code_seq" integer NOT NULL,
	"lang" text NOT NULL,
	"track" text DEFAULT 'mandiri' NOT NULL,
	"consent_version" text NOT NULL,
	"research_consent" boolean NOT NULL,
	"guardian" boolean DEFAULT false NOT NULL,
	"consent_ack" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"name" text NOT NULL,
	"sex" text,
	"age" integer NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"answers" jsonb NOT NULL,
	"scores" jsonb NOT NULL,
	"level" integer,
	"duration_sec" integer,
	"status" text DEFAULT 'new' NOT NULL,
	"reviewer_id" uuid,
	"reviewer_note" text,
	"reviewed_at" timestamp with time zone,
	"released_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sheet_synced_at" timestamp with time zone,
	"sheet_error" text,
	CONSTRAINT "assessment_submissions_status" CHECK ("assessment_submissions"."status" in ('new','reviewed','released'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_submissions_code_idx" ON "assessment_submissions" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_submissions_seq_idx" ON "assessment_submissions" USING btree ("instrument","code_year","code_seq");--> statement-breakpoint
CREATE INDEX "assessment_submissions_created_at_idx" ON "assessment_submissions" USING btree ("instrument","created_at");--> statement-breakpoint
CREATE INDEX "assessment_submissions_email_idx" ON "assessment_submissions" USING btree ("email");