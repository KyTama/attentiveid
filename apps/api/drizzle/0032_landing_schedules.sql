CREATE TABLE "landing_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hero" jsonb NOT NULL,
	"publish_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"error" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "landing_schedules_due_idx" ON "landing_schedules" USING btree ("status","publish_at");