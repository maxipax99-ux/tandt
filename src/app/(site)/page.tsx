import Link from "next/link";
import { ServicePriceTable, IncludedList } from "@/components/pricing-table";
import { ThreeSteps } from "@/components/steps";
import { ButtonLink, Card, Container, Section } from "@/components/ui";
import { SITE } from "@/config/site";

export default function HomePage() {
  return (
    <>
      <section className="py-16 sm:py-24">
        <Container>
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">Personal speech & tribute writing</p>
          <h1 className="max-w-3xl text-5xl font-semibold sm:text-6xl">{SITE.tagline}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted">
            Wedding toasts, eulogies, obituaries and milestone speeches, written with you from your own stories and
            ready to deliver.
          </p>
        </Container>
      </section>

      <Section title="Where would you like to start?" id="paths">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="flex flex-col">
            <h3 className="text-2xl font-semibold">Celebrations</h3>
            <p className="mt-2 flex-1 text-muted">
              Best man and maid of honor speeches, parent toasts, anniversaries, retirements and milestone
              birthdays: warm, personal and just the right amount of funny.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/weddings">Weddings & celebrations</ButtonLink>
              <ButtonLink href="/occasions" variant="secondary">Other occasions</ButtonLink>
            </div>
          </Card>
          <div data-mood="memorial" className="flex flex-col rounded-2xl border border-line bg-surface p-6 text-ink">
            <h3 className="text-2xl font-semibold">Memorials</h3>
            <p className="mt-2 flex-1 text-muted">
              Eulogies and obituaries written gently and carefully, so you can honor someone you love without
              having to find every word alone.
            </p>
            <div className="mt-6">
              <ButtonLink href="/memorials" variant="secondary">Eulogies & obituaries</ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section title="How it works" id="how">
        <ThreeSteps />
        <p className="mt-6">
          <Link href="/how-it-works" className="font-medium text-accent underline">See the full process</Link>
        </p>
      </Section>

      <Section title="What people say" id="testimonials">
        {/* TODO(owner): replace with real testimonials, shared with permission. */}
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <figure key={n} className="rounded-2xl border border-dashed border-line bg-surface p-6">
              <blockquote className="font-serif text-xl italic text-muted">
                “Testimonial coming soon.”
              </blockquote>
              <figcaption className="mt-3 text-sm text-muted">Placeholder {n}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section title="Simple, upfront pricing" id="pricing">
        <ServicePriceTable serviceIds={["wedding", "eulogy", "obituary", "other"]} />
        <h3 className="mb-3 mt-8 text-xl font-semibold">Every order includes</h3>
        <IncludedList />
        <p className="mt-6">
          <Link href="/pricing" className="font-medium text-accent underline">See add-ons and full pricing</Link>
        </p>
      </Section>

      <Section className="text-center">
        <h2 className="text-3xl font-semibold">Ready when you are</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">Tell us about the moment. We&apos;ll help you find the words.</p>
        <div className="mt-6">
          <ButtonLink href="/order">Start your order</ButtonLink>
        </div>
      </Section>
    </>
  );
}
