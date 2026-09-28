import type { Metadata } from "next";
import Link from "next/link";
import { Container, LawyerReviewBanner, PageHeader } from "@/components/ui";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" intro="Last updated: [DATE — TODO]" />
      <Container className="prose-legal max-w-3xl pb-16">
        <LawyerReviewBanner />

        <p>
          {SITE.name} (&quot;we&quot;, &quot;us&quot;) writes personal speeches and tributes. To do that we need you to
          share personal, sometimes very private, stories. This policy explains in plain English what we collect, why,
          who helps us process it, and when we delete it.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Contact details:</strong> your name and email address.</li>
          <li><strong>Order details:</strong> the service and add-ons you chose, the amount paid and the date.</li>
          <li><strong>Questionnaire answers:</strong> the stories, names and details you share about the occasion and the people in it. These may include sensitive information such as health or family circumstances, and details about people who have died.</li>
          <li><strong>Call notes:</strong> notes your writer takes during the intake call.</li>
          <li><strong>Drafts and edit requests:</strong> the pieces we write and the changes you ask for.</li>
          <li><strong>Messages</strong> you send through our contact form.</li>
          <li><strong>Basic technical data</strong> such as IP address, used briefly to prevent spam and abuse (for example rate limiting).</li>
        </ul>
        <p>
          We do <strong>not</strong> collect or store your card details: payments are handled entirely by Stripe on
          their own secure page. We don&apos;t use advertising cookies or trackers. Our analytics, if enabled, are
          cookieless and don&apos;t identify you.
        </p>

        <h2>Why we use it</h2>
        <ul>
          <li>To write, deliver and revise your piece, and to schedule your intake call.</li>
          <li>To send you transactional emails about your order (we don&apos;t send marketing emails).</li>
          <li>To keep basic records for tax, accounting and refunds.</li>
          <li>To keep the site secure and prevent abuse.</li>
        </ul>
        <p>We never publish, sell or reuse your stories, and we never use them in samples or marketing.</p>

        <h2>Who processes it for us</h2>
        <ul>
          <li><strong>Stripe</strong> — payments.</li>
          <li><strong>Supabase</strong> — our database, where orders and questionnaire answers are stored.</li>
          <li><strong>Resend</strong> — sending order emails.</li>
          <li><strong>[Cal.com or Calendly — TODO]</strong> — booking your intake call.</li>
          <li><strong>Vercel</strong> — hosting the website.</li>
          <li><strong>Cloudflare Turnstile</strong> — checking forms are sent by people, not bots.</li>
          <li><strong>[Upstash — TODO if used]</strong> — short-lived rate-limit counters.</li>
          <li><strong>[Plausible or Vercel Analytics — TODO if used]</strong> — cookieless visitor statistics.</li>
          <li><strong>[AI writing tool and provider — TODO, or remove]</strong> — if we use an AI tool while drafting, we share only what&apos;s needed for your piece, with a provider that does not train on it.</li>
        </ul>

        <h2>How long we keep it</h2>
        <p>
          Your questionnaire answers, call notes, drafts and edit requests are <strong>automatically deleted
          {" "}{SITE.retentionDays} days after delivery</strong> (or after an order is cancelled). After that we keep only
          the order number, service, amount, date and your email address, which we need for tax and refund records.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask to see, correct or delete your information at any time. The quickest way to request deletion is
          our <Link href="/delete-my-data">data deletion form</Link>. For anything else, email{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. We&apos;ll respond within 30 days.
        </p>

        <h2>Security</h2>
        <p>
          Data is encrypted in transit (HTTPS) and stored with access restricted to our admin account, which requires
          two-factor authentication. Links we email you are private, random and expire.
        </p>

        <h2>Children</h2>
        <p>Our service is for adults 18 and over. We don&apos;t knowingly collect information from children.</p>

        <h2>Contact</h2>
        <p>
          {SITE.legalEntity}, {SITE.mailingAddress}. Email: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
        </p>
      </Container>
    </>
  );
}
