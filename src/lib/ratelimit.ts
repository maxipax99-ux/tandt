import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

/**
 * Rate limits per action. Uses Upstash Redis when configured (shared across
 * all server instances). Without it, falls back to an in-memory limiter that
 * only protects a single instance — fine for local development, but set up
 * Upstash before launch (see README).
 */
const LIMITS = {
  checkout: { tokens: 10, window: "10 m" },
  contact: { tokens: 5, window: "1 h" },
  deletion: { tokens: 5, window: "1 h" },
  questionnaire: { tokens: 20, window: "1 h" },
  draftFeedback: { tokens: 10, window: "1 h" },
  tokenPage: { tokens: 60, window: "10 m" },
  adminLogin: { tokens: 10, window: "15 m" },
  download: { tokens: 30, window: "10 m" },
} as const;

export type LimitName = keyof typeof LIMITS;
type Duration = `${number} ${"s" | "m" | "h" | "d"}`;

function toMs(window: Duration): number {
  const [n, unit] = window.split(" ") as [string, "s" | "m" | "h" | "d"];
  return Number(n) * { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
}

const upstash = new Map<LimitName, Ratelimit>();
const memory = new Map<string, { count: number; resetAt: number }>();
let warned = false;

export async function rateLimit(name: LimitName, key: string): Promise<{ ok: boolean }> {
  const { tokens, window } = LIMITS[name];
  const url = env.upstashUrl();
  const token = env.upstashToken();

  if (url && token) {
    let limiter = upstash.get(name);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(tokens, window as Duration),
        prefix: `tt:${name}`,
      });
      upstash.set(name, limiter);
    }
    const { success } = await limiter.limit(key);
    return { ok: success };
  }

  if (env.isProd && !warned) {
    warned = true;
    console.warn("[ratelimit] Upstash not configured; using per-instance memory limiter.");
  }
  const id = `${name}:${key}`;
  const now = Date.now();
  const entry = memory.get(id);
  if (!entry || entry.resetAt < now) {
    memory.set(id, { count: 1, resetAt: now + toMs(window as Duration) });
    if (memory.size > 10_000) {
      for (const [k, v] of memory) if (v.resetAt < now) memory.delete(k);
    }
    return { ok: true };
  }
  entry.count++;
  return { ok: entry.count <= tokens };
}
