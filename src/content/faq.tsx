import Link from "next/link";
import type { FaqItem } from "@/components/faq";
import { SITE } from "@/config/site";

// TODO(owner): make this answer match exactly how you work. Honesty here matters more than polish.
export const AI_FAQ: FaqItem = {
  q: "Do you use AI?",
  a: (
    <>
      <p>
        A human writer writes your piece, and every word is read and shaped by a person who has listened to your
        stories. We may use AI writing tools privately behind the scenes, for example to brainstorm phrasings or
        check grammar, but never as a replacement for the listening, the structure, or the final edit.
      </p>
      <p className="mt-2">
        If we use an AI tool, we only share the details needed for your piece, we use providers that don&apos;t train
        on your content, and we list them in our <Link href="/privacy" className="underline">Privacy Policy</Link>.
        There is no AI chatbot on this website.
      </p>
    </>
  ),
};

export const GENERAL_FAQ: FaqItem[] = [
  AI_FAQ,
  {
    q: "How many revisions do I get?",
    a: "Every order includes one round of edits after your first draft. If you'd like more room to refine, you can add an extra revision round when ordering.",
  },
  {
    q: "What if I need it sooner?",
    a: "Choose Rush delivery and we'll aim to send your draft within 24–48 hours of receiving your questionnaire. Your delivery time starts once we receive your questionnaire.",
  },
  {
    q: "What is your refund policy?",
    a: (
      <>
        Full refund before your intake call, a partial refund after the first draft, and no refund after final
        delivery. The details are in our <Link href="/refunds" className="underline">Refund Policy</Link>.
      </>
    ),
  },
  {
    q: "Is what I share kept confidential?",
    a: `Yes. Only the writer working on your piece sees your answers. We never publish or reuse your stories, and your questionnaire answers, drafts and call notes are automatically deleted ${SITE.retentionDays} days after delivery.`,
  },
  {
    q: "Who owns the speech?",
    a: "You do. Once your order is paid in full, the final text is yours to deliver, print, share, or publish, with no credit to us required.",
  },
  {
    q: "Is the intake call recorded?",
    a: "Not unless you agree. If we ever ask to record a call, we'll ask everyone on the call for explicit permission when you book and again at the start of the call. You can always say no.",
  },
];
