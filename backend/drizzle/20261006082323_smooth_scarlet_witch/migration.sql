CREATE TYPE "cover_letter_status" AS ENUM('draft', 'final');--> statement-breakpoint
CREATE TYPE "tone" AS ENUM('professional', 'friendly', 'confident');--> statement-breakpoint
CREATE TABLE "cover_letters" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL,
	"title" varchar(255) DEFAULT 'Untitled' NOT NULL,
	"company_name" varchar(255),
	"role" varchar(255),
	"tone" "tone" DEFAULT 'professional'::"tone" NOT NULL,
	"status" "cover_letter_status" DEFAULT 'draft'::"cover_letter_status" NOT NULL,
	"content" text,
	"job_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;