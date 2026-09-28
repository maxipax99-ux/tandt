import {
  ADD_ONS,
  INCLUDED_REVISIONS,
  SERVICES,
  type AddOnId,
  type ServiceId,
} from "@/config/services";

export interface PriceLine {
  id: ServiceId | AddOnId;
  name: string;
  cents: number;
}

export function addOnCents(addOnId: AddOnId, serviceId: ServiceId): number {
  const addOn = ADD_ONS[addOnId];
  if (addOn.pricing.type === "fixed") return addOn.pricing.cents;
  return Math.round((SERVICES[serviceId].priceCents * addOn.pricing.percent) / 100);
}

/** Builds the itemised price for an order. De-duplicates add-ons. */
export function priceOrder(serviceId: ServiceId, addOnIds: readonly AddOnId[]) {
  const service = SERVICES[serviceId];
  const unique = [...new Set(addOnIds)];
  const lines: PriceLine[] = [
    { id: service.id, name: service.name, cents: service.priceCents },
    ...unique.map((id) => ({ id, name: ADD_ONS[id].name, cents: addOnCents(id, serviceId) })),
  ];
  const totalCents = lines.reduce((sum, l) => sum + l.cents, 0);
  return { lines, totalCents, addOns: unique };
}

export function revisionsAllowed(addOnIds: readonly string[]): number {
  return INCLUDED_REVISIONS + (addOnIds.includes("extra_revision") ? 1 : 0);
}

export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function addOnPriceLabel(addOnId: AddOnId): string {
  const pricing = ADD_ONS[addOnId].pricing;
  return pricing.type === "fixed" ? `+${formatUSD(pricing.cents)}` : `+${pricing.percent}% of base`;
}
