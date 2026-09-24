import type { Product } from '@/lib/supabase'

export type StoreLocale = 'fr' | 'ar'

export const STORE_LOCALE_KEY = 'electrotunisie-locale'

/** UI copy for the public store (French / Tunisian Arabic). Keys are dotted paths. */
export const storeMessages: Record<StoreLocale, Record<string, string>> = {
  fr: {
    'lang.switchFr': 'Français',
    'lang.switchAr': 'العربية',

    'top.freeShippingBanner': '🚚 Livraison gratuite pour toute commande supérieure à 500 DT',
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    'nav.cat.fridge': 'Réfrigérateurs',
    'nav.cat.ac': 'Climatiseurs',
    'nav.cat.tv': 'TV',
    'nav.searchPlaceholder': 'Rechercher un produit...',
    'nav.admin': 'Log in',
    'nav.adminLogin': 'Log in',

    'footer.tagline':
      'AL FAKHAMA STORE — votre boutique premium en Tunisie. Qualité, élégance et service.',
    'footer.categories': 'Catégories',
    'footer.info': 'Informations',
    'footer.allProducts': 'Tous les produits',
    'footer.myCart': 'Mon panier',
    'footer.shippingPolicy': 'Politique de livraison',
    'footer.returns': 'Retours & Échanges',
    'footer.about': 'À propos',
    'footer.adminLogin': 'Log in',
    'footer.contact': 'Contact',
    'footer.address1': 'Tunis, Tunisie',
    'footer.address2': 'Livraison dans toute la Tunisie',
    'footer.deliveryNationwide': 'Livraison dans toute la Tunisie',
    'footer.cod': 'Paiement à la livraison',
    'footer.secure': 'Achat sécurisé',
    'footer.warranty': 'Garantie constructeur',
    'footer.brandsStrip': 'Nos marques',
    'footer.copyright': '© 2026 AL FAKHAMA STORE. Tous droits réservés.',
    'footer.madeIn': 'Fait avec ❤ en Tunisie 🇹🇳',

    'home.brand.eyebrow': 'Boutique premium',
    'home.brand.title': 'AL FAKHAMA STORE',
    'home.brand.sub':
      'Découvrez une sélection soignée d’électroménager et d’équipement de qualité. Luxe accessible, livraison partout en Tunisie.',
    'home.brand.cta': 'Découvrir la boutique',

    'home.trust.delivery.title': 'Livraison rapide',
    'home.trust.delivery.sub': 'Toute la Tunisie',
    'home.trust.warranty.title': 'Garantie officielle',
    'home.trust.warranty.sub': 'Tous nos produits',
    'home.trust.sav.title': 'SAV disponible',
    'home.trust.sav.sub': 'Lun–Sam 8h–18h',
    'home.trust.quality.title': 'Qualité certifiée',
    'home.trust.quality.sub': 'Grandes marques',

    'home.categories.title': 'Nos Catégories',
    'home.categories.seeAll': 'Voir tout',
    'home.featured.title': '🔥 Nos Meilleures Offres',
    'home.featured.sub': 'Les produits les plus populaires',
    'home.promo.label': 'Offre exclusive',
    'home.promo.title': 'Livraison Gratuite sur toute la Tunisie',
    'home.promo.desc': 'Pour toute commande supérieure à 500 DT. Commandez maintenant et recevez chez vous !',
    'home.promo.cta': "Profiter de l'offre →",
    'home.new.title': '✨ Nouveaux Arrivages',
    'home.new.sub': 'Les derniers produits ajoutés',
    'home.brands.title': 'Nos marques partenaires',
    'home.why.title': 'Pourquoi choisir AL FAKHAMA STORE ?',
    'home.why.auth.title': 'Produits Authentiques',
    'home.why.auth.desc':
      'Tous nos produits sont garantis authentiques et conformes aux standards internationaux.',
    'home.why.price.title': 'Meilleurs Prix',
    'home.why.price.desc':
      'Prix compétitifs sur toutes les marques. Nous nous alignons sur les meilleures offres du marché tunisien.',
    'home.why.ship.title': 'Livraison Partout',
    'home.why.ship.desc': 'Livraison disponible dans les 24 gouvernorats de la Tunisie en 24-72h.',

    'cart.title': 'Mon Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.emptyHint': 'Découvrez nos produits',
    'cart.ctaBrowse': 'Voir les produits',
    'cart.subtotal': 'Sous-total',
    'cart.shipping': 'Livraison',
    'cart.freeShippingHint': 'Plus que {{amount}} pour la livraison gratuite',
    'cart.total': 'Total',
    'cart.checkout': 'Passer la commande →',
    'cart.continue': 'Continuer les achats',
    'cart.gratis': 'Gratuit 🎉',

    'badge.new': 'NOUVEAU',
    'product.addToCart': 'Ajouter au panier',
    'product.addToCartAria': 'Ajouter au panier',
    'product.stockOut': 'Rupture de stock',
    'product.stockLimited': 'Stock limité ({{count}} restants)',
    'product.stockOk': 'En stock',
    'toast.added': 'ajouté au panier !',
    'toast.addedNamed': '{{name}} ajouté au panier !',
    'toast.addedTitle': 'Ajouté au panier !',
    'toast.addedDesc': '{{qty}}× {{name}}',

    'product.notFound': 'Produit introuvable',
    'product.backProducts': '← Retour aux produits',
    'product.reviewsCount': '({{count}} avis)',
    'product.saveAmount': 'Économisez {{amount}}',

    'breadcrumb.home': 'Accueil',
    'breadcrumb.products': 'Produits',
    'product.description': 'Description',
    'product.qty': 'Quantité :',
    'product.chooseOptions': 'Choisissez les options',
    'product.optionsRequired': 'Veuillez sélectionner toutes les options',
    'product.deliveryFee': 'Livraison : {{fee}}',
    'product.deliveryFree': 'Livraison gratuite',
    'product.selectOption': 'Choisir',
    'product.chooseOnPage': 'Choisir les options',
    'product.order': 'Commander',
    'product.express': 'Commande Express',
    'product.expressHint': 'Paiement à la livraison — commande en 1 minute',
    'product.expressAria': 'Commande express',
    'product.placeOrder': 'Commander maintenant',
    'product.city': 'Ville',
    'product.cityPh': 'Choisissez votre ville',
    'product.similar': 'Produits similaires',
    'trust.deliveryMini': 'Livraison rapide',
    'trust.warrantyMini': 'Garantie officielle',
    'trust.returnMini': 'Retour facile',

    'sort.newest': 'Plus récents',
    'sort.priceAsc': 'Prix croissant',
    'sort.priceDesc': 'Prix décroissant',
    'sort.rating': 'Mieux notés',

    'products.titleAll': 'Tous les produits',
    'products.foundCount': '{{count}} produits trouvés',
    'products.filters': 'Filtres',
    'products.categoriesLbl': 'Catégories',
    'products.brandsLbl': 'Marques',
    'products.allCats': 'Toutes',
    'products.allBrands': 'Toutes',
    'products.resultsFor': 'Résultats pour',
    'products.countLabel': 'produits',
    'products.none': 'Aucun produit trouvé',
    'products.noneHint': 'Essayez d’autres filtres ou termes de recherche',
    'products.prev': '← Préc.',
    'products.next': 'Suivant →',

    'gov.intro':
      'Sélectionnez parmi les {{n}} gouvernorats (faites défiler la liste sur mobile).',
    'gov.loading': 'Chargement des gouvernorats…',
    'gov.required': 'Veuillez sélectionner votre gouvernorat',

    'checkout.breadcrumbCart': 'Panier',
    'checkout.breadcrumbCheckout': 'Commander',
    'checkout.title': 'Finaliser la commande',
    'checkout.customerTitle': 'Informations client',
    'checkout.fullName': 'Nom complet',
    'checkout.phone': 'Téléphone',
    'checkout.phone2': 'Téléphone 2',
    'checkout.optional': '(optionnel)',
    'checkout.address': 'Adresse',
    'checkout.notes': 'Notes / Instructions de livraison',
    'checkout.govTitle': 'Gouvernorat de livraison',
    'checkout.govHint': 'Sélectionnez votre gouvernorat',
    'checkout.payTitle': 'Mode de paiement',
    'checkout.codTitle': 'Paiement à la livraison',
    'checkout.codDesc': 'Payez cash à la réception de votre commande',
    'checkout.summary': 'Récapitulatif',
    'checkout.totalTtc': 'Total TTC',
    'checkout.confirm': 'Confirmer la commande',
    'checkout.processing': 'Traitement...',
    'checkout.secureFooter': '🔒 Commande sécurisée — Paiement à la livraison',
    'checkout.emptyTitle': 'Votre panier est vide',
    'checkout.emptySub': 'Ajoutez des produits avant de passer commande',
    'checkout.discover': 'Découvrir nos produits',
    'checkout.err.name': 'Nom requis',
    'checkout.err.phone': 'Téléphone requis',
    'checkout.err.phoneFmt': 'Numéro invalide (8 chiffres)',
    'checkout.err.gov': 'Gouvernorat requis',
    'checkout.err.fix': 'Veuillez corriger les erreurs',
    'checkout.err.order': 'Erreur lors de la commande. Veuillez réessayer.',
    'checkout.err.govLoad': 'Impossible de charger les gouvernorats. Réessayez plus tard.',
    'checkout.placeholder.name': 'Mohamed Ben Ali',
    'checkout.placeholder.phone': '55 123 456',
    'checkout.placeholder.phone2': '98 765 432',
    'checkout.placeholder.address': 'Rue, quartier, ville...',
    'checkout.placeholder.notes': 'Instructions spéciales pour la livraison...',
  },

  ar: {
    'lang.switchFr': 'Français',
    'lang.switchAr': 'العربية',

    'top.freeShippingBanner': '🚚 توصيل مجاني للطلبيات التي تزيد عن 500 د.ت',
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.cat.fridge': 'ثلاجات',
    'nav.cat.ac': 'مكيفات',
    'nav.cat.tv': 'تلفاز',
    'nav.searchPlaceholder': 'ابحث عن منتج...',
    'nav.admin': 'تسجيل الدخول',
    'nav.adminLogin': 'تسجيل الدخول',

    'footer.tagline': 'AL FAKHAMA STORE — متجرك الفاخر في تونس. جودة، أناقة وخدمة.',
    'footer.categories': 'الفئات',
    'footer.info': 'معلومات',
    'footer.allProducts': 'جميع المنتجات',
    'footer.myCart': 'سلة التسوق',
    'footer.shippingPolicy': 'سياسة التوصيل',
    'footer.returns': 'الإرجاع والاستبدال',
    'footer.about': 'من نحن',
    'footer.adminLogin': 'تسجيل الدخول',
    'footer.contact': 'اتصل بنا',
    'footer.address1': 'تونس، تونس',
    'footer.address2': 'التوصيل لجميع أنحاء تونس',
    'footer.deliveryNationwide': 'توصيل لجميع أنحاء تونس',
    'footer.cod': 'الدفع عند الاستلام',
    'footer.secure': 'شراء آمن',
    'footer.warranty': 'ضمان المصنع',
    'footer.brandsStrip': 'علاماتنا',
    'footer.copyright': '© 2026 AL FAKHAMA STORE. كل الحقوق محفوظة.',
    'footer.madeIn': 'صُنع بـ ❤ في تونس 🇹🇳',

    'home.brand.eyebrow': 'متجر فاخر',
    'home.brand.title': 'AL FAKHAMA STORE',
    'home.brand.sub':
      'اكتشف مجموعة مختارة من الأجهزة والمعدات عالية الجودة. فخامة في المتناول، وتوصيل في كل تونس.',
    'home.brand.cta': 'اكتشف المتجر',

    'home.trust.delivery.title': 'توصيل سريع',
    'home.trust.delivery.sub': 'كل تونس',
    'home.trust.warranty.title': 'ضمان رسمي',
    'home.trust.warranty.sub': 'جميع منتجاتنا',
    'home.trust.sav.title': 'خدمة ما بعد البيع',
    'home.trust.sav.sub': 'الاثنين–السبت 8ص–6م',
    'home.trust.quality.title': 'جودة مضمونة',
    'home.trust.quality.sub': 'ماركات كبرى',

    'home.categories.title': 'فئاتنا',
    'home.categories.seeAll': 'عرض الكل',
    'home.featured.title': '🔥 أفضل العروض',
    'home.featured.sub': 'أكثر المنتجات طلبًا',
    'home.promo.label': 'عرض حصري',
    'home.promo.title': 'توصيل مجاني لجميع أنحاء تونس',
    'home.promo.desc': 'للطلبيات التي تزيد عن 500 د.ت. اطلب الآن واستلم في المنزل!',
    'home.promo.cta': 'استفد من العرض ←',
    'home.new.title': '✨ وصول حديث',
    'home.new.sub': 'آخر المنتجات المضافة',
    'home.brands.title': 'علاماتنا الشريكة',
    'home.why.title': 'لماذا AL FAKHAMA STORE؟',
    'home.why.auth.title': 'منتجات أصلية',
    'home.why.auth.desc':
      'جميع منتجاتنا مضمونة أصلية ومطابقة للمعايير الدولية.',
    'home.why.price.title': 'أفضل الأسعار',
    'home.why.price.desc':
      'أسعار تنافسية على جميع العلامات. نواكب أفضل العروض في السوق التونسي.',
    'home.why.ship.title': 'توصيل لكل المدن',
    'home.why.ship.desc':
      'التوصيل متاح في الولايات الأربعة والعشرين خلال 24–72 ساعة.',

    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلة التسوق فارغة',
    'cart.emptyHint': 'اكتشف منتجاتنا',
    'cart.ctaBrowse': 'عرض المنتجات',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.shipping': 'التوصيل',
    'cart.freeShippingHint': 'بقي {{amount}} للتوصيل المجاني',
    'cart.total': 'المجموع',
    'cart.checkout': 'إتمام الطلب ←',
    'cart.continue': 'متابعة التسوق',
    'cart.gratis': 'مجاني 🎉',

    'badge.new': 'جديد',
    'product.addToCart': 'أضف للسلة',
    'product.addToCartAria': 'أضف للسلة',
    'product.stockOut': 'نفذ المخزون',
    'product.stockLimited': 'مخزون محدود ({{count}} متبقي)',
    'product.stockOk': 'متوفر',
    'toast.added': 'أُضيف إلى السلة!',
    'toast.addedNamed': 'تمت إضافة {{name}} إلى السلة!',
    'toast.addedTitle': 'تمت الإضافة إلى السلة!',
    'toast.addedDesc': '{{qty}}× {{name}}',

    'product.notFound': 'المنتج غير موجود',
    'product.backProducts': '← العودة إلى المنتجات',
    'product.reviewsCount': '({{count}} مراجعة)',
    'product.saveAmount': 'وفّر {{amount}}',

    'breadcrumb.home': 'الرئيسية',
    'breadcrumb.products': 'المنتجات',
    'product.description': 'الوصف',
    'product.qty': 'الكمية:',
    'product.chooseOptions': 'اختر الخيارات',
    'product.optionsRequired': 'يرجى اختيار كل الخيارات',
    'product.deliveryFee': 'التوصيل: {{fee}}',
    'product.deliveryFree': 'توصيل مجاني',
    'product.selectOption': 'اختر',
    'product.chooseOnPage': 'اختيار الخيارات',
    'product.order': 'اطلب الآن',
    'product.express': 'طلب سريع',
    'product.expressHint': 'الدفع عند الاستلام — طلب في دقيقة',
    'product.expressAria': 'طلب سريع',
    'product.placeOrder': 'اطلب الآن',
    'product.city': 'المدينة',
    'product.cityPh': 'اختر مدينتك',
    'product.similar': 'منتجات مشابهة',
    'trust.deliveryMini': 'توصيل سريع',
    'trust.warrantyMini': 'ضمان رسمي',
    'trust.returnMini': 'إرجاع سهل',

    'sort.newest': 'الأحدث',
    'sort.priceAsc': 'السعر ↑',
    'sort.priceDesc': 'السعر ↓',
    'sort.rating': 'الأعلى تقييمًا',

    'products.titleAll': 'جميع المنتجات',
    'products.foundCount': '{{count}} منتج',

    // When a category slug is displayed as title it's still canonical FR name — parent passes title
    'products.filters': 'تصفية',
    'products.categoriesLbl': 'الفئات',
    'products.brandsLbl': 'العلامات',
    'products.allCats': 'الكل',
    'products.allBrands': 'الكل',
    'products.resultsFor': 'نتائج البحث عن',
    'products.countLabel': 'منتج',
    'products.none': 'لا توجد منتجات',
    'products.noneHint': 'جرّب فلاتر أو كلمات أخرى',
    'products.prev': '← السابق',
    'products.next': 'التالي →',

    'gov.intro': 'اختر من بين {{n}} ولاية (مرّر القائمة على الهاتف).',
    'gov.loading': 'جاري تحميل الولايات…',
    'gov.required': 'يرجى اختيار الولاية',

    'checkout.breadcrumbCart': 'السلة',
    'checkout.breadcrumbCheckout': 'إتمام الطلب',
    'checkout.title': 'إتمام الطلب',
    'checkout.customerTitle': 'معلومات الزبون',
    'checkout.fullName': 'الاسم الكامل',
    'checkout.phone': 'الهاتف',
    'checkout.phone2': 'هاتف 2',
    'checkout.optional': '(اختياري)',
    'checkout.address': 'العنوان',
    'checkout.notes': 'ملاحظات / تعليمات التوصيل',
    'checkout.govTitle': 'ولاية التوصيل',
    'checkout.govHint': 'اختر ولايتك',
    'checkout.payTitle': 'طريقة الدفع',
    'checkout.codTitle': 'الدفع عند الاستلام',
    'checkout.codDesc': 'ادفع نقدًا عند استلام طلبك',
    'checkout.summary': 'ملخص الطلب',
    'checkout.totalTtc': 'المجموع',
    'checkout.confirm': 'تأكيد الطلب',
    'checkout.processing': 'جاري المعالجة...',
    'checkout.secureFooter': '🔒 طلب آمن — الدفع عند الاستلام',
    'checkout.emptyTitle': 'سلة التسوق فارغة',
    'checkout.emptySub': 'أضف منتجات قبل إتمام الطلب',
    'checkout.discover': 'تصفح المنتجات',
    'checkout.err.name': 'الاسم مطلوب',
    'checkout.err.phone': 'الهاتف مطلوب',
    'checkout.err.phoneFmt': 'رقم غير صالح (8 أرقام)',
    'checkout.err.gov': 'الولاية مطلوبة',
    'checkout.err.fix': 'يرجى تصحيح الأخطاء',
    'checkout.err.order': 'حدث خطأ أثناء الطلب. حاول مرة أخرى.',
    'checkout.err.govLoad': 'تعذّر تحميل الولايات. أعد المحاولة لاحقًا.',
    'checkout.placeholder.name': 'محمد بن علي',
    'checkout.placeholder.phone': '55 123 456',
    'checkout.placeholder.phone2': '98 765 432',
    'checkout.placeholder.address': 'الشارع، الحي، المدينة...',
    'checkout.placeholder.notes': 'تعليمات خاصة للتوصيل...',
  },
}

export function translate(
  locale: StoreLocale,
  key: string,
  vars?: Record<string, string | number>
): string {
  let s =
    storeMessages[locale][key] ?? storeMessages.fr[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{{${k}}}`).join(String(v))
    }
  }
  return s
}

export function productDisplayName(product: Pick<Product, 'name' | 'name_ar'>, locale: StoreLocale): string {
  if (locale === 'ar' && product.name_ar?.trim()) return product.name_ar.trim()
  return product.name
}

export function productDisplayDescription(
  product: Pick<Product, 'description' | 'description_ar'>,
  locale: StoreLocale
): string | null {
  if (locale === 'ar' && product.description_ar?.trim()) return product.description_ar.trim()
  return product.description?.trim() || null
}

export function categoryDisplayName(cat: { name: string; name_ar?: string | null }, locale: StoreLocale): string {
  if (locale === 'ar' && cat.name_ar?.trim()) return cat.name_ar.trim()
  return cat.name
}

export function stockLabelForLocale(stock: number, locale: StoreLocale): { label: string; color: string } {
  if (stock === 0) {
    return {
      label: translate(locale, 'product.stockOut'),
      color: 'text-red-500',
    }
  }
  if (stock <= 5) {
    return {
      label: translate(locale, 'product.stockLimited', { count: stock }),
      color: 'text-orange-500',
    }
  }
  return {
    label: translate(locale, 'product.stockOk'),
    color: 'text-green-600',
  }
}
