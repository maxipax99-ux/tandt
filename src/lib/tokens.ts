import "server-only";
import { createHash, randomBytes } from "node:crypto";

/**
 * Secret link tokens (questionnaire, draft, final, deletion verification).
 * 32 random bytes → 43-char URL-safe string. Only the SHA-256 hash is stored,
 * so a database leak doesn't reveal working links.
 */
export function newToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Cheap shape check before touching the database. */
export function looksLikeToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
