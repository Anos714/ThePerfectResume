import type { TemplateId } from "./types";

export interface Plan {
  id: "free" | "pro" | "career";
  name: string;
  monthly: number;
  yearly: number;
  tagline: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    yearly: 0,
    tagline: "For getting started with a standout resume.",
    features: [
      "3 basic templates",
      "Manual editor",
      "PDF export",
      "1 AI suggestion per day",
    ],
    cta: "Start for free",
  },
  {
    id: "pro",
    name: "Pro",
    monthly: 12,
    yearly: 9,
    tagline: "For serious job seekers who want the edge.",
    features: [
      "All premium templates",
      "Unlimited AI copilot",
      "ATS score & checks",
      "Pixel-perfect PDF & DOCX",
      "Private share links",
      "Priority support",
    ],
    cta: "Go Pro",
    popular: true,
  },
  {
    id: "career",
    name: "Career",
    monthly: 24,
    yearly: 18,
    tagline: "For candidates applying at scale.",
    features: [
      "Everything in Pro",
      "Unlimited resumes",
      "Cover letter builder",
      "Interview question prep",
      "LinkedIn profile sync",
    ],
    cta: "Choose Career",
  },
];

export const templateById: Record<TemplateId, string> = {
  classic: "Classic",
  modern: "Modern",
  ats_professional: "ATS Professional",
  minimalist: "Minimalist",
  creative: "Creative",
  executive: "Executive",
};

export function getDisplayPrice(
  monthly: number,
  yearly: number,
  isYearly: boolean,
): number {
  return isYearly ? yearly : monthly;
}
