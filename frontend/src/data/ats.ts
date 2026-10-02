export interface AtsCheck {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export const atsChecks: AtsCheck[] = [
  {
    id: "ats_1",
    label: "Contact section parseable",
    status: "pass",
    detail: "Name, email, phone and location detected cleanly.",
  },
  {
    id: "ats_2",
    label: "Section headings standard",
    status: "pass",
    detail: "Experience, Education and Skills use recognized headings.",
  },
  {
    id: "ats_3",
    label: "Keyword density",
    status: "warn",
    detail: "“Design Systems” appears once — target 2–3 mentions.",
  },
  {
    id: "ats_4",
    label: "No complex tables or columns",
    status: "pass",
    detail: "Single-column flow keeps parsers happy.",
  },
  {
    id: "ats_5",
    label: "Dates machine-readable",
    status: "warn",
    detail: "Two entries use free-text ranges — standardize to MM/YYYY.",
  },
  {
    id: "ats_6",
    label: "Action verbs in bullets",
    status: "pass",
    detail: "86% of bullets start with a strong action verb.",
  },
];

export interface AiSuggestion {
  id: string;
  label: string;
  text: string;
}

export const aiSuggestions: AiSuggestion[] = [
  {
    id: "ai_1",
    label: "Sharpen impact",
    text: "Spearheaded the 2024 redesign, increasing trial-to-paid conversion by 27% through iterative prototyping and A/B testing.",
  },
  {
    id: "ai_2",
    label: "Quantify outcome",
    text: "Shipped a cross-platform design system adopted by 6 product teams, cutting design QA time by 40%.",
  },
  {
    id: "ai_3",
    label: "Add scope",
    text: "Mentored 4 designers and ran weekly craft critiques that raised the team's prototyping bar.",
  },
];
