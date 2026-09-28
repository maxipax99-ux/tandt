"use client";

import { useActionState } from "react";
import { submitQuestionnaire } from "@/actions/questionnaire";
import { Field, FormMessage, TextArea, TextInput, type FormState } from "@/components/form";
import { Button } from "@/components/ui";
import type { Question } from "@/config/questionnaires";
import { maxLength } from "@/config/questionnaires";

export function QuestionnaireForm({
  token,
  questions,
  afterSubmit,
}: {
  token: string;
  questions: Question[];
  afterSubmit: React.ReactNode;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitQuestionnaire, {});

  if (state.ok) {
    return (
      <div className="space-y-6">
        <FormMessage state={state} />
        {afterSubmit}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      {questions.map((q) => {
        const name = `a_${q.id}`;
        const error = state.errors?.[q.id];
        const label = q.required ? `${q.label} (required)` : q.label;
        if (q.type === "textarea") {
          return <TextArea key={q.id} name={name} label={label} hint={q.hint} error={error} required={q.required} maxLength={maxLength(q)} rows={5} />;
        }
        if (q.type === "select") {
          return (
            <Field key={q.id} label={label} name={name} hint={q.hint} error={error}>
              <select
                id={name}
                name={name}
                required={q.required}
                defaultValue=""
                aria-invalid={error ? true : undefined}
                aria-describedby={[q.hint ? `${name}-hint` : "", error ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined}
                className="mt-1 block w-full rounded-lg border border-muted/60 bg-surface px-3 py-2.5 text-base"
              >
                <option value="" disabled>Choose one…</option>
                {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          );
        }
        return (
          <TextInput
            key={q.id}
            name={name}
            label={label}
            hint={q.hint}
            error={error}
            required={q.required}
            type={q.type === "date" ? "date" : "text"}
            maxLength={maxLength(q)}
          />
        );
      })}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Send my answers"}</Button>
      <p className="text-sm text-muted">You can only submit once, so take your time. Anything you forget, we can cover on the call.</p>
    </form>
  );
}
