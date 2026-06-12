CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint
CREATE TYPE "public"."amenity" AS ENUM('swimming_pool', 'private_pool', 'fitness', 'parking', 'covered_parking', 'security_24h', 'cctv', 'keycard_access', 'playground', 'coworking', 'rooftop', 'clubhouse', 'garden', 'servant_quarters', 'pets_allowed_area');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('none', 'pending', 'approved');--> statement-breakpoint
CREATE TYPE "public"."content_generated_by" AS ENUM('human', 'llm');--> statement-breakpoint
CREATE TYPE "public"."content_lang" AS ENUM('th', 'en');--> statement-breakpoint
CREATE TYPE "public"."deal_type" AS ENUM('sale', 'rent');--> statement-breakpoint
CREATE TYPE "public"."extraction_source" AS ENUM('auto', 'poster_confirmed');--> statement-breakpoint
CREATE TYPE "public"."facing_direction" AS ENUM('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW');--> statement-breakpoint
CREATE TYPE "public"."furnishing_status" AS ENUM('fully', 'partly', 'unfurnished');--> statement-breakpoint
CREATE TYPE "public"."identity_provider" AS ENUM('line', 'email', 'google');--> statement-breakpoint
CREATE TYPE "public"."listing_mandate" AS ENUM('group_exclusive', 'open');--> statement-breakpoint
CREATE TYPE "public"."market_data_source" AS ENUM('led', 'treasury', 'asking');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('photo', 'chanote', 'floorplan', 'render');--> statement-breakpoint
CREATE TYPE "public"."merge_request_status" AS ENUM('open', 'resolved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."moderation_target_type" AS ENUM('listing', 'merge_request');--> statement-breakpoint
CREATE TYPE "public"."price_change_reason" AS ENUM('new', 'reduced', 'corrected');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('land', 'house', 'townhouse', 'condo', 'commercial', 'other');--> statement-breakpoint
CREATE TYPE "public"."quota_bucket" AS ENUM('foreign_quota', 'thai_quota');--> statement-breakpoint
CREATE TYPE "public"."release_state" AS ENUM('held', 'releasable', 'released');--> statement-breakpoint
CREATE TYPE "public"."rental_status" AS ENUM('available', 'rented', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."road_type" AS ENUM('public', 'private_easement', 'none');--> statement-breakpoint
CREATE TYPE "public"."role_kind" AS ENUM('broker', 'investor', 'owner', 'visitor');--> statement-breakpoint
CREATE TYPE "public"."sale_stage" AS ENUM('available', 'reserved', 'under_contract', 'transferred');--> statement-breakpoint
CREATE TYPE "public"."tenure" AS ENUM('freehold', 'leasehold');--> statement-breakpoint
CREATE TYPE "public"."title_deed_type" AS ENUM('chanote', 'ns3g', 'ns3k', 'ns3', 'spk', 'pbt5', 'ns2', 'stg', 'sk1', 'other', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('normal', 'khai_fak');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('normal', 'quick_sale', 'price_reduced');--> statement-breakpoint
CREATE TYPE "public"."utility_rate_type" AS ENUM('government', 'landlord_rate', 'included', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."viewing_status" AS ENUM('requested', 'confirmed', 'done', 'cancelled');--> statement-breakpoint
CREATE TABLE "account_merge_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id_a" uuid NOT NULL,
	"user_id_b" uuid NOT NULL,
	"reason" text NOT NULL,
	"status" "merge_request_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_by" uuid
);
--> statement-breakpoint
CREATE TABLE "co_agent_agreement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"holder_user_id" uuid NOT NULL,
	"co_agent_user_id" uuid NOT NULL,
	"split_pct" double precision DEFAULT 50 NOT NULL,
	"acknowledged_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "group_membership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_in_group" text,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"line_group_id" text,
	"name" text NOT NULL,
	"exclusivity_window_days" integer DEFAULT 7 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_line_group_id_unique" UNIQUE("line_group_id")
);
--> statement-breakpoint
CREATE TABLE "interest_flag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_amenity" (
	"listing_id" uuid NOT NULL,
	"amenity" "amenity" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_condo" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"cam_fee_per_sqm_month" double precision,
	"sinking_fund_per_sqm" double precision,
	"foreign_quota_available" boolean,
	"project_foreign_quota_pct" double precision,
	"quota_bucket" "quota_bucket"
);
--> statement-breakpoint
CREATE TABLE "listing_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"lang" "content_lang" NOT NULL,
	"headline" text NOT NULL,
	"description" text NOT NULL,
	"generated_by" "content_generated_by" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_exclusivity" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"window_opened_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"release_state" "release_state" DEFAULT 'held' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_fees" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"commission_pct" double precision,
	"fee_split_note" text
);
--> statement-breakpoint
CREATE TABLE "listing_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"s3_key" text NOT NULL,
	"kind" "media_kind" NOT NULL,
	"hero_index" integer,
	"is_render" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_rental" (
	"listing_id" uuid PRIMARY KEY NOT NULL,
	"monthly_rent" bigint,
	"deposit_months" smallint DEFAULT 2 NOT NULL,
	"advance_months" smallint DEFAULT 1 NOT NULL,
	"min_lease_months" smallint DEFAULT 12 NOT NULL,
	"pets_allowed" boolean,
	"furnishing_status" "furnishing_status",
	"furnishing_notes" text,
	"utility_rate_type" "utility_rate_type" DEFAULT 'unknown' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"source_group_id" uuid,
	"deal_type" "deal_type" NOT NULL,
	"sale_stage" "sale_stage",
	"rental_status" "rental_status",
	"title_deed_type" "title_deed_type" DEFAULT 'unknown' NOT NULL,
	"tenure" "tenure",
	"lease_years" integer,
	"property_type" "property_type" NOT NULL,
	"price_thb" bigint,
	"price_negotiable" boolean DEFAULT false NOT NULL,
	"urgency" "urgency" DEFAULT 'normal' NOT NULL,
	"transaction_type" "transaction_type" DEFAULT 'normal' NOT NULL,
	"redemption_period_years" integer,
	"province" text,
	"amphoe" text,
	"tambon" text,
	"landmark" text,
	"project_name" text,
	"address_detail" text,
	"geom" geography(Point,4326),
	"land_rai" integer,
	"land_ngan" integer,
	"land_wah" double precision,
	"land_sqm" double precision,
	"floor_area_sqm" double precision,
	"price_per_sqm" double precision,
	"price_per_wah" double precision,
	"bedrooms" smallint,
	"bathrooms" smallint,
	"facing_direction" "facing_direction",
	"land_shape" text,
	"road_access_m" double precision,
	"road_type" "road_type",
	"flood_history" boolean,
	"flood_risk_zone" text,
	"city_plan_zone_color" text,
	"listing_mandate" "listing_mandate" DEFAULT 'group_exclusive' NOT NULL,
	"exclusivity_expires_at" timestamp with time zone,
	"posted_by_role" "role_kind",
	"extraction_source" "extraction_source" DEFAULT 'auto' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "market_data_source" NOT NULL,
	"province" text,
	"amphoe" text,
	"tambon" text,
	"geom" geography(Point,4326),
	"price_thb" bigint,
	"area_sqm" double precision,
	"deed_no" text,
	"observed_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "moderation_target_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"status" "moderation_status" DEFAULT 'pending' NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"price_thb" bigint NOT NULL,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reason" "price_change_reason" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publish_consent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"consent_version" text NOT NULL,
	"consent_timestamp" timestamp with time zone NOT NULL,
	"deletion_requested_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quote" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"broker_user_id" uuid NOT NULL,
	"amount_thb" bigint NOT NULL,
	"discount_vs_market" double precision,
	"terms_note" text,
	"status" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"kind" "role_kind" NOT NULL,
	"approval_status" "approval_status" DEFAULT 'none' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_listing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_identity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "identity_provider" NOT NULL,
	"provider_subject" text NOT NULL,
	"verified_at" timestamp with time zone,
	"contact_value" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"primary_role_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "viewing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"requested_by_user_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" "viewing_status" DEFAULT 'requested' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_merge_request" ADD CONSTRAINT "account_merge_request_user_id_a_user_id_fk" FOREIGN KEY ("user_id_a") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_merge_request" ADD CONSTRAINT "account_merge_request_user_id_b_user_id_fk" FOREIGN KEY ("user_id_b") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_merge_request" ADD CONSTRAINT "account_merge_request_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co_agent_agreement" ADD CONSTRAINT "co_agent_agreement_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co_agent_agreement" ADD CONSTRAINT "co_agent_agreement_holder_user_id_user_id_fk" FOREIGN KEY ("holder_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "co_agent_agreement" ADD CONSTRAINT "co_agent_agreement_co_agent_user_id_user_id_fk" FOREIGN KEY ("co_agent_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_group_id_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_membership" ADD CONSTRAINT "group_membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interest_flag" ADD CONSTRAINT "interest_flag_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interest_flag" ADD CONSTRAINT "interest_flag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_amenity" ADD CONSTRAINT "listing_amenity_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_condo" ADD CONSTRAINT "listing_condo_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_content" ADD CONSTRAINT "listing_content_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_exclusivity" ADD CONSTRAINT "listing_exclusivity_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_fees" ADD CONSTRAINT "listing_fees_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_rental" ADD CONSTRAINT "listing_rental_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_source_group_id_group_id_fk" FOREIGN KEY ("source_group_id") REFERENCES "public"."group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publish_consent" ADD CONSTRAINT "publish_consent_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publish_consent" ADD CONSTRAINT "publish_consent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote" ADD CONSTRAINT "quote_broker_user_id_user_id_fk" FOREIGN KEY ("broker_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_listing" ADD CONSTRAINT "saved_listing_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_listing" ADD CONSTRAINT "saved_listing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_identity" ADD CONSTRAINT "user_identity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewing" ADD CONSTRAINT "viewing_listing_id_listing_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listing"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viewing" ADD CONSTRAINT "viewing_requested_by_user_id_user_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "group_membership_unique" ON "group_membership" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "interest_flag_unique" ON "interest_flag" USING btree ("listing_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_amenity_unique" ON "listing_amenity" USING btree ("listing_id","amenity");--> statement-breakpoint
CREATE UNIQUE INDEX "listing_content_lang" ON "listing_content" USING btree ("listing_id","lang");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_listing_unique" ON "saved_listing" USING btree ("listing_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_identity_provider_subject" ON "user_identity" USING btree ("provider","provider_subject");