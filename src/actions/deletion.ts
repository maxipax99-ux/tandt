"use server";

import type { FormState } from "@/components/form";
import { notifyAdmin, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { db } from "@/lib/supabase/admin";
import { consumeToken, findToken } from "@/lib/token-lookup";
import { daysFromNow, newToken } from "@/lib/tokens";
import { verifyTurnstile } from "@/lib/turnstile";
import { deletionRequestSchema, fieldErrors, tokenSchema } from "@/lib/validation";

// Same reply whether or not we have orders for that email, so the form can't be used to discover customers.
const SENT = "Thank you. If that address is valid, we've sent it a link to confirm your request. Please check your inbox.";

export async function requestDeletion(prev: FormState, formData: FormData): Promise<FormState> {
  const attempt = (prev.attempt ?? 0) + 1;
  const parsed = deletionRequestSchema.safeParse({
    email: formData.get("email"),
    details: formData.get("details") || undefined,
    turnstileToken: formData.get("turnstileToken") ?? undefined,
  });
  if (!parsed.success) return { attempt, errors: fieldErrors(parsed.error), message: "Please check the form." };

  const ip = await clientIp();
  if (!(await rateLimit("deletion", ip)).ok) return { attempt, message: "Too many requests. Please try again later." };
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return { attempt, message: "We couldn't confirm you're not a bot. Please try again." };
  }
  if (!env.supabaseConfigured()) return { attempt, message: "The database isn't configured yet." };

  const email = parsed.data.email.toLowerCase();
  const { data: req, error } = await db()
    .from("deletion_requests")
    .insert({ email, details: parsed.data.details ?? null })
    .select("id")
    .single();
  if (error || !req) return { attempt, message: "Sorry, something went wrong. Please email us instead." };

  const { token, hash } = newToken();
  await db().from("access_tokens").insert({
    deletion_request_id: req.id,
    purpose: "deletion",
    token_hash: hash,
    expires_at: daysFromNow(1).toISOString(),
  });

  try {
    await sendEmail({
      to: email,
      subject: "Confirm your data deletion request",
      paragraphs: [
        "We received a request to delete the personal information we hold for this email address.",
        "If this was you, please confirm using the button below (valid for 24 hours). If it wasn't you, ignore this email and nothing will happen.",
      ],
      link: { href: `${env.siteUrl()}/delete-my-data/verify/${token}`, label: "Confirm deletion request" },
    });
  } catch {
    return { attempt, message: "Sorry, we couldn't send the confirmation email. Please email us instead." };
  }
  return { attempt, ok: true, message: SENT };
}

/** Confirm button on the verification page (a POST, so email link-scanners can't confirm by accident). */
export async function confirmDeletion(prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = tokenSchema.safeParse(formData.get("token"));
  if (!parsed.success) return { message: "This link is invalid or has expired." };
  if (!(await rateLimit("deletion", await clientIp())).ok) return { message: "Too many requests. Please try later." };

  const row = await findToken(parsed.data, "deletion");
  if (!row?.deletion_request_id || !(await consumeToken(parsed.data, "deletion"))) {
    return { message: "This link is invalid, has expired, or was already used." };
  }
  await db().from("deletion_requests").update({ verified_at: new Date().toISOString() }).eq("id", row.deletion_request_id);
  try {
    await notifyAdmin("Verified data deletion request", [
      "A customer has verified a data deletion request.",
      `${env.siteUrl()}/admin/retention`,
    ]);
  } catch {
    // Visible in the admin retention view regardless.
  }
  return { ok: true, message: "Confirmed. We'll delete your information and email you when it's done (within 30 days)." };
}
