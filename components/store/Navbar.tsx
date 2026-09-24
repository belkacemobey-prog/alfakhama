'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ShoppingCart, Search, Menu, X, Phone, LogIn } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { supabase, Product } from '@/lib/supabase'
import { CATEGORIES, formatPrice } from '@/lib/utils'
import { productDisplayName } from '@/lib/store-i18n'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import LanguageToggle from '@/components/store/LanguageToggle'
import BrandLogo from '@/components/store/BrandLogo'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPhoneDisplay, telHref } from '@/lib/phone'

function isNavLinkActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string
): boolean {
  if (href === '/') return pathname === '/'
  const q = href.indexOf('?')
  const path = q === -1 ? href : href.slice(0, q)
  const qs = q === -1 ? '' : href.slice(q + 1)
  if (pathname !== path) return false
  if (!qs) {
    if (path === '/products') {
      return (
        !searchParams.get('category') &&
        !searchParams.get('brand') &&
        !searchParams.get('search') &&
        !searchParams.get('featured')
      )
    }
    return true
  }
  const expected = new URLSearchParams(qs)
  let match = true
  expected.forEach((value, key) => {
    if (searchParams.get(key) !== value) match = false
  })
  return match
}

export default function Navbar({ storePhone }: { storePhone?: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale, t } = useStoreLanguage()
  const { itemCount, openCart } = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const phoneLabel = formatPhoneDisplay(storePhone)
  const phoneLink = telHref(storePhone)

  const navLinks = useMemo(() => {
    const catHref = (nameFr: string) =>
      `/products?category=${encodeURIComponent(CATEGORIES.find(c => c.name === nameFr)!.name)}`
    return [
      { href: '/', label: t('nav.home') },
      { href: '/products', label: t('nav.products') },
      {
        href: catHref('Réfrigérateurs'),
        label: t('nav.cat.fridge'),
      },
      {
        href: catHref('Climatiseurs'),
        label: t('nav.cat.ac'),
      },
      {
        href: catHref('Téléviseurs'),
        label: t('nav.cat.tv'),
      },
    ]
  }, [t])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        const { data } = await supabase
          .from('products')
          .select('id, name, name_ar, price, images, category')
          .or(`name.ilike.%${searchQuery}%,name_ar.ilike.%${searchQuery}%`)
          .eq('is_active', true)
          .limit(5)
        setSearchResults((data as Product[]) || [])
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchQuery('')
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setSearchResults([])
      setShowSearch(false)
    }
  }

  const navLinkClass = (href: string) => {
    const active = isNavLinkActive(pathname, searchParams, href)
    return [
      'text-sm font-medium transition-colors',
      active ? 'text-[var(--text-cyan)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    ].join(' ')
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-nav)] border-b border-[#0D1628]">
      <div className="bg-[var(--bg-nav)] text-[var(--text-secondary)] text-xs py-1.5 px-4 sm:px-10 text-center border-b border-[#0D1628]">
        <span>{t('top.freeShippingBanner')}</span>
        <span className="mx-4 hidden sm:inline opacity-50">|</span>
        <span className="hidden sm:inline">
          <Phone className="inline w-3 h-3 mr-1 text-[var(--cyan)]" />
          <a href={phoneLink} className="hover:text-[var(--cyan)] transition-colors">
            {phoneLabel}
          </a>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-10">
        <div className="flex items-center justify-between h-16">
          <BrandLogo size="sm" className="!h-9 sm:!h-10 !px-1.5 sm:!px-2" />

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div ref={searchRef} className="hidden md:flex relative w-64 lg:w-80">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('nav.searchPlaceholder')}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full py-2 text-sm rounded-[10px] border bg-[var(--bg-input)] border-[var(--border-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                />
                <Search
                  className={`absolute top-2.5 w-4 h-4 text-[var(--text-secondary)] ${locale === 'ar' ? 'right-3' : 'left-3'}`}
                />
              </div>
            </form>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] rounded-[10px] shadow-card-hover border border-[var(--border-card)] overflow-hidden z-50"
                >
                  {searchResults.map(product => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                    >
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={productDisplayName(product as Product, locale)}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-[#060C18]"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {productDisplayName(product as Product, locale)}
                        </p>
                        <p className="text-xs font-semibold text-[var(--cyan)]">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex shrink-0">
              <LanguageToggle />
            </div>
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] border border-[var(--border-card)] rounded-[10px] hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors"
              title={t('nav.adminLogin')}
            >
              <LogIn className="w-3.5 h-3.5" />
              {t('nav.admin')}
            </Link>

            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 rounded-[10px] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
              aria-expanded={showSearch}
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={openCart}
              className="relative p-2 rounded-[10px] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-[var(--cyan)] text-[var(--text-on-badge)] text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </motion.span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-[10px] text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-3 md:hidden"
            >
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('nav.searchPlaceholder')}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={`w-full py-2.5 text-sm rounded-[10px] border bg-[var(--bg-input)] border-[var(--border-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--cyan)] focus:ring-1 focus:ring-[var(--cyan)] ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    autoFocus
                  />
                  <Search className={`absolute top-3 w-4 h-4 text-[var(--text-secondary)] ${locale === 'ar' ? 'right-3' : 'left-3'}`} />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-[#0D1628] bg-[var(--bg-nav)] overflow-hidden"
          >
            <nav className="px-4 py-4 flex flex-col gap-2">
              <div className="flex justify-center pb-2 border-b border-[#0D1628] sm:hidden">
                <LanguageToggle />
              </div>
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3 text-sm font-medium rounded-[10px] transition-colors ${
                    isNavLinkActive(pathname, searchParams, link.href)
                      ? 'text-[var(--text-cyan)] bg-[var(--bg-card)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin/login"
                className="mt-2 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-[var(--cyan)] text-[var(--text-on-badge)] rounded-[10px] hover:bg-[#b8963f] sm:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                {t('nav.adminLogin')}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
