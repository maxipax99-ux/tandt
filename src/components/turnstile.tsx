"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile bot check. Adds a hidden "turnstileToken" field to the
 * surrounding form. Re-mount (change its `key`) after a failed submit, since
 * each token can only be used once.
 */
export function Turnstile({ action }: { action: string }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!ready || !siteKey || !ref.current || !window.turnstile) return;
    const id = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      action,
      theme: "light",
      "response-field-name": "turnstileToken",
    });
    return () => window.turnstile?.remove(id);
  }, [ready, siteKey, action]);

  if (!siteKey) {
    return process.env.NODE_ENV === "production" ? null : (
      <p className="text-sm text-muted">[Dev] Bot check disabled: NEXT_PUBLIC_TURNSTILE_SITE_KEY not set.</p>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />
      <div ref={ref} className="min-h-[65px]" />
    </>
  );
}
