import type { Metadata } from "next";
import { Faq } from "@/components/faq";
import { AddOnTable, IncludedList, ServicePriceTable } from "@/components/pricing-table";
import { ButtonLink, Card, PageHeader, Section } from "@/components/ui";
import { AI_FAQ } from "@/content/faq";

export const metadata: Metadata = {
  title: "Wedding & Celebration Speeches",
  description: "Best man, maid of honor and parent toasts written from your stories, ready to deliver.",
};

const EXCERPTS = [
  {
    label: "Best man (sample, fictional names)",
    text: "I've known Sam for twenty-two years, which means I've seen three haircuts he'd like you to forget and one decision he'll never regret. That decision is sitting next to him tonight.",
  },
  {
    label: "Mother of the bride (sample, fictional names)",
    text: "When Maya was six she announced she'd marry someone who laughed at her jokes. Daniel, you have set a very high bar for the rest of us, and you've cleared it every single day.",
  },
];

export default function WeddingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Weddings & celebrations"
        title="A toast they'll talk about for all the right reasons"
        intro="You know the stories. We'll shape them into a speech that's warm, personal and the right length, so you can enjoy the day instead of dreading the microphone."
      />
      <Section title="What we write">
        <ul className="grid gap-4 sm:grid-cols-2">
          {["Best man speeches", "Maid & matron of honor speeches", "Father or mother of the bride or groom", "Rehearsal dinner and engagement toasts"].map((s) => (
            <li key={s} className="rounded-xl border border-line bg-surface p-4 font-medium">{s}</li>
          ))}
        </ul>
      </Section>
      <Section title="Pricing">
        <ServicePriceTable serviceIds={["wedding"]} />
        <h3 className="mb-3 mt-8 text-xl font-semibold">Every order includes</h3>
        <IncludedList />
        <h3 className="mb-3 mt-8 text-xl font-semibold">Optional add-ons</h3>
        <AddOnTable />
      </Section>
      <Section title="Sample excerpts">
        <div className="grid gap-6 sm:grid-cols-2">
          {EXCERPTS.map((e) => (
            <Card key={e.label}>
              <p className="text-sm uppercase tracking-wider text-muted">{e.label}</p>
              <blockquote className="mt-3 font-serif text-xl">“{e.text}”</blockquote>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Questions">
        <Faq
          items={[
            { q: "How long will my speech be?", a: "Most wedding speeches land between 3 and 5 minutes, about 450–750 words. Tell us your time slot and we'll write to it." },
            { q: "Can you make it funny without being embarrassing?", a: "Yes. We'll ask what's off-limits, and we keep humor affectionate, the kind grandparents laugh at too." },
            { q: "How far ahead should I order?", a: "Two to three weeks before the wedding gives time for the draft, edits and practice. Rush delivery is available if you're closer." },
            AI_FAQ,
          ]}
        />
      </Section>
      <Section className="text-center">
        <ButtonLink href="/order?service=wedding">Order your wedding speech</ButtonLink>
      </Section>
    </>
  );
}
