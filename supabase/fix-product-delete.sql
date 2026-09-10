-- Fix product delete blocked by order_items foreign key
-- Run once in Supabase SQL Editor.

-- 1) When a product is deleted, keep order lines but clear product_id
alter table order_items
  drop constraint if exists order_items_product_id_fkey;

alter table order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references products(id) on delete set null;

-- 2) Allow admins to unlink products from order lines (fallback)
drop policy if exists "Admins can update order_items" on order_items;
create policy "Admins can update order_items" on order_items
  for update using (
    exists (select 1 from admin_users where id = auth.uid())
  );

-- 3) Ensure admin delete policy exists on products
drop policy if exists "Admins can delete products" on products;
create policy "Admins can delete products" on products
  for delete using (
    exists (select 1 from admin_users where id = auth.uid())
  );
