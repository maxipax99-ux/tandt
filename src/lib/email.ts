import "server-only";
import { Resend } from "resend";
import { SITE } from "@/config/site";
import { env } from "@/lib/env";

/**
 * Transactional email only (no marketing). Without RESEND_API_KEY in
 * development, emails are printed to the terminal instead — without the
 * recipient address — so you can click the links while testing.
 */

interface Attachment {
  filename: string;
  content: Buffer;
}

interface Message {
  to: string;
  subject: string;
  /** Paragraphs of plain text. */
  paragraphs: string[];
  link?: { href: string; label: string };
  replyTo?: string;
  attachments?: Attachment[];
}

let resend: Resend | null = null;

export async function sendEmail(msg: Message): Promise<void> {
  const key = env.resendApiKey();
  if (!key) {
    if (env.isProd) throw new Error("RESEND_API_KEY is not set");
    console.info(`\n[email:dev] "${msg.subject}"${msg.link ? `\n  → ${msg.link.href}` : ""}\n`);
    return;
  }
  resend ??= new Resend(key);
  const { error } = await resend.emails.send({
    from: env.emailFrom(),
    to: msg.to,
    subject: msg.subject,
    replyTo: msg.replyTo,
    text: toText(msg),
    html: toHtml(msg),
    attachments: msg.attachments,
  });
  if (error) {
    // Log the error type only: never the recipient or content.
    console.error(`[email] send failed: ${error.name}`);
    throw new Error("Email failed to send");
  }
}

/** Sends to the owner, if ADMIN_NOTIFY_EMAIL is set. Keep these free of customer content. */
export async function notifyAdmin(subject: string, paragraphs: string[], replyTo?: string) {
  const to = env.adminNotifyEmail();
  if (!to) return;
  await sendEmail({ to, subject: `[${SITE.name}] ${subject}`, paragraphs, replyTo });
}

function toText(msg: Message): string {
  const parts = [...msg.paragraphs];
  if (msg.link) parts.push(`${msg.link.label}: ${msg.link.href}`);
  parts.push(`— ${SITE.name}`);
  return parts.join("\n\n");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toHtml(msg: Message): string {
  const body = msg.paragraphs
    .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const button = msg.link
    ? `<p style="margin:24px 0"><a href="${escapeHtml(msg.link.href)}" style="background:#97364a;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;display:inline-block">${escapeHtml(msg.link.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="font-family:Georgia,serif;color:#2b2522;background:#fbf7f1;padding:24px"><div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border-radius:12px">${body}${button}<p style="margin-top:32px;color:#5e544d">— ${escapeHtml(SITE.name)}</p></div></body></html>`;
}
