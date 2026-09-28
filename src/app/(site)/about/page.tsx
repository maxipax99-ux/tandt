import type { Metadata } from "next";
import { ButtonLink, PageHeader, Section } from "@/components/ui";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "About", description: `The people behind ${SITE.name}.` };

export default function AboutPage() {
  return (
    <>
      <PageHeader title={`About ${SITE.name}`} />
      <Section>
        {/* TODO(owner): replace with your own story, background and (optionally) a photo with alt text. */}
        <div className="max-w-2xl space-y-4 text-lg">
          <p>
            Most people are asked to speak at the biggest moments of their lives with no warning and no practice.
            We started {SITE.name} to help, whether that moment is a wedding, a retirement, or a goodbye.
          </p>
          <p>
            We listen first. Every piece begins with your stories and your voice, and ends with words you&apos;re
            proud to say out loud.
          </p>
          <p className="text-muted">[Owner bio, experience and photo go here.]</p>
        </div>
        <div className="mt-8">
          <ButtonLink href="/contact" variant="secondary">Say hello</ButtonLink>
        </div>
      </Section>
    </>
  );
}
