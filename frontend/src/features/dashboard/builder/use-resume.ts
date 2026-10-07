"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchResume,
  resumeQueryKey,
  RESUMES_QUERY_KEY,
  updateResume,
  type ResumeListItem,
  type UpdateResumePayload,
} from "@/lib/resumes";
import { getErrorMessage } from "@/lib/api";

// Long enough to coalesce a burst of keystrokes into one write, short enough
// that "Changes save instantly" still feels true.
export const AUTOSAVE_DEBOUNCE_MS = 800;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useResumeQuery(resumeId: string) {
  return useQuery({
    queryKey: resumeQueryKey(resumeId),
    queryFn: () => fetchResume(resumeId),
    // The editor keeps its own copy; a refetch would only churn the header, so
    // the cache is refreshed by our own writes instead.
    staleTime: Infinity,
    retry: false,
  });
}

/**
 * Debounced autosave of the document under edit. Every edit produces a new
 * payload object, which restarts the timer; when it fires the write is chained
 * behind any save already in flight, so requests can never overtake each other
 * and the last one always describes the latest document.
 *
 * `isDirty` reads refs rather than state so the debounce can stay out of React's
 * render loop — it exists to warn before closing with a save outstanding.
 */
export function useResumeAutosave(
  resumeId: string,
  payload: UpdateResumePayload | null,
) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const dirtyRef = useRef(false);
  const hydratedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chainRef = useRef<Promise<void>>(Promise.resolve());

  // The latest payload, read at fire time and on the unmount flush.
  const payloadRef = useRef(payload);
  useEffect(() => {
    payloadRef.current = payload;
  }, [payload]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const write = useCallback(
    async (body: UpdateResumePayload) => {
      if (mountedRef.current) {
        setStatus("saving");
        setError(null);
      }

      const run = async () => {
        try {
          const saved = await updateResume(resumeId, body);
          queryClient.setQueryData<ResumeListItem>(
            resumeQueryKey(resumeId),
            saved,
          );
          // The list renders title, template and updatedAt off the same row.
          queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
          if (mountedRef.current) setStatus("saved");
          dirtyRef.current = false;
        } catch (err) {
          if (mountedRef.current) {
            setStatus("error");
            setError(getErrorMessage(err));
          }
          dirtyRef.current = true;
        }
      };

      // Chain onto the previous write so a slow request can never land after a
      // newer one and clobber it.
      chainRef.current = chainRef.current.then(run, run);
    },
    [resumeId, queryClient],
  );

  const scheduleSave = useCallback(
    (body: UpdateResumePayload) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      dirtyRef.current = true;
      timerRef.current = setTimeout(() => {
        timerRef.current = undefined;
        void write(body);
      }, AUTOSAVE_DEBOUNCE_MS);
    },
    [write],
  );

  const saveNow = useCallback(
    async (body: UpdateResumePayload) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      await write(body);
    },
    [write],
  );

  const isDirty = useCallback(() => dirtyRef.current, []);

  // The debounce itself: each new payload restarts the window.
  useEffect(() => {
    if (!payload) return;

    // The first payload is the document exactly as the server just handed it
    // over — nothing has changed yet. Writing it straight back would churn
    // `updatedAt` (the column bumps on every update) and the dashboard's
    // activity feed, so the debounce starts from the *second* payload onward.
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }

    scheduleSave(payload);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [payload, scheduleSave]);

  // Navigating away with a save still pending should not silently drop it.
  useEffect(() => {
    return () => {
      if (dirtyRef.current && payloadRef.current) {
        void write(payloadRef.current);
      }
    };
  }, [write]);

  return { status, error, isDirty, saveNow };
}
