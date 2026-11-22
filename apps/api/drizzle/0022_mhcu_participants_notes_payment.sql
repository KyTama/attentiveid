CREATE TABLE "assessment_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_no" integer GENERATED ALWAYS AS IDENTITY (sequence name "assessment_participants_participant_no_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email_norm" text,
	"phone_norm" text,
	"name" text NOT NULL,
	"sex" text,
	"first_session_at" timestamp with time zone,
	"last_session_at" timestamp with time zone,
	"n_sessions" integer DEFAULT 0 NOT NULL,
	"psychologist_id" uuid,
	"credits_total" integer DEFAULT 0 NOT NULL,
	"credits_remaining" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "participant_id" uuid;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "wave_no" integer;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "psychologist_id" uuid;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "note_template" text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "note_custom" text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "note_final" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "note_updated_by" uuid;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "note_updated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "payment_status" text DEFAULT 'UNPAID' NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "payment_package" text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "payment_amount" integer;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "payment_ref" text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "paid_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "report_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "admin_alert_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_participants_no_idx" ON "assessment_participants" USING btree ("participant_no");--> statement-breakpoint
CREATE INDEX "assessment_participants_email_idx" ON "assessment_participants" USING btree ("email_norm");--> statement-breakpoint
CREATE INDEX "assessment_participants_phone_idx" ON "assessment_participants" USING btree ("phone_norm");--> statement-breakpoint
CREATE INDEX "assessment_submissions_participant_idx" ON "assessment_submissions" USING btree ("participant_id","wave_no");--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_payment_status" CHECK ("assessment_submissions"."payment_status" in ('UNPAID','PAID','FREE','INCLUDED','LEGACY'));--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_note_custom_len" CHECK ("assessment_submissions"."note_custom" is null or char_length("assessment_submissions"."note_custom") <= 500);