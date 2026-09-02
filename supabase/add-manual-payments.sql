-- Adds manual/outstanding-payment tracking to an existing Niftit project.
-- Run once in the Supabase SQL editor.

alter table public.purchases
  add column if not exists total_amount numeric(10, 2),
  add column if not exists notes text;

-- backfill: every existing row was fully paid at purchase time
update public.purchases set total_amount = amount_paid where total_amount is null;

alter table public.purchases alter column total_amount set not null;
alter table public.purchases alter column amount_paid set default 0;

drop policy if exists "purchases: admin manages all rows" on public.purchases;
create policy "purchases: admin manages all rows"
  on public.purchases for all
  using (public.is_admin())
  with check (public.is_admin());
