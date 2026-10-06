interface InterviewQuestionResponseData {
  id: string;
  userId?: string | null;
  role?: string | null;
  question?: string | null;
  category?: "behavioral" | "technical" | "role-specific" | null;
  difficulty?: "easy" | "medium" | "hard" | null;
  starred?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface InterviewQuestionSuccessResponse {
  success: boolean;
  message?: string;
  data?:
    | InterviewQuestionResponseData
    | InterviewQuestionResponseData[]
    | { id: string }[]
    | null;
}
