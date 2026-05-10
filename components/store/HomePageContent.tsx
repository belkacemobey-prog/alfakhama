'use client'

import HeroCarousel from '@/components/store/HeroCarousel'
import ProductCard from '@/components/store/ProductCard'
import Link from 'next/link'
import { ArrowRight, Truck, ShieldCheck, Phone, Award } from 'lucide-react'
import { BRANDS, CATEGORIES } from '@/lib/utils'
import { categoryDisplayName } from '@/lib/store-i18n'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import type { Banner, Product } from '@/lib/supabase'

type Props = {
  banners: Banner[]
  featured: Product[]
  newArrivals: Product[]
}

export default function HomePageContent({ banners, featured, newArrivals }: Props) {
  const { t, locale } = useStoreLanguage()

  const trust = [
    { icon: Truck, titleKey: 'home.trust.delivery.title', subKey: 'home.trust.delivery.sub' },
    { icon: ShieldCheck, titleKey: 'home.trust.warranty.title', subKey: 'home.trust.warranty.sub' },
    { icon: Phone, titleKey: 'home.trust.sav.title', subKey: 'home.trust.sav.sub' },
    { icon: Award, titleKey: 'home.trust.quality.title', subKey: 'home.trust.quality.sub' },
  ] as const

  const why = [
    { icon: '🏆', titleKey: 'home.why.auth.title', descKey: 'home.why.auth.desc' },
    { icon: '💰', titleKey: 'home.why.price.title', descKey: 'home.why.price.desc' },
    { icon: '🚚', titleKey: 'home.why.ship.title', descKey: 'home.why.ship.desc' },
  ] as const

  return (
    <div className="min-h-screen">
      <section className="hero-preserve-legacy-cta max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        <HeroCarousel banners={banners as any} />
      </section>

      <section className="animate-fade-up bg-[#0D1628] border-y border-[var(--border-card)] py-4 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trust.map(({ icon: Icon, titleKey, subKey }) => (
              <div key={titleKey} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 shrink-0 rounded-[10px] bg-[#0A1220] border border-[#1A2840] flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px] text-[var(--cyan)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">{t(titleKey)}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{t(subKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-fade-up-delay-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">{t('home.categories.title')}</h2>
          <Link href="/products" className="link-all">
            {t('home.categories.seeAll')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2 py-3.5 px-2.5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl text-center transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] hover:border-[var(--cyan)] hover:bg-[#111E35]"
            >
              <span className="text-[22px] text-[var(--cyan)]">{cat.icon}</span>
              <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                {categoryDisplayName(cat, locale)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="animate-fade-up-delay-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">{t('home.featured.title')}</h2>
              <p className="section-subtitle">{t('home.featured.sub')}</p>
            </div>
            <Link href="/products?featured=true" className="link-all">
              {t('home.categories.seeAll')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 animate-fade-up">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-card)] bg-[#0D1628] p-8 md:p-12">
          <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--cyan)]/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-[var(--cyan)]/10 rounded-full translate-y-1/2" />
          <div className="relative z-10 max-w-lg">
            <p className="text-[var(--cyan)] font-semibold mb-2 text-sm uppercase tracking-wider">{t('home.promo.label')}</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-3">{t('home.promo.title')}</h3>
            <p className="text-[var(--text-secondary)] mb-6">{t('home.promo.desc')}</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[var(--cyan)] hover:bg-[#00A8B0] text-[var(--text-on-badge)] font-bold px-6 py-3 rounded-xl transition-all hover:shadow-glow"
            >
              {t('home.promo.cta')}
            </Link>
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">{t('home.new.title')}</h2>
              <p className="section-subtitle">{t('home.new.sub')}</p>
            </div>
            <Link href="/products" className="link-all">
              {t('home.categories.seeAll')} <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-[#0D1628] border-y border-[var(--border-card)] py-10 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[var(--text-secondary)] text-sm uppercase tracking-wider mb-6">
            {t('home.brands.title')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {BRANDS.map(brand => (
              <Link
                key={brand}
                href={`/products?brand=${brand}`}
                className="text-lg font-bold text-[var(--border-card)] hover:text-[var(--cyan)] transition-colors"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="section-title text-center mb-10">{t('home.why.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {why.map(item => (
            <div key={item.titleKey} className="card p-6 text-center border border-[var(--border-card)]">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-[var(--text-primary)] text-lg mb-2">{t(item.titleKey)}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{t(item.descKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
