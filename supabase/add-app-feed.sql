-- Adds the disclaimer gate + signal feed (app) to an existing Niftit project.
-- Run once in the Supabase SQL editor.

alter table public.profiles add column if not exists disclaimer_accepted_at timestamptz;

create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  type text not null check (type in ('buy', 'sell')),
  price numeric(12, 2) not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.signals enable row level security;

create or replace function public.has_active_subscription()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.purchases
    where user_id = auth.uid()
      and status = 'active'
      and expires_at > now()
  );
$$;

drop policy if exists "signals: active subscribers read" on public.signals;
create policy "signals: active subscribers read"
  on public.signals for select
  using (public.has_active_subscription());

drop policy if exists "signals: admin reads all" on public.signals;
create policy "signals: admin reads all"
  on public.signals for select
  using (public.is_admin());
