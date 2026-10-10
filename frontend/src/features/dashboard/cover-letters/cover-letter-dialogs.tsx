"use client";

import { useState } from "react";
import { AlertCircle, Download, Loader2, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { getErrorMessage, ApiError } from "@/lib/api";
import {
  downloadCoverLetterPdf,
  saveBlobAsDownload,
} from "@/lib/exports";
import {
  buildCoverLetterResumeData,
  generateCoverLetter,
  MAX_JOB_DESCRIPTION_LENGTH,
  MIN_COVER_LETTER_RESUME_LENGTH,
  MIN_JOB_DESCRIPTION_LENGTH,
  type CoverLetterTone,
} from "@/lib/ai";
import type { CoverLetterItem, CoverLetterStatus } from "@/lib/cover-letters";
import { normalizeResumeData } from "@/features/dashboard/builder/resume-mappers";
import { useResumesQuery } from "@/features/dashboard/resumes/use-resumes";
import {
  useCreateCoverLetter,
  useDeleteCoverLetter,
  useUpdateCoverLetter,
} from "./use-cover-letters";

const TONES: CoverLetterTone[] = ["professional", "friendly", "confident"];

const TONE_LABELS: Record<CoverLetterTone, string> = {
  professional: "Professional",
  friendly: "Friendly",
  confident: "Confident",
};

function defaultTitle(company: string, role: string): string {
  const parts = [company.trim(), role.trim()].filter(Boolean);
  return parts.length ? parts.join(" — ").slice(0, 255) : "Untitled letter";
}

// Maps a spend-quota failure to an upgrade prompt, matching the other AI surfaces.
function isQuotaError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 429;
}

export function GenerateCoverLetterDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: resumes, isLoading: resumesLoading } = useResumesQuery();
  const create = useCreateCoverLetter();

  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<{ message: string; quota: boolean } | null>(
    null,
  );

  const isBusy = generating || create.isPending;

  const reset = () => {
    setResumeId("");
    setJobDescription("");
    setCompanyName("");
    setRole("");
    setTone("professional");
    setError(null);
  };

  const handleClose = () => {
    if (isBusy) return;
    reset();
    onClose();
  };

  const resume = resumes?.find((item) => item.id === resumeId) ?? null;
  const resumeData = resume
    ? buildCoverLetterResumeData(normalizeResumeData(resume))
    : "";
  const hasResumeContent =
    resumeData.trim().length >= MIN_COVER_LETTER_RESUME_LENGTH;
  const hasJobDescription =
    jobDescription.trim().length >= MIN_JOB_DESCRIPTION_LENGTH;
  const canGenerate =
    !!resume && hasResumeContent && hasJobDescription && !isBusy;

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!resume || !canGenerate) return;
    setError(null);
    setGenerating(true);

    const trimmedJob = jobDescription.trim();
    const trimmedCompany = companyName.trim();
    const trimmedRole = role.trim();

    // Two steps: the AI drafts the body, then it is saved as a new letter.
    try {
      const { coverLetter } = await generateCoverLetter(
        resume.id,
        resumeData,
        trimmedJob,
        tone,
      );

      await create.mutateAsync({
        title: defaultTitle(trimmedCompany, trimmedRole),
        companyName: trimmedCompany,
        role: trimmedRole,
        tone,
        content: coverLetter,
        jobDescription: trimmedJob,
      });

      reset();
      onClose();
    } catch (err) {
      setError({ message: getErrorMessage(err), quota: isQuotaError(err) });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Generate a cover letter"
      description="Pick a resume, paste the job description and the AI drafts a tailored letter."
    >
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <Select
          name="resumeId"
          label="Resume"
          value={resumeId}
          onChange={(event) => setResumeId(event.target.value)}
          disabled={resumesLoading}
        >
          <option value="">
            {resumesLoading ? "Loading resumes..." : "Choose a resume"}
          </option>
          {(resumes ?? []).map((item) => (
            <option key={item.id} value={item.id}>
              {item.resumeTitle?.trim() || "Untitled resume"}
            </option>
          ))}
        </Select>

        {resume && !hasResumeContent && (
          <p className="text-xs text-amber-300">
            This resume needs a little more content before a letter can be
            generated from it.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="companyName"
            label="Company (optional)"
            placeholder="e.g. Lumina"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            maxLength={255}
          />
          <Input
            name="role"
            label="Role (optional)"
            placeholder="e.g. Senior Product Designer"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            maxLength={255}
          />
        </div>

        <Textarea
          name="jobDescription"
          label="Job description"
          rows={6}
          maxLength={MAX_JOB_DESCRIPTION_LENGTH}
          placeholder="Paste the job posting here..."
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          hint={`${jobDescription.trim().length}/${MAX_JOB_DESCRIPTION_LENGTH} characters`}
        />

        <Select
          name="tone"
          label="Tone"
          value={tone}
          onChange={(event) => setTone(event.target.value as CoverLetterTone)}
        >
          {TONES.map((value) => (
            <option key={value} value={value}>
              {TONE_LABELS[value]}
            </option>
          ))}
        </Select>

        {error && (
          <div className="flex items-start gap-2 text-sm text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error.message}</span>
          </div>
        )}
        {error?.quota && (
          <p className="text-xs text-muted">
            You&apos;ve used today&apos;s AI actions — upgrade your plan for
            more.
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canGenerate}>
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate letter
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function EditCoverLetterDialog({
  letter,
  open,
  onClose,
}: {
  letter: CoverLetterItem;
  open: boolean;
  onClose: () => void;
}) {
  const update = useUpdateCoverLetter();

  const [title, setTitle] = useState(letter.title ?? "");
  const [companyName, setCompanyName] = useState(letter.companyName ?? "");
  const [role, setRole] = useState(letter.role ?? "");
  const [tone, setTone] = useState<CoverLetterTone>(
    letter.tone ?? "professional",
  );
  const [status, setStatus] = useState<CoverLetterStatus>(
    letter.status ?? "draft",
  );
  const [content, setContent] = useState(letter.content ?? "");
  const [jobDescription, setJobDescription] = useState(
    letter.jobDescription ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const trimmedTitle = title.trim();
  const titleError =
    trimmedTitle.length === 0 ? "Title is required" : undefined;
  const canSave = trimmedTitle.length > 0 && !update.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmedTitle) return;
    setError(null);

    try {
      await update.mutateAsync({
        letterId: letter.id,
        payload: {
          title: trimmedTitle,
          companyName: companyName.trim(),
          role: role.trim(),
          tone,
          status,
          content,
          jobDescription: jobDescription.trim(),
        },
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit cover letter"
      description="Polish the letter and mark it final when it is ready to send."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="title"
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={255}
          error={titleError}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            name="companyName"
            label="Company"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            maxLength={255}
          />
          <Input
            name="role"
            label="Role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            maxLength={255}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            name="tone"
            label="Tone"
            value={tone}
            onChange={(event) => setTone(event.target.value as CoverLetterTone)}
          >
            {TONES.map((value) => (
              <option key={value} value={value}>
                {TONE_LABELS[value]}
              </option>
            ))}
          </Select>
          <Select
            name="status"
            label="Status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as CoverLetterStatus)
            }
          >
            <option value="draft">Draft</option>
            <option value="final">Final</option>
          </Select>
        </div>

        <Textarea
          name="content"
          label="Letter"
          rows={10}
          maxLength={20000}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        <Textarea
          name="jobDescription"
          label="Job description"
          rows={4}
          maxLength={MAX_JOB_DESCRIPTION_LENGTH}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
        />

        {error && (
          <p className="text-sm text-rose-300" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={update.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave}>
            {update.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function DeleteCoverLetterDialog({
  letter,
  open,
  onClose,
}: {
  letter: CoverLetterItem;
  open: boolean;
  onClose: () => void;
}) {
  const remove = useDeleteCoverLetter();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    try {
      await remove.mutateAsync(letter.id);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete cover letter?"
      description={
        <>
          <span className="font-medium text-foreground">
            {letter.title?.trim() || "Untitled letter"}
          </span>{" "}
          will be permanently removed. This can&apos;t be undone.
        </>
      }
    >
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={remove.isPending}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleConfirm}
          disabled={remove.isPending}
        >
          {remove.isPending ? "Deleting..." : "Delete letter"}
        </Button>
      </div>
    </Modal>
  );
}

// Split the free-text letter body on blank lines so the preview reads as
// proper paragraphs; single newlines inside a paragraph (the sign-off, say)
// are preserved via whitespace-pre-line so nothing the AI wrote is lost. This
// mirrors the PDF renderer on the backend.
function toParagraphs(content: string | null | undefined): string[] {
  return (content ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}


export function PreviewCoverLetterDialog({
  letter,
  open,
  onClose,
  onEdit,
}: {
  letter: CoverLetterItem;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paragraphs = toParagraphs(letter.content);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    setError(null);
    try {
      const { blob, fileName } = await downloadCoverLetterPdf(letter.id);
      saveBlobAsDownload(blob, fileName);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cover letter preview"
      description="Here is the full letter as it will read and print."
      className="max-w-2xl"
    >
      <div className="flex max-h-[60vh] flex-col gap-4">
        <div className="overflow-y-auto rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-6">
          <div className="border-b border-white/[0.1] pb-3">
            <h3 className="text-sm font-semibold">
              {letter.title?.trim() || "Untitled letter"}
            </h3>
            <p className="mt-0.5 text-xs text-muted">
              {[letter.companyName, letter.role].filter(Boolean).join(" — ") ||
                letter.tone ||
                "Professional"}
            </p>
          </div>

          {paragraphs.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="whitespace-pre-line text-sm leading-relaxed text-foreground/85"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              No content yet — edit the letter to start writing.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <div className="flex items-center justify-end gap-3">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onClose();
                onEdit();
              }}
            >
              <PenLine className="h-4 w-4" />
              Edit
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={handleExport}
            disabled={exporting || paragraphs.length === 0}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export PDF
              </>
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}