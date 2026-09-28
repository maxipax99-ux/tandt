import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { IncludedList, ServicePriceTable } from "@/components/pricing-table";
import { ButtonLink, PageHeader, Section } from "@/components/ui";
import { SITE } from "@/config/site";
import { AI_FAQ } from "@/content/faq";
import { addOnPriceLabel } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Eulogies & Obituaries",
  description: "Gentle, personal eulogies and obituaries, written with you.",
};

export default function MemorialsPage() {
  return (
    <div className="pb-10">
      <PageHeader
        eyebrow="Memorials"
        title="Help honoring someone you love"
        intro="When you're grieving, finding the words can feel impossible. We'll listen to your memories and write a tribute that sounds like them, and like you."
      />

      <Section title="Eulogies">
        <p className="max-w-2xl text-muted">
          A eulogy you can read aloud at a funeral, memorial or celebration of life. We&apos;ll talk with you about
          who they were, the stories your family tells, and what you most want people to remember. Usually 5–7
          minutes when spoken.
        </p>
      </Section>

      <Section title="Obituaries">
        <p className="max-w-2xl text-muted">
          A clear, loving obituary for a newspaper, funeral home or online memorial. We&apos;ll make sure the
          essential details are right, and that it reads like a life, not a list.
        </p>
      </Section>

      <Section title="Pricing">
        <ServicePriceTable serviceIds={["eulogy", "obituary"]} />
        <h3 className="mb-3 mt-10 text-xl font-semibold">Every order includes</h3>
        <IncludedList />
      </Section>

      <Section title="If the service is soon">
        <p className="max-w-2xl text-muted">
          We understand funerals are often arranged within days. Our standard time for eulogies and obituaries is
          three business days, and if you need it sooner, you can choose faster delivery ({addOnPriceLabel("rush")}),
          and we&apos;ll have a draft to you within 24–48 hours of receiving your questionnaire.
        </p>
        <p className="mt-4 max-w-2xl text-muted">
          If you&apos;re unsure what you need, you&apos;re welcome to <Link href="/contact" className="underline">write to us first</Link>.
        </p>
      </Section>

      <Section title="Questions">
        <Faq
          items={[
            { q: "I don't know where to start. Is that okay?", a: "Completely. The questionnaire is gentle and you can skip anything. On the call, we'll guide you with simple questions." },
            { q: "Can several family members contribute?", a: "Yes. You can gather memories from others and include them in your questionnaire, or have another family member join the call." },
            { q: "What happens to the memories I share?", a: `They're used only to write your piece, seen only by your writer, and deleted automatically ${SITE.retentionDays} days after delivery.` },
            { q: "What if it doesn't feel right?", a: "Tell us. Your included round of edits is there so the tribute feels true to them." },
            AI_FAQ,
          ]}
        />
      </Section>

      <Section>
        <ButtonLink href="/order?service=eulogy" variant="secondary">Begin a eulogy</ButtonLink>
        <span className="mx-3 text-muted" aria-hidden="true">·</span>
        <ButtonLink href="/order?service=obituary" variant="secondary">Begin an obituary</ButtonLink>
      </Section>
    </div>
  );
}
