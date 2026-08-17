ALTER TABLE "resumes" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "template" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "template" DROP DEFAULT;--> statement-breakpoint
DROP TYPE "template";--> statement-breakpoint
CREATE TYPE "template" AS ENUM('classic', 'modern', 'ats_professional', 'minimalist', 'creative', 'executive');--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "template" SET DATA TYPE "template" USING "template"::"template";--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "template" SET DEFAULT 'classic'::"template";--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "skills" SET DEFAULT '"[]::jsonb"';--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "experience" SET DEFAULT '"[]::jsonb"';--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "education" SET DEFAULT '"[]::jsonb"';--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "projects" SET DEFAULT '"[]::jsonb"';--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "certifications" SET DEFAULT '"[]::jsonb"';--> statement-breakpoint
ALTER TABLE "resumes" ALTER COLUMN "languages" SET DEFAULT '"[]::jsonb"';