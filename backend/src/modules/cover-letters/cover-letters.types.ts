interface CoverLetterResponseData {
  id: string;
  userId?: string | null;
  title?: string | null;
  companyName?: string | null;
  role?: string | null;
  tone?: "professional" | "friendly" | "confident" | null;
  status?: "draft" | "final" | null;
  content?: string | null;
  jobDescription?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface CoverLetterSuccessResponse {
  success: boolean;
  message?: string;
  data?: CoverLetterResponseData | CoverLetterResponseData[] | null;
}
