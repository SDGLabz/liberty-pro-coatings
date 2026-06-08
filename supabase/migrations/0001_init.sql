-- ============================================================
-- Liberty Pro Coatings — Phase 2 schema: contractor accounts + applications
-- Run in the Supabase dashboard: SQL Editor → New query → paste all → Run.
-- Safe to re-run (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- profiles: one row per auth user. profiles.status IS THE CHECKOUT GATE.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  company     text,
  phone       text,
  status      text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected')),
  role        text not null default 'contractor'
                check (role in ('contractor', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may read only their OWN profile (to see their approval status).
-- Admin reads/writes happen server-side with the service-role key (bypasses RLS).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using ((select auth.uid()) = id);

-- ------------------------------------------------------------
-- contractor_applications: business details for becoming an approved buyer.
-- Holds both public-survey leads (user_id null) and signed-in onboarding.
-- Inserts + admin review happen server-side (service-role key).
-- ------------------------------------------------------------
create table if not exists public.contractor_applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  intent           text,
  company          text not null,
  contact_name     text not null,
  email            text not null,
  phone            text,
  state            text,
  years_installing text,
  resale_cert      text,
  primary_systems  text,
  monthly_volume   text,
  notes            text,
  status           text not null default 'new'
                     check (status in ('new', 'reviewing', 'approved', 'rejected')),
  created_at       timestamptz not null default now()
);

alter table public.contractor_applications enable row level security;

-- A signed-in user may read applications linked to them. Everything else
-- (public leads, admin review) is server-side via the service-role key.
drop policy if exists "applications_select_own" on public.contractor_applications;
create policy "applications_select_own" on public.contractor_applications
  for select using ((select auth.uid()) = user_id);

create index if not exists contractor_applications_status_idx
  on public.contractor_applications (status, created_at desc);

-- ------------------------------------------------------------
-- Auto-create a profile whenever a new auth user signs up.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, company)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- Keep profiles.updated_at fresh on every update.
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ============================================================
-- AFTER you create your own account (next batch), make yourself the admin:
--   update public.profiles
--   set role = 'admin', status = 'approved'
--   where email = 'ianciamarra@gmail.com';
-- ============================================================
