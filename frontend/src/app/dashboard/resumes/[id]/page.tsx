import { notFound } from "next/navigation";
import { ResumeBuilder } from "@/features/dashboard/builder/resume-builder";
import { getResumeById } from "@/data/resumes";

interface PageProps {
  params: Promise<{ resumeId: string }>;
}

export default async function ResumeEditorPage({ params }: PageProps) {
  const { resumeId } = await params;
  const resume = getResumeById(resumeId);

  if (!resume) {
    notFound();
  }

  return <ResumeBuilder resume={resume} />;
}
