# Toast & Tribute

A done-for-you writing service for life's big moments: wedding speeches, eulogies, obituaries and milestone toasts. Customers pay, fill in a questionnaire, book a short call, and receive a personal, ready-to-deliver piece.

This README walks you through launching it, **even if you're not a developer**. Budget an afternoon. You'll create a few free accounts, copy some keys into Vercel, and click a few buttons.

---

## Contents

1. [What's in the box](#1-whats-in-the-box)
2. [Before launch: the owner checklist](#2-before-launch-the-owner-checklist)
3. [Accounts you'll need, and what they cost](#3-accounts-you-need-and-what-they-cost)
4. [Step-by-step setup](#4-step-by-step-setup)
5. [Going live (switching Stripe to live mode)](#5-going-live)
6. [Day-to-day: running orders](#6-day-to-day-running-orders)
7. [Changing prices, services and questions](#7-changing-prices-services-and-questions)
8. [For developers](#8-for-developers)
9. [Security and privacy design](#9-security-and-privacy-design)

---

## 1. What's in the box

**Public site:** Home, Weddings & Celebrations, Memorials (a quieter design), Other Occasions, Pricing, How It Works, Samples, FAQ, About, Contact, Order, plus the Privacy Policy, Terms of Service, Refund Policy, Accessibility Statement and a "Request my data deletion" form.

**Order flow:**

1. The customer picks a service and add-ons and pays on Stripe's secure checkout page.
2. Stripe tells the site the payment went through. The site creates the order and emails a private questionnaire link, which works once and expires in 14 days.
3. The customer fills in the questionnaire. They get an email with your booking link for the 15-minute call, and you get a notification.
4. You write the draft in the admin area and click **Send draft**. The customer gets a private link, valid for 7 days, to read it and request edits.
5. You click **Send final & mark delivered**. The customer gets the text on a web page, plus PDF and Word copies attached to the email.
6. 90 days after delivery, the questionnaire answers, drafts, edit requests and call notes are **deleted automatically**. Only the order number, service, amount, date and email are kept, for tax and refund records.

**Admin area** (`/admin`): This needs your password **and** a 6-digit code from an authenticator app. It has an orders dashboard (rush orders first, due-date countdown, filter by status or email), an order page (answers, call notes, draft editor, send draft, send final), and a data retention page.

---

## 2. Before launch: the owner checklist

- [ ] **Have a lawyer review** the Privacy Policy, Terms, Refund Policy and Accessibility Statement (`src/app/(site)/privacy`, `terms`, `refunds`, `accessibility`). Fill in every `[… — TODO]`, then remove the yellow "Have a lawyer review" banner from each page (`<LawyerReviewBanner />`).
- [ ] Put your business name, email, legal entity, address and governing law in **`src/config/site.ts`**.
- [ ] Decide your partial-refund amounts and put them in the Refund Policy.
- [ ] Make the **"Do you use AI?"** answer (`src/content/faq.tsx`) match exactly how you work. If you use an AI tool, name it in the Privacy Policy.
- [ ] Replace placeholder testimonials (home page), samples (`/samples`, fictional names only) and your About page.
- [ ] If you'll record intake calls, add a consent question to your Cal.com/Calendly booking form too. The questionnaire already asks, and you must ask again at the start of each call.
- [ ] Do a full test order in Stripe **test mode** (section 4.8).

---

## 3. Accounts you need, and what they cost

Prices change, so check each provider's pricing page. These were the rough numbers at the time of writing.

| Service | What it does here | Free tier | Where to set a budget / alert |
|---|---|---|---|
| **GitHub** | Stores the code | Free | — |
| **Vercel** | Hosts the site, runs the daily clean-up job | Hobby is free but is for **non-commercial** use. A paying business should use **Pro (~$20/month)**. | Vercel → Team Settings → **Billing → Spend Management**: turn on, set a hard limit, tick "pause projects". |
| **Supabase** | Database + admin login | Free: ~500 MB database. Free projects **pause after ~1 week with no activity**, so upgrade to Pro (~$25/mo) once you have regular orders. | Supabase → Organization → **Billing → Spend cap**: keep it **on**. |
| **Stripe** | Payments | No monthly fee; per-transaction fees (US cards ~2.9% + 30¢). Stripe Tax costs extra per transaction if you turn it on. | Nothing to cap. |
| **Resend** | Sends order emails | Free: ~3,000 emails/month, 100/day | Resend → **Usage**: watch it; you'll get warning emails near the limit. |
| **Cloudflare Turnstile** | Bot check on forms | Free | — |
| **Upstash Redis** | Rate limiting (stops bots) | Free tier (hundreds of thousands of requests/month) | Upstash → database → **Budget** / plan: stay on free or set a max budget. |
| **Cal.com** or **Calendly** | Booking the intake call | Free plans available | — |
| **Plausible** (optional) | Cookieless visitor stats | Paid (~$9/mo). Or use free **Vercel Analytics** instead. | — |

There is **no AI API** in this site, so there's no way for strangers to run up an AI bill.

---

## 4. Step-by-step setup

Throughout, **"add an environment variable"** means: Vercel → your project → **Settings → Environment Variables** → add the name and value, tick Production (and Preview if you like), and save. Names are listed in [`.env.example`](.env.example). **Never put real keys in the code or in GitHub.**

### 4.1 Supabase (database + admin login)

1. Create a project at [supabase.com](https://supabase.com). Save the database password somewhere safe.
2. Open **SQL Editor → New query**, paste the whole of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and click **Run**. This creates the tables and locks them so that only the server can read them.
3. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up". Keep Email enabled.
4. **Authentication → Multi-Factor**: make sure **TOTP (app authenticator)** is enabled.
5. **Authentication → Users → Add user → Create new user**: enter your email and a long, unique password, and tick "Auto confirm". Copy the new user's **UID**.
6. Back in **SQL Editor**, run this with your UID:
   ```sql
   insert into public.admins (user_id) values ('PASTE-YOUR-UID-HERE');
   ```
7. **Project Settings → API**: copy these into environment variables:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` / secret key → `SUPABASE_SERVICE_ROLE_KEY` (**secret, never share it**)

### 4.2 Stripe (payments, test mode first)

1. Create an account at [stripe.com](https://stripe.com). Leave the **Test mode** toggle on for now.
2. **Developers → API keys**: copy the **Secret key** (`sk_test_…`) into `STRIPE_SECRET_KEY`.
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR-DOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`
   - Copy its **Signing secret** (`whsec_…`) into `STRIPE_WEBHOOK_SECRET`.
4. Optional: to charge sales tax, set up **Stripe Tax** in the dashboard, then set `STRIPE_AUTOMATIC_TAX=true`.
5. **Settings → Business → Customer emails**: turn on "Successful payments" so customers get receipts.

### 4.3 Resend (email)

1. Create an account at [resend.com](https://resend.com) and **add your domain** (Domains → Add). Add the DNS records it shows you at your domain registrar, then wait until the domain is verified.
2. **API Keys → Create** (Sending access) → `RESEND_API_KEY`.
3. `EMAIL_FROM` = e.g. `Toast & Tribute <hello@yourdomain.com>` (must use your verified domain).
4. `ADMIN_NOTIFY_EMAIL` = where you want new-order and questionnaire notifications to go.

### 4.4 Cloudflare Turnstile (bot check)

1. At [dash.cloudflare.com](https://dash.cloudflare.com), go to **Turnstile → Add widget**. Add your domain (and `localhost` for testing) and choose **Managed**.
2. Site key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; Secret key → `TURNSTILE_SECRET_KEY`.

### 4.5 Upstash (rate limiting)

1. At [upstash.com](https://upstash.com), create a **Redis** database (any region near your Vercel region).
2. Copy **REST URL** → `UPSTASH_REDIS_REST_URL` and **REST Token** → `UPSTASH_REDIS_REST_TOKEN`.

### 4.6 Booking link

Create a 15-minute event type in Cal.com or Calendly and put its public link in `BOOKING_URL` (e.g. `https://cal.com/yourname/intake`).

### 4.7 Vercel (hosting)

1. Put this code in a GitHub repository. At [vercel.com](https://vercel.com), click **Add New → Project** and import it. The defaults are fine.
2. Add all the environment variables above, plus:
   - `NEXT_PUBLIC_SITE_URL` = your site address, e.g. `https://toastandtribute.com` (no trailing slash)
   - `CRON_SECRET` = a long random string (e.g. from a password manager). Vercel uses it to run the daily 90-day clean-up job in `vercel.json`.
   - Optional: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, or turn on Vercel **Analytics** (cookieless) in the project instead.
3. **Deploy**. Then add your domain under **Settings → Domains**. Vercel sets up HTTPS automatically.
4. Turn on **Spend Management** (see the table in section 3).
5. Check **Settings → Cron Jobs** lists `/api/cron/purge`.

### 4.8 Test everything (still in Stripe test mode)

1. Visit your site, go to **Order**, pick a service, and pay with Stripe's test card **4242 4242 4242 4242**, any future date, and any CVC.
2. Check your email for the questionnaire link. Fill it in, and check you get the booking email.
3. Go to `/admin`, sign in, and scan the QR code with your authenticator app (first time only). The order should be on the dashboard.
4. Open the order, paste a draft, **Save draft**, **Send draft**. Open the customer email, request an edit, then **Save draft** again and **Send final & mark delivered**. Check the PDF and Word attachments.
5. Try **Request data deletion** from the footer.

If something doesn't arrive, check Vercel → your project → **Logs**, and Stripe → Developers → Webhooks → your endpoint → recent deliveries.

---

## 5. Going live

When your test order works end to end:

1. In Stripe, switch off **Test mode**, finish account activation (bank details, identity).
2. **Developers → API keys** (live): replace `STRIPE_SECRET_KEY` in Vercel with the `sk_live_…` key.
3. **Developers → Webhooks** (live): add the same endpoint and events again; replace `STRIPE_WEBHOOK_SECRET` with the new live signing secret.
4. In Vercel → **Deployments**, redeploy the latest deployment so the new keys take effect.
5. Place one real low-value order yourself (you can refund it from Stripe; the order will be marked cancelled automatically).

---

## 6. Day-to-day: running orders

- **Dashboard** (`/admin`): open orders, **rush orders first** (highlighted), then by due date. The due date is counted from when the questionnaire arrives: business days for standard orders, 48 hours for rush. Filter by status, or search by customer email.
- **Statuses** change automatically: paid → questionnaire received → drafting (when you save a draft) → draft sent → revising (when the customer asks for edits) → delivered. Set **Call booked** yourself after the call is booked, and **Cancelled / refunded** when needed. Refunds made in Stripe also cancel the order automatically.
- **Questionnaire link expired?** On the order page, click **Email a new questionnaire link**.
- **Deletion requests** show up on **Data retention** once the customer confirms by email. Find their orders with **Find orders**, use **Delete content now** on each, then **Mark done**.
- You're signed out of the admin area after **30 minutes** of inactivity, and after 12 hours in any case.

---

## 7. Changing prices, services and questions

- **Prices, services, add-ons, delivery times:** [`src/config/services.ts`](src/config/services.ts). Prices are in cents (`19900` = $199). The pricing tables and checkout all read from here.
- **Questionnaire questions:** [`src/config/questionnaires.ts`](src/config/questionnaires.ts).
- **Business details, link lifetimes, retention period, admin timeouts:** [`src/config/site.ts`](src/config/site.ts).
- Page wording lives in `src/app/(site)/…/page.tsx` (and `src/app/(memorial)/memorials/page.tsx`).

After editing, commit to GitHub; Vercel redeploys automatically.

---

## 8. For developers

```bash
cp .env.example .env.local   # fill in test keys
npm install
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + unit tests
npm run build
```

- Next.js 16 (App Router, `src/proxy.ts` instead of middleware), TypeScript strict mode, Tailwind CSS 4, Zod 4.
- Without `RESEND_API_KEY` in development, emails are printed to the terminal, including their links, so you can test flows. Without Turnstile keys in development, the bot check is skipped. In production both fail closed.
- Test webhooks locally with the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:3000/api/stripe/webhook` (use the `whsec_…` it prints).
- The database schema is in `supabase/migrations/`. Add new files for schema changes rather than editing `0001_init.sql` after launch.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, build, `npm audit --audit-level=high`, and a gitleaks secret scan. Dependabot opens weekly update PRs.

**Project layout**

```
src/
  config/         services & prices, questionnaires, site settings  ← edit these
  app/(site)/     public pages, order flow, questionnaire (/q), draft/final (/d)
  app/(memorial)/ memorial pages (quiet palette)
  app/admin/      admin login, MFA, dashboard, order detail, retention
  app/api/        Stripe webhook, file downloads, daily purge cron
  actions/        server actions (every one validates input with Zod)
  lib/            security helpers, email, Stripe, Supabase, pricing, PDF/DOCX
  proxy.ts        per-request CSP nonce + admin session timeout
supabase/migrations/  database schema (RLS on every table)
```

---

## 9. Security and privacy design

- **Payments:** Stripe Checkout's hosted page. Card data never touches this server. Prices are always looked up server-side from `src/config/services.ts`. The webhook verifies Stripe's signature and is idempotent.
- **Database:** Row Level Security is on for every table, with no policies for public roles and their privileges revoked. Only the server (service-role key, `server-only` modules) can read or write.
- **Admin:** Supabase Auth with a password **and** TOTP MFA (AAL2) required, plus an `admins` allow-list checked server-side on every admin page and action. There is a 30-minute idle timeout, a 12-hour maximum session, and rate-limited sign-in.
- **Secret links:** 32 random bytes; only a SHA-256 hash is stored. They expire after 14 days (questionnaire, single-use), 7 days (draft), 30 days (final) and 24 hours (deletion confirmation, single-use).
- **Every form and API route:** Zod validation, size limits, rate limiting (Upstash), and Turnstile on public forms.
- **Headers:** a nonce-based Content-Security-Policy allowing only Stripe, Turnstile, Cal.com/Calendly and Plausible; plus HSTS, `X-Frame-Options: DENY`, `nosniff`, `strict-origin-when-cross-origin` and a Permissions-Policy that disables camera, microphone and geolocation.
- **No `dangerouslySetInnerHTML`:** all customer text is rendered as escaped text. Logs never include emails, questionnaire content or payment data.
- **No file uploads, and no public AI endpoints.**
- **Retention:** a daily cron (`/api/cron/purge`, protected by `CRON_SECRET`) deletes personal content 90 days after delivery or cancellation.
