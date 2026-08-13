-- Integration settings (Facebook Pixel, domain verification, Supabase config)
-- Run this in Supabase SQL Editor on an existing project.

insert into settings (key, value, updated_at) values
  ('facebook_pixel_id', '', now()),
  ('domain_verification_content', '', now()),
  ('supabase_url', '', now()),
  ('supabase_anon_key', '', now()),
  ('supabase_service_role_key', '', now())
on conflict (key) do nothing;

drop policy if exists "Public can read settings" on settings;

create policy "Public can read public settings" on settings
  for select using (
    key in (
      'store_name',
      'store_phone',
      'store_address',
      'whatsapp_number',
      'delivery_fee',
      'free_delivery_threshold',
      'facebook_pixel_id',
      'domain_verification_content',
      'supabase_url',
      'supabase_anon_key'
    )
  );

create policy "Admins can read all settings" on settings
  for select using (
    exists (select 1 from admin_users where id = auth.uid())
  );

create policy "Admins can insert settings" on settings
  for insert with check (
    exists (select 1 from admin_users where id = auth.uid())
  );

create policy "Admins can update settings" on settings
  for update using (
    exists (select 1 from admin_users where id = auth.uid())
  );
