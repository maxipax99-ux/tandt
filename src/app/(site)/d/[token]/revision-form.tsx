"use client";

import { useActionState } from "react";
import { requestRevision } from "@/actions/revision";
import { FormMessage, TextArea, type FormState } from "@/components/form";
import { Button } from "@/components/ui";

export function RevisionForm({ token, roundsLeft }: { token: string; roundsLeft: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(requestRevision, {});
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <TextArea
        name="feedback"
        label="What would you like changed?"
        hint={`Put all your changes in one message: this uses one of your ${roundsLeft} remaining edit round${roundsLeft === 1 ? "" : "s"}.`}
        rows={8}
        maxLength={8000}
        required
        error={state.errors?.feedback}
      />
      <Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send my edits"}</Button>
    </form>
  );
}
