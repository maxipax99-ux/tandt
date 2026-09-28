import type { Metadata } from "next";
import { BookingEmbed } from "@/components/booking-embed";
import { LinkExpired } from "@/components/link-expired";
import { Container, PageHeader } from "@/components/ui";
import { QUESTIONNAIRES } from "@/config/questionnaires";
import { SERVICES, type ServiceId } from "@/config/services";
import { SITE } from "@/config/site";
import { env } from "@/lib/env";
import { questionsFor } from "@/lib/questionnaire";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { db } from "@/lib/supabase/admin";
import { findToken } from "@/lib/token-lookup";
import { QuestionnaireForm } from "./questionnaire-form";

export const metadata: Metadata = { title: "Your questionnaire", robots: { index: false, follow: false } };

export default async function QuestionnairePage({ params }: PageProps<"/q/[token]">) {
  const { token } = await params;
  if (!(await rateLimit("tokenPage", await clientIp())).ok) return <LinkExpired />;

  const row = await findToken(token, "questionnaire");
  if (!row?.order_id) return <LinkExpired what="questionnaire link" />;
  const { data: order } = await db().from("orders").select("service, status").eq("id", row.order_id).single();
  if (!order || order.status === "cancelled") return <LinkExpired what="questionnaire link" />;

  const service = order.service as ServiceId;
  const set = QUESTIONNAIRES[service];
  const bookingUrl = env.bookingUrl();

  return (
    <div data-mood={SERVICES[service].mood} className="bg-bg text-ink">
      <PageHeader title={set.title} intro={set.intro} />
      <Container className="max-w-3xl pb-16">
        <aside className="mb-8 rounded-2xl border border-line bg-surface p-5 text-sm text-muted" aria-label="How your stories are used">
          <h2 className="mb-1 font-sans text-base font-semibold text-ink">How we use what you share</h2>
          <p>
            Your answers are private. They&apos;re seen only by the writer working on your piece and used only to write
            it. We never publish or reuse your stories. Your answers, call notes and drafts are deleted automatically{" "}
            {SITE.retentionDays} days after delivery. You can ask us to delete them sooner at any time.
          </p>
        </aside>
        <QuestionnaireForm
          token={token}
          questions={questionsFor(service)}
          afterSubmit={
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Next: book your 15-minute call</h2>
              {bookingUrl ? (
                <BookingEmbed url={bookingUrl} />
              ) : (
                <p>We&apos;ll email you shortly with times for your call.</p>
              )}
              <p className="text-sm text-muted">
                We&apos;ve also emailed you this booking link. Calls are only recorded with the permission of everyone on
                the call, and we&apos;ll ask again at the start.
              </p>
            </div>
          }
        />
      </Container>
    </div>
  );
}
