import { ResumeBuilder } from "@/features/dashboard/builder/resume-builder";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResumeEditorPage({ params }: PageProps) {
  const { id } = await params;
  return <ResumeBuilder resumeId={id} />;
}
