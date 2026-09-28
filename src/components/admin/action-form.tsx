"use client";

import { useActionState, type ReactNode } from "react";
import type { ActionResult } from "@/actions/admin";
import { Button } from "@/components/ui";

/** Small wrapper for admin forms: runs a server action and shows its result. */
export function ActionForm({
  action,
  orderId,
  submitLabel,
  pendingLabel = "Working…",
  confirm,
  variant = "primary",
  children,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  orderId: string;
  submitLabel: string;
  pendingLabel?: string;
  confirm?: string;
  variant?: "primary" | "secondary" | "danger";
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="orderId" value={orderId} />
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant={variant} disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
        {state.message ? (
          <p role={state.ok ? "status" : "alert"} className={state.ok ? "text-green-800" : "text-red-800"}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
