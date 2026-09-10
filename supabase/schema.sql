-- ============================================
-- ElectroTunisie Database Schema
-- ============================================

-- Products
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

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_ar text,
  slug text unique not null,
  icon text,
  image text,
  is_active boolean default true
);

-- Tunisian Governorates
create table if not exists governorates (
  id serial primary key,
  name_fr text not null,
  name_ar text not null,
  code text unique not null
);

-- Insert all 24 Tunisian governorates
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

-- Orders
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
  status text default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10,2) not null,
  delivery_fee decimal(10,2) default 7.000,
  payment_method text default 'cash_on_delivery',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items
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

-- Admin users
create table if not exists admin_users (
  id uuid primary key references auth.users(id),
  email text unique not null,
  name text,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Banners
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

-- Site settings
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

insert into settings values
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

-- ============================================
-- Row Level Security
-- ============================================

alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table banners enable row level security;
alter table settings enable row level security;
alter table governorates enable row level security;

-- Public / storefront
create policy "Public can read active products" on products for select using (is_active = true);
create policy "Public can read active banners" on banners for select using (is_active = true);
create policy "Public can read categories" on categories for select using (true);
create policy "Public can read governorates" on governorates for select using (true);
create policy "Public can insert orders" on orders for insert with check (true);
create policy "Public can insert order_items" on order_items for insert with check (true);
create policy "Public can read orders by id" on orders for select using (true);
create policy "Public can read order_items by order" on order_items for select using (true);
create policy "Public can read public settings" on settings for select using (
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

-- Admins (row must exist in admin_users)
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

create policy "Admins can read all settings" on settings for select using (
  exists (select 1 from admin_users where id = auth.uid())
);
create policy "Admins can insert settings" on settings for insert with check (
  exists (select 1 from admin_users where id = auth.uid())
);
create policy "Admins can update settings" on settings for update using (
  exists (select 1 from admin_users where id = auth.uid())
);

-- ============================================
-- Seed Data: Categories
-- ============================================

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

-- ============================================
-- Seed Data: Products (30+)
-- ============================================

insert into products (name, name_ar, description, price, original_price, category, brand, stock, images, is_featured, rating, reviews_count) values
-- Réfrigérateurs
('Réfrigérateur Samsung 350L No Frost', 'ثلاجة سامسونج 350 لتر نو فروست', 'Réfrigérateur double porte avec technologie No Frost, classe énergétique A++', 1890.000, 2100.000, 'Réfrigérateurs', 'Samsung', 15, ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'], true, 4.5, 128),
('Réfrigérateur LG 400L Smart Inverter', 'ثلاجة LG 400 لتر سمارت إنفرتر', 'Grande capacité avec compresseur Inverter économique', 2350.000, null, 'Réfrigérateurs', 'LG', 8, ARRAY['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'], true, 4.7, 89),
('Réfrigérateur Beko 300L', 'ثلاجة بيكو 300 لتر', 'Réfrigérateur combiné économique et fiable', 1450.000, 1600.000, 'Réfrigérateurs', 'Beko', 20, ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'], false, 4.2, 67),
('Réfrigérateur Condor 280L', 'ثلاجة كوندور 280 لتر', 'Réfrigérateur made in Algeria, excellent rapport qualité-prix', 1150.000, null, 'Réfrigérateurs', 'Condor', 25, ARRAY['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600'], false, 4.0, 45),
('Réfrigérateur Haier 320L', 'ثلاجة هاير 320 لتر', 'Design moderne avec distributeur d''eau intégré', 1750.000, 1950.000, 'Réfrigérateurs', 'Haier', 12, ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600'], false, 4.3, 52),

-- Machines à laver
('Machine à laver Samsung 8kg Eco Bubble', 'غسالة سامسونج 8 كيلو إيكو بابل', 'Technologie Eco Bubble pour un lavage en profondeur même à basse température', 1490.000, 1700.000, 'Machines à laver', 'Samsung', 18, ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'], true, 4.6, 203),
('Machine à laver LG 9kg AI DD', 'غسالة LG 9 كيلو AI DD', 'Intelligence artificielle pour détecter le type de tissu et adapter le lavage', 1890.000, null, 'Machines à laver', 'LG', 10, ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'], true, 4.8, 156),
('Machine à laver Beko 7kg', 'غسالة بيكو 7 كيلو', 'Machine à laver économique avec 15 programmes de lavage', 980.000, 1100.000, 'Machines à laver', 'Beko', 30, ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'], false, 4.1, 89),
('Machine à laver Iris 6kg', 'غسالة إيريس 6 كيلو', 'Marque tunisienne de qualité, parfaite pour usage quotidien', 750.000, null, 'Machines à laver', 'Iris', 35, ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600'], false, 3.9, 134),

-- Climatiseurs
('Climatiseur Samsung 12000 BTU Inverter', 'مكيف سامسونج 12000 BTU إنفرتر', 'Climatiseur Inverter ultra-silencieux avec mode économie d''énergie', 1650.000, 1850.000, 'Climatiseurs', 'Samsung', 22, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], true, 4.7, 312),
('Climatiseur LG 18000 BTU Dual Inverter', 'مكيف LG 18000 BTU ديال إنفرتر', 'Puissant et économique, idéal pour grandes pièces', 2100.000, null, 'Climatiseurs', 'LG', 15, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], true, 4.9, 178),
('Climatiseur Condor 9000 BTU', 'مكيف كوندور 9000 BTU', 'Climatiseur abordable pour petites chambres', 890.000, 980.000, 'Climatiseurs', 'Condor', 28, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], false, 4.0, 95),
('Climatiseur Haier 24000 BTU', 'مكيف هاير 24000 BTU', 'Haute puissance pour espaces commerciaux et grandes salles', 2800.000, 3100.000, 'Climatiseurs', 'Haier', 8, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], false, 4.5, 67),

-- Téléviseurs
('Téléviseur Samsung 55" 4K Smart TV', 'تلفزيون سامسونج 55 بوصة 4K سمارت', 'Smart TV 4K avec Tizen OS, HDR10+ et son Dolby Digital', 2450.000, 2800.000, 'Téléviseurs', 'Samsung', 20, ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'], true, 4.8, 445),
('Téléviseur LG 65" OLED 4K', 'تلفزيون LG 65 بوصة OLED 4K', 'La référence en qualité d''image, noirs parfaits et couleurs éclatantes', 5500.000, 6200.000, 'Téléviseurs', 'LG', 5, ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'], true, 4.9, 89),
('Téléviseur Hisense 50" 4K', 'تلفزيون هيسنس 50 بوصة 4K', 'Excellent rapport qualité-prix avec Android TV', 1350.000, 1500.000, 'Téléviseurs', 'Haier', 25, ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'], false, 4.3, 267),
('Téléviseur TCL 43" Full HD Smart', 'تلفزيون TCL 43 بوصة Full HD سمارت', 'Smart TV abordable avec Google TV intégré', 890.000, null, 'Téléviseurs', 'Condor', 40, ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600'], false, 4.1, 189),

-- Cuisinières
('Cuisinière Brandt 5 Feux + Four', 'طباخة براندت 5 عيون + فرن', 'Cuisinière à gaz avec four électrique, grille inox et allumage automatique', 1250.000, 1400.000, 'Cuisinières', 'Brandt', 18, ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'], true, 4.6, 234),
('Cuisinière Beko 4 Feux', 'طباخة بيكو 4 عيون', 'Cuisinière compacte idéale pour petits espaces', 750.000, 850.000, 'Cuisinières', 'Beko', 24, ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'], false, 4.2, 112),
('Cuisinière Iris 5 Feux Inox', 'طباخة إيريس 5 عيون إينوكس', 'Design élégant en inox, fabriquée en Tunisie', 980.000, null, 'Cuisinières', 'Iris', 20, ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'], false, 4.4, 178),

-- Congélateurs
('Congélateur Ariston 150L', 'مجمد أريستون 150 لتر', 'Congélateur coffre avec alarme de température', 780.000, 900.000, 'Congélateurs', 'Brandt', 15, ARRAY['https://images.unsplash.com/photo-1586816879360-004f4a799f24?w=600'], false, 4.3, 89),
('Congélateur Samsung 200L No Frost', 'مجمد سامسونج 200 لتر نو فروست', 'Congélateur armoire No Frost avec congélation rapide', 1200.000, 1350.000, 'Congélateurs', 'Samsung', 12, ARRAY['https://images.unsplash.com/photo-1586816879360-004f4a799f24?w=600'], false, 4.5, 67),

-- Micro-ondes
('Micro-ondes Samsung 28L Grill', 'ميكرويف سامسونج 28 لتر مع شواية', 'Micro-ondes avec fonction grill et chaleur tournante', 450.000, 520.000, 'Micro-ondes', 'Samsung', 30, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], false, 4.4, 145),
('Micro-ondes LG 23L', 'ميكرويف LG 23 لتر', 'Micro-ondes solo avec plateau tournant et 5 niveaux de puissance', 320.000, null, 'Micro-ondes', 'LG', 35, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600'], false, 4.2, 198),

-- Aspirateurs
('Aspirateur Dyson V11 Sans Fil', 'مكنسة دايسون V11 لاسلكية', 'Aspirateur balai puissant avec autonomie 60 minutes', 1890.000, 2100.000, 'Aspirateurs', 'Samsung', 8, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], true, 4.8, 234),
('Aspirateur Samsung 2400W', 'مكنسة سامسونج 2400 واط', 'Aspirateur filaire haute puissance avec filtre HEPA', 650.000, 750.000, 'Aspirateurs', 'Samsung', 20, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], false, 4.3, 156),

-- Petit électro
('Mixeur Blender Samsung Pro', 'بلندر سامسونج برو', 'Blender professionnel 1500W avec bol en verre', 280.000, 320.000, 'Petit électro', 'Samsung', 40, ARRAY['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600'], false, 4.1, 89),
('Machine à café Bosch Dolce Gusto', 'ماكينة قهوة بوش دولتشي غوستو', 'Machine à café à capsules avec mousse de lait automatique', 450.000, 520.000, 'Petit électro', 'Brandt', 25, ARRAY['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600'], false, 4.5, 312),
('Fer à repasser Philips 2400W', 'مكواة فيليبس 2400 واط', 'Fer à repasser vapeur avec semelle en inox anti-calcaire', 180.000, 210.000, 'Petit électro', 'Brandt', 50, ARRAY['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600'], false, 4.2, 245),
('Grille-pain Brandt 4 tranches', 'محمصة براندت 4 شرائح', 'Grille-pain large avec 6 niveaux de grillage et tiroir ramasse-miettes', 120.000, null, 'Petit électro', 'Brandt', 60, ARRAY['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600'], false, 4.0, 134),

-- Lave-vaisselle
('Lave-vaisselle Bosch 12 couverts', 'غسالة أطباق بوش 12 غطاء', 'Lave-vaisselle silencieux avec 6 programmes de lavage', 1650.000, 1850.000, 'Lave-vaisselle', 'Brandt', 10, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], false, 4.6, 78),
('Lave-vaisselle Beko 14 couverts', 'غسالة أطباق بيكو 14 غطاء', 'Grande capacité avec séchage par condensation', 1350.000, 1500.000, 'Lave-vaisselle', 'Beko', 15, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], true, 4.4, 56)
;

-- ============================================
-- Seed Data: Banners
-- ============================================

insert into banners (title, subtitle, image, link, sort_order) values
('Soldes d''Été 2024', 'Jusqu''à -30% sur les climatiseurs', 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1400', '/products?category=Climatiseurs', 1),
('Nouvelle Collection Samsung', 'Les dernières innovations à prix compétitifs', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1400', '/products?brand=Samsung', 2),
('Livraison Gratuite', 'Pour toute commande supérieure à 500 DT', 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1400', '/products', 3);

-- ============================================
-- Seed Data: Sample Orders
-- ============================================

insert into orders (order_number, customer_name, customer_phone, governorate_id, governorate_name, address, status, total_amount, delivery_fee) values
('ET-20240115-0001', 'Mohamed Ben Ali', '+21655123456', 1, 'Tunis', 'Rue de la Liberté, Bab Bhar', 'delivered', 1897.000, 7.000),
('ET-20240116-0002', 'Fatma Trabelsi', '+21698765432', 12, 'Sousse', 'Avenue Habib Bourguiba', 'shipped', 2357.000, 7.000),
('ET-20240117-0003', 'Ahmed Gharbi', '+21622334455', 15, 'Sfax', 'Rue Mongi Slim', 'processing', 1657.000, 7.000),
('ET-20240118-0004', 'Leila Mansouri', '+21650987654', 4, 'Manouba', 'Cité El Wafa', 'confirmed', 987.000, 7.000),
('ET-20240119-0005', 'Karim Bouzid', '+21699111222', 5, 'Nabeul', 'Route de Hammamet', 'pending', 2107.000, 0.000),
('ET-20240120-0006', 'Sonia Chaabane', '+21627889900', 11, 'Sousse', 'Centre Ville Sousse', 'pending', 1497.000, 7.000),
('ET-20240121-0007', 'Youssef Dridi', '+21695444333', 13, 'Monastir', 'Route de Skanes', 'cancelled', 457.000, 7.000),
('ET-20240122-0008', 'Ines Hamdi', '+21655222111', 2, 'Ariana', 'Cité Ennasr', 'delivered', 1897.000, 7.000),
('ET-20240123-0009', 'Omar Karoui', '+21698333444', 16, 'Kairouan', 'Avenue de la République', 'shipped', 2107.000, 0.000),
('ET-20240124-0010', 'Rim Belhadj', '+21622555666', 3, 'Ben Arous', 'Mégrine Coteau', 'processing', 1327.000, 7.000);
