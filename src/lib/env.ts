import "server-only";

/**
 * Server-side environment access. Every secret is read here and only here,
 * so it's easy to audit that nothing secret reaches the browser.
 *
 * Integrations are optional in development (the site still runs so you can
 * work on pages), but in production a missing required value fails loudly.
 */

const isProd = process.env.NODE_ENV === "production";

function read(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

function required(name: string): string {
  const v = read(name);
  if (!v) throw new Error(`Missing required environment variable ${name}. See .env.example.`);
  return v;
}

export const env = {
  isProd,
  siteUrl: () => (read("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000").replace(/\/$/, ""),

  stripeSecretKey: () => required("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => required("STRIPE_WEBHOOK_SECRET"),
  stripeConfigured: () => Boolean(read("STRIPE_SECRET_KEY")),

  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseConfigured: () =>
    Boolean(read("NEXT_PUBLIC_SUPABASE_URL") && read("NEXT_PUBLIC_SUPABASE_ANON_KEY") && read("SUPABASE_SERVICE_ROLE_KEY")),

  resendApiKey: () => read("RESEND_API_KEY"),
  emailFrom: () => read("EMAIL_FROM") ?? "Toast & Tribute <onboarding@resend.dev>",
  adminNotifyEmail: () => read("ADMIN_NOTIFY_EMAIL"),

  turnstileSecret: () => read("TURNSTILE_SECRET_KEY"),

  upstashUrl: () => read("UPSTASH_REDIS_REST_URL"),
  upstashToken: () => read("UPSTASH_REDIS_REST_TOKEN"),

  bookingUrl: () => read("BOOKING_URL"),
  cronSecret: () => read("CRON_SECRET"),
};
