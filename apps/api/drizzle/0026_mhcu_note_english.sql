ALTER TABLE "assessment_submissions" ADD COLUMN "note_template_en" text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD COLUMN "note_custom_en" text;--> statement-breakpoint
ALTER TABLE "assessment_submissions" ADD CONSTRAINT "assessment_submissions_note_custom_en_len" CHECK ("assessment_submissions"."note_custom_en" is null or char_length("assessment_submissions"."note_custom_en") <= 500);--> statement-breakpoint
-- Until now one set of note fields served both reports, and for a person who filled in the form in English they were typed in English.
-- Copy them to the English fields (the originals stay), so every existing report, released links included, renders exactly as before.
-- note_custom is already limited to 500 characters (0022), the same limit as note_custom_en, so nothing is cut.
UPDATE "assessment_submissions" SET "note_template_en" = "note_template", "note_custom_en" = "note_custom" WHERE "instrument" = 'mhcu' AND "lang" = 'en' AND ("note_template" IS NOT NULL OR "note_custom" IS NOT NULL);
