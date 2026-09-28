import type { Metadata } from "next";
import { Card, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Samples",
  description: "Sample speeches and tributes. All names and details are fictional.",
};

// TODO(owner): add real samples here. Use fictional names and details only, never a real client's story.
const SAMPLES = [
  { kind: "Best man speech", title: "Coming soon" },
  { kind: "Maid of honor speech", title: "Coming soon" },
  { kind: "Eulogy", title: "Coming soon" },
  { kind: "Obituary", title: "Coming soon" },
  { kind: "Retirement toast", title: "Coming soon" },
  { kind: "50th anniversary toast", title: "Coming soon" },
];

export default function SamplesPage() {
  return (
    <>
      <PageHeader
        title="Samples"
        intro="A feel for our style. Every sample uses fictional names and details: we never share a client's story."
      />
      <Section>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((s) => (
            <li key={s.kind}>
              <Card className="h-full border-dashed">
                <p className="text-sm uppercase tracking-wider text-muted">{s.kind}</p>
                <h2 className="mt-2 text-2xl font-semibold">{s.title}</h2>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
