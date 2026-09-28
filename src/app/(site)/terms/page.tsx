import type { Metadata } from "next";
import Link from "next/link";
import { Container, LawyerReviewBanner, PageHeader } from "@/components/ui";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of Service" intro="Last updated: [DATE — TODO]" />
      <Container className="prose-legal max-w-3xl pb-16">
        <LawyerReviewBanner />

        <p>
          These terms are an agreement between you and {SITE.legalEntity} (&quot;{SITE.name}&quot;, &quot;we&quot;).
          By placing an order you agree to them.
        </p>

        <h2>1. The service</h2>
        <p>
          We write personal speeches and tributes such as wedding speeches, eulogies, obituaries and occasion speeches.
          Each order includes a questionnaire, a 15-minute intake call, one complete draft and one round of edits.
          Optional add-ons (rush delivery, a delivery coaching call, and extra revision rounds) are available at the
          prices shown on our <Link href="/pricing">Pricing page</Link> at the time you order.
        </p>

        <h2>2. Delivery times</h2>
        <p>
          Delivery times are counted in business days from when we receive your completed questionnaire. Rush orders
          aim for a draft within 24–48 hours of receiving your questionnaire. Delays in completing the questionnaire or
          booking the intake call may delay delivery.
        </p>

        <h2>3. Revisions</h2>
        <p>
          One round of edits is included. An edit round means one set of changes you send us about a draft. Extra
          rounds can be bought as an add-on. A request for a completely new piece on a different subject is not a
          revision.
        </p>

        <h2>4. Refunds</h2>
        <p>
          Full refund if you cancel before your intake call; a partial refund after the first draft is sent; no refund
          after final delivery. See our <Link href="/refunds">Refund Policy</Link> for details.
        </p>

        <h2>5. Who owns the words</h2>
        <p>
          Once your order is paid in full, you own the final text we deliver and may use, change, perform, print and
          publish it however you like, without crediting us. We will not reuse or publish your piece.
        </p>

        <h2>6. Your responsibilities</h2>
        <p>
          You&apos;re responsible for the accuracy of the facts, names, dates and stories you give us, and for having
          the right to share them. Please check your final piece before delivering or publishing it, especially
          obituaries.
        </p>

        <h2>7. No guarantee of reaction</h2>
        <p>
          We work hard to write something you&apos;re proud of, but we can&apos;t guarantee how an audience, publication
          or anyone else will respond to it.
        </p>

        <h2>8. Eligibility</h2>
        <p>You must be 18 or older to use our service.</p>

        <h2>9. Limitation of liability</h2>
        <p>
          To the fullest extent allowed by law, our total liability for any claim relating to an order is limited to
          the amount you paid for that order, and we are not liable for indirect or consequential losses.
        </p>

        <h2>10. Privacy</h2>
        <p>
          Our <Link href="/privacy">Privacy Policy</Link> explains how we handle your information, including automatic
          deletion {SITE.retentionDays} days after delivery.
        </p>

        <h2>11. Governing law</h2>
        <p>These terms are governed by the laws of {SITE.governingLaw}.</p>

        <h2>12. Changes and contact</h2>
        <p>
          We may update these terms; the version in force when you ordered applies to your order. Questions:{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </p>
      </Container>
    </>
  );
}
