'use client'

import { MessageCircle } from 'lucide-react'
import { DEFAULT_WHATSAPP, waMeUrl } from '@/lib/phone'

export default function WhatsAppButton({
  phone,
  storeName,
}: {
  phone?: string
  storeName?: string
}) {
  const name = storeName?.trim() || 'AL FAKHAMA STORE'
  const message = `Bonjour ${name} ! Je souhaite avoir des informations sur vos produits.`
  const href = waMeUrl(phone || DEFAULT_WHATSAPP, message)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg whatsapp-pulse hover:scale-110 transition-transform"
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white stroke-none" />
    </a>
  )
}
