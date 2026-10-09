"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  COVER_LETTERS_QUERY_KEY,
  createCoverLetter,
  deleteCoverLetter,
  fetchCoverLetters,
  updateCoverLetter,
  type CoverLetterItem,
  type CreateCoverLetterPayload,
  type UpdateCoverLetterPayload,
} from "@/lib/cover-letters";

export function useCoverLettersQuery() {
  return useQuery({
    queryKey: COVER_LETTERS_QUERY_KEY,
    queryFn: fetchCoverLetters,
    staleTime: 30_000,
  });
}

function useInvalidateCoverLetters() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: COVER_LETTERS_QUERY_KEY });
}

export function useCreateCoverLetter() {
  const invalidate = useInvalidateCoverLetters();
  return useMutation({
    mutationFn: (payload: CreateCoverLetterPayload) =>
      createCoverLetter(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCoverLetter() {
  const invalidate = useInvalidateCoverLetters();
  return useMutation({
    mutationFn: ({
      letterId,
      payload,
    }: {
      letterId: string;
      payload: UpdateCoverLetterPayload;
    }) => updateCoverLetter(letterId, payload),
    onSuccess: invalidate,
  });
}

// Optimistic: the card disappears immediately and is restored verbatim if the
// request fails.
export function useDeleteCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (letterId: string) => deleteCoverLetter(letterId),
    onMutate: async (letterId) => {
      await queryClient.cancelQueries({ queryKey: COVER_LETTERS_QUERY_KEY });

      const previous = queryClient.getQueryData<CoverLetterItem[]>(
        COVER_LETTERS_QUERY_KEY,
      );
      queryClient.setQueryData<CoverLetterItem[]>(
        COVER_LETTERS_QUERY_KEY,
        (old) => (old ?? []).filter((letter) => letter.id !== letterId),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(COVER_LETTERS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: COVER_LETTERS_QUERY_KEY });
    },
  });
}