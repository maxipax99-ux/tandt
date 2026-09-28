"use server";

import type { FormState } from "@/components/form";
import { notifyAdmin } from "@/lib/email";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { db } from "@/lib/supabase/admin";
import { findToken } from "@/lib/token-lookup";
import { fieldErrors, revisionRequestSchema } from "@/lib/validation";

export async function requestRevision(prev: FormState, formData: FormData): Promise<FormState> {
  const attempt = (prev.attempt ?? 0) + 1;
  if (!(await rateLimit("draftFeedback", await clientIp())).ok) {
    return { attempt, message: "Too many attempts. Please wait a little and try again." };
  }
  const parsed = revisionRequestSchema.safeParse({ token: formData.get("token"), feedback: formData.get("feedback") });
  if (!parsed.success) return { attempt, errors: fieldErrors(parsed.error), message: "Please check the form." };

  const row = await findToken(parsed.data.token, "draft", { allowUsed: true });
  if (!row?.order_id) return { attempt, message: "This link has expired. Please contact us." };

  const { data: draft } = await db()
    .from("drafts")
    .select("id")
    .eq("order_id", row.order_id)
    .not("sent_at", "is", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  // The database function checks the order is awaiting feedback and has rounds left, atomically.
  const { data: ok, error } = await db().rpc("request_revision", {
    p_order_id: row.order_id,
    p_draft_id: draft?.id ?? null,
    p_feedback: parsed.data.feedback,
  });
  if (error) return { attempt, message: "Sorry, we couldn't save your request. Please try again." };
  if (!ok) return { attempt, message: "We already have your edit request, or no edit rounds are left on this order." };

  try {
    await notifyAdmin("Edit request received", [
      `Order ${row.order_id} has requested edits.`,
      `${env.siteUrl()}/admin/orders/${row.order_id}`,
    ]);
  } catch {
    // Saved already; notification is best-effort.
  }
  return { attempt, ok: true, message: "Thank you. We've got your notes and will send your revised version soon." };
}
