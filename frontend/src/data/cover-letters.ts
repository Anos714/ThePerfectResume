export interface CoverLetter {
  id: string;
  title: string;
  companyName: string;
  role: string;
  tone: "professional" | "friendly" | "confident";
  updatedAt: string;
  status: "draft" | "final";
  excerpt: string;
}

export const coverLetters: CoverLetter[] = [
  {
    id: "cl_01",
    title: "Lumina — Senior Product Designer",
    companyName: "Lumina",
    role: "Senior Product Designer",
    tone: "confident",
    updatedAt: "2026-09-16T13:20:00Z",
    status: "final",
    excerpt:
      "I've spent the last seven years turning ambiguous problems into products people love — most recently leading a redesign that lifted activation 34%…",
  },
  {
    id: "cl_02",
    title: "Northwind — Design Lead",
    companyName: "Northwind",
    role: "Design Lead",
    tone: "professional",
    updatedAt: "2026-09-12T09:40:00Z",
    status: "draft",
    excerpt:
      "Your mission to simplify logistics for small businesses resonates deeply with the systems-thinking approach I bring to every team…",
  },
  {
    id: "cl_03",
    title: "Figma — Staff Designer",
    companyName: "Figma",
    role: "Staff Designer",
    tone: "friendly",
    updatedAt: "2026-08-29T17:05:00Z",
    status: "draft",
    excerpt:
      "I have been building design systems since before tokens were cool, and Figma has been at the center of that journey for my whole career…",
  },
];
