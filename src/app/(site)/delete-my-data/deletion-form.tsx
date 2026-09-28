"use client";

import { useActionState } from "react";
import { requestDeletion } from "@/actions/deletion";
import { FormMessage, TextArea, TextInput, type FormState } from "@/components/form";
import { Turnstile } from "@/components/turnstile";
import { Button } from "@/components/ui";

export function DeletionForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(requestDeletion, {});
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="max-w-xl space-y-5" noValidate>
      <FormMessage state={state} />
      <TextInput
        label="The email address you ordered with"
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        error={state.errors?.email}
      />
      <TextArea
        label="Anything we should know? (optional)"
        name="details"
        rows={3}
        maxLength={2000}
        hint="e.g. which order, or if you only want some information removed."
        error={state.errors?.details}
      />
      <Turnstile key={state.attempt ?? 0} action="deletion" />
      <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Request deletion"}</Button>
    </form>
  );
}
