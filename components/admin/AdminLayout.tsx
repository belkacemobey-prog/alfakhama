'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Image,
  Settings,
  BarChart2,
  LogOut,
  Menu,
  Zap,
  ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AdminLanguageProvider, useAdminLanguage } from '@/components/admin/AdminLanguageProvider'
import AdminLanguageToggle from '@/components/admin/AdminLanguageToggle'

const NAV = [
  { href: '/admin', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', labelKey: 'nav.orders', icon: ShoppingBag },
  { href: '/admin/products', labelKey: 'nav.products', icon: Package },
  { href: '/admin/categories', labelKey: 'nav.categories', icon: Tag },
  { href: '/admin/banners', labelKey: 'nav.banners', icon: Image },
  { href: '/admin/analytics', labelKey: 'nav.analytics', icon: BarChart2 },
  { href: '/admin/settings', labelKey: 'nav.settings', icon: Settings },
]

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { locale, t } = useAdminLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success(t('layout.loggedOut'))
    router.push('/admin/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const Sidebar = () => (
    <div className={`flex flex-col h-full bg-secondary ${locale === 'ar' ? 'rtl' : 'ltr'}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">AL FAKHAMA</p>
            <p className="text-gray-400 text-xs">{t('layout.subtitle')}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive(href)
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {t(labelKey)}
            {isActive(href) && <ChevronRight className={`w-3.5 h-3.5 ms-auto ${locale === 'ar' ? 'rotate-180' : ''}`} />}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs text-gray-400 hover:bg-white/10 transition-colors"
        >
          {t('layout.footerStore')}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          {t('layout.logout')}
        </button>
      </div>
    </div>
  )

  const activeNav = NAV.find(n => isActive(n.href))
  const pageTitleKey = activeNav?.labelKey || 'nav.dashboard'

  return (
    <div className={`flex h-screen bg-gray-50 ${locale === 'ar' ? 'rtl' : 'ltr'}`} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <aside className="hidden lg:flex lg:flex-col w-60 flex-shrink-0">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: locale === 'ar' ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: locale === 'ar' ? 280 : -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`lg:hidden fixed top-0 bottom-0 w-64 z-50 ${locale === 'ar' ? 'right-0' : 'left-0'}`}
            >
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-secondary truncate">{t(pageTitleKey)}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <AdminLanguageToggle />
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary">A</span>
            </div>
          </div>
        </header>

        <main className="admin-shell flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  return (
    <AdminLanguageProvider>
      {isLogin ? (
        children
      ) : (
        <Shell>
          {children}
        </Shell>
      )}
    </AdminLanguageProvider>
  )
}
