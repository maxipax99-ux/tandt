import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  purgeOrderNow,
  resendQuestionnaire,
  saveDraft,
  saveNotes,
  sendDraft,
  sendFinal,
  updateStatus,
} from "@/actions/admin";
import { ActionForm } from "@/components/admin/action-form";
import { Card } from "@/components/ui";
import { SERVICES, ADD_ONS, type AddOnId, type ServiceId } from "@/config/services";
import { requireAdmin } from "@/lib/admin-auth";
import { MANUAL_STATUSES, STATUS_LABELS, describeDue, type OrderStatus } from "@/lib/orders";
import { formatUSD } from "@/lib/pricing";
import { questionsFor } from "@/lib/questionnaire";
import { db } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Order" };

const textareaClass = "block w-full rounded-lg border border-muted/60 bg-surface p-3 font-mono text-sm";

export default async function OrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const client = db();
  const [{ data: order }, { data: qr }, { data: notes }, { data: drafts }, { data: revisions }] = await Promise.all([
    client.from("orders").select("*").eq("id", id).maybeSingle(),
    client.from("questionnaire_responses").select("answers, submitted_at").eq("order_id", id).maybeSingle(),
    client.from("order_notes").select("notes, updated_at").eq("order_id", id).maybeSingle(),
    client.from("drafts").select("id, version, body, sent_at, is_final, created_at").eq("order_id", id).order("version", { ascending: false }),
    client.from("revision_requests").select("id, feedback, created_at").eq("order_id", id).order("created_at", { ascending: false }),
  ]);
  if (!order) notFound();

  const service = order.service as ServiceId;
  const status = order.status as OrderStatus;
  const latest = drafts?.[0];
  const answers = (qr?.answers ?? {}) as Record<string, string>;
  const purged = Boolean(order.content_purged_at);
  const due = order.due_at ? describeDue(new Date(order.due_at)) : null;

  return (
    <div className="space-y-8">
      <p><Link href="/admin" className="text-accent underline">← All orders</Link></p>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">
            {SERVICES[service].name}
            {order.rush ? <span className="ml-3 rounded bg-amber-700 px-2 py-0.5 align-middle text-sm font-semibold text-white">RUSH</span> : null}
          </h1>
          <p className="font-mono text-sm text-muted">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{STATUS_LABELS[status]}</p>
          {due && !["delivered", "cancelled"].includes(status) ? (
            <p className={due.overdue ? "font-semibold text-red-800" : "text-muted"}>
              Due {new Date(order.due_at).toLocaleString("en-US")} ({due.label})
            </p>
          ) : null}
        </div>
      </header>

      <Card>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <div><dt className="text-sm text-muted">Customer</dt><dd>{order.customer_name ?? "—"} · {order.customer_email}</dd></div>
          <div><dt className="text-sm text-muted">Paid</dt><dd>{formatUSD(order.amount_total)} on {new Date(order.created_at).toLocaleDateString("en-US")}</dd></div>
          <div><dt className="text-sm text-muted">Add-ons</dt><dd>{(order.add_ons as AddOnId[]).map((a) => ADD_ONS[a]?.name ?? a).join(", ") || "None"}</dd></div>
          <div><dt className="text-sm text-muted">Revisions used</dt><dd>{order.revisions_used} of {order.revisions_allowed}</dd></div>
        </dl>
        <form action={updateStatus} className="mt-4 flex flex-wrap items-end gap-2">
          <input type="hidden" name="orderId" value={order.id} />
          <label className="text-sm">
            <span className="block font-medium">Set status</span>
            <select name="status" defaultValue="" className="mt-1 rounded-lg border border-muted/60 bg-surface px-3 py-2">
              <option value="" disabled>Choose…</option>
              {MANUAL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </label>
          <button type="submit" className="rounded-full border border-accent px-4 py-2 text-sm text-accent">Update</button>
        </form>
        <p className="mt-2 text-xs text-muted">Other statuses change automatically as the questionnaire, drafts and edits come in.</p>
      </Card>

      {purged ? (
        <Card><p>Personal content for this order was deleted on {new Date(order.content_purged_at).toLocaleDateString("en-US")}.</p></Card>
      ) : (
        <>
          <section aria-labelledby="answers-h">
            <h2 id="answers-h" className="mb-3 text-2xl font-semibold">Questionnaire</h2>
            {qr ? (
              <Card>
                <dl className="space-y-4">
                  {questionsFor(service).map((q) =>
                    answers[q.id] ? (
                      <div key={q.id}>
                        <dt className="text-sm font-semibold">{q.label}</dt>
                        {/* Rendered as text: React escapes it, so customer input can't inject HTML. */}
                        <dd className="whitespace-pre-wrap">{answers[q.id]}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </Card>
            ) : (
              <Card>
                <p className="mb-3 text-muted">Not submitted yet.</p>
                {status === "paid" ? (
                  <ActionForm action={resendQuestionnaire} orderId={order.id} submitLabel="Email a new questionnaire link" variant="secondary" />
                ) : null}
              </Card>
            )}
          </section>

          <section aria-labelledby="notes-h">
            <h2 id="notes-h" className="mb-3 text-2xl font-semibold">Call notes</h2>
            <ActionForm action={saveNotes} orderId={order.id} submitLabel="Save notes" variant="secondary">
              <label htmlFor="notes" className="sr-only">Call notes</label>
              <textarea id="notes" name="notes" rows={8} maxLength={50000} defaultValue={notes?.notes ?? ""} className={textareaClass} />
            </ActionForm>
          </section>

          {revisions && revisions.length > 0 ? (
            <section aria-labelledby="rev-h">
              <h2 id="rev-h" className="mb-3 text-2xl font-semibold">Edit requests</h2>
              <ul className="space-y-3">
                {revisions.map((r) => (
                  <li key={r.id}>
                    <Card>
                      <p className="text-sm text-muted">{new Date(r.created_at).toLocaleString("en-US")}</p>
                      <p className="mt-1 whitespace-pre-wrap">{r.feedback}</p>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="draft-h">
            <h2 id="draft-h" className="mb-1 text-2xl font-semibold">Draft</h2>
            <p className="mb-3 text-sm text-muted">
              Paste or write the piece below. Leave a blank line between paragraphs.{" "}
              {latest ? `Latest: version ${latest.version}${latest.sent_at ? `, sent ${new Date(latest.sent_at).toLocaleDateString("en-US")}` : " (not sent yet)"}${latest.is_final ? ", final" : ""}.` : ""}
              {latest?.sent_at ? " Saving now starts a new version." : ""}
            </p>
            <ActionForm action={saveDraft} orderId={order.id} submitLabel="Save draft" variant="secondary">
              <label htmlFor="body" className="sr-only">Draft text</label>
              <textarea id="body" name="body" rows={20} maxLength={100000} defaultValue={latest?.body ?? ""} className={textareaClass} />
            </ActionForm>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Card>
                <h3 className="mb-2 text-lg font-semibold">Send draft for review</h3>
                <p className="mb-3 text-sm text-muted">Emails a private link (valid 7 days) to read the latest saved draft and request edits.</p>
                <ActionForm action={sendDraft} orderId={order.id} submitLabel="Send draft" confirm="Email this draft to the customer?" />
              </Card>
              <Card>
                <h3 className="mb-2 text-lg font-semibold">Deliver final</h3>
                <p className="mb-3 text-sm text-muted">Emails the latest saved version as final (PDF + Word attached) and marks the order delivered.</p>
                <ActionForm action={sendFinal} orderId={order.id} submitLabel="Send final & mark delivered" confirm="Deliver the latest saved version as FINAL?" />
              </Card>
            </div>
          </section>

          {drafts && drafts.length > 1 ? (
            <details className="rounded-2xl border border-line bg-surface p-4">
              <summary className="cursor-pointer font-medium">Earlier versions ({drafts.length - 1})</summary>
              {drafts.slice(1).map((d) => (
                <div key={d.id} className="mt-4 border-t border-line pt-4">
                  <p className="text-sm text-muted">Version {d.version}{d.sent_at ? `, sent ${new Date(d.sent_at).toLocaleDateString("en-US")}` : ""}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{d.body}</p>
                </div>
              ))}
            </details>
          ) : null}

          <section aria-labelledby="purge-h" className="rounded-2xl border border-red-700 p-5">
            <h2 id="purge-h" className="mb-2 text-xl font-semibold text-red-900">Delete content now</h2>
            <p className="mb-3 text-sm text-muted">
              For deletion requests. Permanently removes questionnaire answers, notes, drafts and edit requests. The order
              record (id, service, amount, date, email) is kept for tax purposes.
            </p>
            <ActionForm action={purgeOrderNow} orderId={order.id} submitLabel="Delete personal content" variant="danger" confirm="Permanently delete this order's personal content?">
              <label className="block text-sm">
                <span className="font-medium">Type DELETE to confirm</span>
                <input name="confirm" autoComplete="off" className="mt-1 block rounded-lg border border-muted/60 bg-surface px-3 py-2" />
              </label>
            </ActionForm>
          </section>
        </>
      )}
    </div>
  );
}
