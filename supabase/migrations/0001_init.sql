-- Toast & Tribute — initial schema.
--
-- Security model: Row Level Security is ENABLED on every table and there are
-- NO policies for the anon or authenticated roles, and their table privileges
-- are revoked. The browser can therefore never read or write these tables.
-- All access goes through the Next.js server using the service-role key,
-- after the server has validated input and (for admin routes) checked the
-- admin role + MFA.

create extension if not exists pgcrypto;

-- ─── Types ──────────────────────────────────────────────────────────────────
create type order_status as enum (
  'paid', 'questionnaire_received', 'call_booked', 'drafting',
  'draft_sent', 'revising', 'delivered', 'cancelled'
);
create type token_purpose as enum ('questionnaire', 'draft', 'final', 'deletion');

-- ─── Admins ─────────────────────────────────────────────────────────────────
-- Only users listed here can use /admin (MFA is also required).
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ─── Orders (kept for records; personal content lives in other tables) ─────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stripe_session_id text not null unique,
  stripe_payment_intent text,
  customer_email text not null,
  customer_name text,
  service text not null check (service in ('wedding', 'eulogy', 'obituary', 'other')),
  add_ons text[] not null default '{}',
  rush boolean not null default false,
  amount_total integer not null check (amount_total >= 0),
  currency text not null default 'usd',
  status order_status not null default 'paid',
  due_at timestamptz,
  questionnaire_submitted_at timestamptz,
  revisions_allowed integer not null default 1,
  revisions_used integer not null default 0,
  delivered_at timestamptz,
  closed_at timestamptz,
  content_purged_at timestamptz
);
create index orders_status_idx on public.orders (status);
create index orders_due_idx on public.orders (due_at);
create index orders_purge_idx on public.orders (coalesce(delivered_at, closed_at)) where content_purged_at is null;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ─── Personal content (auto-deleted 90 days after delivery) ────────────────
create table public.questionnaire_responses (
  order_id uuid primary key references public.orders (id) on delete cascade,
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);

create table public.order_notes (
  order_id uuid primary key references public.orders (id) on delete cascade,
  notes text not null default '',
  updated_at timestamptz not null default now()
);

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  version integer not null,
  body text not null,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (order_id, version)
);

create table public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  draft_id uuid references public.drafts (id) on delete set null,
  feedback text not null,
  created_at timestamptz not null default now()
);

-- ─── Secret link tokens (only SHA-256 hashes are stored) ───────────────────
create table public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  deletion_request_id uuid,
  purpose token_purpose not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index access_tokens_order_idx on public.access_tokens (order_id);

-- ─── Data deletion requests ─────────────────────────────────────────────────
create table public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  details text,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  completed_at timestamptz
);
alter table public.access_tokens
  add constraint access_tokens_deletion_fk foreign key (deletion_request_id)
  references public.deletion_requests (id) on delete cascade;

-- ─── Stripe webhook idempotency ─────────────────────────────────────────────
create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- ─── Lock everything down ───────────────────────────────────────────────────
alter table public.admins enable row level security;
alter table public.orders enable row level security;
alter table public.questionnaire_responses enable row level security;
alter table public.order_notes enable row level security;
alter table public.drafts enable row level security;
alter table public.revision_requests enable row level security;
alter table public.access_tokens enable row level security;
alter table public.deletion_requests enable row level security;
alter table public.stripe_events enable row level security;

-- No policies are created for anon/authenticated on purpose. Also revoke grants
-- so even a future accidental policy doesn't open a table.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- ─── Atomic helpers (called by the server with the service role) ───────────

-- Consume a single-use token: returns the row only if it was valid and unused.
create or replace function public.consume_token(p_hash text, p_purpose token_purpose)
returns public.access_tokens
language plpgsql security invoker set search_path = '' as $$
declare
  t public.access_tokens;
begin
  update public.access_tokens
     set used_at = now()
   where token_hash = p_hash
     and purpose = p_purpose
     and used_at is null
     and expires_at > now()
  returning * into t;
  return t;
end $$;

-- Retention: delete personal content 90 days after delivery/closure.
-- Keeps order id, service, amount, date and email for tax/refund records.
create or replace function public.purge_expired_content(p_days integer default 90)
returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  purged integer;
begin
  with doomed as (
    select id from public.orders
     where content_purged_at is null
       and coalesce(delivered_at, closed_at) is not null
       and coalesce(delivered_at, closed_at) < now() - make_interval(days => p_days)
  ),
  q as (delete from public.questionnaire_responses where order_id in (select id from doomed)),
  n as (delete from public.order_notes where order_id in (select id from doomed)),
  r as (delete from public.revision_requests where order_id in (select id from doomed)),
  d as (delete from public.drafts where order_id in (select id from doomed)),
  t as (delete from public.access_tokens where order_id in (select id from doomed)),
  u as (
    update public.orders
       set content_purged_at = now(), customer_name = null
     where id in (select id from doomed)
    returning 1
  )
  select count(*) into purged from u;

  -- Housekeeping for rows with no long-term purpose.
  delete from public.access_tokens where expires_at < now() - interval '30 days';
  delete from public.deletion_requests
   where created_at < now() - make_interval(days => p_days)
     and (completed_at is not null or verified_at is null);
  delete from public.stripe_events where received_at < now() - interval '30 days';

  return purged;
end $$;

revoke all on function public.consume_token(text, token_purpose) from public, anon, authenticated;
revoke all on function public.purge_expired_content(integer) from public, anon, authenticated;
grant execute on function public.consume_token(text, token_purpose) to service_role;
grant execute on function public.purge_expired_content(integer) to service_role;

-- Record a customer's edit request, enforcing the revision allowance atomically.
-- Returns false if the order isn't awaiting feedback or has no rounds left.
create or replace function public.request_revision(p_order_id uuid, p_draft_id uuid, p_feedback text)
returns boolean
language plpgsql security invoker set search_path = '' as $$
declare
  ok boolean;
begin
  update public.orders
     set revisions_used = revisions_used + 1, status = 'revising'
   where id = p_order_id
     and status = 'draft_sent'
     and revisions_used < revisions_allowed
  returning true into ok;

  if ok is null then
    return false;
  end if;

  insert into public.revision_requests (order_id, draft_id, feedback)
  values (p_order_id, p_draft_id, p_feedback);
  return true;
end $$;

revoke all on function public.request_revision(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.request_revision(uuid, uuid, text) to service_role;
