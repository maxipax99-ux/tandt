import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { PageHeader, Section } from "@/components/ui";
import { GENERAL_FAQ } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about AI, revisions, refunds, confidentiality and who owns your speech.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader title="Frequently asked questions" />
      <Section>
        <Faq items={GENERAL_FAQ} />
        <p className="mt-8 text-muted">
          Still wondering about something? <Link href="/contact" className="text-accent underline">Get in touch</Link>.
        </p>
      </Section>
    </>
  );
}
