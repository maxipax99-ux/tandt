import Link from "next/link";
import { adminSignOut } from "@/actions/admin-auth";
import { Container } from "@/components/ui";
import { SITE } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";

export default async function ProtectedAdminLayout({ children }: LayoutProps<"/admin">) {
  // Defense in depth: every page and action also calls requireAdmin() itself.
  await requireAdmin();
  return (
    <>
      <header className="border-b border-line bg-surface">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-3">
          <span className="font-serif text-xl font-semibold">{SITE.name} · Admin</span>
          <nav aria-label="Admin">
            <ul className="flex items-center gap-5 text-sm">
              <li><Link href="/admin" className="hover:underline">Orders</Link></li>
              <li><Link href="/admin/retention" className="hover:underline">Data retention</Link></li>
              <li>
                <form action={adminSignOut}>
                  <button type="submit" className="hover:underline">Sign out</button>
                </form>
              </li>
            </ul>
          </nav>
        </Container>
      </header>
      <Container className="py-8">{children}</Container>
    </>
  );
}
