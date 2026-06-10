-- 0004_orders_status_guard.sql — protect order status from regressing.
-- Stripe does not guarantee webhook delivery order, and retries a failed
-- (500'd) event later. Without this, a stale/replayed 'processing' or
-- 'payment_failed' event for a PaymentIntent could overwrite a 'paid' order
-- and roll its status backward. This BEFORE UPDATE trigger makes 'paid' and
-- 'refunded' terminal: 'paid' may only advance to 'refunded', and 'refunded'
-- never changes. (Security review, 2026-06-10 — low-severity correctness fix.)
create or replace function public.guard_order_status() returns trigger as $$
begin
  if old.status = 'refunded' then
    new.status := 'refunded';
  elsif old.status = 'paid' and new.status not in ('paid','refunded') then
    new.status := 'paid';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_status_guard on public.orders;
create trigger orders_status_guard
  before update on public.orders
  for each row execute function public.guard_order_status();
