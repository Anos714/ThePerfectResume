/**
 * Binary downloads for the exports module.
 *
 * `apiFetch` unwraps the JSON envelope, which is the wrong tool for a PDF or a
 * DOCX — those come back as `Content-Type: application/pdf` /
 * `wordprocessingml.document` with the body as bytes. These helpers go around
 * the JSON client and read the response as a Blob instead, while still riding
 * the same auth handling (Bearer token + credentials) and throwing `ApiError`
 * on a non-2xx so callers can surface `getErrorMessage`.
 */

import { apiBaseUrl, ApiError, getAccessToken } from "@/lib/api";

export type ExportFormat = "pdf" | "docx";

const ACCEPT_BY_FORMAT: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const EXTENSION_BY_FORMAT: Record<ExportFormat, string> = {
  pdf: "pdf",
  docx: "docx",
};

function buildFileName(resumeTitle: string | undefined | null, format: ExportFormat): string {
  const base = (resumeTitle ?? "resume")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return `${base || "resume"}.${EXTENSION_BY_FORMAT[format]}`;
}

export function buildExportUrl(resumeId: string, format: ExportFormat): string {
  return `${apiBaseUrl}/api/v1/exports/${resumeId}/${format}`;
}

/**
 * Reads the `filename` out of a `Content-Disposition` attachment header, the
 * way the exports controller sets it. Falls back to `null` when the header is
 * absent or unparsable — the browser still gets a usable name from the URL.
 */
export function parseContentDispositionFileName(
  header: string | null,
): string | null {
  if (!header) return null;
  const match = /filename="([^"]+)"/i.exec(header);
  return match ? match[1] : null;
}

export interface DownloadExportResult {
  blob: Blob;
  fileName: string;
}

export async function downloadResumeExport(
  resumeId: string,
  format: ExportFormat,
  resumeTitle?: string | null,
): Promise<DownloadExportResult> {
  const token = getAccessToken();

  const response = await fetch(buildExportUrl(resumeId, format), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: ACCEPT_BY_FORMAT[format],
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // A 401 here is not retried the way apiFetch retries it: the JSON refresh
  // dance assumes a JSON body. The caller shows the backend's status the same
  // way, and a re-click after a page reload picks a fresh token up.
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `${format.toUpperCase()} export failed (${response.status})`,
    );
  }

  const blob = await response.blob();
  const fileName =
    parseContentDispositionFileName(
      response.headers.get("content-disposition"),
    ) ?? buildFileName(resumeTitle, format);

  return { blob, fileName };
}

/**
 * Downloads a cover letter as PDF from `/exports/cover-letters/:id/pdf`, the
 * same way the resume export works — a binary body fetched around the JSON
 * client, with the Bearer token attached and `ApiError` thrown on a non-2xx.
 */
export async function downloadCoverLetterPdf(
  letterId: string,
): Promise<DownloadExportResult> {
  const token = getAccessToken();

  const response = await fetch(
    `${apiBaseUrl}/api/v1/exports/cover-letters/${letterId}/pdf`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/pdf",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `PDF export failed (${response.status})`,
    );
  }

  const blob = await response.blob();
  const fileName =
    parseContentDispositionFileName(
      response.headers.get("content-disposition"),
    ) ?? "cover_letter.pdf";

  return { blob, fileName };
}

/**
 * Hands a blob to the browser as a download and returns once the navigation
 * has started. Triggering the click inside the same task as objectURL creation
 * is what keeps Safari from dropping the download.
 */
export function saveBlobAsDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next macrotask so the download has time to begin.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}
