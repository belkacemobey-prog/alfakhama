'use client'

import Link from 'next/link'
import { Phone, MapPin, Mail, ExternalLink } from 'lucide-react'
import { BRANDS, CATEGORIES } from '@/lib/utils'
import { categoryDisplayName } from '@/lib/store-i18n'
import { useStoreLanguage } from '@/components/store/StoreLanguageProvider'
import BrandLogo from '@/components/store/BrandLogo'

const FOOTER_SLUGS = [
  'refrigerateurs',
  'machines-laver',
  'climatiseurs',
  'televiseurs',
  'cuisinieres',
] as const

export default function Footer() {
  const { t, locale } = useStoreLanguage()

  const footerCategories = FOOTER_SLUGS.map(slug => CATEGORIES.find(c => c.slug === slug)).filter(
    Boolean
  ) as typeof CATEGORIES

  return (
    <footer className="bg-[#060C18] border-t border-[var(--border-card)] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <BrandLogo size="md" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">{t('footer.tagline')}</p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] rounded-lg flex items-center justify-center transition-colors text-sm font-bold text-[var(--text-secondary)]"
              >
                f
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] rounded-lg flex items-center justify-center transition-colors text-sm font-bold text-[var(--text-secondary)]"
              >
                ig
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--cyan)] hover:text-[var(--cyan)] rounded-lg flex items-center justify-center text-[var(--text-secondary)] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider">
              {t('footer.categories')}
            </h3>
            <ul className="space-y-2">
              {footerCategories.map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="text-[var(--text-secondary)] hover:text-[var(--cyan)] text-sm transition-colors"
                  >
                    {categoryDisplayName(cat, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider">
              {t('footer.info')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-[var(--text-secondary)] hover:text-[var(--cyan)] text-sm transition-colors"
                >
                  {t('footer.allProducts')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-[var(--text-secondary)] hover:text-[var(--cyan)] text-sm transition-colors"
                >
                  {t('footer.myCart')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--cyan)] text-sm transition-colors">
                  {t('footer.shippingPolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--cyan)] text-sm transition-colors">
                  {t('footer.returns')}
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--cyan)] text-sm transition-colors">
                  {t('footer.about')}
                </a>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-[var(--text-secondary)] hover:text-[var(--cyan)] text-sm transition-colors"
                >
                  {t('footer.adminLogin')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-wider">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                <Phone className="w-4 h-4 mt-0.5 text-[var(--cyan)] flex-shrink-0" />
                <span>+216 71 000 000</span>
              </li>
              <li className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                <MapPin className="w-4 h-4 mt-0.5 text-[var(--cyan)] flex-shrink-0" />
                <span>
                  {t('footer.address1')}
                  <br />
                  {t('footer.address2')}
                </span>
              </li>
              <li className="flex items-start gap-3 text-[var(--text-secondary)] text-sm">
                <Mail className="w-4 h-4 mt-0.5 text-[var(--cyan)] flex-shrink-0" />
                <span>contact@electrotunisie.tn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 mb-8 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--text-secondary)]">
          <span className="flex items-center gap-2 text-[var(--text-primary)]">
            <span className="text-lg">🚚</span>
            <strong>{t('footer.deliveryNationwide')}</strong>
          </span>
          <span className="text-[var(--border-card)]">|</span>
          <span className="flex items-center gap-2">
            <span className="text-lg">💵</span>
            {t('footer.cod')}
          </span>
          <span className="text-[var(--border-card)]">|</span>
          <span className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            {t('footer.secure')}
          </span>
          <span className="text-[var(--border-card)]">|</span>
          <span className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            {t('footer.warranty')}
          </span>
        </div>

        <div className="mb-8">
          <p className="text-center text-[var(--text-secondary)] text-xs mb-3 uppercase tracking-wider">
            {t('footer.brandsStrip')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 opacity-80">
            {BRANDS.map(b => (
              <span key={b} className="text-sm font-semibold text-[var(--text-secondary)]">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--border-card)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--text-secondary)]">
          <p>{t('footer.copyright')}</p>
          <p className="flex items-center gap-1 rtl:flex-row-reverse">{t('footer.madeIn')}</p>
        </div>
      </div>
    </footer>
  )
}
