import type { Metadata } from "next";
import { Container, Notice, PageHeader } from "@/components/ui";
import { SERVICE_IDS, type ServiceId } from "@/config/services";
import { OrderForm } from "./order-form";

export const metadata: Metadata = { title: "Order", description: "Choose your service and add-ons." };

export default async function OrderPage({ searchParams }: PageProps<"/order">) {
  const params = await searchParams;
  const requested = typeof params.service === "string" ? params.service : "";
  const initialService: ServiceId = (SERVICE_IDS as string[]).includes(requested) ? (requested as ServiceId) : "wedding";

  return (
    <>
      <PageHeader title="Start your order" intro="Choose a service and any extras. It takes about a minute." />
      <Container className="max-w-3xl pb-16">
        {params.cancelled ? (
          <div className="mb-8">
            <Notice>Checkout was cancelled and you haven&apos;t been charged. You can try again below whenever you&apos;re ready.</Notice>
          </div>
        ) : null}
        <OrderForm initialService={initialService} />
      </Container>
    </>
  );
}
