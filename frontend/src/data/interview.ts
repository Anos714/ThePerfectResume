export interface InterviewQuestion {
  id: string;
  question: string;
  category: "behavioral" | "technical" | "role-specific";
  difficulty: "easy" | "medium" | "hard";
  starred: boolean;
}

export const interviewQuestions: InterviewQuestion[] = [
  {
    id: "iq_01",
    question: "Tell me about a time you influenced a roadmap decision with research.",
    category: "behavioral",
    difficulty: "medium",
    starred: true,
  },
  {
    id: "iq_02",
    question: "How do you decide what to prototype versus what to ship directly?",
    category: "role-specific",
    difficulty: "easy",
    starred: false,
  },
  {
    id: "iq_03",
    question: "Walk me through scaling a design system across multiple product teams.",
    category: "technical",
    difficulty: "hard",
    starred: true,
  },
  {
    id: "iq_04",
    question: "Describe a conflict with a PM and how you resolved it.",
    category: "behavioral",
    difficulty: "medium",
    starred: false,
  },
  {
    id: "iq_05",
    question: "What metrics would you define for a redesign's success?",
    category: "role-specific",
    difficulty: "medium",
    starred: false,
  },
  {
    id: "iq_06",
    question: "How do you keep accessibility non-negotiable under tight deadlines?",
    category: "technical",
    difficulty: "hard",
    starred: true,
  },
];
