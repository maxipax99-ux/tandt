import "server-only";
import type Stripe from "stripe";
import { z } from "zod";
import { SERVICES, type AddOnId, type ServiceId } from "@/config/services";
import { SITE } from "@/config/site";
import { notifyAdmin, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { computeDueAt } from "@/lib/orders";
import { priceOrder, revisionsAllowed } from "@/lib/pricing";
import { db } from "@/lib/supabase/admin";
import { daysFromNow, newToken } from "@/lib/tokens";
import { addOnIdSchema, serviceIdSchema } from "@/lib/validation";

const metadataSchema = z.object({
  service: serviceIdSchema,
  add_ons: z
    .string()
    .max(200)
    .transform((s) => (s ? s.split(",") : []))
    .pipe(z.array(addOnIdSchema)),
});

/**
 * Turns a paid Checkout Session into an order. Safe to call more than once
 * for the same session (Stripe retries webhooks): the order is only created
 * once, and the questionnaire email is re-sent only if the previous attempt
 * didn't complete.
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;

  const meta = metadataSchema.parse(session.metadata ?? {});
  const service = meta.service as ServiceId;
  const addOns = meta.add_ons as AddOnId[];
  const email = session.customer_details?.email;
  if (!email) throw new Error("Checkout session has no customer email");

  const expected = priceOrder(service, addOns).totalCents;
  if (session.amount_subtotal !== expected) {
    // Not fatal (prices may have changed between checkout and webhook), but worth a look.
    console.warn(`[fulfill] subtotal mismatch for session ${session.id}`);
  }

  const rush = addOns.includes("rush");
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

  const { data: inserted, error: insertError } = await db()
    .from("orders")
    .upsert(
      {
        stripe_session_id: session.id,
        stripe_payment_intent: paymentIntent ?? null,
        customer_email: email.toLowerCase(),
        customer_name: session.customer_details?.name ?? null,
        service,
        add_ons: addOns,
        rush,
        amount_total: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        status: "paid",
        due_at: computeDueAt(service, rush, new Date()).toISOString(),
        revisions_allowed: revisionsAllowed(addOns),
      },
      { onConflict: "stripe_session_id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (insertError) throw new Error(`order insert failed: ${insertError.code}`);

  let orderId = inserted?.id as string | undefined;
  if (!orderId) {
    // Already created by an earlier delivery of this event.
    const { data: existing } = await db()
      .from("orders")
      .select("id, status")
      .eq("stripe_session_id", session.id)
      .single();
    if (!existing || existing.status !== "paid") return;
    const { count } = await db()
      .from("access_tokens")
      .select("id", { count: "exact", head: true })
      .eq("order_id", existing.id)
      .eq("purpose", "questionnaire");
    if ((count ?? 0) > 0) return; // Link already created and emailed.
    orderId = existing.id as string;
  }

  await sendQuestionnaireLink(orderId, email, service);
  await notifyAdmin(`New ${SERVICES[service].shortName.toLowerCase()} order${rush ? " (RUSH)" : ""}`, [
    `Order ${orderId} has been paid.`,
    `${env.siteUrl()}/admin/orders/${orderId}`,
  ]);
}

/** Creates a fresh single-use questionnaire link and emails it. Also used by the admin "resend" button. */
export async function sendQuestionnaireLink(orderId: string, email: string, service: ServiceId) {
  const { token, hash } = newToken();
  const { error } = await db().from("access_tokens").insert({
    order_id: orderId,
    purpose: "questionnaire",
    token_hash: hash,
    expires_at: daysFromNow(SITE.questionnaireLinkDays).toISOString(),
  });
  if (error) throw new Error(`token insert failed: ${error.code}`);

  const memorial = SERVICES[service].mood === "memorial";
  await sendEmail({
    to: email,
    subject: memorial ? "Your questionnaire — whenever you're ready" : "Thank you for your order — next step",
    paragraphs: [
      memorial
        ? "Thank you for trusting us with this. We're so sorry for your loss."
        : `Thank you for your order! We can't wait to help with your ${SERVICES[service].shortName.toLowerCase()}.`,
      "The next step is a short questionnaire about the person and the occasion. Share as much or as little as feels right; you can skip anything.",
      `This private link works once and expires in ${SITE.questionnaireLinkDays} days. Please don't forward it.`,
    ],
    link: { href: `${env.siteUrl()}/q/${token}`, label: "Open your questionnaire" },
  });
}

/** Marks an order cancelled after a refund in Stripe (its content is then purged on the usual schedule). */
export async function markRefunded(paymentIntentId: string) {
  const { error } = await db()
    .from("orders")
    .update({ status: "cancelled", closed_at: new Date().toISOString() })
    .eq("stripe_payment_intent", paymentIntentId)
    .neq("status", "cancelled");
  if (error) throw new Error(`refund update failed: ${error.code}`);
}
