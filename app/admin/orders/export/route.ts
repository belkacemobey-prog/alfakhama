import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { formatPrice, ORDER_STATUSES } from '@/lib/utils'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') || undefined
    const governorate = searchParams.get('governorate') || undefined
    const search = searchParams.get('search')?.trim() || undefined

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (governorate) query = query.eq('governorate_name', governorate)
    if (search) {
      query = query.or(
        `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`
      )
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const list = orders || []

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.text('ElectroTunisie - Liste des commandes', 14, 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    doc.text(
      `Export: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Tunis' })}  |  ${list.length} commande(s)`,
      14,
      20
    )
    doc.setTextColor(0, 0, 0)

    if (list.length === 0) {
      doc.setFontSize(11)
      doc.text('Aucune commande pour ces filtres.', 14, 35)
    } else {
      const body: string[][] = list.map((o: Record<string, unknown>) => {
        const st = o.status as keyof typeof ORDER_STATUSES
        return [
          String(o.order_number ?? ''),
          String(o.customer_name ?? ''),
          String(o.customer_phone ?? ''),
          String(o.governorate_name ?? ''),
          formatPrice(Number(o.total_amount)),
          ORDER_STATUSES[st]?.label ?? String(o.status ?? ''),
          new Date(String(o.created_at)).toLocaleDateString('fr-FR'),
        ]
      })

      autoTable(doc, {
        head: [['N commande', 'Client', 'Telephone', 'Gouvernorat', 'Montant (DT)', 'Statut', 'Date']],
        body,
        startY: 26,
        styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: {
          fillColor: [13, 22, 40],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 10, right: 10 },
        tableWidth: 'auto',
      })
    }

    const buf = doc.output('arraybuffer')
    const filename = `commandes-electrotunisie-${new Date().toISOString().slice(0, 10)}.pdf`

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erreur export PDF'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
