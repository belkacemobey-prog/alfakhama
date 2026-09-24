-- ============================================
-- ElectroTunisie — FULL Supabase bootstrap
-- Run once in: Supabase → SQL Editor → New query
-- Order: paste this entire file and Run.
-- ============================================

-- --------------------------------------------
-- 1) TABLES
-- --------------------------------------------

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  description text,
  description_ar text,
  price decimal(10,2) not null,
  original_price decimal(10,2),
  category text not null,
  brand text,
  stock integer default 0,
  images text[] default '{}',
  delivery_fee decimal(10,2) default 7.000,
  options jsonb default '[]'::jsonb,
  is_featured boolean default false,
  is_active boolean default true,
  rating decimal(2,1) default 0,
  reviews_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  slug text unique not null,
  icon text,
  image text,
  is_active boolean default true
);

create table if not exists governorates (
  id serial primary key,
  name_fr text not null,
  name_ar text not null,
  code text unique not null
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_phone2 text,
  governorate_id integer references governorates(id),
  governorate_name text not null,
  address text,
  notes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'telecharge', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) not null,
  delivery_fee decimal(10,2) default 7.000,
  payment_method text default 'cash_on_delivery',
  delivery_carrier text,
  delivery_barcode text,
  delivery_pck_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_image text,
  quantity integer not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  selected_options jsonb default '{}'::jsonb
);

create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  role text default 'admin',
  created_at timestamptz default now()
);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image text,
  link text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- --------------------------------------------
-- 2) SEED: governorates (24)
-- --------------------------------------------

insert into governorates (name_fr, name_ar, code) values
('Tunis', 'تونس', 'TN-11'),
('Ariana', 'أريانة', 'TN-12'),
('Ben Arous', 'بن عروس', 'TN-13'),
('Manouba', 'منوبة', 'TN-14'),
('Nabeul', 'نابل', 'TN-21'),
('Zaghouan', 'زغوان', 'TN-22'),
('Bizerte', 'بنزرت', 'TN-23'),
('Béja', 'باجة', 'TN-31'),
('Jendouba', 'جندوبة', 'TN-32'),
('Le Kef', 'الكاف', 'TN-33'),
('Siliana', 'سليانة', 'TN-34'),
('Sousse', 'سوسة', 'TN-41'),
('Monastir', 'المنستير', 'TN-42'),
('Mahdia', 'المهدية', 'TN-43'),
('Sfax', 'صفاقس', 'TN-51'),
('Kairouan', 'القيروان', 'TN-52'),
('Kasserine', 'القصرين', 'TN-53'),
('Sidi Bouzid', 'سيدي بوزيد', 'TN-54'),
('Gabès', 'قابس', 'TN-61'),
('Médenine', 'مدنين', 'TN-62'),
('Tataouine', 'تطاوين', 'TN-63'),
('Gafsa', 'قفصة', 'TN-71'),
('Tozeur', 'توزر', 'TN-72'),
('Kébili', 'قبلي', 'TN-73')
on conflict (code) do nothing;

-- --------------------------------------------
-- 3) SEED: settings (store + integrations)
-- --------------------------------------------

insert into settings (key, value, updated_at) values
('store_name', 'AL FAKHAMA STORE', now()),
('whatsapp_number', '+21698000000', now()),
('delivery_fee', '7.000', now()),
('free_delivery_threshold', '500', now()),
('store_phone', '+21671000000', now()),
('store_address', 'Tunis, Tunisie', now()),
('facebook_pixel_id', '', now()),
('meta_capi_access_token', '', now()),
('domain_verification_content', '', now()),
('supabase_url', '', now()),
('supabase_anon_key', '', now()),
('supabase_service_role_key', '', now())
on conflict (key) do nothing;

-- --------------------------------------------
-- 4) SEED: categories
-- --------------------------------------------

insert into categories (name, name_ar, slug, icon) values
('Réfrigérateurs', 'ثلاجات', 'refrigerateurs', '🌡️'),
('Machines à laver', 'غسالات', 'machines-laver', '🌀'),
('Climatiseurs', 'مكيفات', 'climatiseurs', '❄️'),
('Téléviseurs', 'تلفزيونات', 'televiseurs', '📺'),
('Cuisinières', 'طباخات', 'cuisinieres', '🔥'),
('Congélateurs', 'مجمدات', 'congelateurs', '🧊'),
('Lave-vaisselle', 'غسالات أطباق', 'lave-vaisselle', '🍽️'),
('Micro-ondes', 'ميكرويف', 'micro-ondes', '📡'),
('Aspirateurs', 'مكنسات كهربائية', 'aspirateurs', '🌪️'),
('Petit électro', 'أجهزة صغيرة', 'petit-electro', '⚡')
on conflict (slug) do nothing;

-- --------------------------------------------
-- 5) SEED: sample products (optional demo data)
-- --------------------------------------------

insert into products (name, name_ar, description, price, original_price, category, brand, stock, images, is_featured, rating, reviews_count) values
('Réfrigérateur Samsung 350L No Frost', 'ثلاجة سامسونج 350 لتر نو فروست', 'Réfrigérateur double porte avec technologie No Frost, classe énergétique A++', 1890.000, 2100.000, 'Réfrigérateurs', 'Samsung', 15, ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'], true, 4.5, 128),
('Réfrigérateur LG 400L Smart Inverter', 'ثلاجة LG 400 لتر سمارت إنفرتر', 'Grande capacité avec compresseur Inverter économique', 2350.000, null, 'Réfrigérateurs', 'LG', 8, ARRAY['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'], true, 4.7, 89),
('Réfrigérateur Beko 300L', 'ثلاجة بيكو 300 لتر', 'Réfrigérateur combiné économique et fiable', 1450.000, 1600.000, 'Réfrigérateurs', 'Beko', 20, ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'], false, 4.2, 67),
('Machine à laver Samsung 8kg Eco Bubble', 'غسالة سامسونج 8 كيلو إيكو بابل', 'Technologie Eco Bubble pour un lavage en profondeur même à basse température', 1490.000, 1700.000, 'Machines à laver', 'Samsung', 18, ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'], true, 4.6, 203),
('Machine à laver LG 9kg AI DD', 'غسالة LG 9 كيلو AI DD', 'Intelligence artificielle pour détecter le type de tissu et adapter le lavage', 1890.000, null, 'Machines à laver', 'LG', 10, ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'], true, 4.8, 156),
('Climatiseur Samsung 12000 BTU Inverter', 'مكيف سامسونج 12000 BTU إنفرتر', 'Climatiseur Inverter ultra-silencieux avec mode économie d''énergie', 1650.000, 1850.000, 'Climatiseurs', 'Samsung', 22, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], true, 4.7, 312),
('Climatiseur LG 18000 BTU Dual Inverter', 'مكيف LG 18000 BTU ديال إنفرتر', 'Puissant et économique, idéal pour grandes pièces', 2100.000, null, 'Climatiseurs', 'LG', 15, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], true, 4.9, 178),
('Téléviseur Samsung 55" 4K Smart TV', 'تلفزيون سامسونج 55 بوصة 4K سمارت', 'Smart TV 4K avec Tizen OS, HDR10+ et son Dolby Digital', 2450.000, 2800.000, 'Téléviseurs', 'Samsung', 20, ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'], true, 4.8, 445),
('Téléviseur LG 65" OLED 4K', 'تلفزيون LG 65 بوصة OLED 4K', 'La référence en qualité d''image, noirs parfaits et couleurs éclatantes', 5500.000, 6200.000, 'Téléviseurs', 'LG', 5, ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'], true, 4.9, 89),
('Cuisinière Brandt 5 Feux + Four', 'طباخة براندت 5 عيون + فرن', 'Cuisinière à gaz avec four électrique, grille inox et allumage automatique', 1250.000, 1400.000, 'Cuisinières', 'Brandt', 18, ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'], true, 4.6, 234);

-- --------------------------------------------
-- 6) SEED: banners
-- --------------------------------------------

insert into banners (title, subtitle, image, link, sort_order) values
('Soldes d''Été', 'Jusqu''à -30% sur les climatiseurs', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1400', '/products?category=Climatiseurs', 1),
('Nouvelle Collection Samsung', 'Les dernières innovations à prix compétitifs', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1400', '/products?brand=Samsung', 2),
('Livraison Gratuite', 'Pour toute commande supérieure à 500 DT', 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1400', '/products', 3);

-- --------------------------------------------
-- 7) ROW LEVEL SECURITY
-- --------------------------------------------

alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table banners enable row level security;
alter table settings enable row level security;
alter table governorates enable row level security;
-- admin_users stays WITHOUT RLS so auth.uid() admin checks work

-- Helper: drop if re-running
do $$ begin
  -- products
  drop policy if exists "Public can read active products" on products;
  drop policy if exists "Admins can read all products" on products;
  drop policy if exists "Admins can insert products" on products;
  drop policy if exists "Admins can update products" on products;
  drop policy if exists "Admins can delete products" on products;
  -- categories
  drop policy if exists "Public can read categories" on categories;
  drop policy if exists "Admins can insert categories" on categories;
  drop policy if exists "Admins can update categories" on categories;
  drop policy if exists "Admins can delete categories" on categories;
  -- banners
  drop policy if exists "Public can read active banners" on banners;
  drop policy if exists "Admins can read all banners" on banners;
  drop policy if exists "Admins can insert banners" on banners;
  drop policy if exists "Admins can update banners" on banners;
  drop policy if exists "Admins can delete banners" on banners;
  -- governorates
  drop policy if exists "Public can read governorates" on governorates;
  -- orders
  drop policy if exists "Public can insert orders" on orders;
  drop policy if exists "Public can read orders by id" on orders;
  drop policy if exists "Admins can update orders" on orders;
  drop policy if exists "Admins can delete orders" on orders;
  -- order_items
  drop policy if exists "Public can insert order_items" on order_items;
  drop policy if exists "Public can read order_items by order" on order_items;
  drop policy if exists "Admins can delete order_items" on order_items;
  drop policy if exists "Admins can update order_items" on order_items;
  -- settings
  drop policy if exists "Public can read settings" on settings;
  drop policy if exists "Public can read public settings" on settings;
  drop policy if exists "Admins can read all settings" on settings;
  drop policy if exists "Admins can insert settings" on settings;
  drop policy if exists "Admins can update settings" on settings;
end $$;

-- Public / storefront
create policy "Public can read active products" on products
  for select using (is_active = true);

create policy "Public can read categories" on categories
  for select using (true);

create policy "Public can read governorates" on governorates
  for select using (true);

create policy "Public can read active banners" on banners
  for select using (is_active = true);

create policy "Public can insert orders" on orders
  for insert with check (true);

create policy "Public can read orders by id" on orders
  for select using (true);

create policy "Public can insert order_items" on order_items
  for insert with check (true);

create policy "Public can read order_items by order" on order_items
  for select using (true);

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

-- Admins (must exist in admin_users)
create policy "Admins can read all products" on products
  for select using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can insert products" on products
  for insert with check (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can update products" on products
  for update using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can delete products" on products
  for delete using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can insert categories" on categories
  for insert with check (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can update categories" on categories
  for update using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can delete categories" on categories
  for delete using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can read all banners" on banners
  for select using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can insert banners" on banners
  for insert with check (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can update banners" on banners
  for update using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can delete banners" on banners
  for delete using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can update orders" on orders
  for update using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can delete orders" on orders
  for delete using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can delete order_items" on order_items
  for delete using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can update order_items" on order_items
  for update using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can read all settings" on settings
  for select using (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can insert settings" on settings
  for insert with check (exists (select 1 from admin_users where id = auth.uid()));

create policy "Admins can update settings" on settings
  for update using (exists (select 1 from admin_users where id = auth.uid()));

-- --------------------------------------------
-- 8) STORAGE — product images bucket
-- --------------------------------------------

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "products_public_read" on storage.objects;
create policy "products_public_read"
on storage.objects for select
to public
using (bucket_id = 'products');

drop policy if exists "products_authenticated_insert" on storage.objects;
create policy "products_authenticated_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'products');

drop policy if exists "products_authenticated_update" on storage.objects;
create policy "products_authenticated_update"
on storage.objects for update
to authenticated
using (bucket_id = 'products');

drop policy if exists "products_authenticated_delete" on storage.objects;
create policy "products_authenticated_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'products');
