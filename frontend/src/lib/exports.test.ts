import { afterEach, describe, expect, it, mock } from "bun:test";
import { clearAccessToken, setAccessToken } from "@/lib/api";
import {
  buildExportUrl,
  downloadCoverLetterPdf,
  parseContentDispositionFileName,
} from "@/lib/exports";

describe("buildExportUrl", () => {
  it("targets the exports module with the resume id and format", () => {
    expect(buildExportUrl("res_123", "pdf")).toBe(
      "http://localhost:8080/api/v1/exports/res_123/pdf",
    );
    expect(buildExportUrl("res_123", "docx")).toBe(
      "http://localhost:8080/api/v1/exports/res_123/docx",
    );
  });
});

describe("parseContentDispositionFileName", () => {
  it("reads the quoted filename the exports controller sends", () => {
    expect(
      parseContentDispositionFileName(
        'attachment; filename="alex-morgan-resume.pdf"',
      ),
    ).toBe("alex-morgan-resume.pdf");
  });

  it("is case-insensitive about the header casing", () => {
    expect(
      parseContentDispositionFileName(
        'attachment; FILENAME="Resume.docx"',
      ),
    ).toBe("Resume.docx");
  });

  it("falls back to null when the header is absent or unparsable", () => {
    expect(parseContentDispositionFileName(null)).toBeNull();
    expect(parseContentDispositionFileName("attachment")).toBeNull();
    expect(parseContentDispositionFileName("inline")).toBeNull();
  });
});

describe("downloadCoverLetterPdf", () => {
  let calls: Array<{ url: string | URL | Request; init?: RequestInit }> = [];

  const pdfResponse = () =>
    new Response(new Blob(["%PDF"]), {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="lumina-letter.pdf"',
      },
    });

  const fetchMock = mock(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url, init });
    return pdfResponse();
  });

  afterEach(() => {
    clearAccessToken();
    calls = [];
  });

  it("fetches the cover-letter PDF and reads the server filename", async () => {
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
    setAccessToken("test-token");

    const { blob, fileName } = await downloadCoverLetterPdf("cl_123", "Lumina");

    expect(fileName).toBe("lumina-letter.pdf");
    expect(await blob.text()).toBe("%PDF");
    expect(calls[0].url).toBe(
      "http://localhost:8080/api/v1/exports/cover-letters/cl_123/pdf",
    );
    expect(calls[0].init?.method).toBe("GET");
  });

  it("falls back to a title-based filename when the header is missing", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(new Blob(["%PDF"]), {
          status: 200,
          headers: { "content-type": "application/pdf" },
        }),
    ) as unknown as typeof globalThis.fetch;
    setAccessToken("test-token");

    const { fileName } = await downloadCoverLetterPdf("cl_123", "Lumina Letter");

    expect(fileName).toBe("lumina-letter.pdf");
  });

  it("throws an ApiError on a non-2xx response", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify({ message: "nope" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
    ) as unknown as typeof globalThis.fetch;
    setAccessToken("test-token");

    expect(downloadCoverLetterPdf("cl_123", "Lumina")).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
    });
  });
});
