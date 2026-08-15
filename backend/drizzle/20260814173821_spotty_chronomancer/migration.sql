CREATE TYPE "provider" AS ENUM('google', 'local');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"google_id" varchar,
	"provider" "provider" DEFAULT 'local'::"provider",
	"avatar_url" text,
	"username" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL UNIQUE,
	"password_hash" text,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
