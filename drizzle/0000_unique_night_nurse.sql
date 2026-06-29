CREATE TABLE "file_metadata" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"short_id" text NOT NULL,
	"original_filename" text NOT NULL,
	"stored_filename" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size" bigint NOT NULL,
	"password_hash" text,
	"max_access_count" integer,
	"access_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"removed_at" timestamp with time zone,
	CONSTRAINT "file_metadata_short_id_unique" UNIQUE("short_id")
);
