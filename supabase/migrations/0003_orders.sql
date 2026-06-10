-- 0003_orders.sql — orders captured at Stripe checkout (Phase 4b).
-- Each row is one completed/processing order, keyed uniquely by its Stripe
-- PaymentIntent id so it can never be double-recorded. Contractors can read
-- only their own orders (RLS); every write goes through the service role.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_payment_intent_id text not null unique,
  status text not null default 'processing'
    check (status in ('processing','paid','failed','canceled','refunded')),
  payment_method text not null default 'card'
    check (payment_method in ('card','ach')),
  amount_total integer not null,            -- cents (order total actually charged)
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  currency text not null default 'usd',
  items jsonb not null default '[]'::jsonb, -- snapshot: [{sku,name,qty}]
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Contractors read their OWN orders; all writes go through the service role.
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

create index if not exists orders_user_id_idx on public.orders(user_id);
