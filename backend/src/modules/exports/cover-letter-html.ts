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

// The AI writes the letter as free text with paragraph breaks; render each
// paragraph on its own line.
const toParagraphs = (content: string): string[] =>
  content
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export function renderCoverLetterHTML(letter: CoverLetter): string {
  const title = letter.title || "Cover Letter";
  const company = letter.companyName?.trim() || "";
  const role = letter.role?.trim() || "";
  const paragraphs = toParagraphs(letter.content || "");
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headingBits = [company, role].filter(Boolean);
  const recipient = headingBits.length
    ? `Dear Hiring Manager${company ? ` at ${company}` : ""},`
    : "Dear Hiring Manager,";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 20mm 22mm 20mm 22mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    color: #111111;
    font-size: 11pt;
    line-height: 1.6;
    margin: 0;
  }
  .header {
    border-bottom: 2px solid #111111;
    padding-bottom: 10px;
    margin-bottom: 22px;
  }
  h1 {
    font-size: 16pt;
    letter-spacing: 0.5px;
    margin: 0 0 4px 0;
    font-weight: 700;
  }
  .sub {
    font-size: 10pt;
    color: #444444;
    margin: 0;
  }
  .meta {
    font-size: 9pt;
    color: #666666;
    margin-top: 6px;
  }
  .date { margin: 0 0 18px 0; font-size: 10.5pt; }
  .salutation { margin: 0 0 6px 0; }
  .body p { margin: 0 0 12px 0; }
  .signoff { margin-top: 22px; }
  .signoff p { margin: 0 0 4px 0; }
</style>
</head>
<body>
  <div class="header">
    <h1>${esc(title)}</h1>
    ${
      headingBits.length
        ? `<p class="sub">${esc(headingBits.join(" — "))}</p>`
        : ""
    }
    <p class="meta">Tone: ${esc(letter.tone || "professional")}</p>
  </div>

  <p class="date">${esc(date)}</p>
  <p class="salutation">${esc(recipient)}</p>

  <div class="body">
    ${paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}
  </div>

  <div class="signoff">
    <p>Sincerely,</p>
  </div>
</body>
</html>`;
}