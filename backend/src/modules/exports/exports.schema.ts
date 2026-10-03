import { z } from "zod";

export const exportResumeSchema = z.object({
  resumeId: z.string({ error: "resumeId is required" }).trim().min(1),
});

export type ExportResumeInput = z.infer<typeof exportResumeSchema>;
