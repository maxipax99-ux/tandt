import type { Metadata } from "next";
import { ButtonLink, Container, PageHeader } from "@/components/ui";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default function OrderSuccessPage() {
  return (
    <>
      <PageHeader title="Thank you — your order is confirmed" />
      <Container className="max-w-2xl space-y-4 pb-16 text-lg">
        <p>
          We&apos;ve emailed you a receipt and a private link to your questionnaire. It usually arrives within a few
          minutes; please check your spam folder if you don&apos;t see it.
        </p>
        <p>
          Once you&apos;ve sent your questionnaire, we&apos;ll email you a link to book your 15-minute intake call.
        </p>
        <p className="text-muted">
          Nothing arrived after an hour? Email us at{" "}
          <a className="text-accent underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>
        <div className="pt-4">
          <ButtonLink href="/" variant="secondary">Back to home</ButtonLink>
        </div>
      </Container>
    </>
  );
}
