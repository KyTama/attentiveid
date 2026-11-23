CREATE TABLE "assessment_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor" uuid,
	"action" text NOT NULL,
	"submission_id" uuid,
	"detail" text
);
--> statement-breakpoint
CREATE TABLE "assessment_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_no" integer GENERATED ALWAYS AS IDENTITY (sequence name "assessment_invites_invite_no_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" text NOT NULL,
	"track" text NOT NULL,
	"psychologist_id" uuid NOT NULL,
	"client_name" text,
	"client_email" text,
	"phone" text,
	"note" text,
	"lang" text,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	"used_submission_id" uuid,
	CONSTRAINT "assessment_invites_track" CHECK ("assessment_invites"."track" in ('asesmen','free')),
	CONSTRAINT "assessment_invites_status" CHECK ("assessment_invites"."status" in ('OPEN','USED','CANCELLED'))
);
--> statement-breakpoint
ALTER TABLE "assessment_participants" ADD COLUMN "track_origin" text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "invite_id" uuid;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "price_due" integer;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "credit_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "credits_granted" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "assessment_audit_at_idx" ON "assessment_audit" USING btree ("at");--> statement-breakpoint
CREATE INDEX "assessment_audit_submission_idx" ON "assessment_audit" USING btree ("submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_invites_no_idx" ON "assessment_invites" USING btree ("invite_no");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_invites_token_idx" ON "assessment_invites" USING btree ("token");--> statement-breakpoint
CREATE INDEX "assessment_invites_status_idx" ON "assessment_invites" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "assessment_submissions_invite_idx" ON "assessment_submissions" USING btree ("invite_id");--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_track" CHECK ("assessment_submissions"."track" in ('mandiri','asesmen','free','paket','lanjutan','legacy'));--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_price_due" CHECK ("assessment_submissions"."price_due" is null or "assessment_submissions"."price_due" >= 0);