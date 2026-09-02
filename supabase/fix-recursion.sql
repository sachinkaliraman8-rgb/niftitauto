-- Fixes "infinite recursion detected in policy for relation profiles".
-- Run this once in the Supabase SQL editor (tables already exist, so
-- schema.sql doesn't need to be re-run).

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "profiles: admin reads all rows" on public.profiles;
create policy "profiles: admin reads all rows"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "plans: admin reads all plans" on public.plans;
create policy "plans: admin reads all plans"
  on public.plans for select
  using (public.is_admin());

drop policy if exists "plans: admin writes plans" on public.plans;
create policy "plans: admin writes plans"
  on public.plans for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "purchases: admin reads all rows" on public.purchases;
create policy "purchases: admin reads all rows"
  on public.purchases for select
  using (public.is_admin());
