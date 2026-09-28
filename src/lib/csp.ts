/**
 * Builds the Content-Security-Policy. Only our own origin plus the specific
 * third parties we use are allowed. Kept free of Node APIs so the proxy can use it.
 */
export function buildCsp(nonce: string, isDev: boolean): string {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'strict-dynamic' lets our nonced scripts load their own dependencies
    // (e.g. Turnstile); host entries are a fallback for older browsers.
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://challenges.cloudflare.com",
      "https://plausible.io",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", "https://challenges.cloudflare.com", "https://plausible.io", supabase].filter(Boolean),
    "frame-src": ["https://challenges.cloudflare.com", "https://cal.com", "https://app.cal.com", "https://calendly.com"],
    "form-action": ["'self'", "https://checkout.stripe.com"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const parts = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`);
  if (!isDev) parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}
