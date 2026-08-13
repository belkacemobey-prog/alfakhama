'use client'



import { useRouter, useSearchParams } from 'next/navigation'

import { useEffect, useRef, useState } from 'react'

import { adminOrderStatusLabel } from '@/lib/admin-i18n'

import { useAdminLanguage } from '@/components/admin/AdminLanguageProvider'

import { ORDER_STATUSES } from '@/lib/utils'



export default function AdminOrdersFilters() {

  const router = useRouter()

  const sp = useSearchParams()

  const { locale, t } = useAdminLanguage()

  const [search, setSearch] = useState(() => sp.get('search') ?? '')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)



  useEffect(() => {

    setSearch(sp.get('search') ?? '')

  }, [sp])



  const pushQuery = (updates: Record<string, string | undefined>) => {

    const p = new URLSearchParams(sp.toString())

    for (const [key, val] of Object.entries(updates)) {

      if (val === undefined || val === '') p.delete(key)

      else p.set(key, val)

    }

    p.delete('page')

    const qs = p.toString()

    router.push(qs ? `/admin/orders?${qs}` : '/admin/orders')

  }



  const onSearchChange = (value: string) => {

    setSearch(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {

      pushQuery({ search: value.trim() || undefined })

    }, 500)

  }



  const status = sp.get('status') ?? ''



  return (

    <div className="card p-4 flex flex-wrap gap-3">

      <input

        type="text"

        placeholder={t('orders.filters.placeholder')}

        value={search}

        onChange={e => onSearchChange(e.target.value)}

        className="input-field flex-1 min-w-40 py-2 text-sm"

      />

      <select

        value={status}

        onChange={e => {

          pushQuery({ status: e.target.value || undefined })

        }}

        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white min-w-[11rem]"

      >

        <option value="">{t('orders.filters.anyStatus')}</option>

        {Object.entries(ORDER_STATUSES).map(([k]) => (

          <option key={k} value={k}>

            {adminOrderStatusLabel(locale, k)}

          </option>

        ))}

      </select>

    </div>

  )

}

