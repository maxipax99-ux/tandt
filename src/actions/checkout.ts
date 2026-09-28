"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/components/form";
import { SERVICES, type AddOnId, type ServiceId } from "@/config/services";
import { SITE } from "@/config/site";
import { env } from "@/lib/env";
import { priceOrder } from "@/lib/pricing";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { stripe } from "@/lib/stripe";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkoutSchema, fieldErrors } from "@/lib/validation";

/** Terms version recorded with each order, so you know what the customer agreed to. */
const TERMS_VERSION = "2026-09-28";

export async function startCheckout(prev: FormState, formData: FormData): Promise<FormState> {
  const attempt = (prev.attempt ?? 0) + 1;
  const parsed = checkoutSchema.safeParse({
    service: formData.get("service"),
    addOns: formData.getAll("addOns"),
    agree: formData.get("agree") ?? undefined,
    turnstileToken: formData.get("turnstileToken") ?? undefined,
  });
  if (!parsed.success) return { attempt, errors: fieldErrors(parsed.error), message: "Please check the form." };

  const ip = await clientIp();
  if (!(await rateLimit("checkout", ip)).ok) {
    return { attempt, message: "Too many attempts. Please wait a few minutes and try again." };
  }
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return { attempt, message: "We couldn't confirm you're not a bot. Please try again." };
  }
  if (!env.stripeConfigured()) {
    return { attempt, message: "Payments aren't set up yet (STRIPE_SECRET_KEY is missing)." };
  }

  // Prices come from our config on the server — never from the browser.
  const service = parsed.data.service as ServiceId;
  const { lines, addOns } = priceOrder(service, parsed.data.addOns as AddOnId[]);
  const site = env.siteUrl();

  let url: string | null = null;
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((line) => ({
        quantity: 1,
        price_data: { currency: "usd", unit_amount: line.cents, product_data: { name: line.name } },
      })),
      name_collection: { individual: { enabled: true } },
      metadata: {
        service,
        add_ons: addOns.join(","),
        terms_version: TERMS_VERSION,
        terms_accepted_at: new Date().toISOString(),
      },
      payment_intent_data: { description: `${SITE.name}: ${SERVICES[service].name}` },
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
      success_url: `${site}/order/success`,
      cancel_url: `${site}/order?service=${service}&cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    });
    url = session.url;
  } catch (err) {
    console.error(`[checkout] session create failed: ${err instanceof Error ? err.name : "unknown"}`);
  }
  if (!url) return { attempt, message: "Sorry, we couldn't start checkout. Please try again." };
  redirect(url);
}


