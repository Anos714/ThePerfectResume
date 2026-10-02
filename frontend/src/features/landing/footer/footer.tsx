import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { GithubIcon, XIcon, LinkedinIcon } from "@/components/ui/brand-icons";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Templates", href: "/dashboard/templates" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Resume guide", href: "/about" },
      { label: "Cover letters", href: "/dashboard/cover-letters" },
      { label: "Interview prep", href: "/dashboard/interview-prep" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/contact" },
      { label: "API", href: "/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-16">
      <Container>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Logo href="/" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              A manual + AI resume builder designed for people who want to
              stand out.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: XIcon, label: "X (Twitter)" },
                { Icon: GithubIcon, label: "GitHub" },
                { Icon: LinkedinIcon, label: "LinkedIn" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-muted transition-colors hover:border-white/25 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} ThePerfectResume. All rights reserved.
          </p>
          <p className="text-sm text-muted">
            Built with care for job seekers everywhere.
          </p>
        </div>
      </Container>
    </footer>
  );
}
