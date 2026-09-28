"use client";

import { useActionState } from "react";
import { confirmDeletion } from "@/actions/deletion";
import { FormMessage, type FormState } from "@/components/form";
import { Button } from "@/components/ui";

export function ConfirmDeletionForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(confirmDeletion, {});
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <Button type="submit" disabled={pending}>{pending ? "Confirming…" : "Yes, delete my data"}</Button>
    </form>
  );
}
