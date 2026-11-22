CREATE TYPE "public"."qr_kind" AS ENUM('store', 'url');--> statement-breakpoint
CREATE TABLE "qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"kind" "qr_kind" NOT NULL,
	"ios_url" text,
	"android_url" text,
	"fallback_url" text NOT NULL,
	"style" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"scan_count_ios" integer DEFAULT 0 NOT NULL,
	"scan_count_android" integer DEFAULT 0 NOT NULL,
	"scan_count_other" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qr_codes_slug_unique" UNIQUE("slug")
);
