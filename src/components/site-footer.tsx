import Link from "next/link";
import { SITE } from "@/config/site";
import { Container } from "./ui";

const GROUPS = [
  {
    title: "Services",
    links: [
      { href: "/weddings", label: "Weddings & Celebrations" },
      { href: "/memorials", label: "Memorials" },
      { href: "/occasions", label: "Other Occasions" },
      { href: "/pricing", label: "Pricing" },
      { href: "/samples", label: "Samples" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/about", label: "About us" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/refunds", label: "Refund Policy" },
      { href: "/accessibility", label: "Accessibility" },
      { href: "/delete-my-data", label: "Request data deletion" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <Container className="grid gap-8 py-10 sm:grid-cols-4">
        <div>
          <p className="font-serif text-xl font-semibold">{SITE.name}</p>
          <p className="mt-2 text-sm text-muted">{SITE.tagline}.</p>
        </div>
        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wider text-muted">{group.title}</h2>
            <ul className="space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-ink hover:text-accent hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <Container className="border-t border-line py-6 text-sm text-muted">
        © {new Date().getFullYear()} {SITE.name}. Your stories stay private and are deleted {SITE.retentionDays} days
        after delivery.
      </Container>
    </footer>
  );
}
