import type { Metadata } from "next";
import { Container, LawyerReviewBanner, PageHeader } from "@/components/ui";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Accessibility Statement" };

export default function AccessibilityPage() {
  return (
    <>
      <PageHeader title="Accessibility Statement" intro="Last updated: [DATE — TODO]" />
      <Container className="prose-legal max-w-3xl pb-16">
        <LawyerReviewBanner />
        <p>
          We want everyone to be able to use {SITE.name}, including people who use screen readers, keyboard
          navigation, magnification or other assistive technology.
        </p>
        <h2>Our goal</h2>
        <p>
          We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA. That includes readable
          color contrast, labeled form fields, full keyboard access, visible focus indicators, text alternatives for
          images, and respecting your device&apos;s reduced-motion setting.
        </p>
        <h2>How we check</h2>
        <p>
          We test pages with automated tools (axe and Lighthouse) and by hand with a keyboard and screen reader before
          publishing changes.
        </p>
        <h2>Third-party parts</h2>
        <p>
          Payment (Stripe), call booking and the bot check (Cloudflare Turnstile) are provided by other companies.
          We&apos;ve chosen providers that work to be accessible, but we don&apos;t control their pages.
        </p>
        <h2>Tell us about a problem</h2>
        <p>
          If anything on this site is hard to use, please email{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. Tell us the page and what happened, and
          we&apos;ll reply within 5 business days. We can also take your order by email or phone if that&apos;s easier.
        </p>
      </Container>
    </>
  );
}
