import { Container, PageHeader } from "@/components/ui";
import { SITE } from "@/config/site";

export function LinkExpired({ what = "link" }: { what?: string }) {
  return (
    <>
      <PageHeader title="This link is no longer active" />
      <Container className="max-w-2xl pb-16 text-lg">
        <p>
          This {what} has expired, has already been used, or isn&apos;t quite right. For your privacy, our links only
          work for a limited time.
        </p>
        <p className="mt-4">
          Please email <a className="text-accent underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>{" "}
          and we&apos;ll send you a fresh one.
        </p>
      </Container>
    </>
  );
}
