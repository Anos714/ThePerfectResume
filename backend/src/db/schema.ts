import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const providerEnum = pgEnum("provider", ["google", "local"]);

export const planEnum = pgEnum("plan", ["free", "pro", "career"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "active",
  "on_hold",
  "paused",
  "cancelled",
  "failed",
  "expired",
  "past_due",
]);

export const templateEnum = pgEnum("template", [
  "classic",
  "modern",
  "ats_professional",
  "minimalist",
  "creative",
  "executive",
]);

export const toneEnum = pgEnum("tone", ["professional", "friendly", "confident"]);

export const coverLetterStatusEnum = pgEnum("cover_letter_status", [
  "draft",
  "final",
]);

export const categoryEnum = pgEnum("category", [
  "behavioral",
  "technical",
  "role-specific",
]);

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

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
  plan: planEnum("plan").default("free").notNull(),
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

// resume table same as profiles table but with 1:N relationship with user table
export const resumes = pgTable("resumes", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),

  // 1:N relationship with users
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  resumeTitle: varchar("resume_title", { length: 255 })
    .default("Untitled")
    .notNull(),

  template: templateEnum("template").default("classic").notNull(),

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
  skills: jsonb("skills").default(`[]::jsonb`).notNull(),

  // Work Experience (Array of Objects)
  // Structure: [{ company: string, role: string, location: string, startDate: string, endDate: string, currentlyWorking: boolean, description: string, workLink: string }]
  experience: jsonb("experience").default(`[]::jsonb`).notNull(),

  // Education (Array of Objects)
  // Structure: [{ school: string, degree: string, fieldOfStudy: string, location:string, startYear: string, endYear: string, grade: string }]
  education: jsonb("education").default(`[]::jsonb`).notNull(),

  // Projects (Array of Objects)
  // Structure: [{ title: string, description: string, techStack: string[], liveLink: string, githubLink: string }]
  projects: jsonb("projects").default(`[]::jsonb`).notNull(),

  // Certifications (Array of Objects)
  // Structure: [{ name: string, issuer: string, issueDate: string, credentialURL: string }]
  certifications: jsonb("certifications").default(`[]::jsonb`).notNull(),

  // Languages (Array of Objects)
  // Structure: [{ name: string, proficiency: string }]
  languages: jsonb("languages").default(`[]::jsonb`).notNull(),

  isPublished: boolean("is_published").default(false).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),

  // analytics — atsScore is written after an AI ATS check; views is
  // incremented every time the public share page is loaded
  atsScore: integer("ats_score").default(0).notNull(),
  views: integer("views").default(0).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

// subscriptions schema (dodo payments)
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),

  // 1:1 relationship with users (a user has at most one subscription)
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),

  // dodo subscription id (e.g. sub_xxxx)
  dodoSubscriptionId: varchar("dodo_subscription_id", { length: 255 })
    .unique()
    .notNull(),

  // dodo product id the user subscribed to
  productId: varchar("product_id", { length: 255 }).notNull(),

  plan: planEnum("plan").default("free").notNull(),
  status: subscriptionStatusEnum("status").default("pending").notNull(),

  // dodo customer id
  dodoCustomerId: varchar("dodo_customer_id", { length: 255 }),

  // current billing period boundaries (ISO strings from dodo)
  currentPeriodStart: timestamp("current_period_start", {
    withTimezone: true,
  }),
  currentPeriodEnd: timestamp("current_period_end", {
    withTimezone: true,
  }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

// cover letters schema (AI-generated letters saved per user)
export const coverLetters = pgTable("cover_letters", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),

  // N:1 relationship with users
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  title: varchar("title", { length: 255 }).default("Untitled").notNull(),
  companyName: varchar("company_name", { length: 255 }),
  role: varchar("role", { length: 255 }),

  tone: toneEnum("tone").default("professional").notNull(),
  status: coverLetterStatusEnum("status").default("draft").notNull(),

  // the generated letter body
  content: text("content"),

  // the job description the letter was tailored to (kept so the user can
  // regenerate or tweak the letter later)
  jobDescription: text("job_description"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

// interview questions schema (AI-generated prep saved per user)
export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuidv7()`),

  // N:1 relationship with users
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  // the role the question set was generated for (grouping key in the UI)
  role: varchar("role", { length: 255 }).notNull(),

  question: text("question").notNull(),
  category: categoryEnum("category").default("role-specific").notNull(),
  difficulty: difficultyEnum("difficulty").default("medium").notNull(),
  starred: boolean("starred").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});
