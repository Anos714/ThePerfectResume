import { describe, expect, it } from "bun:test";
import {
  buildExportUrl,
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
