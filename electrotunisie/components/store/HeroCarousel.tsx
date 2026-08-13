'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Banner } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface HeroCarouselProps {
  banners: Banner[]
}

const DEFAULT_BANNERS = [
  {
    id: '1',
    title: 'Soldes d\'Été 2024',
    subtitle: 'Jusqu\'à -30% sur les climatiseurs',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1400&q=80',
    link: '/products?category=Climatiseurs',
    is_active: true,
    sort_order: 1,
    created_at: '',
  },
  {
    id: '2',
    title: 'Nouvelle Collection Samsung',
    subtitle: 'Les dernières innovations à prix compétitifs',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=1400&q=80',
    link: '/products?brand=Samsung',
    is_active: true,
    sort_order: 2,
    created_at: '',
  },
  {
    id: '3',
    title: 'Livraison Gratuite',
    subtitle: 'Pour toute commande supérieure à 500 DT',
    image: 'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=1400&q=80',
    link: '/products',
    is_active: true,
    sort_order: 3,
    created_at: '',
  },
]

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const data = banners.length > 0 ? banners : DEFAULT_BANNERS
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <div className="relative overflow-hidden rounded-none md:rounded-3xl shadow-xl">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {data.map((banner, idx) => (
            <div key={banner.id} className="embla__slide w-full flex-shrink-0 relative">
              <div className="relative h-[280px] sm:h-[400px] lg:h-[520px] w-full overflow-hidden">
                <img
                  src={banner.image || 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1400'}
                  alt={banner.title || ''}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    key={`${banner.id}-${idx}`}
                  >
                    {banner.title && (
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight max-w-xl">
                        {banner.title}
                      </h2>
                    )}
                    {banner.subtitle && (
                      <p className="text-gray-200 text-base sm:text-xl mb-6 max-w-md">{banner.subtitle}</p>
                    )}
                    {banner.link && (
                      <Link
                        href={banner.link}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-glow text-sm sm:text-base"
                      >
                        Acheter Maintenant →
                      </Link>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {data.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            className={`rounded-full transition-all ${
              idx === selectedIndex
                ? 'w-8 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
