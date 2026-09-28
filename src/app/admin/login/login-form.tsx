"use client";

import { useActionState } from "react";
import { adminSignIn } from "@/actions/admin-auth";
import { FormMessage, TextInput, type FormState } from "@/components/form";
import { Button } from "@/components/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(adminSignIn, {});
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <TextInput label="Email" name="email" type="email" autoComplete="username" required />
      <TextInput label="Password" name="password" type="password" autoComplete="current-password" required />
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}
