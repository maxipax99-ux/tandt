import { timingSafeEqual } from "node:crypto";
import { SITE } from "@/config/site";
import { env } from "@/lib/env";
import { db } from "@/lib/supabase/admin";

/**
 * Daily retention job (scheduled in vercel.json). Vercel Cron calls this with
 * "Authorization: Bearer $CRON_SECRET"; anything else gets a 401.
 */
export async function GET(request: Request) {
  const secret = env.cronSecret();
  const given = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  if (
    !secret ||
    given.length !== expected.length ||
    !timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await db().rpc("purge_expired_content", { p_days: SITE.retentionDays });
  if (error) {
    console.error(`[cron/purge] failed: ${error.code}`);
    return new Response("Purge failed", { status: 500 });
  }
  console.info(`[cron/purge] purged content for ${data} order(s)`);
  return Response.json({ purgedOrders: data });
}
