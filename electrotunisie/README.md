# ElectroTunisie 🇹🇳⚡

Production-ready e-commerce platform for the Tunisian home appliances market.

**Stack:** Next.js 14 (App Router) · TypeScript · Supabase · Tailwind CSS · Framer Motion · Recharts · Zustand

---

## 🚀 Quick Start

### 1. Create a Supabase Project
Go to [supabase.com](https://supabase.com), create a new project, then run the migration:
```sql
-- Copy/paste the full contents of supabase/schema.sql into the SQL editor
```

### 2. Configure Environment Variables
Copy `.env.local` and fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Create Admin User
In Supabase Dashboard → Authentication → Users → Add User, create an admin user with email/password.

### 4. Run Development Server
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
electrotunisie/
├── app/
│   ├── (store)/          # Public store pages
│   │   ├── page.tsx      # Homepage
│   │   ├── products/     # Product listing + detail
│   │   ├── cart/
│   │   ├── checkout/     # Checkout with governorate carousel
│   │   └── order-confirmation/[id]/
│   ├── admin/            # Protected admin panel
│   │   ├── page.tsx      # Dashboard with KPIs + charts
│   │   ├── orders/       # Orders management
│   │   ├── products/     # Products CRUD
│   │   ├── categories/   # Categories CRUD
│   │   ├── banners/      # Hero banners CRUD
│   │   ├── analytics/    # Charts + reports
│   │   └── settings/     # Store configuration
│   └── api/              # REST API routes
├── components/
│   ├── store/            # Store UI components
│   └── admin/            # Admin UI components
├── lib/
│   ├── supabase.ts       # Browser Supabase client
│   ├── supabase-server.ts # Server Supabase client
│   ├── cart-store.ts     # Zustand cart state
│   └── utils.ts          # Helpers, constants
└── supabase/
    └── schema.sql        # Full DB schema + seed data
```

---

## ✨ Features

### Store
- 🛍️ Full product catalog with filtering by category, brand, search
- 🎠 Hero carousel from Supabase banners (admin-editable)
- 🛒 Persistent cart with Zustand + localStorage
- 🗺️ Governorate carousel — all 24 Tunisian governorates
- 💵 Cash on delivery — no login required to order
- 📦 Order tracking with visual status stepper
- 📱 Fully responsive (mobile-first)
- 🔍 Debounced search with live dropdown
- ⭐ Product ratings, stock indicators, discount badges
- 🖼️ Image zoom on product detail
- 💬 WhatsApp floating button with pre-filled message

### Admin Panel (`/admin`)
- 🔐 Supabase Auth (email/password)
- 📊 Dashboard with KPI cards + Recharts charts
- 📋 Orders list with filters, search, CSV export
- 📝 Order detail with status timeline + WhatsApp link
- 📦 Products CRUD with image URL management
- 🏷️ Categories CRUD
- 🖼️ Banners CRUD (hero carousel)
- 📈 Analytics with charts by day/week/governorate
- ⚙️ Store settings (name, phone, delivery fee, etc.)

---

## 🗄️ Database

All 24 Tunisian governorates pre-seeded. Sample data includes:
- 10 product categories with Arabic names
- 30+ products with realistic DT prices
- 3 hero banners
- 10 sample orders across different governorates

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#E63946` (Tunisian red) |
| Secondary | `#1D3557` (Deep navy) |
| Accent | `#F4A261` (Warm amber) |
| Success | `#2D6A4F` |

---

## 📝 Supabase Storage (for image uploads)

To enable image uploads in the admin, create a storage bucket called `products` in Supabase Dashboard → Storage, and add a public policy for uploads.

---

## 🔒 Row Level Security

- Public: read products, categories, banners, governorates, settings
- Public: insert orders + order_items (no auth required for customers)
- Admin: full access via service role key

---

Made with ❤️ for Tunisia 🇹🇳
