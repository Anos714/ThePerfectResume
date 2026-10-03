import { Context, Env } from "hono";
import {
  exportResumeToDocxService,
  exportResumeToPdfService,
} from "./exports.service";

const setFileHeaders = (
  c: Context,
  fileName: string,
  mimeType: string,
) => {
  c.header("Content-Type", mimeType);
  c.header("Content-Disposition", `attachment; filename="${fileName}"`);
  c.header("Content-Transfer-Encoding", "binary");
};

// Hono's c.body() accepts ArrayBuffer; build a fresh plain ArrayBuffer
// (Buffer's underlying buffer can be a SharedArrayBuffer, which TS rejects).
const toArrayBuffer = (buffer: Buffer): ArrayBuffer => {
  const ab = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(ab).set(buffer);
  return ab;
};

export const exportResumePdfController = async (c: Context) => {
  const user = c.get("user");
  const resumeId = c.req.param("resumeId");
  if (!resumeId) throw new Error("resumeId is required");

  const { buffer, fileName } = await exportResumeToPdfService(user.id, resumeId);
  setFileHeaders(c, fileName, "application/pdf");
  return c.body(toArrayBuffer(buffer));
};

export const exportResumeDocxController = async (c: Context) => {
  const user = c.get("user");
  const resumeId = c.req.param("resumeId");
  if (!resumeId) throw new Error("resumeId is required");

  const { buffer, fileName } = await exportResumeToDocxService(
    user.id,
    resumeId,
  );
  setFileHeaders(
    c,
    fileName,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  return c.body(toArrayBuffer(buffer));
};
