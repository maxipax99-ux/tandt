import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { AddOnTable, IncludedList, ServicePriceTable } from "@/components/pricing-table";
import { ButtonLink, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Speeches for Other Occasions",
  description: "Anniversary, retirement, milestone birthday, quinceañera and bar or bat mitzvah speeches.",
};

const OCCASIONS = [
  { name: "Anniversaries", body: "Celebrate decades together, from a toast to the couple or a vow renewal." },
  { name: "Retirements", body: "Honor a career and the person behind it, for a colleague, a boss or a parent." },
  { name: "Milestone birthdays", body: "Thirtieth, fiftieth, ninetieth: the stories that made them who they are." },
  { name: "Quinceañeras", body: "A parent's or padrino's words for a daughter's big day, in English or bilingual." },
  { name: "Bar & bat mitzvahs", body: "A parent's speech that's proud, personal and the right length for the room." },
  { name: "Something else?", body: "Graduations, farewells, awards: if there's a microphone, we can help." },
];

export default function OccasionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Other occasions"
        title="Words for the milestones worth marking"
        intro="Some moments only come once. We'll help you say what you mean, clearly and warmly."
      />
      <Section title="Occasions we write for">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OCCASIONS.map((o) => (
            <li key={o.name} className="rounded-xl border border-line bg-surface p-5">
              <h3 className="text-xl font-semibold">{o.name}</h3>
              <p className="mt-1 text-muted">{o.body}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Pricing">
        <ServicePriceTable serviceIds={["other"]} />
        <h3 className="mb-3 mt-8 text-xl font-semibold">Every order includes</h3>
        <IncludedList />
        <h3 className="mb-3 mt-8 text-xl font-semibold">Optional add-ons</h3>
        <AddOnTable />
      </Section>
      <Section title="Questions">
        <Faq
          items={[
            { q: "Can you write a bilingual speech?", a: "We write in English. If you'd like a few lines in another language, include them in your questionnaire and we'll weave them in naturally." },
            { q: "Can more than one person give the speech?", a: "Yes. Tell us who is speaking and we'll split the speech so it flows between you." },
          ]}
        />
      </Section>
      <Section className="text-center">
        <ButtonLink href="/order?service=other">Order your speech</ButtonLink>
      </Section>
    </>
  );
}
