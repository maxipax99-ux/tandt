import { z } from "zod";
import { ADD_ON_IDS, SERVICE_IDS } from "@/config/services";
import { ORDER_STATUSES } from "@/lib/orders";

/** Shared Zod schemas. Every server input is parsed with one of these. */

export const serviceIdSchema = z.enum(SERVICE_IDS as [string, ...string[]]);
export const addOnIdSchema = z.enum(ADD_ON_IDS as [string, ...string[]]);

const turnstile = z.string().max(2048).optional();

export const checkoutSchema = z.object({
  service: serviceIdSchema,
  addOns: z.array(addOnIdSchema).max(ADD_ON_IDS.length),
  agree: z.literal("on", { message: "Please agree to the Terms and Privacy Policy." }),
  turnstileToken: turnstile,
});

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address.").max(254),
  message: z.string().trim().min(10, "Please write a little more (at least 10 characters).").max(5000),
  turnstileToken: turnstile,
});

export const deletionRequestSchema = z.object({
  email: z.email("Please enter a valid email address.").max(254),
  details: z.string().trim().max(2000).optional(),
  turnstileToken: turnstile,
});

export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export const revisionRequestSchema = z.object({
  token: tokenSchema,
  feedback: z.string().trim().min(5, "Please tell us what you'd like changed.").max(8000),
});

export const adminStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(ORDER_STATUSES),
});

export const adminNotesSchema = z.object({
  orderId: z.uuid(),
  notes: z.string().max(50_000),
});

export const adminDraftSchema = z.object({
  orderId: z.uuid(),
  body: z.string().trim().min(1, "The draft is empty.").max(100_000),
});

export const adminLoginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(256),
});

export const mfaCodeSchema = z.object({
  factorId: z.string().min(1).max(100),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app."),
});

/** Flatten Zod issues into { field: message } for forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
