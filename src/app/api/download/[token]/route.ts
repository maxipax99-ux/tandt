import { SERVICES, type ServiceId } from "@/config/services";
import { documentFilename, toDocx, toPdf } from "@/lib/documents";
import { rateLimit } from "@/lib/ratelimit";
import { ipFromHeaders } from "@/lib/request";
import { db } from "@/lib/supabase/admin";
import { findToken } from "@/lib/token-lookup";

/** Downloads the final piece as PDF or DOCX. Requires a valid, unexpired "final" link token. */
export async function GET(request: Request, ctx: RouteContext<"/api/download/[token]">) {
  const { token } = await ctx.params;
  const format = new URL(request.url).searchParams.get("format");
  if (format !== "pdf" && format !== "docx") return new Response("Bad request", { status: 400 });
  if (!(await rateLimit("download", ipFromHeaders(request.headers))).ok) {
    return new Response("Too many requests", { status: 429 });
  }

  const row = await findToken(token, "final", { allowUsed: true });
  if (!row?.order_id) return new Response("Link expired", { status: 404 });

  const [{ data: order }, { data: draft }] = await Promise.all([
    db().from("orders").select("service, content_purged_at").eq("id", row.order_id).single(),
    db()
      .from("drafts")
      .select("body")
      .eq("order_id", row.order_id)
      .eq("is_final", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!order || order.content_purged_at || !draft) return new Response("Link expired", { status: 404 });

  const service = SERVICES[order.service as ServiceId];
  const file = format === "pdf" ? await toPdf(service.name, draft.body) : await toDocx(service.name, draft.body);
  const type =
    format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${documentFilename(service.shortName, format)}"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
