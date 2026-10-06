CREATE TYPE "plan" AS ENUM('free', 'pro', 'career');--> statement-breakpoint
CREATE TYPE "subscription_status" AS ENUM('pending', 'active', 'on_hold', 'paused', 'cancelled', 'failed', 'expired', 'past_due');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"user_id" uuid NOT NULL UNIQUE,
	"dodo_subscription_id" varchar(255) NOT NULL UNIQUE,
	"product_id" varchar(255) NOT NULL,
	"plan" "plan" DEFAULT 'free'::"plan" NOT NULL,
	"status" "subscription_status" DEFAULT 'pending'::"subscription_status" NOT NULL,
	"dodo_customer_id" varchar(255),
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" "plan" DEFAULT 'free'::"plan" NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;