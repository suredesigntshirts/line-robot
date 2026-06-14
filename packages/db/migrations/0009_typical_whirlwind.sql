ALTER TYPE "public"."approval_status" ADD VALUE 'rejected';--> statement-breakpoint
ALTER TYPE "public"."role_kind" ADD VALUE 'admin';--> statement-breakpoint
CREATE TABLE "broker_preference" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"provinces" text[] DEFAULT '{}' NOT NULL,
	"property_types" text[] DEFAULT '{}' NOT NULL,
	"price_band_ids" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "reviewed_by" uuid;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "broker_preference" ADD CONSTRAINT "broker_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_reviewed_by_user_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;