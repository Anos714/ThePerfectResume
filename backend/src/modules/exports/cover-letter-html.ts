import { coverLetters } from "@/db/schema";

type CoverLetter = typeof coverLetters.$inferSelect;

const esc = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// The AI already writes the complete, ready-to-send letter — including the
// salutation ("Dear Hiring Team,") and the sign-off ("Sincerely,\nAnos Sain").
// Blank lines separate paragraphs; a single newline inside the sign-off (or any
// other block) becomes a <br> so nothing the model produced is lost or doubled
// up by the renderer adding its own header/salutation/signature.
const toParagraphs = (content: string): string[] =>
  content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

const toHtml = (paragraph: string): string =>
  esc(paragraph).replace(/\n/g, "<br />");

export function renderCoverLetterHTML(letter: CoverLetter): string {
  const title = letter.title || "Cover Letter";
  const paragraphs = toParagraphs(letter.content || "");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 25mm 25mm 25mm 25mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    color: #111111;
    font-size: 11pt;
    line-height: 1.6;
    margin: 0;
  }
  .body p { margin: 0 0 14px 0; }
  .body p:last-child { margin-bottom: 0; }
</style>
</head>
<body>
  <div class="body">
    ${paragraphs.map((p) => `<p>${toHtml(p)}</p>`).join("")}
  </div>
</body>
</html>`;
}