import Link from "next/link";
import { SITE } from "@/config/site";
import { Container } from "./ui";

const NAV = [
  { href: "/weddings", label: "Weddings & Celebrations" },
  { href: "/memorials", label: "Memorials" },
  { href: "/occasions", label: "Other Occasions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface/80">
      <Container className="flex items-center justify-between gap-4 py-4">
        <Link href="/" className="font-serif text-2xl font-semibold text-ink no-underline">
          {SITE.name}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-5 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink hover:text-accent hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/order"
                className="rounded-full bg-accent px-4 py-2 font-medium text-accent-ink hover:opacity-90"
              >
                Order now
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile menu: a native disclosure, so it works without JavaScript. */}
        <details className="relative lg:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-line px-4 text-sm font-medium">
            Menu
          </summary>
          <nav aria-label="Main" className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-line bg-surface p-2 shadow-lg">
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-lg px-3 py-3 text-ink hover:bg-accent-soft">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/order" className="mt-1 block rounded-lg bg-accent px-3 py-3 font-medium text-accent-ink">
                  Order now
                </Link>
              </li>
            </ul>
          </nav>
        </details>
      </Container>
    </header>
  );
}
