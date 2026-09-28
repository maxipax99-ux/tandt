import type { Metadata } from "next";
import { LinkExpired } from "@/components/link-expired";
import { Container, Notice, PageHeader } from "@/components/ui";
import { SERVICES, type ServiceId } from "@/config/services";
import { SITE } from "@/config/site";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { db } from "@/lib/supabase/admin";
import { findToken } from "@/lib/token-lookup";
import { RevisionForm } from "./revision-form";

export const metadata: Metadata = { title: "Your draft", robots: { index: false, follow: false } };

export default async function DraftPage({ params }: PageProps<"/d/[token]">) {
  const { token } = await params;
  if (!(await rateLimit("tokenPage", await clientIp())).ok) return <LinkExpired />;

  const row = await findToken(token, ["draft", "final"], { allowUsed: true });
  if (!row?.order_id) return <LinkExpired />;

  const { data: order } = await db()
    .from("orders")
    .select("service, status, revisions_allowed, revisions_used, content_purged_at")
    .eq("id", row.order_id)
    .single();
  if (!order || order.content_purged_at || order.status === "cancelled") return <LinkExpired />;

  const isFinal = row.purpose === "final";
  let query = db().from("drafts").select("body, version").eq("order_id", row.order_id).not("sent_at", "is", null);
  if (isFinal) query = query.eq("is_final", true);
  const { data: draft } = await query.order("version", { ascending: false }).limit(1).maybeSingle();
  if (!draft) return <LinkExpired />;

  const service = order.service as ServiceId;
  const roundsLeft = order.revisions_allowed - order.revisions_used;

  return (
    <div data-mood={SERVICES[service].mood} className="bg-bg text-ink">
      <PageHeader
        eyebrow={isFinal ? "Final version" : `Draft ${draft.version}`}
        title={`Your ${SERVICES[service].shortName.toLowerCase()}`}
      />
      <Container className="max-w-3xl space-y-10 pb-16">
        {isFinal ? (
          <div className="flex flex-wrap gap-3">
            <a href={`/api/download/${token}?format=pdf`} className="inline-flex min-h-11 items-center rounded-full bg-accent px-6 py-2.5 font-medium text-accent-ink">
              Download PDF
            </a>
            <a href={`/api/download/${token}?format=docx`} className="inline-flex min-h-11 items-center rounded-full border border-accent px-6 py-2.5 font-medium text-accent">
              Download Word (.docx)
            </a>
          </div>
        ) : null}

        <article className="rounded-2xl border border-line bg-surface p-6 sm:p-10">
          {/* Plain text rendering (React escapes it); paragraphs split on blank lines. */}
          {draft.body.split(/\n{2,}/).map((p: string, i: number) => (
            <p key={i} className="mb-5 whitespace-pre-line font-serif text-xl leading-relaxed last:mb-0">{p}</p>
          ))}
        </article>

        {isFinal ? (
          <p className="text-muted">
            Please save a copy: this page is available for {SITE.finalLinkDays} days, and we delete our copy of your
            stories and drafts {SITE.retentionDays} days after delivery.
          </p>
        ) : order.status === "revising" ? (
          <Notice>We have your edit request and we&apos;re working on it. We&apos;ll email you when the new version is ready.</Notice>
        ) : order.status === "draft_sent" && roundsLeft > 0 ? (
          <section aria-labelledby="edits-h">
            <h2 id="edits-h" className="mb-3 text-2xl font-semibold">Request edits</h2>
            <RevisionForm token={token} roundsLeft={roundsLeft} />
          </section>
        ) : order.status === "draft_sent" ? (
          <Notice>
            You&apos;ve used your included edit rounds. If something still isn&apos;t right, email us at {SITE.contactEmail} and
            we&apos;ll talk it through.
          </Notice>
        ) : null}
      </Container>
    </div>
  );
}
