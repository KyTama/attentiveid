CREATE TABLE "assessment_payment_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "result_email_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "payment_for" text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "payment_submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "assessment_payment_proofs" ADD CONSTRAINT "assessment_payment_proofs_submission_id_assessment_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."assessment_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessment_payment_proofs_submission_idx" ON "assessment_payment_proofs" USING btree ("submission_id");