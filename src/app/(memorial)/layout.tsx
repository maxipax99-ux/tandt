import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Memorial pages share the brand but use the quieter palette and extra whitespace. */
export default function MemorialLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-mood="memorial" className="flex flex-1 flex-col bg-bg text-ink">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
