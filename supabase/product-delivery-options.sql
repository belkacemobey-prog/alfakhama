-- Required for product update/create with delivery fee + options
-- Run in Supabase → SQL Editor → Run

alter table products
  add column if not exists delivery_fee decimal(10,2) default 7.000;

alter table products
  add column if not exists options jsonb default '[]'::jsonb;

alter table order_items
  add column if not exists selected_options jsonb default '{}'::jsonb;

-- Fix delete blocked by orders
alter table order_items
  drop constraint if exists order_items_product_id_fkey;

alter table order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references products(id) on delete set null;

drop policy if exists "Admins can update order_items" on order_items;
create policy "Admins can update order_items" on order_items
  for update using (
    exists (select 1 from admin_users where id = auth.uid())
  );
