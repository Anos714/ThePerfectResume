import { LegalDocument, type LegalSection } from "@/features/site/legal/legal-document";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    heading: "1. Acceptance of terms",
    body: (
      <p>
        By creating an account or using any part of the editor, you agree to
        these terms. If you do not agree, do not use the service — your resume
        data always stays exportable so you can leave on your own terms.
      </p>
    ),
  },
  {
    id: "your-account",
    heading: "2. Your account",
    body: (
      <>
        <p>
          You are responsible for keeping your credentials secure and for all
          activity under your account. Tell us immediately if you believe
          access has been compromised — we will rotate your sessions.
        </p>
        <p>
          You must provide accurate registration information and keep it
          current. We may suspend accounts that contain false or misleading
          identity details.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    heading: "3. Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>use the service to build resumes containing false credentials or fabricated employment history;</li>
          <li>attempt to access another user&apos;s resumes or account;</li>
          <li>scrape, overload or reverse-engineer the service or its AI endpoints;</li>
          <li>resell or repackage access to the service without a written agreement.</li>
        </ul>
        <p>
          Resumes you create belong to you — this clause is about behavior, not
          ownership.
        </p>
      </>
    ),
  },
  {
    id: "plans-and-billing",
    heading: "4. Plans and billing",
    body: (
      <>
        <p>
          The free plan is free forever. Paid plans (Pro and Career) are billed
          monthly or annually, in advance, and activate after payment is
          confirmed.
        </p>
        <p>
          You can cancel any time from Billing. Cancellation stops the next
          charge — you keep all paid features until your current billing period
           ends, then the account drops back to the free plan automatically.
        </p>
        <p>
          If a plan&apos;s price changes, existing subscribers keep their current
          rate for as long as the subscription stays active.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    heading: "5. Refunds",
    body: (
      <p>
        Annual plans qualify for a full refund within 14 days of renewal, no
        questions asked. Monthly plans are non-refundable once a billing period
        has started, since you can cancel before it renews at any moment.
      </p>
    ),
  },
  {
    id: "ai-content",
    heading: "6. AI-generated content",
    body: (
      <p>
        AI suggestions are drafts, not professional advice, and you are
        responsible for reviewing every bullet before it goes on your resume.
        We do not guarantee that AI-assisted content will pass any specific
        background check or get you any particular interview.
      </p>
    ),
  },
  {
    id: "service-availability",
    heading: "7. Service availability",
    body: (
      <p>
        We aim for uninterrupted service but do not guarantee it. Scheduled
        maintenance, outages and acts of Mbps are not grounds for compensation
        beyond the credits or refunds we choose to offer at our discretion.
      </p>
    ),
  },
  {
    id: "termination",
    heading: "8. Termination",
    body: (
      <p>
        You can delete your account at any time; deletion is permanent and
        removes all your data. We may suspend or terminate accounts that violate
        these terms, with prior notice where circumstances allow it.
      </p>
    ),
  },
  {
    id: "changes",
    heading: "9. Changes to these terms",
    body: (
      <p>
        Material changes will be announced by email at least 30 days before
        they take effect. If you disagree with a change, cancel before it
        applies and export your data — it stays yours.
      </p>
    ),
  },
  {
    id: "contact",
    heading: "10. Contacting us",
    body: (
      <p>
        Legal questions go to{" "}
        <a
          href="mailto:legal@theperfectresume.app"
          className="font-medium text-brand-300 transition-colors hover:text-brand-200"
        >
          legal@theperfectresume.app
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return <LegalDocument sections={sections} lastUpdated="September 2026" />;
}
