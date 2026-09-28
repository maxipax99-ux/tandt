import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminSignOut } from "@/actions/admin-auth";
import { Container } from "@/components/ui";
import { checkAdmin } from "@/lib/admin-auth";
import { authClient } from "@/lib/supabase/server";
import { MfaEnroll, MfaVerify } from "./mfa-forms";

export const metadata: Metadata = { title: "Two-factor authentication" };

export default async function MfaPage() {
  const check = await checkAdmin();
  if (check.status === "ok") redirect("/admin");
  if (check.status !== "needs-mfa") redirect("/admin/login");

  const supabase = await authClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const factor = data?.totp[0];

  return (
    <Container className="max-w-md py-16">
      <h1 className="mb-6 text-3xl font-semibold">Two-factor authentication</h1>
      {factor ? <MfaVerify factorId={factor.id} /> : <MfaEnroll />}
      <form action={adminSignOut} className="mt-8">
        <button type="submit" className="text-sm text-muted underline">Cancel and sign out</button>
      </form>
    </Container>
  );
}
