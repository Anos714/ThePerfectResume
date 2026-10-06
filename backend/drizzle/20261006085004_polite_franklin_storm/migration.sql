CREATE TYPE "category" AS ENUM('behavioral', 'technical', 'role-specific');--> statement-breakpoint
CREATE TYPE "difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TABLE "interview_questions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL,
	"role" varchar(255) NOT NULL,
	"question" text NOT NULL,
	"category" "category" DEFAULT 'role-specific'::"category" NOT NULL,
	"difficulty" "difficulty" DEFAULT 'medium'::"difficulty" NOT NULL,
	"starred" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;