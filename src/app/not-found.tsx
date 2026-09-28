import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink, Container, PageHeader } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <PageHeader title="Page not found" intro="Sorry, we couldn't find that page." />
        <Container className="pb-16"><ButtonLink href="/">Back to home</ButtonLink></Container>
      </main>
      <SiteFooter />
    </>
  );
}
