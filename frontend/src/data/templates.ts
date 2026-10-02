import type { TemplateId } from "./types";

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  premium: boolean;
  accent: string;
  layout: "single" | "sidebar-left" | "sidebar-right" | "topbar";
  atsOptimized: boolean;
}

export const templates: TemplateInfo[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Timeless single-column layout that never goes out of style.",
    premium: false,
    accent: "#818cf8",
    layout: "single",
    atsOptimized: true,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean two-column design with a bold accent header.",
    premium: false,
    accent: "#38bdf8",
    layout: "sidebar-right",
    atsOptimized: true,
  },
  {
    id: "ats_professional",
    name: "ATS Professional",
    description: "Engineered for parser-perfect keyword extraction.",
    premium: true,
    accent: "#34d399",
    layout: "single",
    atsOptimized: true,
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Breathable whitespace, typographic discipline only.",
    premium: true,
    accent: "#a5b4fc",
    layout: "single",
    atsOptimized: true,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Expressive sidebar layout for design-forward roles.",
    premium: true,
    accent: "#e879f9",
    layout: "sidebar-left",
    atsOptimized: false,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Authoritative topbar layout for senior leadership.",
    premium: true,
    accent: "#f59e0b",
    layout: "topbar",
    atsOptimized: true,
  },
];
