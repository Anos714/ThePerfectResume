"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Link2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { getErrorMessage } from "@/lib/api";
import {
  buildShareUrl,
  fetchResumePublicLink,
  type ResumeListItem,
} from "@/lib/resumes";
import { templates } from "@/data/templates";
import type { TemplateId } from "@/data/types";
import {
  useCreateResume,
  useDeleteResume,
  useRenameResume,
  useSetResumePublished,
  useUpdateResumeTemplate,
} from "./use-resumes";

const isPublishedPublic = (resume: ResumeListItem) =>
  !!resume.isPublished && !!resume.isPublic;

export function CreateResumeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const create = useCreateResume();
  const [resumeTitle, setResumeTitle] = useState("");
  const [template, setTemplate] = useState<TemplateId>("ats_professional");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setResumeTitle("");
    setTemplate("ats_professional");
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await create.mutateAsync({
        resumeTitle: resumeTitle.trim() || "Untitled",
        template,
      });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New resume"
      description="Pick a template to start from — you can change it any time."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="resumeTitle"
          label="Resume title"
          placeholder="e.g. Senior Product Designer — Lumina"
          value={resumeTitle}
          onChange={(event) => setResumeTitle(event.target.value)}
          hint="Leave blank for “Untitled”."
        />
        <Select
          name="template"
          label="Template"
          value={template}
          onChange={(event) => setTemplate(event.target.value as TemplateId)}
        >
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
              {tpl.premium ? " (Pro)" : ""}
            </option>
          ))}
        </Select>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={create.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create resume"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function EditResumeDialog({
  resume,
  open,
  onClose,
}: {
  resume: ResumeListItem;
  open: boolean;
  onClose: () => void;
}) {
  const rename = useRenameResume();
  const updateTemplate = useUpdateResumeTemplate();

  const [resumeTitle, setResumeTitle] = useState(resume.resumeTitle ?? "");
  const [template, setTemplate] = useState<TemplateId>(
    resume.template ?? "classic",
  );
  const [titleTouched, setTitleTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = resumeTitle.trim();
  const titleChanged = trimmed.length > 0 && trimmed !== (resume.resumeTitle ?? "");
  const templateChanged = template !== resume.template;
  const canSave = titleChanged || templateChanged;
  const pending = rename.isPending || updateTemplate.isPending;
  const titleError =
    titleTouched && trimmed.length === 0 ? "Resume title is required" : undefined;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const jobs: Array<Promise<unknown>> = [];
    if (titleChanged) {
      jobs.push(rename.mutateAsync({ resumeId: resume.id, resumeTitle: trimmed }));
    }
    if (templateChanged) {
      jobs.push(
        updateTemplate.mutateAsync({ resumeId: resume.id, template }),
      );
    }

    try {
      await Promise.all(jobs);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit resume"
      description="Rename the resume or switch its template."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="resumeTitle"
          label="Resume title"
          value={resumeTitle}
          onChange={(event) => {
            setResumeTitle(event.target.value);
            setTitleTouched(true);
          }}
          onBlur={() => setTitleTouched(true)}
          error={titleError}
        />
        <Select
          name="template"
          label="Template"
          value={template}
          onChange={(event) => setTemplate(event.target.value as TemplateId)}
        >
          {templates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
              {tpl.premium ? " (Pro)" : ""}
            </option>
          ))}
        </Select>
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!canSave || pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function ShareResumeDialog({
  resume,
  open,
  onClose,
}: {
  resume: ResumeListItem;
  open: boolean;
  onClose: () => void;
}) {
  const setPublished = useSetResumePublished();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPublic = isPublishedPublic(resume);

  // The link only exists once the resume is public; the query waits for that.
  const { data: linkData } = useQuery({
    queryKey: ["resumes", "share-link", resume.id] as const,
    queryFn: () => fetchResumePublicLink(resume.id),
    enabled: isPublic,
    retry: false,
    staleTime: Infinity,
  });

  const shareUrl =
    linkData?.shareUrl ??
    (typeof window !== "undefined" && isPublic
      ? buildShareUrl(resume.id, window.location.origin)
      : null);

  const handlePublish = async () => {
    setError(null);
    try {
      await setPublished.mutateAsync({
        resumeId: resume.id,
        published: true,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUnpublish = async () => {
    setError(null);
    try {
      await setPublished.mutateAsync({
        resumeId: resume.id,
        published: false,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2_000);
    } catch {
      setError("Couldn’t copy the link — select it and copy manually.");
    }
  };

  const pending = setPublished.isPending;

  if (!isPublic) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Share this resume"
        description={
          <>
            <span className="font-medium text-foreground">
              {resume.resumeTitle?.trim() || "Untitled resume"}
            </span>{" "}
            is currently a draft. Publish it to get a public link anyone can
            open — no account needed.
          </>
        }
      >
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePublish}
            disabled={pending}
          >
            <Globe className="h-4 w-4" />
            {pending ? "Publishing…" : "Publish & share"}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share this resume"
      description="Anyone with this link can view the published resume."
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="share-url"
          className="text-xs font-medium uppercase tracking-[0.12em] text-muted"
        >
          Public link
        </label>
        <div className="flex items-center gap-2">
          <div className="ring-focus flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4">
            <Link2 className="h-4 w-4 shrink-0 text-muted" />
            <span className="truncate text-sm text-foreground/90">
              {shareUrl ?? "Loading link…"}
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            disabled={!shareUrl}
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="danger"
          onClick={handleUnpublish}
          disabled={pending}
        >
          {pending ? "Unpublishing…" : "Unpublish"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          Done
        </Button>
      </div>
    </Modal>
  );
}

export function DeleteResumeDialog({
  resume,
  open,
  onClose,
}: {
  resume: ResumeListItem;
  open: boolean;
  onClose: () => void;
}) {
  const remove = useDeleteResume();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    try {
      await remove.mutateAsync(resume.id);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete resume?"
      description={
        <>
          <span className="font-medium text-foreground">
            {resume.resumeTitle?.trim() || "Untitled resume"}
          </span>{" "}
          will be permanently removed. This can’t be undone.
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
          {remove.isPending ? "Deleting…" : "Delete resume"}
        </Button>
      </div>
    </Modal>
  );
}
