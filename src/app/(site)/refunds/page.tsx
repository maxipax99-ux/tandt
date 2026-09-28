import type { Metadata } from "next";
import { Container, LawyerReviewBanner, PageHeader } from "@/components/ui";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundsPage() {
  return (
    <>
      <PageHeader title="Refund Policy" intro="Last updated: [DATE — TODO]" />
      <Container className="prose-legal max-w-3xl pb-16">
        <LawyerReviewBanner />
        <ul>
          <li><strong>Before your intake call:</strong> full refund, no questions asked.</li>
          <li>
            <strong>After the intake call, before your first draft:</strong> [TODO: owner to decide, e.g. 75% refund].
          </li>
          <li><strong>After your first draft is sent:</strong> partial refund of [TODO: e.g. 50%] of the base price. Add-ons already delivered (such as a completed coaching call) are not refunded.</li>
          <li><strong>After final delivery:</strong> no refund.</li>
        </ul>
        <p>
          Refunds go back to your original payment method through Stripe and usually appear within 5–10 business days.
          To ask for a refund, email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> with your order
          number.
        </p>
        <p>
          If you&apos;re unhappy with a draft, please tell us first: that&apos;s what your included edit round is for,
          and we&apos;d much rather make it right.
        </p>
      </Container>
    </>
  );
}
