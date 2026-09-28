import type { Metadata } from "next";
import { ButtonLink, PageHeader, Section } from "@/components/ui";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Order, questionnaire, intake call, draft, edits, final: here's what to expect.",
};

const STEPS = [
  { title: "Order", body: "Choose your service and any add-ons, then pay securely through Stripe. We never see your card details." },
  { title: "Questionnaire", body: `We email you a private link to a questionnaire. It's valid for ${SITE.questionnaireLinkDays} days. Share as much or as little as you like.` },
  { title: "Intake call", body: "Book a 15-minute call at a time that suits you. We'll ask follow-up questions and listen for the details that make it yours." },
  { title: "Draft", body: "We write your complete first draft and email you a private link to read it." },
  { title: "Edits", body: "Tell us what to change. One round of edits is included, and you can add another." },
  { title: "Final", body: "Receive your final piece on screen and as PDF and Word downloads, ready to print or read from your phone." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader title="How it works" intro="Six simple steps, and you're never on your own." />
      <Section>
        <ol className="relative space-y-6 border-l-2 border-line pl-8">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span aria-hidden="true" className="absolute -left-4 flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-ink">
                {i + 1}
              </span>
              <h2 className="text-2xl font-semibold">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </h2>
              <p className="mt-1 max-w-2xl text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-muted">
          After delivery we keep your stories, drafts and call notes for {SITE.retentionDays} days in case you need
          anything, then delete them automatically. We keep only a basic record of the order for tax purposes.
        </p>
      </Section>
      <Section className="text-center">
        <ButtonLink href="/order">Start your order</ButtonLink>
      </Section>
    </>
  );
}
