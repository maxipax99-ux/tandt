import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { SITE } from "@/config/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact", description: `Get in touch with ${SITE.name}.` };

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact us"
        intro={
          <>
            Questions before you order, or need help with an existing order? Send us a note, or email{" "}
            <a className="text-accent underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
          </>
        }
      />
      <Section>
        <ContactForm />
      </Section>
    </>
  );
}
