"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Camera, KeyRound, Trash2, User } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockUser } from "@/data/user";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function SettingsPage() {
  const [fullName, setFullName] = useState(mockUser.fullName);
  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <Container className="max-w-4xl">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-10"
      >
        <motion.div variants={item}>
          <PageHeader
            eyebrow="Settings"
            title="Account settings"
            description="Manage your profile, security and account preferences."
          />
        </motion.div>

        <motion.div variants={item} className="flex flex-col gap-6">
          <SectionCard
            icon={User}
            title="Profile"
            description="This information appears on your resumes and public profile."
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-lg font-semibold text-white">
                  {initials || "U"}
                </span>
                <button
                  type="button"
                  aria-label="Change avatar"
                  className="ring-focus absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-surface text-muted transition-colors hover:text-white"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <div className="text-sm font-medium">{mockUser.fullName}</div>
                <div className="text-xs text-muted">PNG or JPG, up to 2MB</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input label="Username" defaultValue={mockUser.username} />
              <Input label="Email" type="email" defaultValue={mockUser.email} />
              <Input label="Headline" defaultValue={mockUser.headline} />
            </div>
            <div className="flex justify-end">
              <Button type="button">Save changes</Button>
            </div>
          </SectionCard>

          <SectionCard
            icon={KeyRound}
            title="Security"
            description="Keep your account locked down with a strong password."
          >
            <div className="grid grid-cols-1 gap-4">
              <Input label="Current password" type="password" />
              <Input label="New password" type="password" />
              <Input label="Confirm new password" type="password" />
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="secondary">
                Update password
              </Button>
            </div>
          </SectionCard>

          <SectionCard
            icon={Trash2}
            title="Danger zone"
            description="Deleting your account is permanent and cannot be undone."
            danger
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted">
                All of your resumes, cover letters and shared links will be
                removed immediately.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="shrink-0 border-rose-400/30 text-rose-300 hover:bg-rose-400/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </Button>
            </div>
          </SectionCard>
        </motion.div>
      </motion.div>
    </Container>
  );
}

interface SectionCardProps {
  icon: typeof User;
  title: string;
  description: string;
  danger?: boolean;
  children: React.ReactNode;
}

function SectionCard({
  icon: Icon,
  title,
  description,
  danger,
  children,
}: SectionCardProps) {
  return (
    <Card
      className={
        danger
          ? "flex flex-col gap-6 border-rose-400/15 p-6 sm:p-7"
          : "flex flex-col gap-6 p-6 sm:p-7"
      }
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${danger ? "bg-rose-400/12 text-rose-300" : "bg-brand-500/12 text-brand-300"}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {description}
          </p>
        </div>
      </div>
      {children}
    </Card>
  );
}
