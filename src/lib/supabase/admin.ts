import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Service-role client: bypasses Row Level Security, so it must only ever be
 * used on the server (the "server-only" import enforces this at build time).
 * All public tables deny the anon/authenticated roles; this is the only way in.
 */
export function db(): SupabaseClient {
  if (!client) {
    client = createClient(env.supabaseUrl(), env.supabaseServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
