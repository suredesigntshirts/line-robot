CREATE TABLE "listing_note" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "claim_invited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "claimed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "listing" ADD COLUMN "claimed_by_user_id" uuid;--> statement-breakpoint
ALTER TABLE "listing_note" ADD CONSTRAINT "listing_note_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_note" ADD CONSTRAINT "listing_note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_note_listing_user" ON "listing_note" USING btree ("listing_id","user_id");--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_claimed_by_user_id_user_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;