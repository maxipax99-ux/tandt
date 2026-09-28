import { RUSH_HOURS, SERVICES, type ServiceId } from "@/config/services";

export const ORDER_STATUSES = [
  "paid",
  "questionnaire_received",
  "call_booked",
  "drafting",
  "draft_sent",
  "revising",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "Paid",
  questionnaire_received: "Questionnaire received",
  call_booked: "Call booked",
  drafting: "Drafting",
  draft_sent: "Draft sent",
  revising: "Revising",
  delivered: "Delivered",
  cancelled: "Cancelled / refunded",
};

/** Statuses an admin can set by hand from the order page. */
export const MANUAL_STATUSES: OrderStatus[] = ["call_booked", "drafting", "cancelled"];

/** Adds business days (Mon–Fri), keeping the time of day. Holidays are not skipped. */
export function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start.getTime());
  let added = 0;
  while (added < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

/** When the piece is due, counted from when the questionnaire arrives (or payment, until then). */
export function computeDueAt(serviceId: ServiceId, rush: boolean, from: Date): Date {
  if (rush) return new Date(from.getTime() + RUSH_HOURS * 60 * 60 * 1000);
  return addBusinessDays(from, SERVICES[serviceId].deliveryBusinessDays);
}

export function describeDue(dueAt: Date, now: Date = new Date()): { label: string; overdue: boolean } {
  const ms = dueAt.getTime() - now.getTime();
  const overdue = ms < 0;
  const abs = Math.abs(ms);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(hours / 24);
  const span = days >= 1 ? `${days}d ${hours % 24}h` : `${hours}h ${Math.floor((abs % 3_600_000) / 60_000)}m`;
  return { label: overdue ? `${span} overdue` : `${span} left`, overdue };
}
