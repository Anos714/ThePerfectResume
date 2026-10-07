"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createResume,
  deleteResume,
  fetchResumes,
  renameResume,
  RESUMES_QUERY_KEY,
  setResumePublished,
  updateResumeTemplate,
  type ResumeListItem,
} from "@/lib/resumes";
import type { TemplateId } from "@/data/types";

export function useResumesQuery() {
  return useQuery({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: fetchResumes,
    staleTime: 30_000,
  });
}

function useInvalidateResumes() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
}

export function useCreateResume() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: (input: { resumeTitle?: string; template?: TemplateId }) =>
      createResume(input),
    onSuccess: invalidate,
  });
}

export function useRenameResume() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: ({ resumeId, resumeTitle }: { resumeId: string; resumeTitle: string }) =>
      renameResume(resumeId, resumeTitle),
    onSuccess: invalidate,
  });
}

export function useUpdateResumeTemplate() {
  const invalidate = useInvalidateResumes();
  return useMutation({
    mutationFn: ({ resumeId, template }: { resumeId: string; template: TemplateId }) =>
      updateResumeTemplate(resumeId, template),
    onSuccess: invalidate,
  });
}

// Optimistic: the card flips to its new state immediately and the list is only
// refetched to pick up the server's authoritative timestamps.
export function useSetResumePublished() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, published }: { resumeId: string; published: boolean }) =>
      setResumePublished(resumeId, published),
    onMutate: async ({ resumeId, published }) => {
      await queryClient.cancelQueries({ queryKey: RESUMES_QUERY_KEY });

      const previous = queryClient.getQueryData<ResumeListItem[]>(
        RESUMES_QUERY_KEY,
      );
      queryClient.setQueryData<ResumeListItem[]>(RESUMES_QUERY_KEY, (old) =>
        (old ?? []).map((resume) =>
          resume.id === resumeId
            ? { ...resume, isPublished: published, isPublic: published }
            : resume,
        ),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(RESUMES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resumeId: string) => deleteResume(resumeId),
    onMutate: async (resumeId) => {
      await queryClient.cancelQueries({ queryKey: RESUMES_QUERY_KEY });

      const previous = queryClient.getQueryData<ResumeListItem[]>(
        RESUMES_QUERY_KEY,
      );
      queryClient.setQueryData<ResumeListItem[]>(RESUMES_QUERY_KEY, (old) =>
        (old ?? []).filter((resume) => resume.id !== resumeId),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(RESUMES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    },
  });
}
