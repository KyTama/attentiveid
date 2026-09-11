CREATE TYPE "public"."practice_branch" AS ENUM('tbi', 'bsd', 'malang', 'online_only', 'multiple');--> statement-breakpoint
CREATE TYPE "public"."psychologist_tier" AS ENUM('principal', 'senior', 'senior_mid', 'mid', 'consultant');--> statement-breakpoint
ALTER TABLE "psychologists" ADD COLUMN "tier" "psychologist_tier" DEFAULT 'mid' NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologists" ADD COLUMN "primary_branch" "practice_branch" DEFAULT 'tbi' NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologists" ADD COLUMN "accepting_new_clients" boolean DEFAULT true NOT NULL;