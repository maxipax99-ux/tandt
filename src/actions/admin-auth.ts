"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/form";
import { SITE } from "@/config/site";
import { ADMIN_SEEN_COOKIE } from "@/lib/admin-cookie";
import { checkAdmin } from "@/lib/admin-auth";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/request";
import { db } from "@/lib/supabase/admin";
import { authClient } from "@/lib/supabase/server";
import { adminLoginSchema, mfaCodeSchema } from "@/lib/validation";

const GENERIC = "Email or password is incorrect.";

async function markActive() {
  (await cookies()).set(ADMIN_SEEN_COOKIE, String(Date.now()), {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "strict",
    path: "/admin",
    maxAge: SITE.adminIdleMinutes * 60,
  });
}

export async function adminSignIn(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!env.supabaseConfigured()) return { message: "Supabase isn't configured yet. See README." };
  const ip = await clientIp();
  if (!(await rateLimit("adminLogin", ip)).ok) return { message: "Too many attempts. Try again in 15 minutes." };

  const parsed = adminLoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { message: GENERIC };

  const supabase = await authClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { message: GENERIC };

  // Only accounts in the admins table may continue. Don't reveal which part failed.
  const { data: admin } = await db().from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return { message: GENERIC };
  }

  await markActive();
  redirect("/admin/mfa");
}

/** Starts TOTP enrollment for an admin with no verified factor yet. Returns the QR code to scan. */
export async function startMfaEnrollment(): Promise<{ factorId?: string; qr?: string; secret?: string; error?: string }> {
  const check = await checkAdmin();
  if (check.status !== "needs-mfa") return { error: "Please sign in again." };
  const supabase = await authClient();

  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp.length) return { error: "An authenticator is already set up. Enter its code instead." };
  // Clear abandoned, unverified enrollments first.
  for (const f of factors?.all ?? []) {
    if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `${SITE.name} admin` });
  if (error || !data) return { error: "Couldn't start setup. Please try again." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyMfa(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = await clientIp();
  if (!(await rateLimit("adminLogin", ip)).ok) return { message: "Too many attempts. Try again in 15 minutes." };

  const parsed = mfaCodeSchema.safeParse({ factorId: formData.get("factorId"), code: formData.get("code") });
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Invalid code." };

  const check = await checkAdmin();
  if (check.status === "ok") redirect("/admin");
  if (check.status !== "needs-mfa") redirect("/admin/login");

  const supabase = await authClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify(parsed.data);
  if (error) return { message: "That code didn't work. Check your authenticator app and try again." };

  await markActive();
  redirect("/admin");
}

export async function adminSignOut() {
  if (env.supabaseConfigured()) {
    const supabase = await authClient();
    await supabase.auth.signOut();
  }
  (await cookies()).delete({ name: ADMIN_SEEN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}

