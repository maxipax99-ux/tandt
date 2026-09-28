"use server";

import type { FormState } from "@/components/form";
import { notifyAdmin } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";
import { contactSchema, fieldErrors } from "@/lib/validation";

export async function sendContact(prev: FormState, formData: FormData): Promise<FormState> {
  const attempt = (prev.attempt ?? 0) + 1;
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    turnstileToken: formData.get("turnstileToken") ?? undefined,
  });
  if (!parsed.success) return { attempt, errors: fieldErrors(parsed.error), message: "Please check the form." };

  const ip = await clientIp();
  if (!(await rateLimit("contact", ip)).ok) {
    return { attempt, message: "Too many messages. Please try again later or email us directly." };
  }
  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return { attempt, message: "We couldn't confirm you're not a bot. Please try again." };
  }

  const { name, email, message } = parsed.data;
  try {
    // The message goes to the owner's inbox (not stored in the database, not logged).
    await notifyAdmin("New contact message", [`From: ${name} <${email}>`, message], email);
  } catch {
    return { attempt, message: "Sorry, something went wrong sending your message. Please email us directly." };
  }
  return { attempt, ok: true, message: "Thank you. We've received your message and will reply by email soon." };
}
