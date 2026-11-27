CREATE TABLE "email_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contact_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"files" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sent_by" text DEFAULT '' NOT NULL,
	"status" text NOT NULL,
	"message_id" text DEFAULT '' NOT NULL,
	"provider_id" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_messages_direction_valid" CHECK ("email_messages"."direction" in ('in', 'out'))
);
--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_contact_id_email_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."email_contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_messages_contact_idx" ON "email_messages" USING btree ("contact_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "email_messages_provider_idx" ON "email_messages" USING btree ("provider_id");