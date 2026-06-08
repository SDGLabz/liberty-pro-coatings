-- Persisted cart per contractor (build-plan §8). Survives the checkout-wall →
-- approval gap and follows the user across devices. Anonymous carts live in
-- localStorage and merge into this row on sign-in. Applied via the Supabase
-- Management API on 2026-06-08.

create table if not exists public.carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.carts enable row level security;

drop policy if exists carts_select_own on public.carts;
create policy carts_select_own on public.carts
  for select using (auth.uid() = user_id);

drop policy if exists carts_insert_own on public.carts;
create policy carts_insert_own on public.carts
  for insert with check (auth.uid() = user_id);

drop policy if exists carts_update_own on public.carts;
create policy carts_update_own on public.carts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists carts_delete_own on public.carts;
create policy carts_delete_own on public.carts
  for delete using (auth.uid() = user_id);
