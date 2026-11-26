CREATE TABLE "feedback_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"actor" text DEFAULT '' NOT NULL,
	"action" text NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"author" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback_files" ADD COLUMN "note_id" uuid;--> statement-breakpoint
ALTER TABLE "feedback_reports" ADD COLUMN "status" text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback_reports" ADD COLUMN "assignee" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback_events" ADD CONSTRAINT "feedback_events_report_id_feedback_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."feedback_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_notes" ADD CONSTRAINT "feedback_notes_report_id_feedback_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."feedback_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feedback_events_report_idx" ON "feedback_events" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "feedback_notes_report_idx" ON "feedback_notes" USING btree ("report_id");--> statement-breakpoint
ALTER TABLE "feedback_files" ADD CONSTRAINT "feedback_files_note_id_feedback_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."feedback_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
UPDATE "feedback_reports" SET "status" = 'done' WHERE "done_at" IS NOT NULL;