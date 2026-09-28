import type { Metadata } from "next";
import { AddOnTable, IncludedList, ServicePriceTable } from "@/components/pricing-table";
import { ButtonLink, PageHeader, Section } from "@/components/ui";
import { SERVICE_IDS } from "@/config/services";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Upfront prices for wedding speeches, eulogies, obituaries and occasion speeches.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader title="Pricing" intro="One clear price per piece. No subscriptions, no hidden fees." />
      <Section title="Services">
        <ServicePriceTable serviceIds={SERVICE_IDS} />
      </Section>
      <Section title="Every order includes">
        <IncludedList />
      </Section>
      <Section title="Optional add-ons">
        <AddOnTable />
        <p className="mt-4 text-sm text-muted">
          Delivery times are counted from when we receive your completed questionnaire. Rush orders aim for a draft
          within 24–48 hours.
        </p>
      </Section>
      <Section className="text-center">
        <ButtonLink href="/order">Start your order</ButtonLink>
      </Section>
    </>
  );
}
