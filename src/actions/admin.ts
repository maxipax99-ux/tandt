"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SERVICES, type ServiceId } from "@/config/services";
import { SITE } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { documentFilename, toDocx, toPdf } from "@/lib/documents";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { sendQuestionnaireLink } from "@/lib/fulfillment";
import { MANUAL_STATUSES } from "@/lib/orders";
import { db } from "@/lib/supabase/admin";
import { daysFromNow, newToken } from "@/lib/tokens";
import { adminDraftSchema, adminNotesSchema, adminStatusSchema } from "@/lib/validation";

/**
 * Admin actions. Every one starts with requireAdmin() (signed-in admin with
 * MFA) and validates its input with Zod before touching the database.
 */

export interface ActionResult {
  ok?: boolean;
  message?: string;
}

const orderIdSchema = z.object({ orderId: z.uuid() });

async function loadOrder(orderId: string) {
  const { data } = await db()
    .from("orders")
    .select("id, service, status, customer_email, content_purged_at")
    .eq("id", orderId)
    .single();
  if (!data) throw new Error("Order not found");
  return data as { id: string; service: ServiceId; status: string; customer_email: string; content_purged_at: string | null };
}

async function latestDraft(orderId: string) {
  const { data } = await db()
    .from("drafts")
    .select("id, version, body, sent_at, is_final")
    .eq("order_id", orderId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { id: string; version: number; body: string; sent_at: string | null; is_final: boolean } | null;
}

export async function updateStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const { orderId, status } = adminStatusSchema.parse({ orderId: formData.get("orderId"), status: formData.get("status") });
  if (!MANUAL_STATUSES.includes(status)) throw new Error("That status is set automatically.");
  const update: Record<string, unknown> = { status };
  if (status === "cancelled") update.closed_at = new Date().toISOString();
  await db().from("orders").update(update).eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function saveNotes(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = adminNotesSchema.safeParse({ orderId: formData.get("orderId"), notes: formData.get("notes") });
  if (!parsed.success) return { message: "Notes are too long." };
  const { error } = await db()
    .from("order_notes")
    .upsert({ order_id: parsed.data.orderId, notes: parsed.data.notes, updated_at: new Date().toISOString() });
  return error ? { message: "Couldn't save notes." } : { ok: true, message: "Notes saved." };
}

export async function saveDraft(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = adminDraftSchema.safeParse({ orderId: formData.get("orderId"), body: formData.get("body") });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Invalid draft." };
  const { orderId, body } = parsed.data;
  const order = await loadOrder(orderId);
  if (order.content_purged_at) return { message: "This order's content has been deleted." };

  const latest = await latestDraft(orderId);
  const { error } =
    latest && !latest.sent_at
      ? await db().from("drafts").update({ body }).eq("id", latest.id)
      : await db().from("drafts").insert({ order_id: orderId, version: (latest?.version ?? 0) + 1, body });
  if (error) return { message: "Couldn't save the draft." };

  if (["paid", "questionnaire_received", "call_booked", "revising"].includes(order.status)) {
    await db().from("orders").update({ status: "drafting" }).eq("id", orderId);
  }
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "Draft saved." };
}

async function createLink(orderId: string, purpose: "draft" | "final", days: number) {
  const { token, hash } = newToken();
  const { error } = await db()
    .from("access_tokens")
    .insert({ order_id: orderId, purpose, token_hash: hash, expires_at: daysFromNow(days).toISOString() });
  if (error) throw new Error("Couldn't create link");
  return `${env.siteUrl()}/d/${token}`;
}

export async function sendDraft(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const { orderId } = orderIdSchema.parse({ orderId: formData.get("orderId") });
  const order = await loadOrder(orderId);
  const draft = await latestDraft(orderId);
  if (!draft || draft.sent_at) return { message: "Save a new draft before sending." };
  if (order.status === "delivered" || order.status === "cancelled") return { message: "This order is closed." };

  const link = await createLink(orderId, "draft", SITE.draftLinkDays);
  const memorial = SERVICES[order.service].mood === "memorial";
  await sendEmail({
    to: order.customer_email,
    subject: `Your ${SERVICES[order.service].shortName.toLowerCase()} draft is ready`,
    paragraphs: [
      memorial
        ? "Your draft is ready to read whenever you feel able. Take all the time you need."
        : "Your draft is ready! Read it out loud once — that's the best way to hear how it flows.",
      "If you'd like changes, you can send them from the same page. Tell us everything in one message: what to add, cut or reword.",
      `This private link expires in ${SITE.draftLinkDays} days.`,
    ],
    link: { href: link, label: "Read your draft" },
  });
  await db().from("drafts").update({ sent_at: new Date().toISOString() }).eq("id", draft.id);
  await db().from("orders").update({ status: "draft_sent" }).eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "Draft sent to the customer." };
}

export async function sendFinal(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const { orderId } = orderIdSchema.parse({ orderId: formData.get("orderId") });
  const order = await loadOrder(orderId);
  const draft = await latestDraft(orderId);
  if (!draft) return { message: "Write and save the final text first." };
  if (order.status === "cancelled") return { message: "This order is cancelled." };

  const service = SERVICES[order.service];
  const title = service.name;
  const [pdf, docx] = await Promise.all([toPdf(title, draft.body), toDocx(title, draft.body)]);
  const link = await createLink(orderId, "final", SITE.finalLinkDays);

  await sendEmail({
    to: order.customer_email,
    subject: `Your final ${service.shortName.toLowerCase()}`,
    paragraphs: [
      service.mood === "memorial"
        ? "Here is your final piece. We hope it helps you honor them the way they deserve."
        : "Here is your final piece. We hope it goes wonderfully!",
      "It's attached as a PDF and a Word document, and you can also read it online at the link below.",
      `The link works for ${SITE.finalLinkDays} days. For your privacy, we delete our copy of your stories and drafts ${SITE.retentionDays} days from today, so please save the attachments.`,
    ],
    link: { href: link, label: "View your final piece" },
    attachments: [
      { filename: documentFilename(service.shortName, "pdf"), content: pdf },
      { filename: documentFilename(service.shortName, "docx"), content: docx },
    ],
  });

  const now = new Date().toISOString();
  await db().from("drafts").update({ is_final: true, sent_at: draft.sent_at ?? now }).eq("id", draft.id);
  await db().from("orders").update({ status: "delivered", delivered_at: now }).eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "Final piece delivered." };
}

export async function resendQuestionnaire(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const { orderId } = orderIdSchema.parse({ orderId: formData.get("orderId") });
  const order = await loadOrder(orderId);
  if (order.status !== "paid") return { message: "The questionnaire has already been submitted." };
  // Invalidate any older, unused links first.
  await db()
    .from("access_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("order_id", orderId)
    .eq("purpose", "questionnaire")
    .is("used_at", null);
  await sendQuestionnaireLink(orderId, order.customer_email, order.service);
  return { ok: true, message: "A new questionnaire link has been emailed." };
}

/** Deletes an order's personal content immediately (e.g. for a deletion request). Keeps the tax record. */
export async function purgeOrderNow(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z
    .object({ orderId: z.uuid(), confirm: z.literal("DELETE") })
    .safeParse({ orderId: formData.get("orderId"), confirm: formData.get("confirm") });
  if (!parsed.success) return { message: 'Type DELETE to confirm.' };
  const { orderId } = parsed.data;
  const client = db();
  for (const table of ["questionnaire_responses", "order_notes", "revision_requests", "drafts", "access_tokens"]) {
    const { error } = await client.from(table).delete().eq("order_id", orderId);
    if (error) return { message: "Deletion failed part-way. Please try again." };
  }
  await client
    .from("orders")
    .update({ content_purged_at: new Date().toISOString(), customer_name: null, closed_at: new Date().toISOString() })
    .eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "Personal content deleted." };
}

export async function completeDeletionRequest(formData: FormData): Promise<void> {
  await requireAdmin();
  const { id } = z.object({ id: z.uuid() }).parse({ id: formData.get("id") });
  await db().from("deletion_requests").update({ completed_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/retention");
}
