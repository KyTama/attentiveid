CREATE TABLE "free_session_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"age" integer NOT NULL,
	"gender" text,
	"phone" text NOT NULL,
	"email" text,
	"keluhan" text NOT NULL,
	"keluhan_detail" text,
	"agreed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "free_session_submissions_age_range" CHECK ("free_session_submissions"."age" between 15 and 99)
);
--> statement-breakpoint
CREATE INDEX "free_session_submissions_created_at_idx" ON "free_session_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "free_session_submissions_phone_idx" ON "free_session_submissions" USING btree ("phone");