import "server-only";
import { db } from "@/lib/supabase/admin";
import { hashToken, looksLikeToken } from "@/lib/tokens";

export type TokenPurpose = "questionnaire" | "draft" | "final" | "deletion";

export interface TokenRow {
  id: string;
  order_id: string | null;
  deletion_request_id: string | null;
  purpose: TokenPurpose;
  expires_at: string;
  used_at: string | null;
}

/** Finds a valid (unexpired, and unused if single-use) token. Returns null for anything else. */
export async function findToken(
  token: string,
  purpose: TokenPurpose | TokenPurpose[],
  opts: { allowUsed?: boolean } = {},
) {
  if (!looksLikeToken(token)) return null;
  const { data } = await db()
    .from("access_tokens")
    .select("id, order_id, deletion_request_id, purpose, expires_at, used_at")
    .eq("token_hash", hashToken(token))
    .in("purpose", Array.isArray(purpose) ? purpose : [purpose])
    .maybeSingle<TokenRow>();
  if (!data) return null;
  if (Date.parse(data.expires_at) <= Date.now()) return null;
  if (data.used_at && !opts.allowUsed) return null;
  return data;
}

/** Atomically marks a single-use token as used. Returns false if someone got there first. */
export async function consumeToken(token: string, purpose: TokenPurpose): Promise<boolean> {
  const { data } = await db().rpc("consume_token", { p_hash: hashToken(token), p_purpose: purpose });
  return Boolean(data && (data as TokenRow).id);
}

export async function unconsumeToken(token: string) {
  await db().from("access_tokens").update({ used_at: null }).eq("token_hash", hashToken(token));
}
