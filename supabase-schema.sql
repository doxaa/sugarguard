-- ============================================================
-- SugarGuard — Supabase database schema
-- Run this ONCE in your Supabase project:
--   Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

create table if not exists public.subscriptions (
  email       text primary key,
  plan        text,                       -- 'monthly' | 'yearly'
  reference   text,                       -- last Paystack reference
  amount      integer,                    -- last amount in kobo
  status      text default 'active',      -- active | past_due | cancelled
  expires     timestamptz,                -- when premium ends
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Helpful index for status lookups
create index if not exists subscriptions_expires_idx on public.subscriptions (expires);

-- Row Level Security: lock the table so ONLY your server (service_role)
-- can read/write it. The service_role key bypasses RLS, the public anon
-- key cannot touch this table at all. This is what keeps subscriptions
-- impossible to fake from the browser.
alter table public.subscriptions enable row level security;

-- (No policies added on purpose: with RLS on and no policies, the public
--  anon key has zero access. Your Netlify Functions use the service_role
--  key, which bypasses RLS. This is the secure default.)
