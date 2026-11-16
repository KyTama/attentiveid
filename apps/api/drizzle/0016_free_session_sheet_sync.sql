ALTER TABLE "free_session_submissions" ADD COLUMN "sheet_synced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "free_session_submissions" ADD COLUMN "sheet_error" text;