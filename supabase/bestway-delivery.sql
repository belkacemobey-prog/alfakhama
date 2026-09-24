-- BestWay delivery + status "telecharge"
-- Run in Supabase SQL Editor

-- Allow new order status
alter table orders drop constraint if exists orders_status_check;
alter table orders
  add constraint orders_status_check
  check (status in (
    'pending',
    'confirmed',
    'telecharge',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ));

alter table orders add column if not exists delivery_carrier text;
alter table orders add column if not exists delivery_barcode text;
alter table orders add column if not exists delivery_pck_code text;

insert into settings (key, value, updated_at) values
  ('bestway_login', '', now()),
  ('bestway_password', '', now()),
  ('bestway_modalite', '2', now()),
  ('bestway_open_parcel', '0', now()),
  ('bestway_fragile', '0', now())
on conflict (key) do nothing;
