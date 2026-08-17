-- 0005_orders_shipping.sql — record WHERE the order ships.
-- Until now an order captured what was bought and what was charged but never
-- a destination: checkout collected no address at all, so every Stripe
-- PaymentIntent carried `shipping: null` and fulfillment had to chase the
-- contractor for it by phone. The Address Element now writes the address onto
-- the PaymentIntent, and this column stores that snapshot alongside the order.
--
-- Additive and nullable on purpose: the orders already in the table predate
-- address collection and must keep loading. Shape mirrors Stripe's shipping
-- object so it can be stored verbatim without a lossy translation:
--   {"name":"...","phone":"...","address":{"line1":"...","line2":null,
--    "city":"...","state":"..","postal_code":".....","country":"US"}}
alter table public.orders
  add column if not exists shipping jsonb;

comment on column public.orders.shipping is
  'Snapshot of the Stripe PaymentIntent shipping object (name, phone, address). Null for orders placed before address collection existed.';
