CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX "listing_content_headline_trgm" ON "listing_content" USING gin ("headline" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "listing_content_description_trgm" ON "listing_content" USING gin ("description" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "listing_landmark_trgm" ON "listing" USING gin ("landmark" gin_trgm_ops);