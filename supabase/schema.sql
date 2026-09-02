-- Niftit — run this once in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

-- ═══════════ profiles ═══════════
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  tradingview_username text,
  is_admin boolean not null default false,
  disclaimer_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security-definer helper so admin-check policies don't recurse into
-- themselves (a policy on `profiles` that queries `profiles` directly
-- would re-trigger its own RLS check and error with "infinite recursion
-- detected in policy"). This function runs as its owner, which bypasses
-- RLS for the lookup inside it, breaking the loop.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "profiles: user reads own row"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: user updates own row"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles: admin reads all rows"
  on public.profiles for select
  using (public.is_admin());

-- auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════ plans ═══════════
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_inr numeric(10, 2) not null,
  billing_interval text not null check (billing_interval in ('monthly', 'yearly', 'custom')),
  duration_days integer not null,
  features text[] not null default '{}',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "plans: anyone reads active plans"
  on public.plans for select
  using (is_active = true);

create policy "plans: admin reads all plans"
  on public.plans for select
  using (public.is_admin());

create policy "plans: admin writes plans"
  on public.plans for all
  using (public.is_admin())
  with check (public.is_admin());

-- ═══════════ purchases ═══════════
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'cancelled')),
  total_amount numeric(10, 2) not null,
  amount_paid numeric(10, 2) not null default 0,
  payment_provider text not null default 'mock',
  payment_reference text,
  notes text,
  purchased_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "purchases: user reads own rows"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "purchases: user creates own pending row"
  on public.purchases for insert
  with check (auth.uid() = user_id and status = 'pending');

create policy "purchases: admin reads all rows"
  on public.purchases for select
  using (public.is_admin());

-- lets the admin panel create manual purchases (any user_id, status
-- 'active' immediately) and record payments against them, e.g. cash/UPI
-- collected outside the mock/real payment flow.
create policy "purchases: admin manages all rows"
  on public.purchases for all
  using (public.is_admin())
  with check (public.is_admin());

-- Note: the online checkout's pending -> active transition is done
-- server-side with the service-role key (see lib/purchases.ts activatePurchase),
-- not via a user-facing RLS update policy — the expiry date must be a
-- server decision. Manual/admin purchases go through the admin RLS policy
-- above instead.

-- seed a couple of starter plans (safe to edit/remove from the admin panel)
insert into public.plans (name, price_inr, billing_interval, duration_days, features, is_featured, sort_order)
values
  ('Monthly', 799, 'monthly', 30,
   array['Automatic support & resistance', 'Volume-confirmed breakout markers', 'Retest entry markers', 'Live day-bias panel', 'Chart alerts to your phone'],
   false, 1),
  ('Yearly', 6999, 'yearly', 365,
   array['Everything in Monthly', 'New features as they ship', 'Direct support over email', 'One invoice, nothing to track'],
   true, 2)
on conflict do nothing;

-- after your first sign-up, promote yourself to admin:
-- update public.profiles set is_admin = true where email = 'sachinkaliraman1@gmail.com';

-- ═══════════ signals ═══════════
create table if not exists public.signals (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  type text not null check (type in ('buy', 'sell')),
  price numeric(12, 2) not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.signals enable row level security;

-- mirrors is_admin(): security-definer so this can be used inside a
-- policy on `signals` without recursing (this one queries `purchases`,
-- a different table, but still needs to run with elevated privilege to
-- avoid being blocked by purchases' own RLS when evaluated as the caller).
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

create policy "signals: active subscribers read"
  on public.signals for select
  using (public.has_active_subscription());

create policy "signals: admin reads all"
  on public.signals for select
  using (public.is_admin());

-- Signals are inserted only by the TradingView webhook route using the
-- service-role key (see app/api/tradingview-webhook) — no insert policy
-- needed for regular users.
