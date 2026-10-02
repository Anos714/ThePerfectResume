export type PlanId = "free" | "pro" | "career";

export interface MockUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  headline: string;
  plan: PlanId;
  avatarUrl: string;
  memberSince: string;
  aiSuggestionsUsedToday: number;
  aiSuggestionsPerDay: number;
}

export const mockUser: MockUser = {
  id: "usr_01J4F2K8X9M3Q7V5T1Z6A0B2C9",
  username: "alexandra.carter",
  email: "hello@alex.cv",
  fullName: "Alexandra Carter",
  headline: "Senior Product Designer",
  plan: "pro",
  avatarUrl: "https://www.svgrepo.com/show/508196/user-circle.svg",
  memberSince: "2025-03-14",
  aiSuggestionsUsedToday: 3,
  aiSuggestionsPerDay: 1,
};

export const planLabels: Record<PlanId, string> = {
  free: "Free",
  pro: "Pro",
  career: "Career",
};
