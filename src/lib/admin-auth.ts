import "server-only";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { db } from "@/lib/supabase/admin";
import { authClient } from "@/lib/supabase/server";

export type AdminCheck =
  | { status: "ok"; userId: string }
  | { status: "signed-out" }
  | { status: "needs-mfa"; userId: string }
  | { status: "not-admin" };

/** Verifies the signed session JWT, the MFA level, and admin membership. */
export async function checkAdmin(): Promise<AdminCheck> {
  if (!env.supabaseConfigured()) return { status: "signed-out" };
  const supabase = await authClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return { status: "signed-out" };

  const { data: admin } = await db().from("admins").select("user_id").eq("user_id", claims.sub).maybeSingle();
  if (!admin) return { status: "not-admin" };
  if (claims.aal !== "aal2") return { status: "needs-mfa", userId: claims.sub };
  return { status: "ok", userId: claims.sub };
}

/**
 * Call at the top of EVERY admin page and admin server action.
 * Redirects anyone who isn't a signed-in admin with a verified second factor.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const result = await checkAdmin();
  switch (result.status) {
    case "ok":
      return { userId: result.userId };
    case "needs-mfa":
      redirect("/admin/mfa");
    case "not-admin": {
      const supabase = await authClient();
      await supabase.auth.signOut();
      redirect("/admin/login?reason=denied");
    }
    default:
      redirect("/admin/login");
  }
}
