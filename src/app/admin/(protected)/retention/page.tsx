import type { Metadata } from "next";
import Link from "next/link";
import { completeDeletionRequest } from "@/actions/admin";
import { SERVICES, type ServiceId } from "@/config/services";
import { SITE } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Data retention" };

export default async function RetentionPage() {
  await requireAdmin();
  const { data } = await db()
    .from("orders")
    .select("id, service, status, delivered_at, closed_at")
    .is("content_purged_at", null)
    .or("delivered_at.not.is.null,closed_at.not.is.null")
    .limit(500);

  const rows = (data ?? [])
    .map((o) => {
      const end = new Date((o.delivered_at ?? o.closed_at) as string);
      return { ...o, purgeAt: new Date(end.getTime() + SITE.retentionDays * 86_400_000) };
    })
    .sort((a, b) => a.purgeAt.getTime() - b.purgeAt.getTime());

  const { data: requests } = await db()
    .from("deletion_requests")
    .select("id, email, created_at, verified_at, completed_at")
    .not("verified_at", "is", null)
    .is("completed_at", null)
    .order("created_at");

  return (
    <>
      <h1 className="mb-2 text-3xl font-semibold">Data retention</h1>
      <p className="mb-6 max-w-2xl text-muted">
        Questionnaire answers, drafts, edit requests and call notes are deleted automatically {SITE.retentionDays} days after
        delivery or cancellation (daily job). Order number, service, amount, date and email are kept for tax and refund records.
      </p>

      <h2 className="mb-3 text-2xl font-semibold">Scheduled for deletion</h2>
      {rows.length === 0 ? <p className="text-muted">Nothing scheduled.</p> : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th scope="col" className="p-3 font-medium">Order</th>
                <th scope="col" className="p-3 font-medium">Service</th>
                <th scope="col" className="p-3 font-medium">Delivered / closed</th>
                <th scope="col" className="p-3 font-medium">Content deleted on</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="p-3 font-normal">
                    <Link href={`/admin/orders/${r.id}`} className="font-mono text-accent underline">{r.id.slice(0, 8)}</Link>
                  </th>
                  <td className="p-3">{SERVICES[r.service as ServiceId]?.shortName ?? r.service}</td>
                  <td className="p-3">{new Date((r.delivered_at ?? r.closed_at) as string).toLocaleDateString("en-US")}</td>
                  <td className="p-3">{r.purgeAt.toLocaleDateString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-3 mt-10 text-2xl font-semibold">Verified deletion requests</h2>
      <p className="mb-3 max-w-2xl text-sm text-muted">
        Find the customer&apos;s orders by email, use &quot;Delete content now&quot; on each, then mark the request done.
      </p>
      {(requests ?? []).length === 0 ? <p className="text-muted">No open requests.</p> : (
        <ul className="space-y-2">
          {(requests ?? []).map((r) => (
            <li key={r.id} className="rounded-xl border border-line bg-surface p-4">
              <DeletionRequestRow id={r.id} email={r.email} createdAt={r.created_at} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}


function DeletionRequestRow({ id, email, createdAt }: { id: string; email: string; createdAt: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <span className="font-medium">{email}</span>
        <span className="block text-xs text-muted">Requested {new Date(createdAt).toLocaleDateString("en-US")}</span>
      </div>
      <div className="flex gap-3">
        <Link href={`/admin?email=${encodeURIComponent(email)}`} className="text-accent underline">Find orders</Link>
        <form action={completeDeletionRequest}>
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="text-accent underline">Mark done</button>
        </form>
      </div>
    </div>
  );
}
