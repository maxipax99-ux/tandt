"use client";

import { useActionState, useState, useTransition } from "react";
import { startMfaEnrollment, verifyMfa } from "@/actions/admin-auth";
import { FormMessage, TextInput, type FormState } from "@/components/form";
import { Button } from "@/components/ui";

function CodeForm({ factorId }: { factorId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(verifyMfa, {});
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="factorId" value={factorId} />
      <TextInput
        label="6-digit code from your authenticator app"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{6}"
        maxLength={6}
        required
      />
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Checking…" : "Verify"}</Button>
    </form>
  );
}

export function MfaVerify({ factorId }: { factorId: string }) {
  return <CodeForm factorId={factorId} />;
}

export function MfaEnroll() {
  const [enrollment, setEnrollment] = useState<{ factorId?: string; qr?: string; secret?: string; error?: string }>();
  const [pending, start] = useTransition();

  if (!enrollment?.factorId) {
    return (
      <div className="space-y-4">
        <p>Two-factor authentication is required for admin access. You&apos;ll need an authenticator app such as 1Password, Google Authenticator or Authy.</p>
        {enrollment?.error ? <p role="alert" className="text-red-800">{enrollment.error}</p> : null}
        <Button disabled={pending} onClick={() => start(async () => setEnrollment(await startMfaEnrollment()))}>
          {pending ? "Preparing…" : "Set up authenticator"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ol className="list-decimal space-y-2 pl-5">
        <li>Scan this QR code with your authenticator app.</li>
        <li>Enter the 6-digit code it shows.</li>
      </ol>
      {/* eslint-disable-next-line @next/next/no-img-element -- data: URI SVG from Supabase */}
      <img src={enrollment.qr} alt="QR code for your authenticator app" width={200} height={200} className="rounded-lg bg-white p-2" />
      <p className="text-sm text-muted">
        Can&apos;t scan? Enter this key manually: <code className="break-all font-mono">{enrollment.secret}</code>
      </p>
      <CodeForm factorId={enrollment.factorId} />
    </div>
  );
}
