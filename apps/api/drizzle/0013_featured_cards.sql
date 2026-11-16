ALTER TABLE "featured_products" ADD COLUMN "theme" text DEFAULT 'blue' NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_products" ADD COLUMN "icon" text DEFAULT 'sparkles' NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_products" ADD COLUMN "badge_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_products" ADD COLUMN "badge_en" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_products" ADD COLUMN "cta_id" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "featured_products" ADD COLUMN "cta_en" text DEFAULT '' NOT NULL;--> statement-breakpoint
UPDATE "featured_products" SET "sort_order" = "sort_order" + 2 WHERE "slug" IN ('let-there-be-light', 'your-social-world') AND "sort_order" <= 2;--> statement-breakpoint
UPDATE "featured_products" SET "theme" = 'navy' WHERE "slug" = 'your-social-world';--> statement-breakpoint
INSERT INTO "featured_products" ("slug", "title_id", "title_en", "description_id", "description_en", "theme", "icon", "badge_id", "badge_en", "cta_id", "cta_en", "url", "sort_order") VALUES
	('free-session', 'First Free Session Consultation', 'First Free Session Consultation', 'Klaim sesi privat 1-on-1 tanpa biaya untuk langkah awalmu.', 'Claim a private 1-on-1 session at no cost to begin your journey.', 'gold', 'gift', 'Promo Khusus', 'Limited Offer', 'Klaim Sesi Gratis', 'Claim Free Session', 'https://free-session.attentiveid.com', 0),
	('booking', 'Booking / Reservasi Psikolog', 'Booking / Reserve Psychologist', 'Pilih psikolog dan tentukan jadwal sesi online atau klinik.', 'Select your psychologist and choose an online or in-person slot.', 'navy', 'calendar', 'Jadwal Langsung', 'Direct Booking', 'Reservasi Jadwal', 'Book a Session', 'https://booking.attentiveid.com/', 1)
ON CONFLICT ("slug") DO NOTHING;
