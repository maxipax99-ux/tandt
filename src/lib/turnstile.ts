import "server-only";
import { env } from "@/lib/env";

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * In development without keys it passes (so you can work offline); in
 * production a missing secret fails closed.
 */
export async function verifyTurnstile(token: string | undefined | null, ip?: string): Promise<boolean> {
  const secret = env.turnstileSecret();
  if (!secret) {
    if (env.isProd) {
      console.error("[turnstile] TURNSTILE_SECRET_KEY missing in production; rejecting form.");
      return false;
    }
    return true;
  }
  if (!token || token.length > 2048) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== "unknown") body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    console.error("[turnstile] verification request failed");
    return false;
  }
}
