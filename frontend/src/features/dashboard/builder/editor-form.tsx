"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Award,
  Briefcase,
  ChevronDown,
  FileText,
  GraduationCap,
  Languages as LanguagesIcon,
  Plus,
  Trash2,
  User,
  Wand2,
  Wrench,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/data/types";

type SectionKey =
  | "basics"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

interface EditorFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const sections: {
  key: SectionKey;
  label: string;
  icon: typeof User;
}[] = [
  { key: "basics", label: "Basics", icon: User },
  { key: "summary", label: "Summary", icon: FileText },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "projects", label: "Projects", icon: Award },
  { key: "certifications", label: "Certifications", icon: Award },
  { key: "languages", label: "Languages", icon: LanguagesIcon },
];

const arraySections: Record<SectionKey, keyof ResumeData | null> = {
  basics: null,
  summary: null,
  experience: "experience",
  education: "education",
  skills: "skills",
  projects: "projects",
  certifications: "certifications",
  languages: "languages",
};

export function EditorForm({ data, onChange }: EditorFormProps) {
  const [open, setOpen] = useState<Set<SectionKey>>(new Set(["basics"]));

  const toggle = (key: SectionKey) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const update = <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="flex flex-col gap-3">
      {sections.map(({ key, label, icon: Icon }) => {
        const isOpen = open.has(key);
        const arrayKey = arraySections[key];
        const count = arrayKey ? data[arrayKey].length : undefined;
        return (
          <div
            key={key}
            className="overflow-hidden rounded-2xl border border-white/[0.07] bg-surface/40 transition-colors hover:border-white/[0.12]"
          >
            <button
              onClick={() => toggle(key)}
              className="ring-focus flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-brand-300">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-medium">{label}</span>
              {count !== undefined && (
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs tabular-nums text-muted">
                  {count}
                </span>
              )}
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                <ChevronDown className="h-4 w-4 text-muted" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-4 border-t border-white/[0.06] p-5">
                    <SectionContent
                      sectionKey={key}
                      data={data}
                      update={update}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

interface SectionContentProps {
  sectionKey: SectionKey;
  data: ResumeData;
  update: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

function SectionContent({ sectionKey, data, update }: SectionContentProps) {
  switch (sectionKey) {
    case "basics":
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            value={data.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
          <Input
            label="Headline"
            value={data.headline}
            onChange={(e) => update("headline", e.target.value)}
          />
          <Input
            label="Phone"
            value={data.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
          />
          <Input
            label="Location"
            value={data.location}
            onChange={(e) => update("location", e.target.value)}
          />
          <Input
            label="Website"
            value={data.websiteUrl}
            onChange={(e) => update("websiteUrl", e.target.value)}
          />
          <Input
            label="LinkedIn"
            value={data.linkedinUrl}
            onChange={(e) => update("linkedinUrl", e.target.value)}
          />
          <Input
            label="GitHub"
            value={data.githubUrl}
            onChange={(e) => update("githubUrl", e.target.value)}
          />
        </div>
      );

    case "summary":
      return (
        <div>
          <Textarea
            label="Professional summary"
            rows={5}
            maxLength={750}
            value={data.summary}
            onChange={(e) => update("summary", e.target.value)}
            hint={`${data.summary.length}/750 characters`}
          />
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            type="button"
          >
            <Wand2 className="h-4 w-4" />
            Rewrite with AI
          </Button>
        </div>
      );

    case "experience":
      return (
        <ListSection
          items={data.experience}
          onChange={(items) => update("experience", items)}
          empty={{
            id: "",
            company: "",
            role: "",
            location: "",
            startDate: "",
            endDate: "",
            currentlyWorking: false,
            description: "",
            workLink: "",
          }}
          addLabel="Add experience"
          renderItem={(item, patch) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Role"
                value={item.role}
                onChange={(e) => patch({ role: e.target.value })}
              />
              <Input
                label="Company"
                value={item.company}
                onChange={(e) => patch({ company: e.target.value })}
              />
              <Input
                label="Start"
                placeholder="YYYY-MM"
                value={item.startDate}
                onChange={(e) => patch({ startDate: e.target.value })}
              />
              <Input
                label="End"
                placeholder="YYYY-MM"
                value={item.endDate}
                onChange={(e) => patch({ endDate: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Description"
                  rows={3}
                  value={item.description}
                  onChange={(e) => patch({ description: e.target.value })}
                />
              </div>
            </div>
          )}
        />
      );

    case "education":
      return (
        <ListSection
          items={data.education}
          onChange={(items) => update("education", items)}
          empty={{
            id: "",
            school: "",
            degree: "",
            fieldOfStudy: "",
            location: "",
            startYear: "",
            endYear: "",
            grade: "",
          }}
          addLabel="Add education"
          renderItem={(item, patch) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="School"
                value={item.school}
                onChange={(e) => patch({ school: e.target.value })}
              />
              <Input
                label="Degree"
                value={item.degree}
                onChange={(e) => patch({ degree: e.target.value })}
              />
              <Input
                label="Field of study"
                value={item.fieldOfStudy}
                onChange={(e) => patch({ fieldOfStudy: e.target.value })}
              />
              <Input
                label="End year"
                value={item.endYear}
                onChange={(e) => patch({ endYear: e.target.value })}
              />
            </div>
          )}
        />
      );

    case "skills":
      return (
        <SkillsEditor
          skills={data.skills}
          onChange={(skills) => update("skills", skills)}
        />
      );

    case "projects":
      return (
        <ListSection
          items={data.projects}
          onChange={(items) => update("projects", items)}
          empty={{
            id: "",
            title: "",
            description: "",
            techStack: [],
            liveLink: "",
            githubLink: "",
          }}
          addLabel="Add project"
          renderItem={(item, patch) => (
            <div className="grid grid-cols-1 gap-3">
              <Input
                label="Title"
                value={item.title}
                onChange={(e) => patch({ title: e.target.value })}
              />
              <Textarea
                label="Description"
                rows={3}
                value={item.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
              <Input
                label="Tech stack (comma separated)"
                value={item.techStack.join(", ")}
                onChange={(e) =>
                  patch({
                    techStack: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          )}
        />
      );

    case "certifications":
      return (
        <ListSection
          items={data.certifications}
          onChange={(items) => update("certifications", items)}
          empty={{
            id: "",
            name: "",
            issuer: "",
            issueDate: "",
            credentialUrl: "",
          }}
          addLabel="Add certification"
          renderItem={(item, patch) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Name"
                value={item.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
              <Input
                label="Issuer"
                value={item.issuer}
                onChange={(e) => patch({ issuer: e.target.value })}
              />
              <Input
                label="Issue date"
                placeholder="YYYY-MM"
                value={item.issueDate}
                onChange={(e) => patch({ issueDate: e.target.value })}
              />
            </div>
          )}
        />
      );

    case "languages":
      return (
        <ListSection
          items={data.languages}
          onChange={(items) => update("languages", items)}
          empty={{ id: "", name: "", proficiency: "" }}
          addLabel="Add language"
          renderItem={(item, patch) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Language"
                value={item.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
              <Input
                label="Proficiency"
                placeholder="Native / Professional"
                value={item.proficiency}
                onChange={(e) => patch({ proficiency: e.target.value })}
              />
            </div>
          )}
        />
      );
  }
}

interface ListSectionProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  addLabel: string;
  renderItem: (item: T, patch: (patch: Partial<T>) => void) => React.ReactNode;
}

function ListSection<T extends { id: string }>({
  items,
  onChange,
  empty,
  addLabel,
  renderItem,
}: ListSectionProps<T>) {
  const patchItem = (id: string, patch: Partial<T>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    onChange([...items, { ...empty, id: `new_${Date.now()}` }]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 && (
        <p className="text-sm text-muted">
          Nothing added yet — this section stays hidden on your resume.
        </p>
      )}
      {items.map((item, index) => (
        <div
          key={item.id}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
              Entry {index + 1}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              aria-label="Remove entry"
              className="ring-focus grid h-7 w-7 place-items-center rounded-lg text-muted transition-colors hover:bg-rose-400/10 hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {renderItem(item, (patch) => patchItem(item.id, patch))}
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={addItem}
        className="w-fit"
        type="button"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}

function SkillsEditor({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const addSkill = () => {
    const value = draft.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...skills, value]);
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          label="Add a skill"
          value={draft}
          placeholder="Type a skill and press Enter"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <Button
          variant="secondary"
          size="md"
          onClick={addSkill}
          className="mt-[26px] shrink-0"
          type="button"
        >
          Add
        </Button>
      </div>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs",
              )}
            >
              {skill}
              <button
                onClick={() => onChange(skills.filter((s) => s !== skill))}
                aria-label={`Remove ${skill}`}
                className="ring-focus grid h-4 w-4 place-items-center rounded-full text-muted transition-colors hover:text-rose-300"
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No skills yet.</p>
      )}
    </div>
  );
}
