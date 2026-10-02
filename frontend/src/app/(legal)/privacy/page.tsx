import { LegalDocument, type LegalSection } from "@/features/site/legal/legal-document";

const sections: LegalSection[] = [
  {
    id: "what-we-collect",
    heading: "1. What we collect",
    body: (
      <>
        <p>
          We only ask for what the product needs to work. Specifically: your
          name and email for the account, the resume content you enter into the
          editor, and basic usage telemetry (which features get used, errors
          that occur) to keep things stable.
        </p>
        <p>
          If you sign up with Google, we receive only the identity claims you
          approve — your Google ID, name and profile image. We never request or
          store your Google password.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    heading: "2. How we use it",
    body: (
      <>
        <p>Your data is used to:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>run the editor and save your resumes, profiles and drafts;</li>
          <li>power AI suggestions only when you explicitly request them;</li>
          <li>send transactional email — verification codes and security alerts;</li>
          <li>improve parsing reliability and template quality over time.</li>
        </ul>
        <p>
          We do not sell your personal data, and we do not run ads against it.
          AI providers receive only the specific text you ask the copilot to
          rewrite — never your full account or resume history.
        </p>
      </>
    ),
  },
  {
    id: "storage-and-security",
    heading: "3. Storage and security",
    body: (
      <>
        <p>
          Account and resume data lives in an encrypted Postgres database;
          verification codes and refresh tokens are kept in short-lived Redis
          caches that expire automatically.
        </p>
        <p>
          Passwords are never stored in plaintext — they are hashed with a
          modern one-way algorithm before they touch our database. Access and
          refresh tokens are signed and rotated on a fixed schedule.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    heading: "4. Your rights",
    body: (
      <>
        <p>
          You can export your resumes as JSON, PDF or DOCX at any time at no
          cost. You may correct your profile information through Settings.
        </p>
        <p>
          Deleting your account permanently removes your resumes, cover letters,
          shared links and personal data — immediately and irreversibly. There
          is no retention window and no shadow copy.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    heading: "5. Cookies",
    body: (
      <p>
        We use a single essential cookie to keep you signed in across page
        loads. No analytics, advertising or third-party tracking cookies are
        set. Blocking the essential cookie only affects session persistence —
        the editor keeps working.
      </p>
    ),
  },
  {
    id: "childrens-privacy",
    heading: "6. Children's privacy",
    body: (
      <p>
        ThePerfectResume is intended for job seekers who are at least 16 years
        old. We do not knowingly collect data from anyone younger, and we will
        delete such accounts on request without question.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "7. Changes to this policy",
    body: (
      <p>
        If this policy changes in a way that affects your rights, we will
        update the “last updated” date above and notify you by email before it
        takes effect. Continued use after that date means you accept the
        changes.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "8. Contacting us",
    body: (
      <p>
        Privacy questions go to{" "}
        <a
          href="mailto:privacy@theperfectresume.app"
          className="font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          privacy@theperfectresume.app
        </a>
        . We aim to reply within two business days.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return <LegalDocument sections={sections} lastUpdated="September 2026" />;
}
