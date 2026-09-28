import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui";
import { ConfirmDeletionForm } from "./confirm-form";

export const metadata: Metadata = { title: "Confirm deletion", robots: { index: false, follow: false } };

export default async function VerifyDeletionPage({ params }: PageProps<"/delete-my-data/verify/[token]">) {
  const { token } = await params;
  return (
    <>
      <PageHeader title="Confirm your deletion request" />
      <Container className="max-w-2xl pb-16">
        <p className="mb-6 text-lg">
          Press the button to confirm you&apos;d like us to delete the personal information linked to your email address.
        </p>
        <ConfirmDeletionForm token={token} />
      </Container>
    </>
  );
}
