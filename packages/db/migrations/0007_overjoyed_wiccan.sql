CREATE TYPE "public"."listing_type" AS ENUM('normal', 'npa', 'auction');--> statement-breakpoint
CREATE TYPE "public"."sale_condition" AS ENUM('new', 'resale', 'unknown');--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "listing_type" "listing_type" DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "sale_condition" "sale_condition" DEFAULT 'unknown' NOT NULL;