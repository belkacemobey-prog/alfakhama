import Image from 'next/image'
import Link from 'next/link'

type BrandLogoProps = {
  href?: string
  /** Compact for navbar / footer */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: { box: 'h-10 w-auto px-2 py-1', img: 'h-8 w-auto' },
  md: { box: 'h-14 w-auto px-3 py-1.5', img: 'h-11 w-auto' },
  lg: { box: 'h-28 sm:h-36 w-auto px-6 py-4', img: 'h-24 sm:h-32 w-auto' },
} as const

/**
 * Logo has a white background — always sit it on a white rounded surface
 * so it never floats on the dark page background.
 */
export default function BrandLogo({ href = '/', size = 'sm', className = '' }: BrandLogoProps) {
  const s = SIZES[size]
  const inner = (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-white shadow-sm ${s.box} ${className}`}
    >
      <Image
        src="/logo-alfakhama.png"
        alt="AL FAKHAMA STORE"
        width={size === 'lg' ? 280 : size === 'md' ? 160 : 120}
        height={size === 'lg' ? 160 : size === 'md' ? 90 : 64}
        className={`${s.img} object-contain`}
        priority={size === 'lg'}
      />
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex flex-shrink-0" aria-label="AL FAKHAMA STORE — Accueil">
        {inner}
      </Link>
    )
  }

  return inner
}
