ALTER TABLE "users" ALTER COLUMN "provider" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET DEFAULT 'https://www.svgrepo.com/show/508196/user-circle.svg';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_verified" SET NOT NULL;