'use client'

import { Printer } from 'lucide-react'

export default function PrintButton({
  className = '',
  label = 'Imprimer',
}: {
  className?: string
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  )
}

