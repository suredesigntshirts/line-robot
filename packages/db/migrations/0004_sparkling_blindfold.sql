CREATE TABLE "listing_event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"listing_id" uuid NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"title" text,
	"notify_conversation_key" text NOT NULL,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listing_event" ADD CONSTRAINT "listing_event_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_event_due" ON "listing_event" USING btree ("due_at") WHERE "listing_event"."notified_at" is null;