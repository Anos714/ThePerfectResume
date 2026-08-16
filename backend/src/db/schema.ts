import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const providerEnum = pgEnum("provider", ["google", "local"]);

// users schema (auth + accounts)
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

// profiles schema
export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),

  // 1:1 relationship with users
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),

  fullName: varchar("full_name", { length: 255 }),
  headline: varchar("headline", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  location: varchar("location", { length: 255 }),
  websiteUrl: text("website_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  summary: text("summary"),

  // Skills (Array of strings save karne ke liye)
  // e.g. ["React", "Node.js", "TypeScript"]
  skills: jsonb("skills").default([]).notNull(),

  // Work Experience (Array of Objects)
  // Structure: [{ company: string, role: string, location: string, startDate: string, endDate: string, currentlyWorking: boolean, description: string, workLink: string }]
  experience: jsonb("experience").default([]).notNull(),

  // Education (Array of Objects)
  // Structure: [{ school: string, degree: string, fieldOfStudy: string, location:string, startYear: string, endYear: string, grade: string }]
  education: jsonb("education").default([]).notNull(),

  // Projects (Array of Objects)
  // Structure: [{ title: string, description: string, techStack: string[], liveLink: string, githubLink: string }]
  projects: jsonb("projects").default([]).notNull(),

  // Certifications (Array of Objects)
  // Structure: [{ name: string, issuer: string, issueDate: string, credentialURL: string }]
  certifications: jsonb("certifications").default([]).notNull(),

  // Languages (Array of Objects)
  // Structure: [{ name: string, proficiency: string }]
  languages: jsonb("languages").default([]).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});
