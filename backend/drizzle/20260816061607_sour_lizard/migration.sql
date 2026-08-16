CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL UNIQUE,
	"full_name" varchar(255),
	"headline" varchar(255),
	"phone_number" varchar(20),
	"location" varchar(255),
	"website_url" text,
	"linkedin_url" text,
	"github_url" text,
	"summary" text,
	"skills" jsonb DEFAULT '[]' NOT NULL,
	"experience" jsonb DEFAULT '[]' NOT NULL,
	"education" jsonb DEFAULT '[]' NOT NULL,
	"projects" jsonb DEFAULT '[]' NOT NULL,
	"certifications" jsonb DEFAULT '[]' NOT NULL,
	"languages" jsonb DEFAULT '[]' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;