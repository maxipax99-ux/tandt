import type { Metadata } from "next";
import { PageHeader, Section } from "@/components/ui";
import { SITE } from "@/config/site";
import { DeletionForm } from "./deletion-form";

export const metadata: Metadata = { title: "Request data deletion" };

export default function DeleteMyDataPage() {
  return (
    <>
      <PageHeader
        title="Request deletion of your data"
        intro={`We delete stories, drafts and call notes automatically ${SITE.retentionDays} days after delivery. If you'd like them gone sooner, ask here.`}
      />
      <Section>
        <div className="mb-6 max-w-2xl space-y-3 text-muted">
          <p>
            To protect you, we&apos;ll email a confirmation link to the address you enter. Your request goes ahead once you
            click it.
          </p>
          <p>
            We&apos;ll delete your questionnaire answers, call notes, drafts and edit requests. We&apos;re required to keep a
            basic record of each payment (order number, service, amount, date and email) for tax purposes.
          </p>
        </div>
        <DeletionForm />
      </Section>
    </>
  );
}
