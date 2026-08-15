import { sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const providerEnum = pgEnum("provider", ["google", "local"]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),
  googleId: varchar("google_id"),
  provider: providerEnum("provider").default("local").notNull(),
  avatarUrl: text("avatar_url")
    .default("https://www.svgrepo.com/show/508196/user-circle.svg")
    .notNull(),
  username: varchar("username", { length: 150 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  passwordHash: text("password_hash"),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});
