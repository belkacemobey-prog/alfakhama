'use client'

import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+21698000000'
  const message = encodeURIComponent('Bonjour AL FAKHAMA STORE ! Je souhaite avoir des informations sur vos produits.')

  return (
    <a
      href={`https://wa.me/${phone.replace('+', '')}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg whatsapp-pulse hover:scale-110 transition-transform"
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="w-7 h-7 fill-white stroke-none" />
    </a>
  )
}
