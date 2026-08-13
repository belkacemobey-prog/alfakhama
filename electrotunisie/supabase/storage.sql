-- ElectroTunisie – Supabase Storage (product images from admin upload)
-- Run once in SQL Editor after your project exists.
--
-- 1. Creates public bucket `products` (customize id if NEXT_PUBLIC_SUPABASE_PRODUCTS_BUCKET differs)
-- 2. Enables read for visitors + INSERT/UPDATE/DELETE for authenticated users (admin JWT)

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policies on storage.objects
DROP POLICY IF EXISTS "products_public_read" ON storage.objects;
CREATE POLICY "products_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "products_authenticated_insert" ON storage.objects;
CREATE POLICY "products_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "products_authenticated_update" ON storage.objects;
CREATE POLICY "products_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "products_authenticated_delete" ON storage.objects;
CREATE POLICY "products_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
