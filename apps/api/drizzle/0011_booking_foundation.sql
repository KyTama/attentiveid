CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'in_session', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."webhook_delivery_status" AS ENUM('pending', 'processing', 'delivered', 'failed', 'dead_letter');--> statement-breakpoint
CREATE TABLE "booking_clinical_intakes" (
	"booking_id" uuid PRIMARY KEY NOT NULL,
	"concern_note" text,
	"crisis_flag_triggered" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_webhook_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"event_type" text DEFAULT 'booking.submitted' NOT NULL,
	"idempotency_key" text NOT NULL,
	"payload_json" text NOT NULL,
	"status" "webhook_delivery_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_error" text,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_code" text NOT NULL,
	"client_user_id" uuid,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"language" "content_locale" DEFAULT 'id' NOT NULL,
	"client_status" text NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"whatsapp_e164" text NOT NULL,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"country_region" text,
	"age" integer,
	"gender" text,
	"service_type" text DEFAULT 'Personal' NOT NULL,
	"concern_id" text,
	"concern_category" text,
	"client_category" text,
	"gender_preference" text,
	"consultation_mode" text NOT NULL,
	"location" text,
	"psychologist_choice" text NOT NULL,
	"psychologist_id" uuid,
	"selected_psychologist_name" text,
	"schedule_option_1" text NOT NULL,
	"schedule_option_2" text,
	"schedule_option_3" text,
	"confirmed_start_at" timestamp with time zone,
	"confirmed_end_at" timestamp with time zone,
	"base_rate" integer DEFAULT 0 NOT NULL,
	"assessment_fee" integer DEFAULT 0 NOT NULL,
	"total_rate" integer DEFAULT 0 NOT NULL,
	"marketing_source" text,
	"referrer" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"campaign_id" text,
	"adset_id" text,
	"ad_id" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_client_status_valid" CHECK ("bookings"."client_status" in ('new', 'returning')),
	CONSTRAINT "bookings_consultation_mode_valid" CHECK ("bookings"."consultation_mode" in ('online', 'offline')),
	CONSTRAINT "bookings_location_valid" CHECK ("bookings"."location" is null or "bookings"."location" in ('tbi', 'bsd', 'malang')),
	CONSTRAINT "bookings_psychologist_choice_valid" CHECK ("bookings"."psychologist_choice" in ('recommended', 'previous', 'self')),
	CONSTRAINT "bookings_non_negative_rates" CHECK ("bookings"."base_rate" >= 0 and "bookings"."assessment_fee" >= 0 and "bookings"."total_rate" >= 0)
);
--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "consultation_duration" text DEFAULT '60 menit' NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "online_rate" integer;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "offline_rate" integer;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "available_online" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "available_tbi" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "available_bsd" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "available_malang" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "schedule_mon" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "schedule_tue" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "schedule_wed" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "schedule_thu" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "schedule_fri" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "schedule_sat" text;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "schedule_sun" text;--> statement-breakpoint
ALTER TABLE "booking_clinical_intakes" ADD CONSTRAINT "booking_clinical_intakes_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_webhook_deliveries" ADD CONSTRAINT "booking_webhook_deliveries_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_user_id_users_id_fk" FOREIGN KEY ("client_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_psychologist_id_psychologists_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologists"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "booking_webhook_deliveries_idempotency_key_unique" ON "booking_webhook_deliveries" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "booking_webhook_deliveries_due_idx" ON "booking_webhook_deliveries" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "booking_webhook_deliveries_booking_id_idx" ON "booking_webhook_deliveries" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_booking_code_unique" ON "bookings" USING btree ("booking_code");--> statement-breakpoint
CREATE INDEX "bookings_status_submitted_at_idx" ON "bookings" USING btree ("status","submitted_at");--> statement-breakpoint
CREATE INDEX "bookings_psychologist_confirmed_start_idx" ON "bookings" USING btree ("psychologist_id","confirmed_start_at");--> statement-breakpoint
CREATE INDEX "bookings_email_normalized_idx" ON "bookings" USING btree ("email_normalized");--> statement-breakpoint
CREATE INDEX "bookings_whatsapp_e164_idx" ON "bookings" USING btree ("whatsapp_e164");--> statement-breakpoint
CREATE INDEX "bookings_client_user_id_idx" ON "bookings" USING btree ("client_user_id");--> statement-breakpoint
CREATE INDEX "bookings_utm_campaign_idx" ON "bookings" USING btree ("utm_campaign");--> statement-breakpoint
CREATE INDEX "bookings_campaign_id_idx" ON "bookings" USING btree ("campaign_id");--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD CONSTRAINT "psychologist_profiles_non_negative_online_rate" CHECK ("psychologist_profiles"."online_rate" is null or "psychologist_profiles"."online_rate" >= 0);--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD CONSTRAINT "psychologist_profiles_non_negative_offline_rate" CHECK ("psychologist_profiles"."offline_rate" is null or "psychologist_profiles"."offline_rate" >= 0);--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD CONSTRAINT "psychologist_profiles_online_rate_required" CHECK ("psychologist_profiles"."available_online" = false or "psychologist_profiles"."online_rate" is not null);--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD CONSTRAINT "psychologist_profiles_offline_rate_required" CHECK ((not "psychologist_profiles"."available_tbi" and not "psychologist_profiles"."available_bsd" and not "psychologist_profiles"."available_malang") or "psychologist_profiles"."offline_rate" is not null);--> statement-breakpoint
UPDATE "psychologist_profiles" AS pp
SET
	"consultation_duration" = v."consultation_duration",
	"online_rate" = v."online_rate",
	"offline_rate" = v."offline_rate",
	"available_online" = v."available_online",
	"available_tbi" = v."available_tbi",
	"available_bsd" = v."available_bsd",
	"available_malang" = v."available_malang",
	"schedule_mon" = v."schedule_mon",
	"schedule_tue" = v."schedule_tue",
	"schedule_wed" = v."schedule_wed",
	"schedule_thu" = v."schedule_thu",
	"schedule_fri" = v."schedule_fri",
	"schedule_sat" = v."schedule_sat",
	"schedule_sun" = v."schedule_sun"
FROM "psychologists" AS p
JOIN (
	VALUES
		('syazka', '60 menit', 750000, 800000, true, true, false, false, 'OFF', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 14.00', 'OFF'),
		('gita', '60 menit', 750000, 800000, true, true, false, false, 'OFF', 'OFF', '10.00 s/d 18.00', '10.00 s/d 18.00', 'OFF', 'OFF', 'OFF'),
		('mayda', '60 menit', 750000, 800000, true, true, false, false, '10.00 s/d 18.00', '10.00 s/d 18.00', '10.00 s/d 18.00', '10.00 s/d 18.00', '10.00 s/d 18.00', '10.00 s/d 18.00', 'OFF'),
		('ilham', '60 menit', 750000, 800000, true, true, false, false, 'OFF', '19.00 s/d 21.00', '19.00 s/d 21.00', '19.00 s/d 21.00', 'OFF', '10.00 s/d 14.00', 'OFF'),
		('dinda', '60 menit', 750000, 800000, true, true, false, false, 'OFF', 'OFF', 'OFF', 'OFF', 'OFF', '11.00 s/d 14.00', 'by Appointment'),
		('dewinta', '60 menit', 750000, 800000, true, true, false, false, 'by Appointment', 'by Appointment', 'by Appointment', 'by Appointment', 'by Appointment', 'OFF', 'OFF'),
		('andri', '60 menit', 500000, 550000, true, true, true, false, 'OFF', '16.00 s/d 19.00 (BSD)', '11.00 s/d 17.00 (BSD)', '11.00 s/d 17.00 (TBI)', '10.00 s/d 17.30 (TBI)', '11.00 s/d 14.00 (TBI)', 'OFF'),
		('audria', '60 menit', 500000, 550000, true, true, false, false, '19.30 s/d 20.00', '19.30 s/d 20.00', '19.30 s/d 20.00', '19.30 s/d 20.00', '19.30 s/d 20.00', 'by Appointment', 'OFF'),
		('angelina', '60 menit', 500000, 550000, true, true, true, false, '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', 'by Appointment', 'by Appointment'),
		('farahdilla', '60 menit', 500000, 550000, true, true, true, false, '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', 'by Appointment', 'OFF'),
		('gisella', '60 menit', 950000, 1000000, true, true, false, false, 'OFF', '09.00 s/d 12.00', 'OFF', 'OFF', '11.00 s/d 19.00', 'by Appointment', 'OFF'),
		('nichi', '60 menit', 750000, 800000, true, false, true, false, 'OFF', 'OFF', 'OFF', 'OFF', 'OFF', '10.00 s/d 17.00', 'by Appointment'),
		('jessica', '60 menit', 500000, 550000, true, false, true, false, 'OFF', 'OFF', 'OFF', '09.00 s/d 20.00', '09.00 s/d 20.00', 'by Appointment', 'OFF'),
		('farhan', '60 menit', 500000, 550000, true, false, true, false, '17.00 s/d 19.00', '17.00 s/d 19.00', '17.00 s/d 19.00', '17.00 s/d 19.00', '17.00 s/d 19.00', 'by Appointment', 'by Appointment'),
		('grace', '60 menit', 400000, 450000, true, false, false, true, '12.00 s/d 19.00', '12.00 s/d 19.00', '12.00 s/d 19.00', '12.00 s/d 19.00', '12.00 s/d 19.00', 'by Appointment', 'by Appointment'),
		('nuzul', '60 menit', 400000, 450000, true, false, false, true, '10.00 s/d 12.00 & 15.00 s/d 19.00', '10.00 s/d 12.00 & 15.00 s/d 19.00', 'OFF', '10.00 s/d 12.00 & 15.00 s/d 19.00', 'OFF', '10.00 s/d 19.00', 'OFF'),
		('dominika', '60 menit', 750000, 800000, true, true, false, false, '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 19.00', '10.00 s/d 16.00', 'OFF'),
		('ratri', '60 menit', 550000, 600000, true, true, false, false, '', '', '', '', '', '', '')
) AS v(
	"slug",
	"consultation_duration",
	"online_rate",
	"offline_rate",
	"available_online",
	"available_tbi",
	"available_bsd",
	"available_malang",
	"schedule_mon",
	"schedule_tue",
	"schedule_wed",
	"schedule_thu",
	"schedule_fri",
	"schedule_sat",
	"schedule_sun"
) ON p."slug" = v."slug"
WHERE pp."psychologist_id" = p."id";