"use client";

import { useActionState } from "react";
import { sendContact } from "@/actions/contact";
import { FormMessage, TextArea, TextInput, type FormState } from "@/components/form";
import { Turnstile } from "@/components/turnstile";
import { Button } from "@/components/ui";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContact, {});

  if (state.ok) return <FormMessage state={state} />;

  return (
    <form action={action} className="max-w-xl space-y-5" noValidate>
      <FormMessage state={state} />
      <TextInput label="Your name" name="name" autoComplete="name" required maxLength={100} error={state.errors?.name} />
      <TextInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        error={state.errors?.email}
      />
      <TextArea label="Message" name="message" required maxLength={5000} rows={6} error={state.errors?.message} />
      <Turnstile key={state.attempt ?? 0} action="contact" />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
