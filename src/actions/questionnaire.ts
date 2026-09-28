"use server";

import type { FormState } from "@/components/form";
import { SERVICES, type ServiceId } from "@/config/services";
import { notifyAdmin, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { computeDueAt } from "@/lib/orders";
import { answersFromForm, answersSchema } from "@/lib/questionnaire";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { db } from "@/lib/supabase/admin";
import { consumeToken, findToken, unconsumeToken } from "@/lib/token-lookup";
import { fieldErrors, tokenSchema } from "@/lib/validation";

const EXPIRED = "This link has expired or has already been used. Please contact us and we'll send a new one.";

export async function submitQuestionnaire(prev: FormState, formData: FormData): Promise<FormState> {
  const attempt = (prev.attempt ?? 0) + 1;
  const ip = await clientIp();
  if (!(await rateLimit("questionnaire", ip)).ok) {
    return { attempt, message: "Too many attempts. Please wait a little and try again." };
  }

  const tokenParsed = tokenSchema.safeParse(formData.get("token"));
  if (!tokenParsed.success) return { attempt, message: EXPIRED };
  const token = tokenParsed.data;

  const row = await findToken(token, "questionnaire");
  if (!row?.order_id) return { attempt, message: EXPIRED };

  const { data: order } = await db()
    .from("orders")
    .select("id, service, rush, customer_email, status")
    .eq("id", row.order_id)
    .single();
  if (!order || order.status === "cancelled") return { attempt, message: EXPIRED };
  const service = order.service as ServiceId;

  const parsed = answersSchema(service).safeParse(answersFromForm(service, formData));
  if (!parsed.success) {
    return { attempt, errors: fieldErrors(parsed.error), message: "A few answers need attention. They're marked below." };
  }

  // Single use: whoever consumes the token first wins; a double-submit gets the expired message.
  if (!(await consumeToken(token, "questionnaire"))) return { attempt, message: EXPIRED };

  const now = new Date();
  const { error } = await db().from("questionnaire_responses").insert({ order_id: order.id, answers: parsed.data });
  if (error) {
    await unconsumeToken(token);
    console.error(`[questionnaire] save failed: ${error.code}`);
    return { attempt, message: "Sorry, we couldn't save your answers. Please try again." };
  }
  await db()
    .from("orders")
    .update({
      status: "questionnaire_received",
      questionnaire_submitted_at: now.toISOString(),
      due_at: computeDueAt(service, order.rush, now).toISOString(),
    })
    .eq("id", order.id);

  const bookingUrl = env.bookingUrl();
  try {
    await sendEmail({
      to: order.customer_email,
      subject: "Thank you — now let's book your call",
      paragraphs: [
        "Thank you for your answers. We've received them safely.",
        "The last step before we start writing is a 15-minute intake call so we can hear the stories in your own words. Please book a time that suits you.",
        "If you'd like the call recorded, we'll ask everyone on the call for permission again at the start. You can always say no.",
        bookingUrl ? "" : "We'll email you shortly with times for your call.",
      ].filter(Boolean),
      link: bookingUrl ? { href: bookingUrl, label: "Book your intake call" } : undefined,
    });
    await notifyAdmin(`Questionnaire received (${SERVICES[service].shortName})`, [
      `Order ${order.id} has submitted their questionnaire.`,
      `${env.siteUrl()}/admin/orders/${order.id}`,
    ]);
  } catch {
    // Answers are saved; an email hiccup shouldn't make the customer resubmit.
  }

  return { attempt, ok: true, message: "Thank you. Your answers are saved." };
}
