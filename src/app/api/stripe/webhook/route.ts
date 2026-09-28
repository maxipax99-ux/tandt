import type Stripe from "stripe";
import { env } from "@/lib/env";
import { fulfillCheckoutSession, markRefunded } from "@/lib/fulfillment";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/supabase/admin";

const MAX_BODY_BYTES = 256 * 1024;

/**
 * Stripe webhook. The signature is verified against STRIPE_WEBHOOK_SECRET
 * before anything else happens; unsigned or tampered requests get a 400.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return new Response("Payload too large", { status: 413 });
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return new Response("Payload too large", { status: 413 });

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(body, signature, env.stripeWebhookSecret());
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // Skip events we've already fully processed.
  const { data: seen } = await db().from("stripe_events").select("id").eq("id", event.id).maybeSingle();
  if (seen) return Response.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckoutSession(event.data.object);
        break;
      case "charge.refunded": {
        const pi = event.data.object.payment_intent;
        const id = typeof pi === "string" ? pi : pi?.id;
        if (id && event.data.object.refunded) await markRefunded(id);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // Log only the event id/type and error message — never customer data.
    console.error(`[stripe-webhook] ${event.type} ${event.id} failed: ${err instanceof Error ? err.message : "unknown"}`);
    return new Response("Processing failed", { status: 500 }); // Stripe will retry.
  }

  await db().from("stripe_events").insert({ id: event.id, type: event.type });
  return Response.json({ received: true });
}
