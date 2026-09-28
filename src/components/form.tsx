import type { ComponentProps, ReactNode } from "react";

export interface FormState {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Increments on every submit so the bot check can be re-rendered. */
  attempt?: number;
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-muted/60 bg-surface px-3 py-2.5 text-base text-ink placeholder:text-muted/80 aria-[invalid=true]:border-red-700";

export function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium">
        {label}
      </label>
      {hint ? (
        <p id={`${name}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(name: string, error?: string, hint?: string) {
  return [hint ? `${name}-hint` : null, error ? `${name}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function TextInput({
  label,
  name,
  error,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; name: string; error?: string; hint?: string }) {
  return (
    <Field label={label} name={name} error={error} hint={hint}>
      <input
        id={name}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={inputClass}
        {...props}
      />
    </Field>
  );
}

export function TextArea({
  label,
  name,
  error,
  hint,
  ...props
}: ComponentProps<"textarea"> & { label: string; name: string; error?: string; hint?: string }) {
  return (
    <Field label={label} name={name} error={error} hint={hint}>
      <textarea
        id={name}
        name={name}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(name, error, hint)}
        className={inputClass}
        {...props}
      />
    </Field>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={`rounded-lg border p-4 ${state.ok ? "border-green-700 bg-green-50 text-green-900" : "border-red-700 bg-red-50 text-red-900"}`}
    >
      {state.message}
    </div>
  );
}
