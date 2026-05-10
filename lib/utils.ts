import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(price) + ' DT'
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-TN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateOrderNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 9000) + 1000
  return `ET-${date}-${random}`
}

export function getDiscountPercent(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export function getStockLabel(stock: number): { label: string; color: string } {
  if (stock === 0) return { label: 'Rupture de stock', color: 'text-red-500' }
  if (stock <= 5) return { label: `Stock limité (${stock} restants)`, color: 'text-orange-500' }
  return { label: 'En stock', color: 'text-green-600' }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const CATEGORIES = [
  { name: 'Réfrigérateurs', name_ar: 'ثلاجات', slug: 'refrigerateurs', icon: '🌡️' },
  { name: 'Machines à laver', name_ar: 'غسالات', slug: 'machines-laver', icon: '🌀' },
  { name: 'Climatiseurs', name_ar: 'مكيفات', slug: 'climatiseurs', icon: '❄️' },
  { name: 'Téléviseurs', name_ar: 'تلفزيونات', slug: 'televiseurs', icon: '📺' },
  { name: 'Cuisinières', name_ar: 'طباخات', slug: 'cuisinieres', icon: '🔥' },
  { name: 'Congélateurs', name_ar: 'مجمدات', slug: 'congelateurs', icon: '🧊' },
  { name: 'Lave-vaisselle', name_ar: 'غسالات أطباق', slug: 'lave-vaisselle', icon: '🍽️' },
  { name: 'Micro-ondes', name_ar: 'ميكرويف', slug: 'micro-ondes', icon: '📡' },
  { name: 'Aspirateurs', name_ar: 'مكنسات', slug: 'aspirateurs', icon: '🌪️' },
  { name: 'Petit électro', name_ar: 'أجهزة صغيرة', slug: 'petit-electro', icon: '⚡' },
]

export const BRANDS = ['Samsung', 'LG', 'Beko', 'Ariston', 'Brandt', 'Iris', 'Condor', 'Haier', 'Whirlpool', 'Bosch']

export const ORDER_STATUSES = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  processing: { label: 'En traitement', color: 'bg-purple-100 text-purple-800', icon: '⚙️' },
  shipped: { label: 'Expédié', color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
  delivered: { label: 'Livré', color: 'bg-green-100 text-green-800', icon: '✔️' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800', icon: '❌' },
} as const
