"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { startCheckout } from "@/actions/checkout";
import { FormMessage, type FormState } from "@/components/form";
import { Turnstile } from "@/components/turnstile";
import { Button } from "@/components/ui";
import { ADD_ON_IDS, ADD_ONS, SERVICE_IDS, SERVICES, type AddOnId, type ServiceId } from "@/config/services";
import { addOnCents, formatUSD, priceOrder } from "@/lib/pricing";

export function OrderForm({ initialService }: { initialService: ServiceId }) {
  const [state, action, pending] = useActionState<FormState, FormData>(startCheckout, {});
  const [service, setService] = useState<ServiceId>(initialService);
  const [addOns, setAddOns] = useState<AddOnId[]>([]);
  // Display only — the server recalculates the price from config.
  const { totalCents } = priceOrder(service, addOns);

  return (
    <form action={action} className="space-y-10" noValidate>
      <FormMessage state={state} />

      <fieldset>
        <legend className="mb-4 font-serif text-2xl font-semibold">1. Choose your service</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {SERVICE_IDS.map((id) => (
            <label
              key={id}
              className="flex cursor-pointer gap-3 rounded-xl border border-line bg-surface p-4 has-[:checked]:border-accent has-[:checked]:ring-2 has-[:checked]:ring-accent"
            >
              <input
                type="radio"
                name="service"
                value={id}
                checked={service === id}
                onChange={() => setService(id)}
                className="mt-1.5 size-4 accent-accent"
              />
              <span>
                <span className="block font-semibold">
                  {SERVICES[id].name} · {formatUSD(SERVICES[id].priceCents)}
                </span>
                <span className="block text-sm text-muted">{SERVICES[id].examples}</span>
                <span className="block text-sm text-muted">{SERVICES[id].deliveryBusinessDays} business days</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-serif text-2xl font-semibold">2. Add extras (optional)</legend>
        <div className="space-y-3">
          {ADD_ON_IDS.map((id) => (
            <label key={id} className="flex cursor-pointer gap-3 rounded-xl border border-line bg-surface p-4 has-[:checked]:border-accent">
              <input
                type="checkbox"
                name="addOns"
                value={id}
                checked={addOns.includes(id)}
                onChange={(e) => setAddOns((cur) => (e.target.checked ? [...cur, id] : cur.filter((a) => a !== id)))}
                className="mt-1.5 size-4 accent-accent"
              />
              <span>
                <span className="block font-semibold">
                  {ADD_ONS[id].name} · +{formatUSD(addOnCents(id, service))}
                </span>
                <span className="block text-sm text-muted">{ADD_ONS[id].description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl border border-line bg-surface p-6">
        <p className="text-lg" aria-live="polite">
          Total: <strong className="text-2xl">{formatUSD(totalCents)}</strong>
        </p>
        <p className="mt-1 text-sm text-muted">
          Includes a questionnaire, 15-minute intake call, one draft and one round of edits.
        </p>

        <div className="mt-6">
          <label className="flex gap-3">
            <input
              type="checkbox"
              name="agree"
              required
              aria-invalid={state.errors?.agree ? true : undefined}
              aria-describedby={state.errors?.agree ? "agree-error" : undefined}
              className="mt-1.5 size-4 accent-accent"
            />
            <span>
              I am 18 or older and agree to the{" "}
              <Link href="/terms" target="_blank" className="text-accent underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" target="_blank" className="text-accent underline">Privacy Policy</Link>.
            </span>
          </label>
          {state.errors?.agree ? (
            <p id="agree-error" className="mt-1 text-sm font-medium text-red-800">{state.errors.agree}</p>
          ) : null}
        </div>

        <div className="mt-6">
          <Turnstile key={state.attempt ?? 0} action="checkout" />
        </div>

        <Button type="submit" disabled={pending} className="mt-4 w-full sm:w-auto">
          {pending ? "Starting secure checkout…" : "Continue to secure payment"}
        </Button>
        <p className="mt-3 text-sm text-muted">
          You&apos;ll pay on Stripe&apos;s secure page. We never see or store your card details.
        </p>
      </div>
    </form>
  );
}
