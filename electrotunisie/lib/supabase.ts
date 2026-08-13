import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'

function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

function supabaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return isValidUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co'
}

function supabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
}

/** Browser Supabase client — always uses .env.local keys */
export function createClient(): SupabaseClient {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey())
}

export function configureSupabaseClient(_url: string, _anonKey: string) {
  // Kept for compatibility; auth always uses env vars above.
}

export const supabase = createClient()

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id'>
        Update: Partial<Omit<Category, 'id'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id'>
        Update: Partial<Omit<OrderItem, 'id'>>
      }
      banners: {
        Row: Banner
        Insert: Omit<Banner, 'id' | 'created_at'>
        Update: Partial<Omit<Banner, 'id'>>
      }
      governorates: {
        Row: Governorate
      }
      settings: {
        Row: Setting
        Insert: Setting
        Update: Partial<Setting>
      }
    }
  }
}

export interface Product {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  price: number
  original_price: number | null
  category: string
  brand: string | null
  stock: number
  images: string[]
  is_featured: boolean
  is_active: boolean
  rating: number
  reviews_count: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  name_ar: string | null
  slug: string
  icon: string | null
  image: string | null
  is_active: boolean
}

export interface Governorate {
  id: number
  name_fr: string
  name_ar: string
  code: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_phone2: string | null
  governorate_id: number | null
  governorate_name: string
  address: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total_amount: number
  delivery_fee: number
  payment_method: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_image: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  image: string | null
  link: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Setting {
  key: string
  value: string | null
  updated_at: string
}
