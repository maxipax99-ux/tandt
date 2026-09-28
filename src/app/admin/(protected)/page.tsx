import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES, type ServiceId } from "@/config/services";
import { requireAdmin } from "@/lib/admin-auth";
import { ORDER_STATUSES, STATUS_LABELS, describeDue, type OrderStatus } from "@/lib/orders";
import { formatUSD } from "@/lib/pricing";
import { db } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Orders" };

interface OrderRow {
  id: string;
  created_at: string;
  customer_email: string;
  customer_name: string | null;
  service: ServiceId;
  rush: boolean;
  status: OrderStatus;
  due_at: string | null;
  amount_total: number;
}

const OPEN: OrderStatus[] = ["paid", "questionnaire_received", "call_booked", "drafting", "draft_sent", "revising"];

export default async function OrdersDashboard({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const { status, email } = await searchParams;
  const emailFilter = typeof email === "string" && email.length <= 254 ? email.trim().toLowerCase() : null;
  const filter = typeof status === "string" && (ORDER_STATUSES as readonly string[]).includes(status) ? (status as OrderStatus) : null;

  let query = db()
    .from("orders")
    .select("id, created_at, customer_email, customer_name, service, rush, status, due_at, amount_total")
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(200);
  if (emailFilter) query = query.eq("customer_email", emailFilter);
  else query = filter ? query.eq("status", filter) : query.in("status", OPEN);
  const { data, error } = await query;
  const orders = (data ?? []) as OrderRow[];

  // Open rush orders first, then by due date.
  orders.sort((a, b) => {
    const ar = a.rush && OPEN.includes(a.status) ? 0 : 1;
    const br = b.rush && OPEN.includes(b.status) ? 0 : 1;
    return ar - br;
  });
  const now = new Date();

  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">Orders</h1>
      <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
        <label className="text-sm">
          <span className="block font-medium">Find by customer email</span>
          <input name="email" type="email" defaultValue={emailFilter ?? ""} className="mt-1 rounded-lg border border-muted/60 bg-surface px-3 py-2" />
        </label>
        <button type="submit" className="rounded-full border border-accent px-4 py-2 text-sm text-accent">Search</button>
      </form>
      <nav aria-label="Filter by status" className="mb-6">
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <Link href="/admin" aria-current={!filter && !emailFilter ? "page" : undefined} className="block rounded-full border border-line px-3 py-1.5 aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink">
              All open
            </Link>
          </li>
          {ORDER_STATUSES.map((s) => (
            <li key={s}>
              <Link href={`/admin?status=${s}`} aria-current={filter === s ? "page" : undefined} className="block rounded-full border border-line px-3 py-1.5 aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink">
                {STATUS_LABELS[s]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {error ? <p role="alert" className="text-red-800">Couldn&apos;t load orders.</p> : null}
      {orders.length === 0 && !error ? <p className="text-muted">No orders here.</p> : null}

      {orders.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Orders, rush orders first, then by due date</caption>
            <thead className="border-b border-line text-muted">
              <tr>
                <th scope="col" className="p-3 font-medium">Order</th>
                <th scope="col" className="p-3 font-medium">Customer</th>
                <th scope="col" className="p-3 font-medium">Service</th>
                <th scope="col" className="p-3 font-medium">Status</th>
                <th scope="col" className="p-3 font-medium">Due</th>
                <th scope="col" className="p-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => {
                const due = o.due_at && OPEN.includes(o.status) ? describeDue(new Date(o.due_at), now) : null;
                return (
                  <tr key={o.id} className={o.rush && OPEN.includes(o.status) ? "bg-amber-50" : undefined}>
                    <th scope="row" className="p-3 font-normal">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-accent underline">{o.id.slice(0, 8)}</Link>
                      {o.rush ? <span className="ml-2 rounded bg-amber-700 px-1.5 py-0.5 text-xs font-semibold text-white">RUSH</span> : null}
                      <span className="block text-xs text-muted">{new Date(o.created_at).toLocaleDateString("en-US")}</span>
                    </th>
                    <td className="p-3">
                      {o.customer_name ?? "—"}
                      <span className="block text-xs text-muted">{o.customer_email}</span>
                    </td>
                    <td className="p-3">{SERVICES[o.service]?.shortName ?? o.service}</td>
                    <td className="p-3">{STATUS_LABELS[o.status]}</td>
                    <td className="p-3">
                      {due ? (
                        <span className={due.overdue ? "font-semibold text-red-800" : undefined}>{due.label}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3">{formatUSD(o.amount_total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
